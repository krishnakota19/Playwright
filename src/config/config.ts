import dotenv from 'dotenv';
import { DatabaseConfig } from '../database/DatabaseClient';

dotenv.config();

/**
 * Test configuration
 */
export const testConfig = {
  // Base URLs
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:3000/api',

  // Browser settings
  browser: process.env.BROWSER || 'chromium',
  headless: process.env.HEADLESS !== 'false',
  slowmo: parseInt(process.env.SLOWMO || '0'),
  timeout: parseInt(process.env.TIMEOUT || '30000'),

  // Screenshot and video
  screenshot: process.env.SCREENSHOT || 'only-on-failure',
  video: process.env.VIDEO || 'retain-on-failure',
  trace: process.env.TRACE || 'on-first-retry',

  // Retry settings
  retries: parseInt(process.env.RETRIES || '2'),
  workers: parseInt(process.env.WORKERS || '1'),

  // Test data
  testUser: {
    email: process.env.TEST_USER_EMAIL || 'test@example.com',
    password: process.env.TEST_USER_PASSWORD || 'testPassword123',
  },
};

/**
 * Database configuration
 */
export const dbConfig: DatabaseConfig = {
  type: (process.env.DB_TYPE as 'postgres' | 'mysql' | 'sqlite') || 'sqlite',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'testdb',
  path: process.env.DB_PATH || './test.db',
};

/**
 * API configuration
 */
export const apiConfig = {
  baseUrl: process.env.API_URL || 'http://localhost:3000/api',
  timeout: parseInt(process.env.API_TIMEOUT || '10000'),
  authToken: process.env.AUTH_TOKEN || '',
};

export default {
  testConfig,
  dbConfig,
  apiConfig,
};
