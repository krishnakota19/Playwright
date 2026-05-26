// ########################################################################################################################################################################################################
// # AUTHOR                 : Krishna Kota
// # DATE                   : 05/26/2026
// # PRE-CONDITONS          : User should have access application
// ######################################################################################################################
// # EPIC DETAILS: Transfers
// # STORY DETAILS: Story ID
// #######################################################################################################################
// Tip: To run specific test:
// npx playwright test tests/d1_Consumer/OLBRegression/Transfer/Transfer_ScheduledRecurringTransfer.test.ts -g 'Verify recurring transfer \| TwiceAMonth \| Until Canceled'
// #######################################################################################################################


import { test } from '../../../utils/customFixtures'
import * as testdata from '../../testData/testData.json';
import { Report } from '../../../utils/reporter';

const userID = "testuser01";
const pwd = testdata.OLBSmokeLogin.Pswd;
const moveMoney = testdata.OLBMainMenuOptions.TransferMenu;
const FromAccount = '****5432';
const ToAccount = '****1162';
const defaultNoOfTransfer = '2';

type RecurringTransferScenario = {
  frequency: string;
  transferContinueType: string;
  noOfTransfer: string;
  amount: string;
};

const recurringFrequencies = ['Once','Weekly','BiWeekly','TwiceAMonth','Monthly','Quarterly','Semi-annually','Annually'];
const untilOptions = ['Until Canceled','For a set number of transfers','Until a date I choose'];

const recurringTransferScenarios: RecurringTransferScenario[] = recurringFrequencies.flatMap((frequency, frequencyIndex) => {
  if (frequency === 'Once') {
    return [{
      frequency,
      transferContinueType: '',
      noOfTransfer: '',
      amount: `${frequencyIndex + 2}.11`
    }];
  }

  return untilOptions.map((transferContinueType, untilOptionIndex) => ({
    frequency,
    transferContinueType,
    noOfTransfer: transferContinueType === 'For a set number of transfers' ? defaultNoOfTransfer : '',
    amount: `${frequencyIndex + 2}.${untilOptionIndex + 1}${untilOptionIndex + 2}`
  }));
});

test.describe('Recurring transfer matrix by frequency and until option', () => {
  test.beforeAll(async ({ browserSetup }) => {
    // Keep empty: requesting browserSetup initializes PageContext for custom page fixture.
  });

  for (const scenario of recurringTransferScenarios) {
    const testTitle = scenario.frequency === 'Once'
      ? `Verify recurring transfer | ${scenario.frequency}`
      : `Verify recurring transfer | ${scenario.frequency} | ${scenario.transferContinueType}`;

    test(
      testTitle,
      { tag: ['@Regression', '@Transfers', '@RecurringMatrix'] },
      async ({ consumerFunctions, page }) => {
      await Report.step(page, 'Verify if user is able to Login to OLB Application');
      await consumerFunctions.LaunchOLB();
    
      await Report.step(page, 'Verify user is able to Login to Consumer Studio Application');
      await consumerFunctions.LoginToOLB(userID, pwd);

      await Report.step(page,'Verify Customer dashboard is displayed');
      await consumerFunctions.ClickKeyFeaturePopUp();
      await consumerFunctions.closeOffersPopup();
      await consumerFunctions.VerifyCustomerDashboardDisplay();
    
      await Report.step(page, 'Navigate to Transfer');
      await consumerFunctions.ClickOnMainMenu(moveMoney);

      const transferStep = scenario.frequency === 'Once'
        ? `Perform recurring transfer: ${scenario.frequency}`
        : `Perform recurring transfer: ${scenario.frequency} + ${scenario.transferContinueType}`;
      await Report.step(page, transferStep);
      await consumerFunctions.PerformScheduledTransfer(
        FromAccount,ToAccount,scenario.amount,scenario.frequency,scenario.transferContinueType,scenario.noOfTransfer
      );

      await Report.step(page, 'Log out of the Application');
      await consumerFunctions.LogoutOLB();
    });
  }

  test.afterAll(async ({ page }) => {
    await page.close();
  });
});


