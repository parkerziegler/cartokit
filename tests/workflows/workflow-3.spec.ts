import { test, expect } from '@playwright/test';

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
  await page
    .getByTestId('add-layer-modal')
    .getByRole('button', { name: 'Add' })
    .click();
  await expect(page.getByTestId('add-layer-modal')).not.toBeVisible({
    timeout: 90000 // Wait for data to load and tile on the client.
  });

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
  await page
    .locator('#fill-classification-method-select')
    .selectOption('Manual');

  // Set the layer's Breaks to -0.5, 0, 0.5, 1.
  const stops = [-0.5, 0, 0.5, 1];
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
