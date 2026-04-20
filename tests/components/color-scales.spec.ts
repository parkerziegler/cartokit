import { test, expect } from '@playwright/test';
import * as d3 from 'd3';

test.describe('color scales', () => {
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

    // Wait for the Open Editor button and Add Layer button to become enabled.
    // These are proxies for the map reaching an idle state.
    await expect(page.getByTestId('editor-toggle')).toBeEnabled({
      timeout: 10000
    });
    await expect(page.getByTestId('add-layer-button')).toBeEnabled({
      timeout: 10000
    });

    // Open the Add Layer modal.
    await page.getByTestId('add-layer-button').click();
    await expect(page.getByTestId('add-layer-modal')).toBeVisible();

    // Select the From Gallery tab.
    await page.getByRole('button', { name: 'From Gallery' }).click();

    // Select the Climate Impact Regions dataset. The modal closes automatically
    // once the MapLibre source finishes loading.
    await page.getByRole('button', { name: 'Climate Impact Regions' }).click();

    // Ensure the Add Layer modal is no longer visible.
    await expect(page.getByTestId('add-layer-modal')).not.toBeVisible();

    // Wait for MapLibre to render the Climate Impact Regions layer.
    //
    // Tiles are generated on the fly by MapLibre, so we need to wait for them
    // to load. In theory, we'd like to hook into MapLibre's event system to
    // determine when the map is idle; however, we don't want to attach the map
    // instance to the global window object just for the sake of testing.
    await page.waitForTimeout(5000);

    // Click on the layer entry in the Layers Panel.
    await page.getByTestId('layer-entry').first().click();

    // Ensure the Properties Panel is visible.
    await expect(page.locator('#properties')).toBeVisible();

    // Remove the layer's stroke.
    await page.getByTestId('remove-stroke-button').click();

    // Switch the layer's type to Choropleth.
    await page.locator('#layer-type-select').selectOption('Choropleth');

    // Set the layer's Attribute to 'years_2080_2099'.
    await page
      .locator('#fill-attribute-select')
      .selectOption('years_2080_2099');
  });

  test('supports the Quantile classification method', async ({ page }) => {
    // Quantile is the default method; verify it is selected.
    await expect(
      page.locator('#fill-classification-method-select')
    ).toHaveValue('Quantile');

    const quantiles = [-1528.88, -77.05, 4, 25.89, 71.08, 608.88];

    // Assert values in the Legend.
    for (const quantile of quantiles) {
      await expect(page.getByTestId('choropleth-legend')).toContainText(
        quantile.toString()
      );
    }
  });

  test('supports the Equal Interval classification method', async ({
    page
  }) => {
    await page
      .locator('#fill-classification-method-select')
      .selectOption('Equal Interval');

    await expect(
      page.locator('#fill-classification-method-select')
    ).toHaveValue('Equal Interval');

    const intervals = [-1528.88, -1101.33, -673.78, -246.22, 181.33, 608.88];

    // Assert values in the Legend.
    for (const interval of intervals) {
      await expect(page.getByTestId('choropleth-legend')).toContainText(
        interval.toString()
      );
    }
  });

  test('supports the Jenks classification method', async ({ page }) => {
    await page
      .locator('#fill-classification-method-select')
      .selectOption('Jenks');

    await expect(
      page.locator('#fill-classification-method-select')
    ).toHaveValue('Jenks');

    const breaks = [-1528.88, -653.58, -256.85, -40.91, 146.09, 608.88];

    // Assert values in the Legend.
    for (const brk of breaks) {
      await expect(page.getByTestId('choropleth-legend')).toContainText(
        brk.toString()
      );
    }
  });

  test('supports the Manual classification method with custom breaks', async ({
    page
  }) => {
    await page
      .locator('#fill-classification-method-select')
      .selectOption('Manual');

    // Verify the breaks editor dialog is visible.
    await expect(page.getByTestId('breaks-editor')).toBeVisible();

    // Set custom breaks.
    const stops = [-400, -200, 0, 200];
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

    // Assert values in the Legend.
    for (const stop of stops) {
      await expect(page.getByTestId('choropleth-legend')).toContainText(
        stop.toString()
      );
    }

    // Verify the breaks editor is still visible after updating breaks.
    await expect(page.getByTestId('breaks-editor')).toBeVisible();
  });

  test('supports changing the step count', async ({ page }) => {
    // Increase the step count to 9.
    await page.locator('#fill-step-count-select').selectOption('9');

    await expect(page.locator('#fill-step-count-select')).toHaveValue('9');

    // Assert values in the Legend.
    const deciles = [
      -1528.88, -148.83, -60.8, -7.48, 8.89, 21.08, 33.83, 62.79, 105.7, 608.88
    ];

    for (const decile of deciles) {
      await expect(page.getByTestId('choropleth-legend')).toContainText(
        decile.toString()
      );
    }

    // Decrease the step count to 3.
    await page.locator('#fill-step-count-select').selectOption('3');

    await expect(page.locator('#fill-step-count-select')).toHaveValue('3');

    // Assert values in the Legend.
    const terciles = [-1528.88, -7.48, 33.83, 608.88];

    for (const tercile of terciles) {
      await expect(page.getByTestId('choropleth-legend')).toContainText(
        tercile.toString()
      );
    }
  });

  test('supports changing the color scheme', async ({ page }) => {
    // Switch the color scheme to BrBG (li:nth-child(19)).
    await page.locator('#color-scheme').getByRole('button').click();
    await page.locator('li:nth-child(19)').getByRole('button').click();

    // Assert a particular color for the first rectangle in the Legend.
    let firstRect = page
      .getByTestId('choropleth-legend')
      .locator('rect')
      .first();
    await expect(firstRect).toHaveAttribute('fill', d3.schemeBrBG[5][0]);

    // Switch the color scheme to Spectral (li:nth-child(27)).
    await page.locator('#color-scheme').getByRole('button').click();
    await page.locator('li:nth-child(27)').getByRole('button').click();

    // Assert a particular color for the first rectangle in the Legend.
    firstRect = page.getByTestId('choropleth-legend').locator('rect').first();
    await expect(firstRect).toHaveAttribute('fill', d3.schemeSpectral[5][0]);
  });

  test('supports reversing the color scheme direction', async ({ page }) => {
    // Reverse the default (Forward) color scheme.
    await page.getByTestId('color-scheme-reverse-button').click();

    // Assert a particular color for the first rectangle in the Legend.
    let firstRect = page
      .getByTestId('choropleth-legend')
      .locator('rect')
      .first();
    await expect(firstRect).toHaveAttribute('fill', d3.schemeOranges[5][4]);

    // Reverse it back to Forward.
    await page.getByTestId('color-scheme-reverse-button').click();

    // Assert a particular color for the first rectangle in the Legend.
    firstRect = page.getByTestId('choropleth-legend').locator('rect').first();
    await expect(firstRect).toHaveAttribute('fill', d3.schemeOranges[5][0]);
  });

  test('supports changing from Continuous to Quantile', async ({ page }) => {
    // Switch to Continuous first.
    await page.locator('#fill-classification-method-select').selectOption('Continuous');
    await expect(page.locator('#fill-classification-method-select')).toHaveValue('Continuous');

    // Switch back to Quantile.
    await page.locator('#fill-classification-method-select').selectOption('Quantile');
    await expect(page.locator('#fill-classification-method-select')).toHaveValue('Quantile');

    const quantiles = [-1528.88, -77.05, 4, 25.89, 71.08, 608.88];

    // Assert values in the legend.
    for (const quantile of quantiles) {
      await expect(page.getByTestId('choropleth-legend')).toContainText(
        quantile.toString()
      );
    }
  });

test('supports changing from Quantile to Continuous', async ({ page }) => {
  // Switch to Quantile first.
    await page.locator('#fill-classification-method-select').selectOption('Quantile');
    await expect(page.locator('#fill-classification-method-select')).toHaveValue('Quantile');

    // Switch back to Continuous.
    await page.locator('#fill-classification-method-select').selectOption('Continuous');
    await expect(page.locator('#fill-classification-method-select')).toHaveValue('Continuous');

    // Assert values in the legend.
    await expect(page.getByTestId('choropleth-legend')).toContainText('-1528.88');
    await expect(page.getByTestId('choropleth-legend')).toContainText('608.88');

    // No intermediate values.
    await expect(page.getByTestId('choropleth-legend')).not.toContainText('25.89');
  });

});
