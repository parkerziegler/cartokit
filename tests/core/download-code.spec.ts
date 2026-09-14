import { spawn, type ChildProcess } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as net from 'node:net';
import * as os from 'node:os';
import * as path from 'node:path';
import * as url from 'node:url';

import { test, expect, type Page } from '@playwright/test';
import { unzipSync } from 'fflate';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// Selector for the main map canvas. We use a more specific selector to avoid
// capturing basemap thumbnails in this selector.
const MAP_CANVAS_SELECTOR = '#map > .maplibregl-canvas-container > canvas';

// Hide everything but the map canvas during screenshots, so neither the
// cartokit GUI nor map controls (e.g., attribution) are captured.
const CANVAS_ONLY_STYLE = `
  body * { visibility: hidden !important; }
  ${MAP_CANVAS_SELECTOR} { visibility: visible !important; }
`;

/**
 * Screenshot the MapLibre canvas once it stops changing between consecutive
 * captures.
 *
 * @param page The Playwright {@link Page} instance.
 * @returns A PNG {@link Buffer} of the settled map canvas.
 */
async function screenshotSettledCanvas(page: Page): Promise<Buffer> {
  const canvas = page.locator(MAP_CANVAS_SELECTOR);
  const deadline = performance.now() + 30_000;
  let previous: Buffer | undefined;

  while (performance.now() < deadline) {
    const current = await canvas.screenshot({ style: CANVAS_ONLY_STYLE });

    if (previous?.equals(current)) {
      return current;
    }

    previous = current;
    await page.waitForTimeout(2000);
  }

  throw new Error('Map canvas did not settle within 30 seconds.');
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

  test('should export a Vite project that renders the same map as cartokit', async ({
    browser,
    page
  }, testInfo) => {
    // Building the map, installing dependencies, and waiting for both maps to
    // settle takes considerably longer than the default timeout.
    test.setTimeout(240_000);

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

    // Build the map from Workflow 6.
    await page.getByTestId('add-layer-button').click();
    await expect(page.getByTestId('add-layer-modal')).toBeVisible();

    await page.getByRole('tab', { name: 'From File' }).click();

    await page
      .locator('#from-file-input')
      .setInputFiles(
        path.join(
          __dirname,
          '../data/workflow-6/wapo-climate-impact-regions.json'
        )
      );

    await page.getByLabel('Display Name').fill('Climate Impact Regions');

    await page
      .getByTestId('add-layer-modal')
      .getByRole('button', { name: 'Add' })
      .click();

    await page.getByTestId('loading-indicator').waitFor({ state: 'hidden' });
    await expect(page.getByTestId('add-layer-modal')).not.toBeVisible();

    await page.getByTestId('layer-entry').first().click();
    await expect(page.locator('#properties')).toBeVisible();

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

    // Screenshot the map as rendered by cartokit.
    const expected = await screenshotSettledCanvas(page);

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

    try {
      await appPage.goto(appUrl);
      const actual = await screenshotSettledCanvas(appPage);

      await testInfo.attach('cartokit', {
        body: expected,
        contentType: 'image/png'
      });
      await testInfo.attach('generated', {
        body: actual,
        contentType: 'image/png'
      });

      expect(
        actual.equals(expected),
        'Generated map should match cartokit pixel-for-pixel'
      ).toBe(true);
    } finally {
      await appPage.close();
    }
  });
});
