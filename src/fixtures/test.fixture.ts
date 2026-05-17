import { test as base, expect, Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

type TestFixtures = {
  basePage: BasePage;
};

/**
 * Custom test fixture extending Playwright's base test
 * Provides BasePage instance for all tests
 */
export const test = base.extend<TestFixtures>({
  basePage: async ({ page }: { page: Page }, use: any) => {
    const basePage = new BasePage(page);
    await use(basePage);
  },
});

export { expect };
