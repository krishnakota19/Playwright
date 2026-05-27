# Email Notification Process — Complete Documentation

## Automated Test Execution Reports via GitHub Actions

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture & Data Flow](#2-architecture--data-flow)
3. [Prerequisites & Required Files](#3-prerequisites--required-files)
4. [Trigger Conditions — When Emails Are Sent](#4-trigger-conditions--when-emails-are-sent)
5. [Recipient Configuration](#5-recipient-configuration)
6. [Email Content — Section-by-Section Breakdown](#6-email-content--section-by-section-breakdown)
7. [Pipeline Job Dependency Chain](#7-pipeline-job-dependency-chain)
8. [Data Source: Parse Results Workflow](#8-data-source-parse-results-workflow)
9. [Data Source: AI Failure Analysis Workflow](#9-data-source-ai-failure-analysis-workflow)
10. [Data Source: BrowserStack Upload Workflow](#10-data-source-browserstack-upload-workflow)
11. [Artifact Attachments](#11-artifact-attachments)
12. [Notification Action — panda-github-native-notification-action](#12-notification-action--panda-github-native-notification-action)
13. [Complete send_notification Job Reference](#13-complete-send_notification-job-reference)
14. [Dynamic Values & Expression Logic](#14-dynamic-values--expression-logic)
15. [Email Layout — Visual Reference](#15-email-layout--visual-reference)
16. [Customization Guide](#16-customization-guide)
17. [Required GitHub Permissions & Secrets](#17-required-github-permissions--secrets)
18. [Graceful Degradation & Error Handling](#18-graceful-degradation--error-handling)
19. [Troubleshooting](#19-troubleshooting)
20. [FAQ](#20-faq)

---

## 1. Overview

The Playwright automation framework sends a **rich HTML email notification** after every CI/CD test execution. The email provides stakeholders with an at-a-glance view of test results without needing to log into GitHub.

### What the email includes:

- **Execution Summary** — Application, test type, browser, environment, trigger, duration
- **Test Results** — Total, Passed, Failed, Flaky, Skipped counts with color indicators
- **Failure Analysis Table** — Inline table showing each failure's test name, file, severity, category, and root cause (only when failures exist)
- **Report Links** — Direct links to Playwright HTML report artifact, AI Failure Analysis artifact, and BrowserStack build dashboard
- **Artifact Attachment** — The `playwright-report` artifact is attached to the email for direct download

### Key characteristics:

- Sends on **every trigger** — push, scheduled, or manual dispatch (with email specified)
- **Always runs** even if tests fail (that's the primary use case)
- **Self-healing** — every upstream data source uses `continue-on-error`, so the email is sent even when a data-provider job fails
- Uses the internal **panda-github-native-notification-action** to deliver email via GitHub's notification infrastructure

---

## 2. Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              GitHub Actions Pipeline                            │
│                                                                                 │
│  ┌──────────────────┐                                                           │
│  │ call-playwright-qa│  (Runs tests, produces artifacts)                        │
│  └────────┬─────────┘                                                           │
│           │                                                                     │
│           │ if: always()                                                        │
│           ├────────────────┬─────────────────────┬──────────────────────┐       │
│           ▼                ▼                     ▼                      ▼       │
│  ┌────────────────┐ ┌─────────────┐ ┌──────────────────────┐ ┌──────────────┐  │
│  │ parse_results  │ │ ai_failure  │ │ upload_browserstack  │ │ (other jobs) │  │
│  │                │ │ _analysis   │ │ _results             │ │              │  │
│  │ Outputs:       │ │ Outputs:    │ │ Outputs:             │ │              │  │
│  │ • test_summary │ │ • failure   │ │ • browserstack_url   │ │              │  │
│  │ • total        │ │   _table    │ │                      │ │              │  │
│  │ • passed       │ │             │ │                      │ │              │  │
│  │ • failed       │ │             │ │                      │ │              │  │
│  │ • flaky        │ │             │ │                      │ │              │  │
│  │ • skipped      │ │             │ │                      │ │              │  │
│  └───────┬────────┘ └──────┬──────┘ └──────────┬───────────┘ └──────────────┘  │
│          │                 │                    │                                │
│          │   needs: [all four upstream jobs]    │                                │
│          └─────────────────┼────────────────────┘                               │
│                            ▼                                                    │
│              ┌─────────────────────────┐                                        │
│              │   send_notification     │                                        │
│              │                         │                                        │
│              │ Composes HTML message:  │                                        │
│              │ • test_summary table    │                                        │
│              │ • failure_table         │                                        │
│              │ • Report artifact link  │                                        │
│              │ • AI Analysis link      │                                        │
│              │ • BrowserStack link     │                                        │
│              │                         │                                        │
│              │ Attaches:               │                                        │
│              │ • playwright-report     │                                        │
│              │                         │                                        │
│              │ Sends via:              │                                        │
│              │ panda-github-native-    │                                        │
│              │ notification-action     │                                        │
│              └─────────────────────────┘                                        │
│                            │                                                    │
│                            ▼                                                    │
│                     📧 Email Inbox                                              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Prerequisites & Required Files

### Workflow Files

| File | Path | Role in Email Process |
|---|---|---|
| **Main Orchestrator** | `.github/workflows/Playwright-automated-run.yml` | Contains the `send_notification` job; composes and sends the email |
| **Parse Results** | `.github/workflows/parse-results.yml` | Generates `test_summary` HTML table and individual count outputs |
| **AI Failure Analysis** | `.github/workflows/ai-failure-analysis.yml` | Generates `failure_table` HTML for inline failure details |
| **BrowserStack Upload** | `.github/workflows/upload-browserstack-results.yml` | Outputs `browserstack_url` for the BrowserStack link |

### Notification Action

| Component | Reference | Version |
|---|---|---|
| **panda-github-native-notification-action** | `Banking-Solutions-Digital/panda-github-native-notification-action` | `@1.0.1` |

This is an internal GitHub Action hosted in the `Banking-Solutions-Digital` organization that sends email notifications using GitHub's native notification system. **No external email server or SMTP configuration is required** — it leverages the GitHub platform's built-in email delivery.

### Playwright Configuration

The email process depends on test reporters configured in `playwright.config.ts`:

```typescript
reporter: [
  ['list', { printSteps: true }],
  ['html', { outputFolder: htmlReportFolder, open: 'never' }],   // → playwright-report artifact
  ['json', { outputFile: 'test-results/results.json' }],          // → parse_results + ai_failure_analysis
  ['junit', { outputFile: 'test-results/junit-report.xml' }],     // → browserstack upload
],
```

| Reporter | Output File | Consumed By |
|---|---|---|
| `html` | `playwright-report/` | Attached to email via `artifact_names` |
| `json` | `test-results/results.json` | `parse-results.yml` (counts) + `ai-failure-analysis.yml` (failures) |
| `junit` | `test-results/junit-report.xml` | `upload-browserstack-results.yml` |

### GitHub Secrets (Required)

| Secret | Purpose | Required |
|---|---|---|
| `VAULT_TOKEN` | Test execution (not email-specific) | Yes — for tests to run |
| `BROWSERSTACK_USERNAME` | BrowserStack upload + link in email | Only if BrowserStack is enabled |
| `BROWSERSTACK_ACCESS_KEY` | BrowserStack upload + link in email | Only if BrowserStack is enabled |

### GitHub Permissions

The `send_notification` job requires these permissions:

```yaml
permissions:
  id-token: write    # For OIDC token exchange (notification action)
  contents: write    # For accessing repository content
  actions: read      # For reading artifact metadata
```

---

## 4. Trigger Conditions — When Emails Are Sent

The `send_notification` job runs under this condition:

```yaml
if: ${{ always() && (
  github.event_name == 'push' ||
  github.event_name == 'schedule' ||
  (github.event_name == 'workflow_dispatch' && inputs.email != '')
) }}
```

### Breakdown:

| Trigger | Event Name | Sends Email? | Recipients |
|---|---|---|---|
| **Push to main** | `push` | ✅ Always | Default list (hardcoded) |
| **Scheduled (Mon–Thu)** | `schedule` (cron `30 4 * * 1-4`) | ✅ Always | Default list (hardcoded) |
| **Scheduled (Friday)** | `schedule` (cron `30 4 * * 5`) | ✅ Always | Default list (hardcoded) |
| **Manual dispatch** | `workflow_dispatch` | ✅ Only if `email` input is not empty | Custom list from `email` input |

The `always()` function ensures the job runs **regardless of whether upstream jobs succeeded or failed**. This is critical because the whole point of the notification is to report failures.

---

## 5. Recipient Configuration

### Default Recipients

When the trigger is **push** or **schedule**, email goes to the hardcoded default list:

```yaml
team: 'Krishna-Kota'
```

### Manual Dispatch — Custom Recipients

When triggering manually via GitHub Actions UI, the `email` input field allows specifying recipients:

```yaml
email:
  description: 'Notification recipient GitHub username(s), comma-separated'
  required: false
  default: 'Krishna-Kota'
  type: string
```

**Format:** Comma-separated GitHub usernames (organization-scoped). Example:

```
Krishna-Kota
```

### How Recipient Resolution Works

The notification action resolves recipients using the expression:

```yaml
team: ${{ github.event_name == 'workflow_dispatch' && inputs.email || 'Krishna-Kota' }}
```

- **Manual dispatch** → uses whatever is in the `email` input
- **All other triggers** → uses the hardcoded defaults

### Adding or Changing Default Recipients

Edit the two locations in `Playwright-automated-run.yml`:

1. **Input default value** (line with `default:` under the `email` input)
2. **Fallback in `team:` expression** (the string after `||` in the `send_notification` step)

Both should match to maintain consistency.

---

## 6. Email Content — Section-by-Section Breakdown

The email body is composed from the `message` field in the notification step. It concatenates outputs from multiple upstream workflows with static text and links.

### Section 1: Execution Summary Table

**Source:** `needs.parse_results.outputs.test_summary`

This is an HTML table generated by the `parse-results.yml` workflow. It contains two sub-sections:

#### Execution Summary Header

| Field | Value Example | Source |
|---|---|---|
| Application | Consumer OLB | `inputs.application` |
| Test Type | Smoke | `inputs.test_type` (dynamically resolved) |
| Browser | chrome | `inputs.browser` |
| Environment | sit | `inputs.environment` |
| Trigger | Manual / Scheduled / Automated | Derived from `github.event_name` |
| Execution Duration | 00:04:23 | Calculated from `results.json → stats.duration` |

#### Test Results Header

| Field | Color | Value Example |
|---|---|---|
| Total | Default | 48 |
| Passed ✅ | Green | 45 |
| Failed ❌ | Red | 2 |
| Flaky ⚠️ | Orange | 1 |
| Skipped ⏭️ | Gray | 0 |

**Overall Status Line:**
- `✅ All Tests Passed` — when Failed count is 0
- `❌ Some Tests Failed` — when any test failed
- `❌ Results Unavailable` — when `results.json` could not be located

### Section 2: Failure Analysis Table (Conditional)

**Source:** `needs.ai_failure_analysis.outputs.failure_table`

This section only appears when there are test failures. When all tests pass, the output is an empty string and nothing is rendered.

**Header:** `❌ Failure Analysis (N failures)`

**Table Columns:**

| Column | Width | Description |
|---|---|---|
| # | 30px | Sequential number |
| Test Name | Auto | Playwright spec title |
| File | Auto | Source file path (stripped of `tests/` prefix) |
| Severity | 80px | Color-coded badge: CRITICAL (red), HIGH (orange), MEDIUM (yellow), LOW (green) |
| Category | 120px | Failure type (e.g., TIMEOUT, AUTH FAILURE, ASSERTION FAILURE) |
| Root Cause | Auto | AI-generated explanation (truncated to 120 characters) |

**Table Styling:**
- Header row: Red background (`#dc2626`) with white text
- Alternating row colors: `#ffffff` / `#f8fafc`
- Severity badges: Inline `<span>` with rounded corners and category-specific background colors
- Maximum **15 rows** displayed; overflow shows: *"...and N more failure(s). See full AI Failure Analysis report for details."*

### Section 3: Playwright Report Artifacts Link

**Static text with dynamic URL:**

```html
<b>Playwright Report Artifacts:</b> https://github.com/{owner}/{repo}/actions/runs/{run_id}
```

This links to the GitHub Actions run page where the `playwright-report` artifact can be downloaded. The artifact contains the full interactive Playwright HTML report.

### Section 4: AI Failure Analysis Report Link

```html
<b>AI Failure Analysis Report:</b> https://github.com/{owner}/{repo}/actions/runs/{run_id}#artifacts (ai-failure-analysis)
```

Links to the artifacts section of the run page. The `ai-failure-analysis` artifact contains a rich HTML report with:
- Visual stat cards (passed/failed/flaky/skipped/pass rate)
- Failure category bar charts
- Severity distribution grid
- Detailed failure cards with error messages, root causes, and recommendations

### Section 5: BrowserStack Results Link

```html
<b>BrowserStack Results:</b> https://automation.browserstack.com/builds/{build_id}
```

**Conditional logic:**

```yaml
${{ needs.upload_browserstack_results.result == 'success'
    && needs.upload_browserstack_results.outputs.browserstack_url != ''
    && needs.upload_browserstack_results.outputs.browserstack_url
    || 'N/A' }}
```

- If BrowserStack upload succeeded **and** returned a URL → shows the direct BrowserStack build link
- Otherwise → shows **N/A**

BrowserStack upload is currently enabled only for the **SIT** environment.

---

## 7. Pipeline Job Dependency Chain

```yaml
send_notification:
  needs: [call-playwright-qa, upload_browserstack_results, parse_results, ai_failure_analysis]
```

The `send_notification` job waits for **all four upstream jobs** to complete before executing. Combined with `if: always()`, this guarantees:

1. All data sources have had a chance to run
2. The notification sends regardless of upstream job failures
3. Any output that couldn't be produced falls back gracefully (empty string or N/A)

### Job Execution Order

```
                    call-playwright-qa
                           │
              ┌────────────┼────────────────┬──────────────────┐
              ▼            ▼                ▼                  ▼
         parse_results  ai_failure     upload_browser      (other jobs)
                        _analysis      stack_results
              │            │                │
              └────────────┼────────────────┘
                           ▼
                    send_notification
```

All three data-provider jobs (`parse_results`, `ai_failure_analysis`, `upload_browserstack_results`) run **in parallel** since they all only depend on `call-playwright-qa`.

---

## 8. Data Source: Parse Results Workflow

**File:** `.github/workflows/parse-results.yml`

### Purpose

Parses the Playwright JSON report (`results.json`) and produces:
1. An HTML table (`test_summary`) for the email body
2. Individual numeric outputs for programmatic use

### Inputs

| Input | Default | Description |
|---|---|---|
| `artifact_name` | `test-results` | Name of the test-results artifact |
| `test_type` | `Sanity` | Label shown in the summary table |
| `browser` | `chrome` | Browser shown in the summary table |
| `environment` | `sit` | Environment shown in the summary table |
| `application` | `Consumer OLB` | Application name shown in the header |
| `trigger` | `Automated` | How the run was triggered |

### Outputs

| Output | Type | Description |
|---|---|---|
| `test_summary` | HTML string | Complete two-section HTML table ready for email embedding |
| `total` | number | Total test count |
| `passed` | number | Passed tests (`stats.expected`) |
| `failed` | number | Failed tests (`stats.unexpected`) |
| `flaky` | number | Flaky tests (`stats.flaky`) |
| `skipped` | number | Skipped tests (`stats.skipped`) |

### How It Locates results.json

The workflow tries multiple paths in order:

1. `test-results/results.json` (primary)
2. `test-results/test-results/results.json` (nested artifact extraction)
3. `find test-results -name 'results.json'` (recursive search)
4. `find all-artifacts -name 'results.json'` (fallback to all-artifacts download)

If none found, it produces a "Results Unavailable" summary table so the email still sends.

### Duration Calculation

```bash
DURATION_MS=$(jq -r '.stats.duration // 0 | floor' "$RESULTS_FILE")
HOURS=$((DURATION_MS / 3600000))
MINUTES=$(((DURATION_MS % 3600000) / 60000))
SECONDS=$(((DURATION_MS % 60000) / 1000))
DURATION=$(printf "%02d:%02d:%02d" "$HOURS" "$MINUTES" "$SECONDS")
```

Converts Playwright's millisecond duration to `HH:MM:SS` format.

### Output Mechanism

Uses GitHub Actions' heredoc syntax for multiline HTML output:

```bash
{
  echo 'summary<<EOF'
  echo "<b>Automated Test Execution Summary...</b>"
  echo '<table>...</table>'
  echo 'EOF'
} >> $GITHUB_OUTPUT
```

---

## 9. Data Source: AI Failure Analysis Workflow

**File:** `.github/workflows/ai-failure-analysis.yml`

### Purpose

Analyzes test failures from `results.json`, categorizes each by pattern-matched failure type, generates root causes and recommendations.

### Output Used by Email

| Output | Type | Description |
|---|---|---|
| `failure_table` | HTML string | Compact HTML table with failure details (empty when no failures) |

### Failure Table Details

- Up to **15 failures** shown inline with columns: #, Test Name, File, Severity, Category, Root Cause
- Color-coded severity badges (CRITICAL=red bg, HIGH=orange bg, MEDIUM=yellow bg, LOW=green bg)
- Root cause truncated to 120 characters in the email (full version in the HTML artifact)
- Header row styled with red (`#dc2626`) background

### When It's Empty

When all tests pass (`analyzed.length === 0`), the output is an empty string. This means nothing extra appears in the email between the summary table and the report links.

For full details on the AI analyzer, see [AI-TEST-ANALYZER.md](AI-TEST-ANALYZER.md).

---

## 10. Data Source: BrowserStack Upload Workflow

**File:** `.github/workflows/upload-browserstack-results.yml`

### Purpose

Uploads the JUnit XML report to BrowserStack Test Observability and extracts the build URL.

### Output Used by Email

| Output | Type | Description |
|---|---|---|
| `browserstack_url` | string | Full BrowserStack build URL (e.g., `https://automation.browserstack.com/builds/abc123`) or empty string |

### Conditional Upload

BrowserStack upload is controlled by the `bs_upload` input, which is currently:
- **SIT** → `true` (upload enabled)
- **QA** → `false` (upload disabled)
- **UAT** → `false` (upload disabled)

When disabled or when credentials are missing, the output is an empty string, and the email shows **N/A** for BrowserStack Results.

For full details on BrowserStack integration, see [BROWSERSTACK_UPLOAD_PROCESS.md](BROWSERSTACK_UPLOAD_PROCESS.md).

---

## 11. Artifact Attachments

The notification action attaches artifacts to the email:

```yaml
artifact_names: 'playwright-report'
```

This attaches the **Playwright HTML report** artifact, allowing email recipients to download it directly without visiting GitHub.

### What's in the playwright-report artifact?

- `index.html` — Interactive Playwright HTML report
- `data/` — Test result data files
- Sub-folders — Timestamped report snapshots

### Other Artifacts (Link Only, Not Attached)

| Artifact | Access Method | Why Not Attached |
|---|---|---|
| `ai-failure-analysis` | Link to GitHub Actions run | Small HTML file; summary is already inline in email |
| `smoke-test-results` | Link to GitHub Actions run | Raw test data; not useful to download directly |
| `screenshots-{browser}` | Link to GitHub Actions run | Can be large; accessible from Playwright report |

---

## 12. Notification Action — panda-github-native-notification-action

### Action Reference

```yaml
uses: Banking-Solutions-Digital/panda-github-native-notification-action@1.0.1
```

This is an **internal organization action** that delivers email notifications via GitHub's platform infrastructure.

### Inputs

| Input | Type | Description |
|---|---|---|
| `team` | string | Comma-separated list of GitHub usernames to notify |
| `artifact_names` | string | Comma-separated artifact names to attach to the email |
| `message` | string (multiline) | HTML body content of the email |

### How It Works

1. Resolves GitHub usernames to their associated email addresses
2. Composes an email with the provided HTML `message` as the body
3. Attaches any specified artifacts from the current workflow run
4. Delivers via GitHub's native notification infrastructure

### No External Configuration Needed

Unlike SMTP-based solutions, this action:
- Does **not** require SMTP server credentials
- Does **not** require email API keys (SendGrid, SES, etc.)
- Does **not** require environment variables for email configuration
- Works entirely within the GitHub platform using OIDC token authentication

---

## 13. Complete send_notification Job Reference

Here is the full YAML for the notification job as it exists in `Playwright-automated-run.yml`:

```yaml
send_notification:
  needs: [call-playwright-qa, upload_browserstack_results, parse_results, ai_failure_analysis]
  if: ${{ always() && (github.event_name == 'push' || github.event_name == 'schedule' || (github.event_name == 'workflow_dispatch' && inputs.email != '')) }}
  runs-on: ubuntu-latest-2-8
  permissions:
    id-token: write
    contents: write
    actions: read
  steps:
    - name: Send Email with Artifacts
      uses: Banking-Solutions-Digital/panda-github-native-notification-action@1.0.1
      with:
        team: ${{ github.event_name == 'workflow_dispatch' && inputs.email || 'Krishna-Kota' }}
        artifact_names: 'playwright-report'
        message: |
          <br>
          ${{ needs.parse_results.outputs.test_summary }}
          ${{ needs.ai_failure_analysis.outputs.failure_table }}
          <b>Playwright Report Artifacts:</b> https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}
          <br>
          <b>AI Failure Analysis Report:</b> https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}#artifacts (ai-failure-analysis)
          <br>
          <b>BrowserStack Results:</b> ${{ needs.upload_browserstack_results.result == 'success' && needs.upload_browserstack_results.outputs.browserstack_url != '' && needs.upload_browserstack_results.outputs.browserstack_url || 'N/A' }}
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| `if: always()` | Email must send even when tests fail |
| `needs: [all 4 jobs]` | Waits for all data to be available |
| `runs-on: ubuntu-latest-2-8` | Lightweight runner (only sends email, no heavy compute) |
| `permissions: id-token: write` | Required for OIDC authentication with the notification action |
| `message: \|` | YAML multiline literal preserving line breaks in HTML |

---

## 14. Dynamic Values & Expression Logic

### Test Type Resolution

The test type displayed in the email is resolved from the event type using cascading ternary logic:

```yaml
test_type: >-
  ${{ github.event_name == 'push' && 'Sanity' ||
      (github.event_name == 'schedule' && github.event.schedule == '30 4 * * 1-4' && 'Smoke') ||
      (github.event_name == 'schedule' && github.event.schedule == '30 4 * * 5' && 'Regression') ||
      (github.event_name == 'workflow_dispatch' && inputs.test_type == 'sanity' && 'Sanity') ||
      (github.event_name == 'workflow_dispatch' && inputs.test_type == 'smoke' && 'Smoke') ||
      (github.event_name == 'workflow_dispatch' && inputs.test_type == 'regression' && 'Regression') ||
      'Smoke' }}
```

| Event | Schedule | Input | Result |
|---|---|---|---|
| `push` | — | — | Sanity |
| `schedule` | Mon–Thu `30 4 * * 1-4` | — | Smoke |
| `schedule` | Friday `30 4 * * 5` | — | Regression |
| `workflow_dispatch` | — | `sanity` | Sanity |
| `workflow_dispatch` | — | `smoke` | Smoke |
| `workflow_dispatch` | — | `regression` | Regression |
| (any other) | — | — | Smoke (fallback) |

### Trigger Label Resolution

```yaml
trigger: ${{ github.event_name == 'workflow_dispatch' && 'Manual' || (github.event_name == 'schedule' && 'Scheduled') || 'Automated' }}
```

| Event | Trigger Label |
|---|---|
| `workflow_dispatch` | Manual |
| `schedule` | Scheduled |
| `push` (or any other) | Automated |

### BrowserStack URL Conditional

```yaml
${{ needs.upload_browserstack_results.result == 'success'
    && needs.upload_browserstack_results.outputs.browserstack_url != ''
    && needs.upload_browserstack_results.outputs.browserstack_url
    || 'N/A' }}
```

This three-part AND ensures:
1. The upload job completed successfully
2. The URL output is not empty
3. Only then is the URL displayed

Otherwise → `N/A`

---

## 15. Email Layout — Visual Reference

### All Tests Passed

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Automated Test Execution Summary — Consumer OLB             │
│  Date: 18 Mar 2026                                           │
│  Overall Status: ✅ All Tests Passed                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │           Execution Summary                          │    │
│  ├──────────────────────┬───────────────────────────────┤    │
│  │ Application:         │ Consumer OLB                  │    │
│  │ Test Type:           │ Smoke                         │    │
│  │ Browser:             │ chrome                        │    │
│  │ Environment:         │ sit                           │    │
│  │ Trigger:             │ Scheduled                     │    │
│  │ Execution Duration:  │ 00:04:23                      │    │
│  ├──────────────────────┴───────────────────────────────┤    │
│  │           Test Results                               │    │
│  ├──────────────────────┬───────────────────────────────┤    │
│  │ Total                │ 48                            │    │
│  │ Passed ✅            │ 48  (green)                   │    │
│  │ Failed ❌            │ 0   (red)                     │    │
│  │ Flaky ⚠️            │ 0   (orange)                  │    │
│  │ Skipped ⏭️          │ 0   (gray)                    │    │
│  └──────────────────────┴───────────────────────────────┘    │
│                                                              │
│  Playwright Report Artifacts: <link to GH Actions run>       │
│                                                              │
│  AI Failure Analysis Report: <link to artifact>              │
│                                                              │
│  BrowserStack Results: <link or N/A>                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Tests Failed (with Failure Table)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Automated Test Execution Summary — Consumer OLB             │
│  Date: 18 Mar 2026                                           │
│  Overall Status: ❌ Some Tests Failed                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │           Execution Summary                          │    │
│  ├──────────────────────┬───────────────────────────────┤    │
│  │ Application:         │ Consumer OLB                  │    │
│  │ Test Type:           │ Smoke                         │    │
│  │ Browser:             │ chrome                        │    │
│  │ Environment:         │ sit                           │    │
│  │ Trigger:             │ Manual                        │    │
│  │ Execution Duration:  │ 00:06:12                      │    │
│  ├──────────────────────┴───────────────────────────────┤    │
│  │           Test Results                               │    │
│  ├──────────────────────┬───────────────────────────────┤    │
│  │ Total                │ 48                            │    │
│  │ Passed ✅            │ 45  (green)                   │    │
│  │ Failed ❌            │ 2   (red)                     │    │
│  │ Flaky ⚠️            │ 1   (orange)                  │    │
│  │ Skipped ⏭️          │ 0   (gray)                    │    │
│  └──────────────────────┴───────────────────────────────┘    │
│                                                              │
│  ❌ Failure Analysis (2 failures)                            │
│  ┌───┬──────────────┬───────────┬──────────┬────────────┐   │
│  │ # │ Test Name    │ File      │ Severity │ Root Cause │   │
│  ├───┼──────────────┼───────────┼──────────┼────────────┤   │
│  │ 1 │ Login Verify │ Login...  │ CRITICAL │ VAULT...   │   │
│  │ 2 │ Transfer ... │ Trans...  │ HIGH     │ Element... │   │
│  └───┴──────────────┴───────────┴──────────┴────────────┘   │
│                                                              │
│  Playwright Report Artifacts: <link to GH Actions run>       │
│                                                              │
│  AI Failure Analysis Report: <link to artifact>              │
│                                                              │
│  BrowserStack Results: https://automation.browserstack.com/  │
│                         builds/abc123def456                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 16. Customization Guide

### Change Default Email Recipients

Edit `Playwright-automated-run.yml` in two places:

**1. Input default value:**
```yaml
email:
  description: 'Notification recipient GitHub username(s), comma-separated'
  required: false
  default: 'NewUser1'   # ← Change here
```

**2. Fallback in team expression:**
```yaml
team: ${{ github.event_name == 'workflow_dispatch' && inputs.email || 'NewUser1' }}
                                                                       # ← Change here too
```

### Add New Report Link to Email

Add a new line to the `message:` block in `Playwright-automated-run.yml`:

```yaml
message: |
  <br>
  ${{ needs.parse_results.outputs.test_summary }}
  ${{ needs.ai_failure_analysis.outputs.failure_table }}
  <b>Playwright Report Artifacts:</b> https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}
  <br>
  <b>AI Failure Analysis Report:</b> https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}#artifacts (ai-failure-analysis)
  <br>
  <b>Your New Link:</b> https://example.com/your-dashboard
  <br>
  <b>BrowserStack Results:</b> ...
```

### Attach Additional Artifacts

Add artifact names (comma-separated) to the `artifact_names` input:

```yaml
artifact_names: 'playwright-report,screenshots-chrome'
```

### Modify the Execution Summary Table

Edit `parse-results.yml` in the shell script that builds the HTML table. For example, to add a "Pass Rate" row:

```bash
PASS_RATE=$((PASSED * 100 / TOTAL))
echo "  <tr><td><b>Pass Rate</b></td><td style=\"color:blue;\">${PASS_RATE}%</td></tr>"
```

### Change the Failure Table Row Limit

Edit `ai-failure-analysis.yml`, find `var maxRows = 15;` and change to your preferred number.

### Disable Email for Specific Triggers

To stop email on push events (for example), modify the condition:

```yaml
# Before (sends on push):
if: ${{ always() && (github.event_name == 'push' || github.event_name == 'schedule' || ...) }}

# After (no email on push):
if: ${{ always() && (github.event_name == 'schedule' || ...) }}
```

### Change the Scheduled Run Times

Edit the cron expressions in the `on.schedule` block:

```yaml
schedule:
  - cron: '30 4 * * 1-4'   # Mon-Thu at 4:30 AM UTC (10:00 AM IST)
  - cron: '30 4 * * 5'     # Friday at 4:30 AM UTC (10:00 AM IST)
```

Cron format: `minute hour day-of-month month day-of-week`

---

## 17. Required GitHub Permissions & Secrets

### Repository Settings

Ensure the repository has:
- **Actions** enabled under Settings → Actions → General
- **Artifact retention** configured (default or custom; AI analysis uses 3 days)
- **Workflow permissions** set to "Read and write permissions" under Settings → Actions → General → Workflow permissions

### Runner

The `send_notification` job uses `ubuntu-latest-2-8`, which is an organization-hosted runner label. If using a different runner fleet, update:

```yaml
runs-on: ubuntu-latest-2-8   # ← Change to your runner label
```

### Permissions Block

```yaml
permissions:
  id-token: write    # OIDC token for notification action authentication
  contents: write    # Repository content access
  actions: read      # Read workflow run metadata and artifacts
```

All three are required. If any is missing, the notification action may fail silently.

---

## 18. Graceful Degradation & Error Handling

The email notification system is designed to **never block** and to degrade gracefully:

### Upstream Job Failure Handling

| Scenario | Impact on Email |
|---|---|
| `call-playwright-qa` fails | Email still sends; summary may show "Results Unavailable" |
| `parse_results` fails | Summary table is empty/missing; links still appear |
| `ai_failure_analysis` fails | Failure table is missing; summary and links still appear |
| `upload_browserstack_results` fails | BrowserStack link shows "N/A" |
| All upstream jobs fail | Email sends with minimal content (just links) |

### Why This Works

1. **`if: always()`** on the `send_notification` job
2. **`continue-on-error: true`** on all artifact download and analysis steps in upstream workflows
3. **Fallback values** in GitHub Actions expressions (e.g., `|| 'N/A'`)
4. **Path B fallback** in `parse-results.yml` that generates a "Results Unavailable" table when `results.json` is missing
5. **Empty string output** from `ai-failure-analysis.yml` when no failures exist or analysis fails

### What If the Notification Action Itself Fails?

If the `panda-github-native-notification-action` fails:
- The GitHub Actions run will show the `send_notification` job as failed
- No email is delivered
- All other artifacts (Playwright report, AI analysis, screenshots) are still available on the Actions run page
- Check the job logs for error details (usually authentication or permission issues)

---

## 19. Troubleshooting

### Email Not Received

**Check 1: Did the send_notification job run?**
- Go to the GitHub Actions run → check if `send_notification` shows as skipped or failed
- If skipped: the `if` condition wasn't met (e.g., manual dispatch with empty email field)

**Check 2: Is the username correct?**
- The `team` field must contain valid GitHub usernames (organization-scoped)
- Verify the username format: `FirstLast-Name_orgSuffix`
- Check if the username exists in the `Banking-Solutions-Digital` org

**Check 3: Permissions**
- Ensure all three permissions (`id-token: write`, `contents: write`, `actions: read`) are set
- Check if repository-level or org-level policies restrict Actions permissions

**Check 4: Check spam/junk folder**
- GitHub notification emails may be filtered by corporate email rules

### Email Received But Missing Summary Table

**Cause:** The `parse_results` job failed or `results.json` was not found.

**Fix:**
1. Check the `parse_results` job logs for errors
2. Verify the `smoke-test-results` artifact was uploaded by the test runner
3. Ensure `playwright.config.ts` includes `['json', { outputFile: 'test-results/results.json' }]`

### Email Received But Missing Failure Table

**Cause:** The `ai_failure_analysis` job failed or produced empty output.

**Fix:**
1. Check the `ai_failure_analysis` job logs
2. If there were failures, verify the inline Node.js script ran without errors
3. Ensure the `failure_table` output is referenced in the message: `${{ needs.ai_failure_analysis.outputs.failure_table }}`

### BrowserStack Link Shows N/A

**Cause:** BrowserStack upload is disabled for this environment, or credentials are missing.

**Fix:**
1. Check if `bs_upload` evaluates to `true` for the target environment
2. Verify `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY` secrets are set in repository settings
3. Check the `upload_browserstack_results` job logs

### Email Subject Line Not Customizable

The email subject is determined by the `panda-github-native-notification-action`. It typically uses the workflow run name:

```
Playwright Manual - Smoke Tests
```

This is derived from the `run-name:` field at the top of `Playwright-automated-run.yml`.

### HTML Rendering Issues in Email

Some email clients (Outlook, Gmail) strip or modify CSS. The email uses:
- **Inline CSS** (not external stylesheets)
- **Table-based layout** (maximum compatibility)
- **Simple HTML** (no JavaScript, no external resources)

If rendering issues persist, the Playwright report artifact provides the full interactive report.

---

## 20. FAQ

**Q: Do I need to install or configure an email server?**
A: No. The notification action uses GitHub's built-in notification infrastructure. No SMTP, SendGrid, or SES setup is required.

**Q: Can I send to external email addresses (non-GitHub users)?**
A: The `panda-github-native-notification-action` resolves usernames within the GitHub organization. For external recipients, the GitHub user must have their email configured in their GitHub profile and notification settings.

**Q: What happens when all tests pass?**
A: The email sends with the summary table showing ✅ All Tests Passed. The failure analysis table is empty, so it doesn't appear. Report links are still included.

**Q: Can I add CC or BCC recipients?**
A: The current action supports a simple comma-separated `team` list. All recipients receive the email equally. CC/BCC is not natively supported.

**Q: What is the maximum email size?**
A: The message body is composed from GitHub Actions outputs, which have a maximum of ~1MB per output. The failure table is capped at 15 rows to keep it well within limits. Artifact attachments are handled separately by the action.

**Q: Can I preview the email before sending?**
A: Not directly. However, you can:
1. Check the `parse_results` job output for the HTML summary
2. Check the `ai_failure_analysis` job output for the failure table
3. Combine them manually in an HTML file to preview

**Q: How do I test email notifications without running the full pipeline?**
A: Trigger a manual dispatch with the desired email recipients. The pipeline runs the full test suite, so there's no way to send a test email without test execution. For debugging the email format, modify the `message` field temporarily with static content.

**Q: Does the email include screenshots?**
A: Not directly. Screenshots are available in:
1. The `playwright-report` artifact (interactive report with embedded screenshots)
2. The `screenshots-{browser}` artifact (raw screenshot files)
3. The Playwright trace viewer (accessible from the HTML report)

**Q: Can I change the email domain or sender address?**
A: No. The sender is determined by GitHub's notification infrastructure. Emails come from GitHub's notification system (typically `notifications@github.com` or similar).

**Q: What's the latency between test completion and email delivery?**
A: The `send_notification` job runs on `ubuntu-latest-2-8` and typically completes in under 30 seconds. Email delivery depends on GitHub's notification infrastructure, but is usually within 1–2 minutes after the job completes.

---

## File Reference Summary

| File | Path | Role |
|---|---|---|
| `Playwright-automated-run.yml` | `.github/workflows/` | Main orchestrator; contains `send_notification` job |
| `parse-results.yml` | `.github/workflows/` | Generates execution summary table |
| `ai-failure-analysis.yml` | `.github/workflows/` | Generates failure analysis table |
| `upload-browserstack-results.yml` | `.github/workflows/` | Extracts BrowserStack build URL |
| `playwright.config.ts` | Project root | Configures reporters that produce the input data |

## Related Documentation

- [AI-TEST-ANALYZER.md](AI-TEST-ANALYZER.md) — Full documentation on the AI failure analysis system
- [BROWSERSTACK_UPLOAD_PROCESS.md](BROWSERSTACK_UPLOAD_PROCESS.md) — BrowserStack integration details
- [FRAMEWORK_DOCUMENTATION.md](FRAMEWORK_DOCUMENTATION.md) — Complete framework architecture and guide

---

*Generated for Playwright Automation Framework — March 2026*
