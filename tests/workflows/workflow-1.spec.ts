import * as path from 'node:path';
import * as url from 'node:url';

import { test, expect } from '@playwright/test';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Workflow 1. https://www.nytimes.com/interactive/2024/science/total-solar-eclipse-maps-path.html
 *
 * This workflow reproduces the central map published in "Maps of the April 2024
 * Total Solar Eclipse" by Jonathan Corum at The New York Times. The map com-
 * prises two GeoJSON layers:
 *
 * - The path of totality for the April 2024 total solar eclipse.
 * - Geographic regions experiencing a partial solar eclipse, rendered as dec-
 * iles (i.e., 10%-90% coverage).
 */
test('workflow-1', async ({ page }) => {
  // Navigate to cartokit, running on a local development server.
  await page.goto('/');

  // Wait for MapLibre to request tiles from the tile server and instantiate the
  // map instance.
  await page.waitForLoadState('networkidle');

  // Focus the map and trigger a 'wheel' event to zoom out.
  await page.locator('#map').click({
    position: {
      x: 640,
      y: 360
    }
  });
  await page.mouse.wheel(0, 400);

  // Click the Open Editor button.
  await expect(page.getByTestId('editor-toggle')).toBeEnabled();
  await page.getByTestId('editor-toggle').click();

  // Ensure the Editor Panel is visible.
  await expect(page.getByTestId('program-editor')).toBeVisible();

  // Open the Add Layers modal.
  await expect(page.getByTestId('add-layer-button')).toBeEnabled();
  await page.getByTestId('add-layer-button').click();
  await expect(page.getByTestId('add-layer-modal')).toBeVisible();

  // Select the From File tab.
  await page.getByRole('button', { name: 'From File' }).waitFor();
  await page.getByRole('button', { name: 'From File' }).click();

  // Upload the Penumbra Paths GeoJSON file.
  await page
    .locator('#from-file-input')
    .setInputFiles(
      path.join(__dirname, '../data/workflow-1/nyt-nasa-penumbra-paths.json')
    );

  // Specify the layer's Display Name.
  await page.getByLabel('Display Name').fill('Penumbra Paths');

  // Add the layer.
  await page.getByRole('button', { name: 'Add' }).click();

  // Wait for MapLibre to render the Penumbra Paths layer.
  await expect(page.getByTestId('add-layer-modal')).not.toBeVisible();

  // Wait for MapLibre to render the Penumbra Paths layer.
  //
  // Tiles are generated on the fly by MapLibre, so we need to wait for them to
  // load. In theory, we'd like to hook into MapLibre's event system to deter-
  // mine when the map is idle; however, we don't want to attach the map inst-
  // ance to the global window object just for the sake of testing.
  await page.waitForTimeout(2000);

  // Click on a page location that will trigger selection of the Penumbra Paths
  // layer.
  await page.locator('#map').click({
    position: {
      x: 550,
      y: 375
    }
  });

  // Ensure that the Properties Panel is visible.
  await expect(page.locator('#properties')).toBeVisible();

  // Set the layer's Map Type to Choropleth.
  await page.locator('#map-type-select').selectOption('Choropleth');

  // Set the layer's stroke to #1f2b2e.
  await page.getByTestId('stroke-color-input').fill('#1f2b2e');
  await page.getByTestId('stroke-color-input').press('Enter');

  // Set the layer's stroke-opacity to 7.5%.
  await page.locator('#stroke-opacity-input').fill('7.5');
  await page.locator('#stroke-opacity-input').press('Enter');

  // Set the layer's stroke-width to 0.25.
  await page.locator('#stroke-width-input').fill('0.25');
  await page.locator('#stroke-width-input').press('Enter');

  // Open the Transformation Editor.
  await page.getByTestId('open-transformation-editor-button').click();
  await expect(page.getByTestId('transformation-editor')).toBeVisible();

  // Fill the Transformation Editor with JS code to reverse the order of feat-
  // ures in the Penumbra Paths layer.
  await page.getByTestId('transformation-editor').press('ControlOrMeta+A');
  await page.getByTestId('transformation-editor').press('Backspace');
  await page.getByTestId('transformation-editor')
    .pressSequentially(`function transformGeoJSON(geoJSON) {
  geoJSON.features.reverse();
  
  return geoJSON;`);

  // Execute the transformation.
  await page.getByTestId('run-transformation-button').click();

  // Wait for the transformation to complete.
  await expect(page.getByText('Successfully transformed data.')).toBeVisible();

  // Switch the Map Type to Fill.
  await page.locator('#map-type-select').selectOption('Fill');

  // Set the layer's fill to #1f2b2e.
  await page.getByTestId('fill-color-input').fill('#1f2b2e');
  await page.getByTestId('fill-color-input').press('Enter');

  // Set the fill-opacity to 7.5%.
  await page.locator('#fill-opacity-input').fill('7.5');
  await page.locator('#fill-opacity-input').press('Enter');

  // Deselect the layer.
  await page.locator('#map').click({
    position: {
      x: 0,
      y: 0
    }
  });

  // Upload the Path of Totality GeoJSON file.
  await page.getByTestId('add-layer-button').click();
  await page.getByRole('button', { name: 'From File' }).click();
  await page
    .locator('#from-file-input')
    .setInputFiles(
      path.join(__dirname, '../data/workflow-1/nyt-nasa-path-of-totality.json')
    );
  await page.getByLabel('Display Name').fill('Path of Totality');
  await page.getByRole('button', { name: 'Add' }).click();

  // Wait for MapLibre to render the Path of Totality layer.
  await page.waitForTimeout(2000);

  // Click on a page location that will trigger selection of the Path of Total-
  // ity layer.
  await page.locator('#map').click({
    position: {
      x: 500,
      y: 680
    }
  });

  // Ensure that the Properties Panel is visible.
  await expect(page.locator('#properties')).toBeVisible();

  // Set the layer's fill to #000000.
  await page.getByTestId('fill-color-input').fill('#000000');

  // Set the fill-opacity to 100%.
  await page.locator('#fill-opacity-input').fill('100');

  // Remove the layer's stroke.
  await page.getByTestId('remove-stroke-button').click();
});