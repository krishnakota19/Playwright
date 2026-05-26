import { Page } from 'playwright';
import { Report } from '../utils/reporter';
import { BasePage } from '../d1_Consumer/pages/BasePage';
import { Mutex } from 'async-mutex';
import { expect } from '@playwright/test';
import { checkTextVisibility, clickButton, clickElementByRole, clickElementByText, clickLinkByAccessibleName, clickTab, doesElementExist, enterTextFieldByRole, enterTextFieldUsingLabel, waitForSpinnerToClose } from '../utils/common';
import { OnlineEnrollmentPage } from '../Consumer/pages/OnlineEnrollmentPage';

const olbMutex = new Mutex();
const baseUrl = process.env.BASE_URL_CONSUMER;

export class Consumer extends BasePage {

    readonly btnLabelSignIn: string = 'Log in';
    readonly btnLabelContinue: string = 'Continue';
  
    constructor(page: Page) {
        super(page);

    }


    async LoginToMFBOLB(username: string, pswd: string) {
        const release = await olbMutex.acquire();
        try {
            await this.loginPage.LoginToOLBApplication(username, pswd);

        }
        catch (error) {
           // await Report.fail(this.page, `Login into OLB is NOT successful: ${error.message}`);
        }
        finally {
            release();
        }
    }
  


    async LaunchOLB() {
        const release = await olbMutex.acquire();
        try {
            console.log(`Navigating to OLB application URL: ${baseUrl}`);
            await this.page.goto(`${baseUrl}`);          
            await Report.pass(this.page, `Navigated to OLB application ${baseUrl} is successful`);
        } catch (error: string | any) {
            await Report.fail(this.page, `Navigated to OLB application ${baseUrl} is not successful: ${error.message}`);
        } finally {
            release();
        }
    }
  

    async PerformScheduledTransfer(FromAccount: string, ToAccount: string, Amount: string, Frequency: string, TransferContinueType: string, noOfTransfer: string) {
        await this.TransferPage.VerifyTransferPageDisplayed();
        await this.TransferPage.SelectFromAccount(FromAccount);
        await this.TransferPage.SelectToAccount(ToAccount);
        await this.TransferPage.EnterAmount(Amount);
        await this.TransferPage.SelectScheduledBtn();
        await this.TransferPage.SelectFrequency(Frequency);
        // await this.TransferPage.EnterStartDate(Frequency);
        if (['Once', 'One time'].includes(Frequency)) {
            await this.TransferPage.ClickContinuebtn();
            await this.TransferPage.VerifyTransferConfimrationReviewScreen();
            await this.TransferPage.ClickSubmitBtn();
            await this.TransferPage.VerifyTransferSuccessMsg();
            await this.TransferPage.ScheduleAnotherTransferBtn();
        }
        else {
            await this.TransferPage.SelectTransferContinueUntil(TransferContinueType);
            if(TransferContinueType==='Until a date I choose')
            {
                await this.TransferPage.EnterEndDate(Frequency);
            }
            else if(TransferContinueType==='For a set number of transfers')
            {
                await this.TransferPage.EnterNoOfTransfer(noOfTransfer);
            }
            await this.TransferPage.ClickContinuebtn();
            await this.TransferPage.VerifyTransferConfimrationReviewScreen();
            await this.TransferPage.ClickSubmitBtn();
            await this.TransferPage.VerifyTransferSuccessMsg();
            await this.TransferPage.ScheduleAnotherTransferBtn();
        }
    }

  

    async ValidatePostedColumnSortingDescending(header: string, type: 'date' | 'text' | 'currency') {
        await this.AccountDetailsPage.ValidatePostedColumnSortingDescending(header, type);
    }

    async ValidatePostedColumnSortingAscending(header: string, type: 'date' | 'text' | 'currency') {
        await this.AccountDetailsPage.ValidatePostedColumnSortingAscending(header, type);
    }

  
    async VerifyInlineErrorForAmountField(FromAccount: string, ToAccount: string) {
        await this.TransferPage.VerifyTransferPageDisplayed();
        const AvailableBal = await this.TransferPage.SelectFromAccountandGetAvailableBalance(FromAccount);
        const CurrentBal = await this.TransferPage.SelectToAccountandGetCurrentBalance(ToAccount);

        if (AvailableBal || CurrentBal) {
            await this.TransferPage.EnterAmountValue({ AvailableBal, CurrentBal });
        }
    }

    async VerifyInlineErrorForAmountFieldwhenLOCLADinFromList(FromAccount: string, ToAccount: string) {
        await this.TransferPage.VerifyTransferPageDisplayed();
        const AvailableCredit = await this.TransferPage.SelectFromAccountandGetAvailableBalance(FromAccount);
        await this.TransferPage.SelectToAccount(ToAccount);
        await this.TransferPage.EnterAmountValue({ AvailableCredit });
    }

}





