import { Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * Example Dashboard Page Object
 * Demonstrates UI validation and interactions
 */
export class DashboardPage extends BasePage {
  // Locators
  private userGreeting = this.page.locator('[data-testid="user-greeting"]');
  private logoutButton = this.page.locator('button:has-text("Logout")');
  private userProfile = this.page.locator('[data-testid="user-profile"]');
  private dataTable = this.page.locator('table');
  private tableRows = this.page.locator('table tbody tr');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to dashboard
   */
  async navigateToDashboard(url: string): Promise<void> {
    await this.goto(url);
  }

  /**
   * Get user greeting text
   */
  async getUserGreeting(): Promise<string> {
    return await this.getText(this.userGreeting);
  }

  /**
   * Assert user is logged in
   * @param expectedUserName - Expected user name in greeting
   */
  async assertUserLoggedIn(expectedUserName: string): Promise<void> {
    await this.assertText(this.userGreeting, expectedUserName);
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    this.logger.info('Logging out');
    await this.click(this.logoutButton);
    await this.waitForNavigation();
  }

  /**
   * Get user profile data
   */
  async getUserProfileData(): Promise<Record<string, string>> {
    const profileText = await this.getText(this.userProfile);
    return {
      profile: profileText,
    };
  }

  /**
   * Count table rows
   */
  async getTableRowCount(): Promise<number> {
    return await this.tableRows.count();
  }

  /**
   * Assert table is visible
   */
  async assertTableVisible(): Promise<void> {
    await this.assertVisible(this.dataTable);
  }

  /**
   * Get table data
   */
  async getTableData(): Promise<string[]> {
    const count = await this.getTableRowCount();
    const data: string[] = [];

    for (let i = 0; i < count; i++) {
      const row = this.page.locator(`table tbody tr:nth-child(${i + 1})`);
      const text = await this.getText(row);
      data.push(text);
    }

    return data;
  }

  /**
   * Assert logout button is visible
   */
  async assertLogoutButtonVisible(): Promise<void> {
    await this.assertVisible(this.logoutButton);
  }
}
