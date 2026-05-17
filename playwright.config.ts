import { defineConfig, devices } from '@playwright/test';
import { testConfig } from './src/config/config';

/**
 * Playwright configuration
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
export default defineConfig({
  testDir: './src/tests',
  outputDir: './test-results',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: testConfig.retries,
  workers: testConfig.workers,
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  use: {
    baseURL: testConfig.baseUrl,
    screenshot: testConfig.screenshot as any,
    video: testConfig.video as any,
    trace: testConfig.trace as any,
    actionTimeout: testConfig.timeout,
    navigationTimeout: testConfig.timeout,
  },

  webServer: {
    command: 'npm run start', // Change this if your app has a different start command
    url: testConfig.baseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },

    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
      },
    },
  ],
});
