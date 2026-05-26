// ########################################################################################################################################################################################################
// # AUTHOR                 : Krishna
// # DATE                   : 30/04/2026
// # UPADTED BY             : NA
// # UPDATE ON              : NA
// # PRE-CONDITONS          : User should have access OLB
// ######################################################################################################################
// # EPIC DETAILS: Transaction History
// # STORY DETAILS: ( Transaction History: Download Transactions)
// # STORY DETAILS: Story ID 
// #######################################################################################################################

import { test } from '../../../utils/customFixtures';
import { Report } from '../../../utils/reporter';
import { waitForSpinnerToClose } from '../../../utils/common';
import { loadTestData } from '../../../../fixtures/globalSetup';


const testdata = loadTestData();
const userID = testdata.OLBSmokeLogin.userID;
const pwd = testdata.OLBSmokeLogin.Pswd;
const DDAAccount = testdata.OLBSmokeLogin.DDAAccount;
const NHSAccount = testdata.OLBSmokeLogin.NHSAccount;
const FileType = 'CSV'; 
const today = new Date();
const specificDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
const endDate = specificDate;
const startDateObj = new Date(today);
startDateObj.setDate(today.getDate() - 30);
const startDate = `${String(startDateObj.getMonth() + 1).padStart(2, '0')}/${String(startDateObj.getDate()).padStart(2, '0')}/${startDateObj.getFullYear()}`;

  test.describe('Verify Download Transaction', async () => {
      test.beforeAll(async ({ browserSetup, consumerFunctions, page }) => {
        
    });

    test(`Validate Download Transactions in CSV with Transaction Period Option for DDA(Enrich Account) `, { tag: ['@Regression', '@TransactionHistory'] }, async ({ consumerFunctions, page }) => {
      await Report.step(page, `Verify if user is able to Login to OLB Application`);
      await consumerFunctions.LaunchOLB();
    
      await Report.step(page, 'Verify user is able to Login to Consumer Studio Application');
      await consumerFunctions.LoginToOLB(userID, pwd);
    
      await Report.step(page, 'Verify Customer Dashboard is displayed');
      await consumerFunctions.ClickKeyFeaturePopUp();
      await consumerFunctions.closeOffersPopup();
      await consumerFunctions.VerifyCustomerDashboardDisplay();

      await Report.step(page, `Click on account ending with "${DDAAccount} "`);
      await consumerFunctions.ClickingSpecificAccountOnCustomerDashboard(DDAAccount);
      
      await Report.step(page, 'Click on Download Icon in Transaction Details page');
      await consumerFunctions.ClickOnDownloadButton();

      await Report.step(page, 'Select File Type from dropdown');
      await consumerFunctions.selectFileType(FileType);

      await Report.step(page, 'select Transaction Period option');
      await consumerFunctions.selectTransactionPeriod();

      await Report.step(page, 'Verify Transactions are downloaded successfully');
      await consumerFunctions.ValidateDownloadTransactionsFunctionality();

      await Report.step(page, 'Logout of the Application');
      await consumerFunctions.LogoutOLB();
    });

    test(`Validate Download Transactions in CSV with Transaction Period Option for NHS(Non Enrich Account) `, { tag: ['@Regression', '@TransactionHistory'] }, async ({ consumerFunctions, page }) => {
      await Report.step(page, `Verify if user is able to Login to OLB Application`);
      await consumerFunctions.LaunchOLB();
    
      await Report.step(page, 'Verify user is able to Login to Consumer Studio Application');
      await consumerFunctions.LoginToOLB(userID, pwd);
    
      await Report.step(page, 'Verify Customer Dashboard is displayed');
      await consumerFunctions.ClickKeyFeaturePopUp();
      await consumerFunctions.closeOffersPopup();
      await consumerFunctions.VerifyCustomerDashboardDisplay();

      await Report.step(page, `Click on account ending with "${NHSAccount} "`);
      await consumerFunctions.ClickingSpecificAccountOnCustomerDashboard(NHSAccount);
      
      await Report.step(page, 'Click on Download Icon in Transaction Details page');
      await consumerFunctions.ClickOnDownloadButton();

      await Report.step(page, 'Select File Type from dropdown');
      await consumerFunctions.selectFileType(FileType);

      await Report.step(page, 'select Transaction Period option');
      await consumerFunctions.selectTransactionPeriod();

      await Report.step(page, 'Verify Transactions are downloaded successfully');
      await consumerFunctions.ValidateDownloadTransactionsFunctionality();

      await Report.step(page, 'Logout of the Application');
      await consumerFunctions.LogoutOLB();
    });

    test(`Validate Download Transactions in CSV with Custom Date Range for DDA(Enrich Account) `, { tag: ['@Regression', '@TransactionHistory'] }, async ({ consumerFunctions, page }) => {
      await Report.step(page, `Verify if user is able to Login to OLB Application`);
      await consumerFunctions.LaunchOLB();
    
      await Report.step(page, 'Verify user is able to Login to Consumer Studio Application');
      await consumerFunctions.LoginToOLB(userID, pwd);
    
      await Report.step(page, 'Verify Customer Dashboard is displayed');
      await consumerFunctions.ClickKeyFeaturePopUp();
      await consumerFunctions.closeOffersPopup();
      await consumerFunctions.VerifyCustomerDashboardDisplay();

      await Report.step(page, `Click on account ending with "${DDAAccount} "`);
      await consumerFunctions.ClickingSpecificAccountOnCustomerDashboard(DDAAccount);

      await Report.step(page, 'Click on Download Icon in Transaction Details page');
      await consumerFunctions.ClickOnDownloadButton();

      await Report.step(page, 'Select File Type from dropdown');
      await consumerFunctions.selectFileType(FileType);

      await Report.step(page, 'select Custom Date Range option and enter the date range');
      await consumerFunctions.selectCustomDateRange(startDate, endDate);


      await Report.step(page, 'Verify Transactions are downloaded successfully');
      await consumerFunctions.ValidateDownloadTransactionsFunctionality();

      await Report.step(page, 'Logout of the Application');
      await consumerFunctions.LogoutOLB();
    });

    test(`Validate Download Transactions in CSV with Custom Date Range for NHS(Non Enrich Account)`, { tag: ['@Regression', '@TransactionHistory'] }, async ({ consumerFunctions, page }) => {
      await Report.step(page, `Verify if user is able to Login to OLB Application`);
      await consumerFunctions.LaunchOLB();
    
      await Report.step(page, 'Verify user is able to Login to Consumer Studio Application');
      await consumerFunctions.LoginToOLB(userID, pwd);
    
      await Report.step(page, 'Verify Customer Dashboard is displayed');
      await consumerFunctions.ClickKeyFeaturePopUp();
      await consumerFunctions.closeOffersPopup();
      await consumerFunctions.VerifyCustomerDashboardDisplay();

      await Report.step(page, `Click on account ending with "${NHSAccount} "`);
      await consumerFunctions.ClickingSpecificAccountOnCustomerDashboard(NHSAccount);

      await Report.step(page, 'Click on Download Icon in Transaction Details page');
      await consumerFunctions.ClickOnDownloadButton();

      await Report.step(page, 'Select File Type from dropdown');
      await consumerFunctions.selectFileType(FileType);

      await Report.step(page, 'select Custom Date Range option and enter the date range');
      await consumerFunctions.selectCustomDateRange(startDate, endDate);


      await Report.step(page, 'Verify Transactions are downloaded successfully');
      await consumerFunctions.ValidateDownloadTransactionsFunctionality();

      await Report.step(page, 'Logout of the Application');
      await consumerFunctions.LogoutOLB();
    });

   

   test.afterAll(async ({ page }) => {
        await page.close();
    });
  });
