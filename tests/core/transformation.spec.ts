import * as path from 'node:path';
import * as url from 'node:url';

import { expect, test } from '@playwright/test';

import { waitForMapIdle } from '../utils/idle';
import { openCartokit } from '../utils/navigate';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

test.describe('transformation', () => {
  test.describe('Polygon transformations', () => {
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
    });

    test('should apply a Centroid transformation to a Polygon layer', async ({
      page
    }) => {
      // Right click on a Polygon feature.
      await page
        .locator('#map')
        .click({ button: 'right', position: { x: 400, y: 400 } });

      const contextMenu = page.getByTestId('context-menu');
      await expect(contextMenu).toBeVisible();

      // Hover the Centroid entry.
      const centroidButton = contextMenu.getByText('Centroid');
      await centroidButton.hover();

      // Wait for the Preview to render.
      await waitForMapIdle(page);

      // Ensure the Preview renders.
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              !!window.__map!.getLayer('climate_impact_regions__1-speculate')
          )
        )
        .toBe(true);

      // Click on the entry.
      await centroidButton.click();

      // Allow the new data to tile.
      await waitForMapIdle(page);

      // Verify the layer exists in the Layers Panel.
      const layerEntries = page.getByTestId('layer-entry');
      await expect(layerEntries).toHaveCount(2);
      await expect(layerEntries.first()).toContainText('(Centroids)');
    });

    test('should apply an Envelope transformation to a Polygon layer', async ({
      page
    }) => {
      // Right click on a Polygon feature.
      await page
        .locator('#map')
        .click({ button: 'right', position: { x: 400, y: 400 } });

      const contextMenu = page.getByTestId('context-menu');
      await expect(contextMenu).toBeVisible();

      // Hover the Envelope entry.
      const envelopeButton = contextMenu.getByText('Envelope');
      await envelopeButton.hover();

      // Wait for the Preview to render.
      await waitForMapIdle(page);

      // Ensure the Preview renders.
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              !!window.__map!.getLayer('climate_impact_regions__1-speculate')
          )
        )
        .toBe(true);

      // Click on the entry.
      await envelopeButton.click();

      // Allow the new data to tile.
      await waitForMapIdle(page);

      // Verify the layer exists in the Layers Panel.
      const layerEntries = page.getByTestId('layer-entry');
      await expect(layerEntries).toHaveCount(2);
      await expect(layerEntries.first()).toContainText('(Envelopes)');
    });
  });

  test.describe('Point transformations', () => {
    test.beforeEach(async ({ page }) => {
      await openCartokit(page);

      // Open the Add Layer modal.
      await page.getByTestId('add-layer-button').click();
      await expect(page.getByTestId('add-layer-modal')).toBeVisible();

      // Select the From Gallery tab.
      await page.getByRole('tab', { name: 'From Gallery' }).click();

      // Add the US Power Plants layer.
      await page.getByRole('button', { name: /US Power Plants/ }).click();

      // Ensure the Add Layer modal is no longer visible.
      await expect(page.getByTestId('add-layer-modal')).not.toBeVisible({
        timeout: 10000
      });

      // Wait for the map to tile and render the data.
      await waitForMapIdle(page);
    });

    test('should apply a Buffer transformation to a Point layer', async ({
      page
    }) => {
      // Right click on a Point feature.
      await page
        .locator('#map')
        .click({ button: 'right', position: { x: 500, y: 350 } });

      const contextMenu = page.getByTestId('context-menu');
      await expect(contextMenu).toBeVisible();

      // Hover the Buffer entry.
      const bufferButton = contextMenu.getByText('Buffer');
      await bufferButton.hover();

      // Wait for the Preview to render.
      await waitForMapIdle(page);

      // Ensure the Preview renders.
      await expect
        .poll(() =>
          page.evaluate(
            () => !!window.__map!.getLayer('us_power_plants__1-speculate')
          )
        )
        .toBe(true);

      // Click on the entry.
      await bufferButton.click();

      // Allow the new data to tile.
      await waitForMapIdle(page);

      // Verify the layer exists in the Layers Panel.
      const layerEntries = page.getByTestId('layer-entry');
      await expect(layerEntries).toHaveCount(2);
      await expect(layerEntries.first()).toContainText('(Buffers)');
    });

    test('should apply an adjusted Buffer transformation to a Point layer', async ({
      page
    }) => {
      // Right click on a Point feature.
      await page
        .locator('#map')
        .click({ button: 'right', position: { x: 500, y: 350 } });

      const contextMenu = page.getByTestId('context-menu');
      await expect(contextMenu).toBeVisible();

      // Hover the Buffer entry.
      const bufferEntry = contextMenu
        .getByRole('listitem')
        .filter({ hasText: 'Buffer' });
      await bufferEntry.hover();

      // Open the Buffer's parameters.
      await bufferEntry.getByRole('button').last().click();
      const distanceInput = bufferEntry.getByLabel('Distance (m)');
      await expect(distanceInput).toBeVisible();

      // Wait for the Preview to render.
      await waitForMapIdle(page);

      // Ensure the Preview renders.
      await expect
        .poll(() =>
          page.evaluate(
            () => !!window.__map!.getLayer('us_power_plants__1-speculate')
          )
        )
        .toBe(true);

      // Adjust the Buffer distance.
      const distance = Number(await distanceInput.inputValue()) * 2;
      await distanceInput.fill(distance.toString());
      await distanceInput.press('Enter');

      // Ensure the Preview persists while the parameters are being edited.
      await waitForMapIdle(page);
      await expect
        .poll(() =>
          page.evaluate(
            () => !!window.__map!.getLayer('us_power_plants__1-speculate')
          )
        )
        .toBe(true);

      // Ensure the adjusted distance is retained.
      await expect(distanceInput).toHaveValue(distance.toString());

      // Click on the entry.
      await bufferEntry.getByText('Buffer').click();

      // Allow the new data to tile.
      await waitForMapIdle(page);

      // Verify the layer exists in the Layers Panel.
      const layerEntries = page.getByTestId('layer-entry');
      await expect(layerEntries).toHaveCount(2);
      await expect(layerEntries.first()).toContainText('(Buffers)');
    });
  });

  test.describe('Transformation dependencies', () => {
    test.beforeEach(async ({ page }) => {
      await openCartokit(page);

      // Open the Add Layer modal.
      await page.getByTestId('add-layer-button').click();
      await expect(page.getByTestId('add-layer-modal')).toBeVisible();

      // Select the From Gallery tab.
      await page.getByRole('tab', { name: 'From Gallery' }).click();

      // Add the US Power Plants layer.
      await page.getByRole('button', { name: /US Power Plants/ }).click();

      // Ensure the Add Layer modal is no longer visible.
      await expect(page.getByTestId('add-layer-modal')).not.toBeVisible({
        timeout: 10000
      });

      // Wait for the map to tile and render the data.
      await waitForMapIdle(page);
    });

    test('should delete all downstream layers if a user opts to when removing an upstream layer', async ({
      page
    }) => {
      // Right click on a Point feature.
      await page
        .locator('#map')
        .click({ button: 'right', position: { x: 500, y: 350 } });

      const contextMenu = page.getByTestId('context-menu');
      await expect(contextMenu).toBeVisible();

      // Click the Buffer entry.
      const bufferButton = contextMenu.getByText('Buffer');
      await bufferButton.click();

      // Wait for the data to tile.
      await waitForMapIdle(page);

      // Ensure the Layers Panel shows two entries.
      const layerEntries = page.getByTestId('layer-entry');
      await expect(layerEntries).toHaveCount(2);

      // Click the Remove Layer button for the upstream layer.
      const upstreamLayer = layerEntries.filter({ hasNotText: '(Buffers)' });
      upstreamLayer.getByTestId('remove-layer-button').click();

      // Confirm the Remove Layer dialog appears.
      const confirmRemoveLayerDialog = page.getByTestId(
        'confirm-remove-layer-dialog'
      );
      await expect(confirmRemoveLayerDialog).toBeVisible();

      // Click the Remove n layers button.
      await confirmRemoveLayerDialog
        .getByRole('button', {
          name: /Remove [0-9]+ layers/
        })
        .click();

      // Ensure the Layers Panel is empty.
      await expect(layerEntries).toHaveCount(0);
    });

    test('should keep downstream layers if a user opts to keep upstream data as needed when removing an upstream layer', async ({
      page
    }) => {
      // Right click on a Point feature.
      await page
        .locator('#map')
        .click({ button: 'right', position: { x: 500, y: 350 } });

      const contextMenu = page.getByTestId('context-menu');
      await expect(contextMenu).toBeVisible();

      // Click the Buffer entry.
      const bufferButton = contextMenu.getByText('Buffer');
      await bufferButton.click();

      // Wait for the data to tile.
      await waitForMapIdle(page);

      // Ensure the Layers Panel shows two entries.
      const layerEntries = page.getByTestId('layer-entry');
      await expect(layerEntries).toHaveCount(2);

      // Click the Remove Layer button for the upstream layer.
      const upstreamLayer = layerEntries.filter({ hasNotText: '(Buffers)' });
      upstreamLayer.getByTestId('remove-layer-button').click();

      // Confirm the Remove Layer dialog appears.
      const confirmRemoveLayerDialog = page.getByTestId(
        'confirm-remove-layer-dialog'
      );
      await expect(confirmRemoveLayerDialog).toBeVisible();

      // Click the Keep data button.
      await confirmRemoveLayerDialog
        .getByRole('button', {
          name: 'Keep data'
        })
        .click();

      // Ensure the buffered layer still exists.
      expect(layerEntries).toHaveCount(1);
    });
  });
});
