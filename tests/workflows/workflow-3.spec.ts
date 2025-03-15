import { test, expect } from '@playwright/test';

import { registerConsoleListener } from '../utils/persist';

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
  // Mark workflow tests as slow.
  test.slow();

  // Register our console listener, which listens for recon performance metrics
  // printed to the console and saves them to a file.
  registerConsoleListener(page, 'workflow-3');

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

  // Increment the program counter.
  await page.evaluate(() => {
    window.programId = 'program-1';
  });

  // Open the Add Layer modal.
  await expect(page.getByTestId('add-layer-button')).toBeEnabled();
  await page.getByTestId('add-layer-button').click();
  await expect(page.getByTestId('add-layer-modal')).toBeVisible();

  // Add the API endpoint for the Winter Temperature Change GeoJSON file.
  await page
    .locator('#from-endpoint-input')
    .fill(
      'https://pub-7182966c1afe48d3949439f93d0d4223.r2.dev/wapo-winter-temperature-change.json'
    );

  // Specify the layer's Display Name.
  await page.getByLabel('Display Name').fill('Winter Temperature Change');

  // Add the layer.
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByTestId('add-layer-modal')).not.toBeVisible({
    timeout: 60000
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
  await page.evaluate(() => {
    window.programId = 'program-2';
  });

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.getByTestId('remove-stroke-button').click()
  ]);

  // Switch the layer's Layer Type to Choropleth.
  await page.evaluate(() => {
    window.programId = 'program-3';
  });

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.locator('#layer-type-select').selectOption('Choropleth')
  ]);

  // Set the layer's Attribute to 'decadal_rate'.
  await page.evaluate(() => {
    window.programId = 'program-4';
  });

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.locator('#fill-attribute-select').selectOption('decadal_rate')
  ]);

  // Set the layer's Method to Manual.
  await page.locator('#classification-method-select').selectOption('Manual');

  // Set the layer's Breaks to -0.5, 0, 0.5, 1.

  // Set the break to -0.5.
  await page.evaluate(() => {
    window.programId = 'program-5';
  });

  await page.getByTestId('breaks-editor').locator('input').first().fill('-0.5');

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.getByTestId('breaks-editor').locator('input').first().press('Enter')
  ]);

  // Set the break to 0.
  await page.evaluate(() => {
    window.programId = 'program-6';
  });

  await page.getByTestId('breaks-editor').locator('input').nth(1).fill('0');

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.getByTestId('breaks-editor').locator('input').nth(1).press('Enter')
  ]);

  // Set the break to 0.5.
  await page.evaluate(() => {
    window.programId = 'program-7';
  });

  await page.getByTestId('breaks-editor').locator('input').nth(2).fill('0.5');

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.getByTestId('breaks-editor').locator('input').nth(2).press('Enter')
  ]);

  // Set the break to 1.
  await page.evaluate(() => {
    window.programId = 'program-8';
  });

  await page.getByTestId('breaks-editor').locator('input').nth(3).fill('1');

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.getByTestId('breaks-editor').locator('input').nth(3).press('Enter')
  ]);

  // Set the layer's Color Scheme to RdYlBu.
  await page.evaluate(() => {
    window.programId = 'program-9';
  });

  await page.locator('#color-scheme').getByRole('button').click();

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.locator('li:nth-child(25)').getByRole('button').click()
  ]);

  // Reverse the layer's Color Scheme.
  await page.evaluate(() => {
    window.programId = 'program-10';
  });

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.getByTestId('color-scheme-reverse-button').click()
  ]);

  // Set the layer's fill-opacity to 100%.
  await page.evaluate(() => {
    window.programId = 'program-11';
  });

  await page.locator('#fill-opacity-input').fill('100');

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.locator('#fill-opacity-input').press('Enter')
  ]);
});
