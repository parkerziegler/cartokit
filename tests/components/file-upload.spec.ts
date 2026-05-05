import * as path from 'node:path';
import * as url from 'node:url';

import { test, expect } from '@playwright/test';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const GEOJSON_PATH = path.join(
  __dirname,
  '../data/workflow-1/nyt-nasa-path-of-totality.json'
);

test.describe('file upload', () => {
  test.beforeEach(async ({ page }) => {
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

    // Wait for the Open Editor button and Add Layer button to become enabled.
    // These are proxies for the map reaching an idle state.
    await expect(page.getByTestId('editor-toggle')).toBeEnabled({
      timeout: 10000
    });
    await expect(page.getByTestId('add-layer-button')).toBeEnabled({
      timeout: 10000
    });
  });

  test('uploads a GeoJSON file and resets the From File form state', async ({
    page
  }) => {
    // Open the Add Layer modal.
    await page.getByTestId('add-layer-button').click();
    await expect(page.getByTestId('add-layer-modal')).toBeVisible();

    // Select the From File tab.
    await page.getByRole('button', { name: 'From File' }).click();

    // Upload the Path of Totality GeoJSON file.
    await page.locator('#from-file-input').setInputFiles(GEOJSON_PATH);

    // Specify the layer's Display Name.
    await page.getByLabel('Display Name').fill('Path of Totality');

    // Add the layer.
    await page
      .getByTestId('add-layer-modal')
      .getByRole('button', { name: 'Add' })
      .click();

    // Wait for the loading indicator to disappear.
    await page.getByTestId('loading-indicator').waitFor({ state: 'hidden' });

    // Ensure the Add Layer modal is no longer visible.
    await expect(page.getByTestId('add-layer-modal')).not.toBeVisible();

    // Wait for MapLibre to render the Path of Totality layer.
    //
    // Tiles are generated on the fly by MapLibre, so we need to wait for them
    // to load. In theory, we'd like to hook into MapLibre's event system to
    // determine when the map is idle; however, we don't want to attach the map
    // instance to the global window object just for the sake of testing.
    await page.waitForTimeout(5000);

    // Ensure the layer entry appears in the Layers Panel.
    await expect(page.getByTestId('layer-entry')).toHaveCount(1);

    // Reopen the Add Layer modal and return to the From File tab to confirm
    // the form state has been reset.
    await page.getByTestId('add-layer-button').click();
    await expect(page.getByTestId('add-layer-modal')).toBeVisible();
    await page.getByRole('button', { name: 'From File' }).click();

    // The Display Name input should be empty.
    await expect(page.getByLabel('Display Name')).toHaveValue('');

    // The file input should display its default prompt.
    await expect(
      page.getByTestId('add-layer-modal').locator('label.file > span')
    ).toHaveAttribute('data-content', 'Choose file...');

    // The Add button should be disabled while no file or display name is set.
    await expect(
      page.getByTestId('add-layer-modal').getByRole('button', { name: 'Add' })
    ).toBeDisabled();
  });

  test('uploads the same GeoJSON file twice in a row', async ({ page }) => {
    for (const displayName of ['Path of Totality 1', 'Path of Totality 2']) {
      // Open the Add Layer modal.
      await page.getByTestId('add-layer-button').click();
      await expect(page.getByTestId('add-layer-modal')).toBeVisible();

      // Select the From File tab.
      await page.getByRole('button', { name: 'From File' }).click();

      // Upload the Path of Totality GeoJSON file.
      await page.locator('#from-file-input').setInputFiles(GEOJSON_PATH);

      // Specify the layer's Display Name.
      await page.getByLabel('Display Name').fill(displayName);

      // Add the layer.
      await page
        .getByTestId('add-layer-modal')
        .getByRole('button', { name: 'Add' })
        .click();

      // Wait for the loading indicator to disappear.
      await page.getByTestId('loading-indicator').waitFor({ state: 'hidden' });

      // Ensure the Add Layer modal is no longer visible.
      await expect(page.getByTestId('add-layer-modal')).not.toBeVisible();

      // Wait for MapLibre to render the new layer.
      await page.waitForTimeout(5000);
    }

    // Ensure both layer entries appear in the Layers Panel.
    await expect(page.getByTestId('layer-entry')).toHaveCount(2);
  });
});
