import * as path from 'node:path';
import * as url from 'node:url';

import { test, expect } from '@playwright/test';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Workflow 5. https://www.washingtonpost.com/climate-environment/interactive/2024/bird-population-decline-united-states-maps/
 *
 * This workflow reproduces the central map published in "Bird pop-
 * ulations are declining. Some are in your neighborhood." by Harry Stevens at
 * The Washington Post. The map comprises two GeoJSON layers:
 *
 * - The geographic range of the American Crow.
 * - The breeding season population trends for the American Crow in the conti-
 * nental United States from 2012-2022.
 */
test('workflow-5', async ({ page }) => {
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

  // Open the Add Layers modal.
  await expect(page.getByTestId('add-layer-button')).toBeEnabled();
  await page.getByTestId('add-layer-button').click();
  await expect(page.getByTestId('add-layer-modal')).toBeVisible();

  // Select the From File tab.
  await page.getByRole('button', { name: 'From File' }).waitFor();
  await page.getByRole('button', { name: 'From File' }).click();

  // Upload the American Crow Range GeoJSON file.
  await page
    .locator('#from-file-input')
    .setInputFiles(
      path.join(
        __dirname,
        '../data/workflow-5/wapo-american-crow-population-range.json'
      )
    );

  // Specify the layer's Display Name.
  await page.getByLabel('Display Name').fill('American Crow Range');

  // Add the layer.
  await page.getByRole('button', { name: 'Add' }).click();

  // Wait for MapLibre to render the American Crow Range layer.
  await expect(page.getByTestId('add-layer-modal')).not.toBeVisible();

  // Click on a page location that will trigger selection of the American Crow
  // Range layer.
  await page.locator('#map').click({
    position: {
      x: 600,
      y: 400
    }
  });

  // Ensure that the Properties Panel is visible.
  await expect(page.locator('#properties')).toBeVisible();

  // Remove the layer's stroke.
  await page.getByTestId('remove-stroke').click();

  // Set the layer's fill color to #ffffff.
  await page.getByTestId('fill-color-input').fill('#ffffff');
  await page.getByTestId('fill-color-input').press('Enter');

  // Set the layer's fill opacity to 100.
  await page.locator('#fill-opacity-input').fill('100');
  await page.locator('#fill-opacity-input').press('Enter');

  // Click on a page location that will trigger deselection of the American Crow
  // Range layer.
  await page.locator('#map').click({
    position: {
      x: 20,
      y: 360
    }
  });

  // Open Add Layers modal.
  await page.getByTestId('add-layer-button').click();

  // Select the From File tab.
  await page.getByRole('button', { name: 'From File' }).waitFor();
  await page.getByRole('button', { name: 'From File' }).click();

  // Upload the American Crow Population Change GeoJSON file.
  await page
    .getByLabel('File')
    .setInputFiles(
      path.join(
        __dirname,
        '../data/workflow-5/wapo-american-crow-population-change.json'
      )
    );

  // Specify the layer's Display Name.
  await page.getByLabel('Display Name').fill('American Crow Population Change');

  // Add the layer.
  await page.getByRole('button', { name: 'Add' }).click();

  // Wait for MapLibre to render the American Crow Population Change layer.
  //
  // Tiles are generated on the fly by MapLibre, so we need to wait for them to
  // load. In theory, we'd like to hook into MapLibre's event system to deter-
  // mine when the map is idle; however, we don't want to attach the map inst-
  // ance to the global window object just for the sake of testing.
  await page.waitForTimeout(2000);

  // Click on a page location that will trigger selection of the American Crow
  // Population Change layer.
  await page.locator('#map').click({
    position: {
      x: 773,
      y: 569
    }
  });

  // Ensure the Properties Panel is visible.
  await expect(page.locator('#properties')).toBeVisible();

  // Set the layer's Map Type to Choropleth.
  await page.locator('#map-type-select').selectOption('Choropleth');

  // Remove the layer's stroke.
  await page.getByTestId('remove-stroke').click();

  // Set the layer's Attribute to abd_trend.
  await page.locator('#attribute-select').selectOption('abd_trend');

  // Set the layer's Steps to 8.
  await page.locator('#color-stops-select').selectOption('8');

  // Set the layer's Method to Manual.
  await page.locator('#color-scale-method-select').selectOption('Manual');

  // Set the layer's Breaks to -30, -20, -10, 0, 10, 20, 30.
  await page.locator('.breaks-grid > input').first().fill('-30');
  await page.locator('.breaks-grid > input').first().press('Enter');
  await page.locator('.breaks-grid > input').nth(1).fill('-20');
  await page.locator('.breaks-grid > input').nth(1).press('Enter');
  await page.locator('.breaks-grid > input').nth(2).fill('-10');
  await page.locator('.breaks-grid > input').nth(2).press('Enter');
  await page.locator('.breaks-grid > input').nth(3).fill('0');
  await page.locator('.breaks-grid > input').nth(3).press('Enter');
  await page.locator('.breaks-grid > input').nth(4).fill('10');
  await page.locator('.breaks-grid > input').nth(4).press('Enter');
  await page.locator('.breaks-grid > input').nth(5).fill('20');
  await page.locator('.breaks-grid > input').nth(5).press('Enter');
  await page.locator('.breaks-grid > input').nth(6).fill('30');
  await page.locator('.breaks-grid > input').nth(6).press('Enter');

  // Set the layer's Color Scheme to RdYlBu.
  await page.locator('#color-scheme').getByRole('button').click();
  await page.locator('button:nth-child(23)').click();
  await page.locator('#color-scheme').click();
  await page.locator('button:nth-child(23)').click();

  // Click on a page location that will trigger deselection of both layers.
  await page.locator('#map').click({
    position: {
      x: 20,
      y: 360
    }
  });
});
