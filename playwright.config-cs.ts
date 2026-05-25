import { defineConfig, devices } from '@playwright/test';

// Get environment variables with defaults
const testEnv = process.env.test_env || process.env.TEST_ENV || 'qa';
const testProject = process.env.TEST_PROJECT || process.env.PROJECT || 'Proj1';

console.log(`🎯 Running tests with Environment: ${testEnv.toUpperCase()}, Project: ${testProject}`);
/**
 * See https://playwright.dev/docs/test-configuration.
 */

const startLocalHost = process.env.URL && process.env.URL.includes('localhost');

export default defineConfig({
  //globalSetup: "utils/globalSetup.ts",
  globalSetup: require.resolve('.//utils//globalSetup.ts'),
  //testDir: "./src/test",
  //testMatch: ['**/*.spec.ts'],
  
  timeout: 120000, // Global test timeout (2 minutes)
  expect: {
    timeout: 90000, // Timeout for expect() assertions (10 seconds)
  },

  /* Run tests in files in parallel if flag is true*/
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI, 
   //forbidOnly: false,  To allow test.only in CI
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  /*Increase global timeout*/
  //timeout: 60_000,
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [
    // ["github"],  // GitHub Actions reporter disabled to hide annotations
    ["list", { printSteps: true }],
    ["blob", { outputDir: 'playwright-blob-report' }],  // Binary report for merging results
    ["html", { open: 'never' }],  // Generate HTML report but don't open automatically in CI
    ["junit", { outputFile: 'junit-test-report.xml' }],  // JUnit XML for BrowserStack Test Observability
  ] : [
    ["list", { printSteps: true }],
    ["html"],  // Generates an HTML report and opens it automatically locally
    ["junit", { outputFile: 'junit-test-report.xml' }],  // JUnit XML for BrowserStack Test Observability (local)
    //["allure-playwright"],
  ],
   
  
    }]*/
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry', //other Options: 'on'
    // to ignore ERR_CERT_AUTHORITY_INVALID error
    ignoreHTTPSErrors: true,
    // only if the screenshot fails
    screenshot: 'only-on-failure', //other Options: 'only-on-failure'
    //headless mode
    // headless: false,
    video : 'retain-on-failure', //other Options: 'retain-on-failure', 'off'
    
    actionTimeout: 30000, // Timeout for each action like click, fill, etc.
    navigationTimeout: 60000, // Timeout for navigation actions (increased for slow loading pages)


  },
  
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'proj1',
      testDir: "./src/proj1/test",
      use: {
        browserName: 'chromium',
        launchOptions: {
          //headless: false,
          args: [
            '--start-maximized',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-dev-shm-usage', // Overcome limited resource problems
            '--no-sandbox', // For CI environments
          ],
        },
      },
    },
   /* {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'],
        launchOptions: {  
          args: ['--start-maximized'], 
        }
      },       
    }, */
         
    /* Smoke test project */
  // {
  //    name: 'smoke',
  //    testDir: './tests',
   //   grep: /@smoke/, // Filter tests tagged with @smoke
    //},
 
  
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
    ...(startLocalHost && {
    webServer: {
      command: 'cd ~/repos/ui && npm start ui-server',
      port: 9002,
      timeout: 60 * 1000,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  }),
});
