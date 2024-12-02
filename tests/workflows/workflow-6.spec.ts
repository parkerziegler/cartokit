import * as path from 'node:path';
import * as url from 'node:url';

import { test, expect } from '@playwright/test';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Workflow 6. https://www.washingtonpost.com/climate-environment/interactive/2023/hot-cold-extreme-temperature-deaths/
 *
 * This workflow reproduces the central map published in "Will global warming
 * make temperature less deadly?" by Harry Stevens at The Washington Post. The
 * map comprises one GeoJSON layer:
 *
 * - Climate impact regions as demarcated by Carleton et al. (2022).
 * https://academic.oup.com/qje/article/137/4/2037/6571943
 */
test('workflow-6', async ({ page }) => {
  // Identify the playwright test for application code.
  await page.addInitScript(() => {
    (
      window as unknown as Window & { playwrightWorkflowId: string }
    ).playwrightWorkflowId = 'workflow-6';
  });

  // Mark workflow tests as slow.
  test.slow();

  // Navigate to cartokit, running on a local development server.
  await page.goto('/');

  if (page.url().includes('vercel.app')) {
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

  // Upload the Climate Impact Regions GeoJSON file.
  await page
    .locator('#from-file-input')
    .setInputFiles(
      path.join(
        __dirname,
        '../data/workflow-6/wapo-climate-impact-regions.json'
      )
    );

  // Specify the layer's Display Name.
  await page.getByLabel('Display Name').fill('Climate Impact Regions');

  // Add the layer.
  await page
    .getByTestId('add-layer-modal')
    .getByRole('button', { name: 'Add' })
    .click();

  // Wait for the loading indicator to disappear.
  await page.getByTestId('loading-indicator').waitFor({ state: 'hidden' });

  // Ensure the Add Layer modal is no longer visible.
  await expect(page.getByTestId('add-layer-modal')).not.toBeVisible();

  // Wait for MapLibre to render the Climate Impact Regions layer.
  //
  // Tiles are generated on the fly by MapLibre, so we need to wait for them to
  // load. In theory, we'd like to hook into MapLibre's event system to deter-
  // mine when the map is idle; however, we don't want to attach the map inst-
  // ance to the global window object just for the sake of testing.
  await page.waitForTimeout(5000);

  // Click on a page location that will trigger selection of the Climate Impact
  // Regions layer.
  await page.locator('#map').click({
    position: {
      x: 720,
      y: 450
    }
  });

  // Ensure that the Properties Panel is visible.
  await expect(page.locator('#properties')).toBeVisible();

  // Remove the layer's stroke.
  await page.getByTestId('remove-stroke-button').click();

  // Switch the layer's Layer Type to Choropleth.
  await page.locator('#layer-type-select').selectOption('Choropleth');

  // Set the layer's Attribute to 'years_2080_2099'.
  await page.locator('#fill-attribute-select').selectOption('years_2080_2099');

  // Switch the layer's Color Scheme to PRGn.
  await page.locator('#color-scheme').getByRole('button').click();
  await page.locator('li:nth-child(20)').getByRole('button').click();

  // Reverse the color scheme.
  await page.getByTestId('color-scheme-reverse-button').click();

  // Set the layer's Steps to 8.
  await page.locator('#color-steps-select').selectOption('8');

  // Set the layer's Method to Manual.
  await page.locator('#classification-method-select').selectOption('Manual');

  // Set the layer's Breaks to -200, -100, -50, 0, 50, 100, 200.
  await page.getByTestId('breaks-editor').locator('input').first().fill('-200');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .first()
    .press('Enter');
  await page.getByTestId('breaks-editor').locator('input').nth(1).fill('-100');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(1)
    .press('Enter');
  await page.getByTestId('breaks-editor').locator('input').nth(2).fill('-50');
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
  await page.getByTestId('breaks-editor').locator('input').nth(4).fill('50');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(4)
    .press('Enter');
  await page.getByTestId('breaks-editor').locator('input').nth(5).fill('100');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(5)
    .press('Enter');
  await page.getByTestId('breaks-editor').locator('input').nth(6).fill('200');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(6)
    .press('Enter');

  // Click on a page location that will trigger deselection of both layers.
  await page.locator('#map').click({
    position: {
      x: 0,
      y: 0
    }
  });

  // Ensure the Properties Panel is hidden.
  await expect(page.locator('#properties')).not.toBeVisible();
});
