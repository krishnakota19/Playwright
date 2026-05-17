import { test } from '../../fixtures/test.fixture';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { APIClient } from '../../api/APIClient';
import { DatabaseClient } from '../../database/DatabaseClient';
import { testConfig, apiConfig, dbConfig } from '../../config/config';

test.describe('End-to-End Tests with API and DB Validation', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let apiClient: APIClient;
  let dbClient: DatabaseClient;

  test.beforeAll(async () => {
    // Initialize API client
    apiClient = new APIClient(apiConfig.baseUrl);
    if (apiConfig.authToken) {
      apiClient.setAuthToken(apiConfig.authToken);
    }

    // Initialize database client
    dbClient = new DatabaseClient(dbConfig);
    try {
      await dbClient.connect();
    } catch (error) {
      console.warn('Database connection failed, skipping DB validation');
    }
  });

  test.beforeEach(async ({ page }: { page: any }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.navigateToLoginPage(testConfig.baseUrl);
  });

  test.afterAll(async () => {
    if (dbClient) {
      await dbClient.close();
    }
  });

  test('Should login, verify API response, and validate database', async () => {
    // Step 1: Login via UI
    const email = testConfig.testUser.email;
    const password = testConfig.testUser.password;

    await loginPage.login(email, password);
    await loginPage.assertLoginSuccessful();

    // Step 2: Verify login via API
    const apiResponse = await apiClient.get('/auth/verify');
    test.expect(apiResponse.status).toBe(200);
    test.expect(apiResponse.data).toHaveProperty('authenticated', true);

    // Step 3: Validate user in database
    if (dbClient) {
      const userExists = await dbClient.rowExists('users', {
        email: email,
      });
      test.expect(userExists).toBe(true);
    }
  });

  test('Should validate user profile across UI, API, and database', async () => {
    // Login first
    await loginPage.login(testConfig.testUser.email, testConfig.testUser.password);

    // Step 1: Get user data from API
    const apiResponse = await apiClient.get('/users/profile');
    test.expect(apiResponse.status).toBe(200);
    const apiUserData: any = apiResponse.data;

    // Step 2: Verify data in UI
    await dashboardPage.navigateToDashboard(testConfig.baseUrl + '/dashboard');
    const greeting = await dashboardPage.getUserGreeting();
    test.expect(greeting).toContain(apiUserData.name);

    // Step 3: Verify data in database
    if (dbClient) {
      const dbUser = await dbClient.queryOne(
        'SELECT * FROM users WHERE email = ?',
        [testConfig.testUser.email]
      );
      test.expect(dbUser).toBeDefined();
      if (dbUser) {
        test.expect(dbUser.name).toBe(apiUserData.name);
      }
    }
  });

  test('Should verify dashboard table data with API', async () => {
    // Login
    await loginPage.login(testConfig.testUser.email, testConfig.testUser.password);

    // Navigate to dashboard
    await dashboardPage.navigateToDashboard(testConfig.baseUrl + '/dashboard');

    // Get table data from UI
    const tableData = await dashboardPage.getTableData();
    test.expect(tableData.length).toBeGreaterThan(0);

    // Get data from API
    const apiResponse = await apiClient.get('/data/table');
    test.expect(apiResponse.status).toBe(200);
    const apiData: any = apiResponse.data;

    // Compare counts
    test.expect(tableData.length).toBe(apiData.length);
  });

  test('Should insert data via API and verify in UI and database', async () => {
    // Login
    await loginPage.login(testConfig.testUser.email, testConfig.testUser.password);

    // Step 1: Create data via API
    const newRecord = {
      title: 'Test Record',
      description: 'Test Description',
    };
    const createResponse = await apiClient.post('/records', newRecord);
    test.expect(createResponse.status).toBe(201);
    const recordId = (createResponse.data as any).id;

    // Step 2: Verify in database
    if (dbClient) {
      const dbRecord = await dbClient.queryOne(
        'SELECT * FROM records WHERE id = ?',
        [recordId]
      );
      test.expect(dbRecord).toBeDefined();
      if (dbRecord) {
        test.expect(dbRecord.title).toBe(newRecord.title);
      }
    }

    // Step 3: Verify in UI
    await dashboardPage.navigateToDashboard(testConfig.baseUrl + '/dashboard');
    const tableData = await dashboardPage.getTableData();
    test.expect(tableData.some((row: any) => row.includes(newRecord.title))).toBe(true);
  });
});
