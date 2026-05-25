# AI Test Failure Analyzer — Complete Documentation

## Intelligent Root-Cause Analysis for Playwright Test Failures

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [How It Works — End-to-End Flow](#3-how-it-works--end-to-end-flow)
4. [Prerequisites & Required Files](#4-prerequisites--required-files)
5. [Failure Categories & Pattern Rules](#5-failure-categories--pattern-rules)
6. [Severity Levels](#6-severity-levels)
7. [GitHub Actions — CI/CD Workflow Integration](#7-github-actions--cicd-workflow-integration)
8. [Email Notification with Inline Failure Table](#8-email-notification-with-inline-failure-table)
9. [HTML Artifact Report](#9-html-artifact-report)
10. [Local CLI Usage (TypeScript Version)](#10-local-cli-usage-typescript-version)
11. [OpenAI / Azure OpenAI Integration (Optional)](#11-openai--azure-openai-integration-optional)
12. [Report Sections Explained](#12-report-sections-explained)
13. [Configuration Reference](#13-configuration-reference)
14. [Customization Guide](#14-customization-guide)
15. [Troubleshooting](#15-troubleshooting)
16. [Sample Output](#16-sample-output)
17. [FAQ](#17-faq)

---

## 1. Overview

The **AI Test Failure Analyzer** is a built-in component of the Project-name Playwright automation framework that automatically:

- **Parses** Playwright test results (`results.json`) after every CI/CD run
- **Categorizes** each failure into one of **11 failure categories** using regex-based pattern matching
- **Assigns severity** (CRITICAL / HIGH / MEDIUM / LOW) to each failure
- **Generates a root cause** explanation with actionable fix recommendations
- **Produces two outputs:**
  - A rich, interactive **HTML report** uploaded as a GitHub Actions artifact
  - A compact **failure summary table** embedded directly in the **email notification**

### Why?

Instead of just seeing "3 tests failed" in an email and having to dig through logs, the team gets an immediate answer to **what failed**, **why it failed**, and **what to do about it** — right in the email inbox.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                  GitHub Actions Pipeline                            │
│                                                                     │
│  ┌──────────────┐    ┌──────────────────┐    ┌───────────────────┐ │
│  │ Playwright    │───▶│ test-results/    │───▶│ AI Failure        │ │
│  │ Test Runner   │    │ results.json     │    │ Analyzer          │ │
│  └──────────────┘    └──────────────────┘    └────────┬──────────┘ │
│                                                       │            │
│                              ┌─────────────────────────┤            │
│                              │                         │            │
│                              ▼                         ▼            │
│                  ┌──────────────────┐   ┌────────────────────────┐ │
│                  │ HTML Report      │   │ Failure Table          │ │
│                  │ (Artifact)       │   │ (Email Output)         │ │
│                  └──────────────────┘   └────────────────────────┘ │
│                                                       │            │
│                                                       ▼            │
│                                              ┌────────────────┐   │
│                                              │ Email          │   │
│                                              │ Notification   │   │
│                                              └────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

There are **two implementations** of the analyzer, both producing equivalent analysis:

| Implementation | Location | Used By | AI Support |
|---|---|---|---|
| **Inline Node.js** (CI) | `.github/workflows/ai-failure-analysis.yml` | GitHub Actions pipeline | Rule-based only |
| **TypeScript CLI** (Local) | `tests/utils/ai-failure-analyzer.ts` | Developers locally | Rule-based + OpenAI/Azure OpenAI |

---

## 3. How It Works — End-to-End Flow

### Step 1: Test Execution Produces `results.json`

The Playwright config (`playwright.config.ts`) includes a **JSON reporter**:

```typescript
reporter: [
  ['list', { printSteps: true }],
  ['html', { outputFolder: htmlReportFolder, open: 'never' }],
  ['json', { outputFile: 'test-results/results.json' }],   // ← Required by analyzer
  ['junit', { outputFile: 'test-results/junit-report.xml' }],
],
```

After tests run, `test-results/results.json` contains the complete Playwright test output including:
- `stats` — pass/fail/skip/flaky counts and durations
- `suites[].specs[].tests[].results[].errors[]` — error messages and stack traces for every failure

### Step 2: Analyzer Reads and Categorizes Failures

The analyzer:
1. **Locates** `results.json` (checks `test-results/results.json` and `test-results/test-results/results.json` as fallback)
2. **Walks** the nested `suites → specs → tests → results` hierarchy
3. **Extracts** the last result for each failed test (including retries)
4. **Strips** ANSI escape codes from error messages
5. **Matches** each error against the 11 pattern rule sets (first match wins)
6. **Computes** root cause by calling the pattern's `rootCause(msg)` function with the actual error text
7. **Aggregates** category/severity breakdowns, top failing files, pass rates

### Step 3: Outputs Generated

- **HTML report** → `test-results/ai-failure-analysis.html` (uploaded as `ai-failure-analysis` artifact)
- **Failure table** → Written to `$GITHUB_OUTPUT` as `failure_table` (consumed by email notification)

### Step 4: Email Includes Failure Table

The `send_notification` job in `Playwright-automated-run.yml` includes:

```yaml
message: |
  ${{ needs.parse_results.outputs.test_summary }}
  ${{ needs.ai_failure_analysis.outputs.failure_table }}
  Playwright Report Artifacts: <link>
  AI Failure Analysis Report: <link>
  BrowserStack Results: <link or N/A>
```

When there are failures, the email displays an inline table. When all tests pass, the table output is empty and nothing extra appears.

---

## 4. Prerequisites & Required Files

### Required for CI (GitHub Actions)

| File / Component | Path | Purpose |
|---|---|---|
| **Playwright JSON reporter** | `playwright.config.ts` → `['json', { outputFile: 'test-results/results.json' }]` | Generates the input file consumed by the analyzer |
| **AI Failure Analysis workflow** | `.github/workflows/ai-failure-analysis.yml` | Reusable workflow that runs the inline Node.js analyzer |
| **Main orchestrator workflow** | `.github/workflows/Playwright-automated-run.yml` | Calls the analysis workflow and wires output to email |
| **Parse Results workflow** | `.github/workflows/parse-results.yml` | Generates test summary table (separate from failure analysis) |
| **Notification action** | `email-action` | Sends the email with the composed message |

### Required for Local CLI Usage

| File / Component | Path | Purpose |
|---|---|---|
| **TypeScript analyzer** | `tests/utils/ai-failure-analyzer.ts` | Full-featured local version with console + HTML output |
| **results.json** | `test-results/results.json` | Must exist from a prior test run |
| **ts-node** | `devDependency` | Required to execute the TypeScript file |

### Optional (for AI-Enhanced Analysis)

| Environment Variable | Provider | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI | Enables GPT-4 root cause analysis (TypeScript CLI only) |
| `AZURE_OPENAI_KEY` | Azure OpenAI | Alternative AI provider |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI | Azure endpoint URL |
| `AZURE_OPENAI_DEPLOYMENT` | Azure OpenAI | Deployment name (defaults to `gpt-4`) |

> **Note:** AI features (OpenAI/Azure) are only available in the local TypeScript CLI version. The CI workflow uses rule-based pattern matching, which requires no API keys.

---

## 5. Failure Categories & Pattern Rules

The analyzer uses **11 failure categories**, each with regex patterns, severity, dynamic root cause logic, and recommendations:

### 5.1 AUTH_FAILURE (Severity: CRITICAL)

**Triggers when:** Error matches Vault token issues, login failures, 401/403 responses, session expiry.

| Pattern | Example Error |
|---|---|
| `/vault token/i` | `VAULT_TOKEN environment variable is not set` |
| `/login failed/i` | `Login failed for user testuser@test.com` |
| `/401/` | `Response status: 401 Unauthorized` |
| `/403/` | `Response status: 403 Forbidden` |
| `/session expired/i` | `Session expired, please re-authenticate` |

**Root Cause Logic:**
- If the error mentions "vault token" → reports missing `VAULT_TOKEN` environment variable
- Otherwise → reports generic authentication failure

**Recommendations:**
1. Set `VAULT_TOKEN` before running tests
2. Verify `VAULT_ADDR` in `config/.env`
3. Check user account is not locked

---

### 5.2 TIMEOUT (Severity: HIGH)

**Triggers when:** Error matches timeout patterns with millisecond values.

| Pattern | Example Error |
|---|---|
| `/timeout\s*\d+ms exceeded/i` | `locator.click: Timeout 30000ms exceeded` |
| `/waiting for.*locator/i` | `waiting for locator('#submit-btn') to be visible` |
| `/navigation timeout/i` | `page.goto: Navigation timeout 60000ms exceeded` |

**Root Cause Logic:** Dynamically extracts the timeout value from the error message (e.g., "30000ms") and reports it.

**Recommendations:**
1. Check environment availability
2. Verify selector is still valid
3. Inspect failure screenshot
4. Consider increasing `actionTimeout`

---

### 5.3 LOCATOR_NOT_FOUND (Severity: HIGH)

**Triggers when:** Selector cannot find any element or finds too many.

| Pattern | Example Error |
|---|---|
| `/locator.*not found/i` | `locator('#old-button') not found` |
| `/strict mode violation/i` | `strict mode violation: locator resolved to 3 elements` |
| `/resolved to \d+ element/i` | `locator('.btn') resolved to 5 elements` |

**Root Cause Logic:**
- Strict mode violation → "locator matched multiple elements"
- Otherwise → "Element not found in DOM, selector may be outdated"

**Recommendations:**
1. Open trace/screenshot to inspect DOM
2. Verify selector against current HTML
3. Ensure test preconditions are met

---

### 5.4 ASSERTION_FAILURE (Severity: MEDIUM)

**Triggers when:** `expect()` assertions fail with mismatched values.

| Pattern | Example Error |
|---|---|
| `/expect\(received\)/i` | `expect(received).toBe(expected)` |
| `/toBe\|toEqual\|toContain/i` | `Expected "Active" but received "Pending"` |

**Root Cause Logic:** Dynamically extracts Expected vs Received values from the error message and includes them in the root cause.

**Recommendations:**
1. Check expected vs received values
2. Verify test data in `testData.json` is current
3. Review last PASS screenshot vs failure

---

### 5.5 NAVIGATION_ERROR (Severity: CRITICAL)

**Triggers when:** Browser cannot reach the application URL.

| Pattern | Example Error |
|---|---|
| `/net::ERR_/i` | `page.goto: net::ERR_CONNECTION_REFUSED` |
| `/ERR_CONNECTION_REFUSED/i` | `ECONNREFUSED 10.0.0.5:443` |
| `/Failed to navigate/i` | `Failed to navigate to https://sit.app.com` |

**Root Cause:** "Navigation failed. Environment may be down or URL incorrect."

---

### 5.6 ELEMENT_NOT_VISIBLE (Severity: HIGH)

**Triggers when:** Element exists in DOM but is hidden or obscured.

| Pattern | Example Error |
|---|---|
| `/element is not visible/i` | `element is not visible` |
| `/element is hidden/i` | `element is hidden by CSS` |

**Root Cause:** "Target element is present in DOM but not visible/interactive."

---

### 5.7 PAGE_CRASH (Severity: CRITICAL)

**Triggers when:** Browser tab or execution context is destroyed unexpectedly.

| Pattern | Example Error |
|---|---|
| `/page crashed/i` | `page crashed` |
| `/target closed/i` | `Target page, context or browser has been closed` |
| `/execution context was destroyed/i` | `execution context was destroyed` |

**Root Cause:** "Browser page/context crashed. Possible JS error on page or memory pressure."

---

### 5.8 ELEMENT_NOT_ENABLED (Severity: MEDIUM)

**Triggers when:** Element is visible but disabled and cannot be interacted with.

| Pattern | Example Error |
|---|---|
| `/element is not enabled/i` | `element is not enabled` |
| `/element.*disabled/i` | `element has attribute "disabled"` |
| `/not interactable/i` | `element is not interactable` |

**Root Cause:** "Element is present and visible but disabled. Pre-conditions to enable it may not be met."

---

### 5.9 NETWORK_ERROR (Severity: HIGH)

**Triggers when:** Backend API requests fail with HTTP errors.

| Pattern | Example Error |
|---|---|
| `/500 internal server/i` | `Response status: 500 Internal Server Error` |
| `/502 bad gateway/i` | `502 Bad Gateway` |
| `/request failed/i` | `Request failed: POST /api/accounts` |

**Root Cause:** "A network request returned an error. Backend API may be down or endpoint may be invalid."

---

### 5.10 STEP_FAILURE (Severity: HIGH)

**Triggers when:** Custom test steps explicitly report failure via `Report.fail()`.

| Pattern | Example Error |
|---|---|
| `/FAIL\s*-/i` | `FAIL - Account balance verification failed` |
| `/Report\.fail/i` | `Report.fail('Expected amount not displayed')` |

**Root Cause:** "A custom test step explicitly reported a failure via `Report.fail()`. This is a functional test failure."

---

### 5.11 UNKNOWN (Severity: MEDIUM)

**Triggers when:** No pattern matched.

**Root Cause:** "No pattern matched. Manual investigation required."

**Recommendations:**
1. Review full error and stack trace
2. Check latest screenshot

---

## 6. Severity Levels

| Level | Color Code | Meaning | Typical Categories |
|---|---|---|---|
| **CRITICAL** | 🔴 Red | Environment/infrastructure down, tests **cannot proceed** | AUTH_FAILURE, NAVIGATION_ERROR, PAGE_CRASH |
| **HIGH** | 🟠 Orange | Tests failing due to **application or selector issues** | TIMEOUT, LOCATOR_NOT_FOUND, ELEMENT_NOT_VISIBLE, NETWORK_ERROR, STEP_FAILURE |
| **MEDIUM** | 🟡 Yellow | **Functional mismatches** or disabled elements, often data-related | ASSERTION_FAILURE, ELEMENT_NOT_ENABLED, UNKNOWN |
| **LOW** | 🟢 Green | Minor issues | (Reserved for future patterns) |

---

## 7. GitHub Actions — CI/CD Workflow Integration

### 7.1 Workflow File

**Path:** `.github/workflows/ai-failure-analysis.yml`

This is a **reusable workflow** (`workflow_call`) invoked by the main orchestrator.

### 7.2 Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `artifact_name` | string | `smoke-test-results` | Name of the test-results artifact to download |
| `results_file` | string | `test-results/results.json` | Path to results.json inside the downloaded artifact |
| `retention_days` | string | `3` | Days to retain the HTML report artifact |

### 7.3 Outputs

| Output | Description |
|---|---|
| `failure_table` | Compact HTML table of failures for email embedding. Empty string when all tests pass. |

### 7.4 How It's Called

In `Playwright-automated-run.yml`:

```yaml
ai_failure_analysis:
  needs: call-playwright-qa
  if: always()
  uses: ./.github/workflows/ai-failure-analysis.yml
  with:
    artifact_name: 'smoke-test-results'
    results_file: 'test-results/results.json'
    retention_days: '3'
```

Key points:
- **`if: always()`** — Runs even if tests fail (that's the whole point)
- **`needs: call-playwright-qa`** — Waits for test execution to complete
- All steps use **`continue-on-error: true`** to ensure the email notification job is never blocked

### 7.5 Execution Steps (CI)

1. **Download artifact** — `actions/download-artifact@v4` fetches the `smoke-test-results` artifact to `test-results/`
2. **Run inline Node.js analyzer** — Embedded `node << 'ANALYZER_EOF'` heredoc script:
   - Locates `results.json`
   - Categorizes all failures
   - Generates the full HTML report (`test-results/ai-failure-analysis.html`)
   - Generates the compact email failure table and writes it to `$GITHUB_OUTPUT`
3. **Upload artifact** — `actions/upload-artifact@v4` publishes `ai-failure-analysis.html` with 3-day retention

---

## 8. Email Notification with Inline Failure Table

### What Recipients See

When **all tests pass**, the email contains only the execution summary table and report links — no failure table.

When **tests fail**, the email includes an additional section between the summary and the report links:

```
┌──────────────────────────────────────────────────────┐
│  Automated Test Execution Summary — Consumer     │
│  Date: 18 Mar 2026                                   │
│  Overall Status: ❌ Some Tests Failed                │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │ Execution Summary (table)                    │    │
│  │ Test Results: 45 Total, 42 Pass, 3 Fail      │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  ❌ Failure Analysis (3 failures)                    │
│  ┌──────────────────────────────────────────────┐    │
│  │ # │ Test Name    │ File   │ Severity │ ...   │    │
│  │ 1 │ Login Test   │ auth.. │ CRITICAL │ ...   │    │
│  │ 2 │ Transfer ... │ pay..  │ HIGH     │ ...   │    │
│  │ 3 │ Balance ..   │ acc..  │ MEDIUM   │ ...   │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  Playwright Report Artifacts: <link>                 │
│  AI Failure Analysis Report: <link>                  │
│  BrowserStack Results: <link>                        │
└──────────────────────────────────────────────────────┘
```

### Failure Table Columns

| Column | Description |
|---|---|
| **#** | Sequential failure number |
| **Test Name** | The spec/test title from Playwright |
| **File** | Source test file (with `tests/` prefix stripped) |
| **Severity** | Color-coded badge (CRITICAL=red, HIGH=orange, MEDIUM=yellow, LOW=green) |
| **Category** | Failure type (e.g., TIMEOUT, AUTH FAILURE, ASSERTION FAILURE) |
| **Root Cause** | AI-generated explanation (truncated to 120 characters in email; full version in HTML report) |

### Limits

- Maximum **15 rows** displayed inline to keep email readable
- If there are more than 15 failures, a footer row shows: *"...and N more failure(s). See full AI Failure Analysis report for details."*
- Root cause text is capped at **120 characters** in the email table (full text available in the HTML artifact report)

---

## 9. HTML Artifact Report

The full HTML report (`ai-failure-analysis.html`) is uploaded as a GitHub Actions artifact named **`ai-failure-analysis`**.

### How to Access

1. Go to the GitHub Actions run page
2. Scroll to the **Artifacts** section
3. Download `ai-failure-analysis`
4. Open `ai-failure-analysis.html` in any browser

### Report Features

| Section | Description |
|---|---|
| **Header** | Run date, duration, AI mode indicator |
| **Stats Grid** | Large number cards for Passed, Failed, Flaky, Skipped, Pass Rate |
| **Failure Categories** | Horizontal bar chart showing count per category |
| **Severity Distribution** | Grid showing count per severity level |
| **Top Failing Files** | Ranked list of files with most failures |
| **Search & Filter** | Interactive search box + severity filter buttons *(TypeScript version)* |
| **Failure Cards** | One card per failure with: test name, file, project, duration, retries, tags, error message, root cause, recommendations, collapsible stack trace |

### Color Coding

- **Left border** of each card matches severity color
- **Category badges** use unique colors (e.g., TIMEOUT = purple, AUTH_FAILURE = red)
- **Severity badges** use standardized colors (CRITICAL = red, HIGH = orange, etc.)

---

## 10. Local CLI Usage (TypeScript Version)

The TypeScript version at `tests/utils/ai-failure-analyzer.ts` provides the same analysis locally with richer output.

### Running Locally

```bash
# Basic usage (uses default test-results/results.json)
npx ts-node tests/utils/ai-failure-analyzer.ts

# Custom input file
npx ts-node tests/utils/ai-failure-analyzer.ts --input test-results/results.json

# With OpenAI enhancement
npx ts-node tests/utils/ai-failure-analyzer.ts --openai
```

### What It Produces

1. **Console report** — Color-coded terminal output with:
   - Results overview (passed/failed/flaky/skipped)
   - Severity breakdown
   - Category breakdown with ASCII bar charts
   - Top failing files
   - Per-failure details with error, root cause, and recommendations

2. **HTML report** — Same file as CI (`test-results/ai-failure-analysis.html`) but with additional features:
   - Interactive **search box** to filter failures by text
   - **Severity filter buttons** to show only CRITICAL/HIGH/etc.
   - **Collapsible stack traces** per failure card
   - **Failed Step** extraction (identifies which Playwright step specifically failed)
   - **AI Enhanced** badge when OpenAI analysis is available

### Exit Code

- **Exit code 0** — All tests passed
- **Exit code 1** — One or more failures detected (useful for CI gating)

---

## 11. OpenAI / Azure OpenAI Integration (Optional)

The TypeScript CLI version can enhance root-cause analysis with LLM-powered insights. This is **optional** and falls back gracefully to rule-based analysis when no API key is provided.

### Setup

```bash
# Option A: OpenAI
$env:OPENAI_API_KEY = "sk-..."

# Option B: Azure OpenAI
$env:AZURE_OPENAI_KEY = "your-key"
$env:AZURE_OPENAI_ENDPOINT = "https://your-resource.openai.azure.com"
$env:AZURE_OPENAI_DEPLOYMENT = "gpt-4"   # Optional, defaults to gpt-4
```

### How It Works

For each failure, the analyzer sends a prompt to the LLM:

```
Analyze this Playwright test failure and provide a concise root cause and fix:

Test: <test title>
File: <file path>
Category: <detected category>
Failed Step: <step title or N/A>
Error: <first 600 chars of error message>

Provide: 1) Root cause in 1-2 sentences, 2) Top 2 specific fix recommendations.
```

The response is displayed as an **"🤖 AI Analysis"** section in both the console and HTML report.

### Configuration

| Setting | Value |
|---|---|
| Model | `gpt-4` (configurable via deployment name for Azure) |
| Max tokens | 300 |
| Temperature | 0.2 (deterministic) |
| Timeout | 15 seconds per request |

> **Note:** The CI workflow does NOT use OpenAI integration to avoid API key management complexity and per-call costs. The rule-based analysis on CI is deterministic and free.

---

## 12. Report Sections Explained

### 12.1 Error Message

The first line of the Playwright error (up to 200 characters in the email table, up to 1000 characters in the HTML report). ANSI escape codes are stripped.

### 12.2 Root Cause

Dynamically generated based on the error content. Examples:

- **TIMEOUT:** *"Element/navigation timed out after 30000ms. Selector may be stale, page slow, or env degraded."*
- **AUTH_FAILURE:** *"VAULT_TOKEN env var is missing. Tests using validCredentials fixture require it to fetch credentials from HashiCorp Vault."*
- **ASSERTION_FAILURE:** *"Assertion mismatch — Expected: 'Active' but got: 'Pending'"*

### 12.3 Recommendations

Ordered list of 2–5 actionable steps specific to the failure category. These are **static per category** (not dynamic per error), but are curated by the framework team for relevance to this project.

### 12.4 Failed Step (TypeScript version only)

The TypeScript analyzer walks the `results[].steps[]` hierarchy to find the deepest step that has an error, providing additional context like:

```
❌ Failed Step: page.locator('#submit-btn').click()
```

---

## 13. Configuration Reference

### Playwright Config (Required)

Ensure `playwright.config.ts` includes the JSON reporter:

```typescript
reporter: [
  // ... other reporters ...
  ['json', { outputFile: 'test-results/results.json' }],
],
```

### Workflow Inputs (CI)

Reference in `Playwright-automated-run.yml`:

```yaml
ai_failure_analysis:
  needs: call-playwright-qa
  if: always()
  uses: ./.github/workflows/ai-failure-analysis.yml
  with:
    artifact_name: 'smoke-test-results'        # Must match the artifact uploaded by test runner
    results_file: 'test-results/results.json'   # Path within the artifact
    retention_days: '3'                          # Days to keep the HTML report
```

### Email Integration

In `send_notification` job:

```yaml
message: |
  ${{ needs.parse_results.outputs.test_summary }}
  ${{ needs.ai_failure_analysis.outputs.failure_table }}
  ...
```

The `failure_table` output is empty when all tests pass, so it adds nothing to the email in those cases.

---

## 14. Customization Guide

### Adding a New Failure Category

To add a custom failure category (e.g., `DATABASE_ERROR`):

**For CI (inline Node.js):** Edit `.github/workflows/ai-failure-analysis.yml` and add to the `PATTERNS` array:

```javascript
{
  name: 'DATABASE_ERROR',
  patterns: [/database.*error/i, /SQL.*exception/i, /connection pool/i],
  severity: 'CRITICAL',
  rootCause: function(m) {
    return 'A database error occurred. The database may be unreachable or a query failed.';
  },
  recs: ['Check database connectivity', 'Verify DB credentials', 'Review recent schema changes'],
},
```

**For Local CLI (TypeScript):** Edit `tests/utils/ai-failure-analyzer.ts` and add to the `FAILURE_PATTERNS` array with the same structure but using TypeScript syntax.

> **Important:** Pattern order matters. The first matching pattern wins, so place more specific patterns **before** general ones.

### Changing Severity Colors

The color mappings are defined in both implementations:

```javascript
// Severity badge colors
var sevColor = { CRITICAL:'#dc2626', HIGH:'#ea580c', MEDIUM:'#d97706', LOW:'#65a30d' };

// Category badge colors
var catColor = { AUTH_FAILURE:'#dc2626', TIMEOUT:'#7c3aed', LOCATOR_NOT_FOUND:'#db2777', ... };
```

### Changing Email Table Row Limit

In `ai-failure-analysis.yml`, find `var maxRows = 15;` and change to your preferred limit.

### Changing Artifact Retention

Pass a different `retention_days` value in `Playwright-automated-run.yml`:

```yaml
retention_days: '7'   # Keep for 7 days instead of 3
```

---

## 15. Troubleshooting

### "results.json not found — skipping analysis"

**Cause:** The Playwright JSON reporter did not produce `results.json`, or the artifact download failed.

**Fix:**
1. Verify `playwright.config.ts` has `['json', { outputFile: 'test-results/results.json' }]` in the reporter array
2. Check that the test runner job (`call-playwright-qa`) uploaded the `smoke-test-results` artifact
3. Verify the artifact name matches between the test runner and the `artifact_name` input

### Failure table is empty in email but there were failures

**Cause:** The `ai_failure_analysis` job may have failed silently, or the output wasn't properly connected.

**Fix:**
1. Check the **AI Failure Analysis** job logs in GitHub Actions for errors
2. Verify `needs.ai_failure_analysis.outputs.failure_table` is referenced in the `send_notification` message
3. Ensure `ai_failure_analysis` is listed in the `needs` array of `send_notification`

### Failures are categorized as UNKNOWN

**Cause:** The error message/stack trace doesn't match any of the 10 known patterns.

**Fix:**
1. Check the actual error message in the HTML report or Playwright trace
2. Add a new regex pattern to the appropriate category (or create a new category)
3. Test the regex locally using the TypeScript CLI against the same `results.json`

### HTML report shows 0 failures but email shows failures

**Cause:** The `results.json` may have been partially written, or the analyzer encountered a parsing error.

**Fix:**
1. Download the `smoke-test-results` artifact and inspect `results.json` manually
2. Check the analyzer step logs for any `catch` or error output
3. Try running the TypeScript version locally against the same file

### "Cannot find module 'ts-node'" when running locally

**Fix:**

```bash
npm install -D ts-node typescript
npx ts-node tests/utils/ai-failure-analyzer.ts
```

---

## 16. Sample Output

### Email Failure Table (Sample)

| # | Test Name | File | Severity | Category | Root Cause |
|---|---|---|---|---|---|
| 1 | Verify successful login | Consumer/Login.spec.ts | 🔴 CRITICAL | AUTH FAILURE | VAULT_TOKEN env var is missing. Tests using validCredentials... |
| 2 | Transfer between accounts | Consumer/Transfer.spec.ts | 🟠 HIGH | TIMEOUT | Element/navigation timed out after 30000ms. Selector may be... |
| 3 | Verify account balance | Consumer/Accounts.spec.ts | 🟡 MEDIUM | ASSERTION FAILURE | Assertion mismatch — Expected: "$1,500.00" but got: "$0.00" |

### Console Output (Sample — Local TypeScript CLI)

```
══════════════════════════════════════════════════════════════════════
  🤖 AI FAILURE ANALYZER —  Playwright
══════════════════════════════════════════════════════════════════════
  Run Date   : 3/18/2026, 10:30:00 AM
  Duration   : 4m 23.1s
  AI Mode    : rule-based

  RESULTS OVERVIEW
────────────────────────────────────────────────────────────────────
  ✓ Passed  : 42
  ✗ Failed  : 3
  ⚡ Flaky   : 1
  ◌ Skipped : 2

  SEVERITY BREAKDOWN
────────────────────────────────────────────────────────────────────
  CRITICAL   : 1
  HIGH       : 1
  MEDIUM     : 1

  FAILURE CATEGORY BREAKDOWN
────────────────────────────────────────────────────────────────────
  AUTH_FAILURE           : ████████████████████ 1
  TIMEOUT                : ████████████████████ 1
  ASSERTION_FAILURE      : ████████████████████ 1
```

---

## 17. FAQ

**Q: Does this require any external AI service to work?**
A: No. The CI workflow uses 100% rule-based pattern matching with no external dependencies. The OpenAI/Azure integration is optional and only available in the local TypeScript CLI version.

**Q: What happens if the analyzer itself crashes?**
A: All steps use `continue-on-error: true`. If the analyzer fails, the email notification still sends — it just won't include the failure table. The execution summary and report links are unaffected.

**Q: Does this add time to the pipeline?**
A: Negligible. The inline Node.js script runs in under 2 seconds. It processes results.json in memory and writes the HTML file. No network calls are made.

**Q: Can I run the analyzer against an old results.json?**
A: Yes. Locally: `npx ts-node tests/utils/ai-failure-analyzer.ts --input path/to/old/results.json`

**Q: Why are there two implementations (Node.js inline + TypeScript)?**
A: The CI version is a self-contained inline script to avoid needing `npm install` or TypeScript compilation in the analysis job (which runs on a clean `ubuntu-latest` runner). The TypeScript version provides the richer local developer experience with search/filter, stack trace collapsing, failed step extraction, and optional OpenAI integration.

**Q: How do I add patterns for new types of failures specific to our app?**
A: See [Section 14 — Customization Guide](#14-customization-guide). Add entries to the `PATTERNS` array in both implementations to keep them in sync.

**Q: What is the maximum number of failures shown in email?**
A: 15, with a "...and N more" footer row. This limit can be changed by editing `maxRows` in `ai-failure-analysis.yml`.

---

## File Summary

| File | Location | Role |
|---|---|---|
| `ai-failure-analysis.yml` | `.github/workflows/` | CI workflow — inline Node.js analyzer, HTML report, email failure table |
| `ai-failure-analyzer.ts` | `tests/utils/` | Local CLI — TypeScript analyzer with console output, HTML report, OpenAI support |
| `Playwright-automated-run.yml` | `.github/workflows/` | Main orchestrator — wires analysis output into email notification |
| `parse-results.yml` | `.github/workflows/` | Companion — builds the execution summary table (pass/fail counts) |
| `playwright.config.ts` | Project root | Config — JSON reporter produces `test-results/results.json` |

---

*Generated for Playwright Automation Framework — March 2026*
