/*************************************************************************************
Description: This script automates the process of Login functionality
Script Name: LoginTest.spec.ts [Login]
Author: Krishna Kota
Contributors: 
Date Created: Mar 1, 2025
Last Modified: Jan 14, 2025
User Stories: 
Manual Test Cases Covered: <Zephyr_TC_ID>
************************************************************************************/

import { test, expect } from '../../../utils/shared-hooks';
import { LoginPage } from '../pages/LoginPage';
import { validCredentials, invalidCredentials } from '../test_data/credentials';
import { DashboardPage } from '../pages/DashboardPage';



test.describe('Test D1 Consumer Studio Login', () => {
   let loginPage: LoginPage;
   let dashboardPage: DashboardPage;
   
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('should successfully log in with valid credentials', { 
    tag: ['@smoke', '@sanity', '@regression'],
    annotation: [
      { type: 'TestCaseID', description: 'T4020' },
      { type: 'TestCaseID', description: 'T13670' }
    ]
  }, async ({ page }) => {
    await loginPage.launchApplication();
    await loginPage.submitLogin(validCredentials.username, validCredentials.password);
    await dashboardPage.isInterstitialDisplayed();
    await dashboardPage.isOffersModelwindowDisplayed();
    await expect(dashboardPage.getWelcomeHeader).toBeVisible();
    await loginPage.logOut();
  });

});
