# BrowserStack Upload Process — Step-by-Step Guide

This document explains how test results are uploaded to **BrowserStack Test Observability** in the `proj-name` project. There are two upload paths: **Local (CLI)** and **CI/CD (GitHub Actions)**.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture & Key Files](#architecture--key-files)
4. [How the Upload Toggle Works](#how-the-upload-toggle-works)
5. [Local Upload — Step by Step](#local-upload--step-by-step)
6. [CI/CD Upload — Step by Step](#cicd-upload--step-by-step)
7. [NPM Script Reference](#npm-script-reference)
8. [What Gets Uploaded](#what-gets-uploaded)
9. [Viewing Results in BrowserStack](#viewing-results-in-browserstack)
10. [Troubleshooting](#troubleshooting)

---

## Overview

After Playwright tests execute, a **JUnit XML report** is generated at `test-results/junit-report.xml`. This report is uploaded to the BrowserStack Test Observability API via a `curl` POST request, which makes the results viewable in the BrowserStack dashboard.

**High-level flow:**

```
Run Playwright Tests
        │
        ▼
JUnit XML report generated
(test-results/junit-report.xml)
        │
        ▼
BS_UPLOAD flag checked
        │
  ┌─────┴─────┐
  │ false      │ true
  │            │
  ▼            ▼
 Skip     Upload report via
          BrowserStack API
               │
               ▼
         Build URL returned
         (viewable in dashboard)
```

---

## Prerequisites

| Requirement | Details |
|---|---|
| **BrowserStack Account** | A valid BrowserStack username and access key |
| **Environment Variables** | `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY` must be set (locally or as GitHub secrets) |
| **Node.js & npm** | Required to run the upload utility via `ts-node` |
| **curl** | Used internally by the upload utility (pre-installed on most systems) |
| **JUnit Report** | Tests must have been run first so `test-results/junit-report.xml` exists |

---

## Architecture & Key Files

| File | Purpose |
|---|---|
| `tests/utils/browserstack-upload.ts` | **Core upload utility** — TypeScript class that handles credentials, environment config loading, toggle checking, and the actual `curl` upload |
| `config/.env.sit` | SIT environment config — contains `BS_UPLOAD = true/false` |
| `config/.env.qa` | QA environment config — contains `BS_UPLOAD = true/false` |
| `config/.env` | Default/fallback environment config |
| `browserstack.yml` | BrowserStack SDK configuration (project name, platforms, parallel settings) |
| `.github/workflows/upload-browserstack-results.yml` | Reusable GitHub Actions workflow for CI/CD upload |
| `.github/workflows/Playwright-automated-run.yml` | Main CI workflow that calls the upload workflow after tests complete |
| `playwright.config.ts` | Configures the JUnit reporter to output to `test-results/junit-report.xml` |

---

## How the Upload Toggle Works

Uploading is **controlled per environment** via the `BS_UPLOAD` variable in the corresponding `config/.env.<environment>` file.

| Environment | Config File | Current Setting |
|---|---|---|
| SIT | `config/.env.sit` | `BS_UPLOAD = true` |
| QA | `config/.env.qa` | `BS_UPLOAD = false` |
| Default | `config/.env` | `BS_UPLOAD = false` |

### Local Runs

The TypeScript utility (`browserstack-upload.ts`) reads the toggle automatically:
1. Loads the config file for the target environment (e.g. `config/.env.sit`).
2. Reads the `BS_UPLOAD` environment variable.
3. If `BS_UPLOAD` is `true` → upload proceeds.
4. If `BS_UPLOAD` is `false` or undefined → upload is skipped silently.

### CI/CD (GitHub Actions)

The CI workflow passes a `bs_upload` input to the reusable upload workflow, mirroring the `.env` file values:
1. The caller (`Playwright-automated-run.yml`) evaluates the environment and passes `bs_upload: 'true'` or `'false'`.
2. The upload workflow (`upload-browserstack-results.yml`) checks this input at the very start of the upload step.
3. If `bs_upload` is `'true'` → upload proceeds.
4. If `bs_upload` is `'false'` → upload is skipped with a clear log message.

> **Important:** When you change `BS_UPLOAD` in a `.env` file, also update the `bs_upload` expression in `Playwright-automated-run.yml` to keep them in sync.

To **enable** upload for an environment, set `BS_UPLOAD = true` in the respective `.env` file and update the CI expression.  
To **disable** it, set `BS_UPLOAD = false` and update the CI expression.

---

## Local Upload — Step by Step

### Option A: Upload Only (tests already ran)

Use this when you have already run tests and the JUnit report exists.

**Step 1 — Run your tests first (if not already done):**
```bash
npm run test:Consumer:sit:sanity
```

**Step 2 — Verify the report exists:**
```bash
# The file should exist at:
test-results/junit-report.xml
```

**Step 3 — Set BrowserStack credentials** (if not already in environment):
```bash
# PowerShell
$env:BROWSERSTACK_USERNAME = "your_username"
$env:BROWSERSTACK_ACCESS_KEY = "your_access_key"

# Bash / macOS
export BROWSERSTACK_USERNAME="your_username"
export BROWSERSTACK_ACCESS_KEY="your_access_key"
```

**Step 4 — Run the upload command:**
```bash
# For SIT environment
npm run upload:browserstack:sit

# For QA environment
npm run upload:browserstack:qa
```

**What happens behind the scenes:**
```
npm run upload:browserstack:sit
  → cross-env TEST_ENV=sit npx ts-node tests/utils/browserstack-upload.ts upload ./test-results/junit-report.xml Project-Repo
    → Loads config/.env.sit
    → Checks BS_UPLOAD flag
    → If true: uploads junit-report.xml via curl to BrowserStack API
    → Prints BrowserStack build URL on success
```

### Option B: Run Tests + Upload in One Command

This runs the tests and then automatically uploads the results.

```bash
# QA environment — run smoke tests then upload
npm run test:Consumer:qa:smoke:bs

# SIT environment — run smoke tests then upload
npm run test:Consumer:sit:smoke:bs
```

**What happens:**
1. The specified test suite executes via Playwright.
2. Even if tests fail, the utility proceeds to upload results.
3. The JUnit report is uploaded to BrowserStack.
4. A build URL is printed to the console.

### Option C: Direct CLI Usage

For full control over parameters:

```bash
# Upload with custom parameters
npx ts-node tests/utils/browserstack-upload.ts upload "./test-results/junit-report.xml" "MyProject" "Build 1" "qa"

# Test and upload with custom test command
npx ts-node tests/utils/browserstack-upload.ts test-and-upload "npm run test:Consumer:qa:smoke" "project-repo" "qa"
```

**CLI Arguments:**

| Command | Arguments | Description |
|---|---|---|
| `upload` | `[report-path] [project-name] [build-name] [environment]` | Upload an existing report |
| `test-and-upload` | `[test-command] [project-name] [environment]` | Run tests first, then upload |

---

## CI/CD Upload — Step by Step

The CI/CD upload happens automatically in the **GitHub Actions pipeline** and requires no manual intervention.

### How It Works

**Step 1 — Tests run in the main workflow:**  
The `Playwright-automated-run.yml` workflow triggers Playwright tests. The JUnit report (`test-results/junit-report.xml`) is saved as a GitHub Actions artifact.

**Step 2 — Upload workflow is called:**  
After tests complete (regardless of pass/fail), the reusable workflow `upload-browserstack-results.yml` is invoked with a `bs_upload` flag that controls whether the upload actually runs:

```yaml
upload_browserstack_results:
  needs: call-playwright-qa
  if: ${{ always() }}       # Runs even if tests failed
  uses: ./.github/workflows/upload-browserstack-results.yml
  with:
    environment: 'sit'       # or qa, based on trigger
    test_type: 'Smoke'       # Sanity, Smoke, or Regression
    artifact_name: smoke-test-results
    report_path: ./test-results/junit-report.xml
    project_name: dlfi-impl_mfbstage1playwright
    # BS_UPLOAD toggle — keep in sync with config/.env.<environment> files
    # Currently: sit=true, qa=false, uat=false
    bs_upload: ${{ (github.event_name == 'workflow_dispatch' && inputs.environment || 'sit') == 'sit' && 'true' || 'false' }}
  secrets:
    BROWSERSTACK_USERNAME: ${{ secrets.BROWSERSTACK_USERNAME }}
    BROWSERSTACK_ACCESS_KEY: ${{ secrets.BROWSERSTACK_ACCESS_KEY }}
```

**Step 3 — The upload workflow executes these steps:**

1. **Checks `bs_upload` input** — if not `'true'`, skips the entire upload with a log message and exits cleanly.
2. **Downloads the test results artifact** from the previous job.
3. **Validates credentials** — skips upload if `BROWSERSTACK_USERNAME` or `BROWSERSTACK_ACCESS_KEY` are missing.
4. **Checks for the JUnit report file** — skips if `junit-report.xml` doesn't exist.
5. **Extracts Playwright version** from the JUnit report (defaults to `1.57.0`).
6. **Uploads the report** via `curl` to `https://upload-automation.browserstack.com/upload` with:
   - Report file (`data=@junit-report.xml`)
   - Project name
   - Build name (e.g. `Automated Smoke Test - 2026-03-09 14:30`)
   - Build identifier (tied to GitHub run ID)
   - Tags (`playwright, automation, <environment>`)
   - CI URL (link back to the GitHub Actions run)
   - Framework version
7. **Extracts the BrowserStack build URL** from the API response.
8. **Outputs the URL** for downstream jobs (e.g., email notifications).

**Step 4 — Email notification includes BrowserStack link:**  
The `send_notification` job includes the BrowserStack build URL in the email sent to the team.

### Required GitHub Secrets

The following secrets must be configured in the GitHub repository settings (`Settings → Secrets and variables → Actions`):

| Secret Name | Description |
|---|---|
| `BROWSERSTACK_USERNAME` | Your BrowserStack username |
| `BROWSERSTACK_ACCESS_KEY` | Your BrowserStack access key |

---

## NPM Script Reference

| Script | Command | Description |
|---|---|---|
| `upload:browserstack:qa` | `cross-env TEST_ENV=qa npx ts-node tests/utils/browserstack-upload.ts upload ./test-results/junit-report.xml proj-repo-name` | Upload existing report for QA env |
| `upload:browserstack:sit` | `cross-env TEST_ENV=sit npx ts-node tests/utils/browserstack-upload.ts upload ./test-results/junit-report.xml proj-repo-name` | Upload existing report for SIT env |
| `test:Consumer:qa:smoke:bs` | Runs QA smoke tests then uploads results | Combined test + upload for QA |
| `test:Consumer:sit:smoke:bs` | Runs SIT smoke tests then uploads results | Combined test + upload for SIT |

---

## What Gets Uploaded

The BrowserStack API receives the following data with each upload:

| Field | Value | Source |
|---|---|---|
| `data` | JUnit XML report file | `test-results/junit-report.xml` |
| `projectName` | `dlfi-impl_mfbstage1playwright` | Configured in script/workflow |
| `buildName` | e.g. `Automated Smoke Test - 2026-03-09 14:30` | Generated dynamically |
| `buildIdentifier` | `gh-<run_id>-<attempt>` (CI) or `<branch>-<timestamp>` (local) | Generated dynamically |
| `tags` | `playwright, automation, <environment>` | Generated dynamically |
| `ci` | GitHub Actions run URL (CI) or `http://localhost:8080/` (local) | Generated dynamically |
| `frameworkVersion` | `playwright,<version>` | Extracted from report or package.json |

---

## Viewing Results in BrowserStack

1. After a successful upload, a **Build URL** is printed to the console/logs:
   ```
   🔗 View results: https://automation.browserstack.com/builds/<build_id>
   ```
2. Alternatively, navigate to [BrowserStack Test Observability](https://observability.browserstack.com/) and find the project `proj-repo-name`.
3. Builds are tagged by environment, test type, and execution source for easy filtering.

---

## Troubleshooting

### Upload is skipped — "BrowserStack upload is disabled"
- **Cause (Local):** `BS_UPLOAD` is set to `false` (or not defined) in the environment config file.
- **Fix:** Set `BS_UPLOAD = true` in `config/.env.<your_environment>`.
- **Cause (CI):** The `bs_upload` input passed to the upload workflow is `'false'` for the selected environment.
- **Fix:** Update the `bs_upload` expression in `Playwright-automated-run.yml` to return `'true'` for that environment, and set `BS_UPLOAD = true` in the matching `.env` file.

### "BrowserStack credentials are missing"
- **Cause:** `BROWSERSTACK_USERNAME` or `BROWSERSTACK_ACCESS_KEY` are not set.
- **Fix (Local):** Export the variables in your terminal session.
- **Fix (CI):** Ensure both secrets are configured in GitHub repository settings.

### "Test report not found"
- **Cause:** Tests did not run, or the JUnit reporter is not configured.
- **Fix:** Run your tests first. Verify `playwright.config.ts` includes the JUnit reporter:
  ```ts
  reporter: [
    ['junit', { outputFile: 'test-results/junit-report.xml' }],
  ]
  ```

### Upload succeeds but no Build URL is shown
- **Cause:** The BrowserStack API response didn't contain a recognizable URL.
- **Fix:** Check the raw API response in the logs. The upload may still have succeeded — verify in the BrowserStack dashboard directly.

### CI upload job fails
- **Cause:** Artifact from the test job may not have been produced.
- **Fix:** Check that the test job uploads the `test-results/` directory as an artifact. The upload step uses `continue-on-error: true` for artifact downloads, so check the logs for details.

---

*Last updated: March 2026*
