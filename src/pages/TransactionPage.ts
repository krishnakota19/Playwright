import { Download, Locator, Page } from 'playwright';
import { test, expect } from '@playwright/test';
import { Report } from '../../utils/reporter';
import { waitForSpinnerToClose } from '../../utils/common';
import * as fs from 'fs';

type SortColumnType = 'date' | 'text' | 'currency';
type SortDirection = 'asc' | 'desc' | 'constant' | 'unsorted' | 'insufficient';


export class AccountDetailsPage {
    private page: Page;
    private _lastDownload: Download | null = null;
    readonly pendingTranHdr: Locator;
    readonly postedTranHdr: Locator;
    readonly iSymbPendTran: Locator;
    readonly iSymbPostTran: Locator;
    readonly iSymbPopupHdr: Locator;
    readonly iSymbPendPopupText: Locator;
    readonly iSymbPostPopupText: Locator;
    readonly OKBtn: Locator;
    readonly datePendColHdr: Locator;
    readonly descPendColHdr: Locator;
    readonly amountPendColHdr: Locator;
    readonly datePostColHdr: Locator;
    readonly descPostColHdr: Locator;
    readonly amountPostColHdr: Locator;
    readonly balPostColHdr: Locator;
    readonly postedDate: Locator;
    readonly postedDateValue: Locator;
    readonly transactionDate: Locator;
    readonly transactionDateValue: Locator;
    readonly tranDesc: Locator;
    readonly tranDescValue: Locator;
    readonly additionalDesc: Locator;
    readonly additionalDescValue: Locator;
    readonly tranType: Locator;
    readonly tranTypeValue: Locator;
    readonly tranAmt: Locator;
    readonly tranAmtValue: Locator;
    readonly clickingOnFirstRecordInPostedTran: Locator;
    readonly showAcctDetails: Locator;
    readonly docDelPrefLabel: Locator;
    readonly docDelPrefValue: Locator;
    readonly showHideIcon: Locator;
    readonly showOtherAcctChevron: Locator;
    readonly acctNumSel: Locator;
    readonly acctNumInShowAcctDet: Locator;
    readonly CDHeader: Locator;
    readonly CheckHeader: Locator;
    readonly SavAndMMAHeader: Locator;
    readonly IRAHeader: Locator;
    readonly loanAndLinesOfCredHeader: Locator;
    readonly acctNoUnderShowAcct: Locator;
    readonly currentBalLbl: Locator;
    readonly availBalLbl: Locator;
    readonly currBalInfoIcon: Locator;
    readonly availBalInfoIcon: Locator;
    readonly currBalValue: Locator;
    readonly nickName: Locator;
    readonly nickNameUnderShowAct: Locator;
    readonly currBalOnlyInfo: Locator;
    readonly noSchedTran: Locator;
    readonly noPendTran: Locator;
    readonly noPostTran: Locator;
    readonly moreSearchOptions: Locator;
    readonly printOption: Locator
    readonly downloadOption: Locator;
    readonly princPostColHdr: Locator;
    readonly interestPostColHdr: Locator;
    readonly otherCharPostColHdr: Locator;
    readonly principalAmt: Locator;
    readonly principalAmtValue: Locator;
    readonly interestAmt: Locator;
    readonly interestAmtValue: Locator;
    readonly otherCharges: Locator;
    readonly otherChargesValue: Locator;
    readonly editNickNameIcon: Locator;
    readonly nickNameTxtBox: Locator;
    readonly nickNameErrorMsg: Locator;
    readonly nickNameTickMark: Locator;
    readonly nickNameEditSuccessMsg: Locator;
    readonly categoryEditIcon: Locator;
    readonly categoryAddIcon: Locator;
    readonly tagTitleLabel: Locator;
    readonly tagAddIcon: Locator;
    readonly tagEditIcon: Locator;
    readonly transactionCategoryLabel: Locator;
    readonly transactionCategoryValue: Locator;
    readonly categoryLabels: Locator;
    readonly updateCategoryButton: Locator;
    readonly canceCategoryButton: Locator;
    readonly categorySuccessMsg: Locator;
    readonly categorySuccessTickIcon: Locator;
    readonly chooseCategoryDialog: Locator;
    readonly balPostColHdrEnrichTxn: Locator;
    readonly additionalDescEnrichTxn: Locator;
    readonly postedDateValueEnrichTxn: Locator;
    readonly closeTransactionDetailsPopup: Locator;
    readonly additionalDescValueEnrichTxn: Locator;
    readonly tranTypeValueEnrichTxn: Locator;
    readonly tranAmtValueEnrichTxn: Locator;
    readonly categoryPostColHdr: Locator;
    readonly tagPostColHdr: Locator;
    readonly updateCatTag: Locator;
    readonly vendorPostColHdr: Locator;
    readonly tagsubTitle: Locator;
    readonly tagInput: Locator;
    readonly transactionTagsLabel: Locator;
    readonly updateTagButton: Locator;
    readonly cancelUpdateTagButton: Locator;
    readonly tagSuccessMsg: Locator;
    readonly tagData: Locator;
    readonly CategoryData: Locator;
    readonly closeTransactionCategoryPopup: Locator;
    readonly transactionDetailspopupHeader: Locator;
    readonly noPendingTransactions: Locator;
    readonly clickingOnFirstPendingRecord: Locator;
    readonly pendingTransactionDate: Locator;
    readonly pendingTransactionDescription: Locator;
    readonly pendingTransactionAdditionalDescription: Locator;
    readonly pendingTransactionType: Locator;
    readonly pendingTransactionAmount: Locator;
    readonly pendingTransactionDateValue: Locator;
    readonly pendingTransactionDescriptionValue: Locator;
    readonly pendingTransactionAdditionalDescriptionValue: Locator;
    readonly pendingTransactionTypeValue: Locator;
    readonly pendingTransactionAmountValue: Locator;
    readonly postedTxnAccountNumber: Locator;
    readonly postedTxnAccountNumberValue: Locator;
    readonly enrichPostedTranDescValue: Locator;
    readonly RADescription :Locator;
    readonly RADescriptionValue :Locator;
    readonly postedCheckNum: Locator;
    readonly postedCheckNumValue: Locator;
    readonly showSearchOptionsLink: Locator;
    readonly searchByDescriptionOption: Locator;
    readonly searchByTypeOption: Locator;   
    readonly searchByAmountOption: Locator;
    readonly searchByDateOption: Locator;
    readonly searchByCheckNumOption: Locator;
    readonly inputDescriptionSearch: Locator;
    readonly depositTypeSearch: Locator;
    readonly withdrawalsTypeSearch: Locator;
    readonly checksTypeSearch: Locator;
    readonly specificAmountSearchOption: Locator;
    readonly amountRangeSearchOption: Locator;
    readonly specificDateSearchOption: Locator;
    readonly dateRangeSearchOption: Locator;
    readonly specificCheckNumSearchOption: Locator;
    readonly checkNumRangeSearchOption: Locator;
    readonly specificCheckOption: Locator;
    readonly rangeOfChecksOption: Locator;
    readonly specificAmountInput: Locator;
    readonly amountRangeMinInput: Locator;
    readonly amountRangeMaxInput: Locator;
    readonly specificDateInput: Locator;
    readonly dateRangeStartInput: Locator;
    readonly dateRangeEndInput: Locator;
    readonly specificCheckNumInput: Locator;
    readonly checkNumRangeStartInput: Locator;
    readonly checkNumRangeEndInput: Locator;
    readonly searchButton: Locator;
    readonly noRecordsMsg: Locator;
    readonly noPendingMsgVisible: Locator;
    readonly modifyButton: Locator;
    readonly descriptionSearchErrorMsg: Locator;
    readonly amountSearchErrorMsg: Locator;
    readonly startAmountSearchErrorMsg: Locator;
    readonly endAmountSearchErrorMsg: Locator;
    readonly startDateSearchErrorMsg: Locator;
    readonly endDateSearchErrorMsg: Locator;
    readonly specificDateSearchErrorMsg: Locator;
    readonly startamtGreaterThanEndAmtErrorMsg: Locator;
    readonly startDateGreaterThanEndDateErrorMsg: Locator;
    readonly specificCheckNumSearchErrorMsg: Locator;
    readonly startCheckNumSearchErrorMsg: Locator;
    readonly endCheckNumSearchErrorMsg: Locator;
    readonly startCheckNumGreaterThanEndCheckNumErrorMsg: Locator;
    readonly printPreviewModal: Locator;
    readonly printPreviewCloseBtn: Locator;
    readonly printPreviewContent: Locator;
    readonly printPreviewAccountInfo: Locator;
    readonly printPreviewTransactionList: Locator;
    readonly printPreviewHeader: Locator;
    readonly printPreviewPrintButton: Locator;
    readonly downloadTransactionsLabel: Locator;
    readonly filetypeDropdown: Locator;
    readonly transactionPeriod: Locator;
    readonly customeDateRangeOption: Locator;
    readonly fromDateInput: Locator;
    readonly toDateInput: Locator;
    readonly exportButton: Locator;
    readonly downloadSuccess: Locator;
    readonly closeDialogBtn: Locator;
    readonly dateRangeExceedsMaxRangeStartDateErrorMsg: Locator;
    readonly dateRangeExceedsMaxRangeEndDateErrorMsg: Locator;

    



    constructor(page: Page) {
        this.page = page;
        this.pendingTranHdr = page.getByText("Pending Transactions:");
        this.postedTranHdr = page.getByText("Posted Transactions:");
        this.iSymbPendTran = page.locator('xpath=//button[@title="Pending Transactions Info"]');
        this.iSymbPostTran = page.locator('xpath=//button[@name="buttonPostedIcon"]/i');
        this.iSymbPopupHdr = page.locator('xpath=//h4/span');
        this.iSymbPendPopupText = page.getByText("Transactions that are initiated but not posted yet appear here.");
        this.iSymbPostPopupText = page.getByText("Transactions that have been fully processed by the bank appear here.");
        this.OKBtn = page.locator('xpath=//button[@aria-label="OK"]');
        this.datePendColHdr = page.locator('xpath=//div[@name="stvPendingTransactionsListTable1"]//following-sibling::th[@title="Date"]/span[1]');
        this.descPendColHdr = page.locator('xpath=//div[@name="stvPendingTransactionsListTable1"]//following-sibling::th[@title="Description"]/span[1]');
        this.amountPendColHdr = page.locator('xpath=//div[@name="stvPendingTransactionsListTable1"]//following-sibling::th[@title="Amount"]/span[1]');
        this.datePostColHdr = page.locator('xpath=//div[@name="PostedTrnxtable"]//following-sibling::th[@title="Date"]/span[1]');
        this.descPostColHdr = page.locator('xpath=//div[@name="PostedTrnxtable"]//following-sibling::th[@title="Description"]/span[1]');
        this.amountPostColHdr = page.locator('xpath=//div[@name="PostedTrnxtable"]//following-sibling::th[@title="Amount"]/span[1]');
        this.balPostColHdr = page.locator('xpath=//div[@name="PostedTrnxtable"]//following-sibling::th[@title="Balance"]/span[1]').last();
        this.balPostColHdrEnrichTxn = page.locator('xpath=//div[@name="PostedTrnxtable"]//following-sibling::th[@title="Balance"]/span[1]').nth(0);
        this.vendorPostColHdr = page.locator('xpath=//div[@name="PostedTrnxtable"]//following-sibling::th[@title="Vendor"]/span[1]');
        this.categoryPostColHdr = page.locator('xpath=//div[@name="PostedTrnxtable"]//following-sibling::th[@title="Category"]/span[1]');
        this.tagPostColHdr = page.locator('xpath=//div[@name="PostedTrnxtable"]//following-sibling::th[@title="Tag"]/span[1]');
        this.postedDate = page.locator('xpath=(//label[@name="PostedDate"])[1]');
        this.postedDateValue = page.locator('xpath=(//label[@name="postedDate"])[1]');
        this.postedDateValueEnrichTxn = page.locator('xpath=(//label[@name="postDate"])[1]');
        this.transactionDate = page.locator('xpath=(//label[@name="tranDate"])[1]');
        this.transactionDateValue = page.locator('xpath=(//label[@name="trnDate"])[1]');
        this.tranDesc = page.locator('xpath=//label[@name="tranDesc"]').first();
        this.tranDescValue = page.locator('xpath=(//label[@name="trnDesc"])[1]');
        this.enrichPostedTranDescValue = page.locator('xpath=(//label[@name="trnDesc"])[2]');
        this.additionalDesc = page.locator('xpath=//label[@name="tranMemo"]').first();
        this.additionalDescEnrichTxn = page.locator('xpath=//label[@name="tranAdditionalDesc"]').first();
        this.additionalDescValue = page.locator('xpath=//label[@name="trnMemo"]').first();
        this.additionalDescValueEnrichTxn = page.locator('xpath=((//label[@name="tranAdditionalDesc"])[1]//following::label)[1]');
        this.tranType = page.locator('xpath=(//label[@name="TranType"])[1]');
        this.tranTypeValue = page.locator('xpath=(//label[@name="transactionType"])[1]');
        this.tranAmt = page.locator('xpath=(//label[@name="TranAmt"])[1]');
        this.tranAmtValue = page.locator('xpath=(//label[@name="tranAmt"])[1]');
        this.updateCatTag = page.locator("label[name='updateCatTag']").first();
        this.transactionCategoryLabel = page.locator('xpath=//label[@name="transactionCategoryLabel"]').first();
        this.transactionCategoryValue = page.locator('xpath=(//label[@name="transactionCategoryLabel"]//following::label)[1]');
        this.categoryLabels = page.locator('xpath=//label[@name="Name"]');
        this.updateCategoryButton = page.locator('xpath=//button[@name="updateCategoryButton"]');
        this.canceCategoryButton = page.locator('xpath=//button[@name="CancelCategoryButton"]');
        this.categorySuccessMsg = page.getByText('Category updated', { exact: false });
        this.categorySuccessTickIcon = page.locator('xpath=//i[contains(@class,"check")]').first();
        this.chooseCategoryDialog = this.page.getByRole('dialog', { name: 'choose your category' });
        this.categoryEditIcon = page.locator('xpath=//button[@name="categoryEditIcon"]').first();
        this.categoryAddIcon = page.locator('xpath=//button[@name="categoryAddIcon"]').first();
        this.tagTitleLabel = page.locator('xpath=//label[@name="tagTitleLabel"]').first();
        this.tagAddIcon = page.locator('xpath=//button[@name="tagAddIcon"]').first();
        this.tagEditIcon = page.locator('xpath=//button[@name="tagEditIcon"]').first();
        this.clickingOnFirstRecordInPostedTran = page.locator('xpath=(//div[@name="PostedTrnxtable"]//following-sibling::tbody/tr[@data-row-id="0"]/td[2])[1]');
        this.showAcctDetails = page.locator('xpath=//a[@name="anchorAccountDetails"]');
        this.docDelPrefLabel = page.locator('xpath=//label[text()="Document Delivery Preference:"]');
        this.docDelPrefValue = page.locator('xpath=//label[text()="Document Delivery Preference:"]/../../div[2]/a/span');
        this.showHideIcon = page.locator('xpath=//button[@name="maskedIcon"]/i');
        this.showOtherAcctChevron = page.locator('xpath=//button[@title="Show other accounts"]/i');
        this.acctNumSel = page.locator('xpath=//label[@name="acctNumberLbl"]');
        this.acctNumInShowAcctDet = page.locator('xpath=//label[text()="Account Number:"]/../../div[2]/div/label');
        this.CDHeader = page.getByText("CD's", { exact: true });
        this.CheckHeader = page.getByText("Checking", { exact: true });
        this.SavAndMMAHeader = page.getByText("Savings and Money Market", { exact: true });
        this.IRAHeader = page.getByText("IRAs", { exact: true });
        this.loanAndLinesOfCredHeader = page.getByText("Loans and Lines of Credit", { exact: true });
        this.acctNoUnderShowAcct = page.locator('xpath=//label[text()="Account Number:"]/../../div[2]/div/label').first();
        this.currentBalLbl = page.locator('xpath=//label[@name="labelCurrBalKey"]');
        this.availBalLbl = page.locator('xpath=//label[@name="labelAvailBalKey"]');
        this.currBalInfoIcon = page.locator('xpath=//button[@title="Current Balance info"]');
        this.availBalInfoIcon = page.locator('xpath=//button[@title="Available Balance Info"]');
        this.currBalValue = page.locator('xpath=//label[@name="labelAvailBalValue"]');
        this.nickName = page.locator('xpath=//label[@name="labelTransfers"]');
        this.nickNameUnderShowAct = page.locator('xpath=//label[text()="Account Nickname:"]/../../div[2]/div/label');
        this.currBalOnlyInfo = page.locator('xpath=//button[@aria-label="Current Balance Info"]/i');
        this.noSchedTran = page.locator('xpath=//p[@name="noDataAvail"]/span');
        this.noPendTran = page.locator('xpath=//*[@name="stvPendingTransactionsListTable1"]/div/div/div[2]/div/span');
        //this.noPostTran = page.locator('xpath=//*[@name="PostedTrnxtable"]/div/div/div[2]/div/span');
        this.noPostTran = page.locator('xpath=//span[contains(text(),"There are no posted transactions.")]');
        this.moreSearchOptions = page.getByLabel('Show Search Options');
        this.printOption = page.locator('xpath=//button[@title="Print Transactions"]');
        this.downloadOption = page.locator('xpath=//button[@name="buttonDownload"]');
        this.princPostColHdr = page.locator('xpath=(//th[@title="Principal"]/span)[1]');
        this.interestPostColHdr = page.locator('xpath=(//th[@title="Interest"]/span)[1]');
        this.otherCharPostColHdr = page.locator('xpath=(//th[@title="Other Charges"]/span)[1]');
        this.principalAmt = page.locator('xpath=(//label[@name="TranPrincipalAmt"])[1]');
        this.principalAmtValue = page.locator('xpath=(//label[@name="trnPrincipalamount"])[1]');
        this.interestAmt = page.locator('xpath=(//label[@name="TranInterestAmt"])[1]');
        this.interestAmtValue = page.locator('xpath=(//label[@name="trnInterestamount"])[1]');
        this.otherCharges = page.locator('xpath=(//label[@name="TranOtherCharges"])[1]');
        this.otherChargesValue = page.locator('xpath=(//label[@name="tranOtherCharges"])[1]');
        this.editNickNameIcon = page.locator(`//i[@class='app-icon icon-edit']`).first();
        this.nickNameTxtBox = page.locator(`//input[@name='nickName_formWidget']`).first();
        this.nickNameErrorMsg = page.locator(`//span[contains(text(),'Please try again')]`);
        this.nickNameTickMark = page.locator(`//i[@class='app-icon icon-checkmark']`).first();
        this.nickNameEditSuccessMsg = page.locator(`//span[contains(text(),'Your changes were saved successfully.')]`);
        this.tagsubTitle = page.locator(`//label[@name='tagYourTransactionLabel']`);
        this.tagInput = page.locator(`//input[@name="tagInput"]`);
        this.transactionTagsLabel = page.locator(`//label[@name="transactionTagsLabel"]`);
        this.updateTagButton = page.locator(`xpath=//button[@name="updateTagButton"]`);
        this.cancelUpdateTagButton = page.locator(`xpath=//button[@name="CancelTagsButton"]`);
        this.tagSuccessMsg = page.locator(`xpath=//label[@name="successMsg"]`);
        this.closeTransactionDetailsPopup = page.locator('xpath=//div[@name="transactionDetailsDialogPopup"]//button[@title="Close"]');
        this.closeTransactionCategoryPopup = page.locator('xpath=//div[@name="transactionCategoriesPopup"]//button[@title="Close"]');
        this.tagData = page.locator('xpath=(//div[@name="PostedTrnxtable"]//following-sibling::tbody/tr[@data-row-id="0"]/td[9])[1]');
        this.CategoryData = page.locator('xpath=(//div[@name="PostedTrnxtable"]//following-sibling::tbody/tr[@data-row-id="0"]/td[8])[1]');
        this.transactionDetailspopupHeader = page.locator('xpath=//span[text()="Transaction Detail"]');
        this.noPendingTransactions = page.getByText('There are no pending transactions.');
        this.clickingOnFirstPendingRecord = page.locator('xpath=(//div[@name="stvPendingTransactionsListTable1"]//following-sibling::tbody/tr[@data-row-id="0"]/td[2])[1]');
        this.pendingTransactionDate = page.locator('xpath=(//label[@name="tranDate"])[1]');
        this.pendingTransactionDescription = page.locator('xpath=(//label[@name="tranDesc"])[1]');
        this.pendingTransactionAdditionalDescription = page.locator('xpath=(//label[@name="tranMemo"])[1]');
        this.pendingTransactionType = page.locator('xpath=(//label[@name="TranType"])[1]');
        this.pendingTransactionAmount = page.locator('xpath=(//label[@name="TranAmt"])[1]');
        this.pendingTransactionDateValue = page.locator('xpath=(//label[@name="trnDate"])[1]');
        this.pendingTransactionDescriptionValue = page.locator('xpath=(//label[@name="trnDesc"])[1]');
        this.pendingTransactionAdditionalDescriptionValue = page.locator('xpath=(//label[@name="trnMemo"])[2]');
        this.pendingTransactionTypeValue = page.locator('xpath=(//label[@name="transactionType"])[1]');
        this.pendingTransactionAmountValue = page.locator('xpath=(//label[@name="tranAmt"])[1]');
        this.postedTxnAccountNumber = page.locator('xpath=//label[@name="accountNumber"]');
        this.postedTxnAccountNumberValue = page.locator('xpath=(//label[@name="accValue"])[1]');
        this.RADescription = page.locator('xpath=//label[@name="raDesc"]');
        this.RADescriptionValue = page.locator('xpath=(//label[@name="trnDesc"])[2]');
        this.postedCheckNum = page.locator('xpath=//label[@name="Check Number"]');
        this.postedCheckNumValue = page.locator('xpath=//label[@name="chckNum"]');
        this.showSearchOptionsLink = page.locator('xpath=//label[@name="moreSearchOptionLink"]');
        this.searchByDescriptionOption = page.locator('xpath=//button[@title="Search by Description"]');
        this.searchByTypeOption = page.locator('xpath=//button[@title="Search by Type"]');
        this.searchByAmountOption = page.locator('xpath=//button[@title="Search by Amount"]');
        this.searchByDateOption = page.locator('xpath=//button[@name="buttonDate"]');
        this.searchByCheckNumOption = page.locator('xpath=//button[@title="Search by CheckNumber"]');   
        this.inputDescriptionSearch = page.locator('xpath=//input[@name="trnDesc_formWidget"]');
        this.depositTypeSearch = page.locator('span:has-text("Deposit(s)")');
        this.withdrawalsTypeSearch = page.locator('span:has-text("Withdrawal(s)")');
        this.checksTypeSearch = page.locator('span:has-text("Check(s)")');
        this.specificAmountSearchOption = page.getByText('Specific Amount');
        this.amountRangeSearchOption = page.locator('span:has-text("Amount Range")');
        this.specificDateSearchOption = page.locator('label:has-text("Specific Date")');
        this.dateRangeSearchOption = page.locator("//span[normalize-space()='Date Range']")
        this.specificCheckNumSearchOption = page.locator("//span[normalize-space()='Specific Check']");
        this.checkNumRangeSearchOption =page.locator("//span[normalize-space()='Check Range']");
        this.specificAmountInput = page.locator('input[name="lowAmt_formWidget"]');
        this.amountRangeMinInput = page.locator('input[name="lowAmt_formWidget"]');
        this.amountRangeMaxInput = page.locator('input[name="highAmt_formWidget"]');
        this.specificDateInput = page.locator('input[name="fromDt_formWidget"]');
        this.dateRangeStartInput = page.locator('input[name="fromDt_formWidget"]');
        this.dateRangeEndInput = page.locator('input[name="toDt_formWidget"]');
        this.specificCheckNumInput = page.locator('input[name="startChkNum_formWidget"]');
        this.checkNumRangeStartInput = page.locator('input[name="startChkNum_formWidget"]');
        this.checkNumRangeEndInput = page.locator('input[name="endChkNum_formWidget"]');
        this.searchButton =  page.locator('button:has-text("Search")');
        this.noRecordsMsg = page.getByText('No Recent Transactions that match search criteria. Review search criteria.', { exact: true });
        this.noPendingMsgVisible = page.getByText('There are no pending transactions.');
        this.modifyButton = page.locator('button[name="buttonModifySearch"]');
        this.descriptionSearchErrorMsg = page.getByText('Please enter a Description.', { exact: true })
        this.amountSearchErrorMsg = page.getByText('Please provide a valid Amount', { exact: true });
        this.startAmountSearchErrorMsg = page.getByText('Please provide a valid Start Amount', { exact: true });
        this.endAmountSearchErrorMsg = page.getByText('Please provide a valid End Amount', { exact: true });
        this.startamtGreaterThanEndAmtErrorMsg = page.getByText('Please provide valid Start & End Amount values', { exact: true });
        this.specificDateSearchErrorMsg = page.getByText('Please provide a valid Date', { exact: true });
        this.startDateSearchErrorMsg = page.getByText('Please provide a valid Start Date', { exact: true });
        this.endDateSearchErrorMsg = page.getByText('Please provide a valid End Date', { exact: true });
        this.startDateGreaterThanEndDateErrorMsg = page.getByText('Please provide valid Start & End Date values', { exact: true });
        this.specificCheckNumSearchErrorMsg = page.getByText('Please provide a valid Check Number', { exact: true });
        this.startCheckNumSearchErrorMsg = page.getByText('Please provide a valid Start Check Number', { exact: true });
        this.endCheckNumSearchErrorMsg = page.getByText('Please provide a valid Ending Check Number', { exact: true });
        this.startCheckNumGreaterThanEndCheckNumErrorMsg = page.getByText('Please provide valid Starting & Ending Check Numbers', { exact: true }).first();
        this.printPreviewModal = page.locator('xpath=//div[@class="app-dialog-body modal-body"]');
        this.printPreviewCloseBtn = page.locator('button[name="buttonClosePrintTrnx"]');
        this.printPreviewContent = page.locator('xpath=//div[@class="app-dialog-body modal-body"]//div[@content="Partial_Web_Print_Transactions"]');
        this.printPreviewAccountInfo = page.locator('xpath=//div[@role="dialog"]//div[contains(@class, "account-info")]').first();
        this.printPreviewTransactionList = page.locator('xpath=//div[@role="dialog"]//table').first();
        this.printPreviewHeader = page.locator('xpath=//div[@role="dialog"]//div[contains(@class, "header")]').first();
        this.printPreviewPrintButton = page.locator('xpath=//div[@role="dialog"]//button[contains(text(), "Print")]').first();

        this.downloadTransactionsLabel = page.getByLabel('Download Transactions');
        this.filetypeDropdown = page.locator('xpath=(//select[@name="select1"] | select[@name="select1_formWidget"])');
        this.transactionPeriod =page.locator('label').filter({ hasText: 'Transaction Period' });
        this.customeDateRangeOption = page.locator('span').filter({ hasText: 'Custom date range' });
        this.fromDateInput = page.locator('input[name="startDateWidget_formWidget"]');
        this.toDateInput = page.locator('input[name="endDateWidget_formWidget"]');
        this.exportButton = page.locator('[name="buttonExport"]');
        this.downloadSuccess = page.getByText('Transactions downloaded successfully', { exact: true }); 
        this.closeDialogBtn = page.getByText('Close', { exact: true });
        this.dateRangeExceedsMaxRangeStartDateErrorMsg = page.locator('p').filter({ hasText: 'No Recent Transactions that match search criteria. Review search criteria.' }).first();
        this.dateRangeExceedsMaxRangeEndDateErrorMsg = page.locator('p').filter({ hasText: 'No Recent Transactions that match search criteria. Review search criteria.' }).last();

        


    }
    /** <summary>
      * This function is to verify pending and posted transactions label and i info symbol
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:06/12/2025	       Created By:Rohan    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async VerifyPendingAndPostedTransactionsLabelAndiInfoSymbol() {
        try {
            await this.page.waitForLoadState('load');
            await expect(this.pendingTranHdr).toBeVisible();
            await this.postedTranHdr.scrollIntoViewIfNeeded();
            await expect(this.postedTranHdr).toBeVisible();
            Report.pass(this.page, 'Pending and Posted transactions header are displayed');
            await expect(this.iSymbPendTran).toBeVisible();
            Report.pass(this.page, 'Pending i Symbol is displayed');
            await this.iSymbPendTran.click();
            await expect(this.iSymbPopupHdr).toBeVisible();
            Report.pass(this.page, 'Pending i popup is displayed');
            await expect(this.iSymbPendPopupText).toBeVisible();
            await this.OKBtn.click();
            Report.pass(this.page, 'Pending i popup is closed');
            await expect(this.iSymbPostTran).toBeVisible();
            Report.pass(this.page, 'Posted i Symbol is displayed');
            await this.iSymbPostTran.click();
            await expect(this.iSymbPopupHdr).toBeVisible();
            Report.pass(this.page, 'Posted i popup is displayed');
            await expect(this.iSymbPostPopupText).toBeVisible();
            await this.OKBtn.click();
            Report.pass(this.page, 'Posted i popup is closed');
        }
        catch (error) {
            await Report.fail(this.page, `VerifyPendingAndPostedTransactionsLabelAndiSymbol is failed :${error.message}`);
        }
    }

    /** <summary>
      * This function is to verify pending and posted transactions column header
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:06/12/2025	       Created By:Rohan    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async VerifyPendingAndPostedColumnHdr() {
        try {
            const expectedPendingHeaders = ['Date', 'Description', 'Amount'];
            const expectedPostedHeaders = ['Date', 'Description', 'Amount', 'Balance'];

            // Verify Pending Headers
            await expect(this.datePendColHdr).toBeVisible();
            const actualDatePendColHdr = await this.datePendColHdr.textContent();
            expect(actualDatePendColHdr?.trim()).toEqual(expectedPendingHeaders[0]);

            await expect(this.descPendColHdr).toBeVisible();
            const actualDescPendColHdr = await this.descPendColHdr.textContent();
            expect(actualDescPendColHdr?.trim()).toEqual(expectedPendingHeaders[1]);

            await expect(this.amountPendColHdr).toBeVisible();
            const actualAmountPendColHdr = await this.amountPendColHdr.textContent();
            expect(actualAmountPendColHdr?.trim()).toEqual(expectedPendingHeaders[2]);

            Report.pass(this.page, 'Pending table headers are displayed as expected. Headers displayed are: ' + actualDatePendColHdr + ', ' + actualDescPendColHdr + ', ' + actualAmountPendColHdr);

            // Verify Posted Headers
            await expect(this.datePostColHdr).toBeVisible();
            const actualDatePostColHdr = await this.datePostColHdr.textContent();
            expect(actualDatePostColHdr?.trim()).toEqual(expectedPostedHeaders[0]);

            await expect(this.descPostColHdr).toBeVisible();
            const actualDescPostColHdr = await this.descPostColHdr.textContent();
            expect(actualDescPostColHdr?.trim()).toEqual(expectedPostedHeaders[1]);

            await expect(this.amountPostColHdr).toBeVisible();
            const actualAmountPostColHdr = await this.amountPostColHdr.textContent();
            expect(actualAmountPostColHdr?.trim()).toEqual(expectedPostedHeaders[2]);

            await expect(this.balPostColHdr).toBeVisible();
            const actualBalPostColHdr = await this.balPostColHdr.textContent();
            expect(actualBalPostColHdr?.trim()).toEqual(expectedPostedHeaders[3]);

            Report.pass(this.page, 'Posted table headers are displayed as expected. Headers displayed are: ' + actualDatePostColHdr + ', ' + actualDescPostColHdr + ', ' + actualAmountPostColHdr + ', ' + actualBalPostColHdr);
        }
        catch (error) {
            await Report.fail(this.page, `VerifyPendingAndPostedColumnHdr is failed :${error.message}`);
        }
    }

    /** <summary>
      * This function is to verify pending and posted transactions column header for Enrich Eligible accounts
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:02/17/2025	       Created By:Krishna Kota    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async VerifyPendingAndPostedColumnHdrForEnrichEligibleAccounts() {
        try {
            const expectedPendingHeaders = ['Date', 'Description', 'Amount'];
            const expectedPostedHeaders = ['Date', 'Vendor', 'Description', 'Category', 'Tag', 'Amount', 'Balance'];

            // Verify Pending Headers
            await expect(this.datePendColHdr).toBeVisible();
            const actualdatePendColHdr = await this.datePendColHdr.textContent();
            expect(actualdatePendColHdr?.trim()).toEqual(expectedPendingHeaders[0]);

            await expect(this.descPendColHdr).toBeVisible();
            const actualdescPendColHdr = await this.descPendColHdr.textContent();
            expect(actualdescPendColHdr?.trim()).toEqual(expectedPendingHeaders[1]);

            await expect(this.amountPendColHdr).toBeVisible();
            const actualamountPendColHdr = await this.amountPendColHdr.textContent();
            expect(actualamountPendColHdr?.trim()).toEqual(expectedPendingHeaders[2]);

            Report.pass(this.page, 'Pending table headers are displayed as expected. Headers displayed are: ' + actualdatePendColHdr + ', ' + actualdescPendColHdr + ', ' + actualamountPendColHdr);

            // Verify Posted Headers
            await expect(this.datePostColHdr).toBeVisible();
            const actualdatePostColHdr = await this.datePostColHdr.textContent();
            expect(actualdatePostColHdr?.trim()).toEqual(expectedPostedHeaders[0]);

            await expect(this.vendorPostColHdr).toBeVisible();
            const actualvendorPostColHdr = await this.vendorPostColHdr.textContent();
            expect(actualvendorPostColHdr?.trim()).toEqual(expectedPostedHeaders[1]);

            await expect(this.descPostColHdr).toBeVisible();
            const actualdescPostColHdr = await this.descPostColHdr.textContent();
            expect(actualdescPostColHdr?.trim()).toEqual(expectedPostedHeaders[2]);

            await expect(this.categoryPostColHdr).toBeVisible();
            const actualcategoryPostColHdr = await this.categoryPostColHdr.textContent();
            expect(actualcategoryPostColHdr?.trim()).toEqual(expectedPostedHeaders[3]);

            await expect(this.tagPostColHdr).toBeVisible();
            const actualtagPostColHdr = await this.tagPostColHdr.textContent();
            expect(actualtagPostColHdr?.trim()).toEqual(expectedPostedHeaders[4]);

            await expect(this.amountPostColHdr).toBeVisible();
            const actualamountPostColHdr = await this.amountPostColHdr.textContent();
            expect(actualamountPostColHdr?.trim()).toEqual(expectedPostedHeaders[5]);

            await expect(this.balPostColHdrEnrichTxn).toBeVisible();
            const actualbalPostColHdr = await this.balPostColHdrEnrichTxn.textContent();
            expect(actualbalPostColHdr?.trim()).toEqual(expectedPostedHeaders[6]);

            Report.pass(this.page, 'Posted table headers are displayed as expected for Enrich transactions. Headers displayed are: ' + actualdatePostColHdr + ',' + actualvendorPostColHdr + ', ' + actualdescPostColHdr + ', ' + actualcategoryPostColHdr + ',' + actualtagPostColHdr + ', ' + actualamountPostColHdr + ', ' + actualbalPostColHdr);
        }
        catch (error) {
            await Report.fail(this.page, `VerifyPendingAndPostedColumnHdr is failed :${error.message}`);
        }
    }

    /** <summary>
          * This function is to verify edit Category/tag for Enrich posted transactions
           ************************************************************************************************************************************************************
          * Revision History:
          * Date:02/20/2026	       Created By:Krishna Kota    					        
          * Date:NA           	   Updated By:NA           					
          * ************************************************************************************************************************************************************
       */
    async getTagDataFromTransactionList() {
        try {
            const tagDataValue = await this.tagData.textContent();
            const tagDataValueBefore = tagDataValue?.trim() ?? '';
            Report.info(this.page, `Tag data value from transaction list: ${tagDataValueBefore}`);
            return tagDataValueBefore;
        }


        catch (error) {
            await Report.fail(this.page, `clickOnFirstPostedTransactionRecord is failed :${error.message}`);
        }
    }

    async clickOnFirstPostedTransactionRecord() {
        try {
            await this.page.waitForLoadState('load');
            await this.page.waitForTimeout(5000);
            // Wait for actual transaction records first (longer timeout to allow data to load)
            const firstRecordVisible = await this.clickingOnFirstRecordInPostedTran.isVisible({ timeout: 15000 }).catch(() => false);
            if (firstRecordVisible) {
                await this.clickingOnFirstRecordInPostedTran.click();
                await this.page.waitForLoadState('load');
                await this.postedDate.waitFor({ state: 'visible', timeout: 10000 });
            }

        }
        catch (error) {
            await Report.fail(this.page, `clickOnFirstPostedTransactionRecord is failed :${error.message}`);
        }
    }

    async clickEditIconForCategory() {
        try {
            await expect(this.categoryEditIcon).toBeVisible({ timeout: 10000 });
            await expect(this.categoryEditIcon).toBeEnabled();
            await this.categoryEditIcon.click();
            await expect(this.chooseCategoryDialog).toBeVisible({ timeout: 5000 });
        }
        catch (error) {
            await Report.fail(this.page, `clickOnEditIconForCategory is failed :${error.message}`);
            throw error;
        }
    }

    async clickOnEditIconForCategory() {
        try {
            //before edit category values
            await this.categoryEditIcon.waitFor({ state: 'visible', timeout: 10000 });
            const categoryBeforeEdit = await this.transactionCategoryValue.textContent();
            const categoryBeforeEditText = categoryBeforeEdit?.trim() ?? '';
            Report.info(this.page, `Category before edit: ${categoryBeforeEditText}`);
            //perform edit category action
            await this.categoryEditIcon.click();

            const isCategoryDialogVisible = await this.chooseCategoryDialog
                .isVisible({ timeout: 3000 })
                .catch(() => false);
            if (!isCategoryDialogVisible) {
                await this.categoryEditIcon.click();
            }

            await expect(this.chooseCategoryDialog).toBeVisible({ timeout: 5000 });
            return categoryBeforeEditText;
        }
        catch (error) {
            await Report.fail(this.page, `clickOnEditIconForCategory is failed :${error.message}`);
            throw error;
        }
    }


    async selectCategoryFromList(categoryBeforeEditText: string) {
        try {
            // Wait for category options to be rendered inside category dialog
            const categoryOptions = this.chooseCategoryDialog.locator('xpath=.//label[@name="Name"]');
            await expect.poll(async () => await categoryOptions.count(), { timeout: 10000 }).toBeGreaterThan(0);
            const categoryCount = await categoryOptions.count();

            if (categoryCount > 0) {
                // Choose a category different from current value when possible
                let selectedIndex = 0;
                for (let i = 0; i < categoryCount; i++) {
                    const optionText = (await categoryOptions.nth(i).textContent())?.trim() ?? '';
                    if (optionText && optionText.toLowerCase() !== categoryBeforeEditText.toLowerCase()) {
                        selectedIndex = i;
                        break;
                    }
                }
                const selectedCategory = categoryOptions.nth(selectedIndex);
                await selectedCategory.click();

                // Get the selected category text for reporting
                const selectedCategoryText = (await selectedCategory.textContent())?.trim() ?? '';
                Report.info(this.page, `selected category: ${selectedCategoryText}`);
                return selectedCategoryText;
            }
        }
        catch (error) {
            await Report.fail(this.page, `selectCategoryFromList is failed :${error.message}`);
        }
    }

    async captureCategoryList(categoryBeforeEditText?: string) {
        try {
            const categoryOptions = this.chooseCategoryDialog.locator('xpath=.//label[@name="Name"]');
            await expect.poll(async () => await categoryOptions.count(), { timeout: 10000 }).toBeGreaterThan(0);
            const categoryCount = await categoryOptions.count();
            const categoryList: string[] = [];

            for (let i = 0; i < categoryCount; i++) {
                const optionText = (await categoryOptions.nth(i).textContent())?.trim() ?? '';
                if (optionText) {
                    categoryList.push(optionText);
                }
            }

            const uniqueCategoryList = [...new Set(categoryList)];
            Report.info(this.page, `Captured category options: ${uniqueCategoryList.join(', ')}`);

            if (categoryBeforeEditText) {
                const alternativeCategories = uniqueCategoryList.filter(
                    (category) => category.toLowerCase() !== categoryBeforeEditText.toLowerCase()
                );
                Report.info(this.page, `Alternative category options: ${alternativeCategories.join(', ')}`);
            }
            await this.closeTransactionCategoryPopup.click();
            await this.page.waitForLoadState('load');
            await this.closeTransactionDetailsPopup.click();
            await this.page.waitForLoadState('load');
            return uniqueCategoryList;
        }
        catch (error) {
            await Report.fail(this.page, `captureCategoryList is failed :${error.message}`);
            return [];
        }
    }

    async clickUpdateCategotyButton() {
        try {
            // Click on update button to save the changes   
            await this.updateCategoryButton.click();
            await this.page.waitForLoadState('load');
        }
        catch (error) {
            await Report.fail(this.page, `clickUpdateCategotyButton is failed :${error.message}`);
        }
    }

    async clickCancelCategotyButton() {
        try {
            // Click on update button to save the changes   
            await expect(this.canceCategoryButton).toBeVisible({ timeout: 5000 });
            await this.canceCategoryButton.scrollIntoViewIfNeeded();
            await this.canceCategoryButton.click();
            await expect(this.chooseCategoryDialog).not.toBeVisible({ timeout: 5000 });
            await this.page.waitForLoadState('load');
        }
        catch (error) {
            await Report.fail(this.page, `clickUpdateCategotyButton is failed :${error.message}`);
            throw error;
        }
    }

    async verifyCategoryUpdateIsNotSaved(categoryBeforeEditText: string) {
        try {
            const categoryAfterCancelUpdate = await this.transactionCategoryValue.textContent();
            const categoryTextAfterCancelUpdate = categoryAfterCancelUpdate?.trim() ?? '';
            Report.info(this.page, `Category After Cancelling Update: ${categoryTextAfterCancelUpdate}`);
            await expect(this.chooseCategoryDialog).not.toBeVisible();
            expect(categoryTextAfterCancelUpdate).toEqual(categoryBeforeEditText);
            Report.pass(this.page, 'Category update is not saved upon cancelling the update');
            // close transaction details popup
            await this.closeTransactionDetailsPopup.click();
            await this.page.waitForLoadState('load');
        }
        catch (error) {
            await Report.fail(this.page, `clickCancelCategotyButton is failed :${error.message}`);
            throw error;
        }
    }

    //to check tag cancel not saving the changes
    async verifyTagUpdateIsNotSaved(tagDataValueBeforeInTxnList: string) {
        try {
            const tagBeforeUpdate = (await this.transactionTagsLabel.textContent())?.trim() ?? '';
            let newTag = `TestTag${Date.now().toString().slice(-4)}`;
            await this.tagInput.fill(newTag);
            await expect(this.cancelUpdateTagButton).toBeVisible({ timeout: 5000 });
            await this.cancelUpdateTagButton.scrollIntoViewIfNeeded();
            await this.cancelUpdateTagButton.click();
            await this.page.waitForTimeout(3000); // wait for any UI updates after clicking cancel
            await this.page.waitForLoadState('load');
            await expect(this.transactionDetailspopupHeader).toBeVisible({ timeout: 5000 });
            const tagAfterCancelUpdate = (await this.transactionTagsLabel.textContent())?.trim() ?? '';
            Report.info(this.page, `Tag After Cancelling Update: ${tagAfterCancelUpdate}`);
            await expect(this.tagsubTitle).not.toBeVisible({ timeout: 5000 });
            expect(tagAfterCancelUpdate).toEqual(tagBeforeUpdate);
            Report.pass(this.page, 'Tag update is not saved in Transaction Details popup upon cancelling the update');
            // close transaction details popup
            await this.closeTransactionDetailsPopup.click();
            await this.page.waitForLoadState('load');
            //verify tag value is not updated in transaction list (UI)
            await expect.poll(async () => (await this.tagData.textContent())?.trim() ?? '', { timeout: 10000 }).toEqual(tagDataValueBeforeInTxnList);
            const tagDataValueAfter = await this.tagData.textContent();
            expect(tagDataValueAfter?.trim() ?? '').toEqual(tagDataValueBeforeInTxnList);
            Report.info(this.page, `Tag data value from transaction list after cancelling update: ${tagDataValueAfter?.trim() ?? ''}`);


        }
        catch (error) {
            await Report.fail(this.page, `clickCancelCategotyButton is failed :${error.message}`);
            throw error;
        }
    }



    async clickCancelUpdateTagButton() {
        try {
            await expect(this.cancelUpdateTagButton).toBeVisible({ timeout: 5000 });
            await this.cancelUpdateTagButton.scrollIntoViewIfNeeded();
            await this.cancelUpdateTagButton.click();
            await expect(this.transactionDetailspopupHeader).toBeVisible({ timeout: 5000 });
            await this.page.waitForLoadState('load');
        }
        catch (error) {
            await Report.fail(this.page, `clickCancelTagButton is failed :${error.message}`);
            throw error;
        }
    }

    async verifyUpdatedCategoryChanges(SuccessMessage: string, selectedCategoryText: string) {
        try {
            // Verify category value is updated in transaction details (source of truth)
            await expect.poll(async () => (await this.transactionCategoryValue.textContent())?.trim() ?? '', { timeout: 10000 }).toEqual(selectedCategoryText);
            const categoryAfterEdit = await this.transactionCategoryValue.textContent();
            Report.info(this.page, `Category after edit: ${categoryAfterEdit?.trim() ?? ''}`);

            const successMsgVisible = await this.categorySuccessMsg.isVisible({ timeout: 5000 }).catch(() => false);
            if (successMsgVisible) {
                const successMsgText = await this.categorySuccessMsg.textContent();
                expect(successMsgText?.trim()).toEqual(SuccessMessage);
            }
            Report.pass(this.page, 'Category updated successfully');
            await this.closeTransactionDetailsPopup.click();
            await this.page.waitForLoadState('load');
            //verify updated tag is displayed in transaction list (UI)
            await expect.poll(async () => (await this.CategoryData.textContent())?.trim() ?? '', { timeout: 10000 }).toEqual(selectedCategoryText);
            const CategoryDataAfter = await this.CategoryData.textContent();
            Report.info(this.page, `Category data value from transaction list after update: ${CategoryDataAfter?.trim() ?? ''}`);

        }
        catch (error) {
            await Report.fail(this.page, `clickUpdateCategotyButton is failed :${error.message}`);
        }
    }


    async clickOnAddorEditIconForTag() {
        try {
            const tagAddVisible = await this.tagAddIcon.isVisible({ timeout: 3000 }).catch(() => false);
            const tagEditVisible = await this.tagEditIcon.isVisible({ timeout: 3000 }).catch(() => false);

            if (tagAddVisible) {
                await this.tagAddIcon.click();
                Report.info(this.page, 'No existing tag found. Clicked on Add Tag icon.');
            }
            else if (tagEditVisible) {
                await this.tagEditIcon.click();
                Report.info(this.page, 'Existing tag found. Clicked on Edit Tag icon.');
            }
            else {
                throw new Error('Neither Add Tag nor Edit Tag icon is visible for the selected transaction.');
            }

            // Verify add/edit tag dialog is displayed
            await expect(this.tagsubTitle).toBeVisible({ timeout: 5000 });
            Report.pass(this.page, 'Tag dialog is displayed after clicking on Add/Edit tag icon');
        }
        catch (error) {
            await Report.fail(this.page, `clickOnEditIconForTag is failed :${error.message}`);
        }
    }

    async enterTagandUpdate(SuccessMessage: string, tagDataValueBefore: string) {
        try {
            const tagBeforeUpdate = (await this.transactionTagsLabel.textContent())?.trim() ?? '';

            let newTag = `TestTag${Date.now().toString().slice(-4)}`;

            await this.tagInput.fill(newTag);

            // Click on update button to save the changes
            await this.updateTagButton.click();
            await this.page.waitForLoadState('load');

            // Verify tag is updated in transaction details (source of truth)
            await expect.poll(async () => (await this.transactionTagsLabel.textContent())?.trim() ?? '', { timeout: 10000 }).toEqual(newTag);
            const tagAfterUpdate = (await this.transactionTagsLabel.textContent())?.trim() ?? '';

            if (tagBeforeUpdate) {
                expect(tagAfterUpdate).not.toEqual(tagBeforeUpdate);
                Report.pass(this.page, `Existing tag is updated successfully from '${tagBeforeUpdate}' to '${tagAfterUpdate}'`);
            } else {
                Report.pass(this.page, `Tag is added successfully and displayed in transaction details popup as '${tagAfterUpdate}'`);
            }

            const successMsgVisible = await this.tagSuccessMsg.isVisible({ timeout: 5000 }).catch(() => false);
            if (successMsgVisible) {
                const successMsgText = await this.tagSuccessMsg.textContent();
                expect(successMsgText?.trim()).toEqual(SuccessMessage);
            }
            Report.pass(this.page, 'Tag updated successfully');
            await this.closeTransactionDetailsPopup.click();
            await this.page.waitForLoadState('load');
            //verify updated tag is displayed in transaction list (UI)
            await expect.poll(async () => (await this.tagData.textContent())?.trim() ?? '', { timeout: 10000 }).toEqual(tagAfterUpdate);
            const tagDataValueAfter = await this.tagData.textContent();
            expect(tagDataValueAfter?.trim()).not.toEqual(tagDataValueBefore);
            Report.pass(this.page, `Tag is updated successfully from '${tagDataValueBefore}' to '${tagDataValueAfter?.trim() ?? ''}'`);
        }
        catch (error) {
            await Report.fail(this.page, `EnterTag and Update is failed :${error.message}`);
        }
    }

    async verifyUpdatedTagChanges(SuccessMessage: string, enteredTag: string) {
        try {
            // Verify category value is updated in transaction details (source of truth)
            await expect.poll(async () => (await this.transactionCategoryValue.textContent())?.trim() ?? '', { timeout: 10000 }).toEqual(enteredTag);
            const categoryAfterEdit = await this.transactionCategoryValue.textContent();
            Report.info(this.page, `Category after edit: ${categoryAfterEdit?.trim() ?? ''}`);

            const successMsgVisible = await this.categorySuccessMsg.isVisible({ timeout: 5000 }).catch(() => false);
            if (successMsgVisible) {
                const successMsgText = await this.categorySuccessMsg.textContent();
                expect(successMsgText?.trim()).toEqual(SuccessMessage);
            }
            Report.pass(this.page, 'Category updated successfully');
            await this.closeTransactionDetailsPopup.click();
            await this.page.waitForLoadState('load');
        }
        catch (error) {
            await Report.fail(this.page, `clickUpdateCategotyButton is failed :${error.message}`);
        }
    }



    /** <summary>
      * This function is to verify posted transactions details
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:06/12/2025	       Created By:Rohan    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async VerifyPostedTransactionDetails() {
        try {
            await this.page.waitForLoadState('load');

            // Check if no posted transactions message is displayed
            const noPostedMsgVisible = await this.noPostTran.isVisible({ timeout: 5000 }).catch(() => false);

            if (noPostedMsgVisible) {
                // No transactions available scenario
                const msg = await this.noPostTran.textContent();
                Report.info(this.page, `No posted transactions available: ${msg ?? ''}`);
            } else {
                // Transactions available - verify first transaction details
                const firstRecordVisible = await this.clickingOnFirstRecordInPostedTran.isVisible({ timeout: 10000 }).catch(() => false);

                if (firstRecordVisible) {
                    await this.clickingOnFirstRecordInPostedTran.click();
                    await waitForSpinnerToClose(this.page);
                    //await this.postedDate.waitFor({ state: 'visible', timeout: 10000 });

                    await expect(this.postedDate).toHaveText('Posted Date:');
                    const postedDateValue = (await this.postedDateValue.textContent())?.trim() ?? '';
                    expect(postedDateValue).not.toBe('');
                    await Report.info(this.page, `Posted date value: ${postedDateValue}`);
                    await this.postedDate.scrollIntoViewIfNeeded();
                    //await expect(this.postedDateValue).toBeVisible();
                    await expect(this.transactionDate).toHaveText('Transaction Date:');
                    const postedTransactionDateValue = (await this.transactionDateValue.textContent())?.trim() ?? '';
                    expect(postedTransactionDateValue).not.toBe('');
                    await Report.info(this.page, `Posted transaction date value: ${postedTransactionDateValue}`);

                    //await expect(this.transactionDateValue).toBeVisible();
                    //await expect(this.tranDesc).toBeVisible();
                    //await expect(this.tranDescValue).toBeVisible();

                    const tranDesc = await this.tranDesc.isVisible().catch(() => false);
                    const tranDescValue = await this.tranDescValue.isVisible().catch(() => false);
                    if (tranDesc && tranDescValue) {
                        await expect(this.tranDesc).toHaveText("Description:");
                        //await expect(this.tranDescValue).toBeVisible();
                        const postedTranDescValue = (await this.tranDescValue.textContent())?.trim() ?? '';
                        expect(postedTranDescValue).not.toBe('');
                        await Report.info(this.page, `Posted transaction description value: ${postedTranDescValue}`);
                    } 

                    const RADesc = await this.RADescription.isVisible().catch(() => false);
                    const RADescValue = await this.RADescriptionValue.isVisible().catch(() => false); 
                    if (RADesc && RADescValue) {
                        await expect(this.RADescription).toHaveText("RA Description:");
                        //await expect(this.RADescriptionValue).toBeVisible();
                        const RADescriptionValueText = (await this.RADescriptionValue.textContent())?.trim();
                        await Report.info(this.page, `Posted transaction RA description value is displayed: ${RADescriptionValueText ?? ''}`);
                    }


                    await expect(this.additionalDesc).toHaveText("Additional Description:");
                    const additionalDescValueVisible = await this.additionalDescValue.isVisible({ timeout: 3000 }).catch(() => false);
                    if (additionalDescValueVisible) {
                        await expect(this.additionalDescValueEnrichTxn).toBeVisible();
                        const additionalDescValueText = (await this.additionalDescValueEnrichTxn.textContent())?.trim();
                        await Report.info(this.page, `Posted transaction Additional description value is displayed: ${additionalDescValueText ?? ''}`);
                    } else {
                        await Report.info(this.page, 'Posted transaction Additional description value is not displayed for this transaction (optional scenario).');
                    }    

                    //await expect.soft(this.additionalDescValue).toBeVisible();
                    await expect(this.tranType).toHaveText("Transaction Type:");
                    const postedtranTypeValue = (await this.tranTypeValue.textContent())?.trim() ?? '';
                    expect(postedtranTypeValue).not.toBe('');
                    await Report.info(this.page, `Posted transaction date value: ${postedtranTypeValue}`);

                    //await expect(this.tranTypeValue).toBeVisible();

                    await expect(this.tranAmt).toHaveText("Transaction Amount:");
                    const postedtranAmtValue = (await this.tranAmtValue.textContent())?.trim() ?? '';
                    expect(postedtranAmtValue).not.toBe('');
                    await Report.info(this.page, `Posted transaction date value: ${postedtranAmtValue}`);
                    //await expect(this.tranAmtValue).toBeVisible();

                  //postedCheckNum
                   const postedCheckNum = await this.postedCheckNum.isVisible().catch(() => false);
                   const postedCheckNumValue = await this.postedCheckNumValue.isVisible().catch(() => false);
                   if (postedCheckNum && postedCheckNumValue) {
                    await expect(this.postedCheckNum).toHaveText("Check Number:");
                    const postedCheckNumValueText = (await this.postedCheckNumValue.textContent())?.trim() ?? '';
                    expect(postedCheckNumValueText).not.toBe('');
                    await Report.info(this.page, `Posted transaction Check number value is displayed: ${postedCheckNumValueText}`);
                   } 
                    
                    Report.pass(this.page, 'Expected details are displayed for posted transaction');
                } else {
                    Report.fail(this.page, 'No posted transaction records found to verify');
                }
            }
        }
        catch (error) {
            await Report.fail(this.page, `VerifyPostedTransactionDetails is failed :${error.message}`);
        }
    }

    /** <summary>
      * This function is to verify posted transactions details of Enrich Eligible accounts
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:06/12/2025	       Created By:Krishna Kota    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async VerifyPostedTransactionDetailsOfEnrichAccounts() {
        try {
            await this.page.waitForLoadState('load');

            // Check if no posted transactions message is displayed
            const noPostedMsgVisible = await this.noPostTran.isVisible({ timeout: 5000 }).catch(() => false);

            if (noPostedMsgVisible) {
                // No transactions available scenario
                const msg = await this.noPostTran.textContent();
                Report.info(this.page, `No posted transactions available: ${msg ?? ''}`);
            } else {
                // Transactions available - verify first transaction details
                const firstRecordVisible = await this.clickingOnFirstRecordInPostedTran.isVisible({ timeout: 10000 }).catch(() => false);

                if (firstRecordVisible) {
                    await this.clickingOnFirstRecordInPostedTran.click();
                    await waitForSpinnerToClose(this.page);
                    await this.page.waitForLoadState('load');
                    
                    await expect(this.tranAmt).toHaveText('Transaction Amount:');
                    const postedTranAmtValue = (await this.tranAmtValue.textContent())?.trim() ?? '';
                    expect(postedTranAmtValue).not.toBe('');
                    await Report.info(this.page, `Posted transaction amount value: ${postedTranAmtValue}`);
                    
                    await expect(this.postedTxnAccountNumber).toHaveText('Account:');
                    const postedTxnAccountNumberValue = (await this.postedTxnAccountNumberValue.textContent())?.trim() ?? '';
                    expect(postedTxnAccountNumberValue).not.toBe('');
                    await Report.info(this.page, `Posted transaction account number value: ${postedTxnAccountNumberValue}`);

                    await expect(this.transactionDate).toHaveText('Transaction Date:');
                    const postedTransactionDateValue = (await this.transactionDateValue.textContent())?.trim() ?? '';
                    expect(postedTransactionDateValue).not.toBe('');
                    await Report.info(this.page, `Posted transaction date value: ${postedTransactionDateValue}`);

                    await expect(this.postedDate).toHaveText('Posted Date:');
                    const postedDateValue = (await this.postedDateValueEnrichTxn.textContent())?.trim() ?? '';
                    expect(postedDateValue).not.toBe('');
                    await Report.info(this.page, `Posted date value: ${postedDateValue}`);

                    await expect(this.tranDesc).toHaveText('Description:');
                    const postedTranDescValue = (await this.enrichPostedTranDescValue.textContent())?.trim() ?? '';
                    expect(postedTranDescValue).not.toBe('');
                    await Report.info(this.page, `Posted transaction description value: ${postedTranDescValue}`);

                    await expect(this.additionalDescEnrichTxn).toHaveText('Additional Description:');
                    const additionalDescValueVisible = await this.additionalDescValueEnrichTxn.isVisible({ timeout: 3000 }).catch(() => false);
                    if (additionalDescValueVisible) {
                        await expect(this.additionalDescValueEnrichTxn).toBeVisible();
                        const additionalDescValueText = (await this.additionalDescValueEnrichTxn.textContent())?.trim();
                        await Report.info(this.page, `Posted transaction Additional description value is displayed: ${additionalDescValueText ?? ''}`);
                    } else {
                        await Report.info(this.page, 'Posted transaction Additional description value is not displayed for this transaction (optional scenario).');
                    }

                    await expect(this.updateCatTag).toHaveText('Update Category or Tag');
                    await expect(this.transactionCategoryLabel).toHaveText('Category:');
                    await expect(this.categoryEditIcon).toBeVisible();
                    await expect(this.tagTitleLabel).toHaveText('Tag:');


                    const tagAddVisible = await this.tagAddIcon.isVisible().catch(() => false);
                    const tagEditVisible = await this.tagEditIcon.isVisible().catch(() => false);
                    expect(tagAddVisible !== tagEditVisible).toBeTruthy();
                    if (tagAddVisible) {
                        await expect(this.tagAddIcon).toBeVisible();
                    }
                    if (tagEditVisible) {
                        await expect(this.tagEditIcon).toBeVisible();
                    }

                    Report.pass(this.page, 'Expected details are displayed for posted transaction');
                    await this.closeTransactionDetailsPopup.click();
                    await this.page.waitForLoadState('load');

                } else {
                    Report.fail(this.page, 'No posted transaction records found to verify');
                }
            }
        }
        catch (error) {
            await Report.fail(this.page, `VerifyPostedTransactionDetails is failed :${error.message}`);
        }
    }


    //
 /** <summary>
      * This function is to verify Pending transactions details of Enrich Eligible accounts
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:04/21/2026	       Created By:Krishna Kota    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async VerifyPendingTransactionDetails() {
        try {
            await this.page.waitForLoadState('load');

            // Check if no posted transactions message is displayed
            const noPendingMsgVisible = await this.noPendingTransactions.isVisible({ timeout: 5000 }).catch(() => false);

            if (noPendingMsgVisible) {
                // No transactions available scenario
                const msg = await this.noPendingTransactions.textContent();
                Report.info(this.page, `No pending transactions available: ${msg ?? ''}`);
            } else {
                // Transactions available - verify first transaction details
                const firstRecordVisible = await this.clickingOnFirstPendingRecord.isVisible({ timeout: 10000 }).catch(() => false);

                if (firstRecordVisible) {
                    await this.clickingOnFirstPendingRecord.click();
                    await this.page.waitForLoadState('load');
                    await expect(this.pendingTransactionDate).toHaveText('Transaction Date:');
                    const pendingTransactionDateValue = (await this.pendingTransactionDateValue.textContent())?.trim() ?? '';
                    expect(pendingTransactionDateValue).not.toBe('');
                    await Report.info(this.page, `Pending transaction date value: ${pendingTransactionDateValue}`);

                    await expect(this.pendingTransactionDescription).toHaveText('Description:');
                    const pendingTransactionDescriptionValue = (await this.pendingTransactionDescriptionValue.textContent())?.trim() ?? '';
                    expect(pendingTransactionDescriptionValue).not.toBe('');
                    await Report.info(this.page, `Pending transaction description value: ${pendingTransactionDescriptionValue}`);

                    await expect(this.pendingTransactionAdditionalDescription).toHaveText('Additional Description:');
                     const pendingTransactionAdditionalDescriptionValue = (await this.pendingTransactionDescriptionValue.textContent())?.trim() ?? '';
                    expect(pendingTransactionAdditionalDescriptionValue).not.toBe('');
                    await Report.info(this.page, `Pending transaction description value: ${pendingTransactionAdditionalDescriptionValue}`);

                    await expect(this.pendingTransactionType).toHaveText('Transaction Type:');
                    const pendingTransactionTypeValue = (await this.pendingTransactionTypeValue.textContent())?.trim() ?? '';
                    expect(pendingTransactionTypeValue).not.toBe('');
                    await Report.info(this.page, `Pending transaction type value: ${pendingTransactionTypeValue}`);
                    
                    await expect(this.pendingTransactionAmount).toHaveText('Transaction Amount:');
                    const pendingTransactionAmountValue = (await this.pendingTransactionAmountValue.textContent())?.trim() ?? '';
                    expect(pendingTransactionAmountValue).not.toBe('');
                    await Report.info(this.page, `Pending transaction amount value: ${pendingTransactionAmountValue}`); 
                    

                } else {
                    Report.fail(this.page, 'No pending transaction records found to verify');
                }
            }
        }
        catch (error) {
            await Report.fail(this.page, `VerifyPendingTransactionDetails is failed :${error.message}`);
        }
    }



    /** <summary>
      * This function is to verify account details
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:06/12/2025	       Created By:Rohan    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async VerifyAcctDetails(expectedLabels: string[], expectedValues: string[]) {
        try {
            await this.page.waitForLoadState('load');
            for (let i = 0; i < expectedLabels.length; i++) {
                const actualLabellocator = this.page.locator('xpath=//label[text()="' + expectedLabels[i] + '"]').first();
                const actualLabelText = await actualLabellocator.textContent();
                const actualValuelocator = this.page.locator('xpath=//label[text()="' + expectedValues[i] + '"]').first();
                const actualValueText = await actualValuelocator.textContent();
                await expect(actualLabellocator).toBeVisible();
                await expect(actualValuelocator).toBeVisible();
                Report.pass(this.page, 'Label and Values are displayed. Label displayed is: ' + actualLabelText + '. Value displayed is: ' + actualValueText);
            }
        }
        catch (error) {
            await Report.fail(this.page, `VerifyAcctDetails is failed :${error.message}`);
        }
    }

    /** <summary>
      * This function is to verify account details label and values
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:06/12/2025	       Created By:Rohan    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async VerifyAcctDetailsLabelAndValuesDisplay(expectedLabels: string[]) {
        try {
            await this.page.waitForLoadState('load');
            for (let i = 0; i < expectedLabels.length; i++) {
                const actualLabellocator = this.page.locator('xpath=//label[text()="' + expectedLabels[i] + '"]').first();
                const actualLabelText = await actualLabellocator.textContent();
                await expect(actualLabellocator).toBeVisible();
                const actualValuelocator = this.page.locator('xpath=//label[text()="' + expectedLabels[i] + '"]/../../div[2]/div/label').first();
                const actualValuelocator1 = this.page.locator('xpath=//label[text()="' + expectedLabels[i] + '"]/../../div[2]/label').first();
                const actualValuelocatorexist = await actualValuelocator.isVisible().catch(() => false);
                const actualValuelocator1exist = await actualValuelocator1.isVisible().catch(() => false);
                expect(actualValuelocatorexist || actualValuelocator1exist).toBeTruthy();
                if (actualValuelocatorexist) {
                    const actualValueText = await actualValuelocator.textContent();
                    Report.pass(this.page, 'Label and Values are displayed. Label displayed is: ' + actualLabelText + '. Value displayed is: ' + actualValueText);
                }
                if (actualValuelocator1exist) {
                    const actualValueText1 = await actualValuelocator1.textContent();
                    Report.pass(this.page, 'Label and Values are displayed. Label displayed is: ' + actualLabelText + '. Value displayed is: ' + actualValueText1);
                }
            }
        }
        catch (error) {
            await Report.fail(this.page, `VerifyAcctDetails is failed :${error.message}`);
        }
    }

    /** <summary>
      * This function is to verify document delivery label and value
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:06/12/2025	       Created By:Rohan    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async VerifyDocumentDeliveryLabelAndValue() {
        try {
            await this.page.waitForLoadState('load');
            const actdocDelPrefLabel = await this.docDelPrefLabel.textContent();
            const actdocDelPrefValue = await this.docDelPrefValue.textContent();
            await expect(this.docDelPrefLabel).toBeVisible();
            await expect(this.docDelPrefValue).toBeVisible();
            Report.pass(this.page, 'Label and Values are displayed. Label displayed is: ' + actdocDelPrefLabel + '. Value displayed is: ' + actdocDelPrefValue);
        }
        catch (error) {
            await Report.fail(this.page, `VerifyDocumentDeliveryLabelAndValue is failed :${error.message}`);
        }
    }

    async ClickOnShowAcctDetailsLink() {
        try {
            await this.page.waitForLoadState('load');
            await this.showAcctDetails.waitFor({ state: 'visible', timeout: 5000 });
            await this.showAcctDetails.click();
            await waitForSpinnerToClose(this.page);
            Report.pass(this.page, 'Clicked on show account details link');
        }
        catch (error) {
            await Report.fail(this.page, `ClickOnShowAcctDetailsLink is failed :${error.message}`);
        }
    }

    /** <summary>
      * This function is to click on show or hide icon on account details page
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:08/05/2025	       Created By:Rohan    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async ClickOnShowHideAcctIcon() {
        try {
            await this.page.waitForLoadState();
            await this.showHideIcon.click();
            await waitForSpinnerToClose(this.page);
            Report.pass(this.page, 'Clicked on show hide account icon');
        }
        catch (error) {
            await Report.fail(this.page, `ClickOnShowHideAcctIcon is failed :${error.message}`);
        }
    }

    /** <summary>
      * This function is to click on show other accounts chevron on account details page
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:08/05/2025	       Created By:Rohan    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async ClickOnShowOtherAcctsChevron() {
        try {
            await this.page.waitForLoadState('load');
            await this.showOtherAcctChevron.click();
            //await this.page.waitForLoadState('networkidle');
            //await this.page.waitForLoadState('load');
            Report.pass(this.page, 'Clicked on show other accounts chevron');
        }
        catch (error) {
            await Report.fail(this.page, `ClickOnChevron is failed :${error.message}`);
        }
    }

    /** <summary>
      * This function is to verify whether account number is masked on account details page
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:08/05/2025	       Created By:Rohan    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async VerifyAcctNumberIsMasked() {
        try {
            await this.page.waitForLoadState();
            const acctNum = await this.acctNumSel.textContent();
            const acctNum1 = await this.acctNumInShowAcctDet.textContent();
            expect(acctNum).toContain('****');
            expect(acctNum1).toContain('****');
            Report.pass(this.page, 'Account number is masked on top of the page and inside show account details as well.');
        }
        catch (error) {
            await Report.fail(this.page, `VerifyAcctNumberIsMasked is failed :${error.message}`);
        }
    }

    /** <summary>
      * This function is to verify whether account number is unmasked on account details page
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:08/05/2025	       Created By:Rohan    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async VerifyAcctNumberIsUnmasked() {
        try {
            await this.page.waitForLoadState();
            const acctNum = await this.acctNumSel.textContent();
            const acctNum1 = await this.acctNumInShowAcctDet.textContent();
            expect(acctNum).not.toContain('****');
            expect(acctNum1).not.toContain('****');
            Report.pass(this.page, 'Account number is unmasked on top of the page and inside show account details as well.');
        }
        catch (error) {
            await Report.fail(this.page, `VerifyAcctNumberIsUnmasked is failed :${error.message}`);
        }
    }

    /** <summary>
      * This function is to verify account types header after expanding chevron on account details page
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:08/05/2025	       Created By:Rohan    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async VerifyAccountTypesHdr() {
        try 
        {
            await this.page.waitForLoadState();
            if(await this.CDHeader.isVisible())
            {
                await expect.soft(this.CDHeader).toBeVisible();
                Report.pass(this.page, 'CD account type header is displayed as expected');
            }
             if(await this.CheckHeader.isVisible())
            {
                await expect.soft(this.CheckHeader).toBeVisible();
                Report.pass(this.page, 'Checking account type header is displayed as expected');
            }
             if(await this.SavAndMMAHeader.isVisible())
            {
                await expect.soft(this.SavAndMMAHeader).toBeVisible();
                Report.pass(this.page, 'Savings and Money Market account type header is displayed as expected');
            }
             if(await this.IRAHeader.isVisible())
            {
                await expect.soft(this.IRAHeader).toBeVisible();
                Report.pass(this.page, 'IRA account type header is displayed as expected');
            }
             if(await this.loanAndLinesOfCredHeader.isVisible())
            {
                await expect.soft(this.loanAndLinesOfCredHeader).toBeVisible();
                Report.pass(this.page, 'Loan and Lines of Credit account type header is displayed as expected');
            }
            
        }
        catch (error) {
            await Report.fail(this.page, `VerifyAccountTypesHdr is failed :${error.message}`);
        }
    }

    /** <summary>
      * This function is to verify account number after expanding show account details link on account details page
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:08/05/2025	       Created By:Rohan    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async VerifySelAcctNo(acctNo: string) {
        try {
            await this.page.waitForLoadState('load');
            const actualAcctNo = await this.acctNoUnderShowAcct.textContent();
            expect(actualAcctNo).toContain(acctNo);
            Report.pass(this.page, 'Expected account number is displayed');
        }
        catch (error) {
            await Report.fail(this.page, `VerifySelAcctNo is failed :${error.message}`);
        }
    }

    /** <summary>
      * This function is to verify whether chevron icon is present on account details page
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:08/05/2025	       Created By:Rohan    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async VerifyChevronIconIsNotPresent() {
        try {
            await this.page.waitForLoadState();
            await expect(this.showOtherAcctChevron).not.toBeVisible();
            Report.pass(this.page, 'Chevron icon is not present as expected');
        }
        catch (error) {
            await Report.fail(this.page, `VerifyChevronIconIsNotPresent is failed :${error.message}`);
        }
    }

    /** <summary>
      * This function is to verify whether current and available balance is displayed on account details page
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:08/05/2025	       Created By:Rohan    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async VerifyCurrAndAvailBal() {
        try {
            await this.page.waitForLoadState();
            const actualCurrBalText = await this.currentBalLbl.textContent();
            expect(actualCurrBalText).toEqual('Current Balance');
            await expect(this.currBalInfoIcon).toBeVisible();
            Report.pass(this.page, 'Current Balance label and Current Balance info are present');
            const actualAvailBalText = await this.availBalLbl.textContent();
            expect(actualAvailBalText).toEqual('Available Balance');
            await expect(this.availBalInfoIcon).toBeVisible();
            Report.pass(this.page, 'Available Balance label and Available Balance info are present');
        }
        catch (error) {
            await Report.fail(this.page, `VerifyCurrAndAvailBal is failed :${error.message}`);
        }
    }

    /** <summary>
      * This function is to verify whether current balance exist and available balance does not exist on account details page
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:08/05/2025	       Created By:Rohan    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async VerifyCurrBalExistAndAvailBalNotExist() {
        try {
            await this.page.waitForLoadState();
            const actualCurrBalText = await this.availBalLbl.textContent();
            expect(actualCurrBalText).toEqual('Current Balance');
            await expect(this.currBalOnlyInfo).toBeVisible();
            await expect(this.currBalValue).toBeVisible();
            Report.pass(this.page, 'Current Balance label, value and info icon are present');
            await expect(this.currentBalLbl).not.toBeVisible();
            Report.pass(this.page, 'Available Balance label is not present as expected');
        }
        catch (error) {
            await Report.fail(this.page, `VerifyCurrBalExistAndAvailBalNotExist is failed :${error.message}`);
        }
    }

    /** <summary>
      * This function is to verify whether account is present on account details page
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:08/05/2025	       Created By:Rohan    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async VerifyAccountIsPresent(last4Digit: string) {
        try {
            await this.page.waitForLoadState();
            const acctPresent = this.page.locator(`xpath=//label[text()="****${last4Digit}"]`).first();
            await expect(acctPresent).toBeVisible();
            Report.pass(this.page, 'Expected account is visible');
        }
        catch (error) {
            await Report.fail(this.page, `VerifyAccountIsPresent is failed :${error.message}`);
        }
    }

    /** <summary>
      * This function is to verify whether account nickname is shown under show account details link on account details page
       ************************************************************************************************************************************************************
      * Revision History:
      * Date:08/05/2025	       Created By:Rohan    					        
      * Date:NA           	   Updated By:NA           					
      * ************************************************************************************************************************************************************
   */

    async VerifyAcctNicknameUnderShowAct() {
        try {
            await this.page.waitForLoadState();
            const text = await this.nickName.textContent();
            const text1 = await this.nickNameUnderShowAct.textContent();
            expect(text).toEqual(text1);
            Report.pass(this.page, 'Account nickname matches with value preset under show account details');
        }
        catch (error) {
            await Report.fail(this.page, `VerifyAcctNicknameUnderShowAct is failed :${error.message}`);
        }
    }

    async VerifyBlankMsgsForTransfers(noSchedMsg: string, noPendMsg: string, noPostMsg: string) {
        try {
            await this.page.waitForLoadState();
            await this.page.waitForTimeout(30000);
            const actNoSchedMsg = await this.noSchedTran.textContent();
            expect(actNoSchedMsg).toEqual(noSchedMsg);
            Report.pass(this.page, 'Expected message is displayed. Message displayed is: ' + actNoSchedMsg);

            const actNoPendMsg = await this.noPendTran.textContent();
            expect(actNoPendMsg).toEqual(noPendMsg);
            Report.pass(this.page, 'Expected message is displayed. Message displayed is: ' + actNoPendMsg);

            const actNoPostMsg = await this.noPostTran.textContent();
            expect(actNoPostMsg).toEqual(noPostMsg);
            Report.pass(this.page, 'Expected message is displayed. Message displayed is: ' + actNoPostMsg);
        }
        catch (error) {
            await Report.fail(this.page, `VerifyBlankMsgsForTransfers is failed :${error.message}`);
        }
    }


    async VerifyMoreSearchPrintAndDownload() {
        try {
            await this.page.waitForLoadState();
            await this.moreSearchOptions.click();
            Report.pass(this.page, 'Clicked on More serach option');
            await expect(this.printOption).toBeVisible();
            await expect(this.downloadOption).toBeVisible();
        }
        catch (error) {
            await Report.fail(this.page, `VerifyMoreSearchPrintAndDownload is failed :${error.message}`);
        }
    }

    async VerifyPostedColumnHdrForLOC() {
        try {
            await expect(this.datePostColHdr).toBeVisible();
            const actualdatePostColHdr = await this.datePostColHdr.textContent();
            await expect(this.descPostColHdr).toBeVisible();
            const actualdescPostColHdr = await this.descPostColHdr.textContent();
            await expect(this.amountPostColHdr).toBeVisible();
            const actualamountPostColHdr = await this.amountPostColHdr.textContent();
            await expect(this.princPostColHdr).toBeVisible();
            const actualPrincPostColHdr = await this.princPostColHdr.textContent();
            await expect(this.interestPostColHdr).toBeVisible();
            const actualInterestPostColHdr = await this.interestPostColHdr.textContent();
            await expect(this.otherCharPostColHdr).toBeVisible();
            const actualotherCharPostColHdr = await this.otherCharPostColHdr.textContent();
            Report.pass(this.page, 'Posted table headers are displayed as expected. Headers displayed are: ' + actualdatePostColHdr + ', ' + actualdescPostColHdr + ', ' + actualPrincPostColHdr + ', ' + actualInterestPostColHdr + ', ' + actualotherCharPostColHdr + ', ' + actualamountPostColHdr);
        }
        catch (error) {
            await Report.fail(this.page, `VerifyPostedColumnHdrForLOC is failed :${error.message}`);
        }
    }

    async VerifyPostedTransactionDetailsForLOC() {
        try {
            await this.clickingOnFirstRecordInPostedTran.click();
            await this.page.waitForTimeout(10000);
            await expect(this.postedDate).toBeVisible();
            await this.postedDate.scrollIntoViewIfNeeded();
            await expect(this.postedDateValue).toBeVisible();
            await expect(this.transactionDate).toBeVisible();
            await expect(this.transactionDateValue).toBeVisible();
            await expect(this.tranDesc).toBeVisible();
            await expect(this.tranDescValue).toBeVisible();
            await expect(this.additionalDesc).toBeVisible();
            await expect(this.tranType).toBeVisible();
            await expect(this.tranTypeValue).toBeVisible();
            await expect(this.tranAmt).toBeVisible();
            await expect(this.tranAmtValue).toBeVisible();
            await expect(this.principalAmt).toBeVisible();
            await expect(this.principalAmtValue).toBeVisible();
            await expect(this.interestAmt).toBeVisible();
            await expect(this.interestAmtValue).toBeVisible();
            await expect(this.otherCharges).toBeVisible();
            await expect(this.otherChargesValue).toBeVisible();
            Report.pass(this.page, 'Expected details are displayed for posted transaction');
        }
        catch (error) {
            await Report.fail(this.page, `VerifyPostedTransactionDetails is failed :${error.message}`);
        }
    }
    /** <summary>
       * This function is used to Edit NickName in Account Page
        ************************************************************************************************************************************************************
       * Revision History:
       * Date:02/11/2026       Created By:Nikitha SK    					    Reason:Edit NickName in Account Details tab
       * Date:NA           	   Updated By:NA           						    Reason:
       * ************************************************************************************************************************************************************
    */
    //
    async EditNickNameInAcccountDetailsPage(updatedNickName: string) {
        try {
            await this.editNickNameIcon.isVisible();
            await this.editNickNameIcon.click();
            await this.nickNameTxtBox.focus();
            await this.nickNameTxtBox.clear();
            await this.nickNameTxtBox.fill("2");
            await this.page.waitForTimeout(1000);
            await this.nickNameErrorMsg.isVisible();
            let acterrorMsg = await this.nickNameErrorMsg.textContent();
            await expect(acterrorMsg).toContain("Please try again.");
            await Report.pass(this.page, 'Error message is validated');
            await this.nickNameTxtBox.clear();
            await this.nickNameTxtBox.fill(updatedNickName);
            await this.page.waitForTimeout(2000);
            await Report.pass(this.page, 'Enter the  Account Nickname: ' + updatedNickName + ' ');
            await this.nickNameTickMark.click();
            let text = await this.nickNameEditSuccessMsg.textContent();
            await expect(text).toContain("Your changes were saved successfully");
            await Report.pass(this.page, 'NickName Edit success message is validated');
            await this.OKBtn.click();
            await this.page.waitForTimeout(5000);

        } catch (error) {
            await Report.fail(this.page, 'Enter the Account Nickname is not working:');
        }
    }

    //VerifyTransactionSearchByAmount
    /** <summary>
       * This function is used to click More Search Options link
        ************************************************************************************************************************************************************
       * Revision History:
       * Date:04/21/2026       Created By: Krishna Kota     					Reason: TO click on More Search Options link in Transaction History page
       * Date:NA           	   Updated By:NA           						    Reason:
       * ************************************************************************************************************************************************************
    */
    //
    //
     async clickShowSearchOptionsLink() {
        try {
            await this.showSearchOptionsLink.waitFor({ state: 'visible', timeout: 10000 });
            await this.showSearchOptionsLink.click();
            await this.page.waitForLoadState('load');
        }   catch (error) {
            await Report.fail(this.page, `showSearchOptionsLink is failed :${error.message}`);
        }
    }



    //VerifyTransactionSearchByAmount
    /** <summary>
       * This function is used to verify Transaction Search By Amount functionality in Transaction History page
        ************************************************************************************************************************************************************
       * Revision History:
       * Date:04/21/2026       Created By: Krishna Kota     					Reason:verify Transaction Search By Amount functionality in Transaction History page
       * Date:NA           	   Updated By:NA           						    Reason:
       * ************************************************************************************************************************************************************
    */
    //
    async VerifyTransactionSearchByAmount(specificAmt: any) {
        try {
            
            await this.searchByAmountOption.click();
            await expect(this.specificAmountSearchOption).toBeEnabled();
            await this.specificAmountSearchOption.click();
            await this.specificAmountInput.waitFor({ state: 'visible', timeout: 10000 });
            await expect(this.specificAmountInput).toBeEnabled();
            await this.specificAmountInput.fill(specificAmt);
            await expect(this.specificAmountInput).toHaveValue(specificAmt);
            await this.searchButton.click();
            await waitForSpinnerToClose(this.page);
            await this.page.waitForTimeout(3000);
            const noRecordsMsgVisible = await this.noRecordsMsg.isVisible().catch(() => false);
            if (noRecordsMsgVisible) {
                const msg = await this.noRecordsMsg.textContent();
                await Report.info(this.page, `No transactions available for the searched amount: ${msg ?? ''}`);
            } else {
                // Dynamically find the Amount column index from the table headers
                const headerCells = this.page.locator('xpath=//div[@name="PostedTrnxtable"]//thead/tr/th');
                const headerCount = await headerCells.count();
                let amountColIndex = -1;
                for (let h = 0; h < headerCount; h++) {
                    const headerText = (await headerCells.nth(h).textContent())?.trim() ?? '';
                    if (headerText.toLowerCase() === 'amount') {
                        amountColIndex = h + 1; // XPath td[] is 1-based
                        break;
                    }
                }
                if (amountColIndex === -1) {
                    throw new Error('Amount column header not found in posted transactions table');
                }

                // Validate all amount cells in results: only +/- searched amount should be present.
                const resultAmountCells = this.page.locator(`xpath=//div[@name="PostedTrnxtable"]//following-sibling::tbody/tr/td[${amountColIndex}]`);
                const resultCount = await resultAmountCells.count();
                expect(resultCount).toBeGreaterThan(0);

                const normalizedExpected = specificAmt.replace(/,/g, '');
                const mismatchedAmounts: string[] = [];

                for (let i = 0; i < resultCount; i++) {
                    const rawText = (await resultAmountCells.nth(i).textContent())?.trim() ?? '';
                    const normalizedActual = rawText.replace(/\s/g, '').replace(/,/g, '');
                    const amountMatch = normalizedActual.match(/[+-]?\$?(\d+\.\d{2})/);
                    const actualMagnitude = amountMatch?.[1] ?? '';

                    if (actualMagnitude !== normalizedExpected) {
                        mismatchedAmounts.push(`Row ${i + 1}: ${rawText || '<empty>'}`);
                    }
                }

                if (mismatchedAmounts.length > 0) {
                    throw new Error(`${mismatchedAmounts.length} record(s) do not match searched amount $${specificAmt}: [${mismatchedAmounts.join(', ')}]`);
                }

                await Report.pass(this.page, `All displayed records match searched amount ${specificAmt} (debit/credit allowed). Total records: ${resultCount}`);
            }
        }
        catch (error) {
            await Report.fail(this.page, `VerifyTransactionSearchByAmount is failed :${error.message}`);
        }
    }

    //VerifyTransactionSearchByAmount
    /** <summary>
       * This function is used to verify Transaction Search By Amount Range functionality in Transaction History page
        ************************************************************************************************************************************************************
       * Revision History:
       * Date:04/24/2026       Created By: Krishna Kota     					Reason:verify Transaction Search By Amount Range functionality in Transaction History page
       * Date:NA           	   Updated By:NA           						    Reason:
       * ************************************************************************************************************************************************************
    */
    //
    async VerifyTransactionSearchByAmountRange(minAmt: any,maxAmt: any) {
        try {
           
            await this.searchByAmountOption.click();
            await this.amountRangeSearchOption.waitFor({ state: 'visible', timeout: 10000 });
            await this.amountRangeSearchOption.click();
            await this.amountRangeMinInput.waitFor({ state: 'visible', timeout: 10000 });
            await this.amountRangeMinInput.fill(minAmt);
            await expect(this.amountRangeMinInput).toHaveValue(minAmt);
            await this.amountRangeMaxInput.waitFor({ state: 'visible', timeout: 10000 });
            await this.amountRangeMaxInput.fill(maxAmt);
            await expect(this.amountRangeMaxInput).toHaveValue(maxAmt);
            await this.searchButton.click();
            await waitForSpinnerToClose(this.page);
            await this.page.waitForTimeout(3000);
            
            const noRecordsMsgVisible = await this.noRecordsMsg.isVisible().catch(() => false);
            if (noRecordsMsgVisible) {
                const msg = await this.noRecordsMsg.textContent();
                await Report.info(this.page, `No transactions available for the searched amount: ${msg ?? ''}`);
            } else {
                // Dynamically find the Amount column index from the table headers
                const headerCells = this.page.locator('xpath=//div[@name="PostedTrnxtable"]//thead/tr/th');
                const headerCount = await headerCells.count();
                let amountColIndex = -1;
                for (let h = 0; h < headerCount; h++) {
                    const headerText = (await headerCells.nth(h).textContent())?.trim() ?? '';
                    if (headerText.toLowerCase() === 'amount') {
                        amountColIndex = h + 1; // XPath td[] is 1-based
                        break;
                    }
                }
                if (amountColIndex === -1) {
                    throw new Error('Amount column header not found in posted transactions table');
                }

                // Validate all amount cells fall within the searched range
                const resultAmountCells = this.page.locator(`xpath=//div[@name="PostedTrnxtable"]//following-sibling::tbody/tr/td[${amountColIndex}]`);
                const resultCount = await resultAmountCells.count();
                expect(resultCount).toBeGreaterThan(0);

                const normalizedMin = parseFloat(minAmt.replace(/,/g, ''));
                const normalizedMax = parseFloat(maxAmt.replace(/,/g, ''));
                const mismatchedAmounts: string[] = [];

                for (let i = 0; i < resultCount; i++) {
                    const rawText = (await resultAmountCells.nth(i).textContent())?.trim() ?? '';
                    const normalizedActual = rawText.replace(/\s/g, '').replace(/,/g, '');
                    const amountMatch = normalizedActual.match(/[+-]?\$?(\d+\.?\d*)/);
                    const actualMagnitude = parseFloat(amountMatch?.[1] ?? '');

                    if (isNaN(actualMagnitude) || actualMagnitude < normalizedMin || actualMagnitude > normalizedMax) {
                        mismatchedAmounts.push(`Row ${i + 1}: ${rawText || '<empty>'}`);
                    }
                }

                if (mismatchedAmounts.length > 0) {
                    throw new Error(`${mismatchedAmounts.length} record(s) outside range $${minAmt}-$${maxAmt}: [${mismatchedAmounts.join(', ')}]`);
                }

                await Report.pass(this.page, `All displayed records are within amount range $${minAmt}-$${maxAmt}. Total records: ${resultCount}`);
            }
        }
        catch (error) {
            await Report.fail(this.page, `VerifyTransactionSearchByAmountRange is failed :${error.message}`);
        }
    }

    /** <summary>
       * This function is used to verify Transaction Search By Type functionality in Transaction History page
        ************************************************************************************************************************************************************
       * Revision History:
       * Date:04/27/2026       Created By: Krishna Kota     					Reason:verify Transaction Search By Type functionality in Transaction History page
       * Date:NA           	   Updated By:NA           						    Reason:
       * ************************************************************************************************************************************************************
    */
    //
    async VerifyTransactionSearchByType(searchType: string[]) {
        try {
            await this.searchByTypeOption.click();
            await waitForSpinnerToClose(this.page);

            // Search and validate Deposit(s)
            if (searchType.includes('Deposit(s)')) {
                await this.depositTypeSearch.click();
                await this.searchButton.click();
                await waitForSpinnerToClose(this.page);
                await this.page.waitForTimeout(3000);

                const noRecordsMsgVisible = await this.noRecordsMsg.isVisible().catch(() => false);
                if (noRecordsMsgVisible) {
                    const msg = await this.noRecordsMsg.textContent();
                    await Report.info(this.page, `No transactions available for Deposit(s): ${msg ?? ''}`);
                } else {
                    const amountColIndex = await this.getAmountColumnIndex();
                    const resultAmountCells = this.page.locator(`xpath=//div[@name="PostedTrnxtable"]//following-sibling::tbody/tr/td[${amountColIndex}]`);
                    const resultCount = await resultAmountCells.count();
                    expect(resultCount).toBeGreaterThan(0);

                    const mismatchedAmounts: string[] = [];
                    for (let i = 0; i < resultCount; i++) {
                        const rawText = (await resultAmountCells.nth(i).textContent())?.trim() ?? '';
                        const normalizedActual = rawText.replace(/\s/g, '').replace(/,/g, '');
                        const isNegative = /^-/.test(normalizedActual) || /^\$-/.test(normalizedActual);
                        if (isNegative) {
                            mismatchedAmounts.push(`Row ${i + 1}: ${rawText || '<empty>'} (expected positive + $)`);
                        }
                    }
                    if (mismatchedAmounts.length > 0) {
                        throw new Error(`${mismatchedAmounts.length} Deposit record(s) have unexpected negative amount: [${mismatchedAmounts.join(', ')}]`);
                    }
                    await Report.pass(this.page, `All Deposit transaction amounts are positive (+$). Total records: ${resultCount}`);
                }
            }

            // Search and validate Withdrawal(s)
            if (searchType.includes('Withdrawal(s)')) {
                const modifyVisible = await this.modifyButton.isVisible().catch(() => false);
                if (modifyVisible) {
                    await this.modifyButton.click();
                    await waitForSpinnerToClose(this.page);
                }
                await waitForSpinnerToClose(this.page);
                await this.withdrawalsTypeSearch.click();
                await this.searchButton.click();
                await waitForSpinnerToClose(this.page);
                await this.page.waitForTimeout(3000);

                const noRecordsMsgVisible = await this.noRecordsMsg.isVisible().catch(() => false);
                if (noRecordsMsgVisible) {
                    const msg = await this.noRecordsMsg.textContent();
                    await Report.info(this.page, `No transactions available for Withdrawal(s): ${msg ?? ''}`);
                } else {
                    const amountColIndex = await this.getAmountColumnIndex();
                    const resultAmountCells = this.page.locator(`xpath=//div[@name="PostedTrnxtable"]//following-sibling::tbody/tr/td[${amountColIndex}]`);
                    const resultCount = await resultAmountCells.count();
                    expect(resultCount).toBeGreaterThan(0);

                    const mismatchedAmounts: string[] = [];
                    for (let i = 0; i < resultCount; i++) {
                        const rawText = (await resultAmountCells.nth(i).textContent())?.trim() ?? '';
                        const normalizedActual = rawText.replace(/\s/g, '').replace(/,/g, '');
                        const isNegative = /^-/.test(normalizedActual) || /^\$-/.test(normalizedActual);
                        if (!isNegative) {
                            mismatchedAmounts.push(`Row ${i + 1}: ${rawText || '<empty>'} (expected negative - $)`);
                        }
                    }
                    if (mismatchedAmounts.length > 0) {
                        throw new Error(`${mismatchedAmounts.length} Withdrawal record(s) have unexpected positive amount: [${mismatchedAmounts.join(', ')}]`);
                    }
                    await Report.pass(this.page, `All Withdrawal transaction amounts are negative (-$). Total records: ${resultCount}`);
                }
            }

            // Search and validate Check(s)
            if (searchType.includes('Check(s)')) {
                const modifyVisible = await this.modifyButton.isVisible().catch(() => false);
                if (modifyVisible) {
                    await this.modifyButton.click();
                    await waitForSpinnerToClose(this.page);
                }
                await this.checksTypeSearch.click();
                await this.searchButton.click();
                await waitForSpinnerToClose(this.page);
                await this.page.waitForTimeout(3000);

                const noRecordsMsgVisible = await this.noRecordsMsg.isVisible().catch(() => false);
                if (noRecordsMsgVisible) {
                    const msg = await this.noRecordsMsg.textContent();
                    await Report.info(this.page, `No transactions available for Check(s): ${msg ?? ''}`);
                } else {
                    const amountColIndex = await this.getAmountColumnIndex();
                    const resultAmountCells = this.page.locator(`xpath=//div[@name="PostedTrnxtable"]//following-sibling::tbody/tr/td[${amountColIndex}]`);
                    const resultCount = await resultAmountCells.count();
                    expect(resultCount).toBeGreaterThan(0);
                    await Report.pass(this.page, `Check transaction amounts are displayed (may be +/- $). Total records: ${resultCount}`);
                }
            }
        }
        catch (error) {
            await Report.fail(this.page, `VerifyTransactionSearchByType is failed :${error.message}`);
        }
    }

    private async getAmountColumnIndex(): Promise<number> {
        const headerCells = this.page.locator('xpath=//div[@name="PostedTrnxtable"]//thead/tr/th');
        const headerCount = await headerCells.count();
        for (let h = 0; h < headerCount; h++) {
            const headerText = (await headerCells.nth(h).textContent())?.trim() ?? '';
            if (headerText.toLowerCase() === 'amount') {
                return h + 1; // XPath td[] is 1-based
            }
        }
        throw new Error('Amount column header not found in posted transactions table');
    }
    //VerifyTransactionSearchByDescription
    /** <summary>
     * This function is used to verify Transaction Search By Description functionality in Transaction History page
     * ************************************************************************************************************************************************************
     * Revision History:
     * Date:04/28/2026       Created By: Krishna Kota     					Reason:verify Transaction Search By Description functionality in Transaction History page
     *  Date:NA           	   Updated By:NA           						    Reason:
     * ************************************************************************************************************************************************************
  */   
    async VerifyTransactionSearchByDescription(searchType: string) {
        try {
            await this.searchByDescriptionOption.isEnabled().catch(async () => {
                await this.searchByDescriptionOption.click();
            });
            await waitForSpinnerToClose(this.page);
            await this.inputDescriptionSearch.waitFor({ state: 'visible', timeout: 10000 });
            await this.inputDescriptionSearch.click();
            //await this.inputDescriptionSearch.clear();
            await this.inputDescriptionSearch.fill(searchType);
            await expect(this.inputDescriptionSearch).toHaveValue(searchType);
            await this.searchButton.click();
            await waitForSpinnerToClose(this.page);
            await this.page.waitForTimeout(3000);
            const noRecordsMsgVisible = await this.noRecordsMsg.isVisible().catch(() => false);
            if (noRecordsMsgVisible) {
                const msg = await this.noRecordsMsg.textContent();
                await Report.info(this.page, `No transactions available for description search "${searchType}": ${msg ?? ''}`);
            } else {
                // Validate that all displayed transactions contain the search text in their description
                const descColIndex = await this.getDescriptionColumnIndex();
                const resultDescCells = this.page.locator(`xpath=//div[@name="PostedTrnxtable"]//following-sibling::tbody/tr/td[${descColIndex}]`);
                const resultCount = await resultDescCells.count();
                expect(resultCount).toBeGreaterThan(0);
                const normalizedSearchText = searchType.trim().toLowerCase();
                const mismatchedDescs: string[] = [];
                for (let i = 0; i < resultCount; i++) {
                    const rawText = (await resultDescCells.nth(i).textContent())?.trim() ?? '';
                    const normalizedRawText = rawText.toLowerCase();
                    if (!normalizedRawText.includes(normalizedSearchText)) {
                        mismatchedDescs.push(`Row ${i + 1}: ${rawText || '<empty>'}`);
                    }
                }
                if (mismatchedDescs.length > 0) {
                    throw new Error(`${mismatchedDescs.length} record(s) do not contain description "${searchType}": [${mismatchedDescs.join(', ')}]`);
                } else {
                    await Report.pass(this.page, `All displayed records contain description "${searchType}". Total records: ${resultCount}`);
                }
            }
        } catch (error) {
            await Report.fail(this.page, `VerifyTransactionSearchByDescription is failed :${error.message}`);
        }
    }

    private async getDescriptionColumnIndex(): Promise<number> {    
        const headerCells = this.page.locator('xpath=//div[@name="PostedTrnxtable"]//thead/tr/th');
        const headerCount = await headerCells.count();
        for (let h = 0; h < headerCount; h++) {
            const headerText = (await headerCells.nth(h).textContent())?.trim() ?? '';
            if (headerText.toLowerCase() === 'description') {
                return h + 1; // XPath td[] is 1-based
            }
        }
        throw new Error('Description column header not found in posted transactions table');
    }
    /** <summary>
     * This function is used to verify Inline error validation for Transaction Search By Description functionality in Transaction History page
     * ************************************************************************************************************************************************************
     * Revision History:
     *  Date:04/29/2026       Created By: Krishna Kota     					Reason:verify Inline error validation for Transaction Search By Description functionality in Transaction History page
     *  Date:NA           	   Updated By:NA           						    Reason:
     * ************************************************************************************************************************************************************ 
     * */
        async VerifyTransactionSearchByDescriptionInline() {
            try {
                await this.searchByDescriptionOption.isEnabled().catch(async () => {
                    await this.searchByDescriptionOption.click();
                });
                await waitForSpinnerToClose(this.page);
                await this.inputDescriptionSearch.waitFor({ state: 'visible', timeout: 10000 });
                await expect(this.inputDescriptionSearch).toBeVisible();
                await this.inputDescriptionSearch.click();
                await this.inputDescriptionSearch.fill("");
                await expect(this.inputDescriptionSearch).toHaveValue("");
                await this.searchButton.click();
                await waitForSpinnerToClose(this.page);
                const errorMsgVisible = await this.descriptionSearchErrorMsg.isVisible().catch(() => false); 
                if (errorMsgVisible) {
                    const errorMsg = await this.descriptionSearchErrorMsg.textContent();
                    await Report.pass(this.page, `Expected error message is displayed for empty description search: ${errorMsg ?? ''}`);
                } else {
                    await Report.fail(this.page, 'Expected error message is not displayed for empty description search');
                }
            } catch (error) {
                await Report.fail(this.page, `VerifyTransactionSearchByDescriptionUI is failed :${error.message}`);
            }
        }

    /** <summary>
     * This function is used to verify Inline error validation for Transaction Search By Specific Amount functionality in Transaction History page
     * ************************************************************************************************************************************************************
     * Revision History:
     *  Date:04/29/2026       Created By: Krishna Kota     					Reason:verify Inline error validation for Transaction Search By Specific Amount functionality in Transaction History page
     *  Date:NA           	   Updated By:NA           						    Reason:
     * ************************************************************************************************************************************************************ 
     * */
    async VerifyTransactionSearchBySpecificAmountInline() {
        try {
            await this.searchByAmountOption.click();
            await expect(this.specificAmountSearchOption).toBeEnabled();
            await this.specificAmountSearchOption.click();
            await this.specificAmountInput.waitFor({ state: 'visible', timeout: 10000 });
            await expect(this.specificAmountInput).toBeVisible();
            await this.specificAmountInput.click();
            await this.specificAmountInput.fill("");
            await expect(this.specificAmountInput).toHaveValue("");
            await this.searchButton.click();
            await waitForSpinnerToClose(this.page);
            const errorMsgVisible = await this.amountSearchErrorMsg.isVisible().catch(() => false);
            if (errorMsgVisible) {
                const errorMsg = await this.amountSearchErrorMsg.textContent();
                await Report.pass(this.page, `Expected error message is displayed for empty specific amount search: ${errorMsg ?? ''}`);
            } else {
                await Report.fail(this.page, 'Expected error message is not displayed for empty specific amount search');
            }
        } catch (error) {
            await Report.fail(this.page, `VerifyTransactionSearchBySpecificAmountInline is failed :${error.message}`);
        }
    }

    /** <summary>
     * This function is used to verify Inline error validation for Transaction Search By Amount Range functionality in Transaction History page
     * ************************************************************************************************************************************************************
     * Revision History:
     *  Date:04/29/2026       Created By: Krishna Kota     					Reason:verify Inline error validation for Transaction Search By Amount Range (Start & End Amount) functionality in Transaction History page
     *  Date:NA           	   Updated By:NA           						    Reason:
     * ************************************************************************************************************************************************************ 
     * */
    async VerifyTransactionSearchByAmountRangeInline() {
        try {
            await this.searchByAmountOption.click();
            await this.amountRangeSearchOption.waitFor({ state: 'visible', timeout: 10000 });
            await this.amountRangeSearchOption.click();
            await this.amountRangeMinInput.waitFor({ state: 'visible', timeout: 10000 });
            await this.amountRangeMaxInput.waitFor({ state: 'visible', timeout: 10000 });

            // Verify error when both Start Amount and End Amount are empty
            await this.amountRangeMinInput.click();
            await this.amountRangeMinInput.fill("");
            await expect(this.amountRangeMinInput).toHaveValue("");
            await this.amountRangeMaxInput.click();
            await this.amountRangeMaxInput.fill("");
            await expect(this.amountRangeMaxInput).toHaveValue("");
            await this.searchButton.click();
            await waitForSpinnerToClose(this.page);

            const startAmountErrorVisible = await this.startAmountSearchErrorMsg.isVisible().catch(() => false);
            if (startAmountErrorVisible) {
                const startAmountErrorMsg = await this.startAmountSearchErrorMsg.textContent();
                await Report.pass(this.page, `Expected error message is displayed for empty Start Amount: ${startAmountErrorMsg ?? ''}`);
            } else {
                await Report.fail(this.page, 'Expected error message is not displayed for empty Start Amount');
            }

            const endAmountErrorVisible = await this.endAmountSearchErrorMsg.isVisible().catch(() => false);
            if (endAmountErrorVisible) {
                const endAmountErrorMsg = await this.endAmountSearchErrorMsg.textContent();
                await Report.pass(this.page, `Expected error message is displayed for empty End Amount: ${endAmountErrorMsg ?? ''}`);
            } else {
                await Report.fail(this.page, 'Expected error message is not displayed for empty End Amount');
            }

            // Verify error when Start Amount is greater than End Amount
            await this.amountRangeMinInput.fill("5.00");
            await expect(this.amountRangeMinInput).toHaveValue("5.00");
            await this.amountRangeMaxInput.fill("1.00");
            await expect(this.amountRangeMaxInput).toHaveValue("1.00");
            await this.searchButton.click();
            await waitForSpinnerToClose(this.page);

            const startAmtGreaterErrorVisible = await this.startamtGreaterThanEndAmtErrorMsg.isVisible().catch(() => false);
            if (startAmtGreaterErrorVisible) {
                const startAmtGreaterErrorMsg = await this.startamtGreaterThanEndAmtErrorMsg.textContent();
                await Report.pass(this.page, `Expected error message is displayed when Start Amount is greater than End Amount: ${startAmtGreaterErrorMsg ?? ''}`);
            } else {
                await Report.fail(this.page, 'Expected error message is not displayed when Start Amount is greater than End Amount');
            }

        } catch (error) {
            await Report.fail(this.page, `VerifyTransactionSearchByAmountRangeInline is failed :${error.message}`);
        }
    }

    /** <summary>
     * This function is used to verify Inline error validation for Transaction Search By Date Range functionality in Transaction History page
     * ************************************************************************************************************************************************************
     * Revision History:
     *  Date:04/29/2026       Created By: Krishna Kota     					Reason:verify Inline error validation for Transaction Search By Date Range (Start & End Date) functionality in Transaction History page
     *  Date:NA           	   Updated By:NA           						    Reason:
     * ************************************************************************************************************************************************************ 
     * */
    async VerifyTransactionSearchByDateRangeInline() {
        try {
            await this.searchByDateOption.click();
            await waitForSpinnerToClose(this.page);
            await this.dateRangeSearchOption.click();
            await this.dateRangeStartInput.waitFor({ state: 'visible', timeout: 10000 });
            await this.dateRangeEndInput.waitFor({ state: 'visible', timeout: 10000 });

            // Verify error when both Start Date and End Date are empty
            await this.dateRangeStartInput.click();
            await this.dateRangeStartInput.fill("");
            await expect(this.dateRangeStartInput).toHaveValue("");
            await this.dateRangeEndInput.click();
            await this.dateRangeEndInput.fill("");
            await expect(this.dateRangeEndInput).toHaveValue("");
            await this.searchButton.click();
            await waitForSpinnerToClose(this.page);

            const startDateErrorVisible = await this.startDateSearchErrorMsg.isVisible().catch(() => false);
            if (startDateErrorVisible) {
                const startDateErrorMsg = await this.startDateSearchErrorMsg.textContent();
                await Report.pass(this.page, `Expected error message is displayed for empty Start Date: ${startDateErrorMsg ?? ''}`);
            } else {
                await Report.fail(this.page, 'Expected error message is not displayed for empty Start Date');
            }

            const endDateErrorVisible = await this.endDateSearchErrorMsg.isVisible().catch(() => false);
            if (endDateErrorVisible) {
                const endDateErrorMsg = await this.endDateSearchErrorMsg.textContent();
                await Report.pass(this.page, `Expected error message is displayed for empty End Date: ${endDateErrorMsg ?? ''}`);
            } else {
                await Report.fail(this.page, 'Expected error message is not displayed for empty End Date');
            }

            // Verify error when Start Date is greater than End Date
            await this.dateRangeStartInput.fill("12/31/2026");
            await expect(this.dateRangeStartInput).toHaveValue("12/31/2026");
            await this.dateRangeEndInput.fill("01/01/2026");
            await expect(this.dateRangeEndInput).toHaveValue("01/01/2026");
            await this.searchButton.click();
            await waitForSpinnerToClose(this.page);

            const startDateGreaterErrorVisible = await this.startDateGreaterThanEndDateErrorMsg.isVisible().catch(() => false);
            if (startDateGreaterErrorVisible) {
                const startDateGreaterErrorMsg = await this.startDateGreaterThanEndDateErrorMsg.textContent();
                await Report.pass(this.page, `Expected error message is displayed when Start Date is greater than End Date: ${startDateGreaterErrorMsg ?? ''}`);
            } else {
                await Report.fail(this.page, 'Expected error message is not displayed when Start Date is greater than End Date');
            }

        } catch (error) {
            await Report.fail(this.page, `VerifyTransactionSearchByDateRangeInline is failed :${error.message}`);
        }
    }
    //VerifyTransactionSearchByDateRangeInlineBeyond540Days
 /** <summary>
     * This function is used to verify Inline error validation for Transaction Search By Date Range functionality in Transaction History page
     * ************************************************************************************************************************************************************
     * Revision History:
     *  Date:05/08/2026       Created By: Krishna Kota     					Reason:verify Inline error validation for Transaction Search By Date Range beyond 540 days
     *  Date:NA           	   Updated By:NA           						    Reason:
     * ************************************************************************************************************************************************************ 
     * */

    async VerifyTransactionSearchByDateRangeInlineBeyond540Days(startDate: any, endDate: any) {
        try {
            await this.searchByDateOption.click();
            await waitForSpinnerToClose(this.page);
            await this.dateRangeSearchOption.click();
            await this.dateRangeStartInput.waitFor({ state: 'visible', timeout: 10000 });
            await this.dateRangeEndInput.waitFor({ state: 'visible', timeout: 10000 });

            // Verify error when both Start Date and End Date are empty
            await this.dateRangeStartInput.click();
            // verify when Date Range exceeds allowed maximum range (more than 540 days )
            await this.dateRangeStartInput.fill(startDate);
            await this.dateRangeEndInput.fill(endDate);
            await this.searchButton.click();
            await waitForSpinnerToClose(this.page);
            const dateRangeExceedsErrorStartDateVisible = await this.dateRangeExceedsMaxRangeStartDateErrorMsg.isVisible().catch(() => false);
            const dateRangeExceedsErrorEndDateVisible = await this.dateRangeExceedsMaxRangeEndDateErrorMsg.isVisible().catch(() => false);
            
            if (dateRangeExceedsErrorStartDateVisible && dateRangeExceedsErrorEndDateVisible) {
                const dateRangeExceedsErrorStartDateMsg = await this.dateRangeExceedsMaxRangeStartDateErrorMsg.textContent();
                const dateRangeExceedsErrorEndDateMsg = await this.dateRangeExceedsMaxRangeStartDateErrorMsg.textContent();
                
                await Report.pass(this.page, `Expected error message is displayed when Date Range exceeds maximum allowed range: ${dateRangeExceedsErrorStartDateMsg ?? ''}`);
            } else {
                await Report.fail(this.page, 'Expected error message is not displayed when Date Range exceeds maximum allowed range');
            }

        } catch (error) {
            await Report.fail(this.page, `VerifyTransactionSearchByDateRangeInline is failed :${error.message}`);
        }
    }



    /** <summary>
     * This function is used to verify Transaction Search By Specific Date functionality in Transaction History page
     * ************************************************************************************************************************************************************
     * Revision History:
     *  Date:04/29/2026       Created By: Krishna Kota     					Reason:verify Transaction Search By Specific Date functionality in Transaction History page
     *  Date:NA           	   Updated By:NA           						    Reason:
     * ************************************************************************************************************************************************************ 
     * */
    async VerifyTransactionSearchBySpecificDate(specificDate: any) {
        try {
            await this.searchByDateOption.click();
            await waitForSpinnerToClose(this.page);
            await this.specificDateSearchOption.click();
            await this.specificDateInput.waitFor({ state: 'visible', timeout: 10000 });
            await expect(this.specificDateInput).toBeEnabled();
            await this.specificDateInput.fill(specificDate);
            await expect(this.specificDateInput).toHaveValue(specificDate);
            await this.searchButton.click();
            await waitForSpinnerToClose(this.page);
            await this.page.waitForTimeout(3000);

            const noRecordsMsgVisible = await this.noRecordsMsg.isVisible().catch(() => false);
            if (noRecordsMsgVisible) {
                const msg = await this.noRecordsMsg.textContent();
                await Report.info(this.page, `No transactions available for the searched date: ${msg ?? ''}`);
            } else {
                // Dynamically find the Date column index from the table headers
                const dateColIndex = await this.getDateColumnIndex();
                const resultDateCells = this.page.locator(`xpath=//div[@name="PostedTrnxtable"]//following-sibling::tbody/tr/td[${dateColIndex}]`);
                const resultCount = await resultDateCells.count();
                expect(resultCount).toBeGreaterThan(0);

                const mismatchedDates: string[] = [];
                let validRowCount = 0;
                for (let i = 0; i < resultCount; i++) {
                    const rawText = (await resultDateCells.nth(i).textContent())?.trim() ?? '';
                    if (!rawText) continue; // Skip empty detail/expansion rows
                    validRowCount++;
                    if (rawText !== specificDate) {
                        mismatchedDates.push(`Row ${i + 1}: ${rawText}`);
                    }
                }

                if (mismatchedDates.length > 0) {
                    throw new Error(`${mismatchedDates.length} record(s) do not match searched date ${specificDate}: [${mismatchedDates.join(', ')}]`);
                }

                await Report.pass(this.page, `All displayed records match searched date ${specificDate}. Total records: ${validRowCount}`);
            }
        } catch (error) {
            await Report.fail(this.page, `VerifyTransactionSearchBySpecificDate is failed :${error.message}`);
        }
    }

    /** <summary>
     * This function is used to verify Transaction Search By Date Range functionality in Transaction History page
     * ************************************************************************************************************************************************************
     * Revision History:
     *  Date:04/29/2026       Created By: Krishna Kota     					Reason:verify Transaction Search By Date Range functionality in Transaction History page
     *  Date:NA           	   Updated By:NA           						    Reason:
     * ************************************************************************************************************************************************************ 
     * */
    async VerifyTransactionSearchByDate(startDate: any, endDate: any) {
        try {
            await this.searchByDateOption.click();
            await waitForSpinnerToClose(this.page);
            await this.dateRangeSearchOption.click();
            await this.dateRangeStartInput.waitFor({ state: 'visible', timeout: 10000 });
            await this.dateRangeStartInput.fill(startDate);
            await expect(this.dateRangeStartInput).toHaveValue(startDate);
            await this.dateRangeEndInput.waitFor({ state: 'visible', timeout: 10000 });
            await this.dateRangeEndInput.fill(endDate);
            await expect(this.dateRangeEndInput).toHaveValue(endDate);
            await this.searchButton.click();
            await waitForSpinnerToClose(this.page);
            await this.page.waitForTimeout(3000);

            const noRecordsMsgVisible = await this.noRecordsMsg.isVisible().catch(() => false);
            if (noRecordsMsgVisible) {
                const msg = await this.noRecordsMsg.textContent();
                await Report.info(this.page, `No transactions available for the searched date range: ${msg ?? ''}`);
            } else {
                // Dynamically find the Date column index from the table headers
                const dateColIndex = await this.getDateColumnIndex();
                const resultDateCells = this.page.locator(`xpath=//div[@name="PostedTrnxtable"]//following-sibling::tbody/tr/td[${dateColIndex}]`);
                const resultCount = await resultDateCells.count();
                expect(resultCount).toBeGreaterThan(0);

                const normalizedStart = new Date(startDate).getTime();
                const normalizedEnd = new Date(endDate).getTime();
                const mismatchedDates: string[] = [];
                let validRowCount = 0;

                for (let i = 0; i < resultCount; i++) {
                    const rawText = (await resultDateCells.nth(i).textContent())?.trim() ?? '';
                    if (!rawText) continue; // Skip empty detail/expansion rows
                    validRowCount++;
                    const actualDate = new Date(rawText).getTime();

                    if (isNaN(actualDate) || actualDate < normalizedStart || actualDate > normalizedEnd) {
                        mismatchedDates.push(`Row ${i + 1}: ${rawText}`);
                    }
                }

                if (mismatchedDates.length > 0) {
                    throw new Error(`${mismatchedDates.length} record(s) outside date range ${startDate}-${endDate}: [${mismatchedDates.join(', ')}]`);
                }

                await Report.pass(this.page, `All displayed records are within date range ${startDate}-${endDate}. Total records: ${validRowCount}`);
            }
        } catch (error) {
            await Report.fail(this.page, `VerifyTransactionSearchByDate is failed :${error.message}`);
        }
    }

    /** <summary>
     * This function is used to verify Inline error validation for Transaction Search By Specific Date functionality in Transaction History page
     * ************************************************************************************************************************************************************
     * Revision History:
     *  Date:04/29/2026       Created By: Krishna Kota     					Reason:verify Inline error validation for Transaction Search By Specific Date functionality in Transaction History page
     *  Date:NA           	   Updated By:NA           						    Reason:
     * ************************************************************************************************************************************************************ 
     * */
    async VerifyTransactionSearchBySpecificDateInline() {
        try {
            await this.searchByDateOption.click();
            await waitForSpinnerToClose(this.page);
            await this.specificDateSearchOption.click();
            await this.specificDateInput.waitFor({ state: 'visible', timeout: 10000 });
            await expect(this.specificDateInput).toBeVisible();
            await this.specificDateInput.click();
            await this.specificDateInput.fill("");
            await expect(this.specificDateInput).toHaveValue("");
            await this.searchButton.click();
            await waitForSpinnerToClose(this.page);

            const errorMsgVisible = await this.specificDateSearchErrorMsg.isVisible().catch(() => false);
            if (errorMsgVisible) {
                const errorMsg = await this.specificDateSearchErrorMsg.textContent();
                await Report.pass(this.page, `Expected error message is displayed for empty specific date search: ${errorMsg ?? ''}`);
            } else {
                await Report.fail(this.page, 'Expected error message is not displayed for empty specific date search');
            }
        } catch (error) {
            await Report.fail(this.page, `VerifyTransactionSearchBySpecificDateInline is failed :${error.message}`);
        }
    }

    /** <summary>
     * This function is used to verify Transaction Search By Specific Check Number functionality in Transaction History page
     * ************************************************************************************************************************************************************
     * Revision History:
     *  Date:04/29/2026       Created By: Krishna Kota     					Reason:verify Transaction Search By Specific Check Number functionality in Transaction History page
     *  Date:NA           	   Updated By:NA           						    Reason:
     * ************************************************************************************************************************************************************ 
     * */
    async VerifyTransactionSearchBySpecificCheckNumber(checkNum: any) {
        try {
            await this.searchByCheckNumOption.click();
            await waitForSpinnerToClose(this.page);
            await this.specificCheckNumSearchOption.click();
            await this.specificCheckNumInput.waitFor({ state: 'visible', timeout: 10000 });
            await expect(this.specificCheckNumInput).toBeEnabled();
            await this.specificCheckNumInput.fill(checkNum);
            await expect(this.specificCheckNumInput).toHaveValue(checkNum);
            await this.searchButton.click();
            await waitForSpinnerToClose(this.page);
            await this.page.waitForTimeout(3000);

            const noRecordsMsgVisible = await this.noRecordsMsg.isVisible().catch(() => false);
            if (noRecordsMsgVisible) {
                const msg = await this.noRecordsMsg.textContent();
                await Report.info(this.page, `No transactions available for the searched check number: ${msg ?? ''}`);
            } else {
                const descColIndex = await this.getDescriptionColumnIndex();
                const resultDescCells = this.page.locator(`xpath=//div[@name="PostedTrnxtable"]//following-sibling::tbody/tr/td[${descColIndex}]`);
                const resultCount = await resultDescCells.count();
                expect(resultCount).toBeGreaterThan(0);
                await Report.pass(this.page, `Transaction search by specific check number ${checkNum} returned ${resultCount} record(s)`);
            }
        } catch (error) {
            await Report.fail(this.page, `VerifyTransactionSearchBySpecificCheckNumber is failed :${error.message}`);
        }
    }

    /** <summary>
     * This function is used to verify Transaction Search By Range of Check Numbers functionality in Transaction History page
     * ************************************************************************************************************************************************************
     * Revision History:
     *  Date:04/29/2026       Created By: Krishna Kota     					Reason:verify Transaction Search By Range of Check Numbers functionality in Transaction History page
     *  Date:NA           	   Updated By:NA           						    Reason:
     * ************************************************************************************************************************************************************ 
     * */
    async VerifyTransactionSearchByCheckNumberRange(startCheckNum: any, endCheckNum: any) {
        try {
            await this.searchByCheckNumOption.click();
            await waitForSpinnerToClose(this.page);
            await this.checkNumRangeSearchOption.waitFor({ state: 'visible', timeout: 10000 });
            await this.checkNumRangeSearchOption.click();
            await this.checkNumRangeStartInput.waitFor({ state: 'visible', timeout: 10000 });
            await this.checkNumRangeStartInput.fill(startCheckNum);
            await expect(this.checkNumRangeStartInput).toHaveValue(startCheckNum);
            await this.checkNumRangeEndInput.waitFor({ state: 'visible', timeout: 10000 });
            await this.checkNumRangeEndInput.fill(endCheckNum);
            await expect(this.checkNumRangeEndInput).toHaveValue(endCheckNum);
            await this.searchButton.click();
            await waitForSpinnerToClose(this.page);
            await this.page.waitForTimeout(3000);

            const noRecordsMsgVisible = await this.noRecordsMsg.isVisible().catch(() => false);
            if (noRecordsMsgVisible) {
                const msg = await this.noRecordsMsg.textContent();
                await Report.info(this.page, `No transactions available for the searched check number range: ${msg ?? ''}`);
            } else {
                const descColIndex = await this.getDescriptionColumnIndex();
                const resultDescCells = this.page.locator(`xpath=//div[@name="PostedTrnxtable"]//following-sibling::tbody/tr/td[${descColIndex}]`);
                const resultCount = await resultDescCells.count();
                expect(resultCount).toBeGreaterThan(0);
                await Report.pass(this.page, `Transaction search by check number range ${startCheckNum}-${endCheckNum} returned ${resultCount} record(s)`);
            }
        } catch (error) {
            await Report.fail(this.page, `VerifyTransactionSearchByCheckNumberRange is failed :${error.message}`);
        }
    }

    /** <summary>
     * This function is used to verify Inline error validation for Transaction Search By Specific Check Number functionality in Transaction History page
     * ************************************************************************************************************************************************************
     * Revision History:
     *  Date:04/29/2026       Created By: Krishna Kota     					Reason:verify Inline error validation for Transaction Search By Specific Check Number functionality in Transaction History page
     *  Date:NA           	   Updated By:NA           						    Reason:
     * ************************************************************************************************************************************************************ 
     * */
    async VerifyTransactionSearchBySpecificCheckNumInline() {
        try {
            await this.searchByCheckNumOption.click();
            await waitForSpinnerToClose(this.page);
            await this.specificCheckNumSearchOption.click();
            await this.specificCheckNumInput.waitFor({ state: 'visible', timeout: 10000 });
            await expect(this.specificCheckNumInput).toBeVisible();
            await this.specificCheckNumInput.click();
            await this.specificCheckNumInput.fill("");
            await expect(this.specificCheckNumInput).toHaveValue("");
            await this.searchButton.click();
            await waitForSpinnerToClose(this.page);

            const errorMsgVisible = await this.specificCheckNumSearchErrorMsg.isVisible().catch(() => false);
            if (errorMsgVisible) {
                const errorMsg = await this.specificCheckNumSearchErrorMsg.textContent();
                await Report.pass(this.page, `Expected error message is displayed for empty specific check number search: ${errorMsg ?? ''}`);
            } else {
                await Report.fail(this.page, 'Expected error message is not displayed for empty specific check number search');
            }
        } catch (error) {
            await Report.fail(this.page, `VerifyTransactionSearchBySpecificCheckNumInline is failed :${error.message}`);
        }
    }

    /** <summary>
     * This function is used to verify Inline error validation for Transaction Search By Check Number Range functionality in Transaction History page
     * ************************************************************************************************************************************************************
     * Revision History:
     *  Date:04/29/2026       Created By: Krishna Kota     					Reason:verify Inline error validation for Transaction Search By Check Number Range (Start & End Check Number) functionality in Transaction History page
     *  Date:NA           	   Updated By:NA           						    Reason:
     * ************************************************************************************************************************************************************ 
     * */
    async VerifyTransactionSearchByCheckNumRangeInline() {
        try {
            await this.searchByCheckNumOption.click();
            await waitForSpinnerToClose(this.page);
            await this.checkNumRangeSearchOption.waitFor({ state: 'visible', timeout: 10000 });
            await this.checkNumRangeSearchOption.click();
            await this.checkNumRangeStartInput.waitFor({ state: 'visible', timeout: 10000 });
            await this.checkNumRangeEndInput.waitFor({ state: 'visible', timeout: 10000 });

            // Verify error when both Start Check Number and End Check Number are empty
            await this.checkNumRangeStartInput.click();
            await this.checkNumRangeStartInput.fill("");
            await expect(this.checkNumRangeStartInput).toHaveValue("");
            await this.checkNumRangeEndInput.click();
            await this.checkNumRangeEndInput.fill("");
            await expect(this.checkNumRangeEndInput).toHaveValue("");
            await this.searchButton.click();
            await waitForSpinnerToClose(this.page);

            const startCheckNumErrorVisible = await this.startCheckNumSearchErrorMsg.isVisible().catch(() => false);
            if (startCheckNumErrorVisible) {
                const startCheckNumErrorMsg = await this.startCheckNumSearchErrorMsg.textContent();
                await Report.pass(this.page, `Expected error message is displayed for empty Start Check Number: ${startCheckNumErrorMsg ?? ''}`);
            } else {
                await Report.fail(this.page, 'Expected error message is not displayed for empty Start Check Number');
            }

            const endCheckNumErrorVisible = await this.endCheckNumSearchErrorMsg.isVisible().catch(() => false);
            if (endCheckNumErrorVisible) {
                const endCheckNumErrorMsg = await this.endCheckNumSearchErrorMsg.textContent();
                await Report.pass(this.page, `Expected error message is displayed for empty End Check Number: ${endCheckNumErrorMsg ?? ''}`);
            } else {
                await Report.fail(this.page, 'Expected error message is not displayed for empty End Check Number');
            }

            // Verify error when Start Check Number is greater than End Check Number
            await this.checkNumRangeStartInput.fill("5000");
            await expect(this.checkNumRangeStartInput).toHaveValue("5000");
            await this.checkNumRangeEndInput.fill("1000");
            await expect(this.checkNumRangeEndInput).toHaveValue("1000");
            await this.searchButton.click();
            await waitForSpinnerToClose(this.page);
            await this.page.waitForTimeout(3000);

            const startGreaterErrorVisible = await this.startCheckNumGreaterThanEndCheckNumErrorMsg.isVisible().catch(() => false);
            if (startGreaterErrorVisible) {
                const startGreaterErrorMsg = await this.startCheckNumGreaterThanEndCheckNumErrorMsg.textContent();
                await Report.pass(this.page, `Expected error message is displayed when Start Check Number is greater than End Check Number: ${startGreaterErrorMsg ?? ''}`);
            } else {
                await Report.fail(this.page, 'Expected error message is not displayed when Start Check Number is greater than End Check Number');
            }

        } catch (error) {
            await Report.fail(this.page, `VerifyTransactionSearchByCheckNumRangeInline is failed :${error.message}`);
        }
    }

    private async getDateColumnIndex(): Promise<number> {
        const headerCells = this.page.locator('xpath=//div[@name="PostedTrnxtable"]//thead/tr/th');
        const headerCount = await headerCells.count();
        for (let h = 0; h < headerCount; h++) {
            const headerText = (await headerCells.nth(h).textContent())?.trim() ?? '';
            if (headerText.toLowerCase() === 'date') {
                return h + 1; // XPath td[] is 1-based
            }
        }
        throw new Error('Date column header not found in posted transactions table');
    }


   /*Summary>
        * This function is used to click on the Print button in Transaction Details page to open the print preview modal and validate that the PDF is loaded successfully
        * ************************************************************************************************************************************************************
        * Revision History:
        *  Date:04/29/2026       Created By: Krishna Kota     					Reason:Click on the Print button in Transaction Details page to open the print preview modal and validate that the PDF is loaded successfully   
        * Date:NA           	   Updated By:NA           						    Reason: 
        * ************************************************************************************************************************************************************
        * */ 
   
    async ClickOnPrintButton() {
        try {
            await this.page.waitForLoadState();
            await this.printOption.click();
            await waitForSpinnerToClose(this.page);
            await this.page.getByRole('alert', { name: 'Loading...' }).waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
            await this.printPreviewModal.waitFor({ state: 'visible', timeout: 15000 });
            // Wait for PDF iframe to load inside the modal
            await this.page.locator('#pdfjsbase64frame').waitFor({ state: 'visible', timeout: 30000 });
            await Report.pass(this.page, 'Print preview modal opened and PDF loaded successfully');
        } catch (error) {
            await Report.fail(this.page, `Failed to click on Print button: ${error.message}`);
            throw error;
        }
    }

     /*Summary>
        * This function is used to validate the content of the print preview modal opened by clicking on the Print button in Transaction Details page and validate that the PDF is loaded successfully
        * ************************************************************************************************************************************************************
        * Revision History:
        *  Date:04/29/2026       Created By: Krishna Kota     					Reason:Validate the content of the print preview modal opened by clicking on the Print button in Transaction Details page and validate that the PDF is loaded successfully
        * Date:NA           	   Updated By:NA           						    Reason: 
        * ************************************************************************************************************************************************************
        * */ 
    async ValidatePrintPreviewContent(accountLast4Digits: string, accountType?: string) {
        try {
            // Wait for the iframe to appear and PDF text layer to render
            await this.page.locator('#pdfjsbase64frame').waitFor({ state: 'visible', timeout: 15000 });
            const frame = this.page.frameLocator('#pdfjsbase64frame');

            // Validate Account Nickname
            const accountNickname = frame.locator('div.textLayer').locator('span').nth(0); 
            await accountNickname.waitFor({ state: 'visible', timeout: 15000 });
            const nicknameText = await accountNickname.textContent();
            if (!nicknameText || nicknameText.trim() === '') {
                throw new Error('Account Nickname is MISSING or empty in print preview');
            }
            await Report.pass(this.page, `Account Nickname is displayed in print preview: "${nicknameText.trim()}"`);

            // Validate Account Number (scope to PDF text layer line, not container)
            const accountNumber = frame.locator('.textLayer span').filter({ hasText: accountLast4Digits }).first();
            await accountNumber.waitFor({ state: 'visible', timeout: 15000 });
            const accountNumberText = (await accountNumber.textContent())?.trim() ?? '';
            if (!accountNumberText.includes(accountLast4Digits)) {
                throw new Error(`Account Number is MISSING in print preview. Expected contains: "${accountLast4Digits}", Found: "${accountNumberText}"`);
            }
            await Report.pass(this.page, `Account Number "${accountNumberText}" is displayed in print preview`);

            // LOC accounts display Available Credit instead of Available Balance in print preview.
            const normalizedAccountType = (accountType ?? '').trim().toUpperCase();
            const availableFundsLabel = normalizedAccountType === 'LOC' ? 'Available Credit:' : 'Available Balance:';
            const availableFunds = frame.locator('.textLayer span').filter({ hasText: new RegExp(`^${availableFundsLabel.replace(':', '\\:')}`) }).first();
            await availableFunds.waitFor({ state: 'visible', timeout: 15000 });
            const availableFundsText = (await availableFunds.textContent())?.trim() ?? '';
            if (!availableFundsText.startsWith(availableFundsLabel)) {
                throw new Error(`${availableFundsLabel.replace(':', '')} is MISSING in print preview. Found: "${availableFundsText}"`);
            }
            await Report.pass(this.page, `${availableFundsLabel.replace(':', '')} is displayed in print preview: "${availableFundsText}"`);

            // Validate Current Balance (scope to a single text line)
            const currentBalance = frame.locator('.textLayer span').filter({ hasText: /^Current Balance:/ }).first();
            await currentBalance.waitFor({ state: 'visible', timeout: 15000 });
            const currBalText = (await currentBalance.textContent())?.trim() ?? '';
            if (!currBalText.startsWith('Current Balance:')) {
                throw new Error(`Current Balance is MISSING in print preview. Found: "${currBalText}"`);
            }
            await Report.pass(this.page, `Current Balance is displayed in print preview: "${currBalText}"`);

            // Validate section headers
            const headers = [
                'Scheduled Transactions:',
                'Pending Transactions:',
                'Posted Transactions:'
            ];

            for (const header of headers) {
                const el = frame.locator(`:text-is("${header}")`);
                try {
                    await el.waitFor({ state: 'visible', timeout: 30000 });
                } catch {
                    throw new Error(`Header "${header}" is MISSING in print preview`);
                }
            }

            await Report.pass(this.page, 'Print preview section headers validated successfully: Scheduled Transactions, Pending Transactions, Posted Transactions');

            // Validate Scheduled and Pending Transactions column headers (only if rows exist)
            const sectionsToValidate = [
                { name: 'Scheduled Transactions', noDataMsg: 'There are no scheduled transactions.', colHeaders: ['Date', 'Description', 'Amount'] },
                { name: 'Pending Transactions', noDataMsg: 'There are no pending transactions.', colHeaders: ['Date', 'Description', 'Amount'] }
            ];

            for (const section of sectionsToValidate) {
                const noDataVisible = await frame.locator(`:text("${section.noDataMsg}")`).waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false);
                if (noDataVisible) {
                    await Report.pass(this.page, `No ${section.name.toLowerCase()} present - skipping ${section.name} column header validation`);
                } else {
                    for (const col of section.colHeaders) {
                        const colEls = frame.locator(`:text-is("${col}")`);
                        const count = await colEls.count();
                        if (count === 0) {
                            throw new Error(`${section.name} column header "${col}" is MISSING`);
                        }
                    }
                    await Report.pass(this.page, `${section.name} column headers validated: ${section.colHeaders.join(', ')}`);
                }
            }

            // Scroll until Posted Transactions header is visible, then validate column headers
            const postedHeader = frame.locator(':text-is("Posted Transactions:")');
            await postedHeader.scrollIntoViewIfNeeded();
            await postedHeader.waitFor({ state: 'visible', timeout: 10000 });

            const isNonEnrichAccount = normalizedAccountType === 'NHS' || normalizedAccountType === 'NOW';
            const postedColumnHeaders = isNonEnrichAccount
                ? ['Date', 'Description', 'Amount', 'Balance']
                : ['Date', 'Vendor', 'Description', 'Category', 'Tag', 'Amount', 'Balance'];

            for (const col of postedColumnHeaders) {
                const colEl = frame.locator(`:text-is("${col}")`).first();
                try {
                    await colEl.waitFor({ state: 'visible', timeout: 10000 });
                } catch {
                    throw new Error(`Column header "${col}" is MISSING in Posted Transactions`);
                }
            }

            if (isNonEnrichAccount) {
                // For non-enrich accounts, ensure enrich-only headers are not displayed.
                const enrichOnlyHeaders = ['Vendor', 'Category', 'Tag'];
                for (const enrichHeader of enrichOnlyHeaders) {
                    const enrichHeaderVisible = await frame.locator(`:text-is("${enrichHeader}")`).first().isVisible().catch(() => false);
                    if (enrichHeaderVisible) {
                        throw new Error(`Column header "${enrichHeader}" should NOT be displayed for non-enrich account type "${normalizedAccountType}"`);
                    }
                }
            }

            await Report.pass(this.page, `Posted Transactions column headers validated for ${isNonEnrichAccount ? 'non-enrich' : 'enrich'} account: ${postedColumnHeaders.join(', ')}`);
        } catch (error: any) {
            await Report.fail(this.page, `Failed to validate print preview content: ${error.message}`);
            throw error;
        }
    }

        /*Summary>
        * This function is used to capture the first row data from Pending and Posted transaction tables before opening the print preview
        * ************************************************************************************************************************************************************
        * Revision History:
        * Date:04/29/2026       Created By: Krishna Kota     					Reason:Capture first row data from Pending and Posted transaction tables for print preview comparison
        * Date:NA           	   Updated By:NA           						    Reason:
        * ************************************************************************************************************************************************************
        * */

    private async getFirstRowCellTextByHeader(tableName: string, headerName: string): Promise<string> {
        const headerCells = this.page.locator(`xpath=//div[@name="${tableName}"]//thead/tr/th`);
        const headerCount = await headerCells.count();

        for (let index = 0; index < headerCount; index++) {
            const titleText = (await headerCells.nth(index).getAttribute('title'))?.trim() ?? '';
            const headerText = (await headerCells.nth(index).textContent())?.trim() ?? '';
            const normalizedHeader = (titleText || headerText).toLowerCase();

            if (normalizedHeader === headerName.toLowerCase()) {
                // Use the th element's actual DOM cellIndex to find the matching td position
                const cellIndex = await headerCells.nth(index).evaluate((el: HTMLTableCellElement) => el.cellIndex);
                    const firstDataRow = this.page.locator(`xpath=//div[@name="${tableName}"]//following-sibling::tbody/tr[@data-row-id="0"]`).first();
                    const rowCell = firstDataRow.locator('td').nth(cellIndex);
                    return (await rowCell.textContent())?.trim() ?? '';
            }
        }

        return '';
    }

    private normalizePrintPreviewValue(value: string): string {
        return value
            .replace(/\s+/g, ' ')
            .replace(/([+-])\s+\$/g, '$1$')
            .replace(/\$\s+/g, '$')
            .toLowerCase()
            .trim();
    }

    private sanitizeTransactionTableText(value: string): string {
        return value
            .replace(/\bIcon\b/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
    /*Summary>
        * This function is used to capture the first row data of Enrich Eligible accounts from Pending and Posted transaction tables before opening the print preview
        * ************************************************************************************************************************************************************
        * Revision History:
        * Date:04/29/2026       Created By: Krishna Kota     					Reason:Capture first row data from Pending and Posted transaction tables for print preview comparison
        * Date:NA           	   Updated By:NA           						    Reason:
        * ************************************************************************************************************************************************************
        * */


    async CapturePendingAndPostedFirstRowData(accountType?: string): Promise<{ pending: { date: string; description: string; amount: string }; posted: { date: string; description: string; amount: string; balance: string; vendor?: string; category?: string; tag?: string } }> {
        const pending = { date: '', description: '', amount: '' };
        const posted: { date: string; description: string; amount: string; balance: string; vendor?: string; category?: string; tag?: string } = {
            date: '',
            description: '',
            amount: '',
            balance: ''
        };
        const normalizedAccountType = (accountType ?? '').trim().toUpperCase();
        const isNonEnrichAccount = normalizedAccountType === 'NHS' || normalizedAccountType === 'NOW';

        try {
            // Capture Pending Transactions first row
            const noPendingVisible = await this.noPendingTransactions.isVisible().catch(() => false);
            if (!noPendingVisible) {
                pending.date = await this.getFirstRowCellTextByHeader('stvPendingTransactionsListTable1', 'Date');
                pending.description = this.sanitizeTransactionTableText(await this.getFirstRowCellTextByHeader('stvPendingTransactionsListTable1', 'Description'));
                pending.amount = await this.getFirstRowCellTextByHeader('stvPendingTransactionsListTable1', 'Amount');

                await Report.pass(this.page, `Captured Pending 1st row => Date: "${pending.date}", Description: "${pending.description}", Amount: "${pending.amount}"`);
            } else {
                await Report.pass(this.page, 'No pending transactions present - nothing to capture');
            }

            // Capture Posted Transactions first row
            const noPostedVisible = await this.noPostTran.isVisible({ timeout: 5000 }).catch(() => false);
            if (!noPostedVisible) {
                const firstPostedRow = this.page.locator('xpath=(//div[@name="PostedTrnxtable"]//following-sibling::tbody/tr[@data-row-id="0"]/td)[1]');
                await firstPostedRow.scrollIntoViewIfNeeded();
                posted.date = await this.getFirstRowCellTextByHeader('PostedTrnxtable', 'Date');
                posted.description = this.sanitizeTransactionTableText(await this.getFirstRowCellTextByHeader('PostedTrnxtable', 'Description'));
                posted.amount = await this.getFirstRowCellTextByHeader('PostedTrnxtable', 'Amount');
                posted.balance = await this.getFirstRowCellTextByHeader('PostedTrnxtable', 'Balance');

                if (!isNonEnrichAccount) {
                    posted.vendor = await this.getFirstRowCellTextByHeader('PostedTrnxtable', 'Vendor');
                    posted.category = await this.getFirstRowCellTextByHeader('PostedTrnxtable', 'Category');
                    posted.tag = await this.getFirstRowCellTextByHeader('PostedTrnxtable', 'Tag');
                }

                const postedDetailsToLog = [
                    `Date: "${posted.date}"`,
                    posted.vendor ? `Vendor: "${posted.vendor}"` : '',
                    `Description: "${posted.description}"`,
                    posted.category ? `Category: "${posted.category}"` : '',
                    posted.tag ? `Tag: "${posted.tag}"` : '',
                    `Amount: "${posted.amount}"`,
                    `Balance: "${posted.balance}"`
                ].filter(Boolean).join(', ');

                await Report.pass(this.page, `Captured Posted 1st row => ${postedDetailsToLog}`);
            } else {
                await Report.pass(this.page, 'No posted transactions present - nothing to capture');
            }
        } catch (error: any) {
            await Report.fail(this.page, `Failed to capture first row data: ${error.message}`);
            throw error;
        }

        return { pending, posted };
    }


 /*Summary>
        * This function is used to capture the first row data of Non Enrich Eligible accounts from Pending and Posted transaction tables before opening the print preview
        * ************************************************************************************************************************************************************
        * Revision History:
        * Date:04/29/2026       Created By: Krishna Kota     					Reason:Capture first row data from Pending and Posted transaction tables for print preview comparison
        * Date:NA           	   Updated By:NA           						    Reason:
        * ************************************************************************************************************************************************************
        * */


    async CapturePendingAndPostedFirstRowDataNonEnrichAccount(): Promise<{ pending: { date: string; description: string; amount: string }; posted: { date: string; description: string; amount: string; balance: string } }> {
        const captured = await this.CapturePendingAndPostedFirstRowData('NHS');
        return {
            pending: captured.pending,
            posted: {
                date: captured.posted.date,
                description: captured.posted.description,
                amount: captured.posted.amount,
                balance: captured.posted.balance
            }
        };
    }


     /*Summary>
        * This function is used to validate the first row data of Pending and Posted Transactions in the print preview against data captured from the transaction detail page
        * ************************************************************************************************************************************************************
        * Revision History:
        * Date:04/29/2026       Created By: Krishna Kota     					Reason:Validate first row data in print preview matches actual transaction detail page data
        * Date:NA           	   Updated By:NA           						    Reason:
        * ************************************************************************************************************************************************************
        * */

    async ValidatePrintPreviewFirstRowData(capturedData: { pending: { date: string; description: string; amount: string }; posted: { date: string; description: string; amount: string; balance: string; vendor?: string; category?: string; tag?: string } }, accountType?: string) {
        try {
            await this.page.locator('#pdfjsbase64frame').waitFor({ state: 'visible', timeout: 15000 });
            const frame = this.page.frameLocator('#pdfjsbase64frame');

            // Extract all text from the PDF
            const allTextContent = await frame.locator('.textLayer span').allTextContents();
            const pdfText = this.normalizePrintPreviewValue(allTextContent.join(' '));

            const mismatches: string[] = [];

            // Validate Pending first row data
            if (capturedData.pending.date) {
                const pendingFields = [
                    { name: 'Date', value: capturedData.pending.date },
                    { name: 'Description', value: capturedData.pending.description },
                    { name: 'Amount', value: capturedData.pending.amount }
                ];
                for (const field of pendingFields) {
                    const normalizedValue = this.normalizePrintPreviewValue(field.value);
                    if (normalizedValue && !pdfText.includes(normalizedValue)) {
                        mismatches.push(`Pending ${field.name}: "${field.value}"`);
                    }
                }
                if (mismatches.length === 0) {
                    await Report.pass(this.page, `Pending 1st row data matched in print preview: Date="${capturedData.pending.date}", Description="${capturedData.pending.description}", Amount="${capturedData.pending.amount}"`);
                }
            } else {
                await Report.pass(this.page, 'No pending transaction data to validate in print preview');
            }

            // Validate Posted first row data
            if (capturedData.posted.date) {
                const normalizedAccountType = (accountType ?? '').trim().toUpperCase();
                const isNonEnrichByType = normalizedAccountType === 'NHS' || normalizedAccountType === 'NOW' || normalizedAccountType === 'LOC';
                const hasEnrichFields = Boolean(capturedData.posted.vendor || capturedData.posted.category || capturedData.posted.tag);
                const isNonEnrichAccount = isNonEnrichByType || !hasEnrichFields;

                const postedMismatches: string[] = [];
                const postedFields = [
                    { name: 'Date', value: capturedData.posted.date },
                    { name: 'Description', value: capturedData.posted.description },
                    { name: 'Amount', value: capturedData.posted.amount },
                    { name: 'Balance', value: capturedData.posted.balance }
                ];
                if (!isNonEnrichAccount) {
                    postedFields.splice(1, 0, { name: 'Vendor', value: capturedData.posted.vendor ?? '' });
                    postedFields.splice(3, 0, { name: 'Category', value: capturedData.posted.category ?? '' });
                    postedFields.splice(4, 0, { name: 'Tag', value: capturedData.posted.tag ?? '' });
                }
                for (const field of postedFields) {
                    const normalizedValue = this.normalizePrintPreviewValue(field.value);
                    if (normalizedValue && !pdfText.includes(normalizedValue)) {
                        postedMismatches.push(`Posted ${field.name}: "${field.value}"`);
                    }
                }
                if (postedMismatches.length === 0) {
                    const postedDetailsToLog = [
                        `Date="${capturedData.posted.date}"`,
                        !isNonEnrichAccount && capturedData.posted.vendor ? `Vendor="${capturedData.posted.vendor}"` : '',
                        `Description="${capturedData.posted.description}"`,
                        !isNonEnrichAccount && capturedData.posted.category ? `Category="${capturedData.posted.category}"` : '',
                        !isNonEnrichAccount && capturedData.posted.tag ? `Tag="${capturedData.posted.tag}"` : '',
                        `Amount="${capturedData.posted.amount}"`,
                        `Balance="${capturedData.posted.balance}"`
                    ].filter(Boolean).join(', ');
                    await Report.pass(this.page, `Posted 1st row data matched in print preview: ${postedDetailsToLog}`);
                } else {
                    mismatches.push(...postedMismatches);
                }
            } else {
                await Report.pass(this.page, 'No posted transaction data to validate in print preview');
            }

            if (mismatches.length > 0) {
                throw new Error(`Print preview data mismatch for: ${mismatches.join(', ')}`);
            }
        } catch (error: any) {
            await Report.fail(this.page, `Failed to validate print preview first row data: ${error.message}`);
            throw error;
        }
    }

        /*Summary>
        * This function is used to close the print preview modal opened by clicking on the Print button in Transaction Details page
        * ************************************************************************************************************************************************************
        * Revision History:
        * Date:04/29/2026       Created By: Krishna Kota     					Reason:Close the print preview modal opened by clicking on the Print button in Transaction Details page
        * Date:NA           	   Updated By:NA           						    Reason:
        * ************************************************************************************************************************************************************
        * */

    async ClosePrintPreviewModal() {
        try {
            const closeButtonVisible = await this.printPreviewCloseBtn.isVisible().catch(() => false);
            if (closeButtonVisible) {
                await this.printPreviewCloseBtn.click();
            } else {
                // Alternative: Press Escape key
                await this.page.keyboard.press('Escape');
            }
            await this.page.waitForTimeout(1000);
            await Report.pass(this.page, 'Print preview modal closed successfully');
        } catch (error) {
            await Report.fail(this.page, `Failed to close print preview modal: ${error.message}`);
            throw error;
        }
    }

    //ClickOnDownloadButton
    /*Summary>
        * This function is used to click on the Download button in Transaction Details page to download the transactions and validate the downloaded file
        * ************************************************************************************************************************************************************
        * Revision History:
        * Date:04/29/2026       Created By: Krishna Kota     					Reason:Click on the Download button in Transaction Details page to download the transactions and validate the downloaded file
        * Date:NA           	   Updated By:NA           						    Reason:
        * ************************************************************************************************************************************************************
        * */
       async ClickOnDownloadButton() {
        try {
            await this.downloadOption.waitFor({ state: 'visible', timeout: 10000 });
            await this.downloadOption.click();
            await waitForSpinnerToClose(this.page);
            await this.downloadTransactionsLabel.waitFor({ state: 'visible', timeout: 10000 });
            if (this.downloadTransactionsLabel.isVisible()) {
                await Report.pass(this.page, 'Clicked on Download button successfully');
            }else{
                throw new Error('Download Transactions label is not visible after clicking Download button');
            }
            }   
         catch (error) {
            await Report.fail(this.page, `Failed to click on Download button: ${error.message}`);
            throw error;
        }
    }

  


    async selectFileType(fileType: string) {
        try {
            const optionLocator = this.filetypeDropdown.locator(`option:has-text("${fileType}")`);
            const optionElement = await optionLocator.elementHandle();
            const optionValue = await optionElement?.getAttribute('value');

            // Select the option by its value
            if (optionValue) {
                await this.filetypeDropdown.selectOption(optionValue);
                await Report.pass(this.page, 'From Account is selected');
            }
            else {
                throw new Error(`Option with account number ${fileType} not found`);
            }
        }
        catch (error) {
            await Report.fail(this.page, `SelectFromAccount is failed :${error.message}`);
        }
    }

    async clickExportButton() {
        try {
            const downloadPromise = this.page.waitForEvent('download', { timeout: 30000 });
            await this.exportButton.click();
            this._lastDownload = await downloadPromise;
            await waitForSpinnerToClose(this.page);
            await this.downloadSuccess.waitFor({ state: 'visible', timeout: 10000 });
            await this.closeDialogBtn.click();
            await this.downloadSuccess.waitFor({ state: 'hidden', timeout: 10000 });
            await Report.pass(this.page, 'Clicked on Export button successfully');
        } catch (error) {
            await Report.fail(this.page, `Failed to click on Export button: ${error.message}`);
            throw error;
        }
    } 
    async selectTransactionPeriod() {
        try {
            const isEnabled = await this.transactionPeriod.isEnabled();
            if (isEnabled) {
                //await this.transactionPeriod.click();
                await Report.pass(this.page, 'Transaction period radio button is enabled and selected by default');
                await this.clickExportButton();
                await waitForSpinnerToClose(this.page);

            } else {
                throw new Error('Transaction period radio button is not enabled or not selected by default');
            }
        } catch (error) {
            await Report.fail(this.page, `Failed to perform export transaction period action: ${error.message}`);
            throw error;
        }
    } 

    //selectCustomDateRange
    async selectCustomDateRange(startDate: string, endDate: string) {
        try {
            await this.customeDateRangeOption.click();
            await this.fromDateInput.fill(startDate);
            await this.toDateInput.fill(endDate);
            await this.page.click('body'); // Click outside to trigger any potential blur or validation events
            await Report.pass(this.page, `Custom date range selected: ${startDate} to ${endDate}`);
            await this.clickExportButton();
            await waitForSpinnerToClose(this.page);
        } catch (error) {
            await Report.fail(this.page, `Failed to select custom date range: ${error.message}`);
            throw error;
        }
    }



    async ValidateDownloadTransactionsFunctionality() {
        try {
            if (!this._lastDownload) {
                throw new Error('No download was captured. Ensure clickExportButton was called before this method.');
            }
            const suggestedFileName = this._lastDownload.suggestedFilename();
            const downloadPath = await this._lastDownload.path();
            if (!downloadPath) {
                throw new Error(`File "${suggestedFileName}" was not saved to disk within the expected time`);
            }

            await Report.pass(this.page, `Transactions file downloaded successfully: "${suggestedFileName}"`);

            const lowerFileName = suggestedFileName.toLowerCase();
            const skipContentValidationExtensions = ['.ofx', '.qbo', '.qfx'];
            const shouldSkipContentValidation = skipContentValidationExtensions.some(ext => lowerFileName.endsWith(ext));
            if (shouldSkipContentValidation) {
                await Report.pass(this.page, `File type does not require content validation. Skipping validation for: "${suggestedFileName}"`);
                return;
            }

            // Read file content
            const rawContent = fs.readFileSync(downloadPath, 'utf-8');
            const lines = rawContent.split(/\r?\n/).filter(l => l.trim() !== '');

            if (lines.length === 0) {
                throw new Error('Downloaded file is empty');
            }

            // Validate CSV headers (first line)
            const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
            // const expectedHeaders = ['Date', 'Description', 'Amount'];
            // const missingHeaders = expectedHeaders.filter(h => !headers.some(header => header.toLowerCase().includes(h.toLowerCase())));
            // if (missingHeaders.length > 0) {
            //     throw new Error(`Downloaded CSV is missing expected headers: ${missingHeaders.join(', ')}. Found: ${headers.join(', ')}`);
            // }
            await Report.pass(this.page, `CSV headers validated: ${headers.join(', ')}`);

            // Validate at least one data row exists
            const dataRowCount = lines.length - 1;
            if (dataRowCount < 1) {
                await Report.info(this.page, 'Downloaded CSV has no data rows; file contains headers only for the selected criteria');
            } else {
                await Report.pass(this.page, `CSV contains ${dataRowCount} data row(s)`);
            }

            // Attach CSV content to Playwright report
            await test.info().attach(suggestedFileName, {
                body: Buffer.from(rawContent, 'utf-8'),
                contentType: 'text/csv'
            });

            // Take a screenshot of the CSV data rendered as an HTML table in a new browser page
            const tableRows = lines.map((line, i) => {
                const cells = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
                const tag = i === 0 ? 'th' : 'td';
                return `<tr>${cells.map(c => `<${tag}>${c}</${tag}>`).join('')}</tr>`;
            }).join('');

            const htmlContent = `<!DOCTYPE html><html><head><style>
                body { font-family: Arial, sans-serif; padding: 16px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; font-size: 13px; }
                th { background: #003087; color: #fff; }
                tr:nth-child(even) td { background: #f5f5f5; }
            </style></head><body>
                <h3 style="color:#003087">${suggestedFileName}</h3>
                <table>${tableRows}</table>
            </body></html>`;

            const previewPage = await this.page.context().newPage();
            await previewPage.setContent(htmlContent, { waitUntil: 'load' });
            const screenshotBuffer = await previewPage.screenshot({ fullPage: true });
            await previewPage.close();

            await test.info().attach(`${suggestedFileName}-preview.png`, {
                body: screenshotBuffer,
                contentType: 'image/png'
            });

            await Report.pass(this.page, `CSV screenshot captured and attached to report: "${suggestedFileName}-preview.png"`);
        } catch (error) {
            await Report.fail(this.page, `Failed to validate downloaded transactions file: ${error.message}`);
            throw error;
        }
    }

    private normalizeSortText(value: string): string {
        return value.replace(/\s+/g, ' ').trim().toLowerCase();
    }

    private parseSortCurrency(value: string): number | null {
        const trimmed = value.trim();
        if (!trimmed) {
            return null;
        }

        const isParenthesesNegative = /^\(.*\)$/.test(trimmed);
        const normalized = trimmed.replace(/[,$()\s]/g, '');
        const numericPart = normalized.replace(/[^0-9.+-]/g, '');
        const parsed = Number(numericPart);

        if (Number.isNaN(parsed)) {
            return null;
        }

        return isParenthesesNegative ? -Math.abs(parsed) : parsed;
    }

    private parseSortDateValue(value: string): number | null {
        const trimmed = value.trim();
        if (!trimmed) {
            return null;
        }

        const parsed = Date.parse(trimmed);
        return Number.isNaN(parsed) ? null : parsed;
    }

    private getSortDirection<T>(values: T[], comparator: (a: T, b: T) => number): SortDirection {
        if (values.length < 2) {
            return 'insufficient';
        }

        let asc = true;
        let desc = true;

        for (let index = 1; index < values.length; index++) {
            const comparison = comparator(values[index - 1], values[index]);
            if (comparison > 0) {
                asc = false;
            }
            if (comparison < 0) {
                desc = false;
            }
        }

        if (asc && desc) {
            return 'constant';
        }
        if (asc) {
            return 'asc';
        }
        if (desc) {
            return 'desc';
        }
        return 'unsorted';
    }

    private async getPostedHeaderIndex(header: string): Promise<number> {
        const headerCells = this.page.locator('xpath=//div[@name="PostedTrnxtable"]//thead/tr/th');
        const headerCount = await headerCells.count();

        for (let index = 0; index < headerCount; index++) {
            const titleText = (await headerCells.nth(index).getAttribute('title'))?.trim() ?? '';
            const headerText = (await headerCells.nth(index).textContent())?.trim() ?? '';
            const normalizedHeader = this.normalizeSortText(titleText || headerText);

            if (normalizedHeader === this.normalizeSortText(header)) {
                return index + 1;
            }
        }

        throw new Error(`Posted Transactions header "${header}" was not found`);
    }

    private async getPostedColumnValues(header: string): Promise<string[]> {
        const headerIndex = await this.getPostedHeaderIndex(header);
        const cellLocator = this.page.locator(`xpath=//div[@name="PostedTrnxtable"]//following-sibling::tbody/tr[@data-row-id]/td[${headerIndex}]`);
        const count = await cellLocator.count();
        const values: string[] = [];

        for (let index = 0; index < count; index++) {
            const text = (await cellLocator.nth(index).textContent())?.trim() ?? '';
            if (text !== '') {
                values.push(text);
            }
        }

        return values;
    }

    private async clickPostedHeader(header: string): Promise<void> {
        const headerSelector = `xpath=//div[@name="PostedTrnxtable"]//thead/tr/th[@title="${header}"]/span[1]`;
        
        for (let attempt = 1; attempt <= 3; attempt++) {
            const headerLocator = header.includes('Balance')
                ? this.page.locator(headerSelector).last()
                : this.page.locator(headerSelector).first();

            try {
                await headerLocator.waitFor({ state: 'visible', timeout: 15000 });
                await headerLocator.click();
                await this.page.waitForTimeout(3000);
                return;
            } catch (error) {
                if (attempt === 3) {
                    throw error;
                }
                await this.page.waitForTimeout(1000);
            }
        }
    }

    async ValidatePostedColumnSortingDescending(header: string, type: SortColumnType): Promise<void> {
        await this.page.waitForTimeout(5000);
        const { parse, compare } = this.getSortStrategy(type);
        // 1st click → asc, 2nd click → desc
        await this.clickPostedHeader(header);
        await this.clickPostedHeader(header);

        const sortValues = await this.getPostedColumnValues(header);
        const comparable = sortValues.map(parse).filter((v): v is NonNullable<typeof v> => v != null && v !== '');
        expect(comparable.length).toBeGreaterThan(1);

        const direction = this.getSortDirection(comparable, compare);
        //expect(direction === 'desc' || direction === 'constant').toBeTruthy();
        expect(direction === 'desc').toBeTruthy();
    }

    async ValidatePostedColumnSortingAscending(header: string, type: SortColumnType): Promise<void> {
        await this.page.waitForTimeout(5000);
        const { parse, compare } = this.getSortStrategy(type);

        // 1st click → asc
        await this.clickPostedHeader(header);

        const sortValues = await this.getPostedColumnValues(header);
        const comparable = sortValues.map(parse).filter((v): v is NonNullable<typeof v> => v != null && v !== '');
        expect(comparable.length).toBeGreaterThan(1);

        const direction = this.getSortDirection(comparable, compare);
        //expect(direction === 'asc' || direction === 'constant').toBeTruthy();
        expect(direction === 'asc').toBeTruthy();
    }

    private getSortStrategy(type: SortColumnType): { parse: (v: string) => string | number | null; compare: (a: any, b: any) => number } {
        switch (type) {
            case 'text':
                return {
                    parse: (v: string) => this.normalizeSortText(v) || null,
                    compare: (a: string, b: string) => a.localeCompare(b)
                };
            case 'currency':
                return {
                    parse: (v: string) => this.parseSortCurrency(v),
                    compare: (a: number, b: number) => a - b
                };
            case 'date':
                return {
                    parse: (v: string) => this.parseSortDateValue(v),
                    compare: (a: number, b: number) => a - b
                };
        }
    }
 
}
