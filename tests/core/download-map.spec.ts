import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

import { test, expect } from '@playwright/test';

import packageJson from '../../package.json' with { type: 'json' };

test.describe('download-map', () => {
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

    // Add the API endpoint for the Climate Impact Regions GeoJSON file.
    await page
      .locator('#from-endpoint-input')
      .fill(
        'https://pub-7182966c1afe48d3949439f93d0d4223.r2.dev/wapo-climate-impact-regions.json'
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

    // Ensure that the Properties Panel is visible.
    await expect(page.locator('#properties')).toBeVisible();
  });

  test.afterEach(async () => {
    // Delete the map.ck.json file.
    // await fs.unlink(path.join(__dirname, 'map.ck.json'));
  });

  test('should download the map to a .ck.json file', async ({ page }) => {
    // Apply four diffs.
    await page.getByTestId('remove-stroke-button').click();

    // Switch the layer's type to Choropleth.
    await page.locator('#layer-type-select').selectOption('Choropleth');

    // Set the layer's Attribute to 'years_2080_2099'.
    await page
      .locator('#fill-attribute-select')
      .selectOption('years_2080_2099');

    // Switch the layer's Color Scheme to PRGn.
    await page.locator('#color-scheme').getByRole('button').click();
    await page.locator('li:nth-child(20)').getByRole('button').click();

    // Register the event listener for the download.
    const downloadPromise = page.waitForEvent('download');

    // Initiate download via clicks.
    await page.getByTestId('action-picker-button').click();
    await page.getByRole('button', { name: 'Download Map' }).click();

    // Wait for downloadPromise to resolve.
    const download = await downloadPromise;

    // Save the download to a file.
    await download.saveAs(path.join(__dirname, 'map.ck.json'));

    // Verify that the download matches the expected content.
    const content = await fs.readFile(
      path.join(__dirname, 'map.ck.json'),
      'utf-8'
    );

    const expectedContent = {
      cartokitVersion: packageJson.version,
      camera: {
        center: [-98.35, 39.5],
        zoom: 4
      },
      diffs: [
        {
          type: 'add-layer',
          layerId: 'climate-impact-regions__1',
          payload: {
            type: 'api',
            displayName: 'Climate Impact Regions',
            url: 'https://pub-7182966c1afe48d3949439f93d0d4223.r2.dev/wapo-climate-impact-regions.json'
          }
        },
        {
          type: 'remove-stroke',
          layerId: 'climate-impact-regions__1',
          payload: {}
        },
        {
          type: 'layer-type',
          layerId: 'climate-impact-regions__1',
          payload: { sourceLayerType: 'Polygon', targetLayerType: 'Choropleth' }
        },
        {
          type: 'fill-attribute',
          layerId: 'climate-impact-regions__1',
          payload: { attribute: 'years_2080_2099' }
        },
        {
          type: 'fill-color-scheme',
          layerId: 'climate-impact-regions__1',
          payload: { scheme: 'schemePRGn' }
        }
      ]
    };

    expect(JSON.stringify(JSON.parse(content), null, 2)).toEqual(
      JSON.stringify(expectedContent, null, 2)
    );
  });
});
