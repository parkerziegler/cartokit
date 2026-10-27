import * as path from 'node:path';
import * as url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

import { expect, test } from '@playwright/test';

import { waitForMapIdle } from '../utils/idle';
import { openCartokit } from '../utils/navigate';

test.describe('upload-map', () => {
  test.beforeEach(async ({ page }) => {
    await openCartokit(page);
  });

  test('should upload a map from a .ck.json file', async ({ page }) => {
    // Open the ActionPicker.
    await page.getByTestId('action-picker-button').click();

    // Upload the map.ck.json file.
    await page
      .getByLabel('Upload Map')
      .setInputFiles(path.join(__dirname, '../data/maps/map.ck.json'));

    // Look for the info indicator.
    await expect(page.getByTestId('upload-map-alert')).toBeVisible();

    // Wait for the info indicator to disappear.
    await expect(page.getByTestId('upload-map-alert')).toBeHidden();

    // Wait for the map to tile and render the data.
    await waitForMapIdle(page);

    // Click on the layer entry in the Layers Panel.
    await page.getByTestId('layer-entry').first().click();

    // Ensure that the Properties Panel is visible.
    await expect(page.locator('#properties')).toBeVisible();

    // Verify that the layer's type is Choropleth.
    await expect(page.locator('#layer-type-select')).toHaveValue('Choropleth');

    // Verify that the layer's fill attribute is 'years_2080_2099'.
    await expect(page.locator('#fill-attribute-select')).toHaveValue(
      'years_2080_2099'
    );

    // Verify that there is no stroke.
    await expect(page.getByTestId('add-stroke-button')).toBeVisible();
  });

  test('should upload a map from a .ck.json file on Shift+U', async ({
    page
  }) => {
    // Set up the filechooser listener before triggering the keyboard shortcut.
    // Playwright will intercept the native file dialog instead of blocking on it.
    const fileChooserPromise = page.waitForEvent('filechooser');

    // Press Shift+U.
    await page.keyboard.press('Shift+U');

    // Wait for the file chooser and set the file.
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(
      path.join(__dirname, '../data/maps/map.ck.json')
    );

    // Look for the info indicator.
    await expect(page.getByTestId('upload-map-alert')).toBeVisible();

    // Wait for the info indicator to disappear.
    await expect(page.getByTestId('upload-map-alert')).toBeHidden();

    // Click on the layer entry in the Layers Panel.
    await page.getByTestId('layer-entry').first().click();

    // Ensure that the Properties Panel is visible.
    await expect(page.locator('#properties')).toBeVisible();

    // Verify that the layer's type is Choropleth.
    await expect(page.locator('#layer-type-select')).toHaveValue('Choropleth');

    // Verify that the layer's fill attribute is 'years_2080_2099'.
    await expect(page.locator('#fill-attribute-select')).toHaveValue(
      'years_2080_2099'
    );

    // Verify that there is no stroke.
    await expect(page.getByTestId('add-stroke-button')).toBeVisible();
  });
});
