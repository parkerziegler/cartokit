import * as path from 'node:path';
import * as url from 'node:url';

import { test, expect } from '@playwright/test';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

test.describe('undo', () => {
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

    // Open the Add Layer modal.
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

    // Click on the layer entry in the Layers Panel.
    await page.getByTestId('layer-entry').first().click();
  });

  test('should undo a single diff', async ({ page }) => {
    // Get the layer type select.
    const layerTypeSelect = page.locator('#layer-type-select');

    // Verify that the layer type is Polygon.
    expect(await layerTypeSelect.inputValue()).toBe('Polygon');

    // Switch the layer's type to Choropleth.
    await layerTypeSelect.selectOption('Choropleth');
    expect(await layerTypeSelect.inputValue()).toBe('Choropleth');

    // Undo the "layer-type" diff.
    await page.keyboard.press('ControlOrMeta+z');
    expect(await layerTypeSelect.inputValue()).toBe('Polygon');
  });

  test('should undo multiple diffs', async ({ page }) => {
    // Get the layer type select.
    const layerTypeSelect = page.locator('#layer-type-select');

    // Verify that the layer type is Polygon.
    expect(await layerTypeSelect.inputValue()).toBe('Polygon');

    // Switch the layer's type to Choropleth.
    await layerTypeSelect.selectOption('Choropleth');

    // Get the fill step count select.
    const fillStepCountSelect = page.locator('#fill-step-count-select');
    expect(await fillStepCountSelect.inputValue()).toBe('5');

    // Set the fill step count to 8.
    await fillStepCountSelect.selectOption('8');
    expect(await fillStepCountSelect.inputValue()).toBe('8');

    // Undo the "fill-step-count" diff.
    await page.keyboard.press('ControlOrMeta+z');
    expect(await fillStepCountSelect.inputValue()).toBe('5');

    // Undo the "layer-type" diff.
    await page.keyboard.press('ControlOrMeta+z');
    expect(await layerTypeSelect.inputValue()).toBe('Polygon');
  });
});
