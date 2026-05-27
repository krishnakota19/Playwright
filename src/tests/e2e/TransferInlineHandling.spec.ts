// ########################################################################################################################################################################################################
// # AUTHOR                 : Krishna Kota
// # DATE                   : 05/27/2025
// # UPADTED BY             : NA
// # UPDATE ON              : NA
// # PRE-CONDITONS          : User should have access Consumer 
// ######################################################################################################################
// # EPIC DETAILS: Transfers
// # STORY DETAILS:  Business Logic for LAD/LON/LOC
// #######################################################################################################################


import { test, expect } from '../../../utils/customFixtures'
import { ConsumerLCD } from '../../../BusinessFunctions/Consumer';
import * as testdata from '../../testData/testData.json';
import { Report } from '../../../utils/reporter';



const userID = "rdylan.sit14";
const pwd = testdata.OLBSmokeLogin.Pswd;
//const url = testdata.OLBSmokeLogin.url;
const moveMoney = testdata.OLBMainMenuOptions.TransferMenu;

const checkingAct = '****9658';
const LoanAct = '****6446-1';
const LineOfCreditAct = '****2061-1';
const LADAct = '****5062-1';




test.describe('Test Inline error for Amount field with Internal - LON/LOC/LAD accounts | LOC/LAD to Internal accounts',  () => {
test.beforeAll(async ({ browserSetup,consumerFunctions,page }) => 
    {
      
    });
  
  // Parameterized test cases for TO Account List
  const toAccountCases = [
    { name: 'LON', toAccount: LoanAct },
    { name: 'LOC', toAccount: LineOfCreditAct },
    { name: 'LAD', toAccount: LADAct },
  ];

  toAccountCases.forEach(({ name, toAccount }) => {
    test(`Verify Inline errors for Amount when ${name} Account selected in TO Account List`, { tag: ['@Regression','@Transfers'] }, async ({ consumerFunctions, page }) => {
      Report.step(page, `Verify if user is able to Login to OLB Application`);
      await consumerFunctions.LaunchOLB();

      Report.step(page, 'Verify user is able to Login to Consumer Studio Application');
      await consumerFunctions.LoginToOLB(userID, pwd);

      Report.step(page, 'Verify Customer dashboard is displayed');
      await consumerFunctions.ClickKeyFeaturePopUp();
      await consumerFunctions.closeOffersPopup();
      await consumerFunctions.VerifyCustomerDashboardDisplay();

      Report.step(page, 'Navigate to Transfer');
      await consumerFunctions.ClickOnMainMenu(moveMoney);

      Report.step(page, `Check Inline error message for Amount field when ${name} account is selected in To Account dropdown`);
      await consumerFunctions.VerifyInlineErrorForAmountField(checkingAct, toAccount);

      Report.step(page, 'Log out of the Application');
      await consumerFunctions.LogoutOLB();
    });
  });

  // Parameterized test cases for FROM Account List
  const fromAccountCases = [
    { name: 'LOC', fromAccount: LineOfCreditAct },
    { name: 'LAD', fromAccount: LADAct },
  ];

  fromAccountCases.forEach(({ name, fromAccount }) => {
    test(`Verify Inline errors for Amount when ${name} Account selected in FROM Account List`, { tag: ['@Transfers'] }, async ({ consumerFunctions, page }) => {
      Report.step(page, `Verify if user is able to Login to OLB Application`);
      await consumerFunctions.LaunchOLB();

      Report.step(page, 'Verify user is able to Login to Consumer Studio Application');
      await consumerFunctions.LoginToOLB(userID, pwd);

      Report.step(page, 'Verify Customer dashboard is displayed');
      await consumerFunctions.ClickKeyFeaturePopUp();
      await consumerFunctions.closeOffersPopup();
      await consumerFunctions.VerifyCustomerDashboardDisplay();

      Report.step(page, 'Navigate to Transfer');
      await consumerFunctions.ClickOnMainMenu(moveMoney);

      Report.step(page, `Check Inline error message for Amount field when ${name} account is selected in FROM Account dropdown`);
      await consumerFunctions.VerifyInlineErrorForAmountFieldwhenLOCLADinFromList(fromAccount, checkingAct);

      Report.step(page, 'Log out of the Application');
      await consumerFunctions.LogoutOLB();
    });
  });
       
    // No manual page.close() needed; Playwright handles page lifecycle automatically.
    test.afterAll(async () => {
      
    });
});


