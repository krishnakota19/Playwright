import { request } from '@playwright/test';

const baseURL = process.env.ZEPHYR_URL;
let folderPath: string = process.env.ZEPHYR_TEST_CYCLE_FOLDER || 'default_folder_path';
let project: string = process.env.ZEPHYR_PROJECT_NAME || 'default_project_name';

const token = process.env.ZEPHYR_ACCESS_TOKEN;
const testCycle = process.env.ZEPHYR_TEST_CYCLE_NAME;
let testCycleID = process.env.ZEPHYR_TEST_CYCLE_ID;

const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
};



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
async function getAllTestCycles() {
    try {
        const url = `${baseURL}/testrun/search?query=projectKey="${project}"ANDfolder="${folderPath}"`;
        console.log(url);
        const apiRequestContext = await request.newContext();
        const response = await apiRequestContext.get(url, {
            headers: headers,
        });

        // Read the body once and store it in a variable
        const responseBody = await response.text();

        // Now you can use responseBody multiple times
        console.log(responseBody);

        let flag = false;

        if (response.status() === 400 && responseBody.includes("Value(s) not found for field folder:")) {
            console.log("Test cycle not present." + responseBody);
            await createTestFolder();
        } else if (!response.ok()) {
            console.error(`HTTP error! status: ${response.status()}`);
            console.error(`Response: ${responseBody}`);
            return false;
        } else {
            // If you need to parse it as JSON
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
/**
 * Creates New Test Cycle if not already Available
 */
async function createNewTestCycle(): Promise<void> {
    const endpoint = `${baseURL}/testrun/`;
    const body = {
        name: testCycle,
        projectKey: project,
        folder: folderPath,
    };
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': '*/*'
    };
    try {
        // Create a new APIRequestContext
        const apiRequestContext = await request.newContext();

        // Make the POST request using the APIRequestContext
        const response = await apiRequestContext.post(endpoint, {
            headers: headers,
            data: body
        });

        const responseBody = await response.text();

        console.log(`Status: ${response.status()}`);
        console.log(`Response Body: ${responseBody}`);

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

async function createTestFolder() {
    const endpoint = `${baseURL}/folder/`;
    const jsonObject = {
        projectKey: project,
        name: folderPath,
        type: 'TEST_RUN',
    };

    try {
        const apiRequestContext = await request.newContext();
        const response = await apiRequestContext.post(endpoint, {
            headers: headers,
            data: jsonObject,
        });
        
        const responseBody = await response.text();

        if (response.status() === 201) {
            console.log('Folder created successfully');
        } else {
            console.log(`WARNING - Error in folder creation. Status: ${response.status()}, Response: ${responseBody}`);
        }
    } catch (error) {
        console.error('Error creating folder:', error);
    }
}

export async function verifyValidTestCycleID() {
    try {
        const url = `${baseURL}/testrun/${testCycleID}`;

        const apiRequestContext = await request.newContext();
        const response = await apiRequestContext.get(url, {
            headers: headers,
        });
        
        const flag = response.ok();
        if (!flag) {
            const responseBody = await response.text();
            console.log(`ERROR: Please try valid Test cycle ID instead of ${testCycleID}. Response: ${responseBody}`);
        }
        console.assert(flag, 'Valid Test Cycle ID');
    } catch (error) {
        console.error('Error verifying test cycle ID:', error);
    }
}

export async function updateTCStatusInTestCycle(filteredScenarios: string[], status: string) {
    const testResultsArray = filteredScenarios.map(scenario => ({
        status: status,
        testCaseKey: scenario,
        //executedBy: "e5612675"
    }));

    const requestBody = JSON.stringify(testResultsArray);
    const url = `${baseURL}/testrun/${testCycleID}/testresults`;

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': '*/*'
    };
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
        const err = error as Error;
        console.error(`Exception caught while logging: ${err.message}`);
    }
}

export async function updateAutomatedTCStatus(filteredTCs: string[], customFieldsMap: { [key: string]: string }) {
    for (const individualTC of filteredTCs) {
        const url = `${baseURL}/testcase/${individualTC}`;
        const customFields: { [key: string]: string } = {};

        for (const [key, value] of Object.entries(customFieldsMap)) {
            customFields[key] = value;
        }

        const requestBody = {
            customFields: customFields,
            status: "Completed"  // ← HARDCODED STATUS ADDED
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
                updatedFields += `status = Completed`;  // ← LOG STATUS UPDATE
                console.log(updatedFields);
            } else {
                const responseText = await response.text();  // ← BETTER ERROR LOGGING
                console.log(`WARNING - Fields not updated for Testcase ${individualTC}. Response: ${responseText}`);
            }
        } catch (error) {
            const err = error as Error;
            console.error(`Exception caught while logging: ${err.message}`);
        }
    }
}
