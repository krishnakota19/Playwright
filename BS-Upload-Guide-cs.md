# BrowserStack Upload Guide

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Configuration Setup](#configuration-setup)
- [Upload Process](#upload-process)
- [Script Logic Explained](#script-logic-explained)
- [Usage Examples](#usage-examples)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

This guide provides comprehensive information on how to upload test results to BrowserStack Test Observability platform using the automated upload system. The upload process is designed to work across different environments (QA, UAT, PROD) with configurable settin**Integration Points**:
- **Environment Detection**: Uses `this.environment` from constructor
- **Build ID Generation**: Calls `this.generateBuildId()` for unique identifiers
- **Upload Control**: Respects `this.isUploadEnabled` flag
- **Credential Management**: Uses `this.username` and `this.accessKey`

#### Upload Execution Logic
The upload execution phase handles file validation, curl command construction, and API communication with BrowserStack.

```typescript
// File validation and upload preparation
console.log(`🔍 Looking for test report at: ${config.reportPath}`);

if (!fs.existsSync(config.reportPath)) {
    console.error(`❌ Test report not found: ${config.reportPath}`);
    throw new Error(`Test report not found: ${config.reportPath}`);
}

const stats = fs.statSync(config.reportPath);
console.log(`📊 Report file size: ${stats.size} bytes`);

if (stats.size === 0) {
    console.warn('⚠️ Report file is empty!');
}

console.log(`🚀 Uploading ${config.projectName} - ${config.buildName} (${config.buildIdentifier}) for ${this.environment} environment`);

// Curl command construction
const curlCmd = process.platform === 'win32' ? 'curl.exe' : 'curl';
const command = `${curlCmd} -u "${this.username}:${this.accessKey}" -X POST ` +
    `-F "data=@${config.reportPath}" ` +
    `-F "projectName=${config.projectName}" ` +
    `-F "buildName=${config.buildName}" ` +
    `-F "buildIdentifier=${config.buildIdentifier}" ` +
    `-F "tags=${config.tags}" ` +
    `-F "ci=${config.ciUrl}" ` +
    `-F "frameworkVersion=${config.frameworkVersion}" ` +
    this.apiUrl;

// Execute upload and handle response
try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log('✅ Upload successful!');
    
    try {
        const response = JSON.parse(result);
        if (response.message) {
            const urlMatch = response.message.match(/https:\/\/automation\.browserstack\.com\/builds\/[a-zA-Z0-9]+/);
            if (urlMatch) {
                console.log(`🔗 View results: ${urlMatch[0]}`);
            }
        }
    } catch {
        console.log('📝 Response:', result);
    }
    
    return true;
} catch (error) {
    console.error('❌ Upload failed:', (error as Error).message);
    throw error;
}
```

**Execution Phase Explanation:**

1. **File Size Validation**:
   ```typescript
   const stats = fs.statSync(config.reportPath);
   console.log(`📊 Report file size: ${stats.size} bytes`);
   
   if (stats.size === 0) {
       console.warn('⚠️ Report file is empty!');
   }
   ```
   - **File Statistics**: Gets detailed file information including size
   - **Size Logging**: Reports file size for troubleshooting
   - **Empty File Warning**: Warns about empty reports (common test execution issue)
   - **Non-blocking**: Empty files trigger warning but don't stop upload

2. **Platform-Specific Curl Command**:
   ```typescript
   const curlCmd = process.platform === 'win32' ? 'curl.exe' : 'curl';
   ```
   - **Windows Compatibility**: Uses `curl.exe` on Windows systems
   - **Unix/Linux**: Uses standard `curl` command
   - **Cross-Platform**: Ensures curl works regardless of operating system

3. **HTTP Form Data Construction**:
   ```typescript
   const command = `${curlCmd} -u "${this.username}:${this.accessKey}" -X POST ` +
       `-F "data=@${config.reportPath}" ` +           // File upload
       `-F "projectName=${config.projectName}" ` +     // Project identifier
       `-F "buildName=${config.buildName}" ` +         // Build name
       `-F "buildIdentifier=${config.buildIdentifier}" ` + // Unique build ID
       `-F "tags=${config.tags}" ` +                   // Classification tags
       `-F "ci=${config.ciUrl}" ` +                    // CI/CD integration URL
       `-F "frameworkVersion=${config.frameworkVersion}" ` + // Framework info
       this.apiUrl;
   ```
   
   **Form Parameters Breakdown**:
   - **Authentication**: `-u "username:accesskey"` (Basic Auth)
   - **HTTP Method**: `-X POST` (Required by BrowserStack API)
   - **File Upload**: `-F "data=@filepath"` (Multipart form file upload)
   - **Metadata Fields**: Project, build, tags, CI URL for categorization
   - **API Endpoint**: `https://upload-automation.browserstack.com/upload`

4. **Synchronous Command Execution**:
   ```typescript
   const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
   ```
   - **Blocking Operation**: Waits for upload completion before proceeding
   - **Output Capture**: `stdio: 'pipe'` captures response for processing
   - **String Encoding**: `utf8` ensures proper text handling
   - **Error Handling**: Throws exception if curl command fails

5. **Response Processing**:
   ```typescript
   try {
       const response = JSON.parse(result);
       if (response.message) {
           const urlMatch = response.message.match(/https:\/\/automation\.browserstack\.com\/builds\/[a-zA-Z0-9]+/);
           if (urlMatch) {
               console.log(`🔗 View results: ${urlMatch[0]}`);
           }
       }
   } catch {
       console.log('📝 Response:', result);
   }
   ```
   - **JSON Parsing**: Attempts to parse BrowserStack API response
   - **URL Extraction**: Regex to find results dashboard URL
   - **Fallback Display**: Shows raw response if JSON parsing fails
   - **User Experience**: Provides direct link to view test results

**Command Example**:
```bash
curl.exe -u "username:accesskey" -X POST \
  -F "data=@./junit-test-report.xml" \
  -F "projectName=Playwright" \
  -F "buildName=qa-tests" \
  -F "buildIdentifier=main-2024-10-10T14-30-25-123Z" \
  -F "tags=playwright,automation,github-actions,ci-cd,qa" \
  -F "ci=https://github.com/owner/repo/actions/runs/123" \
  -F "frameworkVersion=playwright, 1.48.0" \
  https://upload-automation.browserstack.com/upload
```

**Upload Execution Method Sequence:**
```typescript
// Called from uploadResults() after configuration setup
console.log(`🔍 Looking for test report at: ${config.reportPath}`);
     ↓
fs.existsSync(config.reportPath) // File existence check
     ↓
fs.statSync(config.reportPath) // Get file statistics
     ↓ 
console.log(`📊 Report file size: ${stats.size} bytes`) // Log file size
     ↓
if (stats.size === 0) console.warn('⚠️ Report file is empty!') // Size validation
     ↓
console.log(`🚀 Uploading...`) // Upload start notification
     ↓
const curlCmd = process.platform === 'win32' ? 'curl.exe' : 'curl' // Platform detection
     ↓
const command = `${curlCmd} -u "..." -X POST -F "..." ${this.apiUrl}` // Command construction
     ↓
execSync(command, { encoding: 'utf8', stdio: 'pipe' }) // Execute upload
     ↓
console.log('✅ Upload successful!') // Success notification
     ↓
JSON.parse(result) // Parse API response
     ↓
response.message.match(/https:\/\/automation\.browserstack\.com\/builds\/[a-zA-Z0-9]+/) // Extract URL
     ↓
console.log(`🔗 View results: ${urlMatch[0]}`) // Display results link
     ↓
return true // Success return
```

**Error Scenarios with Method Sequence**:
- **Network Issues**: `execSync()` throws → `catch` block → `console.error()` → `throw error`
- **Authentication Errors**: `execSync()` returns error → `catch` block → error propagation
- **File Upload Errors**: `execSync()` timeout → `catch` block → error handling
- **API Rate Limits**: `execSync()` returns rate limit response → parsing handles gracefully
- **Invalid Response**: `JSON.parse()` throws → inner `catch` → `console.log('📝 Response:', result)`

#### Test Execution and Upload Logic
The `runTestsAndUpload()` method combines test execution with automatic result uploading.

```typescript
async runTestsAndUpload(testCommand: string, options: UploadOptions = {}): Promise<boolean> {
    console.log(`🧪 Running: ${testCommand}`);
    
    try {
        execSync(testCommand, { stdio: 'inherit' });
        console.log('✅ Tests completed');
    } catch {
        console.warn('⚠️ Tests had failures, uploading results anyway');
    }

    return this.uploadResults(options);
}
```

**Method Explanation:**

1. **Test Command Execution**:
   ```typescript
   execSync(testCommand, { stdio: 'inherit' });
   ```
   - **Command Flexibility**: Accepts any shell command string
   - **Real-time Output**: `stdio: 'inherit'` shows test output as it happens
   - **Blocking Execution**: Waits for tests to complete before proceeding
   - **Examples**: `npm run test:qa:sanity`, `npx playwright test --grep="smoke"`

2. **Failure-Tolerant Design**:
   ```typescript
   try {
       execSync(testCommand, { stdio: 'inherit' });
       console.log('✅ Tests completed');
   } catch {
       console.warn('⚠️ Tests had failures, uploading results anyway');
   }
   ```
   - **Continue on Test Failures**: Failed tests don't prevent upload
   - **Test Results Preservation**: Upload happens regardless of test outcome
   - **Clear Status Messaging**: Indicates whether tests passed or failed
   - **CI/CD Friendly**: Maintains workflow continuity

3. **Automatic Upload Trigger**:
   ```typescript
   return this.uploadResults(options);
   ```
   - **Seamless Integration**: Immediately uploads after test completion
   - **Option Forwarding**: Passes upload options from caller
   - **Return Value**: Boolean indicating upload success/failure

**Complete Method Invocation Sequence for `runTestsAndUpload()`:**
```
runTestsAndUpload(testCommand, options) called
     ↓
console.log(`🧪 Running: ${testCommand}`) // Log test start
     ↓
try { execSync(testCommand, { stdio: 'inherit' }) } // Execute tests
     ↓
console.log('✅ Tests completed') OR console.warn('⚠️ Tests had failures...')
     ↓
this.uploadResults(options) // Trigger upload (regardless of test outcome)
     ↓
[All uploadResults() method sequence executes here]
     ↓
return boolean result from uploadResults()
```

**Integration with Other Methods:**
- **Calls**: `execSync()` for test execution, then `this.uploadResults()` for upload
- **Called By**: CLI handler, npm scripts, or direct method invocation
- **Dependencies**: Requires `testCommand` to be valid shell command
- **Error Handling**: Test failures don't prevent upload execution

#### Static Conditional Upload Method
The static `conditionalUpload()` method provides a simple interface for one-off uploads.

```typescript
static async conditionalUpload(options: UploadOptions = {}): Promise<boolean> {
    const uploader = new ConfigurableBrowserStackUploader(options);
    return uploader.uploadResults(options);
}
```

**Method Explanation:**

1. **Static Factory Pattern**:
   - **No Instance Required**: Can be called without creating an instance
   - **Automatic Initialization**: Creates uploader instance internally
   - **Configuration Passing**: Options flow through constructor and upload method

2. **Use Case**: Ideal for simple upload scenarios where full instance management isn't needed
   ```typescript
   // Simple usage
   await ConfigurableBrowserStackUploader.conditionalUpload({
       reportPath: './my-report.xml',
       environment: 'qa'
   });
   ```

**Static Method Invocation Sequence:**
```
ConfigurableBrowserStackUploader.conditionalUpload(options) called
     ↓
const uploader = new ConfigurableBrowserStackUploader(options) // Create instance
     ↓
[Complete constructor sequence executes]
     ├── Environment resolution
     ├── loadEnvironmentConfig()
     ├── checkUploadEnabled()
     ├── Credential extraction  
     └── logConfigurationStatus()
     ↓
return uploader.uploadResults(options) // Call instance method
     ↓
[Complete uploadResults sequence executes]
     ├── Upload gate check
     ├── Credential validation
     ├── Configuration building
     ├── generateBuildId()
     ├── File validation
     └── Upload execution
     ↓
return boolean result
```

**Method Comparison:**
- **Instance Method**: `new ConfigurableBrowserStackUploader().uploadResults()`
- **Static Method**: `ConfigurableBrowserStackUploader.conditionalUpload()` (does both steps)
- **Convenience**: Static method combines instantiation + upload in one call

#### CLI Usage Logic
The script includes comprehensive command-line interface functionality for direct execution.

```typescript
// CLI detection
const isMainModule = process.argv[1] && (
    process.argv[1].endsWith('browserstack-upload.ts')
);

if (isMainModule) {
    const [command, ...args] = process.argv.slice(2);
    
    if (command === 'upload') {
        const [reportPath, projectName, buildName, environment] = args;
        const options: UploadOptions = {};
        if (reportPath) options.reportPath = reportPath;
        if (projectName) options.projectName = projectName;
        if (buildName) options.buildName = buildName;
        if (environment) options.environment = environment;
        
        ConfigurableBrowserStackUploader.conditionalUpload(options)
            .catch(err => {
                console.error('Upload failed:', err.message);
                process.exit(1);
            });
        
    } else if (command === 'test-and-upload') {
        const [testCommand = 'npm run test:qa:sanity', projectName, environment] = args;
        const options: UploadOptions = {};
        if (projectName) options.projectName = projectName;
        if (environment) options.environment = environment;
        
        const uploader = new ConfigurableBrowserStackUploader(options);
        uploader.runTestsAndUpload(testCommand, options)
            .catch(err => {
                console.error('Test and upload failed:', err.message);
                process.exit(1);
            });
    } else {
        // Display help message
        console.log(helpMessage);
    }
}
```

**CLI Logic Explanation:**

1. **Module Detection**:
   ```typescript
   const isMainModule = process.argv[1] && (
       process.argv[1].endsWith('browserstack-upload.ts')
   );
   ```
   - **Direct Execution Check**: Determines if script is run directly vs imported
   - **File Path Matching**: Checks if the executed file is the upload script
   - **Import Safety**: Prevents CLI logic from running when imported as module

2. **Command Parsing**:
   ```typescript
   const [command, ...args] = process.argv.slice(2);
   ```
   - **Command Extraction**: First argument after script name is the command
   - **Arguments Collection**: Remaining arguments collected in array
   - **Process Arguments**: `process.argv.slice(2)` skips `node` and script name

3. **Upload Command Handler**:
   ```typescript
   if (command === 'upload') {
       const [reportPath, projectName, buildName, environment] = args;
       const options: UploadOptions = {};
       if (reportPath) options.reportPath = reportPath;
       if (projectName) options.projectName = projectName;
       if (buildName) options.buildName = buildName;
       if (environment) options.environment = environment;
   ```
   - **Positional Arguments**: Maps command line arguments to options
   - **Optional Parameters**: Only sets options if arguments are provided
   - **Argument Order**: `reportPath`, `projectName`, `buildName`, `environment`
   - **Flexible Usage**: Can omit trailing arguments (uses defaults)

4. **Test-and-Upload Command Handler**:
   ```typescript
   else if (command === 'test-and-upload') {
       const [testCommand = 'npm run test:qa:sanity', projectName, environment] = args;
   ```
   - **Default Test Command**: Falls back to `npm run test:qa:sanity` if not specified
   - **Command Customization**: Allows custom test commands
   - **Simplified Parameters**: Fewer options than upload command

5. **Error Handling and Process Management**:
   ```typescript
   .catch(err => {
       console.error('Upload failed:', err.message);
       process.exit(1);
   });
   ```
   - **Error Display**: Shows user-friendly error messages
   - **Exit Code**: Returns non-zero exit code for CI/CD systems
   - **Process Termination**: Ensures proper script completion

**CLI Usage Examples**:

```bash
# Basic upload (uses defaults)
npx ts-node scripts/browserstack-upload.ts upload

# Upload with custom report path
npx ts-node scripts/browserstack-upload.ts upload "./custom-report.xml"

# Upload with all parameters
npx ts-node scripts/browserstack-upload.ts upload \
  "./junit-test-report.xml" \
  "My Project" \
  "Build 123" \
  "qa"

# Test and upload with default test command
npx ts-node scripts/browserstack-upload.ts test-and-upload

# Test and upload with custom command
npx ts-node scripts/browserstack-upload.ts test-and-upload \
  "npm run test:smoke" \
  "Smoke Tests" \
  "uat"

# Display help
npx ts-node scripts/browserstack-upload.ts help
```

**Integration with Package.json Scripts**:
```json
{
  "scripts": {
    "upload:browserstack:qa": "cross-env TEST_ENV=qa npx ts-node scripts/browserstack-upload.ts upload",
    "test:upload:sanity": "npx ts-node scripts/browserstack-upload.ts test-and-upload \"npm run test:qa:sanity\" \"QA Sanity Tests\"",
    "test:upload:smoke": "npx ts-node scripts/browserstack-upload.ts test-and-upload \"npm run test:qa:smoke\" \"QA Smoke Tests\""
  }
}
```

This comprehensive CLI interface provides flexibility for both manual usage and automated CI/CD integration while maintaining consistency with the programmatic API.d conditional upload capabilities.

### Key Features
- **Environment-specific configuration**: Different settings for QA, UAT, and PROD environments
- **Conditional upload**: Upload can be enabled/disabled per environment
- **Automated test result upload**: Supports JUnit XML format reports
- **CI/CD integration**: Works seamlessly with GitHub Actions and other CI systems
- **Comprehensive logging**: Detailed status information and error handling

## Prerequisites

### 1. BrowserStack Account Setup
- Active BrowserStack account with Test Observability access
- BrowserStack username and access key
- Project configured in BrowserStack dashboard

### 2. Environment Variables
Set the following environment variables or add them to your `.env` files:
```bash
BROWSERSTACK_USERNAME=your_browserstack_username
BROWSERSTACK_ACCESS_KEY=your_browserstack_access_key
TEST_ENV=qa  # or uat, prod
```

### 3. Dependencies
Ensure the following dependencies are installed:
```bash
npm install browserstack-node-sdk dotenv cross-env typescript ts-node
```

## Configuration Setup

### 1. BrowserStack Configuration File
The main configuration is stored in `browserstack .yml`:

```yaml
# Credentials (can also be set via environment variables)
userName: your_username
accessKey: your_access_key

# Project Information
projectName: Playwright
buildName: Web
buildIdentifier: "${DATE_TIME}"

# Platform Configuration
platforms:
  - os: Windows
    osVersion: 11
    browserName: chrome
    browserVersion: latest

# Settings
browserstackLocal: true
testObservability: true
debug: false
networkLogs: false
consoleLogs: errors
```

### 2. Environment-specific Configuration
Each environment has its own configuration file in `config/proj/`:

#### QA Environment (`.env.qa`)
```bash
# BrowserStack upload control
BS_UPLOAD=true
```

#### UAT Environment (`.env.uat`)
```bash
# BrowserStack upload control
BS_UPLOAD=false
```

#### PROD Environment (`.env.prod`)
```bash
# BrowserStack upload control
BS_UPLOAD=false
```

## Upload Process

### Step-by-Step Upload Process

#### Step 1: Environment Detection
1. The script determines the target environment from:
   - Command line argument
   - `TEST_ENV` environment variable
   - Defaults to 'qa'

#### Step 2: Configuration Loading
1. Loads environment-specific configuration from `config/proj/.env.{environment}`
2. Reads `BS_UPLOAD` flag to determine if upload is enabled
3. Loads BrowserStack credentials from environment variables

#### Step 3: Validation
1. Checks if upload is enabled for the current environment
2. Validates BrowserStack credentials are present
3. Verifies test report file exists and is not empty

#### Step 4: Build Information Generation
1. Generates unique build identifier with timestamp
2. Attempts to get Git branch name for build tracking
3. Sets appropriate tags based on execution context (CI/local)

#### Step 5: Upload Execution
1. Constructs curl command with all required parameters
2. Uploads JUnit XML report to BrowserStack Test Observability API
3. Parses response and extracts results URL
4. Provides success/failure feedback with detailed logging

#### Step 6: Results Reporting
1. Displays upload status and any error messages
2. Provides direct link to view results in BrowserStack dashboard
3. Logs execution details for debugging

### Upload Flow Diagram
```
Start → Environment Detection → Load Config → Check BS_UPLOAD Flag
   ↓
   ├─ If BS_UPLOAD=false → Skip Upload (Success)
   ↓
   ├─ If BS_UPLOAD=true → Validate Credentials
   ↓
   ├─ Check Report File → Generate Build Info → Execute Upload
   ↓
   └─ Parse Response → Display Results → End
```

### Method Invocation Sequence

#### Complete Upload Process Method Call Chain
```
1. new ConfigurableBrowserStackUploader(options)
   ├── this.environment = options.environment || process.env.TEST_ENV || 'qa'
   ├── this.loadEnvironmentConfig()
   │   ├── path.join(__dirname, '..', 'config', 'proj', `.env.${this.environment}`)
   │   ├── fs.existsSync(configPath)
   │   └── dotenv.config({ path: configPath })
   ├── this.isUploadEnabled = this.checkUploadEnabled()
   │   ├── process.env.BS_UPLOAD
   │   └── bsUpload.toLowerCase() === 'true'
   ├── this.username = process.env.BROWSERSTACK_USERNAME || ''
   ├── this.accessKey = process.env.BROWSERSTACK_ACCESS_KEY || ''
   └── this.logConfigurationStatus()

2. uploadResults(options)
   ├── if (!this.isUploadEnabled) return true
   ├── if (!this.username || !this.accessKey) throw Error
   ├── config = { reportPath, projectName, buildName, ... }
   │   └── buildIdentifier: this.generateBuildId()
   │       ├── new Date().toISOString().replace(/[:.]/g, '-')
   │       ├── execSync('git rev-parse --abbrev-ref HEAD')
   │       └── return `${branch}-${timestamp}` || `local-${timestamp}`
   ├── fs.existsSync(config.reportPath)
   ├── fs.statSync(config.reportPath)
   ├── execSync(curlCommand)
   ├── JSON.parse(result)
   └── return true || throw error

3. runTestsAndUpload(testCommand, options) [Optional]
   ├── execSync(testCommand, { stdio: 'inherit' })
   └── this.uploadResults(options)

4. ConfigurableBrowserStackUploader.conditionalUpload(options) [Static]
   ├── new ConfigurableBrowserStackUploader(options)
   └── uploader.uploadResults(options)
```

#### CLI Invocation Sequence
```
CLI Command: npx ts-node scripts/browserstack-upload.ts upload [args...]
   ↓
1. Script Execution Check
   ├── process.argv[1].endsWith('browserstack-upload.ts')
   └── isMainModule = true

2. Command Parsing
   ├── const [command, ...args] = process.argv.slice(2)
   └── command === 'upload' || 'test-and-upload'

3a. Upload Command Flow
   ├── const [reportPath, projectName, buildName, environment] = args
   ├── options = { reportPath?, projectName?, buildName?, environment? }
   └── ConfigurableBrowserStackUploader.conditionalUpload(options)

3b. Test-and-Upload Command Flow
   ├── const [testCommand, projectName, environment] = args
   ├── options = { projectName?, environment? }
   ├── new ConfigurableBrowserStackUploader(options)
   └── uploader.runTestsAndUpload(testCommand, options)

4. Error Handling
   ├── .catch(err => console.error('Upload failed:', err.message))
   └── process.exit(1)
```

## Script Logic Explained

### ConfigurableBrowserStackUploader Class

#### Constructor Logic
The constructor initializes the `ConfigurableBrowserStackUploader` class with all necessary configuration and performs initial setup validation.

```typescript
constructor(options: UploadOptions = {}) {
    // 1. Determine environment (priority: options > env var > default)
    this.environment = options.environment || process.env.TEST_ENV || 'qa';
    
    // 2. Load environment-specific configuration
    this.loadEnvironmentConfig();
    
    // 3. Check if upload is enabled for this environment
    this.isUploadEnabled = this.checkUploadEnabled();
    
    // 4. Set credentials from environment variables
    this.username = process.env.BROWSERSTACK_USERNAME || '';
    this.accessKey = process.env.BROWSERSTACK_ACCESS_KEY || '';
    
    // 5. Log configuration status for debugging
    this.logConfigurationStatus();
}
```

**Constructor Explanation:**

1. **Environment Determination with Priority Chain**:
   ```typescript
   this.environment = options.environment || process.env.TEST_ENV || 'qa';
   ```
   - **Highest Priority**: `options.environment` (passed directly to constructor)
   - **Medium Priority**: `process.env.TEST_ENV` (system environment variable)
   - **Lowest Priority**: `'qa'` (default fallback)
   - **Use Cases**:
     - Direct instantiation: `new ConfigurableBrowserStackUploader({ environment: 'uat' })`
     - Environment variable: `export TEST_ENV=prod`
     - Default behavior: Automatically uses QA environment for safety

2. **Sequential Configuration Loading**:
   ```typescript
   this.loadEnvironmentConfig();
   ```
   - Loads environment-specific settings from `.env.{environment}` files
   - Must occur after environment determination but before other validations
   - Sets up variables like `BS_UPLOAD`, API endpoints, timeouts, etc.
   - **Dependencies**: Requires `this.environment` to be set first

3. **Upload Control Validation**:
   ```typescript
   this.isUploadEnabled = this.checkUploadEnabled();
   ```
   - Determines if uploads are enabled for the current environment
   - Reads `BS_UPLOAD` variable loaded in previous step
   - **Safety Feature**: Prevents accidental uploads to production environments
   - **Result**: Boolean flag used throughout the class lifecycle

4. **Credential Initialization**:
   ```typescript
   this.username = process.env.BROWSERSTACK_USERNAME || '';
   this.accessKey = process.env.BROWSERSTACK_ACCESS_KEY || '';
   ```
   - Extracts BrowserStack credentials from environment variables
   - Uses empty strings as fallback (validation happens later in upload methods)
   - **Security**: Credentials never hardcoded, always from environment
   - **Flexibility**: Can be set in system environment or `.env` files

5. **Diagnostic Logging**:
   ```typescript
   this.logConfigurationStatus();
   ```
   - Provides immediate feedback about the configuration state
   - Helps with debugging configuration issues
   - Shows environment, upload status, and credential availability
   - **Output Example**:
     ```
     🔧 BrowserStack Upload Configuration:
        Environment: qa
        Upload Enabled: true
        Username Set: true
        Access Key Set: true
     ```

**Initialization Flow with Method Invocations:**
```
Constructor Called
       ↓
1. Environment Resolution
   │   this.environment = options.environment || process.env.TEST_ENV || 'qa'
       ↓
2. Load Environment Config
   │   this.loadEnvironmentConfig()
   │   ├── path.join(__dirname, '..', 'config', 'proj', `.env.${this.environment}`)
   │   ├── fs.existsSync(configPath)
   │   └── dotenv.config({ path: configPath }) → loads BS_UPLOAD, etc.
       ↓
3. Check Upload Enable Status
   │   this.isUploadEnabled = this.checkUploadEnabled()
   │   ├── const bsUpload = process.env.BS_UPLOAD
   │   └── return bsUpload.toLowerCase() === 'true'
       ↓
4. Extract Credentials
   │   this.username = process.env.BROWSERSTACK_USERNAME || ''
   │   this.accessKey = process.env.BROWSERSTACK_ACCESS_KEY || ''
       ↓
5. Log Configuration Status
   │   this.logConfigurationStatus()
   │   └── console.log configuration summary
       ↓
Instance Ready for Use
```

**Method Dependency Chain:**
- `constructor()` → `loadEnvironmentConfig()` → `checkUploadEnabled()` → `logConfigurationStatus()`
- `uploadResults()` → `generateBuildId()` → `execSync(git)` → `execSync(curl)`
- `runTestsAndUpload()` → `execSync(testCommand)` → `uploadResults()`
- `conditionalUpload()` → `new ConfigurableBrowserStackUploader()` → `uploadResults()`

**Error Scenarios Handled:**
- **Missing Environment Files**: Graceful degradation with warnings
- **Missing Credentials**: Empty strings (validated later during upload)
- **Invalid Environment**: Falls back to 'qa' environment
- **Configuration Conflicts**: Priority chain resolves ambiguity

**Best Practices Implemented:**
- **Fail-Safe Defaults**: Always defaults to QA environment for safety
- **Clear Priority Chain**: Explicit precedence for configuration sources
- **Early Validation**: Checks configuration during initialization
- **Comprehensive Logging**: Provides visibility into configuration state

#### Environment Configuration Loading
The `loadEnvironmentConfig()` method is responsible for dynamically loading environment-specific configuration files and making their variables available to the application.

```typescript
private loadEnvironmentConfig(): void {
    const configPath = path.join(__dirname, '..', 'config', 'proj', `.env.${this.environment}`);
    
    if (fs.existsSync(configPath)) {
        console.log(`📄 Loading configuration from: ${configPath}`);
        dotenv.config({ path: configPath });
    } else {
        console.warn(`⚠️ Configuration file not found: ${configPath}`);
    }
}
```

**Method Explanation:**

1. **Dynamic Path Construction**:
   ```typescript
   const configPath = path.join(__dirname, '..', 'config', 'proj', `.env.${this.environment}`);
   ```
   - Uses `path.join()` to construct platform-independent file paths
   - Navigates from the current script directory (`__dirname`) up one level (`..`)
   - Builds path to environment-specific configuration: `config/proj/.env.{environment}`
   - Example paths:
     - QA: `config/proj/.env.qa`
     - UAT: `config/proj/.env.uat`
     - PROD: `config/proj/.env.prod`

2. **File Existence Validation**:
   ```typescript
   if (fs.existsSync(configPath)) {
   ```
   - Checks if the configuration file exists before attempting to load it
   - Prevents runtime errors from missing configuration files
   - Uses synchronous file system check for immediate validation

3. **Configuration Loading**:
   ```typescript
   dotenv.config({ path: configPath });
   ```
   - Uses the `dotenv` library to parse and load environment variables
   - Loads variables from the specified file path into `process.env`
   - Variables become immediately available to the application
   - Example variables loaded: `BS_UPLOAD`, database connections, API endpoints

4. **Error Handling and Logging**:
   ```typescript
   console.log(`📄 Loading configuration from: ${configPath}`);
   // vs
   console.warn(`⚠️ Configuration file not found: ${configPath}`);
   ```
   - Provides clear feedback about configuration loading status
   - Success: Logs the exact file path being loaded
   - Failure: Warns about missing configuration but doesn't crash the application
   - Uses descriptive emojis for visual distinction in logs

**Configuration File Structure Example:**
```bash
# .env.qa file content
BS_UPLOAD=true
API_BASE_URL=https://qa-api.example.com
DATABASE_CONNECTION=qa-database-url
TIMEOUT_SECONDS=30
RETRY_ATTEMPTS=3
```

**Loading Sequence with Method Calls:**
1. **Environment Detection** 
   ```typescript
   // Called from constructor: this.environment already set
   // Used in: `.env.${this.environment}`
   ```

2. **Path Construction**
   ```typescript
   const configPath = path.join(__dirname, '..', 'config', 'proj', `.env.${this.environment}`);
   // Example result: '/project/config/proj/.env.qa'
   ```

3. **File Validation**
   ```typescript
   if (fs.existsSync(configPath)) {
       // File exists, proceed to load
   } else {
       // File missing, log warning but continue
   }
   ```

4. **Variable Loading**
   ```typescript
   dotenv.config({ path: configPath });
   // Loads variables like BS_UPLOAD=true into process.env
   ```

5. **Status Logging**
   ```typescript
   console.log(`📄 Loading configuration from: ${configPath}`);
   // OR
   console.warn(`⚠️ Configuration file not found: ${configPath}`);
   ```

**Invocation Context:**
- **Called By**: `constructor()` during instance initialization
- **Call Order**: Second step in constructor (after environment resolution)
- **Side Effects**: Modifies `process.env` with loaded variables
- **Next Step**: `checkUploadEnabled()` reads loaded `process.env.BS_UPLOAD`

**Error Recovery:**
- If the configuration file is missing, the method logs a warning but continues execution
- The application falls back to default values or environment variables already set
- This graceful degradation ensures the upload process doesn't fail due to missing config files

**Usage Impact:**
After this method executes, environment variables like `BS_UPLOAD` become available via `process.env.BS_UPLOAD`, which is then used by other methods like `checkUploadEnabled()` to control the upload behavior.

#### Upload Enable/Disable Logic
The `checkUploadEnabled()` method implements a safety mechanism to control when BrowserStack uploads should occur based on environment configuration.

```typescript
private checkUploadEnabled(): boolean {
    const bsUpload = process.env.BS_UPLOAD;
    
    if (bsUpload === undefined) {
        console.warn('⚠️ BS_UPLOAD not defined in environment configuration, defaulting to false');
        return false;
    }
    
    return bsUpload.toLowerCase() === 'true';
}
```

**Method Explanation:**

1. **Environment Variable Extraction**:
   ```typescript
   const bsUpload = process.env.BS_UPLOAD;
   ```
   - Retrieves the `BS_UPLOAD` flag from the environment
   - This variable is loaded from the environment-specific `.env` files
   - **Source Chain**: `.env.{environment}` file → `loadEnvironmentConfig()` → `process.env.BS_UPLOAD`

2. **Undefined Value Handling**:
   ```typescript
   if (bsUpload === undefined) {
       console.warn('⚠️ BS_UPLOAD not defined in environment configuration, defaulting to false');
       return false;
   }
   ```
   - **Safety First Approach**: If `BS_UPLOAD` is not defined, upload is disabled
   - **Explicit Warning**: Clear message indicating why upload is disabled
   - **Prevents Accidents**: Avoids unintended uploads when configuration is incomplete
   - **Use Cases**:
     - Missing `.env` file
     - Corrupted configuration file
     - New environment setup without proper configuration

3. **String-to-Boolean Conversion**:
   ```typescript
   return bsUpload.toLowerCase() === 'true';
   ```
   - **Case-Insensitive Matching**: Handles 'TRUE', 'True', 'true', etc.
   - **Strict Boolean Logic**: Only 'true' (case-insensitive) enables upload
   - **All Other Values Disable Upload**: 'false', '0', 'no', undefined, etc.

**Configuration Examples:**

| Environment File | BS_UPLOAD Value | Result | Reason |
|-----------------|----------------|--------|--------|
| `.env.qa` | `BS_UPLOAD=true` | ✅ Enabled | QA environment, safe to upload |
| `.env.uat` | `BS_UPLOAD=false` | ❌ Disabled | UAT environment, uploads disabled |
| `.env.prod` | `BS_UPLOAD=false` | ❌ Disabled | Production environment, uploads disabled |
| Missing file | `undefined` | ❌ Disabled | Safety fallback, prevents accidents |
| `.env.qa` | `BS_UPLOAD=TRUE` | ✅ Enabled | Case-insensitive matching |
| `.env.qa` | `BS_UPLOAD=1` | ❌ Disabled | Only 'true' string enables upload |

**Safety Features:**

1. **Conservative Default**: Always defaults to disabled state
2. **Explicit Configuration Required**: Must explicitly set `BS_UPLOAD=true`
3. **Case Tolerance**: Handles various capitalizations of 'true'
4. **Clear Feedback**: Warning messages explain why uploads are disabled

**Integration with Upload Flow and Method Sequence:**
```typescript
async uploadResults(options: UploadOptions = {}): Promise<boolean> {
    // Step 1: Check upload gate (uses result from constructor)
    if (!this.isUploadEnabled) {  // ← Uses this.checkUploadEnabled() result
        console.log('⏭️ BrowserStack upload is disabled in environment configuration. Skipping upload.');
        return true; // Doesn't fail the workflow
    }
    // ... rest of upload logic
}
```

**Method Call Sequence in Upload Context:**
1. **Constructor Phase**: `checkUploadEnabled()` called and result stored in `this.isUploadEnabled`
2. **Upload Phase**: `uploadResults()` reads the stored boolean value
3. **No Re-evaluation**: Method is not called again during upload (cached result used)

**Dependency Flow:**
```
constructor() → loadEnvironmentConfig() → process.env.BS_UPLOAD available
     ↓
checkUploadEnabled() → reads process.env.BS_UPLOAD → returns boolean
     ↓
this.isUploadEnabled = boolean result (cached)
     ↓
uploadResults() → checks this.isUploadEnabled (no method call)
```

**Environment-Specific Behavior:**
- **QA Environment**: Typically `BS_UPLOAD=true` for continuous integration
- **UAT Environment**: Usually `BS_UPLOAD=false` to avoid test noise
- **PROD Environment**: Always `BS_UPLOAD=false` for security and compliance
- **Local Development**: Configurable based on developer needs

**Troubleshooting Guide:**
- **Issue**: "Upload disabled" message appears unexpectedly
- **Check**: Verify `BS_UPLOAD=true` in the correct `.env.{environment}` file
- **Validate**: Ensure environment detection is working (`TEST_ENV` variable)
- **Debug**: Check console logs for configuration loading messages

#### Build ID Generation Logic
The `generateBuildId()` method creates unique identifiers for each test run upload, enabling proper tracking and organization in BrowserStack dashboard.

```typescript
private generateBuildId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    try {
        // Try to get Git branch name
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
        return `${branch}-${timestamp}`;
    } catch {
        // Fallback to local identifier
        return `local-${timestamp}`;
    }
}
```

**Method Explanation:**

1. **Timestamp Generation**:
   ```typescript
   const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
   ```
   - **ISO Format**: `new Date().toISOString()` produces format: `2024-10-10T14:30:25.123Z`
   - **Sanitization**: `replace(/[:.]/g, '-')` converts to: `2024-10-10T14-30-25-123Z`
   - **Why Sanitize**: Colons and periods can cause issues in file systems and URLs
   - **Uniqueness**: Millisecond precision ensures no duplicate build IDs
   - **Timezone**: Always UTC (Z suffix) for consistency across environments

2. **Git Branch Detection**:
   ```typescript
   const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
   ```
   - **Git Command**: `git rev-parse --abbrev-ref HEAD` gets current branch name
   - **Synchronous Execution**: `execSync()` waits for command completion
   - **String Processing**: 
     - `encoding: 'utf8'` ensures proper string encoding
     - `.trim()` removes trailing newlines and whitespace
   - **Branch Examples**: `main`, `develop`, `feature/login-fix`, `hotfix/security-patch`

3. **Error Handling with Graceful Degradation**:
   ```typescript
   try {
       // Git operation
       return `${branch}-${timestamp}`;
   } catch {
       // Fallback to local identifier
       return `local-${timestamp}`;
   }
   ```
   - **Try Block**: Attempts Git branch detection
   - **Catch Block**: Handles any Git-related errors silently
   - **No Error Propagation**: Doesn't fail the entire upload process
   - **Fallback Strategy**: Uses 'local' prefix when Git is unavailable

**Build ID Format Examples:**

| Scenario | Git Available | Branch Name | Generated Build ID |
|----------|---------------|-------------|-------------------|
| CI/CD Pipeline | ✅ | `main` | `main-2024-10-10T14-30-25-123Z` |
| Feature Branch | ✅ | `feature/user-auth` | `feature-user-auth-2024-10-10T14-30-25-123Z` |
| Local Development | ✅ | `develop` | `develop-2024-10-10T14-30-25-123Z` |
| Docker Container | ❌ | N/A | `local-2024-10-10T14-30-25-123Z` |
| ZIP Deployment | ❌ | N/A | `local-2024-10-10T14-30-25-123Z` |

**Error Scenarios Handled:**

1. **Git Not Installed**: Falls back to 'local' prefix
2. **Not a Git Repository**: Command fails, uses fallback
3. **Detached HEAD State**: May return commit hash or fail, uses fallback
4. **Permissions Issues**: Git command fails, uses fallback
5. **Corrupted Repository**: Git errors are caught and handled

**BrowserStack Integration:**
```typescript
const config = {
    buildIdentifier: this.generateBuildId(), // ← Used here
    // ... other config
};
```

**Benefits for Test Management:**

1. **Traceability**: Links test results to specific code branches
2. **Organization**: Groups related test runs together
3. **Debugging**: Easy identification of which branch caused issues
4. **Historical Tracking**: Timeline of test results across branches
5. **CI/CD Integration**: Correlates with build pipeline information

**Branch Name Sanitization:**
- **Forward Slashes**: `feature/login` becomes part of the ID as-is
- **Special Characters**: Git branch names are generally URL-safe
- **Length Limits**: Very long branch names are preserved (BrowserStack handles truncation)

**Timestamp Precision:**
- **Millisecond Level**: Prevents collisions in rapid test executions
- **UTC Timezone**: Consistent across global CI/CD systems
- **Sortable Format**: ISO format enables chronological sorting

**Usage in BrowserStack Dashboard:**
- **Build Grouping**: All tests with same build ID are grouped together
- **Search Functionality**: Can search by branch name or timestamp
- **Filtering**: Easy filtering by environment or time period
- **Trend Analysis**: Historical view of test results per branch

#### Upload Configuration Logic
The `uploadResults()` method is the core upload functionality that handles validation, configuration, and execution of the BrowserStack upload process.

```typescript
async uploadResults(options: UploadOptions = {}): Promise<boolean> {
    // 1. Check if upload is enabled
    if (!this.isUploadEnabled) {
        console.log('⏭️ BrowserStack upload is disabled in environment configuration. Skipping upload.');
        return true; // Return true to not break the workflow
    }

    // 2. Validate credentials
    if (!this.username || !this.accessKey) {
        console.error('❌ BrowserStack credentials required: BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY');
        throw new Error('BrowserStack credentials required: BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY');
    }

    // 3. Configure upload parameters
    const config = {
        reportPath: options.reportPath || './junit-test-report.xml',
        projectName: options.projectName || 'Playwright',
        buildName: options.buildName || process.env.BUILD_NAME || `${this.environment}-tests`,
        buildIdentifier: this.generateBuildId(),
        tags: process.env.GITHUB_ACTIONS ? 
            `playwright,automation,github-actions,ci-cd,${this.environment}` : 
            `playwright,automation,local,${this.environment}`,
        frameworkVersion: 'playwright, 1.48.0',
        ciUrl: process.env.GITHUB_SERVER_URL ? 
            `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : 
            'http://localhost:8080/'
    };

    // 4. Validate report file
    if (!fs.existsSync(config.reportPath)) {
        console.error(`❌ Test report not found: ${config.reportPath}`);
        throw new Error(`Test report not found: ${config.reportPath}`);
    }

    // 5. Execute upload
    // ... [See Upload Execution Logic section below for details]
}
```

**Method Explanation:**

1. **Upload Gate Control**:
   ```typescript
   if (!this.isUploadEnabled) {
       console.log('⏭️ BrowserStack upload is disabled in environment configuration. Skipping upload.');
       return true; // Return true to not break the workflow
   }
   ```
   - **First Line of Defense**: Checks if uploads are allowed for current environment
   - **Graceful Skip**: Returns `true` instead of failing to maintain CI/CD pipeline flow
   - **Clear Messaging**: Informative log explains why upload was skipped
   - **Workflow Continuity**: Prevents environment configuration from breaking automated processes

2. **Credential Validation**:
   ```typescript
   if (!this.username || !this.accessKey) {
       console.error('❌ BrowserStack credentials required: BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY');
       throw new Error('BrowserStack credentials required: BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY');
   }
   ```
   - **Security Check**: Ensures both username and access key are present
   - **Early Failure**: Fails fast if credentials are missing (after upload is enabled)
   - **Clear Error Message**: Specifies exactly which environment variables are needed
   - **Throws Exception**: Unlike upload gate, this is a configuration error that should fail

3. **Dynamic Configuration Building**:
   
   **Report Path Resolution**:
   ```typescript
   reportPath: options.reportPath || './junit-test-report.xml'
   ```
   - **Priority**: Method parameter > Default path
   - **Default Location**: Assumes JUnit report in project root
   - **Flexibility**: Allows custom report paths for different test suites

   **Project Name Configuration**:
   ```typescript
   projectName: options.projectName || 'Playwright'
   ```
   - **Override Capable**: Can be customized per upload
   - **Default**: Uses consistent project identifier
   - **BrowserStack Integration**: Maps to BrowserStack project dashboard

   **Build Name Strategy**:
   ```typescript
   buildName: options.buildName || process.env.BUILD_NAME || `${this.environment}-tests`
   ```
   - **Three-Tier Priority**:
     1. Method parameter (highest)
     2. Environment variable (`BUILD_NAME`)
     3. Generated from environment (fallback)
   - **CI/CD Friendly**: `BUILD_NAME` typically set in CI systems
   - **Descriptive Fallback**: `qa-tests`, `uat-tests`, etc.

   **Tag Generation Logic**:
   ```typescript
   tags: process.env.GITHUB_ACTIONS ? 
       `playwright,automation,github-actions,ci-cd,${this.environment}` : 
       `playwright,automation,local,${this.environment}`
   ```
   - **Context Detection**: Automatically detects GitHub Actions environment
   - **CI Tags**: `playwright,automation,github-actions,ci-cd,qa`
   - **Local Tags**: `playwright,automation,local,qa`
   - **Filtering Support**: Tags enable filtering in BrowserStack dashboard

   **CI URL Construction**:
   ```typescript
   ciUrl: process.env.GITHUB_SERVER_URL ? 
       `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : 
       'http://localhost:8080/'
   ```
   - **GitHub Actions Integration**: 
     - `GITHUB_SERVER_URL`: `https://github.com`
     - `GITHUB_REPOSITORY`: `owner/repo-name`
     - `GITHUB_RUN_ID`: `1234567890`
     - **Result**: `https://github.com/owner/repo-name/actions/runs/1234567890`
   - **Local Fallback**: Generic localhost URL for local development
   - **Traceability**: Links BrowserStack results back to CI/CD run

4. **Report File Validation**:
   ```typescript
   if (!fs.existsSync(config.reportPath)) {
       console.error(`❌ Test report not found: ${config.reportPath}`);
       throw new Error(`Test report not found: ${config.reportPath}`);
   }
   ```
   - **File Existence Check**: Ensures report file exists before upload attempt
   - **Path Verification**: Uses the resolved report path from configuration
   - **Early Detection**: Catches missing reports before expensive upload operation
   - **Descriptive Error**: Shows exact path that was expected

**Configuration Object Example**:
```javascript
// GitHub Actions Environment
{
    reportPath: './junit-test-report.xml',
    projectName: 'Playwright',
    buildName: 'PR-123-validation',
    buildIdentifier: 'main-2024-10-10T14-30-25-123Z',
    tags: 'playwright,automation,github-actions,ci-cd,qa',
    frameworkVersion: 'playwright, 1.48.0',
    ciUrl: 'https://github.com/Banking-Solutions-Digital/dlfics-web_playwright/actions/runs/1234567890'
}

// Local Development Environment
{
    reportPath: './junit-test-report.xml',
    projectName: 'Playwright',
    buildName: 'qa-tests',
    buildIdentifier: 'develop-2024-10-10T14-30-25-123Z',
    tags: 'playwright,automation,local,qa',
    frameworkVersion: 'playwright, 1.48.0',
    ciUrl: 'http://localhost:8080/'
}
```

**Error Handling Strategy**:
- **Configuration Errors**: Throw exceptions (missing credentials, missing files)
- **Environment Errors**: Graceful degradation (upload disabled)
- **Network Errors**: Handled in upload execution phase
- **File Errors**: Early detection with clear error messages

**Integration Points**:
- **Environment Detection**: Uses `this.environment` from constructor
- **Build ID Generation**: Calls `this.generateBuildId()` for unique identifiers
- **Upload Control**: Respects `this.isUploadEnabled` flag
- **Credential Management**: Uses `this.username` and `this.accessKey`

## Usage Examples

### Method Invocation Sequences for Common Use Cases

### 1. Direct Upload Command

#### Basic Upload (Default Settings)
```bash
npm run upload:browserstack:qa
```
**Complete Method Invocation Sequence:**
```
1. npm script execution
   └── cross-env TEST_ENV=qa npx ts-node scripts/browserstack-upload.ts upload

2. CLI argument parsing
   ├── process.argv = ['node', 'script.ts', 'upload']
   ├── command = 'upload'
   └── args = []

3. Static method call
   └── ConfigurableBrowserStackUploader.conditionalUpload({})

4. Instance creation and upload
   ├── new ConfigurableBrowserStackUploader({})
   │   ├── this.environment = process.env.TEST_ENV || 'qa' // 'qa' from cross-env
   │   ├── this.loadEnvironmentConfig() // Loads config/proj/.env.qa
   │   ├── this.checkUploadEnabled() // Reads BS_UPLOAD=true
   │   └── this.logConfigurationStatus()
   └── uploader.uploadResults({})
       ├── config.reportPath = './junit-test-report.xml' // default
       ├── this.generateBuildId() // Creates unique identifier
       ├── fs.existsSync(reportPath) // Validates file exists
       └── execSync(curlCommand) // Uploads to BrowserStack
```

#### Upload with Custom Report File
```bash
npx ts-node scripts/browserstack-upload.ts upload "./custom-report.xml"
```
**Method Invocation Sequence:**
```
1. CLI parsing: args = ['./custom-report.xml']
2. Options building: options = { reportPath: './custom-report.xml' }
3. conditionalUpload(options)
   └── uploadResults({ reportPath: './custom-report.xml' })
       ├── config.reportPath = './custom-report.xml' // from options
       └── [rest of upload sequence with custom path]
```

#### Upload with All Parameters
```bash
npx ts-node scripts/browserstack-upload.ts upload "./junit-test-report.xml" "My Project" "Build 1" "qa"
```
**Method Invocation Sequence:**
```
1. CLI parsing: args = ['./junit-test-report.xml', 'My Project', 'Build 1', 'qa']
2. Options building:
   ├── options.reportPath = './junit-test-report.xml'
   ├── options.projectName = 'My Project'
   ├── options.buildName = 'Build 1'
   └── options.environment = 'qa'
3. conditionalUpload(options)
   ├── new ConfigurableBrowserStackUploader({ environment: 'qa' })
   │   └── this.loadEnvironmentConfig() // Loads .env.qa
   └── uploadResults(options)
       ├── config.projectName = 'My Project' // overrides default
       ├── config.buildName = 'Build 1' // overrides default
       └── [upload execution with custom values]
```

### 2. Test and Upload Combined

#### Sanity Tests with Upload
```bash
npm run test:upload:sanity
```
**Complete Method Invocation Sequence:**
```
1. npm script execution
   └── npx ts-node scripts/browserstack-upload.ts test-and-upload "npm run test:qa:sanity" "QA Sanity Tests"

2. CLI argument parsing
   ├── command = 'test-and-upload'
   ├── testCommand = 'npm run test:qa:sanity'
   └── projectName = 'QA Sanity Tests'

3. Instance creation and test execution
   ├── new ConfigurableBrowserStackUploader({ projectName: 'QA Sanity Tests' })
   │   ├── this.environment = process.env.TEST_ENV || 'qa'
   │   ├── this.loadEnvironmentConfig() // Loads .env.qa
   │   ├── this.checkUploadEnabled() // Checks BS_UPLOAD
   │   └── this.logConfigurationStatus()
   └── uploader.runTestsAndUpload('npm run test:qa:sanity', options)
       ├── console.log('🧪 Running: npm run test:qa:sanity')
       ├── execSync('npm run test:qa:sanity', { stdio: 'inherit' }) // Run tests
       ├── console.log('✅ Tests completed') // Or warning if failures
       └── this.uploadResults(options)
           ├── config.projectName = 'QA Sanity Tests' // from options
           ├── this.generateBuildId() // Generate unique ID
           └── execSync(curlCommand) // Upload results
```

#### Custom Test Command with Upload
```bash
npx ts-node scripts/browserstack-upload.ts test-and-upload "npm run test:custom" "Custom Tests" "qa"
```
**Method Invocation Sequence:**
```
1. CLI parsing: 
   ├── testCommand = 'npm run test:custom'
   ├── projectName = 'Custom Tests'
   └── environment = 'qa'

2. Options building:
   ├── options.projectName = 'Custom Tests'
   └── options.environment = 'qa'

3. Instance and execution:
   ├── new ConfigurableBrowserStackUploader({ projectName: 'Custom Tests', environment: 'qa' })
   │   ├── this.environment = 'qa' // from options
   │   └── this.loadEnvironmentConfig() // Loads .env.qa specifically
   └── runTestsAndUpload('npm run test:custom', options)
       ├── execSync('npm run test:custom') // Execute custom test command
       └── uploadResults({ projectName: 'Custom Tests' })
           └── config.projectName = 'Custom Tests' // used in upload
```

### 3. Environment-specific Uploads
```bash
# QA environment (upload enabled)
cross-env TEST_ENV=qa npx ts-node scripts/browserstack-upload.ts upload

# UAT environment (upload disabled by default)
cross-env TEST_ENV=uat npx ts-node scripts/browserstack-upload.ts upload

# PROD environment (upload disabled by default)
cross-env TEST_ENV=prod npx ts-node scripts/browserstack-upload.ts upload
```

### 4. Programmatic Usage

#### Instance-Based Upload
```typescript
import ConfigurableBrowserStackUploader from './scripts/browserstack-upload';

// Simple upload
const uploader = new ConfigurableBrowserStackUploader({ environment: 'qa' });
await uploader.uploadResults({
    reportPath: './my-report.xml',
    projectName: 'My Project',
    buildName: 'My Build'
});
```
**Method Invocation Sequence:**
```
1. Import and instantiation
   └── new ConfigurableBrowserStackUploader({ environment: 'qa' })
       ├── this.environment = 'qa' // from constructor options
       ├── this.loadEnvironmentConfig()
       │   └── dotenv.config({ path: 'config/proj/.env.qa' })
       ├── this.isUploadEnabled = this.checkUploadEnabled()
       │   └── process.env.BS_UPLOAD.toLowerCase() === 'true'
       ├── this.username = process.env.BROWSERSTACK_USERNAME
       ├── this.accessKey = process.env.BROWSERSTACK_ACCESS_KEY
       └── this.logConfigurationStatus()

2. Upload method call
   └── uploader.uploadResults({
       reportPath: './my-report.xml',
       projectName: 'My Project', 
       buildName: 'My Build'
   })
       ├── if (!this.isUploadEnabled) return true // Gate check
       ├── if (!credentials) throw Error // Validation
       ├── config = {
       │   reportPath: './my-report.xml', // from options
       │   projectName: 'My Project', // from options
       │   buildName: 'My Build', // from options
       │   buildIdentifier: this.generateBuildId() // generated
       │ }
       ├── fs.existsSync('./my-report.xml') // File check
       └── execSync(curlCommand) // Upload execution
```

#### Static Method Upload
```typescript
// Conditional upload based on environment
await ConfigurableBrowserStackUploader.conditionalUpload({
    environment: 'qa',
    reportPath: './junit-test-report.xml'
});
```
**Method Invocation Sequence:**
```
1. Static method call (single line execution)
   └── ConfigurableBrowserStackUploader.conditionalUpload(options)

2. Internal method execution
   ├── const uploader = new ConfigurableBrowserStackUploader({
   │   environment: 'qa',
   │   reportPath: './junit-test-report.xml'
   │ })
   │ ├── [Complete constructor sequence with environment: 'qa']
   │ └── [Instance ready with QA configuration]
   └── return uploader.uploadResults({
       environment: 'qa',
       reportPath: './junit-test-report.xml'
     })
     ├── config.reportPath = './junit-test-report.xml' // from options
     ├── config.environment used for tags: 'playwright,automation,local,qa'
     └── [Complete upload sequence]
```

#### Advanced Programmatic Usage with Error Handling
```typescript
try {
    const uploader = new ConfigurableBrowserStackUploader({ environment: 'uat' });
    
    // Check if upload is enabled before proceeding
    if (uploader.isUploadEnabled) {
        const result = await uploader.uploadResults({
            reportPath: './test-results.xml',
            buildName: `UAT-Build-${Date.now()}`
        });
        console.log('Upload successful:', result);
    } else {
        console.log('Upload skipped for UAT environment');
    }
} catch (error) {
    console.error('Upload failed:', error.message);
}
```
**Method Invocation Sequence:**
```
1. Constructor with UAT environment
   └── new ConfigurableBrowserStackUploader({ environment: 'uat' })
       ├── this.environment = 'uat'
       ├── this.loadEnvironmentConfig() // Loads .env.uat
       │   └── process.env.BS_UPLOAD = 'false' (typically for UAT)
       ├── this.isUploadEnabled = false // Result of checkUploadEnabled()
       └── [Constructor completes]

2. Conditional check (programmatic gate)
   └── if (uploader.isUploadEnabled) // false for UAT
       └── console.log('Upload skipped for UAT environment')

3. No upload execution occurs due to programmatic check
```

## Environment Configuration

### Configuration Priority
1. **Command line arguments** (highest priority)
2. **Environment variables** (`TEST_ENV`, `BROWSERSTACK_USERNAME`, etc.)
3. **Environment configuration files** (`.env.{environment}`)
4. **Default values** (lowest priority)

### Environment Files Location
```
config/proj/
├── .env.qa      # QA environment settings
├── .env.uat     # UAT environment settings
└── .env.prod    # PROD environment settings
```

### Required Environment Variables
```bash
# BrowserStack Credentials
BROWSERSTACK_USERNAME=your_username
BROWSERSTACK_ACCESS_KEY=your_access_key

# Environment Control
TEST_ENV=qa  # qa, uat, or prod
BS_UPLOAD=true  # true or false

# Optional CI/CD Variables (auto-detected)
GITHUB_ACTIONS=true
GITHUB_SERVER_URL=https://github.com
GITHUB_REPOSITORY=owner/repo
GITHUB_RUN_ID=123456789
BUILD_NAME=Custom Build Name
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Upload Disabled Message
**Issue**: "BrowserStack upload is disabled in environment configuration. Skipping upload."
**Solution**: 
- Check that `BS_UPLOAD=true` is set in the correct `.env.{environment}` file
- Verify the environment is correctly detected
- Ensure the configuration file path is correct

#### 2. Credentials Error
**Issue**: "BrowserStack credentials required: BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY"
**Solution**:
- Set `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY` environment variables
- Verify credentials are valid in BrowserStack dashboard
- Check if credentials are properly loaded from environment files

#### 3. Report File Not Found
**Issue**: "Test report not found: ./junit-test-report.xml"
**Solution**:
- Ensure tests have run and generated the report file
- Check the report path is correct
- Verify the report file is not empty (0 bytes)

#### 4. Upload Fails with Curl Error
**Issue**: Upload fails with curl command error
**Solution**:
- Check network connectivity
- Verify BrowserStack API endpoint is accessible
- Ensure curl is available on the system
- Check if corporate firewall is blocking the request

#### 5. Environment File Not Found
**Issue**: "Configuration file not found: config/proj/.env.{environment}"
**Solution**:
- Create the missing environment configuration file
- Verify the file path structure is correct
- Ensure the file has the required `BS_UPLOAD` setting

### Debug Mode
Enable detailed logging by setting environment variable:
```bash
DEBUG=browserstack-upload
```

### Manual Testing
Test the upload manually:
```bash
# Check if report file exists
ls -la junit-test-report.xml

# Test credentials
curl -u "username:accesskey" https://upload-automation.browserstack.com/upload

# Validate environment configuration
cat config/proj/.env.qa
```

## Best Practices

### 1. Environment Management
- **Always use environment-specific configuration files**
- **Enable upload only for appropriate environments** (typically QA)
- **Keep credentials secure** using environment variables or secure CI/CD secrets
- **Use descriptive build names** that include environment and test suite information

### 2. Report Management
- **Ensure JUnit reports are generated** before attempting upload
- **Validate report file size** (empty reports indicate test execution issues)
- **Use consistent report naming** for easier tracking

### 3. CI/CD Integration
- **Set appropriate timeout values** for upload operations
- **Handle upload failures gracefully** (don't fail entire pipeline)
- **Use build identifiers** that include branch and timestamp information
- **Tag uploads appropriately** for filtering in BrowserStack dashboard

### 4. Monitoring and Maintenance
- **Monitor upload success rates** across different environments
- **Regularly review BrowserStack usage** and optimize as needed
- **Keep dependencies updated** (browserstack-node-sdk, curl)
- **Archive old reports** to prevent storage issues

### 5. Security Considerations
- **Never commit credentials** to version control
- **Use separate credentials** for different environments
- **Rotate access keys regularly**
- **Restrict access** to BrowserStack projects based on team needs

### 6. Error Handling
- **Implement retry logic** for transient failures
- **Log detailed error information** for debugging
- **Provide fallback mechanisms** when upload fails
- **Alert team members** of persistent upload issues

## Integration with Other Tools

### GitHub Actions Integration
```yaml
- name: Upload to BrowserStack
  env:
    BROWSERSTACK_USERNAME: ${{ secrets.BROWSERSTACK_USERNAME }}
    BROWSERSTACK_ACCESS_KEY: ${{ secrets.BROWSERSTACK_ACCESS_KEY }}
    TEST_ENV: qa
  run: npm run upload:browserstack:qa
```

### Local Development
```bash
# Set up local environment
export BROWSERSTACK_USERNAME="your_username"
export BROWSERSTACK_ACCESS_KEY="your_access_key"
export TEST_ENV="qa"

# Run tests and upload
npm run test:upload:sanity
```

This guide provides comprehensive information for effectively using the BrowserStack upload functionality in your test automation workflow. For additional support, refer to the [BrowserStack Test Observability documentation](https://www.browserstack.com/docs/test-observability) or contact the development team.
