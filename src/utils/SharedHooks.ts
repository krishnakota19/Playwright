import { createTestRun, updateAutomatedTCStatus, updateTCStatusInTestCycle} from './zephyr-util';
import { TestInfo, test as base, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Global variable to track if setup has been executed
let isSetupExecuted = false;


/**
 * Helper function to extract testCaseIDs from test annotations
 * @param testInfo - The Playwright TestInfo object containing test metadata
 * @returns Array of test case IDs extracted from TestCaseID annotations
 */
function extractTestCaseIDs(testInfo: TestInfo): string[] {
  return testInfo.annotations
    .filter(annotation => annotation.type === 'TestCaseID')
    .map(annotation => annotation.description || '');
}

export const test = base.extend<{
  testCaseIDs: string[];
  beforeAllHook: void;
  afterEachHook: void;
}>({
  testCaseIDs: [[], { option: true }],

  /**
   * Auto-use fixture for beforeAll logic
   * Handles global test setup including Zephyr test cycle creation
   * Sets up the test environment and executes only once per test run
   * First worker clears ALL singleton state to ensure clean test runs
   */
  beforeAllHook: [async ({ }, use) => {
    
    const zephyrTestCycleUpdateFlag = process.env.ZEPHYR_TEST_CYCLE_UPDATE_FLAG;
    if (!isSetupExecuted) {
      const workerId = process.env.TEST_WORKER_INDEX || process.pid.toString();
      console.log(`Before All Hook Executed - Worker ${workerId}`);

      if (zephyrTestCycleUpdateFlag?.toLowerCase() === 'true') {
        console.log('------- Zephyr Test cycle creation Start -----------');
        await createTestRun();
        console.log('---------Zephyr Test cycle creation End-----------');
      }
      isSetupExecuted = true;
    }
    await use();
  }, { auto: true }],

  /**
   * Auto-use fixture for afterEach logic
   * Handles cleanup and Zephyr test status updates after each test execution
   * Updates test case status in Zephyr
   * @param testInfo - Test information containing status and annotations
   */
  afterEachHook: [async ({ }, use, testInfo) => {
   
    process.env.LOG_FILE = `logs/${path.basename(testInfo.file, path.extname(testInfo.file))}.log`;
    await use();

    // After test execution - process results and update Zephyr
    console.log("After Each Hook Executed");

    let testStatus = testInfo.status as string;

    if (testStatus === "passed") {
      testStatus = "Pass";
    } else if (testStatus === "failed") {
      testStatus = "Fail";
    }

    const testCaseIDs = extractTestCaseIDs(testInfo);

    console.log(`TestCaseIDs: [${testCaseIDs.join(', ')}] - Status: ${testStatus}`);

    if (process.env.ZEPHYR_TEST_CYCLE_UPDATE_FLAG === 'true') {
      await updateTCStatusInTestCycle(testCaseIDs, testStatus);
    }
    if (testStatus === 'Pass' && process.env.ZEPHYR_TEST_CASE_UPDATE_FLAG === 'true') {
      const customFieldsMap: { [key: string]: string } = {};
      customFieldsMap["Automation Status"] = "Automated";
      customFieldsMap["Method"] = "Automated";
      customFieldsMap["Type"] = "Regression";
      customFieldsMap["Ready For Automation"] = "Yes";
      await updateAutomatedTCStatus(testCaseIDs, customFieldsMap);
    }
  }, { auto: true }]
});

// Export expect for use in test files
export { expect };
