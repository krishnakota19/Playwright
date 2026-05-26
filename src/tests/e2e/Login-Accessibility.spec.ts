/*************************************************************************************
Description: This script automates the process of Login functionality with accessibility scanning
Script Name: LoginTestAccessibility.spec.ts [Login Accessibility]
Author: Krishna Kota
User Stories: 
Manual Test Cases Covered: <Zephyr_TC_ID>
************************************************************************************/

import { test, expect } from '../../../utils/shared-hooks';
import { LoginPage } from '../pages/LoginPage';
import { validCredentials } from '../test_data/credentials';
import { DashboardPage } from '../pages/DashboardPage';
import { AccessibilityScan, A11Y_CONFIGS } from '../../../utils/accessibility-utils';


test.describe('Test D1 Consumer Studio Login with Accessibility Scanning', () => {
   let loginPage: LoginPage;
   let dashboardPage: DashboardPage;
   let loginSuccessful = false;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    loginSuccessful = false; // Reset before each test
    
  });
 
  test('accessibility scan after successful login attempt', { tag: ['@accessibility', '@regression'] }, async ({ page }) => {
    await loginPage.launchApplication();
    // Perform comprehensive AXE accessibility scan using utility (flag-based)
    await AccessibilityScan(page, A11Y_CONFIGS.WCAG_21_AA, true);
    
    await loginPage.submitLogin(validCredentials.username, validCredentials.password);
    
    // Perform AXE accessibility scan on the resulting page using utility (flag-based)
    await AccessibilityScan(page, A11Y_CONFIGS.WCAG_21_AA, true);
  });
});
