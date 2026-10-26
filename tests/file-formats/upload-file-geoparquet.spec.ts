import * as path from 'node:path';
import * as url from 'node:url';

import { test, expect } from '@playwright/test';

import { waitForMapIdle } from '../utils/idle';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

test.describe('upload-file-geoparquet', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to cartokit, running on a local development server.
    await page.goto('/?playwright=1');

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
  });

  test('should support uploading GeoParquet files from disk', async ({
    page
  }) => {
    // Open the Add Layer modal.
    await page.getByTestId('add-layer-button').click();
    await expect(page.getByTestId('add-layer-modal')).toBeVisible();

    // Select the From File tab.
    await page.getByRole('tab', { name: 'From File' }).click();

    // Upload the Earthquakes GeoParquet file.
    await page
      .locator('#from-file-input')
      .setInputFiles(path.join(__dirname, '../data/all/earthquakes.parquet'));

    // Specify the layer's Display Name.
    await page.getByLabel('Display Name').fill('Earthquakes');

    // Add the layer.
    await page
      .getByTestId('add-layer-modal')
      .getByRole('button', { name: 'Add' })
      .click();

    // Wait for the loading indicator to disappear.
    await page.getByTestId('loading-indicator').waitFor({ state: 'hidden' });

    // Ensure the Add Layer modal is no longer visible.
    await expect(page.getByTestId('add-layer-modal')).not.toBeVisible({
      timeout: 10000
    });

    // Wait for the map to tile and render the data.
    await waitForMapIdle(page);

    // Click on the layer entry in the Layers Panel.
    await page.getByTestId('layer-entry').first().click();

    // Ensure that the Properties Panel is visible.
    await expect(page.locator('#properties')).toBeVisible();
  });
});
