# Zephyr Integration Guide

## What is Zephyr Integration?

Zephyr is a test management tool that helps track test execution results. This integration automatically updates your test results in Zephyr whenever you run Playwright tests, eliminating manual status updates.

**Benefits:**
- ✅ Automatic test result updates
- ✅ Real-time test cycle management
- ✅ Synchronized test case metadata
- ✅ Improved test traceability

---

## Quick Start

### Step 1: Check if Integration is Already Set Up
Your project already has Zephyr integration configured! You just need to enable it.

### Step 2: Enable Zephyr Updates
Navigate to: `config/proj/.env.qa` and change these lines:
```bash
# Change from false to true
ZEPHYR_TEST_CYCLE_UPDATE_FLAG=true
ZEPHYR_TEST_CASE_UPDATE_FLAG=true
```

### Step 3: Run Your Tests
Use any of these commands:
```powershell
# Option 1: Run specific test
npx playwright test src/proj/test/LoginTest.spec.ts --project=proj

# Option 2: Run tests by tag
npx playwright test --grep "@smoke"

# Option 3: Run by test case ID
npx playwright test --grep "TC-T4020"
```

### Step 4: Check Results
- Watch the console output for Zephyr updates
- Check your Zephyr dashboard for updated test results

---

## Detailed Setup Guide

### Prerequisites
✅ **Already Configured in Your Project:**
- Zephyr utility functions (`utils/zephyr-util.ts`)
- Shared hooks integration (`utils/shared-hooks.ts`)
- Environment configuration (`config/proj/.env.qa`)
- Sample test with annotations (`src/proj/test/LoginTest.spec.ts`)

### Configuration Files Overview

#### 1. Environment Variables (`config/proj/.env.qa`)
```bash
# Zephyr API Configuration
ZEPHYR_URL=jira-url
ZEPHYR_PROJECT_NAME=proj-name
ZEPHYR_ACCESS_TOKEN=your_token_here

# Feature Flags (Change these to enable/disable)
ZEPHYR_TEST_CYCLE_UPDATE_FLAG=false  ← Change to 'true'
ZEPHYR_TEST_CASE_UPDATE_FLAG=false   ← Change to 'true'

# Test Cycle Settings
ZEPHYR_TEST_CYCLE_NAME=Test_Playwright_Auto
ZEPHYR_TEST_CYCLE_FOLDER=/Automation/PI_2025.3/Iteration_PI2025.3.3
```

#### 2. Test Annotation Example
```typescript
test('proj-name-T4020 - Login with valid credentials', {
  tag: ['@smoke', '@sanity'],
  annotation: [
    { type: 'TestCaseID', description: 'proj-name-T4020' }  ← This links to Zephyr
  ]
}, async ({ page }) => {
  // Your test code here
});
```

---

## How It Works (Behind the Scenes)

### Complete Method Invocation Sequence

#### High-Level Execution Flow
```
1. Test Starts → 2. Before All Hook → 3. Create/Find Test Cycle
                           ↓
6. Update Zephyr ← 5. After Each Hook ← 4. Test Execution
```

#### Detailed Method Call Chain
```
Playwright Test Execution Start
     ↓
1. beforeAllHook fixture (auto-use)
   ├── Check isSetupExecuted flag
   ├── if (!isSetupExecuted && ZEPHYR_TEST_CYCLE_UPDATE_FLAG === 'true')
   │   └── createTestRun()
   │       ├── if (!testCycleID) → getAllTestCycles()
   │       │   ├── GET /testrun/search?query=projectKey="proj-name"ANDfolder="/path"
   │       │   ├── if (folder not found) → createTestFolder()
   │       │   │   └── POST /folder/ (create folder structure)
   │       │   ├── if (cycle not found) → createNewTestCycle()
   │       │   │   └── POST /testrun/ (create new test cycle)
   │       │   └── if (cycle found) → extract testCycleID
   │       └── else → verifyValidTestCycleID()
   │           └── GET /testrun/{testCycleID} (validate existing ID)
   └── isSetupExecuted = true

2. Individual Test Execution
   ├── Test code executes with annotations
   └── Test completes with status (passed/failed/skipped)

3. afterEachHook fixture (auto-use)
   ├── extractTestCaseIDs(testInfo)
   │   └── testInfo.annotations.filter(annotation => annotation.type === 'TestCaseID')
   ├── Status mapping: testInfo.status → "Pass"/"Fail"/"Not Executed"
   ├── if (ZEPHYR_TEST_CYCLE_UPDATE_FLAG === 'true')
   │   └── updateTCStatusInTestCycle(testCaseIDs, status)
   │       └── POST /testrun/{testCycleID}/testresults
   └── if (status === 'Pass' && ZEPHYR_TEST_CASE_UPDATE_FLAG === 'true')
       └── updateAutomatedTCStatus(testCaseIDs, customFieldsMap)
           └── For each testCase: PUT /testcase/{testCaseId}
```

### Method Explanation Breakdown

#### 1. beforeAllHook Fixture Logic
```typescript
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
}, { auto: true }]
```

**Method Explanation:**
- **Singleton Pattern**: `isSetupExecuted` ensures setup runs only once across all workers
- **Environment Check**: Only executes if `ZEPHYR_TEST_CYCLE_UPDATE_FLAG=true`
- **Worker Identification**: Logs which worker is performing setup
- **Auto-use Fixture**: Automatically runs before any test execution
- **Calls**: `createTestRun()` for test cycle management

#### 2. createTestRun() Method Logic
```typescript
export async function createTestRun() {
    if (!testCycleID) {
        const flag = await getAllTestCycles();
        if (!flag) {
            await createNewTestCycle();
        }
    } else {
        await verifyValidTestCycleID();
        console.log(`Testcycle ID from config file ${testCycleID}`);
    }
}
```

**Method Explanation:**
- **Conditional Logic**: Branches based on whether testCycleID is pre-configured
- **Search First**: Attempts to find existing test cycle before creating new one
- **Create if Missing**: Only creates new cycle if search returns false
- **Validation**: Verifies pre-configured test cycle IDs are valid
- **API Calls**: Orchestrates multiple API interactions

#### 3. getAllTestCycles() Method Logic
```typescript
async function getAllTestCycles() {
    try {
        const url = `${baseURL}/testrun/search?query=projectKey="${project}"ANDfolder="${folderPath}"`;
        const apiRequestContext = await request.newContext();
        const response = await apiRequestContext.get(url, { headers: headers });
        
        const responseBody = await response.text();
        console.log(responseBody);

        let flag = false;

        if (response.status() === 400 && responseBody.includes("Value(s) not found for field folder:")) {
            console.log("Test cycle not present." + responseBody);
            await createTestFolder();
        } else if (!response.ok()) {
            console.error(`HTTP error! status: ${response.status()}`);
            return false;
        } else {
            const data = JSON.parse(responseBody);
            const names = data.map((item: { name: any; }) => item.name);
            for (let i = 0; i < names.length; i++) {
                if (names[i] === testCycle) {
                    flag = true;
                    testCycleID = data[i].key;
                    console.log(`Test cycle already present as ${testCycle} in path ${folderPath} and its ID is ${testCycleID}`);
                    break;
                }
            }
        }
        return flag;
    } catch (error) {
        console.error('Error fetching test cycles:', error);
        return false;
    }
}
```

**Method Explanation:**
- **API Query Construction**: Builds search query with project key and folder path
- **Error Handling**: Handles different HTTP status codes and error conditions
- **Folder Creation**: Automatically creates folder structure if missing
- **Cycle Matching**: Searches existing cycles for name match
- **ID Extraction**: Extracts and stores test cycle ID for later use
- **Return Flag**: Boolean indicates whether existing cycle was found

#### 4. createNewTestCycle() Method Logic
```typescript
async function createNewTestCycle(): Promise<void> {
    const endpoint = `${baseURL}/testrun/`;
    const body = {
        name: testCycle,
        projectKey: project,
        folder: folderPath,
    };
    
    try {
        const apiRequestContext = await request.newContext();
        const response = await apiRequestContext.post(endpoint, {
            headers: headers,
            data: body
        });

        const responseBody = await response.text();

        if (response.ok()) {
            const data = JSON.parse(responseBody);
            testCycleID = data.key;
            console.log(`New Test cycle created as ${testCycle} in path ${folderPath} and its ID is ${testCycleID}`);
        } else {
            console.error(`Failed to create test cycle. Status: ${response.status()}, Response: ${responseBody}`);
        }
    } catch (error) {
        console.error('Error creating new test cycle:', error);
    }
}
```

**Method Explanation:**
- **Body Construction**: Creates request payload with cycle name, project, and folder
- **POST Request**: Creates new test cycle via Zephyr API
- **ID Extraction**: Captures newly created test cycle ID from response
- **Error Logging**: Provides detailed error information for debugging
- **Global State Update**: Updates global `testCycleID` variable

#### 5. afterEachHook Fixture Logic
```typescript
afterEachHook: [async ({ }, use, testInfo) => {
    await use();

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
```

**Method Explanation:**
- **Status Mapping**: Converts Playwright status to Zephyr format
- **ID Extraction**: Calls `extractTestCaseIDs()` to get test case annotations
- **Conditional Updates**: Two separate update paths based on environment flags
- **Test Result Update**: Updates pass/fail status in test cycle
- **Metadata Update**: Updates automation-related fields for passed tests only
- **Auto-use Fixture**: Runs automatically after each test completion

#### 6. extractTestCaseIDs() Helper Function
```typescript
function extractTestCaseIDs(testInfo: TestInfo): string[] {
    return testInfo.annotations
        .filter(annotation => annotation.type === 'TestCaseID')
        .map(annotation => annotation.description || '');
}
```

**Method Explanation:**
- **Annotation Filtering**: Searches for annotations with type 'TestCaseID'
- **ID Extraction**: Maps annotation descriptions to array of test case IDs
- **Safe Extraction**: Handles missing descriptions with empty string fallback
- **Array Return**: Returns string array for batch operations

#### 7. updateTCStatusInTestCycle() Method Logic
```typescript
export async function updateTCStatusInTestCycle(filteredScenarios: string[], status: string) {
    const testResultsArray = filteredScenarios.map(scenario => ({
        status: status,
        testCaseKey: scenario,
    }));

    const requestBody = JSON.stringify(testResultsArray);
    const url = `${baseURL}/testrun/${testCycleID}/testresults`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: requestBody
        });

        if (response.status === 201) {
            console.log(`Test cases updated as ${status} for Testcases ${filteredScenarios.join(', ')} in Test cycle ${testCycleID}`);
        } else {
            console.log(`WARNING - Test cases not updated in Zephyr for Test cycle ${testCycleID}. Execution Status: ${status}. Testcases: ${filteredScenarios.join(', ')}`);
        }
    } catch (error) {
        console.error(`Exception caught while logging: ${error.message}`);
    }
}
```

**Method Explanation:**
- **Batch Processing**: Handles multiple test cases in single API call
- **Result Mapping**: Maps each test case ID to status object
- **API Call**: POST request to test cycle results endpoint
- **Success Logging**: Confirms successful updates with test case details
- **Error Handling**: Logs warnings for failed updates without breaking flow

#### 8. updateAutomatedTCStatus() Method Logic
```typescript
export async function updateAutomatedTCStatus(filteredTCs: string[], customFieldsMap: { [key: string]: string }) {
    for (const individualTC of filteredTCs) {
        const url = `${baseURL}/testcase/${individualTC}`;
        const customFields: { [key: string]: string } = {};

        for (const [key, value] of Object.entries(customFieldsMap)) {
            customFields[key] = value;
        }

        const requestBody = {
            customFields: customFields,
            status: "Completed"
        };

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            if (response.status === 200) {
                let updatedFields = `Updated fields for Testcase ${individualTC}: `;
                for (const [key, value] of Object.entries(customFieldsMap)) {
                    updatedFields += `${key} = ${value}, `;
                }
                updatedFields += `status = Completed`;
                console.log(updatedFields);
            } else {
                const responseText = await response.text();
                console.log(`WARNING - Fields not updated for Testcase ${individualTC}. Response: ${responseText}`);
            }
        } catch (error) {
            console.error(`Exception caught while logging: ${error.message}`);
        }
    }
}
```

**Method Explanation:**
- **Individual Processing**: Updates each test case separately (not batched)
- **Custom Fields Mapping**: Applies automation-related field updates
- **Status Update**: Sets test case status to "Completed"
- **PUT Request**: Updates existing test case with new field values
- **Detailed Logging**: Shows exactly which fields were updated
- **Error Resilience**: Continues processing other test cases if one fails

### Status Mapping Logic:
- ✅ `passed` → `Pass` (Playwright → Zephyr)
- ❌ `failed` → `Fail` (Playwright → Zephyr)  
- ⏭️ `skipped` → `Not Executed` (Playwright → Zephyr)

### API Endpoint Usage:
- **Search Cycles**: `GET /testrun/search?query=projectKey="proj-name"ANDfolder="/path"`
- **Create Folder**: `POST /folder/` 
- **Create Cycle**: `POST /testrun/`
- **Verify Cycle**: `GET /testrun/{testCycleID}`
- **Update Results**: `POST /testrun/{testCycleID}/testresults`
- **Update Test Case**: `PUT /testcase/{testCaseId}`

---

## Step-by-Step: Running Tests with Zephyr

### Method Invocation Sequences for Different Execution Approaches

### Method 1: Simple Command (Recommended for Beginners)
```powershell
# 1. Open PowerShell in project root
# 2. Run this command
npx playwright test src/proj/test/LoginTest.spec.ts --project=proj
```

**Complete Method Invocation Sequence:**
```
1. Playwright Test Runner Start
   └── Load config/proj/.env.qa (if ZEPHYR flags are set to true)

2. Test Discovery and Setup
   ├── Load test file: src/proj/test/LoginTest.spec.ts
   ├── Import shared-hooks: import { test, expect } from '../../../utils/shared-hooks'
   └── Register auto-use fixtures: beforeAllHook, afterEachHook

3. Before All Hook Execution (First Worker Only)
   ├── Check: process.env.ZEPHYR_TEST_CYCLE_UPDATE_FLAG === 'true'
   ├── if (true) → createTestRun()
   │   ├── if (!testCycleID) → getAllTestCycles()
   │   │   ├── GET /testrun/search (search existing cycles)
   │   │   ├── if (cycle found) → extract testCycleID
   │   │   └── if (cycle not found) → createNewTestCycle()
   │   │       └── POST /testrun/ (create new cycle)
   │   └── console.log('Test cycle already present...' OR 'New Test cycle created...')
   └── isSetupExecuted = true

4. Individual Test Execution
   ├── Test: 'proj-name-T4020 - Login with valid credentials'
   ├── Annotation: { type: 'TestCaseID', description: 'proj-name-T4020' }
   ├── Test code execution with page interactions
   └── Test completion with status: 'passed'

5. After Each Hook Execution
   ├── extractTestCaseIDs(testInfo) → ['proj-name-T4020']
   ├── Status mapping: 'passed' → 'Pass'
   ├── console.log('TestCaseIDs: [proj-name-T4020] - Status: Pass')
   ├── if (ZEPHYR_TEST_CYCLE_UPDATE_FLAG === 'true')
   │   └── updateTCStatusInTestCycle(['proj-name-T4020'], 'Pass')
   │       └── POST /testrun/{testCycleID}/testresults
   └── if (status === 'Pass' && ZEPHYR_TEST_CASE_UPDATE_FLAG === 'true')
       └── updateAutomatedTCStatus(['proj-name-T4020'], customFieldsMap)
           └── PUT /testcase/proj-name-T4020 (update automation fields)
```

### Method 2: Using Environment Variables Manually
```powershell
# 1. Set Zephyr flags
$env:ZEPHYR_TEST_CYCLE_UPDATE_FLAG="true"
$env:ZEPHYR_TEST_CASE_UPDATE_FLAG="true"

# 2. Run test
npx playwright test --grep "proj-name-T4020"
```

**Method Invocation Sequence:**
```
1. PowerShell Environment Setup
   ├── [Environment]::SetEnvironmentVariable('ZEPHYR_TEST_CYCLE_UPDATE_FLAG', 'true', 'Process')
   ├── [Environment]::SetEnvironmentVariable('ZEPHYR_TEST_CASE_UPDATE_FLAG', 'true', 'Process')
   └── Variables available to child processes

2. Test Filtering and Execution
   ├── Playwright applies grep filter: --grep "proj-name-T4020"
   ├── Finds matching test: 'proj-name-T4020 - Login with valid credentials'
   └── [Same execution sequence as Method 1, steps 3-5]

3. Environment Variable Usage in Code
   ├── beforeAllHook: process.env.ZEPHYR_TEST_CYCLE_UPDATE_FLAG?.toLowerCase() === 'true'
   ├── afterEachHook: process.env.ZEPHYR_TEST_CYCLE_UPDATE_FLAG === 'true'
   └── afterEachHook: process.env.ZEPHYR_TEST_CASE_UPDATE_FLAG === 'true'
```

### Method 3: Load All Settings from .env File
```powershell
# 1. Load environment file
Get-Content config\proj\.env.qa | ForEach-Object {
    if ($_ -match '^([^#][^=]*?)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"').Trim("'")
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

# 2. Run tests
npx playwright test --headed
```

**Method Invocation Sequence:**
```
1. PowerShell File Parsing and Environment Setup
   ├── Get-Content config\proj\.env.qa
   ├── ForEach-Object loop through lines
   ├── Regex match: '^([^#][^=]*?)=(.*)$'
   │   ├── Skip comment lines (starting with #)
   │   ├── Extract name = $matches[1].Trim()
   │   └── Extract value = $matches[2].Trim().Trim('"').Trim("'")
   ├── [Environment]::SetEnvironmentVariable($name, $value, "Process")
   └── All .env variables now available in process environment

2. Environment Variables Loaded (Examples)
   ├── ZEPHYR_URL = "jira-api-url"
   ├── ZEPHYR_PROJECT_NAME = "proj-name"
   ├── ZEPHYR_ACCESS_TOKEN = "your_token_here"
   ├── ZEPHYR_TEST_CYCLE_UPDATE_FLAG = "true"
   ├── ZEPHYR_TEST_CASE_UPDATE_FLAG = "true"
   ├── ZEPHYR_TEST_CYCLE_NAME = "Test_Playwright_Auto"
   └── ZEPHYR_TEST_CYCLE_FOLDER = "/Automation/PI_2025.3/Iteration_PI2025.3.3"

3. Playwright Test Execution
   ├── Test discovery across all test files
   ├── [Same beforeAllHook sequence as Method 1]
   │   └── Uses loaded environment variables for API calls
   ├── Multiple test execution (if --headed flag shows browser)
   └── [Same afterEachHook sequence for each test]

4. Zephyr API Configuration Usage
   ├── baseURL = process.env.ZEPHYR_URL
   ├── project = process.env.ZEPHYR_PROJECT_NAME
   ├── token = process.env.ZEPHYR_ACCESS_TOKEN
   ├── testCycle = process.env.ZEPHYR_TEST_CYCLE_NAME
   └── folderPath = process.env.ZEPHYR_TEST_CYCLE_FOLDER
```

### Environment Variable Processing Logic
```typescript
// In zephyr-util.ts
const baseURL = process.env.ZEPHYR_URL;
let folderPath: string = process.env.ZEPHYR_TEST_CYCLE_FOLDER || 'default_folder_path';
let project: string = process.env.ZEPHYR_PROJECT_NAME || 'default_project_name';
const token = process.env.ZEPHYR_ACCESS_TOKEN;
const testCycle = process.env.ZEPHYR_TEST_CYCLE_NAME;
let testCycleID = process.env.ZEPHYR_TEST_CYCLE_ID;
```

**Variable Resolution Sequence:**
1. **Process Environment Lookup**: `process.env.VARIABLE_NAME`
2. **Default Fallback**: Uses fallback value if environment variable undefined
3. **Global Assignment**: Assigns to module-level variables for API usage
4. **Runtime Usage**: Variables used in API endpoint construction and authentication

### Test Annotation Processing Sequence
```typescript
// In test file
test('proj-name-T4020 - Login with valid credentials', {
    tag: ['@smoke', '@sanity'],
    annotation: [
        { type: 'TestCaseID', description: 'proj-name-T4020' }
    ]
}, async ({ page }) => {
    // Test implementation
});
```

**Annotation Processing Flow:**
```
1. Test Registration
   ├── Playwright parses test metadata
   ├── Stores annotations in testInfo object
   └── Associates annotations with test execution

2. Test Execution
   └── testInfo object passed to afterEachHook fixture

3. Annotation Extraction (in afterEachHook)
   ├── extractTestCaseIDs(testInfo)
   ├── testInfo.annotations.filter(annotation => annotation.type === 'TestCaseID')
   ├── .map(annotation => annotation.description || '')
   └── Returns: ['proj-name-T4020']

4. Zephyr API Usage
   ├── testCaseIDs used in updateTCStatusInTestCycle()
   └── testCaseIDs used in updateAutomatedTCStatus()
```

---

## Understanding Console Output

### ✅ Successful Integration (What You Should See)
```
Before All Hook Executed - Worker 0
------- Zephyr Test cycle creation Start -----------
Test cycle already present as Test_Playwright_Auto in path /Automation/PI_2025.3/Iteration_PI2025.3.3 and its ID is proj-name-C95
---------Zephyr Test cycle creation End-----------

After Each Hook Executed
TestCaseIDs: [proj-name-T4020] - Status: Pass
Test cases updated as Pass for Testcases proj-name-T4020 in Test cycle proj-name-C95
Updated fields for Testcase proj-name-T4020: Automation Status = Automated, Method = Automated, Type = Regression, Ready For Automation = Yes, status = Completed
```

### ❌ When Integration is Disabled
```
Before All Hook Executed - Worker 0
After Each Hook Executed
TestCaseIDs: [proj-name-T4020] - Status: Pass
```
*No Zephyr updates happen - just local test results*

### 🔄 New Test Cycle Creation
```
Before All Hook Executed - Worker 0
------- Zephyr Test cycle creation Start -----------
https://jira/rest/atm/1.0/testrun/search?query=projectKey="proj-name"...
[]
Folder created successfully
Status: 201
Response Body: {"key":"proj-name-C95"}
New Test cycle created as Test_Playwright_Auto in path /Automation/PI_2025.3/Iteration_PI2025.3.3 and its ID is proj-name-C95
---------Zephyr Test cycle creation End-----------
```

---

## Adding Zephyr Integration to Your Tests

### Method Invocation Changes for Test Integration

### For Existing Tests (Step-by-Step)

#### Step 1: Update Your Test File Imports
```typescript
// Change this:
import { test, expect } from '@playwright/test';

// To this:
import { test, expect } from '../../../utils/shared-hooks';
```

**Method Impact Analysis:**
```
Before (Standard Playwright):
├── Uses default Playwright test runner
├── No beforeAllHook or afterEachHook fixtures
├── No Zephyr integration methods called
└── Test executes in isolation

After (Shared Hooks):
├── Uses extended test runner with auto-use fixtures
├── beforeAllHook automatically executes before test suite
│   └── Calls createTestRun() if ZEPHYR flags enabled
├── afterEachHook automatically executes after each test
│   ├── Calls extractTestCaseIDs(testInfo)
│   ├── Calls updateTCStatusInTestCycle() if enabled
│   └── Calls updateAutomatedTCStatus() if enabled
└── Full Zephyr integration lifecycle activated
```

#### Step 2: Add TestCaseID Annotation
```typescript
// Before (without Zephyr):
test('should login successfully', async ({ page }) => {
  // test code
});

// After (with Zephyr):
test('proj-name-T4021 - should login successfully', {
  tag: ['@smoke'],
  annotation: [
    { type: 'TestCaseID', description: 'proj-name-T4021' }
  ]
}, async ({ page }) => {
  // test code
});
```

**Annotation Processing Sequence:**
```
1. Test Registration Phase:
   ├── Playwright parses test metadata
   ├── annotation: [{ type: 'TestCaseID', description: 'proj-name-T4021' }]
   └── Stores annotation in testInfo object

2. Test Execution Phase:
   └── Test runs with page interactions

3. After Each Hook Processing:
   ├── extractTestCaseIDs(testInfo) called
   ├── testInfo.annotations.filter(annotation => annotation.type === 'TestCaseID')
   ├── Returns: ['proj-name-T4021']
   ├── updateTCStatusInTestCycle(['proj-name-T4021'], 'Pass')
   │   └── POST /testrun/{testCycleID}/testresults
   └── updateAutomatedTCStatus(['proj-name-T4021'], customFields)
       └── PUT /testcase/proj-name-T4021
```

**Method Call Comparison:**
```
Without Annotation:
├── extractTestCaseIDs(testInfo) → returns []
├── updateTCStatusInTestCycle([], 'Pass') → no API calls made
└── updateAutomatedTCStatus([], customFields) → no API calls made

With Annotation:
├── extractTestCaseIDs(testInfo) → returns ['proj-name-T4021']
├── updateTCStatusInTestCycle(['proj-name-T4021'], 'Pass') → API call made
└── updateAutomatedTCStatus(['proj-name-T4021'], customFields) → API call made
```

#### Step 3: Verify Test Case Exists in Zephyr
- Check that `proj-name-T4021` exists in your Zephyr project
- If not, create it first in Zephyr dashboard

**API Verification Sequence:**
```
When Test Runs with Non-Existent Test Case:
1. updateTCStatusInTestCycle() execution:
   ├── POST /testrun/{testCycleID}/testresults
   ├── Body: [{ "status": "Pass", "testCaseKey": "proj-name-T4021" }]
   ├── Response: 400 Bad Request (test case not found)
   └── Console: "WARNING - Test cases not updated in Zephyr..."

2. updateAutomatedTCStatus() execution:
   ├── PUT /testcase/proj-name-T4021
   ├── Body: { "customFields": {...}, "status": "Completed" }
   ├── Response: 404 Not Found
   └── Console: "WARNING - Fields not updated for Testcase proj-name-T4021..."

Manual Verification Method:
├── Navigate to Zephyr dashboard
├── Search: "proj-name-T4021"
├── if (found) → Integration will work
└── if (not found) → Create test case first
```

### For New Tests
```typescript
import { test, expect } from '../../../utils/shared-hooks';
import { LoginPage } from '../pages/LoginPage';

test('proj-name-T4022 - should display error for invalid credentials', {
  tag: ['@negative', '@regression'],
  annotation: [
    { type: 'TestCaseID', description: 'proj-name-T4022' }
  ]
}, async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.login('invalid@email.com', 'wrongpassword');
  await expect(loginPage.errorMessage).toBeVisible();
});
```

---

## Testing Your Setup

### Complete Method Verification Sequences

### 1. Run a Single Test (Safest Way to Start)
```powershell
# Enable Zephyr first
$env:ZEPHYR_TEST_CYCLE_UPDATE_FLAG="true"
$env:ZEPHYR_TEST_CASE_UPDATE_FLAG="true"

# Run one test to verify setup
npx playwright test --grep "proj-name-T4020" --headed
```

**Expected Method Invocation Sequence:**
```
1. Environment Variable Setup:
   ├── process.env.ZEPHYR_TEST_CYCLE_UPDATE_FLAG = "true"
   └── process.env.ZEPHYR_TEST_CASE_UPDATE_FLAG = "true"

2. Playwright Test Discovery:
   ├── Finds test matching "proj-name-T4020"
   ├── Loads test with shared-hooks import
   └── Registers auto-use fixtures

3. Before All Hook Execution:
   ├── Check: ZEPHYR_TEST_CYCLE_UPDATE_FLAG === 'true' → SUCCESS
   ├── console.log('Before All Hook Executed - Worker 0')
   ├── console.log('------- Zephyr Test cycle creation Start -----------')
   ├── createTestRun() called
   │   ├── getAllTestCycles() → GET /testrun/search
   │   ├── if cycle exists: console.log('Test cycle already present...')
   │   └── if cycle missing: createNewTestCycle() → POST /testrun/
   └── console.log('---------Zephyr Test cycle creation End-----------')

4. Test Execution:
   ├── 'proj-name-T4020 - Login with valid credentials' runs
   ├── Browser opens (--headed flag)
   ├── Test interactions execute
   └── Test completes with status: 'passed'

5. After Each Hook Execution:
   ├── console.log('After Each Hook Executed')
   ├── extractTestCaseIDs(testInfo) → ['proj-name-T4020']
   ├── Status mapping: 'passed' → 'Pass'
   ├── console.log('TestCaseIDs: [proj-name-T4020] - Status: Pass')
   ├── updateTCStatusInTestCycle(['proj-name-T4020'], 'Pass')
   │   └── console.log('Test cases updated as Pass for Testcases proj-name-T4020...')
   └── updateAutomatedTCStatus(['proj-name-T4020'], customFieldsMap)
       └── console.log('Updated fields for Testcase proj-name-T4020: Automation Status = Automated...')
```

### 2. Check Console Output
Look for these key messages and their method origins:

**✅ Setup Phase Messages:**
- `Before All Hook Executed - Worker 0`
  - **Method**: beforeAllHook fixture execution
  - **Indicates**: Zephyr integration activated

**✅ Test Cycle Messages:**
- `Test cycle already present as Test_Playwright_Auto in path /Automation/PI_2025.3/Iteration_PI2025.3.3 and its ID is proj-name-C95`
  - **Method**: getAllTestCycles() → found existing cycle
- OR `New Test cycle created as Test_Playwright_Auto in path /Automation/PI_2025.3/Iteration_PI2025.3.3 and its ID is proj-name-C95`
  - **Method**: createNewTestCycle() → created new cycle

**✅ Test Result Messages:**
- `TestCaseIDs: [proj-name-T4020] - Status: Pass`
  - **Method**: afterEachHook → extractTestCaseIDs() and status mapping
- `Test cases updated as Pass for Testcases proj-name-T4020 in Test cycle proj-name-C95`
  - **Method**: updateTCStatusInTestCycle() → successful API call
- `Updated fields for Testcase proj-name-T4020: Automation Status = Automated, Method = Automated, Type = Regression, Ready For Automation = Yes, status = Completed`
  - **Method**: updateAutomatedTCStatus() → successful field updates

**❌ Failure Indicators:**
- Missing "Before All Hook Executed" → beforeAllHook not triggered (check imports)
- Missing "Test cycle creation" messages → ZEPHYR_TEST_CYCLE_UPDATE_FLAG not 'true'
- "TestCaseIDs: [proj-name-T4020] - Status: Pass" but no update messages → API calls failing

### 3. Verify in Zephyr Dashboard
- Navigate to your Zephyr project
- Check folder: `/Automation/PI_2025.3/Iteration_PI2025.3.3`
- Look for test cycle: `Test_Playwright_Auto`
- Verify test case status updated

**Method-to-Dashboard Mapping:**
```
Console Output → Zephyr Dashboard Verification:

1. "Test cycle already present...ID is proj-name-C95"
   └── Dashboard: Find test cycle "Test_Playwright_Auto" with ID proj-name-C95

2. "Test cases updated as Pass for Testcases proj-name-T4020"
   └── Dashboard: proj-name-T4020 status should show "Pass" in test cycle

3. "Updated fields for Testcase proj-name-T4020: Automation Status = Automated..."
   └── Dashboard: proj-name-T4020 test case fields should show:
       ├── Automation Status: "Automated"
       ├── Method: "Automated"
       ├── Type: "Regression"
       ├── Ready For Automation: "Yes"
       └── Status: "Completed"
```

### 4. API Call Verification (Advanced)
```powershell
# Verify API connectivity manually
$headers = @{
    'Authorization' = "Bearer $env:ZEPHYR_ACCESS_TOKEN"
    'Content-Type' = 'application/json'
}

# Test 1: Verify test cycle exists
Invoke-RestMethod -Uri "https://jira/rest/atm/1.0/testrun/proj-name-C95" -Headers $headers

# Test 2: Verify test case exists
Invoke-RestMethod -Uri "https://jira/rest/atm/1.0/testcase/proj-name-T4020" -Headers $headers
```

**Method Correlation:**
```
Manual API Calls → Automated Method Calls:

1. GET /testrun/proj-name-C95
   └── Corresponds to: verifyValidTestCycleID() method

2. GET /testcase/proj-name-T4020
   └── Corresponds to: updateAutomatedTCStatus() method (same endpoint, different HTTP method)

Success Response → Method Success
Error Response → Method Failure (check troubleshooting guide)
```

---

## Configuration Reference

### Environment Variables Explained

| Variable | Purpose | Example Value |
|----------|---------|---------------|
| `ZEPHYR_URL` | Zephyr API endpoint | `https://jira/rest/atm/1.0` |
| `ZEPHYR_PROJECT_NAME` | Your project key in Zephyr | `proj-name` |
| `ZEPHYR_ACCESS_TOKEN` | Authentication token | `your_secret_token` |
| `ZEPHYR_TEST_CYCLE_UPDATE_FLAG` | Enable test result updates | `true` or `false` |
| `ZEPHYR_TEST_CASE_UPDATE_FLAG` | Enable metadata updates | `true` or `false` |
| `ZEPHYR_TEST_CYCLE_NAME` | Auto-created cycle name | `Test_Playwright_Auto` |
| `ZEPHYR_TEST_CYCLE_FOLDER` | Organization folder path | `/Automation/PI_2025.3/Iteration_PI2025.3.3` |

### Test Case Metadata Updates
When `ZEPHYR_TEST_CASE_UPDATE_FLAG=true`, passing tests will update:
- **Automation Status**: `Automated`
- **Method**: `Automated`
- **Type**: `Regression`
- **Ready For Automation**: `Yes`
- **Status**: `Completed`

---

## Common Use Cases

### 1. Daily Smoke Tests
```powershell
# Enable Zephyr
$env:ZEPHYR_TEST_CYCLE_UPDATE_FLAG="true"

# Run smoke tests
npx playwright test --grep "@smoke"
```

### 2. Sprint Regression Testing
```powershell
# Load all environment settings
Get-Content config\proj\.env.qa | ForEach-Object {
    if ($_ -match '^([^#][^=]*?)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"').Trim("'")
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

# Run regression suite
npx playwright test --grep "@regression"
```

### 3. Continuous Integration (CI/CD)
Add to your pipeline:
```yaml
- name: Run Tests with Zephyr Integration
  run: |
    $env:ZEPHYR_TEST_CYCLE_UPDATE_FLAG="true"
    $env:ZEPHYR_TEST_CASE_UPDATE_FLAG="true"
    npx playwright test --reporter=junit
```

---

## Troubleshooting Guide

### Method Sequence Analysis for Common Issues

### Issue 1: Tests Run But No Zephyr Updates
**Symptoms:**
```
Before All Hook Executed - Worker 0
After Each Hook Executed
TestCaseIDs: [proj-name-T4020] - Status: Pass
```

**Root Cause Analysis with Method Sequence:**
```
1. beforeAllHook Execution
   ├── isSetupExecuted check: false → proceed
   ├── ZEPHYR_TEST_CYCLE_UPDATE_FLAG check: undefined or 'false'
   ├── if (zephyrTestCycleUpdateFlag?.toLowerCase() === 'true') → FAILS
   └── No createTestRun() call → No Zephyr setup

2. afterEachHook Execution  
   ├── extractTestCaseIDs(testInfo) → ['proj-name-T4020'] ✓
   ├── Status mapping: 'passed' → 'Pass' ✓
   ├── if (process.env.ZEPHYR_TEST_CYCLE_UPDATE_FLAG === 'true') → FAILS
   ├── No updateTCStatusInTestCycle() call
   ├── if (process.env.ZEPHYR_TEST_CASE_UPDATE_FLAG === 'true') → FAILS
   └── No updateAutomatedTCStatus() call
```

**Solutions with Method Verification:**

1. **Check Environment Flags:**
   ```powershell
   echo $env:ZEPHYR_TEST_CYCLE_UPDATE_FLAG  # Should be "true"
   echo $env:ZEPHYR_TEST_CASE_UPDATE_FLAG   # Should be "true"
   ```
   
   **Expected Method Flow After Fix:**
   ```
   beforeAllHook: if ('true'?.toLowerCase() === 'true') → SUCCESS
   afterEachHook: if ('true' === 'true') → SUCCESS
   ```

2. **Set Flags Manually:**
   ```powershell
   $env:ZEPHYR_TEST_CYCLE_UPDATE_FLAG="true"
   $env:ZEPHYR_TEST_CASE_UPDATE_FLAG="true"
   ```
   
   **Method Invocation After Setting:**
   ```
   Next Test Run:
   ├── beforeAllHook → createTestRun() called
   │   └── Zephyr test cycle creation starts
   └── afterEachHook → updateTCStatusInTestCycle() called
       └── updateAutomatedTCStatus() called (for passed tests)
   ```

3. **Verify Environment Loading:**
   ```powershell
   # Check if .env.qa file has correct values
   Get-Content config\proj\.env.qa | Select-String "ZEPHYR.*FLAG"
   ```
   
   **Expected Output and Method Impact:**
   ```
   ZEPHYR_TEST_CYCLE_UPDATE_FLAG=true   → enables createTestRun()
   ZEPHYR_TEST_CASE_UPDATE_FLAG=true    → enables updateAutomatedTCStatus()
   ```

### Issue 2: "Test Case Not Found" Errors
**Symptoms:**
```
WARNING - Test cases not updated in Zephyr for Test cycle proj-name-C95. 
Execution Status: Pass. Testcases: proj-name-T4020
```

**Root Cause Analysis with Method Sequence:**
```
1. updateTCStatusInTestCycle(['proj-name-T4020'], 'Pass') called
   ├── testResultsArray.map(scenario => ({ status: 'Pass', testCaseKey: 'proj-name-T4020' }))
   ├── POST /testrun/{testCycleID}/testresults
   ├── Response status: 400 (Bad Request) or 404 (Not Found)
   └── Test case 'proj-name-T4020' doesn't exist in Zephyr project

2. updateAutomatedTCStatus(['proj-name-T4020'], customFieldsMap) called
   ├── PUT /testcase/proj-name-T4020
   ├── Response status: 404 (Not Found)
   └── Console: 'WARNING - Fields not updated for Testcase proj-name-T4020'
```

**Solutions with Verification Steps:**
1. **Verify Test Case Exists:**
   ```powershell
   # Manual verification in Zephyr UI
   # Go to Zephyr → Search for 'proj-name-T4020'
   # Check project: proj-name
   ```

2. **API Verification (Advanced):**
   ```powershell
   # Test API access to specific test case
   curl -H "Authorization: Bearer $env:ZEPHYR_ACCESS_TOKEN" `
        "https://jira/rest/atm/1.0/testcase/proj-name-T4020"
   ```
   
   **Expected Method Response:**
   ```
   Success (200): Test case exists and is accessible
   Error (404): Test case doesn't exist → Create in Zephyr
   Error (401): Authentication issue → Check token
   ```

3. **Annotation Verification:**
   ```typescript
   // Check test annotation syntax
   test('proj-name-T4020 - Login with valid credentials', {
       annotation: [
           { type: 'TestCaseID', description: 'proj-name-T4020' }  // ← Verify this matches Zephyr
       ]
   }, async ({ page }) => {
       // test code
   });
   ```

### Issue 3: Authentication Errors
**Symptoms:**
```
Error: 401 Unauthorized
HTTP error! status: 401
```

**Root Cause Analysis with Method Sequence:**
```
1. API Request Construction (in any Zephyr method)
   ├── headers = { 'Authorization': `Bearer ${token}` }
   ├── token = process.env.ZEPHYR_ACCESS_TOKEN
   └── if (token is invalid/expired) → 401 response

2. Method Call Points Where Auth Fails:
   ├── getAllTestCycles() → GET /testrun/search
   ├── createNewTestCycle() → POST /testrun/
   ├── createTestFolder() → POST /folder/
   ├── verifyValidTestCycleID() → GET /testrun/{id}
   ├── updateTCStatusInTestCycle() → POST /testrun/{id}/testresults
   └── updateAutomatedTCStatus() → PUT /testcase/{id}
```

**Solutions with Method Impact:**
1. **Check Token in Environment:**
   ```powershell
   echo $env:ZEPHYR_ACCESS_TOKEN
   # Should show: "your_actual_token_here"
   # Should NOT be: empty, "your_token_here", or expired token
   ```

2. **Verify Token Validity:**
   ```powershell
   # Test authentication with simple API call
   curl -H "Authorization: Bearer $env:ZEPHYR_ACCESS_TOKEN" `
        "https://jira/rest/atm/1.0/project"
   ```
   
   **Expected Method Response:**
   ```
   Success (200): Authentication working → Check other issues
   Error (401): Token invalid → Update ZEPHYR_ACCESS_TOKEN in .env.qa
   ```

3. **Update Token in Configuration:**
   ```bash
   # In config/proj/.env.qa
   ZEPHYR_ACCESS_TOKEN=your_new_valid_token_here
   ```
   
   **Method Impact After Fix:**
   ```
   All API methods will now receive valid authentication:
   ├── createTestRun() → successful cycle creation/discovery
   ├── updateTCStatusInTestCycle() → successful status updates
   └── updateAutomatedTCStatus() → successful field updates
   ```

### Issue 4: Folder/Test Cycle Creation Issues
**Symptoms:**
```
WARNING - Error in folder creation. Status: 403, Response: {"message": "Forbidden"}
Failed to create test cycle. Status: 400, Response: {"errors": ["Invalid folder path"]}
```

**Root Cause Analysis with Method Sequence:**
```
1. getAllTestCycles() → createTestFolder() chain:
   ├── GET /testrun/search returns 400 with "folder not found"
   ├── createTestFolder() called
   ├── POST /folder/ with body: { projectKey: "proj-name", name: "/path", type: "TEST_RUN" }
   ├── Response: 403 Forbidden → Insufficient permissions
   └── Folder creation fails

2. createNewTestCycle() failure:
   ├── POST /testrun/ with body: { name: "cycle", projectKey: "proj-name", folder: "/invalid/path" }
   ├── Response: 400 Bad Request → Invalid folder path format
   └── Test cycle creation fails
```

**Solutions with Method Verification:**
1. **Check Folder Path Format:**
   ```bash
   # In config/proj/.env.qa
   ZEPHYR_TEST_CYCLE_FOLDER=/Automation/PI_2025.3/Iteration_PI2025.3.3
   # Should start with / and use valid folder hierarchy
   ```
   
   **Method Call Verification:**
   ```typescript
   // In createTestFolder() and createNewTestCycle()
   console.log(`Folder path being used: ${folderPath}`);
   // Should show: /Automation/PI_2025.3/Iteration_PI2025.3.3
   // Should NOT show: undefined, empty string, or malformed path
   ```

2. **Use Existing Folder Path:**
   ```powershell
   # Check existing folders in Zephyr UI
   # Navigate to Test Runs → Folder structure
   # Copy exact path from Zephyr and update .env.qa
   ```
   
   **Method Impact:**
   ```
   getAllTestCycles() with existing folder:
   ├── GET /testrun/search → finds existing cycles in folder
   ├── No createTestFolder() call needed
   └── Proceeds to createNewTestCycle() or uses existing cycle
   ```

3. **Verify Permissions:**
   ```powershell
   # Test folder access with API
   curl -H "Authorization: Bearer $env:ZEPHYR_ACCESS_TOKEN" `
        "https://jira/rest/atm/1.0/folder?projectKey=proj-name"
   ```
   
   **Expected Method Response:**
   ```
   Success (200): List of accessible folders → Use existing path
   Error (403): Insufficient permissions → Contact admin for folder creation rights
   ```

---

## Best Practices

### 1. Test Case ID Naming Convention
```typescript
// ✅ Good: Include project prefix
test('proj-name-T4020 - Login with valid credentials', ...)

// ❌ Bad: Generic numbering
test('TC001 - Login test', ...)
```

### 2. Meaningful Test Descriptions
```typescript
// ✅ Good: Clear, specific description
test('proj-name-T4021 - should display error message for invalid email format', ...)

// ❌ Bad: Vague description
test('proj-name-T4021 - negative test', ...)
```

### 3. Proper Test Organization
```typescript
// Group related tests
test.describe('Login Functionality', () => {
  test('proj-name-T4020 - valid credentials', ...)
  test('proj-name-T4021 - invalid email', ...)
  test('proj-name-T4022 - empty fields', ...)
});
```

### 4. Environment Management
```powershell
# Create reusable script: enable-zephyr.ps1
$env:ZEPHYR_TEST_CYCLE_UPDATE_FLAG="true"
$env:ZEPHYR_TEST_CASE_UPDATE_FLAG="true"
Write-Host "Zephyr integration enabled ✅"

# Use in other scripts
.\enable-zephyr.ps1
npx playwright test
```

---

## Advanced Features

### 1. Custom Test Cycle Names
```bash
# In .env.qa, change cycle name based on sprint/release
ZEPHYR_TEST_CYCLE_NAME=Sprint_24.3_Automation
ZEPHYR_TEST_CYCLE_FOLDER=/Automation/Sprint_24.3/Week_1
```

### 2. Conditional Zephyr Updates
```typescript
// Only update Zephyr in specific environments
const shouldUpdateZephyr = process.env.NODE_ENV === 'qa';
process.env.ZEPHYR_TEST_CYCLE_UPDATE_FLAG = shouldUpdateZephyr.toString();
```

### 3. Batch Test Execution
```powershell
# Run tests in groups with different configurations
foreach ($suite in @("smoke", "regression", "api")) {
    Write-Host "Running $suite tests..."
    npx playwright test --grep "@$suite"
}
```

---

## Summary

### ✅ What's Already Set Up
- Zephyr integration framework is fully implemented
- Sample test with annotations (`LoginTest.spec.ts`)
- Environment configuration file (`.env.qa`)
- Utility functions for API communication
- Shared hooks for automatic updates

### 🚀 Quick Start Checklist
1. **Enable integration**: Change flags to `true` in `config/proj/.env.qa`
2. **Run a test**: `npx playwright test --grep "proj-name-T4020"`
3. **Check console**: Look for "Test cases updated as Pass"
4. **Verify in Zephyr**: Check your dashboard for updated results

### 📝 For New Tests
1. Import from shared-hooks: `import { test, expect } from '../../../utils/shared-hooks';`
2. Add annotation: `annotation: [{ type: 'TestCaseID', description: 'proj-name-T4XXX' }]`
3. Run test and verify Zephyr updates

### 🔧 Need Help?
- **No Zephyr updates**: Check environment flags are set to `true`
- **Authentication errors**: Verify `ZEPHYR_ACCESS_TOKEN` in `.env.qa`
- **Test case not found**: Ensure test case exists in Zephyr project
- **Console debugging**: Look for "Before All Hook" and "After Each Hook" messages

---

## Complete Method Reference and Invocation Patterns

### Core Integration Methods

#### 1. Fixture Methods (shared-hooks.ts)

##### beforeAllHook Fixture
```typescript
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
}, { auto: true }]
```
**Invocation**: Automatic (auto-use fixture), once per test suite
**Dependencies**: Environment variable `ZEPHYR_TEST_CYCLE_UPDATE_FLAG`
**Calls**: `createTestRun()`

##### afterEachHook Fixture  
```typescript
afterEachHook: [async ({ }, use, testInfo) => {
    await use();
    
    console.log("After Each Hook Executed");
    let testStatus = testInfo.status as string;
    
    if (testStatus === "passed") testStatus = "Pass";
    else if (testStatus === "failed") testStatus = "Fail";
    
    const testCaseIDs = extractTestCaseIDs(testInfo);
    console.log(`TestCaseIDs: [${testCaseIDs.join(', ')}] - Status: ${testStatus}`);
    
    if (process.env.ZEPHYR_TEST_CYCLE_UPDATE_FLAG === 'true') {
        await updateTCStatusInTestCycle(testCaseIDs, testStatus);
    }
    if (testStatus === 'Pass' && process.env.ZEPHYR_TEST_CASE_UPDATE_FLAG === 'true') {
        const customFieldsMap = {
            "Automation Status": "Automated",
            "Method": "Automated", 
            "Type": "Regression",
            "Ready For Automation": "Yes"
        };
        await updateAutomatedTCStatus(testCaseIDs, customFieldsMap);
    }
}, { auto: true }]
```
**Invocation**: Automatic (auto-use fixture), after each test
**Dependencies**: Environment variables, `testInfo` parameter
**Calls**: `extractTestCaseIDs()`, `updateTCStatusInTestCycle()`, `updateAutomatedTCStatus()`

##### extractTestCaseIDs Helper
```typescript
function extractTestCaseIDs(testInfo: TestInfo): string[] {
    return testInfo.annotations
        .filter(annotation => annotation.type === 'TestCaseID')
        .map(annotation => annotation.description || '');
}
```
**Invocation**: Called by `afterEachHook`
**Returns**: Array of test case IDs from annotations
**Input**: Playwright `TestInfo` object

#### 2. Zephyr API Methods (zephyr-util.ts)

##### createTestRun()
```typescript
export async function createTestRun() {
    if (!testCycleID) {
        const flag = await getAllTestCycles();
        if (!flag) {
            await createNewTestCycle();
        }
    } else {
        await verifyValidTestCycleID();
        console.log(`Testcycle ID from config file ${testCycleID}`);
    }
}
```
**Invocation**: Called by `beforeAllHook`
**Dependencies**: Global variables from environment
**Calls**: `getAllTestCycles()`, `createNewTestCycle()`, `verifyValidTestCycleID()`

##### getAllTestCycles()
```typescript
async function getAllTestCycles() {
    // GET /testrun/search?query=projectKey="proj-name"ANDfolder="/path"
    // Returns: boolean (true if cycle found)
    // Side Effects: Sets global testCycleID, may call createTestFolder()
}
```
**API Call**: `GET /testrun/search`  
**Returns**: Boolean indicating if test cycle was found
**Side Effects**: May call `createTestFolder()`, sets `testCycleID` global

##### createNewTestCycle()  
```typescript
async function createNewTestCycle(): Promise<void> {
    // POST /testrun/ with body: { name, projectKey, folder }
    // Side Effects: Sets global testCycleID from response
}
```
**API Call**: `POST /testrun/`
**Returns**: void (Promise)
**Side Effects**: Sets global `testCycleID` variable

##### createTestFolder()
```typescript
async function createTestFolder() {
    // POST /folder/ with body: { projectKey, name, type: 'TEST_RUN' }
    // Called when folder structure doesn't exist
}
```
**API Call**: `POST /folder/`
**Invocation**: Called by `getAllTestCycles()` when folder not found
**Purpose**: Creates folder structure for test cycles

##### verifyValidTestCycleID()
```typescript
export async function verifyValidTestCycleID() {
    // GET /testrun/{testCycleID}
    // Validates pre-configured test cycle ID
}
```
**API Call**: `GET /testrun/{testCycleID}`
**Purpose**: Validates existing test cycle ID from configuration
**Returns**: void (logs errors if invalid)

##### updateTCStatusInTestCycle()
```typescript
export async function updateTCStatusInTestCycle(filteredScenarios: string[], status: string) {
    // POST /testrun/{testCycleID}/testresults
    // Body: [{ status: "Pass", testCaseKey: "proj-name-T4020" }, ...]
}
```
**API Call**: `POST /testrun/{testCycleID}/testresults`
**Invocation**: Called by `afterEachHook` if `ZEPHYR_TEST_CYCLE_UPDATE_FLAG=true`
**Purpose**: Updates test case execution status in test cycle
**Batch Processing**: Handles multiple test cases in single API call

##### updateAutomatedTCStatus()
```typescript
export async function updateAutomatedTCStatus(filteredTCs: string[], customFieldsMap: object) {
    // For each test case: PUT /testcase/{testCaseId}
    // Body: { customFields: {...}, status: "Completed" }
}
```
**API Call**: `PUT /testcase/{testCaseId}` (individual calls)
**Invocation**: Called by `afterEachHook` if test passed and `ZEPHYR_TEST_CASE_UPDATE_FLAG=true`
**Purpose**: Updates automation-related fields on test case
**Processing**: Individual API calls for each test case

### Method Invocation Patterns

#### Complete Test Execution Flow
```
Test Suite Start
     ↓
beforeAllHook (once per suite)
├── Environment check: ZEPHYR_TEST_CYCLE_UPDATE_FLAG
├── if enabled: createTestRun()
│   ├── getAllTestCycles() or verifyValidTestCycleID()
│   └── createNewTestCycle() (if needed)
└── isSetupExecuted = true
     ↓
For Each Test:
├── Test execution with annotations
├── Test completes with status
└── afterEachHook
    ├── extractTestCaseIDs(testInfo)
    ├── Status mapping (passed → Pass)
    ├── if ZEPHYR_TEST_CYCLE_UPDATE_FLAG: updateTCStatusInTestCycle()
    └── if passed + ZEPHYR_TEST_CASE_UPDATE_FLAG: updateAutomatedTCStatus()
     ↓
Test Suite Complete
```

#### Error Handling Patterns
```
API Failures:
├── Network errors → catch blocks → console.error() → continue
├── Authentication (401) → console.error() → continue  
├── Not Found (404) → console warning → continue
└── Bad Request (400) → console warning → continue

Design Philosophy: Fail gracefully, don't break test execution
```

#### Environment Variable Dependencies
```
Required for Basic Operation:
├── ZEPHYR_URL (API base URL)
├── ZEPHYR_PROJECT_NAME (project key)
└── ZEPHYR_ACCESS_TOKEN (authentication)

Control Flags:
├── ZEPHYR_TEST_CYCLE_UPDATE_FLAG (enables/disables status updates)
└── ZEPHYR_TEST_CASE_UPDATE_FLAG (enables/disables field updates)

Optional Configuration:
├── ZEPHYR_TEST_CYCLE_NAME (cycle name, has default)
├── ZEPHYR_TEST_CYCLE_FOLDER (folder path, has default)
└── ZEPHYR_TEST_CYCLE_ID (pre-configured cycle ID)
```

---

*This integration eliminates manual test result updates and provides real-time synchronization between your Playwright tests and Zephyr test management platform.*
