import * as path from 'node:path';
import * as url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

import { test, expect } from '@playwright/test';

test.describe('upload-map', () => {
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

    // Wait for the Open Editor button and Add Layer button to become enabled. These
    // are proxies for the map reaching an idle state.
    await expect(page.getByTestId('editor-toggle')).toBeEnabled({
      timeout: 10000
    });
    await expect(page.getByTestId('add-layer-button')).toBeEnabled({
      timeout: 10000
    });
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
