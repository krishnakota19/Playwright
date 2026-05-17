# Playwright Page Object Model Framework

A comprehensive Playwright testing framework built with TypeScript that supports **UI automation**, **API testing**, and **Database validation** in a single cohesive framework.

## 🚀 Features

- **Page Object Model (POM)** - Well-organized page objects for maintainable tests
- **TypeScript Support** - Full type safety and intellisense
- **API Testing** - Built-in API client with automatic logging
- **Database Validation** - Support for PostgreSQL, MySQL, and SQLite
- **Cross-browser Testing** - Chrome, Firefox, Safari, and mobile browsers
- **Advanced Reporting** - HTML, JSON, and JUnit reports
- **Screenshots & Videos** - Automatic capture on failures
- **Custom Fixtures** - Extended Playwright fixtures with BasePage
- **Environment Configuration** - Flexible configuration management

## 📋 Project Structure

```
src/
├── base/
│   └── BasePage.ts           # Base page class with common methods
├── pages/
│   ├── LoginPage.ts          # Login page object example
│   └── DashboardPage.ts      # Dashboard page object example
├── api/
│   └── APIClient.ts          # HTTP client for API testing
├── database/
│   └── DatabaseClient.ts     # Database client for validation
├── config/
│   └── config.ts             # Configuration management
├── utils/
│   └── Logger.ts             # Logging utility
├── fixtures/
│   └── test.fixture.ts       # Custom test fixtures
└── tests/
    ├── ui/
    │   └── login.spec.ts     # UI test examples
    ├── api/
    │   └── users.api.spec.ts # API test examples
    ├── database/
    │   └── database.spec.ts  # Database test examples
    └── e2e/
        └── end-to-end.spec.ts # End-to-end integration tests
```

## 📦 Installation

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Install Playwright browsers:**

```bash
npx playwright install
```

3. **Create environment file:**

```bash
cp .env.example .env
```

4. **Update .env with your configuration:**

```env
BASE_URL=http://localhost:3000
API_URL=http://localhost:3000/api
DB_TYPE=sqlite
DB_PATH=./test.db
```

## 🧪 Running Tests

### Run all tests
```bash
npm run test
```

### Run tests in UI mode (interactive)
```bash
npm run test:ui
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Run tests in headed mode (visible browser)
```bash
npm run test:headed
```

### Run tests in specific browser
```bash
npm run test:chrome
npm run test:firefox
npm run test:webkit
```

### Run tests in serial mode (one at a time)
```bash
npm run test:serial
```

### View test report
```bash
npm run test:report
```

## 🔍 Page Object Model Usage

### Example Page Object

```typescript
import { Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export class LoginPage extends BasePage {
  private emailInput = this.page.locator('input[type="email"]');
  private passwordInput = this.page.locator('input[type="password"]');
  private loginButton = this.page.locator('button:has-text("Login")');

  constructor(page: Page) {
    super(page);
  }

  async login(email: string, password: string): Promise<void> {
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
    await this.waitForNavigation();
  }

  async assertLoginSuccessful(): Promise<void> {
    await this.assertVisible(this.page.locator('[data-testid="dashboard"]'));
  }
}
```

### Example Test

```typescript
import { test } from '../fixtures/test.fixture';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto('http://localhost:3000/login');
  });

  test('Should successfully login', async () => {
    await loginPage.login('test@example.com', 'password');
    await loginPage.assertLoginSuccessful();
  });
});
```

## 🌐 API Testing

### Example API Test

```typescript
import { test } from '../fixtures/test.fixture';
import { APIClient } from '../api/APIClient';

test.describe('API Tests', () => {
  let apiClient: APIClient;

  test.beforeEach(() => {
    apiClient = new APIClient('http://localhost:3000/api');
  });

  test('Should get users', async () => {
    const response = await apiClient.get('/users');
    test.expect(response.status).toBe(200);
    test.expect(Array.isArray(response.data)).toBe(true);
  });

  test('Should create user', async () => {
    const userData = { name: 'John', email: 'john@example.com' };
    const response = await apiClient.post('/users', userData);
    test.expect(response.status).toBe(201);
  });
});
```

### APIClient Methods

- `get(endpoint, config?)` - GET request
- `post(endpoint, data, config?)` - POST request
- `put(endpoint, data, config?)` - PUT request
- `delete(endpoint, config?)` - DELETE request
- `patch(endpoint, data, config?)` - PATCH request
- `setAuthToken(token)` - Set authorization header
- `setHeaders(headers)` - Set custom headers
- `verifyResponseData(endpoint, expectedData)` - Verify response contains expected data

## 💾 Database Testing

### Example Database Test

```typescript
import { test } from '../fixtures/test.fixture';
import { DatabaseClient } from '../database/DatabaseClient';
import { dbConfig } from '../config/config';

test.describe('Database Tests', () => {
  let dbClient: DatabaseClient;

  test.beforeAll(async () => {
    dbClient = new DatabaseClient(dbConfig);
    await dbClient.connect();
  });

  test('Should verify user in database', async () => {
    const userExists = await dbClient.rowExists('users', { email: 'test@example.com' });
    test.expect(userExists).toBe(true);
  });

  test('Should verify user data', async () => {
    const isValid = await dbClient.verifyRowData(
      'users',
      { id: 1 },
      { email: 'test@example.com', name: 'John' }
    );
    test.expect(isValid).toBe(true);
  });

  test.afterAll(async () => {
    await dbClient.close();
  });
});
```

### DatabaseClient Methods

- `connect()` - Connect to database
- `query(query, params)` - Execute SELECT query
- `execute(query, params)` - Execute INSERT/UPDATE/DELETE query
- `queryOne(query, params)` - Get single row
- `queryValue(query, params)` - Get single value
- `rowExists(table, condition)` - Check if row exists
- `verifyRowData(table, where, expectedData)` - Verify row data
- `countRows(table)` - Count rows in table
- `clearTable(table)` - Clear all data from table
- `close()` - Close connection

### Supported Databases

- **SQLite** (default)
- **PostgreSQL**
- **MySQL**

## 📊 BasePage Methods

Common methods available in all page objects:

### Navigation
- `goto(url)` - Navigate to URL
- `getCurrentUrl()` - Get current page URL
- `waitForNavigation()` - Wait for navigation
- `refreshPage()` - Refresh page

### Element Interaction
- `click(locator)` - Click element
- `fill(locator, text)` - Fill text input
- `getText(locator)` - Get element text
- `selectOption(locator, value)` - Select dropdown option
- `getAttribute(locator, attribute)` - Get attribute value

### Element State
- `isVisible(locator)` - Check if element is visible
- `isEnabled(locator)` - Check if element is enabled
- `waitForElement(locator, timeout)` - Wait for element to appear

### Assertions
- `assertText(locator, text)` - Assert element text
- `assertVisible(locator)` - Assert element is visible
- `assertHidden(locator)` - Assert element is hidden
- `assertEnabled(locator)` - Assert element is enabled
- `assertDisabled(locator)` - Assert element is disabled
- `assertUrl(url)` - Assert page URL

### Utilities
- `takeScreenshot(name)` - Take screenshot
- `getPageTitle()` - Get page title
- `executeScript(script)` - Execute JavaScript
- `wait(ms)` - Wait for duration

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# URLs
BASE_URL=http://localhost:3000
API_URL=http://localhost:3000/api

# Browser
BROWSER=chromium
HEADLESS=true
TIMEOUT=30000

# Reporting
SCREENSHOT=only-on-failure
VIDEO=retain-on-failure

# Retry
RETRIES=2
WORKERS=1

# Database
DB_TYPE=sqlite
DB_PATH=./test.db

# Auth
AUTH_TOKEN=your_token_here
```

## 📁 Test Organization

Tests are organized by type:

- **UI Tests** (`src/tests/ui/`) - User interface automation tests
- **API Tests** (`src/tests/api/`) - API endpoint tests
- **Database Tests** (`src/tests/database/`) - Database validation tests
- **E2E Tests** (`src/tests/e2e/`) - End-to-end integration tests

## 📝 Writing Tests

### Best Practices

1. **Use Page Objects** - Keep selectors in page objects, not tests
2. **Arrange-Act-Assert** - Structure tests clearly
3. **Meaningful Names** - Use descriptive test names
4. **Isolation** - Each test should be independent
5. **Logging** - Use logger for debugging
6. **Wait Strategies** - Use explicit waits

### Example Test Structure

```typescript
test('Should perform specific action', async ({ page }) => {
  // Arrange - Setup test data and page
  const loginPage = new LoginPage(page);
  await loginPage.goto('http://localhost:3000/login');

  // Act - Perform action
  await loginPage.login('test@example.com', 'password');

  // Assert - Verify results
  await loginPage.assertLoginSuccessful();
});
```

## 🐛 Debugging

### Debug Mode
```bash
npm run test:debug
```

### Headed Mode
```bash
npm run test:headed
```

### Generate Trace
```
TRACE=on playwright test
```

View traces:
```bash
npx playwright show-trace trace.zip
```

## 📊 Reporting

After running tests, view the HTML report:

```bash
npm run test:report
```

Reports are generated in `test-results/html-report/`

## 🤝 Contributing

1. Create page objects for new pages
2. Add tests following the established pattern
3. Keep configuration centralized
4. Use meaningful names and comments

## 📄 License

MIT

## 🆘 Troubleshooting

### Dependencies not found
```bash
npm install
npm install -D @types/node
```

### Playwright browsers not installed
```bash
npx playwright install
```

### Connection refused errors
- Verify your application is running on the configured URL
- Check `.env` file has correct URLs

### Database connection errors
- Verify database is running and accessible
- Check database credentials in `.env`
- For SQLite, ensure the path is correct

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)

---

**Happy Testing! 🎉**
