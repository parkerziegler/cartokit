import * as path from 'node:path';
import * as url from 'node:url';

import { expect, test } from '@playwright/test';

import { waitForMapIdle } from '../utils/idle';
import { openCartokit } from '../utils/navigate';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

test.describe('undo', () => {
  test.beforeEach(async ({ page }) => {
    await openCartokit(page);

    // Open the Add Layer modal.
    await page.getByTestId('add-layer-button').click();
    await expect(page.getByTestId('add-layer-modal')).toBeVisible();

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

  test('should undo removing a layer', async ({ page }) => {
    // Undoing a "remove-layer" diff applies an "add-layer" diff taken from the
    // undo stack, which crosses a structured clone boundary into the catalog
    // worker. Collect page errors so a failure to clone surfaces here, rather
    // than as a layer that silently fails to return.
    const errors: Error[] = [];
    page.on('pageerror', (error) => errors.push(error));

    const layerEntry = page.getByTestId('layer-entry');
    await expect(layerEntry).toHaveCount(1);

    // Remove the layer.
    await page.getByTestId('remove-layer-button').click();
    await expect(layerEntry).toHaveCount(0);

    // Undo the "remove-layer" diff.
    await page.keyboard.press('ControlOrMeta+z');

    // Wait for the layer to return; restoring it rebuilds its catalog in a
    // worker thread.
    await expect(layerEntry).toHaveCount(1, { timeout: 10000 });
    await expect(layerEntry).toContainText('Climate Impact Regions');

    expect(errors).toEqual([]);
  });
});
