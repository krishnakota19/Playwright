# 🔍 Accessibility Testing Comprehensive Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Framework Architecture](#framework-architecture)
4. [Configuration Management](#configuration-management)
5. [Implementation Guide](#implementation-guide)
6. [Available Functions](#available-functions)
7. [Testing Strategies](#testing-strategies)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Examples](#examples)

---

## 🌟 Overview

The Web Playwright framework includes comprehensive accessibility testing capabilities using **AXE Core** to ensure WCAG 2.1 AA compliance. This guide covers everything from basic setup to advanced testing strategies.

### Key Features
- ✅ **Flag-based Control** - Enable/disable accessibility scanning via environment variables
- ✅ **WCAG 2.1 AA Compliance** - Pre-configured for industry standards
- ✅ **Multiple Test Modes** - Conditional, direct, and custom scanning options
- ✅ **Environment Integration** - Seamless integration with QA/UAT/PROD environments
- ✅ **Detailed Reporting** - Comprehensive violation reporting with remediation guidance
- ✅ **Flexible Configuration** - Support for custom rules, exclusions, and inclusions

---

## 🚀 Quick Start

### 1. Enable Accessibility Scanning

**Option A: Environment File (Recommended)**
```bash
# In config/proj/.env.qa
ACCESSIBILITY_SCAN_FLAG=true
```

**Option B: Runtime Override**
```bash
# Windows PowerShell
$env:ACCESSIBILITY_SCAN_FLAG="true"
npx playwright test

# Cross-platform
ACCESSIBILITY_SCAN_FLAG=true npx playwright test
```

### 2. Basic Test Implementation
```typescript
import { test } from '../../fixture';
import { AccessibilityScan, A11Y_CONFIGS } from '../../../utils/accessibility-utils';

test('Login page accessibility', async ({ page }) => {
  await page.goto('/login');
  
  // Basic accessibility scan
  await AccessibilityScan(page);
});
```

### 3. Run Accessibility Tests
```bash
npm run test:qa:accessibility
```

---

## 🏗️ Framework Architecture

### File Structure
```
web_playwright/
├── 📁 utils/
│   └── accessibility-utils.ts          # Core accessibility utilities
├── 📁 src/proj/test/
│   └── LoginTestAccessibility.spec.ts  # Accessibility test examples
├── 📁 config/proj/
│   ├── .env.qa                         # QA environment config
│   ├── .env.uat                        # UAT environment config
│   └── .env.prod                       # Production environment config
└── 📁 documentation/
    └── ACCESSIBILITY_TESTING_GUIDE.md  # This comprehensive guide
```

### Core Dependencies
```json
{
  "@axe-core/playwright": "^4.10.1",
  "@playwright/test": "^1.48.0"
}
```

### Integration Points
- **Fixture Integration** - Built into `fixture.ts` with pre-configured AXE builder
- **Environment Management** - Controlled via environment variables
- **Reporting Integration** - Violations logged to console and test reports
- **CI/CD Support** - Environment-specific scanning in automated pipelines

---

## ⚙️ Configuration Management

### Environment Variables

| Variable | Values | Description |
|----------|--------|-------------|
| `ACCESSIBILITY_SCAN_FLAG` | `true` / `false` | Primary flag to control scanning |
| `A11Y_SCAN_FLAG` | `true` / `false` | Alternative flag name |

### Environment Files Configuration

**QA Environment (`.env.qa`)**
```bash
# Accessibility Testing Control
ACCESSIBILITY_SCAN_FLAG=false  # Default: disabled for performance
```

**UAT Environment (`.env.uat`)**
```bash
# Accessibility Testing Control
ACCESSIBILITY_SCAN_FLAG=true   # Enabled for UAT validation
```

**Production Environment (`.env.prod`)**
```bash
# Accessibility Testing Control
ACCESSIBILITY_SCAN_FLAG=false  # Disabled in production
```

### Runtime Configuration
```bash
# Enable for specific test run
ACCESSIBILITY_SCAN_FLAG=true npx playwright test --grep "@accessibility"

# Disable for performance testing
ACCESSIBILITY_SCAN_FLAG=false npx playwright test --grep "@performance"
```

---

## 📖 Implementation Guide

### Basic Implementation
```typescript
import { test } from '../../fixture';
import { AccessibilityScan, A11Y_CONFIGS } from '../../../utils/accessibility-utils';

test.describe('Accessibility Test Suite', () => {
  test('Homepage accessibility scan', async ({ page }) => {
    await page.goto('/');
    await AccessibilityScan(page);
  });
});
```

### Advanced Implementation with Custom Configuration
```typescript
import { test } from '../../fixture';
import { scanAndAssertAccessibility, isAccessibilityScanEnabled } from '../../../utils/accessibility-utils';

test.describe('Advanced Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    if (isAccessibilityScanEnabled()) {
      console.log('♿ Accessibility scanning ENABLED for this test run');
    } else {
      console.log('♿ Accessibility scanning DISABLED');
    }
  });

  test('Form elements accessibility', async ({ page }) => {
    await page.goto('/forms');
    
    // Custom configuration for form elements
    const formConfig = {
      tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      includeSelectors: ['form', 'input', 'button', 'select', 'textarea'],
      excludeSelectors: ['.third-party-widget']
    };
    
    await scanAndAssertAccessibility(page, formConfig, true);
  });
});
```

### Page Object Integration
```typescript
export class LoginPage {
  async performAccessibilityCheck(page: Page) {
    await AccessibilityScan(page, A11Y_CONFIGS.WCAG_21_AA, true);
  }
}
```

---

## 🔧 Available Functions

### Primary Functions

#### 1. `AccessibilityScan()` - Recommended
**Flag-aware conditional scanning**
```typescript
AccessibilityScan(page, config?, logViolations?)
```

#### 2. `scanAndAssertAccessibility()` - Direct
**Direct scanning with flag check**
```typescript
scanAndAssertAccessibility(page, config?, logViolations?)
```

#### 3. `isAccessibilityScanEnabled()` - Utility
**Check if scanning is enabled**
```typescript
if (isAccessibilityScanEnabled()) {
  // Perform accessibility-specific setup
}
```

### Function Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `Page` | Required | Playwright page object |
| `config` | `AccessibilityConfig` | `DEFAULT_A11Y_CONFIG` | Configuration options |
| `logViolations` | `boolean` | `true` | Whether to log violations |

### Pre-defined Configurations

#### 1. `A11Y_CONFIGS.WCAG_21_AA` (Default)
```typescript
{
  tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  excludeSelectors: ['#commonly-reused-element-with-known-issue']
}
```

#### 2. `A11Y_CONFIGS.FORM_ELEMENTS`
```typescript
{
  tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  includeSelectors: ['form', 'input', 'button', 'select', 'textarea']
}
```

### Custom Configuration Examples
```typescript
// Focus on navigation elements
const navigationConfig = {
  tags: ['wcag2a', 'wcag2aa'],
  includeSelectors: ['nav', '[role="navigation"]', '.navbar'],
  excludeSelectors: ['.external-content']
};

// High contrast testing
const colorConfig = {
  tags: ['wcag2aa', 'color-contrast'],
  excludeSelectors: ['.logo', '.decorative-images']
};
```

---

## 📊 Testing Strategies

### 1. Comprehensive Page Testing
```typescript
test('Full page accessibility audit', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Wait for dynamic content
  await page.waitForLoadState('networkidle');
  
  // Comprehensive scan
  await AccessibilityScan(page, A11Y_CONFIGS.WCAG_21_AA, true);
});
```

### 2. Component-Specific Testing
```typescript
test('Navigation component accessibility', async ({ page }) => {
  await page.goto('/');
  
  const navConfig = {
    tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    includeSelectors: ['nav', '[role="navigation"]']
  };
  
  await AccessibilityScan(page, navConfig, true);
});
```

### 3. Form Interaction Testing
```typescript
test('Form accessibility during interaction', async ({ page }) => {
  await page.goto('/contact');
  
  // Test initial state
  await AccessibilityScan(page, A11Y_CONFIGS.FORM_ELEMENTS);
  
  // Fill form and test again
  await page.fill('#name', 'Test User');
  await page.fill('#email', 'test@example.com');
  
  // Test form with data
  await AccessibilityScan(page, A11Y_CONFIGS.FORM_ELEMENTS);
});
```

### 4. Dynamic Content Testing
```typescript
test('Dynamic content accessibility', async ({ page }) => {
  await page.goto('/search');
  
  // Initial scan
  await AccessibilityScan(page);
  
  // Trigger dynamic content
  await page.fill('#search', 'test query');
  await page.click('#search-button');
  await page.waitForSelector('.search-results');
  
  // Scan with results
  await AccessibilityScan(page);
});
```

### 5. Modal and Overlay Testing
```typescript
test('Modal accessibility', async ({ page }) => {
  await page.goto('/');
  
  // Open modal
  await page.click('#open-modal');
  await page.waitForSelector('.modal[aria-hidden="false"]');
  
  // Focus should be trapped in modal
  const modalConfig = {
    tags: ['wcag2a', 'wcag2aa'],
    includeSelectors: ['.modal']
  };
  
  await AccessibilityScan(page, modalConfig);
});
```

---

## ✅ Best Practices

### 1. Environment-Specific Scanning
```typescript
// Enable in UAT for thorough testing
// Disable in QA for faster development cycles
const shouldScanAccessibility = process.env.TEST_ENV === 'uat';
```

### 2. Strategic Test Placement
```typescript
test.describe('User Registration Flow', () => {
  test.afterEach(async ({ page }) => {
    // Scan accessibility after each step
    await AccessibilityScan(page);
  });
});
```

### 3. Custom Exclusions for Known Issues
```typescript
const customConfig = {
  tags: ['wcag2a', 'wcag2aa'],
  excludeSelectors: [
    '.third-party-widget',      // External content
    '.legacy-component',        // Planned for refactoring
    '[data-testid="analytics"]' // Analytics scripts
  ]
};
```

### 4. Progressive Enhancement Testing
```typescript
test('Accessibility with JavaScript disabled', async ({ page, context }) => {
  // Disable JavaScript
  await context.setExtraHTTPHeaders({
    'Content-Security-Policy': "script-src 'none'"
  });
  
  await page.goto('/');
  await AccessibilityScan(page);
});
```

### 5. Performance Considerations
```typescript
// Only run accessibility scans when needed
test.describe('Performance-sensitive tests', () => {
  test('Fast unit test', async ({ page }) => {
    // Skip accessibility for performance tests
    const originalFlag = process.env.ACCESSIBILITY_SCAN_FLAG;
    process.env.ACCESSIBILITY_SCAN_FLAG = 'false';
    
    await page.goto('/');
    // ... performance-focused test logic
    
    process.env.ACCESSIBILITY_SCAN_FLAG = originalFlag;
  });
});
```

---

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. Accessibility Scan Not Running
**Symptoms:** No accessibility violations logged, scan appears skipped
```bash
♿ Accessibility scanning is disabled. Set ACCESSIBILITY_SCAN_FLAG=true to enable.
```

**Solutions:**
```bash
# Check environment variable
echo $ACCESSIBILITY_SCAN_FLAG

# Set flag explicitly
export ACCESSIBILITY_SCAN_FLAG=true

# Verify environment file
cat config/proj/.env.qa | grep ACCESSIBILITY
```

#### 2. Too Many Violations
**Symptoms:** Large number of accessibility violations causing test failures

**Solutions:**
```typescript
// Start with specific components
const focusedConfig = {
  tags: ['wcag2a'],  // Start with Level A only
  includeSelectors: ['.main-content']  // Focus on specific areas
};

// Gradually expand scope
const expandedConfig = {
  tags: ['wcag2a', 'wcag2aa'],
  includeSelectors: ['.main-content', '.navigation']
};
```

#### 3. Dynamic Content Issues
**Symptoms:** Accessibility scan fails on dynamic content

**Solutions:**
```typescript
// Wait for content to load
await page.waitForLoadState('networkidle');
await page.waitForSelector('[data-loaded="true"]');

// Wait for specific accessibility attributes
await page.waitForFunction(() => {
  const button = document.querySelector('#dynamic-button');
  return button && button.hasAttribute('aria-label');
});
```

#### 4. Third-party Widget Conflicts
**Symptoms:** Violations from external components you can't control

**Solutions:**
```typescript
const widgetSafeConfig = {
  tags: ['wcag2a', 'wcag2aa'],
  excludeSelectors: [
    '.google-maps',
    '.social-media-widget',
    '[data-third-party="true"]'
  ]
};
```

### Debug Mode
```typescript
// Enable detailed logging
const debugConfig = {
  tags: ['wcag2a', 'wcag2aa'],
  excludeSelectors: []
};

await scanAndAssertAccessibility(page, debugConfig, true);
```

---

## 📚 Examples

### Example 1: Login Flow Accessibility
```typescript
import { test } from '../../fixture';
import { AccessibilityScan, A11Y_CONFIGS } from '../../../utils/accessibility-utils';

test.describe('Login Accessibility Tests @accessibility', () => {
  test('Login page initial state', async ({ page }) => {
    await page.goto('/login');
    await AccessibilityScan(page, A11Y_CONFIGS.WCAG_21_AA);
  });

  test('Login form with validation errors', async ({ page }) => {
    await page.goto('/login');
    
    // Trigger validation errors
    await page.click('#login-button');
    await page.waitForSelector('.error-message');
    
    // Check accessibility of error states
    await AccessibilityScan(page, A11Y_CONFIGS.FORM_ELEMENTS);
  });

  test('Successful login redirect', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'password123');
    await page.click('#login-button');
    
    await page.waitForURL('/dashboard');
    await AccessibilityScan(page);
  });
});
```

### Example 2: Dashboard Accessibility
```typescript
test.describe('Dashboard Accessibility @accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('#username', process.env.USER_NAME);
    await page.fill('#password', process.env.PASSWORD);
    await page.click('#login-button');
    await page.waitForURL('/dashboard');
  });

  test('Dashboard overview accessibility', async ({ page }) => {
    await AccessibilityScan(page);
  });

  test('Navigation menu accessibility', async ({ page }) => {
    const navConfig = {
      tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      includeSelectors: ['.sidebar', '.main-nav', '[role="navigation"]']
    };
    
    await AccessibilityScan(page, navConfig);
  });

  test('Data table accessibility', async ({ page }) => {
    await page.click('#view-transactions');
    await page.waitForSelector('.data-table');
    
    const tableConfig = {
      tags: ['wcag2a', 'wcag2aa'],
      includeSelectors: ['table', '.data-table', '[role="grid"]']
    };
    
    await AccessibilityScan(page, tableConfig);
  });
});
```

### Example 3: Form Accessibility
```typescript
test.describe('Transfer Form Accessibility @accessibility', () => {
  test('Transfer form accessibility', async ({ page }) => {
    await page.goto('/transfers');
    
    // Initial form state
    await AccessibilityScan(page, A11Y_CONFIGS.FORM_ELEMENTS);
    
    // Fill form step by step and check accessibility
    await page.selectOption('#from-account', 'checking-001');
    await AccessibilityScan(page, A11Y_CONFIGS.FORM_ELEMENTS);
    
    await page.selectOption('#to-account', 'savings-002');
    await AccessibilityScan(page, A11Y_CONFIGS.FORM_ELEMENTS);
    
    await page.fill('#amount', '100.00');
    await AccessibilityScan(page, A11Y_CONFIGS.FORM_ELEMENTS);
  });
});
```

### Example 4: Conditional Accessibility Testing
```typescript
test.describe('Conditional Accessibility Tests', () => {
  test('Run accessibility only in specific environments', async ({ page }) => {
    await page.goto('/');
    
    // Conditional scanning based on environment
    if (process.env.TEST_ENV === 'uat' || isAccessibilityScanEnabled()) {
      console.log('Running comprehensive accessibility audit...');
      await AccessibilityScan(page, A11Y_CONFIGS.WCAG_21_AA, true);
    } else {
      console.log('Skipping accessibility scan for performance');
    }
  });
});
```

---

## 🎯 Console Output Reference

### When Accessibility Scanning is Enabled
```
♿ Accessibility scanning is ENABLED for this test run
♿ Running accessibility scan...
✅ Accessibility scan completed - No violations found
```

### When Accessibility Scanning is Disabled
```
♿ Accessibility scanning is DISABLED
♿ Accessibility scanning is disabled. Set ACCESSIBILITY_SCAN_FLAG=true to enable.
```

### When Violations are Found
```
♿ Running accessibility scan...
Found 2 accessibility violations:

--- Violation 1 ---
Rule: color-contrast
Impact: serious
Description: Elements must have sufficient color contrast
Help URL: https://dequeuniversity.com/rules/axe/4.7/color-contrast
Affected elements: 3

--- Violation 2 ---
Rule: label
Impact: critical
Description: Form elements must have labels
Help URL: https://dequeuniversity.com/rules/axe/4.7/label
Affected elements: 1
```

---

## 📞 Support and Resources

### Framework Documentation
- [Framework Architecture](./FRAMEWORK_ARCHITECTURE.md)
- [Getting Started Guide](./GETTING_STARTED.md)
- [Environment Usage](./ENVIRONMENT_USAGE.md)

### External Resources
- [AXE Core Documentation](https://github.com/dequelabs/axe-core)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [AXE Rules Reference](https://dequeuniversity.com/rules/axe/4.7/)

### Team Contacts
- **Framework Owner:** Krishna Kota
- **Accessibility Lead:** [Team Lead]
- **DevOps Support:** [DevOps Team]

---

*This guide is part of the DLFICS Web Playwright Testing Framework. For framework updates and changes, refer to the project repository..*
