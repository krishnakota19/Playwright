import { Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { test, expect } from '@playwright/test';




export class Report {
  static async info(page: Page, message: string) {
    await this.log(page, message, 'INFO');
  }

  static async step(page: Page, message: string, s?: string | null) {
    await this.log(page, message, 'STEP');
  }

  static async pass(page: Page, message: string) {
    await this.log(page, message, 'PASS');
  }

  static async fail(page: Page, message: string) {
    await this.log(page, message, 'FAIL');
  }

  private static async log(page: Page, message: string, level: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.resolve(`screenshots/${timestamp}.png`);

    try {
      await page.screenshot({ path: screenshotPath});
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }

    // Use test.step to reflect the actual pass/fail status (only valid inside a test context)
    let inTestContext = false;
    try {
      test.info(); // throws if not in a test context
      inTestContext = true;
    } catch {
      // Called outside a test (e.g. beforeAll/afterAll/globalSetup) — skip test.step
    }

    if (inTestContext) {
      await test.step(`${level}: ${message}`, async () => {
        if (level === 'FAIL') {
          throw new Error(message); // This will mark the step as failed
        } else {
          const validLevels = ['INFO', 'STEP', 'PASS'];
          expect(validLevels).toContain(level);
        }
      });

      // Attach the screenshot to the report
      if (fs.existsSync(screenshotPath)) {
        await test.info().attach(`${level} - ${message.replace(/[^a-z0-9$%\/\-:.]/gi, '-').slice(0, 200)}`, {
          path: screenshotPath,
          contentType: 'image/png',
        });
      }
    } else {
      console.log(`[${level}] ${message}`);
      if (level === 'FAIL') {
        throw new Error(message);
      }
    }
  }
}
