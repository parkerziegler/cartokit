import * as path from 'node:path';
import * as url from 'node:url';

import { test, expect } from '@playwright/test';

import { waitForMapIdle } from '../utils/idle';
import { openCartokit } from '../utils/navigate';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

test.describe('upload-file-geoparquet', () => {
  test.beforeEach(async ({ page }) => {
    await openCartokit(page);
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
