import { Page, Locator, expect } from '@playwright/test';
import { Logger } from '../utils/Logger';

/**
 * Base Page class that provides common functionality for all page objects
 * Includes navigation, element interactions, and validation methods
 */
export class BasePage {
  protected page: Page;
  protected logger: Logger;

  constructor(page: Page) {
    this.page = page;
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Navigate to a specific URL
   * @param url - URL to navigate to
   */
  async goto(url: string): Promise<void> {
    this.logger.info(`Navigating to: ${url}`);
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  /**
   * Get the current page URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click an element
   * @param locator - Playwright locator
   */
  async click(locator: Locator): Promise<void> {
    this.logger.info(`Clicking element: ${locator}`);
    await locator.click({ timeout: 5000 });
  }

  /**
   * Fill text input
   * @param locator - Playwright locator
   * @param text - Text to input
   */
  async fill(locator: Locator, text: string): Promise<void> {
    this.logger.info(`Filling text: ${text}`);
    await locator.fill(text);
  }

  /**
   * Get text from an element
   * @param locator - Playwright locator
   */
  async getText(locator: Locator): Promise<string> {
    return await locator.textContent() || '';
  }

  /**
   * Check if element is visible
   * @param locator - Playwright locator
   */
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible({ timeout: 3000 });
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   * @param locator - Playwright locator
   */
  async isEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled();
  }

  /**
   * Wait for element to be visible
   * @param locator - Playwright locator
   * @param timeout - Timeout in milliseconds
   */
  async waitForElement(locator: Locator, timeout = 5000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Get attribute value
   * @param locator - Playwright locator
   * @param attribute - Attribute name
   */
  async getAttribute(locator: Locator, attribute: string): Promise<string | null> {
    return await locator.getAttribute(attribute);
  }

  /**
   * Select option from dropdown
   * @param locator - Playwright locator
   * @param value - Option value to select
   */
  async selectOption(locator: Locator, value: string): Promise<void> {
    this.logger.info(`Selecting option: ${value}`);
    await locator.selectOption(value);
  }

  /**
   * Press keyboard key
   * @param key - Key to press
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Take screenshot
   * @param name - Screenshot name
   */
  async takeScreenshot(name: string): Promise<Buffer> {
    const path = `./screenshots/${name}-${Date.now()}.png`;
    this.logger.info(`Taking screenshot: ${path}`);
    return await this.page.screenshot({ path });
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Close the page
   */
  async closePage(): Promise<void> {
    await this.page.close();
  }

  /**
   * Refresh the page
   */
  async refreshPage(): Promise<void> {
    this.logger.info('Refreshing page');
    await this.page.reload();
  }

  /**
   * Wait for specific timeout
   * @param ms - Milliseconds to wait
   */
  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  /**
   * Execute JavaScript in page context
   * @param script - JavaScript code to execute
   */
  async executeScript<T>(script: string): Promise<T> {
    return await this.page.evaluate<T>(script);
  }

  /**
   * Switch to specific frame
   * @param frameName - Frame name
   */
  async switchToFrame(frameName: string): Promise<void> {
    const frame = this.page.frames().find(f => f.name() === frameName);
    if (!frame) throw new Error(`Frame ${frameName} not found`);
  }

  /**
   * Assert element text
   * @param locator - Playwright locator
   * @param expectedText - Expected text
   */
  async assertText(locator: Locator, expectedText: string): Promise<void> {
    this.logger.info(`Asserting text: ${expectedText}`);
    await expect(locator).toContainText(expectedText);
  }

  /**
   * Assert element is visible
   * @param locator - Playwright locator
   */
  async assertVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  /**
   * Assert element is hidden
   * @param locator - Playwright locator
   */
  async assertHidden(locator: Locator): Promise<void> {
    await expect(locator).toBeHidden();
  }

  /**
   * Assert element is enabled
   * @param locator - Playwright locator
   */
  async assertEnabled(locator: Locator): Promise<void> {
    await expect(locator).toBeEnabled();
  }

  /**
   * Assert element is disabled
   * @param locator - Playwright locator
   */
  async assertDisabled(locator: Locator): Promise<void> {
    await expect(locator).toBeDisabled();
  }

  /**
   * Assert page has specific URL
   * @param url - Expected URL pattern
   */
  async assertUrl(url: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(url));
  }
}
