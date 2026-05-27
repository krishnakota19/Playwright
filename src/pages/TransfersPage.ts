import { Locator, Page } from 'playwright';
import { test, expect } from '@playwright/test';
import { Report } from '../../utils/reporter';
import { clickElementByRole, doesElementExist, enterTextFieldByRole, enterTextFieldUsingLabel, waitForSpinnerToClose } from '../../utils/common';
import libs from 'dee-qe-web-libs';
import { clickButton, clickElementByText } from '../../utils/common';
import { link } from "node:fs/promises";
import { setTimeout } from 'timers/promises';
import { OnlineEnrollmentPage } from '../../d1_Consumer/pages/OnlineEnrollmentPage';
import { getCurrentDatePlusNAvoidingWeekends } from '../../utils/common';

export class TransferPage {
    private page: Page;
    readonly extAccountsTab: Locator;
    readonly scheduledTransactionsTab: Locator;
    readonly externalAccounttab: Locator;
    readonly AddexternalAccountbtn: Locator;
    readonly MaxexternalAccountMsg: Locator;
    readonly MaxexternalAccountMsgcloseBtn: Locator;
    readonly continueButton: Locator;
    readonly nextButton: Locator
    readonly transferTab: Locator;
    readonly scheduleanothertransferBtn: Locator;
    readonly Futuredate: Locator;
    readonly scheduledRadioBtn: Locator;
    readonly amountField: Locator;
    readonly submitTransferButton: Locator;
    readonly successfulTransferMessage: Locator;
    readonly AccountLockedtxt: Locator;
    readonly AccountLockedtxtCancelBtn: Locator;
    readonly AccountLockedtxtmsg: Locator;
    readonly RemoveAccounttxt: Locator;
    readonly RemoveAccountCancelBtn: Locator;
    readonly Fromaccountdropdown: string = 'select[name="formTransferFrom_formWidget"]';
    readonly Toaccountdropdown: string = 'select[name="formTransferTo_formWidget"]';
    readonly Frequencydropdown: string = 'select[name="formFrequency_formWidget"]';
    readonly Startdate: Locator;
    readonly noOfTransfer:Locator;

    readonly Enddate: Locator;
    readonly TransferConfimrationReview: Locator;
    readonly Continuestxt: Locator;
    readonly deletescheduledtransfertxt: Locator;
    readonly deletescheduledtransferyesbtn: Locator;
    readonly editscheduledtransfertxt: Locator;
    readonly editscheduledtransferamountfield: Locator;
    readonly editscheduledtransferupdatebtn: Locator;
    readonly editscheduledtransferconfirmmsg: Locator;
    readonly editscheduledtransferconfirmmsgokbtn: Locator;
    readonly firstRecordSchedTransfer:Locator;
    readonly deleteBtn:Locator;
    readonly deleteTranPopupHead:Locator;
    readonly fundsAvailMsg1:Locator;
    readonly fundsAvailMsg2:Locator;
    readonly intTransLabel:Locator;
    readonly intTransVerb:Locator;
    readonly extTransLabel:Locator;
    readonly extTransVerb:Locator;
    readonly editBtn:Locator;
    readonly editAmtField:Locator;
    readonly editDateField:Locator;
    readonly updateBtn:Locator;
    readonly editFreqDropdown:Locator;
    readonly amtFieldOnSched:Locator;
    readonly dateFieldOnSched:Locator;
    readonly freqFieldOnSched:Locator;
    readonly fromLbl:Locator;
    readonly toLbl:Locator;
    readonly transferDateLbl:Locator;
    readonly amtLbl:Locator;
    readonly typeLbl:Locator;
    readonly freqLbl:Locator;
    readonly dateHdr:Locator;
    readonly fromHdr:Locator;
    readonly toHdr:Locator;
    readonly amtHdr:Locator;
    readonly fromValue:Locator;
    readonly toValue:Locator;
    readonly transferDateValue:Locator;
    readonly amtValue:Locator;
    readonly typeValue:Locator;
    readonly freqValue:Locator;
    readonly totalRecordsText:Locator;
    readonly noSceduledTransactionsMsg:Locator;
    readonly amountExceedErrorMsg:Locator;
    readonly VerifyRegularPaymentOption:Locator;


    constructor(page: Page) {
        this.page = page;
        this.transferTab = page.getByLabel('Transfers', { exact: true });
        this.extAccountsTab = page.getByLabel('External Accounts');
        this.scheduledTransactionsTab = page.getByLabel('Scheduled Transactions');
        this.externalAccounttab = page.locator('xpath=//span[text()="External Accounts"]');
        this.AddexternalAccountbtn = page.locator('xpath=//span[text()="Add External Account"]');
        this.MaxexternalAccountMsg = page.locator('xpath=//span[text()="You have exceeded maximum number of External accounts applicable to you. Please review or contact us for support."]');
        this.MaxexternalAccountMsgcloseBtn = page.locator('xpath=//span[text()="Close"]');
        this.nextButton = page.getByLabel('NEXT');
        this.continueButton = page.locator('xpath=(//button[@title="Continue"])[1]');
        this.Futuredate = page.getByText('Future date');
        this.scheduledRadioBtn = page.locator('xpath=//span[text()="Scheduled"]');
        this.scheduleanothertransferBtn = page.locator('xpath=//span[text()="Make Another Transfer"]');
        this.amountField = page.locator('div.app-currency [name=body__requestData_amt_formWidget]');
        this.submitTransferButton = page.getByRole('button', { name: 'Submit Transfer' });
        this.successfulTransferMessage = page.locator('.transfer-success-container');
        this.AccountLockedtxt = page.locator('xpath=//span[text()="Account Locked"]');
        this.AccountLockedtxtCancelBtn = page.locator('xpath=//span[text()="Account Locked"]/../../following-sibling::div[2]/button[2]');
        this.AccountLockedtxtmsg = page.locator('xpath=(//span[contains(text(),"Something went wrong!")])[2]');
        this.RemoveAccounttxt = page.locator('xpath=//span[contains(text(),"Are you sure you want to remove this account?")]');
        this.RemoveAccountCancelBtn = page.locator('xpath=(//span[text()="Cancel"])[2]');
        this.Startdate = page.getByLabel('Start date');
        this.Enddate = page.locator(`//input[contains(@name,'endDate_formWidget')]`);
        this.TransferConfimrationReview = page.locator('xpath=(//*[contains (text(),"Review Your Transfer Details")])[2]');
        this.Continuestxt = page.getByText('Continues');
        this.deletescheduledtransfertxt = page.locator('//span[contains(text(),"Are you sure")]');
        this.deletescheduledtransferyesbtn = page.locator('//button[@aria-label="Yes, Delete"]');
        this.editscheduledtransfertxt = page.getByRole('heading',{name:'Edit Transfer Details'});
        this.editscheduledtransferamountfield = page.getByRole('textbox',{name:'USD'});
        this.editscheduledtransferupdatebtn = page.getByRole('button',{name:'UPDATE'});
        this.editscheduledtransferconfirmmsg = page.getByText('Your transfer was updated successfully');
        this.editscheduledtransferconfirmmsgokbtn = page.getByRole('button',{name:'Ok'});
        this.noOfTransfer = page.locator('xpath=//input[contains(@name,"numberOfTransfers")]');
        this.deleteTranPopupHead = page.locator('xpath=//h4/span[text()="Delete Transfer"]');
        this.firstRecordSchedTransfer = page.locator('xpath=(//tr/td[5])[1]');
        this.deleteBtn = page.locator('xpath=//button[@name="buttonDelete"]');
        this.fundsAvailMsg1 = page.locator('xpath=(//*[@name="fundsAvailabilityDetails"]/div[2]/div/div/label/p[1])[1]');
        this.fundsAvailMsg2 = page.locator('xpath=(//*[@name="fundsAvailabilityDetails"]/div[2]/div/div/label/p[2])[1]');
        this.intTransLabel = page.locator('xpath=//*[@name="fundsAvailabilityDetails"]/div[2]/div/div/label[2]/p/b/u');
        this.intTransVerb = page.locator('xpath=//*[@name="fundsAvailabilityDetails"]/div[2]/div/div/label[2]/div/p[1]');
        this.extTransLabel = page.locator('xpath=//*[@name="fundsAvailabilityDetails"]/div[2]/div/div/label[2]/div/p[2]/b/u');
        this.extTransVerb = page.locator('xpath=//*[@name="fundsAvailabilityDetails"]/div[2]/div/div/label[2]/div/div/p');
        this.editBtn = page.locator('xpath=//button[@name="buttonEdit"]');
        this.editAmtField = page.locator('xpath=(//input[@name="body__requestData_amt_formWidget"])[2]');
        this.editDateField = page.locator('xpath=(//input[@name="formStartDate_formWidget"])[2]');
        this.updateBtn = page.locator('xpath=//button[@title="Update"]');
        this.editFreqDropdown = page.locator('xpath=(//select[@name="formFrequency_formWidget"])[2]');
        this.amtFieldOnSched = page.locator('xpath=(//label[@name="labelAmountValue"])[2]');
        this.dateFieldOnSched = page.locator('xpath=//label[@name="labelDateValue"]');
        this.freqFieldOnSched = page.locator('xpath=//label[@name="labelFrequencyValue"]');
        this.fromLbl = page.locator('xpath=(//label[text()="From:"])[1]');
        this.fromValue = page.locator('xpath=(//label[text()="From:"])[1]/../../div[2]/label');
        this.toLbl = page.locator('xpath=(//label[text()="To:"])[1]');
        this.toValue = page.locator('xpath=(//label[text()="To:"])[1]/../../div[2]/label');
        this.transferDateLbl = page.locator('xpath=(//label[text()="Transfer Date:"])[1]');
        this.transferDateValue = page.locator('xpath=(//label[text()="Transfer Date:"])[1]/../../div[2]/label');
        this.amtLbl = page.locator('xpath=(//label[text()="Amount:"])[2]');
        this.amtValue = page.locator('xpath=(//label[text()="Amount:"])[2]/../../div[2]/label');
        this.typeLbl = page.locator('xpath=(//label[text()="Type:"])[1]');
        this.typeValue = page.locator('xpath=(//label[text()="Type:"])[1]/../../div[2]/label');
        this.freqLbl = page.locator('xpath=(//label[text()="Frequency:"])[1]');
        this.freqValue = page.locator('xpath=(//label[text()="Frequency:"])[1]/../../div[2]/label');
        this.dateHdr = page.locator('xpath=//th/span[text()="Date"]');
        this.fromHdr = page.locator('xpath=//th/span[text()="From"]');
        this.toHdr = page.locator('xpath=//th/span[text()="To"]');
        this.amtHdr = page.locator('xpath=//th/span[text()="Amount"]');
        this.totalRecordsText= page.locator('xpath=//li[@class="totalcount disabled basiccount"]//a');
        this.noSceduledTransactionsMsg= page.locator('xpath=//span[text()="There are no scheduled transactions."]');
        this.amountExceedErrorMsg = page.locator('xpath=//p[@class="help-block text-danger"]//span');
        this.VerifyRegularPaymentOption = page.locator('input[type="radio"][aria-label="Recurring Transfer"]');
   
    }

    async VerifyTransferPageDisplayed() {
        try {
            await expect(this.page).toHaveURL(/.*Transfers/);
            await expect(this.transferTab).toBeVisible();
            await expect(this.extAccountsTab).toBeVisible();
            await expect(this.scheduledTransactionsTab).toBeVisible();
            await Report.pass(this.page, 'Transfer page is displayed');



        }
        catch (error) {
            await Report.fail(this.page, `VerifyTransferPageDisplayed is failed :${error.message}`);
        }
    }



    async ClickNextbtn() {
        try {
            await this.nextButton.scrollIntoViewIfNeeded();
            await this.nextButton.click();
            await Report.pass(this.page, 'Next button is clicked');
        }
        catch (error) {
            await Report.fail(this.page, `ClickNextbtn is failed :${error.message}`);
        }
    }

    async ClickContinuebtn() {
        try {
            await this.continueButton.scrollIntoViewIfNeeded();
            await this.continueButton.click();
            await Report.pass(this.page, 'Continue button is clicked');
        }
        catch (error) {
            await Report.fail(this.page, `ClickContinuebtn is failed :${error.message}`);
        }
    }

    async VerifyTransferConfimrationReviewScreen() {
        try {
            await this.TransferConfimrationReview.scrollIntoViewIfNeeded();
            await this.TransferConfimrationReview.isVisible();
            await Report.pass(this.page, 'Transfer Confimration Review screen is displaying');
        }
        catch (error) {
            await Report.fail(this.page, `VerifyTransferConfimrationReviewScreen is failed :${error.message}`);
        }
    }

    async ClickSubmitBtn() {
        try {
            await this.submitTransferButton.scrollIntoViewIfNeeded();
            await this.submitTransferButton.click();
            await Report.pass(this.page, 'Submit button is clicked');
        }
        catch (error) {
            await Report.fail(this.page, `ClickSubmitBtn is failed :${error.message}`);
        }
    }

    async ScheduleAnotherTransferBtn() {
        try {
            await this.scheduleanothertransferBtn.scrollIntoViewIfNeeded();
            await this.scheduleanothertransferBtn.click();
            await this.transferTab.waitFor();
            await Report.pass(this.page, 'Schedule Another Transfer Button  is clicked');
        }
        catch (error) {
            await Report.fail(this.page, `ScheduleAnotherTransferBtn is failed :${error.message}`);
        }
    }
    async VerifyTransferSuccessMsg() {
        try {
            await this.successfulTransferMessage.waitFor();
            await this.successfulTransferMessage.scrollIntoViewIfNeeded();
            await this.successfulTransferMessage.isVisible();
            await Report.pass(this.page, 'Transfer success message is displaying');

        }
        catch (error) {
            await Report.fail(this.page, `VerifyTransferSuccessMsg is failed :${error.message}`);
        }
    }

    async TransferErrMsg() {
        try {
            await this.transferTab.scrollIntoViewIfNeeded();
            await expect(this.page.getByText('Select your from account')).toBeVisible();
            await expect(this.page.getByText('Select your to account')).toBeVisible();
            await expect(this.page.getByText('Enter your amount')).toBeVisible();
            await Report.pass(this.page, 'Expected Error message are displaying');
            await this.Futuredate.click();
            await setTimeout(200);
            await this.nextButton.click();
            await setTimeout(2000);
            await this.nextButton.scrollIntoViewIfNeeded();
            await expect(this.page.locator('xpath=(//span[text()="Select your transfer frequency"])[1]')).toBeVisible();
            await expect(this.page.locator('xpath=(//span[text()="Select your transfer start date"])[1]')).toBeVisible();
            await Report.pass(this.page, 'Expected Error message are displaying');



        }
        catch (error) {
            await Report.fail(this.page, `TransferErrMsg is failed :${error.message}`);
        }
    }


    async VerifyMaxEnternalAccAdded() {
        try {
            await this.externalAccounttab.click();
            await this.AddexternalAccountbtn.click();
            await expect(this.MaxexternalAccountMsg).toBeVisible();
            await Report.pass(this.page, 'You have exceeded maximum number of External accounts applicable to you. Please review or contact us for support. is displaying');
            await this.MaxexternalAccountMsgcloseBtn.click();


        }
        catch (error) {
            await Report.fail(this.page, `VerifyMaxEnternalAccAdded is failed :${error.message}`);
        }
    }

    async SelectFromAccount(FromaccountNumber: string) {
        try {
            const optionLocator = `${this.Fromaccountdropdown} option:has-text("${FromaccountNumber}")`;
            const optionElement = await this.page.locator(optionLocator).elementHandle();
            const optionValue = await optionElement?.getAttribute('value');

            // Select the option by its value
            if (optionValue) {
                await this.page.selectOption(this.Fromaccountdropdown, optionValue);
                await Report.pass(this.page, 'From Account is selected');
            }
            else {
                throw new Error(`Option with account number ${FromaccountNumber} not found`);
            }
        }
        catch (error) {
            await Report.fail(this.page, `SelectFromAccount is failed :${error.message}`);
        }
    }

    async SelectFromAccountandGetAvailableBalance(FromaccountNumber: string): Promise<string | null> {
    try {
        const optionLocator = `${this.Fromaccountdropdown} option:has-text("${FromaccountNumber}")`;
        const optionElement = await this.page.locator(optionLocator).elementHandle();
        const optionValue = await optionElement?.getAttribute('value');

        if (optionValue) {
            await this.page.selectOption(this.Fromaccountdropdown, optionValue);
            // Extract the text content for the option
            const optionText = await optionElement?.textContent();
            // Regex to extract balance, e.g., $948.16
            const match = optionText?.match(/\(Available:\s*\$([0-9,]+\.\d{2})\)/);
            const availableBalance = match ? match[1] : null;
            await Report.pass(this.page, 'From Account is selected');
            return availableBalance;
        } else {
            throw new Error(`Option with account number ${FromaccountNumber} not found`);
        }
    } catch (error) {
        await Report.fail(this.page, `SelectFromAccount is failed :${error.message}`);
        return null;
    }
}

async SelectFromAccountLoanActsandGetAvailableCredit(FromaccountNumber: string): Promise<string | null> {
    try {
        const optionLocator = `${this.Fromaccountdropdown} option:has-text("${FromaccountNumber}")`;
        const optionElement = await this.page.locator(optionLocator).elementHandle();
        const optionValue = await optionElement?.getAttribute('value');

        if (optionValue) {
            await this.page.selectOption(this.Fromaccountdropdown, optionValue);
            // Extract the text content for the option
            const optionText = await optionElement?.textContent();
            // Regex to extract balance, e.g., $948.16
            const match = optionText?.match(/\(Available Credit:\s*\$([0-9,]+\.\d{2})\)/);
            const availableCredit = match ? match[1] : null;
            await Report.pass(this.page, 'From Account is selected');
            return availableCredit;
        } else {
            throw new Error(`Option with account number ${FromaccountNumber} not found`);
        }
    } catch (error) {
        await Report.fail(this.page, `SelectFromAccount is failed :${error.message}`);
        return null;
    }
}


    async SelectToAccount(ToAccountNumber: string) {
        try {
            await waitForSpinnerToClose(this.page);
            const optionLocator = `${this.Toaccountdropdown} option:has-text("${ToAccountNumber}")`;
            const optionElement = await this.page.locator(optionLocator).elementHandle();
            const optionValue = await optionElement?.getAttribute('value');

            // Select the option by its value
            if (optionValue) {
                await this.page.selectOption(this.Toaccountdropdown, optionValue);
                await this.page.waitForTimeout(2000);
                await Report.pass(this.page, 'To Account is selected');
            }
            else {
                throw new Error(`Option with account number ${ToAccountNumber} not found`);
            }
        }
        catch (error) {
            await Report.fail(this.page, `SelectToAccount is failed :${error.message}`);
        }
    }

    async SelectToAccountandGetCurrentBalance(ToAccountNumber: string) {
        try {
            const optionLocator = `${this.Toaccountdropdown} option:has-text("${ToAccountNumber}")`;
        const optionElement = await this.page.locator(optionLocator).elementHandle();
        const optionValue = await optionElement?.getAttribute('value');

        if (optionValue) {
            await this.page.selectOption(this.Toaccountdropdown, optionValue);
            // Extract the text content for the option
            const optionText = await optionElement?.textContent();
            // Regex to extract balance, e.g., $948.16
            const match = optionText?.match(/\(Current Balance:\s*\$([0-9,]+\.\d{2})\)/);
            const currentBalance = match ? match[1] : null;
            await Report.pass(this.page, 'From Account is selected');
            return currentBalance;
        } else {
            throw new Error(`Option with account number ${ToAccountNumber} not found`);
        }
        }
        catch (error) {
            await Report.fail(this.page, `SelectToAccount is failed :${error.message}`);
        }
    }

    async EnterAmount(Amount: string) {
        try {
            await this.amountField.fill(Amount);
            await Report.pass(this.page, 'Amount is entered');

        }
        catch (error) {
            await Report.fail(this.page, `EnterAmount is failed :${error.message}`);
        }
    }

    /**
     * EnterAmountValue can accept either a string (amount), or an object with AvailableBal and/or CurrentBal for inline validation.
     * If passed an object, it will parse and validate both balances and perform inline error checks.
     */
    async EnterAmountValue(input: { AvailableBal?: string | null, CurrentBal?: string | null , AvailableCredit?: string | null }) {
        try {
            let availBalNum = 0, currNum = 0, availCreditNum = 0;
            if (input.AvailableBal) availBalNum = parseFloat(input.AvailableBal.replace(/,/g, ""));
            if (input.CurrentBal) currNum = parseFloat(input.CurrentBal.replace(/,/g, ""));
            if (input.AvailableCredit) availCreditNum = parseFloat(input.AvailableCredit.replace(/,/g, ""));

            // 1) Validate inline error for available balance exceeded
            if (availBalNum > 0) {
                const amountExceedAvail = (availBalNum + 1).toFixed(2);
                await this.amountField.fill(amountExceedAvail);
                await this.page.keyboard.press('Tab');
                const errorMsg = await this.amountExceedErrorMsg.textContent();
                if (errorMsg?.includes('Transfer amount should not exceed available balance.')) {
                    await Report.pass(this.page, `Correct inline error message is displayed for amount exceeding available balance: ${errorMsg}`);
                } else {
                    await Report.fail(this.page, `Incorrect or no inline error message for amount exceeding available balance. Found: ${errorMsg}`);
                }
            }

            // 2) Validate inline error for current balance exceeded
            if (currNum > 0) {
                const amountExceedCurr = (currNum + 1).toFixed(2);
                await this.amountField.fill(amountExceedCurr);
                await this.page.keyboard.press('Tab');
                const errorMsg = await this.amountExceedErrorMsg.textContent();
                if (errorMsg?.includes('Payments can not be greater than current balance. Please review and try again.')) {
                    await Report.pass(this.page, `Correct inline error message is displayed for amount exceeding available balance: ${errorMsg}`);
                } else {
                    await Report.fail(this.page, `Incorrect or no inline error message for amount exceeding available balance. Found: ${errorMsg}`);
                }
            }
            // 3) If AvailableCredit is provided, validate inline error for credit limit exceeded
            if (availCreditNum > 0) {
                const amountExceedCredit = (availCreditNum + 1).toFixed(2);
                await this.amountField.fill(amountExceedCredit);
                await this.page.keyboard.press('Tab');
                const errorMsg = await this.amountExceedErrorMsg.textContent(); 
                if (errorMsg?.includes('Transfer amount should not exceed available credit')) {
                    await Report.pass(this.page, `Correct inline error message is displayed for amount exceeding available credit: ${errorMsg}`);
                } else {
                    await Report.fail(this.page, `Incorrect or no inline error message for amount exceeding available credit. Found: ${errorMsg}`);
                }
            }
        } catch (error) {
            await Report.fail(this.page, `EnterAmountValue is failed :${error.message}`);
        }
    }

    async SelectExternalAccountTab() {
        try {
            await this.extAccountsTab.click();
            await setTimeout(2000);
            await Report.pass(this.page, 'External account tab is selected');

        }
        catch (error) {
            await Report.fail(this.page, `SelectExternalAccountTab is failed :${error.message}`);
        }
    }


    async VerifyLockedPendingExternalAccount(LockAccNumber: string) {
        try {
            await this.page.locator(`(//tr[contains(@class,"app-datagrid-row")]/td[contains(text(),"${LockAccNumber}")]/following::span/a[@title="Locked"])[1]`).click();
            await setTimeout(2000);
            await this.AccountLockedtxt.isVisible();
            await this.AccountLockedtxtmsg.isVisible();
            await Report.pass(this.page, `Something went wrong! We couldn't verify your external account. Remove the account and try adding it again. is displaying`);
            await this.AccountLockedtxtCancelBtn.click();
        }
        catch (error) {
            await Report.fail(this.page, `VerifyLockedPendingExternalAccount is failed :${error.message}`);
        }
    }
    async VerifyRemovePendingExternalAccount(LockAccNumber: string) {
        try {
            await this.page.locator(`(//tr[contains(@class,"app-datagrid-row")]/td[contains(text(),"${LockAccNumber}")]/following::span/a[@title="Remove"])[1]`).click();
            await setTimeout(2000);
            await this.RemoveAccounttxt.isVisible();
            await Report.pass(this.page, `Wait! Are you sure you want to remove this account? is displaying`);
            await this.RemoveAccountCancelBtn.click();
        }
        catch (error) {
            await Report.fail(this.page, `VerifyRemovePendingExternalAccount is failed :${error.message}`);
        }
    }

    async SelectFuturedatebtn() {
        try {
            await this.Futuredate.scrollIntoViewIfNeeded()
            await setTimeout(1000);
            await this.Futuredate.click();
            await setTimeout(2000);
            await Report.pass(this.page, `Future date radio button is selected`);

        }
        catch (error) {
            await Report.fail(this.page, `SelectFuturedatebtn is failed :${error.message}`);
        }
    }

    async SelectScheduledBtn() {
        try {
            await this.scheduledRadioBtn.scrollIntoViewIfNeeded()
            await setTimeout(1000);
            await this.scheduledRadioBtn.click();
            await setTimeout(2000);
            await Report.pass(this.page, `Scheduled radio button is selected`);

        }
        catch (error) {
            await Report.fail(this.page, `SelectScheduledBtn is failed :${error.message}`);
        }
    }

    private getFrequencyCategory(frequency: string): string {
        const normalized = frequency.trim().toLowerCase();

        if (normalized === 'once' || normalized === 'one time') return 'once';
        if (normalized === 'weekly') return 'weekly';
        if (normalized === 'biweekly' || normalized === 'every 2 weeks') return 'biweekly';
        if (normalized === 'twiceamonth' || normalized === 'twice a month') return 'twiceamonth';
        if (normalized === 'monthly') return 'monthly';
        if (normalized === 'quarterly' || normalized === 'end of quarter (3/31, 6/30, 9/30, 12/31)') return 'quarterly';
        if (normalized === 'semiannually' || normalized === 'semi-annually' || normalized === 'end of half-year (6/30 and 12/31)') return 'semiannually';
        if (normalized === 'annually' || normalized === 'year-end (12/31)') return 'annually';

        return normalized;
    }

    async SelectFrequency(Frequency: string) {
        try {
            await this.continueButton.scrollIntoViewIfNeeded();
            const frequencyCategory = this.getFrequencyCategory(Frequency);
            const optionTextsByCategory: Record<string, string[]> = {
                once: ['Once', 'One time'],
                weekly: ['Weekly'],
                biweekly: ['BiWeekly', 'Every 2 weeks'],
                twiceamonth: ['Twice a month', 'TwiceAMonth','Twice a month'],
                monthly: ['Monthly'],
                quarterly: ['Quarterly', 'End of quarter (3/31, 6/30, 9/30, 12/31)'],
                semiannually: ['Semi-annually', 'SemiAnnually', 'End of half-year (6/30 and 12/31)'],
                annually: ['Annually', 'Year-end (12/31)']
            };

            const aliases = optionTextsByCategory[frequencyCategory] || [Frequency.trim()];
            let optionValue: string | null = null;

            for (const alias of aliases) {
                const optionLocator = `${this.Frequencydropdown} option:has-text("${alias}")`;
                const optionElement = await this.page.locator(optionLocator).first().elementHandle();
                const value = await optionElement?.getAttribute('value');
                if (value) {
                    optionValue = value;
                    break;
                }
            }

            if (!optionValue) {
                throw new Error(`Option with Frequency ${Frequency} not found`);
            }

            await this.page.selectOption(this.Frequencydropdown, optionValue);
            await Report.pass(this.page, 'Frequency is selected');
        }
        catch (error) {
            await Report.fail(this.page, `SelectFrequency is failed :${error.message}`);
        }
    }

    async EnterStartDate(Frequency: string) {
        try {
            await this.nextButton.scrollIntoViewIfNeeded();
            const startdate = await this.getFutureSystemDate(2);
            await setTimeout(2000);
            await this.Startdate.scrollIntoViewIfNeeded();
            await setTimeout(1000);
            await this.Startdate.click();
            await this.Startdate.fill(startdate);
            if (this.getFrequencyCategory(Frequency) === 'once')
            {
                await this.Futuredate.click();
            }
            else
            {

            await this.Continuestxt.click();
            await setTimeout(2000);
            }
            await Report.pass(this.page, `Start date is entered`);

        }
        catch (error) {
            await Report.fail(this.page, `EnterStartDate is failed :${error.message}`);
        }
    }

    async getFutureSystemDate(daysAhead: number) {
        let futureDate = new Date();
        futureDate.setDate(new Date().getDate() + daysAhead);
        let day = `${futureDate.getDate() < 10 ? "0" : ""}${futureDate.getDate()}`;
        //Months are counted from 0
        let month = `${(futureDate.getMonth() + 1) < 10 ? "0" : ""}${futureDate.getMonth() + 1}`;
        let year = futureDate.getFullYear();
        const fDate = `${month}/${day}/${year}`;
        return fDate;
    }

    async SelectTransferContinueUntil(TransferContinue: string) {
        try {
            await this.continueButton.scrollIntoViewIfNeeded();
            const radioInput = this.page.locator(
                `input[type="radio"][aria-label="${TransferContinue}"], input[type="radio"][value="${TransferContinue}"]`
            ).first();
            const labelContainer = this.page.locator(
                `label.app-radioset-label:has(input[type="radio"][aria-label="${TransferContinue}"]), label.app-radioset-label:has(input[type="radio"][value="${TransferContinue}"])`
            ).first();
            const captionSpan = this.page.locator(`//span[text()='${TransferContinue}']`).first();

            if (await radioInput.count() === 0) {
                throw new Error(`Transfer Continue option ${TransferContinue} not found`);
            }

            if (await labelContainer.count() > 0) {
                await labelContainer.scrollIntoViewIfNeeded();
                await setTimeout(1000);
                await labelContainer.click();
            }
            else {
                await captionSpan.scrollIntoViewIfNeeded();
                await setTimeout(1000);
                await captionSpan.click();
            }

            await expect(radioInput).toBeChecked();

            await Report.pass(this.page, `Transfer Continue Until is selected as :${TransferContinue}`);

        }
        catch (error) {
            await Report.fail(this.page, `SelectTransferContinueUntil is failed :${error.message}`);
        }
    }


    async EnterEndDate(Frequency: string) {
        try {
            await this.continueButton.scrollIntoViewIfNeeded();
            const frequencyCategory = this.getFrequencyCategory(Frequency);

            if (frequencyCategory === 'once') {
                await Report.pass(this.page, `End date is not required`);
            }
            else if (frequencyCategory === 'weekly') {
                const enddate = await this.getFutureSystemDate(45);
                await this.Enddate.click();
                await this.Enddate.fill(enddate);
                await this.ClickContinuebtn();
                await setTimeout(2000);
                await Report.pass(this.page, `End date is entered`);
            }
            else if (frequencyCategory === 'biweekly') {
                const enddate = await this.getFutureSystemDate(75);
                await this.Enddate.scrollIntoViewIfNeeded();
                await this.Enddate.click();
                await this.Enddate.fill(enddate);
                await this.ClickContinuebtn();
                await setTimeout(2000);
                await Report.pass(this.page, `End date is entered`);
            }
            else if (frequencyCategory === 'twiceamonth') {
                const enddate = await this.getFutureSystemDate(90);
                await this.Enddate.scrollIntoViewIfNeeded();
                await this.Enddate.click();
                await this.Enddate.fill(enddate);
                await this.ClickContinuebtn();
                await setTimeout(2000);
                await Report.pass(this.page, `End date is entered`);
            }
            else if (frequencyCategory === 'monthly') {
                const enddate = await this.getFutureSystemDate(120);
                await this.Enddate.scrollIntoViewIfNeeded();
                await this.Enddate.click();
                await this.Enddate.fill(enddate);
                await this.ClickContinuebtn();
                await setTimeout(2000);
                await Report.pass(this.page, `End date is entered`);
            }
            else if (frequencyCategory === 'quarterly') {
                const enddate = await this.getFutureSystemDate(220);
                await this.Enddate.scrollIntoViewIfNeeded();
                await this.Enddate.click();
                await this.Enddate.fill(enddate);
                await this.ClickContinuebtn();
                await setTimeout(2000);
                await Report.pass(this.page, `End date is entered`);
            }
            else if (frequencyCategory === 'semiannually') {
                const enddate = await this.getFutureSystemDate(220);
                await this.Enddate.scrollIntoViewIfNeeded();
                await this.Enddate.click();
                await this.Enddate.fill(enddate);
                await this.ClickContinuebtn();
                await setTimeout(2000);
                await Report.pass(this.page, `End date is entered`);
            }
            else if (frequencyCategory === 'annually') {
                const enddate = await this.getFutureSystemDate(365);
                await this.Enddate.scrollIntoViewIfNeeded();
                await this.Enddate.click();
                await this.Enddate.fill(enddate);
                await this.ClickContinuebtn();
                await setTimeout(2000);
                await Report.pass(this.page, `End date is entered`);
            }
            else {
                const enddate = await this.getFutureSystemDate(120);
                await this.Enddate.scrollIntoViewIfNeeded();
                await this.Enddate.click();
                await this.Enddate.fill(enddate);
                await this.ClickContinuebtn();
                await setTimeout(2000);
                await Report.pass(this.page, `End date is entered`);
            }



        }
        catch (error) {
            await Report.fail(this.page, `EnterEndDate is failed :${error.message}`);
        }
    }

    async SelectScheduledTransactionsTab() {
        try {
            await this.scheduledTransactionsTab.click();
            await setTimeout(1000);
            await waitForSpinnerToClose(this.page);
            await Report.pass(this.page, `Scheduled Transactions tab is selected`);

        }
        catch (error) {
            await Report.fail(this.page, `SelectScheduledTransactionsTab is failed :${error.message}`);
        }
    }





    async DeleteScheduledTransactionsRecord(Amount: string) {
        try {


            var str2 = new String("$");
            var Amount = str2.concat(Amount.toString());
            const amountNumbers: string[] = await this.GetAllAmountInScheduledTransactions();
            const count = amountNumbers.length;

            for (let i = 0; i < count; i++) {
                if (amountNumbers[i] === `${Amount}`) {


                    const recordtable = this.page.locator(`//tr/td[contains(text(),'${Amount}')]`);
                    await recordtable.click();
                    await Report.pass(this.page, 'Scheduled Transactions Record is opened');

                    const recordtabledeletebtn = this.page.locator(`//tr/td[contains(text(),'${Amount}')]/../following-sibling::tr/td[2]/div[2]/div/app-partial-partial_scheduleddetail/section/div[2]/div/div/button[2]`);
                    await recordtabledeletebtn.isEnabled();
                    await Report.pass(this.page, 'Delete button is enabled');
                    await recordtabledeletebtn.click()
                    await setTimeout(2000);
                    await this.deletescheduledtransfertxt.isVisible();
                    await Report.pass(this.page, 'Wait! Are you sure you want to delete this transfer? is displaying');
                    await this.deletescheduledtransferyesbtn.click();
                    await this.scheduledTransactionsTab.waitFor();
                    break;

                }

                else {
                    await Report.info(this.page, `Scheduled Transactions Record is not is not displaying`);

                }
            }
        }
        catch (error) {
            await Report.fail(this.page, `DeleteScheduledTransactionsRecord is failed :${error.message}`);
        }

    }


    async EditScheduledTransactionsRecord(Amount: string,NewAmount:string) {
        try {


            var str2 = new String("$");
            var Amount = str2.concat(Amount.toString());
            const amountNumbers: string[] = await this.GetAllAmountInScheduledTransactions();
            const count = amountNumbers.length;

            for (let i = 0; i < count; i++) {
                if (amountNumbers[i] === `${Amount}`) {


                    const recordtable = this.page.locator(`//tr/td[contains(text(),'${Amount}')]`);
                    await recordtable.click();
                    await Report.pass(this.page, 'Scheduled Transactions Record is opened');
                    const recordtableeditbtn = this.page.locator(`//tr/td[contains(text(),'${Amount}')]/../following-sibling::tr/td[2]/div[2]/div/app-partial-partial_scheduleddetail/section/div[2]/div/div/button[1]`);
                    await recordtableeditbtn.isEnabled();
                    await Report.pass(this.page, 'Edit button is enabled');
                    await recordtableeditbtn.click()
                    await setTimeout(2000);
                    await this.editscheduledtransfertxt.isVisible();
                    await Report.pass(this.page, 'Edit Transfer Details is displaying');
                    await this.editscheduledtransferamountfield.click();
                    await this.editscheduledtransferamountfield.clear();
                    await this.editscheduledtransferamountfield.fill(NewAmount);
                    await this.editscheduledtransferupdatebtn.scrollIntoViewIfNeeded();
                    await setTimeout(1000);
                    await this.editscheduledtransferupdatebtn.click();
                    await setTimeout(2000);
                    await this.editscheduledtransferconfirmmsg.waitFor();
                    await this.editscheduledtransferconfirmmsg.isVisible();
                    await Report.pass(this.page, 'Your transfer was updated successfully is displaying');
                    await this.editscheduledtransferconfirmmsgokbtn.click();
                    await setTimeout(2000);
                    break;

                }

                else {
                    await Report.info(this.page, `Scheduled Transactions Record is not is not displaying`);

                }
            }
        }
        catch (error) {
            await Report.fail(this.page, `EditScheduledTransactionsRecord is failed :${error.message}`);
        }

    }

    async GetAllAmountInScheduledTransactions(): Promise<string[]> {
        
        await this.page.waitForLoadState();
        await this.page.waitForTimeout(2000);
        // Selector for the amount number
        const amountNumberSelector = '//span[text()="From"]/../../../following-sibling::tbody/tr/td[4]';
        // Get all elements matching the selector
        const amountNumberElements = await this.page.$$(amountNumberSelector);
        // Extract the text content from each element and store in a list
        const amountNumbers: string[] = [];
        for (const element of amountNumberElements) {
            const text = await element.textContent();
            if (text) {
                amountNumbers.push(text.trim());

            }
        }

        return amountNumbers;
    }

    async EnterNoOfTransfer(noOfTransfer: string) {
        try {
            await this.page.waitForLoadState();
            await this.noOfTransfer.fill(noOfTransfer);
            await Report.pass(this.page, 'No of transfer is entered');
        }
        catch (error) {
            await Report.fail(this.page, `EnterNoOfTransfer is failed :${error.message}`);
        }
    }

    async DeleteFirstRecordOfScheduleTransfer() {
    try {
        await this.page.waitForTimeout(10000); // Consider replacing with a more targeted wait if possible
        await this.page.waitForLoadState();
        await waitForSpinnerToClose(this.page);

        // Exit early if no scheduled transactions
        const isNoRecordsMessageVisible = await this.noSceduledTransactionsMsg.isVisible().catch(() => false);
        if (isNoRecordsMessageVisible) {
            await Report.info(this.page, 'No schedule transfer record is present');
            return;
        }

        const exist = await this.firstRecordSchedTransfer.isVisible();
        if (exist) {
            const noOfRecords = (await this.page.$$("//tr/td[5]")).length;
            const totalRecordsText = await this.totalRecordsText.first().textContent().catch(() => null);
            const totalRecords = Number(totalRecordsText?.match(/\d+/)?.[0] ?? 0);
            const expectedBeforeDelete = totalRecords > 0 ? totalRecords : noOfRecords;

            await this.firstRecordSchedTransfer.click();
            await Report.pass(this.page, 'Clicked on first record');
            await this.deleteBtn.click();
            await Report.pass(this.page, 'Clicked on Delete button');
            await expect(this.deleteTranPopupHead).toBeVisible();
            await Report.pass(this.page, 'Delete Transfer pop up is displayed');
            await this.deletescheduledtransferyesbtn.click();
            await Report.pass(this.page, 'Clicked on \"Yes, Delete\" button');
            await this.page.waitForTimeout(3000);
            await waitForSpinnerToClose(this.page);

            // Poll for grid update after delete, fallback to tab refresh if needed
            let didRefreshScheduledTab = false;
            await expect.poll(async () => {
                await waitForSpinnerToClose(this.page);
                const noRecordsMsgInPoll = await this.noSceduledTransactionsMsg.isVisible().catch(() => false);
                if (noRecordsMsgInPoll) return 0;

                const currentCount = (await this.page.$$('//tr/td[5]')).length;
                if (currentCount >= expectedBeforeDelete && !didRefreshScheduledTab) {
                    didRefreshScheduledTab = true;
                    await this.scheduledTransactionsTab.click();
                    await waitForSpinnerToClose(this.page);
                }
                return currentCount;
            }, { timeout: 30000, intervals: [500, 1000, 2000] }).toBeLessThan(expectedBeforeDelete);

            await Report.pass(this.page, 'First Record of Schedule transfer is deleted successfully');
        } else {
            await Report.info(this.page, 'No schedule transfer record is present');
        }
    } catch (error) {
        await Report.fail(this.page, `DeleteFirstRecordOfScheduleTransfer is failed :${error.message}\n${error.stack}`);
    }
}

    async DeleteAllRecordsOfScheduleTransfer()
    {
        try
        {
            await this.page.waitForTimeout(10000);
            await this.page.waitForLoadState();
            let totalDeleted = 0;
            const maxIterations = 50;

            for (let i = 0; i < maxIterations; i++)
            {
                await waitForSpinnerToClose(this.page);
                const isNoRecordsMessageVisible = await this.noSceduledTransactionsMsg.isVisible().catch(() => false);
                const beforeDeleteCount = (await this.page.$$('//tr/td[5]')).length;

                if (isNoRecordsMessageVisible || beforeDeleteCount === 0)
                {
                    if (totalDeleted > 0)
                    {
                        await Report.pass(this.page, `All Schedule transfer records are deleted successfully. Total deleted records: ${totalDeleted}`);
                    }
                    else
                    {
                        await Report.info(this.page,'No schedule transfer record is present');
                    }
                    return;
                }

                await this.firstRecordSchedTransfer.scrollIntoViewIfNeeded();
                await this.firstRecordSchedTransfer.click({ force: true });
                await Report.pass(this.page,'Clicked on first record');
                await waitForSpinnerToClose(this.page);

                const firstRowDeleteBtn = this.page.locator("xpath=((//tr[td[5]])[1]/following-sibling::tr[1]//button[@name='buttonDelete'])[1]");
                await expect(firstRowDeleteBtn).toBeVisible({ timeout: 15000 });
                await firstRowDeleteBtn.click();
                await Report.pass(this.page,'Clicked on Delete button');

                await expect(this.deletescheduledtransfertxt).toBeVisible({ timeout: 15000 });
                await Report.pass(this.page, 'Wait! Are you sure you want to delete this transfer? is displaying');
                await this.deletescheduledtransferyesbtn.click();
                await Report.pass(this.page,'Clicked on "Yes, Delete" button');

                await expect(this.deletescheduledtransfertxt).toBeHidden({ timeout: 20000 });
                await waitForSpinnerToClose(this.page);
                await this.page.waitForTimeout(1000);

                // Grid refresh can be delayed after delete; poll until row count decreases.
                let didRefreshScheduledTab = false;
                await expect.poll(async () => {
                    await waitForSpinnerToClose(this.page);

                    const isNoRecordsMessageVisibleInPoll = await this.noSceduledTransactionsMsg.isVisible().catch(() => false);
                    if (isNoRecordsMessageVisibleInPoll)
                    {
                        return 0;
                    }

                    const currentCount = (await this.page.$$('//tr/td[5]')).length;

                    if (currentCount >= beforeDeleteCount && !didRefreshScheduledTab)
                    {
                        didRefreshScheduledTab = true;
                        await this.scheduledTransactionsTab.click();
                        await waitForSpinnerToClose(this.page);
                    }

                    return currentCount;
                }, { timeout: 30000, intervals: [500, 1000, 2000] }).toBeLessThan(beforeDeleteCount);

                totalDeleted++;
            }

            throw new Error(`DeleteAllRecordsOfScheduleTransfer reached max iterations (${maxIterations}) before grid became empty`);
        }
        catch (error) {
            await Report.fail(this.page, `DeleteAllRecordsOfScheduleTransfer is failed :${error.message}`);
        }
    }

    async VerifyPreviewAndConfirmationPageForImmedTran(label:string[], value:string[]) 
    {
        try 
        {
            await this.page.waitForLoadState();
            await this.TransferConfimrationReview.scrollIntoViewIfNeeded();
            await this.TransferConfimrationReview.isVisible();
            for(let i=0;i<label.length;i++)
            {
                if(label[i]==="Amount:")
                {
                    const actualLabellocator = this.page.locator('xpath=(//label[text()="'+label[i]+'"])[2]');
                    const actualLabelText = await actualLabellocator.textContent();
                    await expect(actualLabellocator).toBeVisible();
                    Report.pass(this.page,'Expected label is displayed. Label displayed is: '+actualLabelText);
                }
                else
                {
                    const actualLabellocator = this.page.locator('xpath=//label[text()="'+label[i]+'"]').first();
                    const actualLabelText = await actualLabellocator.textContent();
                    await expect(actualLabellocator).toBeVisible();
                    Report.pass(this.page,'Expected label is displayed. Label displayed is: '+actualLabelText);
                }
            }

            for(let i=0;i<value.length;i++)
            {
                if(value[i].startsWith("****"))
                {
                    const actualValuelocator = this.page.locator('xpath=(//*[contains(text(),"'+value[i]+'")])[2]');
                    const actualValueText = await actualValuelocator.textContent();
                    await expect(actualValuelocator).toBeVisible();
                    Report.pass(this.page,'Expected value is displayed. Value displayed is: '+actualValueText);
                }
                else if(value[i]==="Scheduled")
                {
                    const actualValuelocator = this.page.locator('xpath=//label[contains(text(),"'+value[i]+'")]');
                    const actualValueText = await actualValuelocator.textContent();
                    await expect(actualValuelocator).toBeVisible();
                    Report.pass(this.page,'Expected label is displayed. Label displayed is: '+actualValueText);
                }
                else
                {
                    const actualValuelocator = this.page.locator('xpath=//label[text()="'+value[i]+'"]').first();
                    const actualValueText = await actualValuelocator.textContent();
                    await expect(actualValuelocator).toBeVisible();
                    Report.pass(this.page,'Expected value is displayed. Value displayed is: '+actualValueText);
                }
            }
        }
        catch (error) 
        {
            await Report.fail(this.page, `VerifyPreviewAndConfirmationPageForImmedTran is failed :${error.message}`);
        }
    }

    async VerifyVerbiageOnPreviewAndConfPageForImmedTran(expFundAvailMsg1,expFundAvailMsg2,expIntTranLbl,expIntTranVerb,expExtTranLbl,expExtTranVerb) 
    {
        try 
        {
            await this.page.waitForLoadState();
            await this.fundsAvailMsg1.scrollIntoViewIfNeeded();
            const actFundsAvailMsg1 =  await this.fundsAvailMsg1.textContent();
            expect(actFundsAvailMsg1).toContain(expFundAvailMsg1);
            Report.pass(this.page,'Expected verbiage is displayed. Verbiage displayed is: '+actFundsAvailMsg1);
            const actFundsAvailMsg2 = await this.fundsAvailMsg2.textContent();
            expect(actFundsAvailMsg2).toContain(expFundAvailMsg2);
            Report.pass(this.page,'Expected verbiage is displayed. Verbiage displayed is: '+actFundsAvailMsg2);
            const actIntTransLabel = await this.intTransLabel.textContent();
            expect(actIntTransLabel).toContain(expIntTranLbl);
            Report.pass(this.page,'Expected verbiage is displayed. Verbiage displayed is: '+actIntTransLabel);
            const actIntTransVerb = await this.intTransVerb.textContent();
            expect(actIntTransVerb).toContain(expIntTranVerb);
            Report.pass(this.page,'Expected verbiage is displayed. Verbiage displayed is: '+actIntTransVerb);
            const actExtTransLabel = await this.extTransLabel.textContent();
            expect(actExtTransLabel).toContain(expExtTranLbl);
            Report.pass(this.page,'Expected verbiage is displayed. Verbiage displayed is: '+actExtTransLabel);
            const actExtTransVerb = await this.extTransVerb.textContent();
            expect(actExtTransVerb).toContain(expExtTranVerb);
            await this.extTransVerb.scrollIntoViewIfNeeded();
            Report.pass(this.page,'Expected verbiage is displayed. Verbiage displayed is: '+actExtTransVerb);
        }
        catch (error) 
        {
            await Report.fail(this.page, `VerifyVerbiageOnPreviewAndConfPageForImmedTran is failed :${error.message}`);
        }
    }

    async EditAndUpdateFirstRecordOfScheduleTransfer(amount:string)
    {
        try
        {
            await this.page.waitForTimeout(10000);
            await this.page.waitForLoadState();
            const exist = await this.firstRecordSchedTransfer.isVisible();
            if(exist)
            {
                //const noOfRecords = (await this.page.$$("//tr/td[5]")).length;
                await this.firstRecordSchedTransfer.click();
                await Report.pass(this.page,'Clicked on first record');
                const date = await this.dateFieldOnSched.textContent();
                const amt = await this.amtFieldOnSched.textContent();
                await this.editBtn.click();
                await this.page.waitForTimeout(2000);
                await this.editAmtField.clear();
                await this.editAmtField.fill(amount);
                await Report.pass(this.page,'Amount is entered');
                const randomNumber = await OnlineEnrollmentPage.getRandomInt(1,7);
                await this.page.locator('xpath=(//select[@name="formFrequency_formWidget"])[2]').selectOption({ index: randomNumber });
                await Report.pass(this.page,'Frequency is selected');
                await this.editDateField.clear();
                await this.editDateField.fill(getCurrentDatePlusNAvoidingWeekends(2));
                await Report.pass(this.page,'Date is selected');
                await this.updateBtn.click();
                await this.page.waitForTimeout(2000);
                await Report.pass(this.page,'Clicked on update button');
                await this.page.waitForTimeout(7000);
                await this.firstRecordSchedTransfer.click();
                await this.dateFieldOnSched.waitFor();
                const date1 = await this.dateFieldOnSched.textContent();
                const amt1 = await this.amtFieldOnSched.textContent();
                const freq = await this.freqFieldOnSched.textContent();
                expect(date).not.toEqual(date1);
                expect(amt).not.toEqual(amt1);
                await Report.pass(this.page,'Schedule transfer is updated successfully. Frequency, Date and Amount changed values are: '+freq+', '+date1+' and '+amt1);
            }
            else
            {
                Report.info(this.page,'No schedule transfer record is present');
            }
        }
        catch (error) {
            await Report.fail(this.page, `EditAndUpdateFirstRecordOfScheduleTransfer is failed :${error.message}`);
        }
    }

    async ViewFirstRecordOfScheduleTransfer()
    {
        try
        {
            await this.page.waitForTimeout(40000);
            await this.page.waitForLoadState();
            const exist = await this.firstRecordSchedTransfer.isVisible();
            if(exist)
            {
                await this.firstRecordSchedTransfer.click();
                await Report.pass(this.page,'Clicked on first record');
                await expect(this.fromLbl).toBeVisible();
                const actFromValue = await this.fromValue.textContent();
                Report.pass(this.page,'From label is displayed. Value displayed is: '+actFromValue);
                await expect(this.toLbl).toBeVisible();
                const actToValue = await this.toValue.textContent();
                Report.pass(this.page,'To label is displayed. Value displayed is: '+actToValue);
                await expect(this.transferDateLbl).toBeVisible();
                const actTransferDateValue = await this.transferDateValue.textContent();
                Report.pass(this.page,'Transfer Date label is displayed. Value displayed is: '+actTransferDateValue);
                await expect(this.amtLbl).toBeVisible();
                const actAmtValue = await this.amtValue.textContent();
                Report.pass(this.page,'From label is displayed. Value displayed is: '+actAmtValue);
                await expect(this.typeLbl).toBeVisible();
                const actTypeValue = await this.typeValue.textContent();
                Report.pass(this.page,'Type label is displayed. Value displayed is: '+actTypeValue);
                await expect(this.freqLbl).toBeVisible();
                const actFreqValue = await this.freqValue.textContent();
                Report.pass(this.page,'Frequency label is displayed. Value displayed is: '+actFreqValue);
                
            }
            else
            {
                Report.info(this.page,'No schedule transfer record is present');
            }
        }
        catch (error) {
            await Report.fail(this.page, `ViewFirstRecordOfScheduleTransfer is failed :${error.message}`);
        }
    }

    async VerifyHdrValuesOnSchedTrnsfer()
    {
        try
        {
            await this.page.waitForLoadState();
            await expect(this.dateHdr).toBeVisible();
            await expect(this.fromHdr).toBeVisible();
            await expect(this.toHdr).toBeVisible();
            await expect(this.amtHdr).toBeVisible();
            Report.pass(this.page,'Date, From, To and Amount headers are displayed.');
        }
        catch (error) {
            await Report.fail(this.page, `VerifyHdrValuesOnSchedTrnsfer is failed :${error.message}`);
        }
    }

    async VerifyRegularPaymentOptionSelected(){
        const recurringRadio = this.VerifyRegularPaymentOption;
            if (!(await recurringRadio.isChecked())) {
            await Report.info(this.page, '"Recurring Transfer" radio button is not selected by default');
            await recurringRadio.click();
        }else{
            await Report.pass(this.page, '"Recurring Transfer" radio button is selected by default');
        }
    }


  

}




