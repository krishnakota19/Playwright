#Playwright Test Automation Framework

## Complete Documentation Guide

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure Overview](#3-project-structure-overview)
4. [Architecture & Design Patterns](#4-architecture--design-patterns)
5. [Detailed Folder Breakdown](#5-detailed-folder-breakdown)
6. [Configuration Files](#6-configuration-files)
7. [Fixtures – The Heart of the Framework](#7-fixtures--the-heart-of-the-framework)
8. [Page Object Model (POM)](#8-page-object-model-pom)
9. [Business Functions Layer](#9-business-functions-layer)
10. [Writing Test Cases](#10-writing-test-cases)
11. [Utility Functions](#11-utility-functions)
12. [Reporting & Screenshots](#12-reporting--screenshots)
13. [Test Data Management](#13-test-data-management)
14. [Credential & Secret Management (Vault)](#14-credential--secret-management-vault)
15. [Environment Configuration](#15-environment-configuration)
16. [Running Tests](#16-running-tests)
17. [CI/CD Integration](#17-cicd-integration)
18. [BrowserStack Integration](#18-browserstack-integration)
19. [AI Failure Analyzer](#19-ai-failure-analyzer)
20. [Zephyr Test Management Integration](#20-zephyr-test-management-integration)
21. [Docker Support](#21-docker-support)
22. [Best Practices & Conventions](#22-best-practices--conventions)
23. [Troubleshooting](#23-troubleshooting)
24. [Glossary](#24-glossary)

---

## 1. Introduction

This is an **end-to-end (E2E) test automation framework** built with **Microsoft Playwright** and **TypeScript** for testing the **Online Banking (OLB) Application**. The current active scope is **Consumer OLB** and **OAO (Online Account Opening)** personas. All legacy modules (`d1_Banker`, `d1_Teller`, `d1_BAO`) have been removed for a streamlined, consumer-first focus.


#### Major Updates (March 2026)

- **Test data management:** Environment-specific test data files (`testData.sit.json`, `testData.qa.json`) are loaded dynamically via a helper in `globalSetup.ts`.
- **Fixtures:** Fixtures now cache Vault credentials to avoid token exhaustion and improve parallel test reliability.
- **AI Failure Analyzer:** New tool (`ai-failure-analyzer.ts`) for root-cause analysis, HTML report, and email summary. Integrated into CI via `ai-failure-analysis.yml`.
- **BrowserStack Upload:** Automated JUnit upload to BrowserStack via `browserstack-upload.ts` and CI workflow (`upload-browserstack-results.yml`).
- **Zephyr Integration:** Patched `playwright-zephyr` reporter uploads regression results to Jira/Zephyr. Patch maintained under `patches/`.
- **Email Notifications:** CI sends summary emails with test results, AI analysis, and BrowserStack links using `panda-github-native-notification-action`.
- **Report ZIP Utility:** Utility (`generate-playwright-report-zip.ts`) to package HTML reports as ZIPs for sharing.
- **Docker Support:** `Dockerfile-sample` for containerized execution.
- **CI/CD:** Multiple GitHub Actions workflows for test execution, parsing, AI analysis, BrowserStack upload, and notifications.
- **Patches:** Custom patch for Zephyr reporter in `patches/`.
- **Best Practices:** Emphasize use of tags, environment configs, and parallel-safe patterns throughout the framework.

### What does this framework do?

- Automates UI testing of the Bank web applications
- Supports **Smoke**, **Sanity**, and **Regression** test suites
- Runs across multiple environments (SIT, QA, UAT)
- Integrates with **BrowserStack** for cross-browser/device testing
- Includes **CI/CD pipelines** via GitHub Actions
- Provides rich **HTML reports** with screenshots at each step
- Generates **JUnit XML** and optionally uploads results to **Zephyr** and **BrowserStack**
- Includes **AI-powered failure analysis** with root-cause categorization
- Sends **email notifications** with test summary and failure details
- Manages sensitive credentials via **HashiCorp Vault**

---

## 2. Technology Stack

| Technology              | Purpose                                      |
|-------------------------|----------------------------------------------|
| **Playwright**          | Browser automation & testing framework       |
| **TypeScript**          | Programming language (type-safe JavaScript)  |
| **Node.js**             | Runtime environment                          |
| **ESLint**              | Code linting & style enforcement             |
| **dotenv**              | Environment variable management              |
| **async-mutex**         | Thread-safe operations for parallel tests    |
| **axe-core/playwright** | Accessibility (a11y) testing                 |
| **HashiCorp Vault**     | Secure credential/secret management          |
| **BrowserStack**        | Cloud-based cross-browser testing            |
| **GitHub Actions**      | CI/CD pipeline                               |
| **Docker**              | Containerized test execution                 |
| **dee-qe-web-libs**     | Internal shared web test library             |
| **dee-qe-common-libs**  | Internal shared common utilities             |
| **playwright-zephyr**| Zephyr test management reporter (Jira)       |
| **adm-zip**             | ZIP archive generation for report packaging  |
| **patch-package**        | Applies patches to npm dependencies          |

---

## 3. Project Structure Overview

```
playwright/
│
├── .github/workflows/          # CI/CD pipeline definitions
│   ├── Playwright-automated-run.yml  # Automated + scheduled + manual pipeline
│   ├── parse-results.yml       # Parses Playwright JSON results for summary
│   ├── ai-failure-analysis.yml # AI-powered failure categorization & report
│   └── upload-browserstack-results.yml  # Uploads JUnit results to BrowserStack
│
├── config/                     # Environment configuration files
│   ├── .env                    # Default/base environment variables
│   ├── .env.sit                # SIT environment overrides
│   └── .env.qa                 # QA environment overrides
│
├── fixtures/                   # Playwright fixtures & setup
│   ├── basePage.ts             # Global base page (header/footer)
│   ├── fixture.ts              # BrowserStack fixture + auto tracing
│   ├── globalSetup.ts          # Runs before ALL tests (env loading)
│   └── my-reporter.ts          # Custom Playwright reporter
│
├── tests/                      # All test-related code
│   ├── BusinessFunctions/      # High-level business action wrappers
│   │   ├── ConsumerLCD.ts      # Consumer OLB business functions
│   │   └── OAOFunctions.ts     # Online Account Opening functions
│   │
│   ├── d1_Consumer/            # Consumer OLB test module
│   │   ├── pages/              # Page Object classes (18 files)
│   │   ├── testData/           # Test data (JSON per environment + credentials)
│   │   ├── OLBSmoke/        # Smoke test specs (26 tests)
│   │   ├── OLBRegression/   # Regression test specs (15 feature areas)
│   │   └── e2e/                # End-to-end test specs
│   │
│   ├── d1_OAO/                 # Online Account Opening test module
│   │
│   └── utils/                  # Shared utility functions
│       ├── common.ts           # Reusable UI action helpers
│       ├── customFixtures.ts   # Custom Playwright test fixtures
│       ├── reporter.ts         # Report class (pass/fail/screenshot)
│       ├── PageContext.ts       # Singleton to share Page instance
│       ├── interfaces.ts       # TypeScript interfaces
│       ├── ai-failure-analyzer.ts  # AI test failure analysis & HTML report
│       ├── browserstack-upload.ts  # BrowserStack JUnit result uploader
│       ├── generate-playwright-report-zip.ts  # ZIP packager for HTML reports
│       └── extractFunctionTitles.ts# Utility to extract business function names
│
├── playwright-report/          # Generated HTML test reports
├── screenshots/                # Step-level screenshots
├── test-results/               # JSON + JUnit test results
├── patches/                    # npm package patches (playwright-zephyr)
│
├── Documentation/              # Framework and process documentation
│   ├── FRAMEWORK_DOCUMENTATION.md  # This file
│   ├── AI-TEST-ANALYZER.md     # AI failure analyzer documentation
│   ├── BROWSERSTACK_UPLOAD_PROCESS.md  # BrowserStack upload process guide
│   └── EMAIL_NOTIFICATION_PROCESS.md   # Email notification process guide
│
├── playwright.config.ts        # Main Playwright configuration
├── browserstack.yml            # BrowserStack configuration
├── package.json                # Dependencies & npm scripts
├── tsconfig.json               # TypeScript compiler settings
├── eslint.config.mjs           # ESLint configuration
└── Dockerfile-sample           # Docker containerization
```

---

## 4. Architecture & Design Patterns

This framework follows a **multi-layered architecture** that separates concerns cleanly:

```
┌─────────────────────────────────────────────────────────┐
│                    TEST SPEC FILES                       │
│  (Smoke_Login.test.ts, Smoke_Transfer.test.ts) │
│  - Describe test scenarios in business language         │
│  - Use tags: @sanity, @smoke, @regression               │
└────────────────────────┬────────────────────────────────┘
                         │ calls
                         ▼
┌─────────────────────────────────────────────────────────┐
│              BUSINESS FUNCTIONS LAYER                    │
│  (ConsumerLCD.ts, OAOFunctions.ts)                      │
│  - Orchestrates page object methods into workflows      │
│  - Thread-safe with async-mutex                         │
│  - High-level actions: LoginToOLB(), LogoutOLB()     │
└────────────────────────┬────────────────────────────────┘
                         │ calls
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  PAGE OBJECTS LAYER                       │
│  (LoginPage.ts, CustomerDashboardPage.ts, etc.)         │
│  - Encapsulates all locators for a specific page        │
│  - Contains page-specific action methods                │
│  - Each page = 1 class with locators + methods          │
└────────────────────────┬────────────────────────────────┘
                         │ calls
                         ▼
┌─────────────────────────────────────────────────────────┐
│               UTILITIES & COMMON FUNCTIONS               │
│  (common.ts, reporter.ts, PageContext.ts)                │
│  - Reusable actions: clickButton(), enterTextField()    │
│  - Reporting: Report.pass(), Report.fail()              │
│  - Singleton page context management                    │
└────────────────────────┬────────────────────────────────┘
                         │ uses
                         ▼
┌─────────────────────────────────────────────────────────┐
│           FIXTURES & CONFIGURATION LAYER                 │
│  (customFixtures.ts, globalSetup.ts, .env files)        │
│  - Sets up browser context and page instances           │
│  - Loads environment variables per environment          │
│  - Provides dependency injection into tests             │
│  - Manages Vault secrets for credentials                │
└─────────────────────────────────────────────────────────┘
```

### Key Design Patterns Used

| Pattern                    | Where Used                            | Why                                                  |
|----------------------------|---------------------------------------|------------------------------------------------------|
| **Page Object Model (POM)**| `tests/d1_Consumer/pages/`            | Separates UI locators from test logic                |
| **Facade Pattern**         | `tests/BusinessFunctions/`            | Simplifies complex page interactions into single calls |
| **Singleton Pattern**      | `tests/utils/PageContext.ts`          | Ensures one shared Page instance across utilities    |
| **Fixture Pattern**        | `tests/utils/customFixtures.ts`       | Dependency injection of page, browser, credentials   |
| **Mutex Pattern**          | `tests/BusinessFunctions/*.ts`        | Thread-safe execution for parallel tests             |
| **Factory Pattern**        | `tests/d1_Consumer/pages/BasePage.ts` | Centralizes creation of all page objects              |

---

## 5. Detailed Folder Breakdown

### `config/` — Environment Configuration

Contains `.env` files for different test environments:

| File       | Purpose                                      |
|------------|----------------------------------------------|
| `.env`     | Base/default environment variables            |
| `.env.sit` | SIT (System Integration Testing) overrides    |
| `.env.qa`  | QA (Quality Assurance) environment overrides  |

Each file defines environment-specific values like:
- `BASE_URL_CONSUMER` — The URL for the Consumer OLB application
- `VAULT_TOKEN` — Token for HashiCorp Vault (credential store)
- `VAULT_NAMESPACE` — Vault namespace path
- `VAULT_SECRET_PATH` — Path to the secret in Vault

### `fixtures/` — Framework Setup

| File              | Purpose                                                         |
|-------------------|-----------------------------------------------------------------|
| `basePage.ts`     | Simple base page with header/footer locators and `navigateTo()` |
| `fixture.ts`      | BrowserStack integration fixture + auto-trace on failure        |
| `globalSetup.ts`  | Runs once before all tests; loads `.env` files based on env     |
| `my-reporter.ts`  | Custom reporter that logs test begin/end to console             |

### `tests/BusinessFunctions/` — Business Actions

These files wrap complex multi-step workflows into single, readable method calls. Each class extends a `BasePage` that provides access to all page objects.

| File              | Application Persona     | Example Methods                          |
|-------------------|-------------------------|------------------------------------------|
| `ConsumerLCD.ts`  | Consumer Online Banking | `LoginToOLB()`, `LogoutOLB()`, `ClickOnMainMenu()`, `PerformOneTimeImmediateTransfer()` |
| `OAOFunctions.ts` | Online Account Opening  | Account opening workflows                |

### `tests/d1_Consumer/` — Consumer Test Module

This is the primary and most complete test module:

```
d1_Consumer/
├── pages/                    # Page Object classes (18 files including BasePage)
│   ├── BasePage.ts           # Factory: creates all page objects
│   ├── LoginPage.ts          # Login page locators & actions
│   ├── CustomerDashboardPage.ts  # Dashboard locators & actions
│   ├── SettingsPage.ts       # Settings page
│   ├── TransferPage.ts       # Fund transfer page
│   ├── MenuPage.ts           # Navigation menu
│   ├── MyCardsPage.ts        # Debit/Credit cards
│   ├── BillPayPage.ts        # Bill payment
│   ├── ZellePayPage.ts       # Zelle integration
│   ├── ManageAlertsPage.ts   # Manage alerts
│   ├── AccountDetailsPage.ts # Account details & transactions
│   ├── BenefitsPage.ts       # Membership benefits
│   ├── CreditCardPaymentPage.ts  # Credit card payments
│   ├── DisplaySettingsPage.ts    # Display preferences
│   ├── DocumentsPage.ts     # Document center & statements
│   ├── HelpAccessInformationPage.ts  # Help & support
│   ├── OnlineEnrollmentPage.ts       # New user enrollment
│   └── StopPaymentPage.ts   # Stop payment requests
│
├── testData/
│   ├── testData.json         # Legacy/base test data
│   ├── testData.sit.json     # SIT environment-specific test data
│   ├── testData.qa.json      # QA environment-specific test data
│   └── credentials.ts        # Credential structures (deprecated for Vault)
│
├── OLBSmoke/              # 26 Smoke test specs
│   ├── Smoke_LoginToConsumerStudio.test.ts
│   ├── Smoke_VerifyCustomerDashboardDisplay.test.ts
│   ├── Smoke_InternalFundsTransferImmediate.test.ts
│   └── ...
│
├── OLBRegression/         # Regression tests (15 feature areas)
│   ├── AccountDashboard/
│   ├── AccountPage/
│   ├── BillPay/
│   ├── CreditCardPayment/
│   ├── CustomerProfile/
│   ├── DisplaySettings/
│   ├── EnrollOnlineBanking/
│   ├── HelpAccessandInformationCollection/
│   ├── LoginEntitlements/
│   ├── RVMBenefits/
│   ├── StopPayment/
│   ├── TransactionHistory/
│   ├── Transfer/
│   ├── ViewStatementsNoticesTaxDisclosures/
│   └── ZellePay/
│
└── e2e/                      # End-to-end test specs
    └── sampleConsumer.test.ts
```

### `tests/utils/` — Shared Utilities

| File                     | Purpose                                                       |
|--------------------------|---------------------------------------------------------------|
| `common.ts`              | Reusable UI helper functions (click, type, verify, etc.)      |
| `customFixtures.ts`      | Custom Playwright fixtures for dependency injection           |
| `reporter.ts`            | `Report` class for step-level reporting with screenshots      |
| `PageContext.ts`          | Singleton that stores/shares the Playwright Page instance     |
| `interfaces.ts`          | TypeScript interfaces used across the framework               |
| `ai-failure-analyzer.ts` | AI-powered test failure analysis with HTML report generation  |
| `browserstack-upload.ts` | Uploads JUnit XML results to BrowserStack; supports test-and-upload mode |
| `generate-playwright-report-zip.ts` | Packages the latest HTML report directory into a ZIP file |
| `extractFunctionTitles.ts`| Utility to extract business function names (documentation)   |

---

## 6. Configuration Files

### `playwright.config.ts` — Main Configuration

This is the central configuration file for Playwright. Key settings:

```typescript
export default defineConfig({
    globalSetup: "fixtures/globalSetup.ts",    // Runs before all tests
    fullyParallel: true,                        // Enable parallel execution
    retries: process.env.CI ? 1 : 0,           // Retry once on CI
    workers: process.env.CI ? 1 : 1,           // Number of parallel workers
    timeout: 140000,                            // 140 seconds per test
    
    reporter: [
      ['list', { printSteps: true }],           // Console output
      ['html', { ... }],                        // HTML report with timestamp
      ['json', { outputFile: '...' }],          // JSON results
      ['junit', { outputFile: 'test-results/junit-report.xml' }],  // JUnit XML
      // Conditionally: playwright-zephyr reporter for Zephyr/Jira uploads
    ],

    use: {
      trace: 'on-first-retry',                  // Capture trace on retry
      screenshot: 'on',                         // Take screenshot always
      actionTimeout: 40000,                     // 40s timeout per action
      navigationTimeout: 50000,                 // 50s timeout per navigation
    },

    projects: [{
      name: 'd1_Consumer',                     // Project name
      testDir: "./tests",                      // Test directory
      use: {
        browserName: 'chromium',               // Browser to use
        viewport: process.env.CI ? { width: 1920, height: 1080 } : null,
        launchOptions: {
          headless: !!process.env.CI,           // Headed locally, headless on CI
          args: [
            ...(process.env.CI ? ['--window-size=1920,1080'] : ['--start-maximized']),
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-dev-shm-usage',
            '--no-sandbox',
          ],
        },
      },
    }],

    expect: {
      timeout: 200000,                          // 200s for expect assertions
    },
});
```

**Zephyr Reporter:** When running in CI for regression tests (or when `ZEPHYR_UPLOAD=true` locally), the `playwright-zephyr` reporter uploads results to Jira/Zephyr. Configuration includes `host`, `authorizationToken`, `projectKey`, and `testCycleName`.

### `tsconfig.json` — TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ESNext",          // Use latest JavaScript features
    "module": "CommonJS",        // Module system
    "strict": false,             // Relaxed type checking
    "esModuleInterop": true,     // Interop with CommonJS modules
    "noEmit": true               // Don't generate output files
  }
}
```

### `eslint.config.mjs` — Code Quality

Enforces coding standards:
- **2-space indentation**
- **Semicolons required**
- **1TBS brace style** (opening brace on same line)

### `package.json` — NPM Scripts

The framework defines convenient npm scripts for running tests:

| Script                        | Command                                                     | Description                        |
|-------------------------------|-------------------------------------------------------------|------------------------------------|
| `test:Consumer:sit:sanity`    | `cross-env TEST_ENV=sit npx playwright test ... -g '@sanity'`| Run sanity tests on SIT            |
| `test:Consumer:sit:smoke`     | `cross-env TEST_ENV=sit npx playwright test ... -g '@smoke'` | Run smoke tests on SIT             |
| `test:Consumer:sit:reg`       | `cross-env TEST_ENV=sit npx playwright test ... -g '@regression'` | Run regression tests on SIT  |
| `test:Consumer:qa:smoke`      | `cross-env TEST_ENV=qa npx playwright test ... -g '@smoke'`  | Run smoke tests on QA              |
| `test:Consumer:qa:reg`        | `cross-env TEST_ENV=qa npx playwright test ... -g '@regression'`  | Run regression tests on QA   |
| `test:Consumer:sit:reg:zephyr`| `cross-env TEST_ENV=sit ZEPHYR_UPLOAD=true npx playwright test ...` | Regression + Zephyr upload on SIT |
| `test:Consumer:qa:smoke:bs`   | Runs smoke tests on QA and uploads to BrowserStack           | Smoke + BrowserStack upload (QA)   |
| `test:Consumer:sit:smoke:bs`  | Runs smoke tests on SIT and uploads to BrowserStack          | Smoke + BrowserStack upload (SIT)  |
| `upload:browserstack:qa`      | Uploads JUnit report to BrowserStack (QA)                    | BrowserStack upload only (QA)      |
| `upload:browserstack:sit`     | Uploads JUnit report to BrowserStack (SIT)                   | BrowserStack upload only (SIT)     |
| `report:zip`                  | `npx ts-node tests/utils/generate-playwright-report-zip.ts`  | ZIP package latest HTML report     |
| `analyze:failures`            | `npx ts-node tests/utils/ai-failure-analyzer.ts`             | AI failure analysis (rule-based)   |
| `analyze:failures:ai`         | `npx ts-node tests/utils/ai-failure-analyzer.ts --openai`    | AI failure analysis (OpenAI)       |
| `postinstall`                 | `npm update browserstack-node-sdk && patch-package`          | Post-install hooks & patches       |
### `customFixtures.ts` — Main Test Fixtures

This is the **most important file** for understanding how tests get their dependencies:

```typescript
export const test = base.extend<MyFixtures>({
    // 1. Browser Setup — creates a new browser context and page
    browserSetup: async ({ browser }, use) => {
        const context = await browser.newContext();
        const browserSetup = await context.newPage();
        PageContext.setPage(browserSetup);  // Store page globally
        await use(browserSetup);
    },

    // 2. Page — retrieves the page from the singleton PageContext
    page: async ({ }, use) => {
        const page = PageContext.getPage();
        await use(page);
    },

    // 3. Business Functions — injected into each test
    consumerFunctions: async ({ page }, use) => {
        const consumerFunctions = new ConsumerLCD(page);
        await use(consumerFunctions);
    },
    oaoFunctions: async ({ page }, use) => {
        const oaoFunctions = new OAOFunctions(page);
        await use(oaoFunctions);
    },

    // 4. Vault Credentials — fetched securely at runtime (cached to avoid token exhaustion)
    validCredentials: async ({}, use) => {
        const [statuscode, jsonValue] = await getVaultSecret(
            VAULT_TOKEN, VAULT_NAMESPACE, VAULT_SECRET_PATH
        );
        const Credentials = JSON.parse(jsonValue);
        await use(Credentials);
    },
});
```

**Credential Caching:** The `customFixtures.ts` file caches vault credentials so that `getVaultSecret` is called only once across parallel test workers, preventing vault token `num_uses` exhaustion.

**How it works:**

1. Tests import `{ test, expect }` from `customFixtures.ts` (not directly from `@playwright/test`)
2. When a test declares `async ({ consumerFunctions, page, validCredentials })`, Playwright automatically:
   - Creates a browser context and page via `browserSetup`
   - Creates a `ConsumerLCD` instance via `consumerFunctions`
   - Fetches credentials from Vault via `validCredentials`
3. All these are available inside the test function as ready-to-use objects

### `globalSetup.ts` — Pre-Test Environment Loading

Runs once before any test starts:

```typescript
async function globalSetup(config: FullConfig) {
    const testEnv = process.env.TEST_ENV || 'sit';  // Default to SIT
    
    // 1. Load base .env file
    dotenv.config({ path: 'config/.env', override: true });
    
    // 2. Load environment-specific overrides (if file exists)
    const envPath = `config/.env.${testEnv}`;
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath, override: true });
    }
    
    // 3. On CI, use CI-specific credentials
    if (process.env.CI) {
        process.env.USER_NAME = process.env.CI_USER_NAME;
        process.env.PASSWORD = process.env.CI_PASSWORD;
    }
}
```

#### `loadTestData()` — Environment-Specific Test Data Loader

The `globalSetup.ts` also exports a `loadTestData()` function that loads the correct test data JSON file based on the active environment:

```typescript
export function loadTestData() {
    const env = (process.env.TEST_ENV || 'sit').toLowerCase();
    const testDataPath = `tests/d1_Consumer/testData/testData.${env}.json`;
    // Loads testData.sit.json or testData.qa.json
    return JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));
}
```

Test data files per environment:
| File                | Environment |
|---------------------|-------------|
| `testData.sit.json` | SIT         |
| `testData.qa.json`  | QA          |
| `testData.json`     | Legacy/base |

### `fixture.ts` — BrowserStack + Auto-Tracing

This additional fixture file provides:

1. **BrowserStack Integration** — Connects to BrowserStack for cloud testing on real mobile devices and browsers
2. **Accessibility Testing** — Provides an `AxeBuilder` instance for WCAG compliance checks
3. **Auto Tracing** — Automatically starts tracing before each test and saves trace + screenshot on failure

```typescript
// Auto-capture on failure (runs automatically for every test)
afterEach: [
    async ({ page }, use, testInfo) => {
        await use();
        if (testInfo.status == "failed") {
            // Save trace for debugging
            await page.context().tracing.stop({ 
                path: `${testInfo.outputDir}/trace.zip` 
            });
            // Save screenshot
            await page.screenshot({ 
                path: `${testInfo.outputDir}/screenshot.png` 
            });
            // Attach both to the report
            await testInfo.attach("screenshot", { ... });
            await testInfo.attach("trace", { ... });
        }
    },
    { auto: true },  // Runs automatically, no need to call it
],
```

---

## 8. Page Object Model (POM)

The **Page Object Model** is a design pattern where each web page in the application is represented by a class. This pattern:

- **Encapsulates** all locators (selectors) for a page in one place
- **Provides methods** for actions you can perform on that page
- Makes tests **readable** and **maintainable**

### Structure of a Page Object

Every page object follows this structure:

```typescript
// Example: LoginPage.ts
export class LoginPage {
    public page: Page;

    // --- LOCATORS (defined in constructor) ---
    readonly usernameField: Locator;
    readonly passwordField: Locator;
    readonly btnLogin: Locator;

    constructor(page: Page) {
        this.page = page;
        this.usernameField = page.locator(`//input[@aria-label='User ID']`);
        this.passwordField = page.locator(`//input[@name='j_password_formWidget']`);
        this.btnLogin = page.locator(`(//span[text()='Log In'])[2]`);
    }

    // --- ACTION METHODS ---
    async LoginToOLBApplication(userID: string, password: string) {
        await this.usernameField.fill(userID);
        await this.passwordField.fill(password);
        await this.btnLogin.click();
        await Report.pass(this.page, 'Entered Username and Password');
    }
}
```

### BasePage — The Page Object Factory

The `BasePage` in each module (`tests/d1_Consumer/pages/BasePage.ts`) acts as a **factory** that creates ALL page objects for that module and makes them accessible through a single entry point:

```typescript
export class BasePage {
    protected page: Page;
    public loginPage: LoginPage;
    public CustomerDashboardPage: CustomerDashboardPage;
    public SettingsPage: SettingsPage;
    public TransferPage: TransferPage;
    // ... all 16+ page objects

    constructor(page: Page) {
        this.page = page;
        this.loginPage = new LoginPage(page);
        this.CustomerDashboardPage = new CustomerDashboardPage(page);
        this.SettingsPage = new SettingsPage(page);
        // ... instantiate all pages
    }
}
```

This means any class that extends `BasePage` (like `ConsumerLCD`) automatically has access to every page object:

```typescript
// In ConsumerLCD.ts (extends BasePage):
await this.loginPage.LoginToOLBApplication(username, password);
await this.CustomerDashboardPage.VerifyCustomerDashboardDisplay();
await this.TransferPage.PerformTransfer(...);
```

### Consumer Module Page Objects

| Page Object                  | Application Page                      |
|------------------------------|---------------------------------------|
| `LoginPage.ts`               | Login / Authentication screen         |
| `CustomerDashboardPage.ts`   | Main dashboard after login            |
| `SettingsPage.ts`            | User settings & preferences           |
| `MenuPage.ts`                | Navigation menu                       |
| `TransferPage.ts`            | Fund transfers                        |
| `AccountDetailsPage.ts`      | Account details & transactions        |
| `MyCardsPage.ts`             | Debit & Credit card management        |
| `BillPayPage.ts`             | Bill payment                          |
| `ZellePayPage.ts`            | Zelle peer-to-peer payments           |
| `CreditCardPaymentPage.ts`   | Credit card payment processing        |
| `DocumentsPage.ts`           | Document center & statements          |
| `DisplaySettingsPage.ts`     | Display preferences (masking, order)  |
| `StopPaymentPage.ts`         | Stop payment requests                 |
| `BenefitsPage.ts`            | Membership benefits                   |
| `OnlineEnrollmentPage.ts`    | New user enrollment                   |
| `HelpAccessInformationPage.ts`| Help & support information           |
| `ManageAlertsPage.ts`     | Manage alerts & notification preferences  |

---

## 9. Business Functions Layer

The Business Functions layer sits **between** test specs and page objects. It provides:

1. **Simplified API** — Complex multi-step workflows become single method calls
2. **Thread Safety** — Uses `async-mutex` to prevent race conditions in parallel tests
3. **Error Handling** — Catches errors and reports them via the `Report` class
4. **Reusability** — Same business function can be called from smoke, regression, or e2e tests

### How a Business Function Works

```typescript
// In ConsumerLCD.ts
export class ConsumerLCD extends BasePage {

    async LoginToOLB(username: string, pswd: string) {
        const release = await olbMutex.acquire();  // Lock for thread safety
        try {
            await this.loginPage.LoginToOLBApplication(username, pswd);
        } catch (error) {
            await Report.fail(this.page, `Login NOT successful: ${error.message}`);
        } finally {
            release();  // Always release the lock
        }
    }

    async ClickOnMainMenu(menuItem: string) {
        const release = await olbMutex.acquire();
        try {
            await this.MenuPage.MenuNavigation(menuItem);
            await Report.pass(this.page, 'Navigated to desired page');
        } catch (error) {
            Report.fail(this.page, `Menu selection failed: ${error.message}`);
        } finally {
            release();
        }
    }
}
```

### Why use Mutex?

The `async-mutex` library ensures that when multiple tests run in parallel, only one test at a time can execute critical sections (like logging into the application). This prevents:
- Multiple tests trying to interact with the same browser context simultaneously
- Race conditions when shared resources are involved

---

## 10. Writing Test Cases

### Anatomy of a Test File

```typescript
// ===== HEADER COMMENTS =====
// # AUTHOR      : Your Name
// # DATE        : MM/DD/YYYY
// # EPIC DETAILS: Feature area (e.g., LoginEntitlements)

// ===== IMPORTS =====
import { test, expect } from '../../utils/customFixtures';    // Custom fixtures (NOT @playwright/test)
import * as testdata from '../testData/testData.json';         // Test data
import { Report } from '../../utils/reporter';                 // Reporting
import { ConsumerLCD } from '../../BusinessFunctions/ConsumerLCD'; // Business functions

// ===== TEST DATA =====
const moveMoney = testdata.OLBMainMenuOptions.TransferMenu;
const FromAccount = '****5432';
const Amount = '5.34';

// ===== TEST SUITE =====
test.describe('Smoke_FundTransfer', () => {

    // Setup before all tests in the suite
    test.beforeAll(async ({ browserSetup, consumerFunctions, page }) => {
        // Browser & page are already created via fixtures
    });

    // Individual test case with tags
    test('Perform Fund Transfer', { tag: '@smoke' }, 
        async ({ consumerFunctions, page, validCredentials }) => {
        
        // Step 1: Launch application
        Report.step(page, 'Launch OLB Application');
        await consumerFunctions.LaunchOLB();

        // Step 2: Login
        Report.step(page, 'Login to Application');
        await consumerFunctions.LoginToOLB(
            validCredentials.UserID,
            validCredentials.Password
        );

        // Step 3: Navigate to transfer page
        Report.step(page, 'Navigate to Transfer page');
        await consumerFunctions.ClickOnMainMenu(moveMoney);

        // Step 4: Perform transfer
        Report.step(page, 'Execute transfer');
        await consumerFunctions.PerformOneTimeImmediateTransfer(
            FromAccount, ToAccount, Amount
        );

        // Step 5: Logout
        Report.step(page, 'Logout');
        await consumerFunctions.LogoutOLB();
    });

    // Cleanup after all tests
    test.afterAll(async ({ page }) => {
        await page.close();
    });
});
```

### Test Tags

Tests are tagged to organize execution:

| Tag           | Purpose                                       | Test Count (approx.) |
|---------------|-----------------------------------------------|----------------------|
| `@sanity`     | Critical path tests (login, basic navigation) | ~4 tests             |
| `@smoke`      | Core feature coverage                         | ~26 tests            |
| `@regression` | Comprehensive feature testing                 | All tests            |

You can run specific tags:
```bash
npx playwright test -g '@smoke'       # Run only smoke tests
npx playwright test -g '@sanity'      # Run only sanity tests
npx playwright test -g '@regression'  # Run only regression tests
```

---

## 11. Utility Functions

### `common.ts` — Reusable UI Helpers

This file provides generic, page-agnostic UI interaction functions that any page object or test can use:

| Function                          | Description                                      |
|-----------------------------------|--------------------------------------------------|
| `clickButton(buttonName)`         | Clicks a button by its accessible name           |
| `clickTab(tabName)`               | Clicks a tab by name                             |
| `clickLinkByAccessibleName(name)` | Clicks a link by its accessible name             |
| `clickElementByText(text)`        | Clicks any element containing specific text      |
| `clickElementByPlaceholder(text)` | Clicks an element by placeholder text            |
| `enterTextFieldUsingLabel(label, value)` | Fills a text field identified by label    |
| `doesElementExist(selector)`      | Checks if an element exists on the page          |
| `checkTextVisibility(text)`       | Verifies text is visible on the page             |

**Important:** These functions use `PageContext.getPage()` to get the current page instance, so they don't require the `page` parameter to be passed explicitly.

### `PageContext.ts` — Singleton Page Management

```typescript
class PageContext {
    private static page: Page;

    public static setPage(page: Page) {
        PageContext.page = page;
    }

    public static getPage(): Page {
        if (!PageContext.page) {
            throw new Error('Page instance is not set.');
        }
        return PageContext.page;
    }
}
```

This ensures that utility functions in `common.ts` can access the same `Page` instance used by the test, without having to pass it as a parameter every time.

---

## 12. Reporting & Screenshots

### `Report` Class (`tests/utils/reporter.ts`)

The framework uses a custom `Report` class that provides step-level reporting with automatic screenshots:

```typescript
// Usage in any page object or business function:
await Report.pass(page, 'Login was successful');        // ✅ Logs a passing step
await Report.fail(page, 'Button was not visible');      // ❌ Logs a failing step (throws error)
await Report.step(page, 'Starting transfer flow');      // 📝 Logs an informational step
await Report.info(page, 'Current balance: $500');       // ℹ️ Logs informational message
```

**What happens behind the scenes:**

1. A **screenshot** is captured at the moment the log method is called
2. The screenshot is saved to the `screenshots/` directory with a timestamp filename
3. A Playwright `test.step()` is created, which appears in the HTML report
4. The screenshot is **attached** to the test report for visual verification
5. For `Report.fail()`, an error is thrown which marks the step as failed in the report

### Generated Reports

| Report Type       | Location                                    | Format |
|-------------------|---------------------------------------------|--------|
| HTML Report       | `playwright-report/playwright-report-{timestamp}/` | HTML   |
| JSON Results      | `test-results/results.json`                 | JSON   |
| JUnit Report      | `test-results/junit-report.xml`             | XML    |
| Screenshots       | `screenshots/`                              | PNG    |
| Traces (on fail)  | `test-results/{test-name}/trace.zip`        | ZIP    |
| Report ZIP        | `playwright-report/.../playwright-report.zip` | ZIP  |
| AI Analysis       | Generated in CI via `ai-failure-analysis.yml` | HTML |

### Viewing Reports

```bash
# Open the latest HTML report
npx playwright show-report

# Or open a specific report
npx playwright show-report playwright-report/playwright-report-2026-02-09T07-58-06.258Z
```

---

## 13. Test Data Management

### `testData.json` / `testData.{env}.json` — Static Test Data

Test data is now stored in **environment-specific JSON files**, organized by feature area:

| File                | Environment | Description                      |
|---------------------|-------------|----------------------------------|
| `testData.sit.json` | SIT         | SIT-specific user IDs, URLs, data |
| `testData.qa.json`  | QA          | QA-specific user IDs, URLs, data  |
| `testData.json`     | Legacy/base | Original base test data file      |

```json
{
    "OLBSmokeLogin": {
        "userID": "nikitha.sit11",
        "Pswd": "P@ssw0rd",
        "CreditCardUserID": "rchristy.sit30",
        "DebitCardUserID": "debitdda.sit"
    },
    "OLBMainMenuOptions": {
        "TransferMenu": "Move Money:Transfer",
        "SettingsMenu": "More:Settings",
        "BenefitsMenu": "Benefits:"
    },
    "tdata_Common": {
        "AcctNickName": "DDAAccount-Test12",
        "StopPayCheckNumber": "4"
    }
}
```

**How tests use it:**

```typescript
import * as testdata from '../testData/testData.json';

const userID = testdata.OLBSmokeLogin.userID;
const transferMenu = testdata.OLBMainMenuOptions.TransferMenu;
```

### Menu Navigation Format

The `OLBMainMenuOptions` uses a colon-separated format: `"ParentMenu:ChildMenu"`. The `MenuPage.MenuNavigation()` method parses this string to first click the parent menu, then click the child menu item.

---

## 14. Credential & Secret Management (Vault)

**Sensitive credentials are NOT stored in the codebase.** Instead, they are fetched at runtime from **HashiCorp Vault**.

### How It Works

1. **Environment variables** define the Vault connection:
   ```
   VAULT_TOKEN=hvs.CAESI...
   VAULT_NAMESPACE=CaaS-Parent/A14956-Digital_One/qualityenablement
   VAULT_SECRET_PATH=Stage1
   ```

2. **Custom fixture** (`validCredentials`) fetches secrets before each test:
   ```typescript
   validCredentials: async ({}, use) => {
       const [statuscode, jsonValue] = await getVaultSecret(
           VAULT_TOKEN, VAULT_NAMESPACE, VAULT_SECRET_PATH
       );
       const Credentials = JSON.parse(jsonValue);
       await use(Credentials);
   }
   ```

3. **Tests** receive credentials via fixture injection:
   ```typescript
   test('Login Test', async ({ validCredentials }) => {
       await consumerFunctions.LoginToOLB(
           validCredentials.UserID,
           validCredentials.Password
       );
   });
   ```

This approach ensures:
- Credentials are never committed to source control
- Different environments can have different credentials
- Credentials are fetched fresh for each test run
- On CI/CD, `VAULT_TOKEN` is pulled from GitHub Secrets

---

## 15. Environment Configuration

### How Environments Work

The framework supports multiple environments controlled by the `TEST_ENV` variable:

```
TEST_ENV=sit  →  loads config/.env then config/.env.sit
TEST_ENV=qa   →  loads config/.env then config/.env.qa
```

### Environment Loading Priority

1. **Base** (`config/.env`) — Loaded first with all default values
2. **Override** (`config/.env.{TEST_ENV}`) — Loaded second, overrides base values
3. **CI Variables** — If `process.env.CI` is true, CI-specific variables take precedence

### Example: SIT vs QA URLs

| Environment | Consumer URL                                                              |
|-------------|---------------------------------------------------------------------------|
| SIT         | `url-sit`  |
| QA          | `url-qa` |

### Setting the Environment

```bash
# Via npm script (recommended)
npm run test:Consumer:sit:smoke

# Via environment variable
cross-env TEST_ENV=qa npx playwright test --project=d1_Consumer -g '@smoke'

# Directly in terminal
$env:TEST_ENV="qa"; npx playwright test -g '@smoke'
```

---

## 16. Running Tests

### Prerequisites

1. **Node.js** (v18+ recommended, v22 used in CI)
2. **npm** installed
3. Install dependencies:
   ```bash
   npm install
   ```
4. Install Playwright browsers:
   ```bash
   npx playwright install --with-deps
   ```

### Basic Commands

```bash
# Run ALL tests
npx playwright test

# Run with specific project
npx playwright test --project=d1_Consumer

# Run by tag
npx playwright test -g '@smoke'
npx playwright test -g '@sanity'
npx playwright test -g '@regression'

# Run a specific test file
npx playwright test tests/d1_Consumer/OLBSmoke/Smoke_LoginToConsumerStudio.test.ts

# Run in headed mode (see the browser)
npx playwright test --headed

# Run with UI mode (interactive)
npx playwright test --ui

# Run with debug mode
npx playwright test --debug
```

### Using NPM Scripts

```bash
# Consumer Smoke on SIT
npm run test:Consumer:sit:smoke

# Consumer Regression on QA
npm run test:Consumer:qa:reg

# Consumer Sanity on SIT
npm run test:Consumer:sit:sanity

# Regression with Zephyr upload (SIT)
npm run test:Consumer:sit:reg:zephyr

# Smoke + BrowserStack upload (QA)
npm run test:Consumer:qa:smoke:bs

# AI failure analysis after a test run
npm run analyze:failures

# ZIP the latest HTML report
npm run report:zip
```

### Viewing Results

```bash
# Open the HTML report
npx playwright show-report

# View trace files (for debugging failed tests)
npx playwright show-trace test-results/{test-folder}/trace.zip
```

---

## 17. CI/CD Integration

### GitHub Actions Workflows

#### Automated Pipeline (`Playwright-automated-run.yml`)

Triggers on:
- **Push to `main` branch** (automatic)
- **Schedule** (Mon-Thu smoke at 4:30 AM UTC / 10:00 AM IST, Fri regression)
- **Manual dispatch** (with environment, test type, browser, application, email inputs)

**Manual Dispatch Inputs:**

| Input         | Options                            | Default            |
|---------------|------------------------------------|--------------------|
| Environment   | sit, qa, uat                       | sit                |
| Test Type     | sanity, smoke, regression          | smoke              |
| Browser       | chrome, firefox, edge, webkit      | chrome             |
| Application   | Consumer OLB, OAO                  | Consumer OLB       |
| Email         | GitHub username(s), comma-separated | (default recipients) |

**Pipeline Jobs:**

1. **`call-playwright-qa`** — Calls reusable workflow from `resuable-repo`
   - Uses the npm registry at `artifactory.dev`
   - Determines the test type based on trigger:
     - Push: `@sanity`
     - Schedule (Mon-Thu): `@smoke`
     - Schedule (Fri): `@regression`
     - Manual: uses the selected `test_type`
   - Runs Playwright with `--grep` using the resolved tag
   - Uploads test reports and screenshots as artifacts
   - Passes `VAULT_TOKEN` from GitHub Secrets

2. **`upload_browserstack_results`** — Uploads JUnit report to BrowserStack (via `upload-browserstack-results.yml`)
   - Controlled by `BS_UPLOAD` toggle per environment (currently enabled for SIT only)
   - Requires `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY` secrets

3. **`ai_failure_analysis`** — Runs AI-powered failure categorization (via `ai-failure-analysis.yml`)
   - Analyzes `test-results/results.json` for failure patterns
   - Categorizes failures (AUTH_FAILURE, TIMEOUT, LOCATOR, etc.) with severity
   - Generates an HTML report artifact and a compact failure table for email

4. **`parse_results`** — Parses Playwright JSON results (via `parse-results.yml`)
   - Generates an HTML summary table with pass/fail/flaky/skipped counts
   - Outputs individual counts for downstream use

5. **`send_notification`** — Sends email notification with:
   - Test summary table from `parse_results`
   - AI failure analysis table from `ai_failure_analysis`
   - Link to Playwright report artifacts
   - Link to AI failure analysis HTML report
   - BrowserStack results URL (if upload was enabled)
   - Uses `Banking-Solutions-Digital/panda-github-native-notification-action`

---

## 18. BrowserStack Integration

The framework supports running tests on **BrowserStack** for cross-browser and real device testing.

### Configuration (`browserstack.yml`)

```yaml
platforms:
  - os: OS X
    osVersion: Big Sur
    browserName: Chrome
  - os: Windows
    osVersion: 10
    browserName: Edge
  - deviceName: Samsung Galaxy S22 Ultra
    browserName: chrome
    osVersion: 12.0
```

### How It Works

1. The `fixture.ts` file checks if the test project name contains `@browserstack`
2. If yes, it connects to BrowserStack's CDP (Chrome DevTools Protocol) endpoint
3. Tests run on real devices and browsers in the cloud
4. For mobile: connects via `playwright._android.connect()`
5. For desktop: connects via `playwright.chromium.connect()`

### Running on BrowserStack

```bash
# Ensure BrowserStack credentials are set
export BROWSERSTACK_USERNAME="your_username"
export BROWSERSTACK_ACCESS_KEY="your_key"

# Run with BrowserStack
npx browserstack-node-sdk playwright test
```

### JUnit Report Upload to BrowserStack

The framework also supports uploading JUnit XML results to BrowserStack via `browserstack-upload.ts`:

```bash
# Upload results to BrowserStack (SIT)
npm run upload:browserstack:sit

# Run tests AND upload results in one command (QA)
npm run test:Consumer:qa:smoke:bs
```

The `BS_UPLOAD` flag in each `.env.{environment}` file controls whether uploads are enabled. In CI, the `upload-browserstack-results.yml` workflow handles this automatically.

---

## 19. AI Failure Analyzer

The framework includes an AI-powered test failure analysis tool that can be run locally or in CI.

### What It Does

1. **Reads** `test-results/results.json` from the latest Playwright run
2. **Categorizes** each failure into patterns: `AUTH_FAILURE`, `TIMEOUT`, `LOCATOR`, `ASSERTION`, `NETWORK`, `ENVIRONMENT`, etc.
3. **Assigns severity** (CRITICAL, HIGH, MEDIUM, LOW)
4. **Provides root-cause analysis** and fix recommendations
5. **Generates an HTML report** with failure summaries
6. **Optionally** calls OpenAI/Azure OpenAI for deeper AI analysis (when `--openai` flag is passed)

### Usage

```bash
# Rule-based analysis (no API key needed)
npm run analyze:failures

# AI-enhanced analysis with OpenAI
npm run analyze:failures:ai

# Custom input file
npx ts-node tests/utils/ai-failure-analyzer.ts --input test-results/results.json
```

### CI Integration

The `ai-failure-analysis.yml` workflow runs automatically after each test execution in the pipeline. It produces:
- An HTML artifact (`ai-failure-analysis`) downloadable from GitHub Actions
- A compact HTML failure table injected into the email notification

For full details, see [Documentation/AI-TEST-ANALYZER.md](../Documentation/AI-TEST-ANALYZER.md).

---

## 20. Zephyr Test Management Integration

The framework integrates with **Jira Zephyr** for test case management via the `playwright-zephyr` reporter.

### When It Activates

- **CI Regression runs:** Automatically enabled when running regression tests in CI
- **Local:** Enabled when `ZEPHYR_UPLOAD=true` environment variable is set

### Configuration

```typescript
// In playwright.config.ts (conditional)
['playwright-zephyr', {
    host: 'https://jira',
    authorizationToken: process.env.ZEPHYR_AUTH_TOKEN,
    projectKey: 'Projecykey',
    reportFolder: htmlReportFolder,
    testCycleName: `Automated Playwright Run - ${new Date().toISOString()}`,
}]
```

### Running Locally with Zephyr Upload

```bash
npm run test:Consumer:sit:reg:zephyr
```

### Patches

A patched version of `playwright-zephyr` is maintained under `patches/playwright-zephyr+1.2.0.patch`. The patch is auto-applied via `patch-package` during `npm install` (configured in the `postinstall` script).

---

## 21. Docker Support

The `Dockerfile-sample` provides containerized test execution:

```dockerfile
FROM mcr.microsoft.com/playwright:v1.48.2    # Official Playwright image

COPY . /e2e                                   # Copy project files
WORKDIR /e2e
RUN npm install                               # Install dependencies
RUN npx playwright install                    # Install browsers

ENV ENV=qa                                    # Default environment
CMD ["npm", "run", "test:flex:qa:html"]       # Run tests
```

### Build and Run

```bash
# Build the Docker image
docker build -t projectkey-playwright-tests .

# Run tests in container
docker run playwright-tests
```

---

## 22. Best Practices & Conventions

### File Naming Conventions

| Type              | Convention                                      | Example                                    |
|-------------------|-------------------------------------------------|--------------------------------------------|
| Test files        | `Smoke_{FeatureName}.test.ts`               | `Smoke_LoginToConsumerStudio.test.ts`  |
| Page objects      | `{PageName}Page.ts` (PascalCase)                | `CustomerDashboardPage.ts`                 |
| Business functions| `{PersonaName}.ts` (PascalCase)                 | `ConsumerLCD.ts`                           |
| Test data         | `testData.json`                                 | `testData.json`                            |

### Code Conventions

1. **Always use `try-catch`** in page object methods and business functions
2. **Always call `Report.pass/fail`** in every method for traceability
3. **Use Mutex** in business function methods for thread safety
4. **Import `test` from `customFixtures.ts`**, NOT from `@playwright/test`
5. **Add JSDoc comments** with revision history to all methods
6. **Use test tags** (`@sanity`, `@smoke`, `@regression`) on every test
7. **Close the page** in `afterAll` or `afterEach` hooks

### Test Header Comment Block

Every test file should have:

```typescript
// ########################################
// # AUTHOR       : Your Name
// # DATE         : MM/DD/YYYY
// # UPDATED BY   : NA
// # UPDATE ON    : NA
// # PRE-CONDITIONS: User should have access to Consumer Studio
// ########################################
// # EPIC DETAILS: FeatureAreaName
// ########################################
```

### Method Documentation Block

```typescript
/** <summary>
 * Description of what this function does
 * @param {string} paramName - Description of parameter
 * *********************************
 * Revision History:
 * Date: MM/DD/YYYY   Created By: Name    Reason: Why
 * Date: NA           Updated By: NA      Reason:
 * *********************************
 */
```

---

## 23. Troubleshooting

### Common Issues

| Issue                               | Solution                                               |
|-------------------------------------|--------------------------------------------------------|
| `Page instance is not set`          | Ensure `browserSetup` fixture is used in `beforeAll`   |
| `Vault secret fetch fails`          | Check `VAULT_TOKEN` is valid and not expired           |
| `Element not found` / `Timeout`     | Increase `actionTimeout` or add explicit waits         |
| `Tests fail only on CI`             | Ensure `headless: true` and `--no-sandbox` flag        |
| `.env file not loading`             | Verify `TEST_ENV` is set correctly before running      |
| `Import errors for dee-qe-*`       | Run `npm install` and ensure `.npmrc` has registry URL |
| `BrowserStack connection failed`    | Verify `BROWSERSTACK_USERNAME` and `ACCESS_KEY`        |
| `Report not generated`             | Check `playwright-report/` folder permissions          |

### Debugging Tips

1. **Run in headed mode** to watch the browser: `npx playwright test --headed`
2. **Use UI mode** for interactive debugging: `npx playwright test --ui`
3. **Use debug mode** to step through: `npx playwright test --debug`
4. **Check trace files** for failed tests: `npx playwright show-trace trace.zip`
5. **Check screenshots** in `screenshots/` folder for step-by-step visual verification
6. **Increase timeouts** temporarily while debugging:
   ```typescript
   await page.waitForTimeout(10000);  // Wait 10 seconds
   ```

---

## 24. Glossary

| Term                | Definition                                                        |
|---------------------|-------------------------------------------------------------------|
| **POM**             | Page Object Model — design pattern for UI test automation         |
| **Fixture**         | Playwright mechanism for setup/teardown and dependency injection  |
| **Locator**         | Playwright object that represents an element on a web page        |
| **OLB**             | Online Banking                                                    |
| **LCD**             | Liquid Crystal Display Consumer (Consumer web portal name)        |
| **Project**         | Bank                                                     |
| **SIT**             | System Integration Testing environment                            |
| **QA**              | Quality Assurance testing environment                             |
| **UAT**             | User Acceptance Testing environment                               |
| **OAO**             | Online Account Opening                                            |
| **Mutex**           | Mutual Exclusion — prevents concurrent access to shared resources |
| **Vault**           | HashiCorp Vault — secure credential management system             |
| **CDP**             | Chrome DevTools Protocol — communication protocol for browsers    |
| **E2E**             | End-to-End testing                                                |
| **CI/CD**           | Continuous Integration / Continuous Deployment                    |
| **Cross-env**       | npm package for setting environment variables across platforms     |
| **BrowserStack**    | Cloud platform for cross-browser and real device testing          |
| **Trace**           | Playwright debugging artifact capturing page actions & network    |
| **WCAG**            | Web Content Accessibility Guidelines                              |
| **Zephyr**          | Jira-based test management plugin for tracking test cycles        |
| **JUnit**           | XML report format used for CI integrations and BrowserStack       |
| **patch-package**   | npm tool to apply patches to third-party dependencies             |

---

## Quick Start for New Team Members

1. **Clone the repository**
2. **Install dependencies:** `npm install`
3. **Install browsers:** `npx playwright install --with-deps`
4. **Set environment:** Ensure `VAULT_TOKEN` is set (ask your team lead)
5. **Run sanity tests:** `npm run test:Consumer:sit:sanity`
6. **View report:** `npx playwright show-report`
7. **Start exploring:** Open `tests/d1_Consumer/OLBSmoke/` to see test examples

---

*This documentation was generated for the Playwright Framework. Last updated: March 2026.*
