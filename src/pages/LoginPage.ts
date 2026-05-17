import { Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * Example Login Page Object
 * Demonstrates UI interaction and validation
 */
export class LoginPage extends BasePage {
  // Locators
  private emailInput = this.page.locator('input[type="email"]');
  private passwordInput = this.page.locator('input[type="password"]');
  private loginButton = this.page.locator('button:has-text("Login")');
  private errorMessage = this.page.locator('[data-testid="error-message"]');
  private welcomeMessage = this.page.locator('[data-testid="welcome-message"]');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   */
  async navigateToLoginPage(url: string): Promise<void> {
    await this.goto(url);
  }

  /**
   * Perform login
   * @param email - User email
   * @param password - User password
   */
  async login(email: string, password: string): Promise<void> {
    this.logger.info(`Logging in with email: ${email}`);
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
    await this.waitForNavigation();
  }

  /**
   * Get error message
   */
  async getErrorMessage(): Promise<string> {
    await this.waitForElement(this.errorMessage);
    return await this.getText(this.errorMessage);
  }

  /**
   * Assert login successful
   */
  async assertLoginSuccessful(): Promise<void> {
    await this.assertVisible(this.welcomeMessage);
  }

  /**
   * Assert error message displayed
   * @param expectedMessage - Expected error message
   */
  async assertErrorMessage(expectedMessage: string): Promise<void> {
    await this.assertText(this.errorMessage, expectedMessage);
  }

  /**
   * Check if login button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.isEnabled(this.loginButton);
  }

  /**
   * Check if email input is visible
   */
  async isEmailInputVisible(): Promise<boolean> {
    return await this.isVisible(this.emailInput);
  }
}
