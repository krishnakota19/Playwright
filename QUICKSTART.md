# Quick Start Guide

## ✅ Installation Complete!

Your Playwright POM framework is ready to use. Follow these steps to get started:

### 1. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your application details:
```env
BASE_URL=http://localhost:3000
API_URL=http://localhost:3000/api
DB_TYPE=sqlite
DB_PATH=./test.db
```

### 2. Create Your First Page Object

Create a new page object in `src/pages/YourPage.ts`:

```typescript
import { Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export class YourPage extends BasePage {
  // Add locators
  private heading = this.page.locator('h1');

  constructor(page: Page) {
    super(page);
  }

  // Add page methods
  async assertHeadingVisible(): Promise<void> {
    await this.assertVisible(this.heading);
  }
}
```

### 3. Create Your First Test

Create a test file in `src/tests/ui/yourtest.spec.ts`:

```typescript
import { test } from '../../fixtures/test.fixture';
import { YourPage } from '../../pages/YourPage';

test.describe('Your Test Suite', () => {
  let yourPage: YourPage;

  test.beforeEach(async ({ page }) => {
    yourPage = new YourPage(page);
    await yourPage.goto('http://localhost:3000');
  });

  test('Should verify page element', async () => {
    await yourPage.assertHeadingVisible();
  });
});
```

### 4. Run Your Tests

```bash
# Run all tests
npm run test

# Run in UI mode
npm run test:ui

# Run specific file
npm run test src/tests/ui/yourtest.spec.ts

# View reports
npm run test:report
```

## 📚 Available Commands

```bash
npm run test              # Run all tests
npm run test:ui          # Interactive UI mode
npm run test:debug       # Debug mode
npm run test:headed      # Visible browser
npm run test:chrome      # Chrome only
npm run test:firefox     # Firefox only
npm run test:webkit      # Safari only
npm run test:serial      # One at a time
npm run test:report      # View HTML report
```

## 🗂️ Project Structure

```
src/
├── base/           # BasePage with common methods
├── pages/          # Page objects (LoginPage, DashboardPage, etc.)
├── api/            # APIClient for API testing
├── database/       # DatabaseClient for DB validation
├── config/         # Configuration and environment
├── utils/          # Helper utilities (Logger, etc.)
├── fixtures/       # Custom test fixtures
├── tests/
│   ├── ui/         # UI test examples
│   ├── api/        # API test examples
│   ├── database/   # Database test examples
│   └── e2e/        # End-to-end tests
└── index.ts        # Barrel exports
```

## 🎯 Common Use Cases

### UI Testing
```typescript
const loginPage = new LoginPage(page);
await loginPage.login('email@example.com', 'password');
await loginPage.assertLoginSuccessful();
```

### API Testing
```typescript
const apiClient = new APIClient('http://localhost:3000/api');
const response = await apiClient.get('/users');
test.expect(response.status).toBe(200);
```

### Database Validation
```typescript
const dbClient = new DatabaseClient({ type: 'sqlite', database: 'test.db' });
await dbClient.connect();
const exists = await dbClient.rowExists('users', { email: 'test@example.com' });
test.expect(exists).toBe(true);
```

## 📖 Documentation

- See `README.md` for comprehensive documentation
- Check `.github/copilot-instructions.md` for detailed framework info
- Review example tests in `src/tests/` for patterns

## 🆘 Troubleshooting

**Problem**: Tests won't run
```bash
# Reinstall dependencies
npm install

# Install Playwright browsers
npx playwright install
```

**Problem**: Can't connect to application
- Verify `BASE_URL` in `.env` is correct
- Check your application is running on that URL

**Problem**: Database connection errors
- Verify database credentials in `.env`
- Check database is running and accessible
- For SQLite, ensure the path is correct

## ✨ Next Steps

1. ✅ Environment configured
2. 📝 Create page objects for your application
3. 🧪 Write tests following the patterns
4. ▶️ Run tests: `npm run test`
5. 📊 Review reports: `npm run test:report`

**Happy Testing!** 🚀
