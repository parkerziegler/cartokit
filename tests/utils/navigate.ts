import { expect, type Page } from '@playwright/test';

/**
 * A helper function for Playwright tests that navigates to cartokit and waits
 * for the map to reach an idle state.
 *
 * @param page The Playwright {@link Page} instance.
 */
export async function openCartokit(page: Page) {
  // Navigate to cartokit, running on a local development server. The
  // playwright parameter exposes cartokit's map instance on window.__map.
  await page.goto('/?playwright=1');

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
}
