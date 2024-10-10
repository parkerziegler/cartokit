import * as fs from 'node:fs';
import * as path from 'node:path';
import * as stream from 'node:stream';
import * as url from 'node:url';
import * as zlib from 'node:zlib';

import { test, expect } from '@playwright/test';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

test.beforeAll(() => {
  // Unzip the Winter Temperature Change GeoJSON file.
  const unzip = zlib.createUnzip();
  const input = fs.createReadStream(
    path.join(
      __dirname,
      '../data/workflow-3/wapo-winter-temperature-change.json.gz'
    )
  );
  const output = fs.createWriteStream(
    path.join(
      __dirname,
      '../data/workflow-3/wapo-winter-temperature-change.json'
    )
  );

  stream.pipeline(input, unzip, output, (error) => {
    if (error) {
      throw error;
    }
  });
});

test.afterAll(() => {
  if (
    fs.existsSync(
      path.join(
        __dirname,
        '../data/workflow-3/wapo-winter-temperature-change.json'
      )
    )
  ) {
    fs.rm(
      path.join(
        __dirname,
        '../data/workflow-3/wapo-winter-temperature-change.json'
      ),
      (error) => {
        if (error) {
          throw error;
        }
      }
    );
  }
});

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
  // Identify the playwright test for application code.
  await page.addInitScript(() => {
    (
      window as unknown as Window & { playwrightWorkflowId: string }
    ).playwrightWorkflowId = 'workflow-3';
  });

  // Mark workflow tests as slow.
  test.setTimeout(150000);

  // Navigate to cartokit, running on a local development server.
  await page.goto('/');

  if (process.env.GITHUB_ENV === 'Preview') {
    // In Preview Vercel environments, ensure <vercel-live-feedback> does not
    // intercept pointer events.
    await page.locator('vercel-live-feedback').waitFor({ state: 'attached' });
    await page.locator('vercel-live-feedback').evaluate((element) => {
      element.style.pointerEvents = 'none';
      element.style.zIndex = '-1';
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

  // Click the Open Editor button.
  await page.getByTestId('editor-toggle').click();

  // Ensure the Editor Panel is visible.
  await expect(page.getByTestId('program-editor')).toBeVisible();

  // Pan and zoom the map to the Bay Area to reduce future rendering time when
  // MapLibre generates tiles on the fly.
  await page.locator('#map').click({
    position: {
      x: 640,
      y: 360
    }
  });
  await page.mouse.down();
  await page.mouse.move(1175, 312.5);
  await page.mouse.up();

  for (let i = 0; i < 4; i++) {
    await page.locator('#map').click({
      position: {
        x: 640,
        y: 360
      }
    });
    await page.mouse.wheel(0, -1200);
  }

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
    timeout: 30000
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
      x: 700,
      y: 200
    }
  });

  // Ensure that the Properties Panel is visible.
  await expect(page.locator('#properties')).toBeVisible();

  // Remove the layer's stroke.
  await page.getByTestId('remove-stroke-button').click();

  // Switch the layer's Layer Type to Choropleth.
  await page.locator('#layer-type-select').selectOption('Choropleth');

  // Set the layer's Attribute to 'decadal_rate'.
  await page.locator('#fill-attribute-select').selectOption('decadal_rate');

  // Set the layer's Method to Manual.
  await page.locator('#classification-method-select').selectOption('Manual');

  // Set the layer's Breaks to -0.5, 0, 0.5, 1.
  await page.getByTestId('breaks-editor').locator('input').first().fill('-0.5');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .first()
    .press('Enter');
  await page.getByTestId('breaks-editor').locator('input').nth(1).fill('0');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(1)
    .press('Enter');
  await page.getByTestId('breaks-editor').locator('input').nth(2).fill('0.5');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(2)
    .press('Enter');
  await page.getByTestId('breaks-editor').locator('input').nth(3).fill('1');
  await page
    .getByTestId('breaks-editor')
    .locator('input')
    .nth(3)
    .press('Enter');

  // Set the layer's Color Scheme to RdYlBu.
  await page.locator('#color-scheme').getByRole('button').click();
  await page.locator('li:nth-child(25)').getByRole('button').click();

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
