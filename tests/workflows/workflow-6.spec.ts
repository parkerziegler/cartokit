import * as path from 'node:path';
import * as url from 'node:url';

import { test, expect } from '@playwright/test';

import { registerConsoleListener } from '../utils/persist';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Workflow 6. https://www.washingtonpost.com/climate-environment/interactive/2023/hot-cold-extreme-temperature-deaths/
 *
 * This workflow reproduces the central map published in "Will global warming
 * make temperature less deadly?" by Harry Stevens at The Washington Post. The
 * map comprises one GeoJSON layer:
 *
 * - Climate impact regions as demarcated by Carleton et al. (2022).
 * https://academic.oup.com/qje/article/137/4/2037/6571943
 */
test('workflow-6', async ({ page }) => {
  // Register our console listener, which listens for recon performance metrics
  // printed to the console and saves them to a file.
  registerConsoleListener(page, 'workflow-6');

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

  // Increment the program counter.
  await page.evaluate(() => {
    window.programId = 'program-1';
  });

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

  // Open the Add Layer modal.
  await expect(page.getByTestId('add-layer-button')).toBeEnabled();
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
  await page.getByRole('button', { name: 'Add' }).click();

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

  // Click on a page location that will trigger selection of the Climate Impact
  // Regions layer.
  await page.locator('#map').click({
    position: {
      x: 720,
      y: 450
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

  // Set the layer's Attribute to 'years_2080_2099'.
  await page.evaluate(() => {
    window.programId = 'program-4';
  });

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.locator('#fill-attribute-select').selectOption('years_2080_2099')
  ]);

  // Switch the layer's Color Scheme to PRGn.
  await page.evaluate(() => {
    window.programId = 'program-5';
  });

  await page.locator('#color-scheme').getByRole('button').click();

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.locator('li:nth-child(20)').getByRole('button').click()
  ]);

  // Reverse the color scheme.
  await page.evaluate(() => {
    window.programId = 'program-6';
  });

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.getByTestId('color-scheme-reverse-button').click()
  ]);

  // Set the layer's Steps to 8.
  await page.evaluate(() => {
    window.programId = 'program-7';
  });

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.locator('#color-steps-select').selectOption('8')
  ]);

  // Set the layer's Method to Manual.
  await page.locator('#classification-method-select').selectOption('Manual');

  // Set the layer's Breaks to -200, -100, -50, 0, 50, 100, 200.
  // Set layer break to -200.
  await page.evaluate(() => {
    window.programId = 'program-8';
  });

  await page.getByTestId('breaks-editor').locator('input').first().fill('-200');

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.getByTestId('breaks-editor').locator('input').first().press('Enter')
  ]);

  // Set layer break to -100.
  await page.evaluate(() => {
    window.programId = 'program-9';
  });

  await page.getByTestId('breaks-editor').locator('input').nth(1).fill('-100');

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.getByTestId('breaks-editor').locator('input').nth(1).press('Enter')
  ]);

  // Set layer break to -50.
  await page.evaluate(() => {
    window.programId = 'program-10';
  });

  await page.getByTestId('breaks-editor').locator('input').nth(2).fill('-50');

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.getByTestId('breaks-editor').locator('input').nth(2).press('Enter')
  ]);

  // Set layer break to 0.
  await page.evaluate(() => {
    window.programId = 'program-11';
  });

  await page.getByTestId('breaks-editor').locator('input').nth(3).fill('0');

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.getByTestId('breaks-editor').locator('input').nth(3).press('Enter')
  ]);

  // Set layer break to 50.
  await page.evaluate(() => {
    window.programId = 'program-12';
  });

  await page.getByTestId('breaks-editor').locator('input').nth(4).fill('50');

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.getByTestId('breaks-editor').locator('input').nth(4).press('Enter')
  ]);

  // Set layer break to 100.
  await page.evaluate(() => {
    window.programId = 'program-13';
  });

  await page.getByTestId('breaks-editor').locator('input').nth(5).fill('100');

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.getByTestId('breaks-editor').locator('input').nth(5).press('Enter')
  ]);

  // Set layer break to 200.
  await page.evaluate(() => {
    window.programId = 'program-14';
  });

  await page.getByTestId('breaks-editor').locator('input').nth(6).fill('200');

  await Promise.all([
    page.waitForEvent('console', {
      predicate: async (msg) =>
        (await msg.args()[0]?.jsonValue()) === 'recon-ttq'
    }),
    page.getByTestId('breaks-editor').locator('input').nth(6).press('Enter')
  ]);
});
