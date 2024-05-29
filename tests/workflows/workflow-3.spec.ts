import * as path from 'node:path';
import * as url from 'node:url';

import { test, expect } from '@playwright/test';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Workflow 3. https://www.washingtonpost.com/climate-environment/interactive/2024/winter-temperature-warming-city-data-climate-change/
 *
 * This workflow reproduces the central map published in "Winter is warming al-
 * most everywhere. See how it’s changed in your town." by Harry Stevens at The
 * Washington Post. The map comprises one GeoJSON layer:
 *
 * - ~8mi grid-cells containing data on the change in winter temperature at that
 * location in geographic space from 1980-2024.
 */
test('workflow-3', async ({ page }) => {
  // Increase the timeout for this workflow. We're working with a 250MB GeoJSON
  // file, which will take a long time for MapLibre to render.
  test.setTimeout(120000);

  // Navigate to cartokit, running on a local development server.
  await page.goto('/');

  // Wait for MapLibre to request tiles from the tile server and instantiate the
  // map instance.
  await page.waitForLoadState('networkidle');

  // Click the Open Editor button.
  await expect(page.getByTestId('editor-toggle')).toBeEnabled();
  await page.getByTestId('editor-toggle').click();

  // Ensure the Editor Panel is visible.
  await expect(page.getByTestId('program-editor')).toBeVisible();

  // Open the Add Layer modal.
  await expect(page.getByTestId('add-layer-button')).toBeEnabled();
  await page.getByTestId('add-layer-button').click();
  await expect(page.getByTestId('add-layer-modal')).toBeVisible();

  // Select the From File tab.
  await page.getByRole('button', { name: 'From File' }).waitFor();
  await page.getByRole('button', { name: 'From File' }).click();

  // Upload the Winter Temperature Change GeoJSON file.
  await page
    .locator('#from-file-input')
    .setInputFiles(
      path.join(
        __dirname,
        '../data/workflow-3/wapo-winter-temperature-change.json'
      )
    );

  // Specify the layer's Display Name.
  await page.getByLabel('Display Name').fill('Winter Temperature Change');

  // Add the layer.
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByTestId('add-layer-modal')).not.toBeVisible({
    timeout: 10000
  });

  // Wait for MapLibre to render the Winter Temperature Change layer.
  //
  // Tiles are generated on the fly by MapLibre, so we need to wait for them to
  // load. In theory, we'd like to hook into MapLibre's event system to deter-
  // mine when the map is idle; however, we don't want to attach the map inst-
  // ance to the global window object just for the sake of testing.
  await page.waitForTimeout(60000);

  // Click on a page location that will trigger selection of the Winter Tempera-
  // ture Change layer.
  await page.locator('#map').click({
    position: {
      x: 530,
      y: 100
    }
  });

  // Ensure that the Properties Panel is visible.
  await expect(page.locator('#properties')).toBeVisible();

  // Remove the layer's stroke.
  await page.getByTestId('remove-stroke-button').click();

  // Switch the layer's Map Type to Choropleth.
  await page.locator('#map-type-select').selectOption('Choropleth');

  // Set the layer's Attribute to 'decadal_rate'.
  await page.locator('#attribute-select').selectOption('decadal_rate');

  // Set the layer's Method to Manual.
  await page.locator('#color-scale-method-select').selectOption('Manual');

  // Set the layer's Breaks to -0.5, 0, 0.5, 1.
  await page.locator('.breaks-grid > input').first().fill('-0.5');
  await page.locator('.breaks-grid > input').first().press('Enter');
  await page.locator('.breaks-grid > input').nth(1).fill('0');
  await page.locator('.breaks-grid > input').nth(1).press('Enter');
  await page.locator('.breaks-grid > input').nth(2).fill('0.5');
  await page.locator('.breaks-grid > input').nth(2).press('Enter');
  await page.locator('.breaks-grid > input').nth(3).fill('1');
  await page.locator('.breaks-grid > input').nth(3).press('Enter');

  // Set the layer's Color Scheme to RdYlBu.
  await page.locator('#color-scheme').getByRole('button').click();
  await page.locator('button:nth-child(25)').click();

  // Reverse the layer's Color Scheme.
  await page.getByTestId('color-scheme-reverse-button').click();

  // Set the layer's fill-opacity to 100%.
  await page.locator('#fill-opacity-input').fill('100');
  await page.locator('#fill-opacity-input').press('Enter');

  // Click on a page location that will trigger deselection of the layer.
  await page.locator('#map').click({
    position: {
      x: 0,
      y: 0
    }
  });

  // Ensure the Properties Panel is hidden.
  await expect(page.locator('#properties')).not.toBeVisible();
});
