import * as path from 'node:path';
import * as url from 'node:url';

import { test, expect } from '@playwright/test';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Workflow 5. https://www.washingtonpost.com/climate-environment/interactive/2024/bird-population-decline-united-states-maps/
 *
 * This workflow reproduces the central map published in "Bird populations are
 * declining. Some are in your neighborhood." by Harry Stevens at The Washington
 * Post. The map comprises two GeoJSON layers:
 *
 * - The geographic range of the American Crow.
 * - The breeding season population trends for the American Crow in the conti-
 * nental United States from 2012-2022.
 */
test('workflow-5', async ({ page }) => {
  // Identify the playwright test for application code.
  await page.addInitScript(() => {
    (
      window as unknown as Window & { playwrightWorkflowId: string }
    ).playwrightWorkflowId = 'workflow-5';
  });

  // Mark workflow tests as slow.
  test.slow();

  // Navigate to cartokit, running on a local development server.
  await page.goto('/');
  console.log(process.env);

  if (process.env.GITHUB_ENV === 'Preview') {
    // In Preview Vercel environments, ensure <vercel-live-feedback> does not
    // intercept pointer events.
    await page.locator('vercel-live-feedback').waitFor({ state: 'attached' });
    await page.locator('vercel-live-feedback').evaluate((element) => {
      element.style.pointerEvents = 'none';
      element.style.zIndex = '-1';
      element.style.display = 'none';
    });
  }

  // Wait for the Open Editor button and Add Layer button to become enabled. These
  // are proxies for the map reaching an idle state.
  await expect(page.getByTestId('editor-toggle')).toBeEnabled({
    timeout: 10000
  });
  await expect(page.getByTestId('add-layer-button')).toBeEnabled({
    timeout: 10000
  });

  // Click the Open Editor button.
  await page.getByTestId('editor-toggle').click();

  // Ensure the Editor Panel is visible.
  await expect(page.getByTestId('program-editor')).toBeVisible();

  // Open the Add Layer modal.
  await expect(page.getByTestId('add-layer-button')).toBeEnabled();
  await page.getByTestId('add-layer-button').click();
  await expect(page.getByTestId('add-layer-modal')).toBeVisible();

  // Select the From File tab.
  await page.getByRole('button', { name: 'From File' }).waitFor();
  await page.getByRole('button', { name: 'From File' }).click();

  // Upload the American Crow Range GeoJSON file.
  await page
    .locator('#from-file-input')
    .setInputFiles(
      path.join(
        __dirname,
        '../data/workflow-5/wapo-american-crow-population-range.json'
      )
    );

  // Specify the layer's Display Name.
  await page.getByLabel('Display Name').fill('American Crow Range');

  // Add the layer.
  await page.getByRole('button', { name: 'Add' }).click();

  // Wait for the loading indicator to disappear.
  await page.getByTestId('loading-indicator').waitFor({ state: 'hidden' });

  // Ensure the Add Layer modal is no longer visible.
  await expect(page.getByTestId('add-layer-modal')).not.toBeVisible();

  // Wait for MapLibre to render the American Crow Range layer.
  //
  // Tiles are generated on the fly by MapLibre, so we need to wait for them to
  // load. In theory, we'd like to hook into MapLibre's event system to deter-
  // mine when the map is idle; however, we don't want to attach the map inst-
  // ance to the global window object just for the sake of testing.
  await page.waitForTimeout(5000);

  // Click on a page location that will trigger selection of the American Crow
  // Range layer.
  await page.locator('#map').click({
    position: {
      x: 600,
      y: 400
    }
  });

  // Ensure that the Properties Panel is visible.
  await expect(page.locator('#properties')).toBeVisible();

  // Remove the layer's stroke.
  await page.getByTestId('remove-stroke-button').click();

  // Set the layer's fill color to #ffffff.
  await page.getByTestId('fill-color-input').fill('#ffffff');
  await page.getByTestId('fill-color-input').press('Enter');

  // Set the layer's fill opacity to 100.
  await page.locator('#fill-opacity-input').fill('100');
  await page.locator('#fill-opacity-input').press('Enter');

  // Click on a page location that will trigger deselection of the American Crow
  // Range layer.
  await page.locator('#map').click({
    position: {
      x: 20,
      y: 360
    }
  });

  // Open the Add Layer modal.
  await page.getByTestId('add-layer-button').click();

  // Select the From File tab.
  await page.getByRole('button', { name: 'From File' }).waitFor();
  await page.getByRole('button', { name: 'From File' }).click();

  // Upload the American Crow Population Change GeoJSON file.
  await page
    .getByLabel('File')
    .setInputFiles(
      path.join(
        __dirname,
        '../data/workflow-5/wapo-american-crow-population-change.json'
      )
    );

  // Specify the layer's Display Name.
  await page.getByLabel('Display Name').fill('American Crow Population Change');

  // Add the layer.
  await page.getByRole('button', { name: 'Add' }).click();

  // Wait for the loading indicator to disappear.
  await page.getByTestId('loading-indicator').waitFor({ state: 'hidden' });

  // Ensure the Add Layer modal is no longer visible.
  await expect(page.getByTestId('add-layer-modal')).not.toBeVisible();

  // Wait for MapLibre to render the American Crow Population Change layer.
  //
  // Tiles are generated on the fly by MapLibre, so we need to wait for them to
  // load. In theory, we'd like to hook into MapLibre's event system to deter-
  // mine when the map is idle; however, we don't want to attach the map inst-
  // ance to the global window object just for the sake of testing.
  await page.waitForTimeout(5000);

  // Click on a page location that will trigger selection of the American Crow
  // Population Change layer.
  await page.locator('#map').click({
    position: {
      x: 773,
      y: 569
    }
  });

  // Ensure the Properties Panel is visible.
  await expect(page.locator('#properties')).toBeVisible();

  // Set the layer's Layer Type to Choropleth.
  await page.locator('#layer-type-select').selectOption('Choropleth');

  // Remove the layer's stroke.
  await page.getByTestId('remove-stroke-button').click();

  // Set the layer's Attribute to abd_trend.
  await page.locator('#fill-attribute-select').selectOption('abd_trend');

  // Set the layer's Steps to 8.
  await page.locator('#color-steps-select').selectOption('8');

  // Set the layer's Method to Manual.
  await page.locator('#classification-method-select').selectOption('Manual');

  // Set the layer's Breaks to -30, -20, -10, 0, 10, 20, 30.
  await page.getByTestId('breaks-editor').locator('input').first().fill('-30');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .first()
    .press('Enter');
  await page.getByTestId('breaks-editor').locator('input').nth(1).fill('-20');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(1)
    .press('Enter');
  await page.getByTestId('breaks-editor').locator('input').nth(2).fill('-10');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(2)
    .press('Enter');
  await page.getByTestId('breaks-editor').locator('input').nth(3).fill('0');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(3)
    .press('Enter');
  await page.getByTestId('breaks-editor').locator('input').nth(4).fill('10');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(4)
    .press('Enter');
  await page.getByTestId('breaks-editor').locator('input').nth(5).fill('20');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(5)
    .press('Enter');
  await page.getByTestId('breaks-editor').locator('input').nth(6).fill('30');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(6)
    .press('Enter');

  // Set the layer's Color Scheme to RdBu.
  await page.locator('#color-scheme').getByRole('button').click();
  await page.locator('li:nth-child(23)').getByRole('button').click();

  // Click on a page location that will trigger deselection of both layers.
  await page.locator('#map').click({
    position: {
      x: 0,
      y: 360
    }
  });

  // Ensure the Properties Panel is hidden.
  await expect(page.locator('#properties')).not.toBeVisible();
});
