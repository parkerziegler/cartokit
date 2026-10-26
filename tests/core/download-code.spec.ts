import { spawn, type ChildProcess } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as net from 'node:net';
import * as os from 'node:os';
import * as path from 'node:path';
import * as url from 'node:url';

import { test, expect, type Browser, type Page } from '@playwright/test';
import { unzipSync } from 'fflate';
import type { Map } from 'maplibre-gl';

declare global {
  interface Window {
    __map?: Map;
  }
}

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// Selector for the main map canvas. We use a more specific selector to avoid
// capturing basemap thumbnails in this selector.
const MAP_CANVAS_SELECTOR = '#map > .maplibregl-canvas-container > canvas';

// The maximum number of synchronous redraws to perform while waiting for two
// consecutive, identical captures of the map canvas.
const MAX_REDRAWS = 4;

// Hide everything but the map canvas during screenshots, so neither the
// cartokit GUI nor map controls (e.g., attribution) are captured.
const CANVAS_ONLY_STYLE = `
  body * { visibility: hidden !important; }
  ${MAP_CANVAS_SELECTOR} { visibility: visible !important; }
`;

/**
 * Screenshot the MapLibre canvas once the map has fully rendered.
 *
 * We wait for MapLibre's idle event, then capture after synchronous redraws
 * until two consecutive captures are identical. Without the redraws, WebKit
 * can composite a frame that is still being drawn, missing whole tiles.
 *
 * @param page The Playwright {@link Page} instance, with window.__map set.
 * @returns A PNG {@link Buffer} of the map canvas.
 */
async function screenshotMap(page: Page): Promise<Buffer> {
  await page.waitForFunction(() => window.__map !== undefined);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const map = window.__map!;

        map.once('idle', () => resolve());
        // Force a render, so idle fires even if the map is already idle.
        map.triggerRepaint();
      })
  );

  const canvas = page.locator(MAP_CANVAS_SELECTOR);
  let previous: Buffer | undefined;

  for (let i = 0; i < MAX_REDRAWS; i++) {
    await page.evaluate(() => {
      window.__map!.redraw();
    });

    const current = await canvas.screenshot({ style: CANVAS_ONLY_STYLE });

    if (previous?.equals(current)) {
      return current;
    }

    previous = current;
  }

  throw new Error(`Map canvas did not settle after ${MAX_REDRAWS} redraws.`);
}

/**
 * Find an open port on localhost.
 *
 * @returns A Promise resolving to an open port number.
 */
function getOpenPort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', reject);
    // Specify port as 0, allowing the OS to assign an arbitrary, unused port.
    server.listen(0, () => {
      const { port } = server.address() as net.AddressInfo;
      server.close(() => resolve(port));
    });
  });
}

/**
 * Run a command to completion, rejecting on a non-zero exit code.
 *
 * @param command The command to run.
 * @param args The arguments to pass to the command.
 * @param cwd The working directory in which to run the command.
 */
function run(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit' });

    child.once('error', reject);
    child.once('exit', (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} ${args.join(' ')} exited with ${code}.`))
    );
  });
}

/**
 * Poll a URL until it responds successfully.
 *
 * @param href The URL to poll.
 */
async function waitForServer(href: string): Promise<void> {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    try {
      if ((await fetch(href)).ok) {
        return;
      }
    } catch {
      // The server isn't accepting connections yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Server at ${href} did not start within 30 seconds.`);
}

test.describe('download-code', () => {
  let projectDir: string | undefined;
  let devServer: ChildProcess | undefined;

  test.afterEach(async () => {
    devServer?.kill();
    devServer = undefined;

    if (projectDir) {
      await fs.rm(projectDir, { recursive: true, force: true });
      projectDir = undefined;
    }
  });

  /**
   * Navigate to cartokit and wait for the map to reach an idle state.
   *
   * @param page The Playwright {@link Page} instance.
   */
  async function openCartokit(page: Page): Promise<void> {
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

  /**
   * Add a layer from a local file and open its Properties Panel.
   *
   * @param page The Playwright {@link Page} instance.
   * @param filePath The path to the file, relative to tests/data.
   * @param displayName The layer's Display Name.
   */
  async function addLayerFromFile(
    page: Page,
    filePath: string,
    displayName: string
  ): Promise<void> {
    await page.getByTestId('add-layer-button').click();
    await expect(page.getByTestId('add-layer-modal')).toBeVisible();

    await page.getByRole('tab', { name: 'From File' }).click();

    await page
      .locator('#from-file-input')
      .setInputFiles(path.join(__dirname, '../data', filePath));

    await page.getByLabel('Display Name').fill(displayName);

    await page
      .getByTestId('add-layer-modal')
      .getByRole('button', { name: 'Add' })
      .click();

    await page.getByTestId('loading-indicator').waitFor({ state: 'hidden' });
    await expect(page.getByTestId('add-layer-modal')).not.toBeVisible();

    await page.getByTestId('layer-entry').first().click();
    await expect(page.locator('#properties')).toBeVisible();
  }

  /**
   * Export cartokit's map as a Vite project, run it, and screenshot its map.
   *
   * @param browser The Playwright {@link Browser} instance.
   * @param page The Playwright {@link Page} instance running cartokit.
   * @returns A PNG {@link Buffer} of the generated app's map canvas.
   */
  async function screenshotExportedMap(
    browser: Browser,
    page: Page
  ): Promise<Buffer> {
    // Open the Editor Panel and export the Vite project.
    await page.getByTestId('editor-toggle').click();
    await expect(page.getByTestId('program-editor')).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export to Vite' }).click();
    const download = await downloadPromise;

    // Extract the project to a temporary directory.
    projectDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cartokit-'));
    const zipPath = path.join(projectDir, 'cartokit-project.zip');
    await download.saveAs(zipPath);

    for (const [entry, bytes] of Object.entries(
      unzipSync(await fs.readFile(zipPath))
    )) {
      const filePath = path.join(projectDir, entry);

      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, bytes);
    }

    const appDir = path.join(projectDir, 'cartokit-project');

    // Install dependencies and start the Vite dev server.
    await run('pnpm', ['install'], appDir);

    const port = await getOpenPort();
    const appUrl = `http://localhost:${port}/`;

    devServer = spawn(
      path.join(appDir, 'node_modules', '.bin', 'vite'),
      ['--port', port.toString(), '--strictPort'],
      { cwd: appDir, stdio: 'inherit' }
    );
    await waitForServer(appUrl);

    // Render the generated app at the same viewport size and pixel density as
    // cartokit, so both canvases share dimensions and framing.
    const appPage = await browser.newPage({
      viewport: page.viewportSize(),
      deviceScaleFactor: await page.evaluate(() => window.devicePixelRatio)
    });

    // Expose the generated app's map instance by appending an assignment to its
    // entry module as it's served.
    await appPage.route('**/src/index.{js,ts}', async (route) => {
      const response = await route.fetch();

      await route.fulfill({
        response,
        body: `${await response.text()}\nwindow.__map = map;`
      });
    });

    // Collect the IDs of all sources on cartokit's map, removing the suffix
    // from cartokit-only Dot Density outline sources.
    const sourceIds = await page.evaluate(() =>
      Object.keys(window.__map!.getStyle().sources).map((id) =>
        id.replace(/-outlines$/, '')
      )
    );

    try {
      await appPage.goto(appUrl);

      // Wait for the generated app to add every source. Sources loaded
      // asynchronously (e.g., GeoParquet queried with DuckDB) may be added
      // after the map first reaches an idle state.
      await appPage.waitForFunction(
        (ids) => ids.every((id) => window.__map?.getSource(id)),
        sourceIds
      );

      return await screenshotMap(appPage);
    } finally {
      await appPage.close();
    }
  }

  test('should export a Vite project that renders the same map as cartokit', async ({
    browser,
    page
  }) => {
    // Building the map, installing dependencies, and waiting for both maps to
    // settle takes considerably longer than the default timeout.
    test.setTimeout(240_000);

    await openCartokit(page);

    // Build the map from Workflow 6.
    await addLayerFromFile(
      page,
      'workflow-6/wapo-climate-impact-regions.json',
      'Climate Impact Regions'
    );

    await page.getByTestId('remove-stroke-button').click();
    await page.locator('#layer-type-select').selectOption('Choropleth');
    await page
      .locator('#fill-attribute-select')
      .selectOption('years_2080_2099');

    await page.locator('#color-scheme').getByRole('button').click();
    await page.locator('li:nth-child(20)').getByRole('button').click();
    await page.getByTestId('color-scheme-reverse-button').click();

    await page.locator('#fill-step-count-select').selectOption('8');
    await page
      .locator('#fill-classification-method-select')
      .selectOption('Manual');

    const stops = [-200, -100, -50, 0, 50, 100, 200];

    for (const [i, stop] of stops.entries()) {
      const input = page
        .getByTestId('breaks-editor')
        .locator('input:last-child')
        .nth(i);

      await input.fill(stop.toString());
      await input.press('Enter');
    }

    await page.getByTestId('close-properties-menu-button').click();
    await expect(page.locator('#properties')).not.toBeVisible();

    // Screenshot the map as rendered by cartokit, absent UI controls.
    const expected = await screenshotMap(page);
    const actual = await screenshotExportedMap(browser, page);

    expect(
      actual.equals(expected),
      'Generated map should match cartokit pixel-for-pixel'
    ).toBe(true);
  });

  test('should export a Vite project that renders the same GeoParquet map as cartokit', async ({
    browser,
    page
  }) => {
    // Building the map, installing dependencies, and waiting for both maps to
    // settle takes considerably longer than the default timeout.
    test.setTimeout(240_000);

    await openCartokit(page);

    // Build a proportional symbol map of earthquakes, sized by magnitude.
    await addLayerFromFile(page, 'all/earthquakes.parquet', 'Earthquakes');

    await page
      .locator('#layer-type-select')
      .selectOption('Proportional Symbol');
    await page.locator('#size-attribute-select').selectOption('mag');

    for (const [id, size] of [
      ['min', 2],
      ['max', 16]
    ] as const) {
      const input = page.locator(`#${id}`);

      await input.fill(size.toString());
      await input.press('Enter');
    }

    await page.getByTestId('close-properties-menu-button').click();
    await expect(page.locator('#properties')).not.toBeVisible();

    // Screenshot the map as rendered by cartokit, absent UI controls.
    const expected = await screenshotMap(page);
    const actual = await screenshotExportedMap(browser, page);

    expect(
      actual.equals(expected),
      'Generated map should match cartokit pixel-for-pixel'
    ).toBe(true);
  });
});
