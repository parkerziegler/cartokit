import * as path from 'node:path';
import * as url from 'node:url';

import { test, expect } from '@playwright/test';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Workflow 4. https://www.washingtonpost.com/climate-environment/interactive/2023/map-illegal-fishing/
 *
 * This workflow reproduces the central map published in "A boat went dark.
 * Finding it could help save the world's fish." by Harry Stevens at The Wash-
 * ington Post. The map comprises one GeoJSON layer:
 *
 * - A grid of 0.5° lat/lon cells with the count of associated AIS (Automatic
 * Identification System) transpoder signal disabling events at that location in
 * geographic space.
 */
test('workflow-4', async ({ page }) => {
  // Identify the playwright test for application code.
  await page.addInitScript(() => {
    (
      window as unknown as Window & { playwrightWorkflowId: string }
    ).playwrightWorkflowId = 'workflow-4';
  });

  // Navigate to cartokit, running on a local development server.
  await page.goto('/');

  if (process.env.GITHUB_ENV === 'Preview') {
    // In Preview Vercel environments, ensure <vercel-live-feedback> does not
    // intercept pointer events.
    await page
      .locator('vercel-live-feedback')
      .evaluate((element) => (element.style.pointerEvents = 'none'));
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

  // Focus the map and trigger a 'wheel' event to zoom out.
  await page.locator('#map').click({
    position: {
      x: 640,
      y: 360
    }
  });
  await page.mouse.wheel(0, 1200);

  // Pan the map to focus South America.
  await page.locator('#map').click({
    position: {
      x: 640,
      y: 360
    }
  });

  await page.mouse.down();
  await page.mouse.move(-50, -400);
  await page.mouse.up();

  // Open the Add Layer modal.
  await page.getByTestId('add-layer-button').click();
  await expect(page.getByTestId('add-layer-modal')).toBeVisible();

  // Select the From File tab.
  await page.getByRole('button', { name: 'From File' }).waitFor();
  await page.getByRole('button', { name: 'From File' }).click();

  // Upload the Fish Transponder Gaps GeoJSON file.
  await page
    .locator('#from-file-input')
    .setInputFiles(
      path.join(
        __dirname,
        '../data/workflow-4/wapo-fishing-boat-transponder-gaps.json'
      )
    );

  // Specify the layer's Display Name.
  await page.getByLabel('Display Name').fill('Transponder Gaps');

  // Add the layer.
  await page.getByRole('button', { name: 'Add' }).click();

  // Wait for the loading indicator to disappear.
  await page.getByTestId('loading-indicator').waitFor({ state: 'hidden' });

  // Ensure the Add Layer modal is no longer visible.
  await expect(page.getByTestId('add-layer-modal')).not.toBeVisible();

  // Wait for MapLibre to render the Fishing Boat Transponder Gaps layer.
  //
  // Tiles are generated on the fly by MapLibre, so we need to wait for them to
  // load. In theory, we'd like to hook into MapLibre's event system to deter-
  // mine when the map is idle; however, we don't want to attach the map inst-
  // ance to the global window object just for the sake of testing.
  await page.waitForTimeout(5000);

  // Click on a page location that will trigger selection of the Fishing Boat
  // Transponder Gaps layer.
  await page.locator('#map').click({
    position: {
      x: 180,
      y: 300
    }
  });

  // Ensure that the Properties Panel is visible.
  await expect(page.locator('#properties')).toBeVisible();

  // Remove the layer's stroke.
  await page.getByTestId('remove-stroke-button').click();

  // Switch the layer's Layer Type to Choropleth.
  await page.locator('#layer-type-select').selectOption('Choropleth');

  // Set the layer's Steps to 8.
  await page.locator('#color-steps-select').selectOption('8');

  // Set the layer's Color Scheme to RdYlBu.
  await page.locator('#color-scheme').getByRole('button').click();
  await page.locator('li:nth-child(25)').getByRole('button').click();

  // Set the layer's Method to Manual.
  await page.locator('#classification-method-select').selectOption('Manual');

  // Set the layer's Breaks to 614.791, 973.836, 1228.582, 1426.178, 1587.626,
  // 1724.178, 1842.373.
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .first()
    .fill('614.791');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .first()
    .press('Enter');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(1)
    .fill('973.836');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(1)
    .press('Enter');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(2)
    .fill('1228.582');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(2)
    .press('Enter');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(3)
    .fill('1426.178');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(3)
    .press('Enter');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(4)
    .fill('1587.626');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(4)
    .press('Enter');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(5)
    .fill('1724.178');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(5)
    .press('Enter');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(6)
    .fill('1842.373');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(6)
    .press('Enter');

  // Deselect the layer.
  await page.locator('#map').click({
    position: {
      x: 0,
      y: 360
    }
  });

  // Ensure the Properties Panel is hidden.
  await expect(page.locator('#properties')).not.toBeVisible();
});
