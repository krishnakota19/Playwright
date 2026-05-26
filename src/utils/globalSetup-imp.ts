// const { FullConfig } = require("@playwright/test");
import { FullConfig } from '@playwright/test';

import * as path from 'path';
import { loadEnvFiles, resolveTestEnv } from '../tests/utils/env';
import * as fs from 'fs';
import { execSync } from 'child_process';

function detectProject(): string {
  const args = process.argv.join(' ').toLowerCase().replace(/\\/g, '/');
  if (args.includes('oao')) return 'OAO';
  if (args.includes('consumer')) return 'Consumer';

  // When only a filename is passed, find it on disk to detect the project folder
  const testFileArg = process.argv.find(a => a.endsWith('.test.ts'));
  if (testFileArg && !path.isAbsolute(testFileArg) && !testFileArg.includes('/') && !testFileArg.includes('\\')) {
    try {
      const result = execSync(`where /R tests "${testFileArg}"`, { encoding: 'utf-8', timeout: 5000 }).trim();
      const resolved = result.split(/\r?\n/)[0].toLowerCase().replace(/\\/g, '/');
      if (resolved.includes('/oao/')) return 'OAO';
      if (resolved.includes('/consumer/')) return 'Consumer';
    } catch { /* fallback below */ }
  }

  return 'd1_Consumer';
}

async function globalSetup(config : FullConfig) {

  const testEnv = loadEnvFiles();
  const projectName = detectProject();
  console.log(`🎯 Running tests with Environment: ${testEnv.toUpperCase()}, Project: ${projectName}`);

  if(process.env.CI) {
    process.env.USER_NAME = process.env.CI_USER_NAME;
    process.env.PASSWORD = process.env.CI_PASSWORD;
  }
}

export function loadTestData() {
  const env = resolveTestEnv().toLowerCase();
  const testDataPath = path.join(
    process.cwd(),
    `tests/d1_Consumer/testData/testData.${env}.json`
  );

  if (!fs.existsSync(testDataPath)) {
    throw new Error(
      `Test data file not found for environment: ${env}\n` +
      `Expected path: ${testDataPath}\n` +
      `Available environments: sit, qa\n` +
      `Set TEST_ENV environment variable to switch environments.`
    );
  }

  try {
    const data = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));
    console.log(`✅ Test data loaded for environment: ${env.toUpperCase()}`);
    return data;
  } catch (error) {
    throw new Error(`Failed to parse test data file: ${testDataPath}\n${error}`);
  }
}
 
module.exports = globalSetup;
module.exports.loadTestData = loadTestData;
