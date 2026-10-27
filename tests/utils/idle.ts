import type { Page } from '@playwright/test';

/**
 * A helper function for Playwright tests that implements waiting for the
 * MapLibre GL JS map instance to fire its 'idle' event. This provides a more
 * deterministic guarantee that data has tiled as opposed to arbitrary timeouts.
 *
 * @param page The Playwright {@link Page} instance.
 */
export async function waitForMapIdle(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const map = window.__map!;

        map.once('idle', () => resolve());
        // Force a render, so idle fires even if the map is already idle.
        map.triggerRepaint();
      })
  );
}
