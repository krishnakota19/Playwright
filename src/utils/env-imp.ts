// Centralized environment and dotenv loader for Playwright
import * as dotenv from 'dotenv';
import * as fs from 'fs';

export function resolveTestEnv() {
  return process.env.test_env || process.env.TEST_ENV || 'sit';
}

export function loadEnvFiles() {
  const testEnv = resolveTestEnv();
  dotenv.config({ path: 'config/.env', override: true });
  const envPath = `config/.env.${testEnv}`;
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
  }
  return testEnv;
}
