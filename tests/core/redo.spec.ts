import * as path from 'node:path';
import * as url from 'node:url';

import { test, expect } from '@playwright/test';

import { DEFAULT_COUNT } from '$lib/utils/constants';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

test.describe('redo', () => {
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

    // Click on the layer entry in the Layers Panel.
    await page.getByTestId('layer-entry').first().click();
  });

  test('should redo a single undone diff', async ({ page }) => {
    // Get the layer type select.
    const layerTypeSelect = page.locator('#layer-type-select');

    // Verify that the layer type is Polygon.
    expect(await layerTypeSelect.inputValue()).toBe('Polygon');

    // Switch the layer's type to Choropleth.
    await layerTypeSelect.selectOption('Choropleth');
    expect(await layerTypeSelect.inputValue()).toBe('Choropleth');

    // Undo the "layer-type" diff.
    await page.keyboard.press('ControlOrMeta+z');

    // Verify that the layer type is Polygon.
    expect(await layerTypeSelect.inputValue()).toBe('Polygon');

    // Redo the "layer-type" diff.
    await page.keyboard.press('ControlOrMeta+Shift+z');
    expect(await layerTypeSelect.inputValue()).toBe('Choropleth');
  });

  test('should redo multiple undone diffs', async ({ page }) => {
    // Get the layer type select.
    const layerTypeSelect = page.locator('#layer-type-select');

    // Verify that the layer type is Polygon.
    expect(await layerTypeSelect.inputValue()).toBe('Polygon');

    // Switch the layer's type to Choropleth.
    await layerTypeSelect.selectOption('Choropleth');

    // Get the fill step count select.
    const fillStepCountSelect = page.locator('#fill-step-count-select');
    expect(await fillStepCountSelect.inputValue()).toBe(`${DEFAULT_COUNT}`);

    // Set the fill step count to 8.
    await fillStepCountSelect.selectOption('8');
    expect(await fillStepCountSelect.inputValue()).toBe('8');

    // Undo the "fill-step-count" diff.
    await page.keyboard.press('ControlOrMeta+z');
    expect(await fillStepCountSelect.inputValue()).toBe(`${DEFAULT_COUNT}`);

    // Undo the "layer-type" diff.
    await page.keyboard.press('ControlOrMeta+z');
    expect(await layerTypeSelect.inputValue()).toBe('Polygon');

    // Redo the "layer-type" diff.
    await page.keyboard.press('ControlOrMeta+Shift+z');
    expect(await layerTypeSelect.inputValue()).toBe('Choropleth');

    // Redo the "fill-step-count" diff.
    await page.keyboard.press('ControlOrMeta+Shift+z');
    expect(await fillStepCountSelect.inputValue()).toBe('8');
  });

  test('should clear the redo stack when a new action is performed after undo', async ({
    page
  }) => {
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

    // Instead of redoing, perform a new action.
    await layerTypeSelect.selectOption('Point');
    expect(await layerTypeSelect.inputValue()).toBe('Point');

    // Attempt to redo.
    // This should have no effect since the redo stack was cleared.
    await page.keyboard.press('ControlOrMeta+Shift+z');

    // Verify that the layer type is still Point.
    expect(await layerTypeSelect.inputValue()).toBe('Point');

    // Undo should take us back to Polygon.
    await page.keyboard.press('ControlOrMeta+z');
    expect(await layerTypeSelect.inputValue()).toBe('Polygon');
  });
});
