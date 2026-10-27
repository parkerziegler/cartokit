import { expect, test } from '@playwright/test';

import { waitForMapIdle } from '../utils/idle';
import { openCartokit } from '../utils/navigate';

test.describe('basic codegen', () => {
  test.beforeEach(async ({ page }) => {
    await openCartokit(page);

    // Open the Add Layer modal.
    await page.getByTestId('add-layer-button').click();
    await expect(page.getByTestId('add-layer-modal')).toBeVisible();

    // Select the From Gallery tab.
    await page.getByRole('tab', { name: 'From Gallery' }).click();

    // Select the Climate Impact Regions dataset. The modal closes automatically
    // once the MapLibre source finishes loading.
    await page.getByRole('button', { name: 'Climate Impact Regions' }).click();

    // Ensure the Add Layer modal is no longer visible.
    await expect(page.getByTestId('add-layer-modal')).not.toBeVisible({
      timeout: 10000
    });

    // Wait for the map to tile and render the data.
    await waitForMapIdle(page);
  });

  test('should generate code for a single-layer map', async ({ page }) => {
    await page.getByTestId('editor-toggle').click();

    await expect(page.getByTestId('program-editor')).toBeVisible();

    // Verify that map.addLayer is called in the generated code.
    const editor = page.getByTestId('program-editor');
    const code = await editor.textContent();
    expect(code).toContain('map.addLayer');
  });
});
