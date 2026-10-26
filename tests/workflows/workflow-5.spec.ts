import * as path from 'node:path';
import * as url from 'node:url';

import { expect, test } from '@playwright/test';

import { waitForMapIdle } from '../utils/idle';
import { openCartokit } from '../utils/navigate';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Workflow 5. https://www.washingtonpost.com/climate-environment/interactive/2024/bird-population-decline-united-states-maps/
 *
 * This workflow reproduces the central map published in "Bird populations are
 * declining. Some are in your neighborhood." by Harry Stevens at The Washington
 * Post. The map comprises two GeoJSON layers:
 *
 * - The geographic range of the American Crow.
 * - The breeding season population trends for the American Crow in the conti-
 * nental United States from 2012-2022.
 */
test('workflow-5', async ({ page }) => {
  // Mark workflow tests as slow.
  test.slow();

  await openCartokit(page);

  // Click the Open Editor button.
  await page.getByTestId('editor-toggle').click();

  // Ensure the Editor Panel is visible.
  await expect(page.getByTestId('program-editor')).toBeVisible();

  // Open the Add Layer modal.
  await page.getByTestId('add-layer-button').click();
  await expect(page.getByTestId('add-layer-modal')).toBeVisible();

  // Select the From File tab.
  await page.getByRole('tab', { name: 'From File' }).click();

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

  // Ensure that the Properties Panel is visible.
  await expect(page.locator('#properties')).toBeVisible();

  // Remove the layer's stroke.
  await page.getByTestId('remove-stroke-button').click();

  // Set the layer's fill color to #ffffff.
  await page.getByTestId('fill-color-input').fill('#ffffff');
  await page.getByTestId('fill-color-input').press('Enter');

  // Set the layer's fill opacity to 100.
  await page.locator('#fill-opacity-input').fill('100');
  await page.locator('#fill-opacity-input').press('Enter');

  // Close the Properties Menu for the American Crow Range layer.
  await page.getByTestId('close-properties-menu-button').click();

  // Open the Add Layer modal.
  await page.getByTestId('add-layer-button').click();

  // Select the From File tab.
  await page.getByRole('tab', { name: 'From File' }).click();

  // Upload the American Crow Population Change GeoJSON file.
  await page
    .locator('#from-file-input')
    .setInputFiles(
      path.join(
        __dirname,
        '../data/workflow-5/wapo-american-crow-population-change.json'
      )
    );

  // Specify the layer's Display Name.
  await page.getByLabel('Display Name').fill('American Crow Population Change');

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

  // Ensure the Properties Panel is visible.
  await expect(page.locator('#properties')).toBeVisible();

  // Set the layer's type to Choropleth.
  await page.locator('#layer-type-select').selectOption('Choropleth');

  // Remove the layer's stroke.
  await page.getByTestId('remove-stroke-button').click();

  // Set the layer's Attribute to abd_trend.
  await page.locator('#fill-attribute-select').selectOption('abd_trend');

  // Set the layer's Steps to 8.
  await page.locator('#fill-step-count-select').selectOption('8');

  // Set the layer's Method to Manual.
  await page
    .locator('#fill-classification-method-select')
    .selectOption('Manual');

  // Set the layer's Breaks to -30, -20, -10, 0, 10, 20, 30.
  const stops = [-30, -20, -10, 0, 10, 20, 30];
  let i = 0;

  for await (const stop of stops) {
    const input = page
      .getByTestId('breaks-editor')
      .locator('input:last-child')
      .nth(i);

    await input.fill(stop.toString());
    await input.press('Enter');
    i++;
  }

  // Set the layer's Color Scheme to RdBu.
  await page.locator('#color-scheme').getByRole('button').click();
  await page.locator('li:nth-child(23)').getByRole('button').click();

  // Close the Properties Menu.
  await page.getByTestId('close-properties-menu-button').click();

  // Ensure the Properties Panel is hidden.
  await expect(page.locator('#properties')).not.toBeVisible();
});
