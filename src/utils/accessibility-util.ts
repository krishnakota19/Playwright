/*************************************************************************************
Description: Essential accessibility testing utilities using AXE Core
Script Name: accessibility-utils.ts
Author: Krishna Kota
Contributors: 
Date Created: Sep 11, 2025
Last Modified: Sep 11, 2025
************************************************************************************/

import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export interface AccessibilityConfig {
  tags?: string[];
  excludeSelectors?: string[];
  includeSelectors?: string[];
}

/**
 * Default accessibility configuration with WCAG 2.1 AA compliance
 */
export const DEFAULT_A11Y_CONFIG: AccessibilityConfig = {
  tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  excludeSelectors: ['#commonly-reused-element-with-known-issue'],
};

/**
 * Performs accessibility scan and asserts no violations exist
 * This is the primary function for accessibility testing
 * @param page - Playwright page object
 * @param config - Accessibility configuration options
 * @param logViolations - Whether to log violations to console (default: true)
 */
export async function scanAndAssertAccessibility(
  page: Page,
  config: AccessibilityConfig = DEFAULT_A11Y_CONFIG,
  logViolations: boolean = true
): Promise<void> {
  // Check if accessibility scanning is enabled via environment flag
  const accessibilityScanFlag = process.env.ACCESSIBILITY_SCAN_FLAG || process.env.A11Y_SCAN_FLAG;
  
  if (accessibilityScanFlag?.toLowerCase() !== 'true') {
    console.log('♿ Accessibility scanning is disabled. Set ACCESSIBILITY_SCAN_FLAG=true to enable.');
    return;
  }

  console.log('♿ Running accessibility scan...');
  
  // Wait for page to be stable
  //await page.waitForLoadState('networkidle');
  
  // Build AXE scanner
  let axeBuilder = new AxeBuilder({ page });

  // Apply tags if specified
  if (config.tags && config.tags.length > 0) {
    axeBuilder = axeBuilder.withTags(config.tags);
  }

  // Apply exclusions if specified
  if (config.excludeSelectors && config.excludeSelectors.length > 0) {
    config.excludeSelectors.forEach(selector => {
      axeBuilder = axeBuilder.exclude(selector);
    });
  }

  // Apply inclusions if specified
  if (config.includeSelectors && config.includeSelectors.length > 0) {
    config.includeSelectors.forEach(selector => {
      axeBuilder = axeBuilder.include(selector);
    });
  }

  // Perform the scan
  const scanResults = await axeBuilder.analyze();
  
  // Log violations if requested
  if (logViolations && scanResults.violations.length > 0) {
    console.log(`Found ${scanResults.violations.length} accessibility violations:`);
    scanResults.violations.forEach((violation, index) => {
      console.log(`\n--- Violation ${index + 1} ---`);
      console.log(`Rule: ${violation.id}`);
      console.log(`Impact: ${violation.impact}`);
      console.log(`Description: ${violation.description}`);
      console.log(`Help URL: ${violation.helpUrl}`);
      console.log(`Affected elements: ${violation.nodes.length}`);
    });
  }

  // Assert no violations
  expect(scanResults.violations).toEqual([]);
}

/**
 * Checks if accessibility scanning is enabled via environment flags
 * @returns true if accessibility scanning should be performed
 */
export function isAccessibilityScanEnabled(): boolean {
  const accessibilityScanFlag = process.env.ACCESSIBILITY_SCAN_FLAG || process.env.A11Y_SCAN_FLAG;
  return accessibilityScanFlag?.toLowerCase() === 'true';
}

/**
 * Conditional accessibility scan - only runs if flag is enabled
 * This is a convenience wrapper for flag-based accessibility testing
 * @param page - Playwright page object
 * @param config - Accessibility configuration options
 * @param logViolations - Whether to log violations to console (default: true)
 */
export async function AccessibilityScan(
  page: Page,
  config: AccessibilityConfig = DEFAULT_A11Y_CONFIG,
  logViolations: boolean = true
): Promise<void> {
  if (isAccessibilityScanEnabled()) {
    await scanAndAssertAccessibility(page, config, logViolations);
  } else {
    console.log('♿ Accessibility scanning is disabled. Set ACCESSIBILITY_SCAN_FLAG=true to enable.');
  }
}

/**
 * Pre-defined accessibility configurations for common scenarios
 */
export const A11Y_CONFIGS = {
  WCAG_21_AA: {
    tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    excludeSelectors: ['#commonly-reused-element-with-known-issue'],
  },
  FORM_ELEMENTS: {
    tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    includeSelectors: ['form', 'input', 'button', 'select', 'textarea'],
  },
};
