import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Enable 2 retries per test. */
  retries: 2,
  /* Serialize execution of tests. */
  workers: 1,
  /* Use line reporter to ensure process termination. */
  reporter: 'line',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: 'http://localhost:5173/',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    video: 'on'
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        launchOptions: {
          args: [
            '--use-gl=swiftshader', // Fallback to software rendering for Docker.
            '--enable-features=Vulkan',
            '--enable-unsafe-swiftshader'
          ]
        }
      }
    }
  ],
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173/',
    reuseExistingServer: !process.env.CI
  }
});
