# Playwright POM Framework - Project Instructions

## Project Overview

This is a comprehensive Page Object Model (POM) Playwright testing framework built with TypeScript that supports:
- **UI Automation** - Web application testing with Playwright
- **API Testing** - REST API validation with built-in HTTP client
- **Database Validation** - PostgreSQL, MySQL, and SQLite support

## Project Structure

```
PW-Sample/
├── src/
│   ├── base/              # Base classes and abstractions
│   ├── pages/             # Page Object Model classes
│   ├── api/               # API client and utilities
│   ├── database/          # Database client and utilities
│   ├── config/            # Configuration management
│   ├── utils/             # Helper utilities
│   ├── fixtures/          # Playwright custom fixtures
│   ├── tests/             # Test specifications
│   │   ├── ui/            # UI tests
│   │   ├── api/           # API tests
│   │   ├── database/      # Database tests
│   │   └── e2e/           # End-to-end integration tests
│   └── index.ts           # Barrel exports
├── playwright.config.ts   # Playwright configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
└── README.md              # Documentation
```

## Installation & Setup

1. **Dependencies installed**: ✓ (npm install completed)
2. **Playwright browsers installed**: ✓ (chromium, firefox, webkit)
3. **Create .env file**:
   ```bash
   cp .env.example .env
   ```

## Key Features

### Base Page Class
- Common element interactions (click, fill, select, etc.)
- Built-in assertions and validations
- Automatic logging and error handling
- Screenshot and trace capabilities

### API Client
- GET, POST, PUT, DELETE, PATCH methods
- Automatic request/response logging
- Bearer token authentication support
- Custom headers support
- Response verification methods

### Database Client
- Support for PostgreSQL, MySQL, SQLite
- Query execution and validation
- Row existence verification
- Data integrity checks
- Connection pooling

### Test Fixtures
- Custom Playwright fixtures with BasePage
- Reusable test setup and teardown
- Centralized configuration management

## Running Tests

```bash
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Run in debug mode
npm run test:debug

# Run in headed mode
npm run test:headed

# Run specific browser
npm run test:chrome
npm run test:firefox
npm run test:webkit

# View reports
npm run test:report
```

## Configuration

Edit `.env` file to configure:
- Base URLs (application and API)
- Browser settings (headless, timeout, etc.)
- Database connection details
- Test user credentials
- Reporting options

## Creating Tests

### Example UI Test
```typescript
import { test } from '../fixtures/test.fixture';
import { LoginPage } from '../pages/LoginPage';

test('Should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigateToLoginPage('http://localhost:3000/login');
  await loginPage.login('test@example.com', 'password');
  await loginPage.assertLoginSuccessful();
});
```

### Example API Test
```typescript
import { test } from '../fixtures/test.fixture';
import { APIClient } from '../api/APIClient';

test('Should fetch users', async () => {
  const apiClient = new APIClient('http://localhost:3000/api');
  const response = await apiClient.get('/users');
  test.expect(response.status).toBe(200);
});
```

### Example DB Test
```typescript
import { test } from '../fixtures/test.fixture';
import { DatabaseClient } from '../database/DatabaseClient';

test('Should verify user in database', async () => {
  const dbClient = new DatabaseClient({ type: 'sqlite', database: 'test.db' });
  await dbClient.connect();
  const exists = await dbClient.rowExists('users', { email: 'test@example.com' });
  test.expect(exists).toBe(true);
  await dbClient.close();
});
```

## Best Practices

1. **Keep page objects clean** - Only UI selectors and methods
2. **Use meaningful test names** - Describe what is being tested
3. **Arrange-Act-Assert pattern** - Organize test logic clearly
4. **Centralize test data** - Use config files for credentials
5. **Log important steps** - Use Logger for debugging
6. **Handle errors gracefully** - Try-catch where needed
7. **Clean up resources** - Close connections after tests

## Available Methods

### BasePage
- `goto()`, `getCurrentUrl()`, `refreshPage()`
- `click()`, `fill()`, `getText()`, `selectOption()`
- `isVisible()`, `isEnabled()`, `waitForElement()`
- `assertText()`, `assertVisible()`, `assertUrl()`
- `takeScreenshot()`, `executeScript()`

### APIClient
- `get()`, `post()`, `put()`, `delete()`, `patch()`
- `setAuthToken()`, `setHeaders()`
- `verifyResponseData()`

### DatabaseClient
- `connect()`, `close()`
- `query()`, `execute()`, `queryOne()`, `queryValue()`
- `rowExists()`, `verifyRowData()`, `countRows()`, `clearTable()`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Module not found | Run `npm install` and `npm install -D @types/node` |
| Browser not found | Run `npx playwright install` |
| DB connection error | Check DB credentials in `.env` |
| Timeout errors | Increase `TIMEOUT` value in `.env` |
| Port already in use | Change port in configuration |

## Development Tips

- Use `npm run test:debug` for step-through debugging
- Use `npm run test:headed` to see browser interactions
- Check `test-results/html-report/` for detailed test reports
- Use VS Code Playwright Test extension for inline test running
- Check logs in console for debugging information

## Next Steps

1. Create your application pages in `src/pages/`
2. Write test cases in `src/tests/`
3. Configure your API endpoints in tests
4. Set up database schemas and test data
5. Run tests with `npm run test`
6. Review reports with `npm run test:report`

## Documentation

- Playwright: https://playwright.dev
- TypeScript: https://www.typescriptlang.org
- Jest Assertions: https://jestjs.io/docs/expect

---

**Framework setup complete! Ready to write tests.** ✨
