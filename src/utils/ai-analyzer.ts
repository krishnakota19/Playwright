/**
 * ============================================================
 * AI FAILURE ANALYZER FOR PLAYWRIGHT TEST RESULTS
 * ============================================================
 * AUTHOR      : Automation Framework Team
 * DATE        : 2026-03-18
 * DESCRIPTION : Analyzes Playwright test failures from results.json,
 *               categorizes errors, provides AI-powered root cause
 *               analysis with fix recommendations, and generates
 *               an HTML report.
 *
 * USAGE:
 *   npx ts-node tests/utils/ai-failure-analyzer.ts
 *   npx ts-node tests/utils/ai-failure-analyzer.ts --input test-results/results.json
 *   npx ts-node tests/utils/ai-failure-analyzer.ts --input test-results/results.json --openai
 *
 * OPTIONAL ENV VARS:
 *   OPENAI_API_KEY=sk-...         → Enables OpenAI GPT-4 analysis
 *   AZURE_OPENAI_KEY=...          → Enables Azure OpenAI analysis
 *   AZURE_OPENAI_ENDPOINT=https://...  → Azure endpoint
 *   AZURE_OPENAI_DEPLOYMENT=...   → Azure deployment name
 * ============================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface PlaywrightTestResult {
  config: { rootDir: string };
  suites: PlaywrightSuite[];
  stats: {
    startTime: string;
    duration: number;
    expected: number;
    skipped: number;
    unexpected: number;
    flaky: number;
  };
}

interface PlaywrightSuite {
  title: string;
  file?: string;
  suites?: PlaywrightSuite[];
  tests?: PlaywrightTest[];
  specs?: PlaywrightSpec[];
}

interface PlaywrightSpec {
  title: string;
  ok: boolean;
  tests: PlaywrightTest[];
}

interface PlaywrightTest {
  testId: string;
  title: string;
  ok: boolean;
  status?: string;
  tags?: string[];
  annotations?: { type: string; description?: string }[];
  projectName?: string;
  location?: { file: string; line: number; column: number };
  results: PlaywrightTestRun[];
}

interface PlaywrightTestRun {
  workerIndex: number;
  status: 'passed' | 'failed' | 'skipped' | 'interrupted' | 'timedOut';
  duration: number;
  errors?: PlaywrightError[];
  attachments?: { name: string; path: string; contentType: string }[];
  stdout?: { text: string }[];
  stderr?: { text: string }[];
  steps?: PlaywrightStep[];
  retry: number;
}

interface PlaywrightError {
  message?: string;
  stack?: string;
  location?: { file: string; line: number; column: number };
  snippet?: string;
}

interface PlaywrightStep {
  title: string;
  category: string;
  duration: number;
  error?: PlaywrightError;
  steps?: PlaywrightStep[];
}

// ─────────────────────────────────────────────────────────────────────────────
// FAILURE CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────

type FailureCategory =
  | 'TIMEOUT'
  | 'LOCATOR_NOT_FOUND'
  | 'ASSERTION_FAILURE'
  | 'NAVIGATION_ERROR'
  | 'ELEMENT_NOT_VISIBLE'
  | 'ELEMENT_NOT_ENABLED'
  | 'AUTH_FAILURE'
  | 'NETWORK_ERROR'
  | 'PAGE_CRASH'
  | 'STEP_FAILURE'
  | 'UNKNOWN';

interface AnalyzedFailure {
  testTitle: string;
  filePath: string;
  projectName: string;
  duration: number;
  retries: number;
  category: FailureCategory;
  errorMessage: string;
  stackTrace: string;
  failedStep: string;
  rootCause: string;
  recommendations: string[];
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  aiEnhanced: boolean;
  aiSummary?: string;
  tags: string[];
}

interface AnalysisSummary {
  totalFailed: number;
  totalPassed: number;
  totalSkipped: number;
  totalFlaky: number;
  runDuration: string;
  runDate: string;
  categoryBreakdown: Record<FailureCategory, number>;
  severityBreakdown: Record<string, number>;
  topFailingFiles: { file: string; count: number }[];
  failures: AnalyzedFailure[];
  aiEnabled: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// FAILURE PATTERN RULES (rule-based AI)
// ─────────────────────────────────────────────────────────────────────────────

interface PatternRule {
  name: FailureCategory;
  patterns: RegExp[];
  rootCause: (msg: string) => string;
  recommendations: string[];
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

const FAILURE_PATTERNS: PatternRule[] = [
  {
    name: 'TIMEOUT',
    patterns: [
      /timeout\s*(\d+)ms exceeded/i,
      /waiting for.*to be visible/i,
      /waiting for.*locator/i,
      /test timeout of \d+ms exceeded/i,
      /action timeout of \d+ms exceeded/i,
      /navigation timeout/i,
    ],
    rootCause: (msg: string) => {
      const msMatch = msg.match(/(\d+)ms/);
      const ms = msMatch ? msMatch[1] : 'configured';
      if (/navigation/i.test(msg)) {
        return `Page navigation timed out after ${ms}ms. The page may be slow to load, or the URL/environment may be unreachable.`;
      }
      if (/locator|waiting for/i.test(msg)) {
        return `A UI element was not found or visible within the ${ms}ms action timeout. This could indicate a selector change, slow render, or missing test data.`;
      }
      return `The test exceeded the ${ms}ms timeout. The application may be responding slowly or the environment may be degraded.`;
    },
    recommendations: [
      'Verify the test environment is available and responding',
      'Check if the locator/selector is still valid in the current application version',
      'Inspect screenshots attached to this test for the last visible state',
      'Consider adding an explicit wait or increasing actionTimeout in playwright.config.ts',
      'Check for network throttling or CI environment resource constraints',
    ],
    severity: 'HIGH',
  },
  {
    name: 'LOCATOR_NOT_FOUND',
    patterns: [
      /locator.*not found/i,
      /no element matching.*selector/i,
      /strict mode violation/i,
      /resolved to \d+ element/i,
      /getByRole\(|getByText\(|getByLabel\(|getByTestId\(/,
    ],
    rootCause: (msg: string) => {
      if (/strict mode/i.test(msg)) {
        return 'Strict mode violation: the locator matched more than one element. The selector needs to be more specific.';
      }
      return 'The element could not be located in the DOM. The selector may be outdated due to a UI change, or the element may not be rendered due to missing test data / conditional logic.';
    },
    recommendations: [
      'Open the Playwright trace/screenshot to inspect the DOM at failure point',
      'Verify the selector matches current HTML - check if element role/name/text changed',
      'Use page.locator().count() to debug how many elements match',
      'Check if the page/component has been updated and locators need refreshing',
      'Ensure test preconditions (test data, login state) are met before the element is expected',
    ],
    severity: 'HIGH',
  },
  {
    name: 'ASSERTION_FAILURE',
    patterns: [
      /expect\(received\)\.to/i,
      /expected.*received/i,
      /toBe|toEqual|toContain|toMatch|toHaveText|toHaveValue|toBeVisible|toBeChecked/i,
      /Expected value to/i,
      /AssertionError/i,
    ],
    rootCause: (msg: string) => {
      const expectedMatch = msg.match(/Expected[:\s]+"?([^"\\n]+)"?/i);
      const receivedMatch = msg.match(/Received[:\s]+"?([^"\\n]+)"?/i);
      if (expectedMatch && receivedMatch) {
        return `Assertion mismatch — Expected: "${expectedMatch[1].trim()}" but Received: "${receivedMatch[1].trim()}". The application may have returned unexpected data or the assertion values are outdated.`;
      }
      return 'An assertion failed — the actual value from the application did not match the expected value in the test. This usually indicates a functional regression or outdated test data.';
    },
    recommendations: [
      'Compare expected vs received values in the error message',
      'Check if the application behaviour/data has changed since the test was written',
      'Verify test data in testData.json is current and matches the environment',
      'Review the last PASS screenshot vs the failure screenshot to spot UI differences',
      'If this is a data-dependent assertion, ensure the environment has the correct test data setup',
    ],
    severity: 'MEDIUM',
  },
  {
    name: 'NAVIGATION_ERROR',
    patterns: [
      /net::ERR_/i,
      /ERR_CONNECTION_REFUSED/i,
      /ERR_NAME_NOT_RESOLVED/i,
      /Failed to navigate/i,
      /page.goto.*failed/i,
      /ECONNREFUSED/i,
    ],
    rootCause: (_msg: string) => {
      return 'Navigation to the application URL failed. The target environment may be down, the URL may be incorrect, or there may be a network/DNS issue preventing connection.';
    },
    recommendations: [
      'Verify the BASE_URL or environment URL in config/.env is correct',
      'Check if the test environment (SIT/QA) is running and accessible',
      'Test the URL in a browser manually to confirm reachability',
      'Check VPN / network connectivity if running locally',
      'Review globalSetup.ts for any environment health checks',
    ],
    severity: 'CRITICAL',
  },
  {
    name: 'ELEMENT_NOT_VISIBLE',
    patterns: [
      /element is not visible/i,
      /not visible/i,
      /element.*hidden|is hidden|visibility:\s*hidden/i,
      /element is outside of the viewport/i,
      /element intercepts pointer events/i,
    ],
    rootCause: (_msg: string) => {
      return 'The target element exists in the DOM but is not visible or accessible for interaction. It may be hidden, overlapped by another element, or outside the viewport.';
    },
    recommendations: [
      'Check if the element is conditionally rendered and the condition is not met',
      'Use page.waitForSelector() with state: "visible" before interacting',
      'Inspect the screenshot to see what is overlapping or hiding the element',
      'Consider scrolling the element into view with locator.scrollIntoViewIfNeeded()',
      'Verify the page has fully loaded before attempting the interaction',
    ],
    severity: 'MEDIUM',
  },
  {
    name: 'ELEMENT_NOT_ENABLED',
    patterns: [
      /element is not enabled/i,
      /element.*disabled|is disabled|attribute.*disabled/i,
      /not interactable/i,
      /element has attribute "disabled"/i,
    ],
    rootCause: (_msg: string) => {
      return 'The target element is present and visible but is disabled. The expected pre-conditions to enable this element may not have been met.';
    },
    recommendations: [
      'Verify the required form fields or steps before this element are completed',
      'Check if the element enable/disable logic is data-driven (e.g., account balance, permissions)',
      'Add an assertion to confirm prior steps succeeded before interacting with this element',
      'Inspect the application state in the failure screenshot',
    ],
    severity: 'MEDIUM',
  },
  {
    name: 'AUTH_FAILURE',
    patterns: [
      /login failed/i,
      /invalid credentials/i,
      /unauthorized/i,
      /authentication/i,
      /vault token/i,
      /vault.*not provided/i,
      /invalid.*password|wrong.*password|password.*incorrect|password.*expired|password.*failed/i,
      /invalid.*username|wrong.*username|invalid.*user/i,
      /401/,
      /403/,
      /session expired/i,
    ],
    rootCause: (msg: string) => {
      if (/vault token/i.test(msg) || /vault.*not provided/i.test(msg)) {
        return 'The VAULT_TOKEN environment variable is missing or empty. Tests that use the validCredentials fixture require a HashiCorp Vault token to retrieve login credentials at runtime.';
      }
      return 'Authentication failed during the test. The test credentials may be invalid, expired, or the vault secret may not have been retrieved correctly.';
    },
    recommendations: [
      'Set the VAULT_TOKEN environment variable before running tests: $env:VAULT_TOKEN="your-token"',
      'Verify VAULT_ADDR is set to the correct Vault server URL in config/.env',
      'Run tests with credentials directly via testData.json for local debugging (if Vault is unavailable)',
      'Check if the user account is locked or requires a password reset',
      'Review customFixtures.ts to understand how validCredentials fetches secrets from Vault',
    ],
    severity: 'CRITICAL',
  },
  {
    name: 'NETWORK_ERROR',
    patterns: [
      /request failed/i,
      /fetch failed/i,
      /api.*error/i,
      /500 internal server/i,
      /502 bad gateway/i,
      /503 service unavailable/i,
      /Response status: [4-5]\d\d/i,
    ],
    rootCause: (_msg: string) => {
      return 'A network request during the test returned an error response. The backend API may be down, deployed with a breaking change, or the test is hitting an invalid endpoint.';
    },
    recommendations: [
      'Check the browser network logs (available in Playwright traces)',
      'Verify the backend services are healthy in the target environment',
      'Review if there was a recent deployment that may have changed API contracts',
      'Check if appropriate CSP/CORS headers are configured for the test environment',
    ],
    severity: 'HIGH',
  },
  {
    name: 'PAGE_CRASH',
    patterns: [
      /page crashed/i,
      /target closed/i,
      /browser.*closed/i,
      /context.*destroyed/i,
      /execution context was destroyed/i,
    ],
    rootCause: (_msg: string) => {
      return 'The browser page or context crashed unexpectedly during the test. This can be caused by a JavaScript error on the page, memory pressure, or a Playwright/browser version mismatch.';
    },
    recommendations: [
      'Check browser console errors in the Playwright trace viewer',
      'Verify the application does not have JavaScript errors that crash the page',
      'Ensure sufficient memory/CPU resources are available on the test runner',
      'Run `npx playwright install` to ensure browser binaries are up to date',
      'Check for async race conditions causing multiple navigations',
    ],
    severity: 'CRITICAL',
  },
  {
    name: 'STEP_FAILURE',
    patterns: [
      /FAIL\s*-/i,
      /step.*failed/i,
      /Report\.fail/i,
    ],
    rootCause: (_msg: string) => {
      return 'A custom test step explicitly reported a failure via Report.fail(). This is a functional test failure detected by the test assertions in the business function.';
    },
    recommendations: [
      'Review the failing step message for details on what specifically failed',
      'Check the attached screenshot for the FAIL step to see the application state',
      'Verify the business function logic matches the current application behaviour',
      'Cross-check with manual testing to confirm if this is a real defect or a test data issue',
    ],
    severity: 'HIGH',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PATTERN MATCHER
// ─────────────────────────────────────────────────────────────────────────────

function categorizeFailure(errorMessage: string, stackTrace: string): PatternRule {
  const combined = `${errorMessage}\n${stackTrace}`;
  for (const rule of FAILURE_PATTERNS) {
    if (rule.patterns.some(p => p.test(combined))) {
      return rule;
    }
  }
  return {
    name: 'UNKNOWN',
    patterns: [],
    rootCause: () => 'The failure does not match a recognized pattern. Manual investigation is required.',
    recommendations: [
      'Review the full error message and stack trace',
      'Check the latest screenshot and Playwright trace for context',
      'Compare with similar passing tests to identify differences',
    ],
    severity: 'MEDIUM',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXTRACT FAILED STEP TITLE
// ─────────────────────────────────────────────────────────────────────────────

function findFailedStep(steps: PlaywrightStep[] = [], depth = 0): string {
  for (const step of steps) {
    if (step.error) {
      return `${'  '.repeat(depth)}${step.title}`;
    }
    if (step.steps?.length) {
      const nested = findFailedStep(step.steps, depth + 1);
      if (nested) return nested;
    }
  }
  return '';
}

// ─────────────────────────────────────────────────────────────────────────────
// COLLECT ALL FAILED TESTS
// ─────────────────────────────────────────────────────────────────────────────

function collectFailedTests(suite: PlaywrightSuite, filePath: string): PlaywrightTest[] {
  const failed: PlaywrightTest[] = [];
  const currentFile = suite.file || filePath;

  if (suite.specs) {
    for (const spec of suite.specs) {
      // In Playwright JSON output, `ok` and `title` live on the spec, not the test
      if (spec.ok === false || !spec.ok) {
        for (const test of spec.tests) {
          if (test.status === 'unexpected' || test.status === 'failed' ||
              (test.results && test.results.some(r => r.status === 'failed'))) {
            // Merge spec title into the test object (spec has the human-readable title)
            failed.push({
              ...test,
              title: spec.title || test.title || 'Unknown Test',
              location: test.location ?? { file: currentFile, line: 0, column: 0 },
            });
          }
        }
      }
    }
  }

  if (suite.tests) {
    for (const test of suite.tests) {
      if (!test.ok) {
        failed.push(test);
      }
    }
  }

  if (suite.suites) {
    for (const child of suite.suites) {
      failed.push(...collectFailedTests(child, currentFile));
    }
  }

  return failed;
}

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONAL: OPENAI / AZURE OPENAI ENHANCED ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

async function callOpenAI(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const openaiKey = process.env.OPENAI_API_KEY;
    const azureKey = process.env.AZURE_OPENAI_KEY;
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4';

    let hostname: string, requestPath: string;

    if (azureKey && azureEndpoint) {
      const url = new URL(`${azureEndpoint}/openai/deployments/${azureDeployment}/chat/completions?api-version=2024-02-01`);
      hostname = url.hostname;
      requestPath = url.pathname + url.search;
    } else if (openaiKey) {
      hostname = 'api.openai.com';
      requestPath = '/v1/chat/completions';
    } else {
      return resolve('');
    }

    const body = JSON.stringify({
      model: azureKey ? azureDeployment : 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert QA automation engineer specializing in Playwright test failure analysis. Provide concise, actionable root cause analysis in 2-3 sentences.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.2,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body).toString(),
    };

    if (azureKey) {
      headers['api-key'] = azureKey;
    } else {
      headers['Authorization'] = `Bearer ${openaiKey}`;
    }

    const req = https.request({ hostname, path: requestPath, method: 'POST', headers }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const content = parsed?.choices?.[0]?.message?.content || '';
          resolve(content.trim());
        } catch {
          resolve('');
        }
      });
    });

    req.on('error', () => resolve(''));
    req.setTimeout(15000, () => { req.destroy(); resolve(''); });
    req.write(body);
    req.end();
  });
}

async function getAIEnhancedSummary(failure: AnalyzedFailure): Promise<string> {
  const prompt = `Analyze this Playwright test failure and provide a concise root cause and fix recommendation:

Test: ${failure.testTitle}
File: ${failure.filePath}
Category: ${failure.category}
Failed Step: ${failure.failedStep || 'N/A'}
Error: ${failure.errorMessage.slice(0, 600)}

Provide: 1) Root cause in 1-2 sentences, 2) Top 2 specific fix recommendations.`;

  return callOpenAI(prompt);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ANALYZER
// ─────────────────────────────────────────────────────────────────────────────

async function analyzeFailures(resultsPath: string, useAI: boolean): Promise<AnalysisSummary> {
  if (!fs.existsSync(resultsPath)) {
    throw new Error(`Results file not found: ${resultsPath}\nRun your tests first to generate test-results/results.json`);
  }

  const raw = fs.readFileSync(resultsPath, 'utf-8');
  const data: PlaywrightTestResult = JSON.parse(raw);

  const allFailed: PlaywrightTest[] = [];
  for (const suite of data.suites ?? []) {
    allFailed.push(...collectFailedTests(suite, suite.file || suite.title));
  }

  const categoryBreakdown: Record<FailureCategory, number> = {
    TIMEOUT: 0, LOCATOR_NOT_FOUND: 0, ASSERTION_FAILURE: 0,
    NAVIGATION_ERROR: 0, ELEMENT_NOT_VISIBLE: 0, ELEMENT_NOT_ENABLED: 0,
    AUTH_FAILURE: 0, NETWORK_ERROR: 0, PAGE_CRASH: 0, STEP_FAILURE: 0, UNKNOWN: 0,
  };

  const severityBreakdown: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  const fileFailureMap: Map<string, number> = new Map();
  const analyzedFailures: AnalyzedFailure[] = [];

  for (const test of allFailed) {
    const lastResult = test.results[test.results.length - 1];
    const errorObj = lastResult?.errors?.[0];
    const errorMessage = errorObj?.message ?? 'No error message available';
    const stackTrace = errorObj?.stack ?? '';
    const failedStep = findFailedStep(lastResult?.steps ?? []);
    const projectName = test.projectName ?? 'unknown';
    const filePath = test.location?.file
      ? path.relative(data.config?.rootDir ?? '', test.location.file).replace(/\\/g, '/')
      : 'unknown';

    const rule = categorizeFailure(errorMessage, stackTrace);
    categoryBreakdown[rule.name]++;
    severityBreakdown[rule.severity]++;

    fileFailureMap.set(filePath, (fileFailureMap.get(filePath) ?? 0) + 1);

    const failure: AnalyzedFailure = {
      testTitle: test.title,
      filePath,
      projectName,
      duration: lastResult?.duration ?? 0,
      retries: test.results.length - 1,
      category: rule.name,
      errorMessage: errorMessage.replace(/\x1b\[[0-9;]*m/g, ''), // strip ANSI colors
      stackTrace: stackTrace.replace(/\x1b\[[0-9;]*m/g, ''),
      failedStep,
      rootCause: rule.rootCause(errorMessage),
      recommendations: rule.recommendations,
      severity: rule.severity,
      aiEnhanced: false,
      tags: test.tags ?? [],
    };

    if (useAI && (process.env.OPENAI_API_KEY || process.env.AZURE_OPENAI_KEY)) {
      process.stdout.write(`  ⚙  Getting AI analysis for: ${test.title.slice(0, 60)}...\r`);
      const aiSummary = await getAIEnhancedSummary(failure);
      if (aiSummary) {
        failure.aiEnhanced = true;
        failure.aiSummary = aiSummary;
      }
    }

    analyzedFailures.push(failure);
  }

  const topFailingFiles = Array.from(fileFailureMap.entries())
    .map(([file, count]) => ({ file, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const duration = data.stats?.duration ?? 0;
  const mins = Math.floor(duration / 60000);
  const secs = ((duration % 60000) / 1000).toFixed(1);

  return {
    totalFailed: data.stats?.unexpected ?? allFailed.length,
    totalPassed: data.stats?.expected ?? 0,
    totalSkipped: data.stats?.skipped ?? 0,
    totalFlaky: data.stats?.flaky ?? 0,
    runDuration: `${mins}m ${secs}s`,
    runDate: data.stats?.startTime ? new Date(data.stats.startTime).toLocaleString() : new Date().toLocaleString(),
    categoryBreakdown,
    severityBreakdown,
    topFailingFiles,
    failures: analyzedFailures,
    aiEnabled: useAI && !!(process.env.OPENAI_API_KEY || process.env.AZURE_OPENAI_KEY),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSOLE REPORT
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
  bgRed: '\x1b[41m', bgYellow: '\x1b[43m', bgGreen: '\x1b[42m',
};

function severityColor(s: string): string {
  if (s === 'CRITICAL') return C.red + C.bold;
  if (s === 'HIGH') return C.red;
  if (s === 'MEDIUM') return C.yellow;
  return C.dim;
}

function printConsoleReport(summary: AnalysisSummary): void {
  const line = '═'.repeat(80);
  const thinLine = '─'.repeat(80);

  console.log(`\n${C.bold}${C.cyan}${line}${C.reset}`);
  console.log(`${C.bold}${C.cyan}  🤖 AI FAILURE ANALYZER — Playwright${C.reset}`);
  console.log(`${C.bold}${C.cyan}${line}${C.reset}`);
  console.log(`  Run Date   : ${summary.runDate}`);
  console.log(`  Duration   : ${summary.runDuration}`);
  console.log(`  AI Mode    : ${summary.aiEnabled ? `${C.green}✓ ENABLED${C.reset}` : `${C.dim}rule-based${C.reset}`}`);
  console.log();

  console.log(`${C.bold}  RESULTS OVERVIEW${C.reset}`);
  console.log(thinLine);
  console.log(`  ${C.green}✓ Passed  ${C.reset}: ${summary.totalPassed}`);
  console.log(`  ${C.red}✗ Failed  ${C.reset}: ${summary.totalFailed}`);
  console.log(`  ${C.yellow}⚡ Flaky   ${C.reset}: ${summary.totalFlaky}`);
  console.log(`  ${C.dim}◌ Skipped ${C.reset}: ${summary.totalSkipped}`);
  console.log();

  if (summary.totalFailed === 0) {
    console.log(`${C.green}${C.bold}  ✅ ALL TESTS PASSED — No failures to analyze!${C.reset}\n`);
    return;
  }

  // Severity
  console.log(`${C.bold}  SEVERITY BREAKDOWN${C.reset}`);
  console.log(thinLine);
  for (const [sev, count] of Object.entries(summary.severityBreakdown)) {
    if (count > 0) {
      console.log(`  ${severityColor(sev)}${sev.padEnd(10)}${C.reset} : ${count}`);
    }
  }
  console.log();

  // Category
  console.log(`${C.bold}  FAILURE CATEGORY BREAKDOWN${C.reset}`);
  console.log(thinLine);
  const maxCat = Math.max(...Object.values(summary.categoryBreakdown));
  for (const [cat, count] of Object.entries(summary.categoryBreakdown)) {
    if (count > 0) {
      const bar = '█'.repeat(Math.round((count / maxCat) * 20));
      console.log(`  ${cat.padEnd(22)}: ${C.red}${bar}${C.reset} ${count}`);
    }
  }
  console.log();

  // Top failing files
  if (summary.topFailingFiles.length > 0) {
    console.log(`${C.bold}  TOP FAILING FILES${C.reset}`);
    console.log(thinLine);
    summary.topFailingFiles.forEach(({ file, count }) => {
      console.log(`  ${C.yellow}${count.toString().padStart(2)} failure(s)${C.reset}  ${path.basename(file)}`);
    });
    console.log();
  }

  // Per-failure details
  console.log(`${C.bold}  FAILURE DETAILS${C.reset}`);
  summary.failures.forEach((f, i) => {
    console.log(`\n${thinLine}`);
    console.log(`${C.bold}  [${i + 1}] ${f.testTitle}${C.reset}`);
    console.log(`  ${C.dim}File    : ${f.filePath}${C.reset}`);
    console.log(`  ${C.dim}Project : ${f.projectName} | Duration: ${(f.duration / 1000).toFixed(1)}s | Retries: ${f.retries}${C.reset}`);
    console.log(`  Category: ${C.cyan}${f.category}${C.reset}  Severity: ${severityColor(f.severity)}${f.severity}${C.reset}`);
    if (f.failedStep) {
      console.log(`  ${C.dim}Failed Step: ${f.failedStep}${C.reset}`);
    }
    console.log(`\n  ${C.bold}Error:${C.reset}`);
    console.log(`  ${C.red}${f.errorMessage.split('\n')[0].slice(0, 120)}${C.reset}`);
    console.log(`\n  ${C.bold}Root Cause:${C.reset}`);
    console.log(`  ${f.rootCause}`);
    if (f.aiEnhanced && f.aiSummary) {
      console.log(`\n  ${C.magenta}${C.bold}🤖 AI Analysis:${C.reset}`);
      console.log(`  ${C.magenta}${f.aiSummary}${C.reset}`);
    }
    console.log(`\n  ${C.bold}Recommendations:${C.reset}`);
    f.recommendations.forEach((r, ri) => {
      console.log(`  ${ri + 1}. ${r}`);
    });
  });

  console.log(`\n${C.bold}${C.cyan}${line}${C.reset}\n`);
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML REPORT GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateHTMLReport(summary: AnalysisSummary, outputPath: string): void {
  const severityBadge = (s: string) => {
    const colors: Record<string, string> = {
      CRITICAL: '#dc2626', HIGH: '#ea580c', MEDIUM: '#d97706', LOW: '#65a30d',
    };
    return `<span class="badge" style="background:${colors[s] ?? '#6b7280'}">${s}</span>`;
  };

  const categoryBadge = (c: string) => {
    const colors: Record<string, string> = {
      TIMEOUT: '#7c3aed', LOCATOR_NOT_FOUND: '#db2777', ASSERTION_FAILURE: '#0369a1',
      NAVIGATION_ERROR: '#b91c1c', ELEMENT_NOT_VISIBLE: '#d97706', ELEMENT_NOT_ENABLED: '#b45309',
      AUTH_FAILURE: '#dc2626', NETWORK_ERROR: '#c2410c', PAGE_CRASH: '#7f1d1d',
      STEP_FAILURE: '#1d4ed8', UNKNOWN: '#6b7280',
    };
    return `<span class="badge" style="background:${colors[c] ?? '#6b7280'}">${c.replace(/_/g, ' ')}</span>`;
  };

  const categoryChartData = Object.entries(summary.categoryBreakdown)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `<div class="bar-row"><span class="bar-label">${k.replace(/_/g, ' ')}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round((v / summary.totalFailed) * 100)}%"></div></div><span class="bar-count">${v}</span></div>`)
    .join('');

  const failuresHtml = summary.failures.map((f, i) => `
    <div class="card failure-card severity-${f.severity.toLowerCase()}" id="f${i + 1}">
      <div class="card-header">
        <div class="card-title">
          <span class="index">#${i + 1}</span>
          <span class="test-title">${escapeHtml(f.testTitle)}</span>
        </div>
        <div class="badges">
          ${categoryBadge(f.category)}
          ${severityBadge(f.severity)}
          ${f.aiEnhanced ? '<span class="badge ai-badge">🤖 AI</span>' : ''}
        </div>
      </div>
      <div class="card-meta">
        <span>📁 ${escapeHtml(f.filePath)}</span>
        <span>🖥 ${escapeHtml(f.projectName)}</span>
        <span>⏱ ${(f.duration / 1000).toFixed(1)}s</span>
        <span>🔁 ${f.retries} retr${f.retries === 1 ? 'y' : 'ies'}</span>
        ${f.tags.length ? `<span>🏷 ${f.tags.join(', ')}</span>` : ''}
      </div>
      ${f.failedStep ? `<div class="failed-step">❌ Failed Step: <code>${escapeHtml(f.failedStep)}</code></div>` : ''}
      <div class="section-label">Error</div>
      <pre class="error-block">${escapeHtml(f.errorMessage.slice(0, 1000))}</pre>
      <div class="section-label">Root Cause</div>
      <p class="root-cause">${escapeHtml(f.rootCause)}</p>
      ${f.aiEnhanced && f.aiSummary ? `
      <div class="section-label ai-label">🤖 AI Enhanced Analysis</div>
      <p class="ai-summary">${escapeHtml(f.aiSummary)}</p>` : ''}
      <div class="section-label">Recommendations</div>
      <ol class="recommendations">
        ${f.recommendations.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
      </ol>
      ${f.stackTrace ? `
      <details class="stack-details">
        <summary>Stack Trace</summary>
        <pre class="stack-trace">${escapeHtml(f.stackTrace.slice(0, 2000))}</pre>
      </details>` : ''}
    </div>`).join('\n');

  const total = summary.totalPassed + summary.totalFailed + summary.totalSkipped;
  const passRate = total > 0 ? ((summary.totalPassed / total) * 100).toFixed(1) : '0';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Failure Analysis — Playwright</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; line-height: 1.6; }
  .header { background: linear-gradient(135deg, #1e3a5f 0%, #0c1445 100%); padding: 32px 48px; border-bottom: 1px solid #1e40af; }
  .header h1 { font-size: 28px; font-weight: 700; color: #60a5fa; margin-bottom: 4px; }
  .header .subtitle { color: #94a3b8; font-size: 14px; }
  .header-meta { display: flex; gap: 32px; margin-top: 16px; font-size: 14px; color: #94a3b8; }
  .header-meta span strong { color: #e2e8f0; }
  .main { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .stat-card { background: #1e293b; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #334155; }
  .stat-card .stat-value { font-size: 36px; font-weight: 800; line-height: 1; }
  .stat-card .stat-label { font-size: 13px; color: #94a3b8; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
  .stat-passed .stat-value { color: #4ade80; }
  .stat-failed .stat-value { color: #f87171; }
  .stat-flaky .stat-value { color: #facc15; }
  .stat-skipped .stat-value { color: #94a3b8; }
  .stat-rate .stat-value { color: #60a5fa; }
  .section-title { font-size: 18px; font-weight: 700; color: #93c5fd; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #1e40af; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
  @media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } }
  .chart-card { background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155; }
  .bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; font-size: 13px; }
  .bar-label { width: 180px; color: #cbd5e1; flex-shrink: 0; }
  .bar-track { flex: 1; height: 8px; background: #334155; border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #8b5cf6); border-radius: 4px; }
  .bar-count { width: 24px; text-align: right; color: #94a3b8; font-weight: 600; }
  .severity-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .sev-item { background: #0f172a; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
  .sev-item .sev-name { font-size: 13px; font-weight: 600; }
  .sev-item .sev-count { font-size: 24px; font-weight: 800; }
  .sev-critical .sev-name { color: #f87171; } .sev-critical .sev-count { color: #f87171; }
  .sev-high .sev-name { color: #fb923c; } .sev-high .sev-count { color: #fb923c; }
  .sev-medium .sev-name { color: #facc15; } .sev-medium .sev-count { color: #facc15; }
  .sev-low .sev-name { color: #a3e635; } .sev-low .sev-count { color: #a3e635; }
  .card { background: #1e293b; border-radius: 12px; border: 1px solid #334155; margin-bottom: 20px; overflow: hidden; }
  .failure-card.severity-critical { border-left: 4px solid #dc2626; }
  .failure-card.severity-high { border-left: 4px solid #ea580c; }
  .failure-card.severity-medium { border-left: 4px solid #d97706; }
  .failure-card.severity-low { border-left: 4px solid #65a30d; }
  .card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding: 20px 24px 12px; flex-wrap: wrap; }
  .card-title { display: flex; align-items: center; gap: 12px; }
  .index { background: #334155; color: #94a3b8; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
  .test-title { font-size: 15px; font-weight: 700; color: #e2e8f0; }
  .badges { display: flex; gap: 6px; flex-wrap: wrap; }
  .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; }
  .ai-badge { background: linear-gradient(135deg, #7c3aed, #a855f7) !important; }
  .card-meta { display: flex; flex-wrap: wrap; gap: 16px; padding: 0 24px 12px; font-size: 12px; color: #64748b; }
  .failed-step { margin: 0 24px 12px; padding: 8px 12px; background: #2d1b1b; border-radius: 6px; font-size: 13px; color: #fca5a5; border-left: 3px solid #dc2626; }
  .failed-step code { font-family: monospace; }
  .section-label { padding: 0 24px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; margin-top: 12px; }
  .ai-label { color: #a78bfa; }
  .error-block { margin: 0 24px 12px; padding: 12px 16px; background: #1a0a0a; border-radius: 8px; font-size: 12px; color: #fca5a5; font-family: 'Cascadia Code', 'Fira Code', monospace; white-space: pre-wrap; word-break: break-word; border: 1px solid #3b1010; max-height: 150px; overflow-y: auto; }
  .root-cause { margin: 0 24px 12px; padding: 12px 16px; background: #0c1445; border-radius: 8px; font-size: 13px; color: #93c5fd; border-left: 3px solid #3b82f6; }
  .ai-summary { margin: 0 24px 12px; padding: 12px 16px; background: #1a0d2e; border-radius: 8px; font-size: 13px; color: #c4b5fd; border-left: 3px solid #7c3aed; }
  .recommendations { margin: 0 24px 16px; padding-left: 24px; font-size: 13px; color: #cbd5e1; }
  .recommendations li { margin-bottom: 6px; }
  .stack-details { margin: 0 24px 16px; }
  .stack-details summary { font-size: 12px; color: #64748b; cursor: pointer; padding: 4px 0; }
  .stack-details summary:hover { color: #94a3b8; }
  .stack-trace { margin-top: 8px; padding: 12px; background: #0f172a; border-radius: 6px; font-size: 11px; color: #64748b; font-family: monospace; white-space: pre-wrap; word-break: break-word; max-height: 200px; overflow-y: auto; }
  .filter-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; align-items: center; }
  .filter-btn { padding: 6px 16px; border-radius: 20px; border: 1px solid #334155; background: #1e293b; color: #94a3b8; font-size: 12px; cursor: pointer; transition: all 0.2s; }
  .filter-btn:hover, .filter-btn.active { background: #3b82f6; border-color: #3b82f6; color: #fff; }
  .search-box { flex: 1; min-width: 200px; padding: 8px 16px; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: #e2e8f0; font-size: 13px; outline: none; }
  .search-box:focus { border-color: #3b82f6; }
  .no-failures { text-align: center; padding: 48px; color: #4ade80; font-size: 20px; font-weight: 700; }
  .footer { text-align: center; padding: 24px; color: #334155; font-size: 12px; border-top: 1px solid #1e293b; margin-top: 32px; }
</style>
</head>
<body>
<div class="header">
  <h1>🤖 AI Failure Analyzer</h1>
  <div class="subtitle">Playwright Automation — Intelligent Test Failure Analysis</div>
  <div class="header-meta">
    <span>🗓 Run Date: <strong>${summary.runDate}</strong></span>
    <span>⏱ Duration: <strong>${summary.runDuration}</strong></span>
    <span>🤖 AI Mode: <strong>${summary.aiEnabled ? '✓ Enabled' : 'Rule-Based'}</strong></span>
  </div>
</div>

<div class="main">

  <!-- Stats -->
  <div class="stats-grid">
    <div class="stat-card stat-passed"><div class="stat-value">${summary.totalPassed}</div><div class="stat-label">Passed</div></div>
    <div class="stat-card stat-failed"><div class="stat-value">${summary.totalFailed}</div><div class="stat-label">Failed</div></div>
    <div class="stat-card stat-flaky"><div class="stat-value">${summary.totalFlaky}</div><div class="stat-label">Flaky</div></div>
    <div class="stat-card stat-skipped"><div class="stat-value">${summary.totalSkipped}</div><div class="stat-label">Skipped</div></div>
    <div class="stat-card stat-rate"><div class="stat-value">${passRate}%</div><div class="stat-label">Pass Rate</div></div>
  </div>

  ${summary.totalFailed === 0 ? '<div class="no-failures">✅ All Tests Passed — No Failures to Analyze!</div>' : `
  <!-- Charts -->
  <div class="two-col">
    <div class="chart-card">
      <div class="section-title">Failure Categories</div>
      ${categoryChartData}
    </div>
    <div class="chart-card">
      <div class="section-title">Severity Distribution</div>
      <div class="severity-grid">
        ${['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => `
        <div class="sev-item sev-${s.toLowerCase()}">
          <span class="sev-name">${s}</span>
          <span class="sev-count">${summary.severityBreakdown[s] ?? 0}</span>
        </div>`).join('')}
      </div>
      ${summary.topFailingFiles.length > 1 ? `
      <div class="section-title" style="margin-top:20px">Top Failing Files</div>
      ${summary.topFailingFiles.map(f => `
      <div class="bar-row">
        <span class="bar-label" title="${f.file}" style="width:200px">${path.basename(f.file)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.round((f.count / summary.totalFailed) * 100)}%"></div></div>
        <span class="bar-count">${f.count}</span>
      </div>`).join('')}` : ''}
    </div>
  </div>

  <!-- Filter Bar -->
  <div class="section-title">Failure Details (${summary.totalFailed})</div>
  <div class="filter-bar">
    <input class="search-box" type="text" id="searchBox" placeholder="Search by test name, file, error..." oninput="filterCards()">
    <button class="filter-btn active" onclick="filterBySeverity('ALL', this)">All</button>
    ${['CRITICAL','HIGH','MEDIUM','LOW'].filter(s => (summary.severityBreakdown[s] ?? 0) > 0).map(s =>
      `<button class="filter-btn" onclick="filterBySeverity('${s}', this)">${s} (${summary.severityBreakdown[s]})</button>`
    ).join('')}
  </div>

  <!-- Failure Cards -->
  <div id="failureList">
    ${failuresHtml}
  </div>
  `}
</div>

<div class="footer">
  Generated by AI Failure Analyzer • Playwright Framework • ${new Date().toLocaleString()}
</div>

<script>
let currentSeverity = 'ALL';

function filterBySeverity(severity, btn) {
  currentSeverity = severity;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterCards();
}

function filterCards() {
  const query = document.getElementById('searchBox').value.toLowerCase();
  document.querySelectorAll('.failure-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    const matchesSeverity = currentSeverity === 'ALL' || card.classList.contains('severity-' + currentSeverity.toLowerCase());
    const matchesSearch = !query || text.includes(query);
    card.style.display = (matchesSeverity && matchesSearch) ? '' : 'none';
  });
}
</script>
</body>
</html>`;

  fs.writeFileSync(outputPath, html, 'utf-8');
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf('--input');
  const useAI = args.includes('--openai') || args.includes('--ai');
  const resultsPath = inputIdx >= 0 && args[inputIdx + 1]
    ? path.resolve(args[inputIdx + 1])
    : path.resolve('test-results', 'results.json');

  const outputHtml = path.resolve('test-results', 'ai-failure-analysis.html');

  console.log(`\n🤖 AI Failure Analyzer starting...`);
  console.log(`   Input  : ${resultsPath}`);
  console.log(`   Output : ${outputHtml}`);
  if (useAI) {
    if (process.env.OPENAI_API_KEY || process.env.AZURE_OPENAI_KEY) {
      console.log(`   AI Mode: ✓ OpenAI/Azure integration enabled`);
    } else {
      console.log(`   AI Mode: ⚠ --openai flag set but no API key found (falling back to rule-based)`);
    }
  }

  try {
    const summary = await analyzeFailures(resultsPath, useAI);
    printConsoleReport(summary);
    generateHTMLReport(summary, outputHtml);
    console.log(`✅ HTML report saved: ${outputHtml}\n`);

    // Exit with non-zero if there are failures (for CI pipelines)
    if (summary.totalFailed > 0) {
      process.exitCode = 1;
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`\n❌ Analyzer error: ${error.message}\n`);
    process.exit(1);
  }
}

main();
