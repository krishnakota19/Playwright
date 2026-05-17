# Framework Capabilities & Examples

## 📋 Comprehensive Feature Set

This Playwright POM framework provides everything needed for modern test automation:

### ✅ UI Automation Capabilities
- [x] Page Object Model pattern
- [x] Element interaction (click, fill, select, etc.)
- [x] Visibility and state checks
- [x] Custom assertions
- [x] Screenshot capture
- [x] Cross-browser testing
- [x] Mobile device emulation

### ✅ API Testing Capabilities
- [x] HTTP methods (GET, POST, PUT, DELETE, PATCH)
- [x] Request/response logging
- [x] Bearer token authentication
- [x] Custom headers
- [x] Response verification
- [x] Automatic error handling

### ✅ Database Testing Capabilities
- [x] Multi-database support (PostgreSQL, MySQL, SQLite)
- [x] Query execution
- [x] Data validation
- [x] Row existence checks
- [x] Connection management
- [x] Data cleanup

### ✅ Reporting & Debugging
- [x] HTML reports
- [x] JSON reports
- [x] JUnit reports
- [x] Screenshots on failure
- [x] Video recording
- [x] Trace files
- [x] Debug mode
- [x] Headed mode

---

## 🎓 Code Examples

### Example 1: Complete UI Test with Validations

```typescript
import { test, expect } from '../fixtures/test.fixture';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Complete User Journey', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('Should complete full user journey', async () => {
    // Navigate to login page
    await loginPage.goto('http://localhost:3000/login');

    // Verify page elements
    expect(await loginPage.isEmailInputVisible()).toBe(true);
    expect(await loginPage.isLoginButtonEnabled()).toBe(true);

    // Perform login
    await loginPage.login('test@example.com', 'password');

    // Verify dashboard
    await dashboardPage.goto('http://localhost:3000/dashboard');
    await dashboardPage.assertUserLoggedIn('Test User');

    // Get user profile data
    const profileData = await dashboardPage.getUserProfileData();
    expect(profileData.profile).toBeDefined();

    // Verify table data
    const rowCount = await dashboardPage.getTableRowCount();
    expect(rowCount).toBeGreaterThan(0);

    // Logout
    await dashboardPage.logout();
  });
});
```

### Example 2: API Testing with Multiple Operations

```typescript
import { test, expect } from '../fixtures/test.fixture';
import { APIClient } from '../api/APIClient';

test.describe('User API Operations', () => {
  let apiClient: APIClient;
  let createdUserId: number;

  test.beforeAll(() => {
    apiClient = new APIClient('http://localhost:3000/api', 10000);
    apiClient.setAuthToken('your_auth_token_here');
  });

  test('Should create user and retrieve it', async () => {
    // Create user
    const createResponse = await apiClient.post('/users', {
      name: 'New User',
      email: 'newuser@example.com',
      age: 30,
    });

    expect(createResponse.status).toBe(201);
    createdUserId = createResponse.data.id;
    expect(createdUserId).toBeDefined();

    // Get user
    const getResponse = await apiClient.get(`/users/${createdUserId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.data.email).toBe('newuser@example.com');

    // Update user
    const updateResponse = await apiClient.put(`/users/${createdUserId}`, {
      name: 'Updated User',
      age: 31,
    });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.name).toBe('Updated User');

    // Verify data
    const verified = await apiClient.verifyResponseData(`/users/${createdUserId}`, {
      email: 'newuser@example.com',
    });
    expect(verified).toBe(true);
  });

  test('Should delete user', async () => {
    const deleteResponse = await apiClient.delete(`/users/${createdUserId}`);
    expect(deleteResponse.status).toBe(204);

    // Verify deletion
    try {
      await apiClient.get(`/users/${createdUserId}`);
      expect.fail('User should not exist');
    } catch (error: any) {
      expect(error.response?.status).toBe(404);
    }
  });
});
```

### Example 3: Database Validation Tests

```typescript
import { test, expect } from '../fixtures/test.fixture';
import { DatabaseClient } from '../database/DatabaseClient';
import { dbConfig } from '../config/config';

test.describe('Database Validation Tests', () => {
  let dbClient: DatabaseClient;

  test.beforeAll(async () => {
    dbClient = new DatabaseClient(dbConfig);
    await dbClient.connect();
  });

  test('Should manage user data in database', async () => {
    // Clear test data
    await dbClient.clearTable('users');

    // Insert user
    await dbClient.execute(
      'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
      ['Database User', 'dbuser@example.com', 25]
    );

    // Verify user exists
    const exists = await dbClient.rowExists('users', {
      email: 'dbuser@example.com',
    });
    expect(exists).toBe(true);

    // Get user data
    const user = await dbClient.queryOne(
      'SELECT * FROM users WHERE email = ?',
      ['dbuser@example.com']
    );
    expect(user).toBeDefined();
    expect(user.name).toBe('Database User');
    expect(user.age).toBe(25);

    // Update user
    await dbClient.execute(
      'UPDATE users SET age = ? WHERE email = ?',
      [26, 'dbuser@example.com']
    );

    // Verify update
    const isValid = await dbClient.verifyRowData(
      'users',
      { email: 'dbuser@example.com' },
      { age: 26 }
    );
    expect(isValid).toBe(true);

    // Count users
    const count = await dbClient.countRows('users');
    expect(count).toBeGreaterThan(0);

    // Delete user
    await dbClient.execute(
      'DELETE FROM users WHERE email = ?',
      ['dbuser@example.com']
    );

    // Verify deletion
    const deleted = await dbClient.rowExists('users', {
      email: 'dbuser@example.com',
    });
    expect(deleted).toBe(false);
  });

  test.afterAll(async () => {
    await dbClient.close();
  });
});
```

### Example 4: E2E Integration Test (UI + API + Database)

```typescript
import { test, expect } from '../fixtures/test.fixture';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { APIClient } from '../api/APIClient';
import { DatabaseClient } from '../database/DatabaseClient';
import { testConfig, apiConfig, dbConfig } from '../config/config';

test.describe('End-to-End Integration', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let apiClient: APIClient;
  let dbClient: DatabaseClient;

  test.beforeAll(async () => {
    apiClient = new APIClient(apiConfig.baseUrl);
    dbClient = new DatabaseClient(dbConfig);
    await dbClient.connect();
  });

  test('Should verify data consistency across layers', async ({ page }) => {
    // Initialize page objects
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    // Step 1: Login via UI
    await loginPage.goto(testConfig.baseUrl + '/login');
    await loginPage.login(testConfig.testUser.email, testConfig.testUser.password);
    await loginPage.assertLoginSuccessful();

    // Step 2: Verify authentication via API
    const authResponse = await apiClient.get('/auth/verify');
    expect(authResponse.status).toBe(200);
    expect(authResponse.data.authenticated).toBe(true);
    expect(authResponse.data.email).toBe(testConfig.testUser.email);

    // Step 3: Verify user in database
    const userExists = await dbClient.rowExists('users', {
      email: testConfig.testUser.email,
    });
    expect(userExists).toBe(true);

    const user = await dbClient.queryOne(
      'SELECT * FROM users WHERE email = ?',
      [testConfig.testUser.email]
    );
    expect(user).toBeDefined();

    // Step 4: Get user profile from API
    const profileResponse = await apiClient.get('/users/profile');
    expect(profileResponse.status).toBe(200);

    // Step 5: Verify profile data in UI
    await dashboardPage.goto(testConfig.baseUrl + '/dashboard');
    const greeting = await dashboardPage.getUserGreeting();
    expect(greeting).toContain(profileResponse.data.name || user.name);

    // Step 6: Create new record via API
    const recordResponse = await apiClient.post('/records', {
      title: 'E2E Test Record',
      description: 'Created during E2E test',
    });
    expect(recordResponse.status).toBe(201);
    const recordId = recordResponse.data.id;

    // Step 7: Verify record in database
    const recordExists = await dbClient.rowExists('records', { id: recordId });
    expect(recordExists).toBe(true);

    // Step 8: Verify record in UI (if applicable)
    const tableData = await dashboardPage.getTableData();
    expect(tableData.some((row) => row.includes('E2E Test Record'))).toBe(true);

    // Step 9: Cleanup
    await dashboardPage.logout();
  });

  test.afterAll(async () => {
    await dbClient.close();
  });
});
```

### Example 5: Custom Page Object with Advanced Methods

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export class DataTablePage extends BasePage {
  // Locators
  private searchInput = this.page.locator('[data-testid="search"]');
  private filterButton = this.page.locator('button:has-text("Filter")');
  private tableRows = this.page.locator('table tbody tr');
  private sortHeaders = this.page.locator('table thead th[data-sortable="true"]');
  private noDataMessage = this.page.locator('[data-testid="no-data"]');
  private paginationNext = this.page.locator('button[aria-label="Next page"]');
  private paginationPrevious = this.page.locator('button[aria-label="Previous page"]');

  constructor(page: Page) {
    super(page);
  }

  // Custom methods
  async searchForRecord(searchTerm: string): Promise<void> {
    this.logger.info(`Searching for: ${searchTerm}`);
    await this.fill(this.searchInput, searchTerm);
    await this.wait(500); // Wait for search to complete
  }

  async getTableData(): Promise<Record<string, string>[]> {
    const rowCount = await this.tableRows.count();
    const data: Record<string, string>[] = [];

    for (let i = 0; i < rowCount; i++) {
      const row = this.tableRows.nth(i);
      const cells = row.locator('td');
      const cellCount = await cells.count();
      const rowData: Record<string, string> = {};

      for (let j = 0; j < cellCount; j++) {
        rowData[`cell${j}`] = await cells.nth(j).textContent() || '';
      }

      data.push(rowData);
    }

    return data;
  }

  async filterByColumn(columnName: string, value: string): Promise<void> {
    this.logger.info(`Filtering ${columnName} by: ${value}`);
    await this.click(this.filterButton);
    const filterInput = this.page.locator(`input[placeholder="Filter ${columnName}"]`);
    await this.fill(filterInput, value);
  }

  async sortByColumn(columnIndex: number): Promise<void> {
    this.logger.info(`Sorting column ${columnIndex}`);
    const header = this.sortHeaders.nth(columnIndex);
    await this.click(header);
  }

  async goToNextPage(): Promise<void> {
    this.logger.info('Going to next page');
    await this.click(this.paginationNext);
    await this.wait(500);
  }

  async goToPreviousPage(): Promise<void> {
    this.logger.info('Going to previous page');
    await this.click(this.paginationPrevious);
    await this.wait(500);
  }

  async assertNoDataDisplayed(): Promise<void> {
    await this.assertVisible(this.noDataMessage);
  }

  async assertTableHasRows(expectedCount: number): Promise<void> {
    const count = await this.tableRows.count();
    this.logger.info(`Table has ${count} rows, expected ${expectedCount}`);
    await this.page.expect(async () => {
      expect(count).toBeGreaterThanOrEqual(expectedCount);
    }).toPass();
  }
}
```

---

## 🔄 Test Execution Flow

```
Start Test
    ↓
Load Configuration (.env)
    ↓
Initialize Fixtures (Page, BasePage)
    ↓
Run beforeAll() hooks
    ↓
Run beforeEach() hooks
    ↓
Execute Test
    ├─ Arrange (Setup)
    ├─ Act (Perform actions)
    └─ Assert (Verify results)
    ↓
Run afterEach() hooks
    ↓
Run afterAll() hooks
    ↓
Generate Reports
    ├─ Screenshots
    ├─ Videos
    ├─ Traces
    └─ HTML/JSON/JUnit
    ↓
End Test
```

---

## 🎯 Testing Strategies

### 1. Pyramid Testing Approach
```
       E2E Tests
      /         \
    /             \
  API Tests --- DB Tests
        \       /
         \     /
       UI Tests
```

- **UI Tests**: 60% - Core functionality
- **API Tests**: 25% - Data validation
- **DB Tests**: 10% - Data integrity
- **E2E Tests**: 5% - Critical paths

### 2. Arrange-Act-Assert Pattern
```typescript
test('Description of what should happen', async () => {
  // ARRANGE - Setup test data and preconditions
  const testData = { email: 'test@example.com', password: 'password' };
  
  // ACT - Perform the action being tested
  await page.goto('/login');
  await loginPage.login(testData.email, testData.password);
  
  // ASSERT - Verify the expected outcome
  await expect(dashboardPage.greeting).toBeVisible();
});
```

### 3. Test Organization
- **Unit Tests**: Test individual components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Smoke Tests**: Quick validation of critical paths

---

## 📊 Reporting Examples

### HTML Report
- Test results with status
- Screenshots on failure
- Video playback
- Execution timeline
- Detailed error messages

### JSON Report
```json
{
  "config": { ... },
  "suites": [
    {
      "title": "Login Tests",
      "tests": [
        {
          "title": "Should login successfully",
          "status": "passed",
          "duration": 1234
        }
      ]
    }
  ]
}
```

### JUnit Report
```xml
<testsuites>
  <testsuite name="Login Tests">
    <testcase name="Should login successfully" time="1.234" />
  </testsuite>
</testsuites>
```

---

## 🚀 Advanced Features

### Parallel Execution
```bash
WORKERS=4 npm run test  # Run tests in parallel
```

### Retry Failed Tests
```bash
RETRIES=3 npm run test  # Retry failed tests 3 times
```

### Record Videos
```bash
VIDEO=always npm run test  # Record all tests
```

### Debug Mode
```bash
npm run test:debug  # Step through tests
```

### Custom Configuration
Create `playwright.config.local.ts` for local development:
```typescript
import config from './playwright.config';
export default {
  ...config,
  webServer: undefined,  // Use existing server
  use: {
    ...config.use,
    screenshot: 'always',  # Always capture
  },
};
```

---

## ✨ Framework Strengths

✅ **Well-Organized** - Clear separation of concerns  
✅ **Reusable** - Base classes and fixtures reduce duplication  
✅ **Maintainable** - Centralized configuration and page objects  
✅ **Scalable** - Easy to add new tests and pages  
✅ **Comprehensive** - Supports UI, API, DB testing  
✅ **Professional** - Proper error handling and logging  
✅ **Well-Documented** - Examples and guides included  

---

## 🎓 Learning Path

1. **Start Simple**: Run the example tests
2. **Explore Pages**: Review LoginPage and DashboardPage
3. **Create Page**: Add a new page object
4. **Write Test**: Create a UI test using the new page
5. **Add API**: Include API validation in your test
6. **Add DB**: Validate data in database
7. **Combine**: Create E2E test with all three layers
8. **Optimize**: Refactor and improve test structure

---

**You now have a production-ready testing framework!** 🎉

Start exploring the examples and create your first test.
