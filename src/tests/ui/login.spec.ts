import { test, expect } from '../../fixtures/test.fixture';
import { LoginPage } from '../../pages/LoginPage';
import { testConfig } from '../../config/config';

test.describe('Login Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ basePage, page }: { basePage: any; page: any }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage(testConfig.baseUrl);
  });

  test('Should successfully login with valid credentials', async () => {
    // Arrange
    const email = testConfig.testUser.email;
    const password = testConfig.testUser.password;

    // Act
    await loginPage.login(email, password);

    // Assert
    await loginPage.assertLoginSuccessful();
  });

  test('Should display error message with invalid credentials', async () => {
    // Arrange
    const invalidEmail = 'invalid@example.com';
    const invalidPassword = 'wrongPassword';
    const expectedError = 'Invalid email or password';

    // Act
    await loginPage.login(invalidEmail, invalidPassword);

    // Assert
    await loginPage.assertErrorMessage(expectedError);
  });

  test('Should have email input visible', async () => {
    // Act & Assert
    const isVisible = await loginPage.isEmailInputVisible();
    expect(isVisible).toBe(true);
  });

  test('Should have login button enabled on page load', async () => {
    // Act
    const isEnabled = await loginPage.isLoginButtonEnabled();

    // Assert
    expect(isEnabled).toBe(true);
  });

  test('Should have correct page title', async ({ page }: { page: any }) => {
    // Act
    const title = await page.title();

    // Assert
    expect(title).toContain('Login');
  });
});
