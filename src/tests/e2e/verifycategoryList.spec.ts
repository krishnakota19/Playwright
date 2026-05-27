// ########################################################################################################################################################################################################
// # AUTHOR                 : Krishna Kota
// # DATE                   : 02/20/2026
// # UPADTED BY             : NA
// # UPDATE ON              : NA
// # PRE-CONDITONS          : User should have access Consumer Studio
// ######################################################################################################################
// # EPIC DETAILS: enrich
// # Story ID : 
// #######################################################################################################################

import { test, expect } from '../../../utils/customFixtures';
import { ConsumerLCD } from '../../../BusinessFunctions/ConsumerLCD';
import { Report } from '../../../utils/reporter';
import { loadTestData } from '../../../../fixtures/globalSetup'


const testdata = loadTestData();
const userID = testdata.OLBSmokeLogin.userID;
const pwd = testdata.OLBSmokeLogin.Pswd;
const last4DigitOfAcctNum = testdata.OLBSmokeLogin.DDAAccount;
let expectedCategoryOptions = ["Cash Deposit","Cash Withdrawal","Cashback","Check Deposit","Checks Posted","Credit Card Payments","Digital Wallet","Dining","Direct Debit & Standing Order","Donations","Education","Entertainment","Fees & Other Charges","Groceries","Health & Fitness","Household","Insurance","Interest & Dividends","Kids & Family","Loan & Mortgage","Misc. Deposits","Office Expenses","Other","Other Repeating Deposits","Other Transfers","Paycheck, Pensions & Annuity","Personal Care","Savings & Investments","Shopping","Taxes & Authorities","Transportation","Transfers Between Own Accounts","Travel","Utilities"];


test.describe('Test Category List for Enrich Accounts', async () => {

    test(`Verify Category options from the Category list`, {tag:['@Regression','@PersoEnrich']}, async ({browserSetup, consumerFunctions, page}) => {
      Report.step(page, `Verify if user is able to Login to OLB Application`);
      await consumerFunctions.LaunchOLB();
    
      Report.step(page, 'Verify user is able to Login to Consumer Studio Application');
      await consumerFunctions.LoginToOLB(userID, pwd);

      Report.step(page, 'Verify Customer Dashboard is displayed');
      await consumerFunctions.ClickKeyFeaturePopUp();
      await consumerFunctions.closeOffersPopup();
      await consumerFunctions.VerifyCustomerDashboardDisplay();
    
      Report.step(page, 'Click on specific account number');
      await consumerFunctions.ClickingSpecificAccountOnCustomerDashboard(last4DigitOfAcctNum);

      Report.step(page, 'Click on First Posted Transaction Record');
      await consumerFunctions.clickOnFirstPostedTransactionRecord();
      
      Report.step(page, 'Click on Edit Category');
      await consumerFunctions.clickEditIconForCategory();

      Report.step(page, 'Capture category options from category list');
      const actualCategoryOptions = await consumerFunctions.captureCategoryList();

      Report.step(page, 'Verify category options match expected options');
      const sortedActualCategoryOptions = [...actualCategoryOptions].sort((a, b) => a.localeCompare(b));
      const sortedExpectedCategoryOptions = [...expectedCategoryOptions].sort((a, b) => a.localeCompare(b));
      expect(sortedActualCategoryOptions).toEqual(sortedExpectedCategoryOptions);
      if (sortedActualCategoryOptions.length === sortedExpectedCategoryOptions.length) {
        Report.pass(page, `Category options are matching expected options. Count: ${actualCategoryOptions.length}`);
      } else {
        Report.fail(page, `Category options mismatch. Expected: ${sortedExpectedCategoryOptions.length}, Actual: ${sortedActualCategoryOptions.length}`);
      }
      
    });
       
    test.afterAll(async ({consumerFunctions,page}) => {
      try {
        if (page && !page.isClosed()) {
          await Report.step(page, 'Log out of the Application');
          await consumerFunctions.LogoutOLB();
        }
      } catch (error) {
        console.log('Logout skipped or failed:', (error as Error).message);
      } finally {
        await page.close();
      }
    });
});


