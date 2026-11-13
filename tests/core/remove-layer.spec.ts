import * as path from 'node:path';
import * as url from 'node:url';

import { expect, test } from '@playwright/test';

import { waitForMapIdle } from '../utils/idle';
import { openCartokit } from '../utils/navigate';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

test.describe('remove layer', () => {
  test.beforeEach(async ({ page }) => {
    await openCartokit(page);

    // Open the Add Layer modal.
    await page.getByTestId('add-layer-button').click();
    await expect(page.getByTestId('add-layer-modal')).toBeVisible();
  });

  test('should hard delete a GeoJSON layer', async ({ page }) => {
    // Select the From File tab.
    await page.getByRole('tab', { name: 'From File' }).click();

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
    await expect(page.getByTestId('add-layer-modal')).not.toBeVisible({
      timeout: 10000
    });

    // Wait for the map to tile and render the data.
    await waitForMapIdle(page);

    const layerEntries = page.getByTestId('layer-entry');
    await expect(layerEntries).toHaveCount(1);

    // Remove the layer.
    await page.getByTestId('remove-layer-button').click();
    await expect(layerEntries).toHaveCount(0);
  });

  test('should hard delete a PMTiles layer', async ({ page }) => {
    // Select the From API tab.
    await page.getByRole('tab', { name: 'From API' }).click();

    // Add the API endpoint for the 2024 Presidential Election PMTiles archive.
    await page
      .locator('#from-endpoint-input')
      .fill(
        'https://pub-7182966c1afe48d3949439f93d0d4223.r2.dev/election-2024.pmtiles'
      );

    // Specify the layer's Display Name.
    await page.getByLabel('Display Name').fill('Election 2024');

    // Add the layer.
    await page
      .getByTestId('add-layer-modal')
      .getByRole('button', { name: 'Add' })
      .click();

    // Wait for the loading indicator to disappear.
    await page
      .getByTestId('loading-indicator')
      .waitFor({ state: 'hidden', timeout: 45000 });

    // Ensure the Add Layer modal is no longer visible.
    await expect(page.getByTestId('add-layer-modal')).not.toBeVisible({
      timeout: 10000
    });

    // Wait for the map to tile and render the data.
    await waitForMapIdle(page);

    const layerEntries = page.getByTestId('layer-entry');
    await expect(layerEntries).toHaveCount(1);

    // Remove the layer.
    await page.getByTestId('remove-layer-button').click();
    await expect(layerEntries).toHaveCount(0);
  });
});
