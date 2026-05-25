import { defineConfig, devices } from '@playwright/test';
import { loadEnvFiles, resolveTestEnv } from './tests/utils/env';
loadEnvFiles();

const htmlReportFolder = `playwright-report/playwright-report-${new Date().toISOString().replace(/:/g, '-')}`;

// Zephyr reporter - uploads only in CI for Regression runs, or when ZEPHYR_UPLOAD=true locally
const isCI = !!process.env.CI;
//Krishna : Change to regression once tag is addedd to all regression tests
const isRegression = process.argv.some(arg => arg.toLowerCase().includes('@regressionTest')); 
const zephyrEnabled = (isCI && isRegression) || process.env.ZEPHYR_UPLOAD === 'true';
const zephyrReporter: any[] = zephyrEnabled
  ? [['fis-playwright-zephyr', {
        host: 'https://jira-url',
        authorizationToken: process.env.ZEPHYR_AUTH_TOKEN,
        projectKey: 'Proj_Key',
  reportFolder: htmlReportFolder,
        testCycleName: `${process.env.ZEPHYR_TEST_CYCLE_NAME ?? 'Automated Playwright Run'} - ${new Date().toISOString()}`,
        //environment: process.env.ZEPHYR_ENVIRONMENT,
    }]]
  : [];

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    globalSetup: "fixtures/globalSetup.ts",
    //testDir: "./tests",
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 1 : 0,
    /* Opt out of parallel tests on CI. */
    //workers: process.env.CI ? 1 : 1,
    workers: process.env.CI ? 2 : 1,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
        
    reporter: [
      //[process.env.CI ? 'github' : 'list', { printSteps: true }],
      ['list', { printSteps: true }],
      ['html', { outputFolder: htmlReportFolder, open: 'never' }],
      ['json', {  outputFile: 'test-results/results.json' }],
      ['junit', { outputFile: 'test-results/junit-report.xml' }],
      ...zephyrReporter,
    ],


    timeout: 140000,
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
      /* Base URL to use in actions like `await page.goto('/')`. */
        // baseURL: process.env.BASE_URL,
        //headless: true,
        // to ignore ERR_CERT_AUTHORITY_INVALID error
        // ignoreHTTPSErrors: true,
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
        screenshot: 'on',
        actionTimeout: 40000,
        navigationTimeout: 50000,
        //video: 'on',
    },
  
    /* Configure projects for major browsers */
    projects: [
       {
      name: 'Consumer',
      testDir: "./tests/Consumer",
      use: {
        browserName: 'chromium',
        viewport: process.env.CI ? { width: 1920, height: 1080 } : null,
        launchOptions: {
          headless: !!process.env.CI,
          args: [
            ...(process.env.CI ? ['--window-size=1920,1080'] : ['--start-maximized']),
            '--disable-features=VizDisplayCompositor',
            '--disable-dev-shm-usage', // Overcome limited resource problems
            '--no-sandbox', // For CI environments
          ],
        },
      },
    },
    {
      name: 'OAO',
      testDir: "./tests/OAO",
      use: {
        browserName: 'chromium',
        viewport: process.env.CI ? { width: 1920, height: 1080 } : null,
        launchOptions: {
          headless: !!process.env.CI,
          args: [
            ...(process.env.CI ? ['--window-size=1920,1080'] : ['--start-maximized']),
            '--disable-features=VizDisplayCompositor',
            '--disable-dev-shm-usage', // Overcome limited resource problems
            '--no-sandbox', // For CI environments
          ],
        },
      },
    },
      //{
      //  name: 'msedge',
      //  use: { channel: 'msedge' }, // Use the Microsoft Edge channel
     // },
  
      // {
      //   name: 'firefox',
      //   use: { ...devices['Desktop Firefox'] },
      // },
  
      // {
      //   name: 'webkit',
      //   use: { ...devices['Desktop Safari'] },
      // },
  
      /* Test against mobile viewports. */
      // {
      //   name: 'Mobile Chrome',
      //   use: { ...devices['Pixel 5'] },
      // },
      // {
      //   name: 'Mobile Safari',
      //   use: { ...devices['iPhone 12'] },
      // },
  
      /* Test against branded browsers. */
      // {
      //   name: 'Microsoft Edge',
      //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
      // },
      // {
      //   name: 'Google Chrome',
      //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
      // },
    ],
  
    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://127.0.0.1:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
  
    expect: {
      // Maximum time expect() should wait for the condition to be met.
      timeout: 200000,
    },
  });
  
  
