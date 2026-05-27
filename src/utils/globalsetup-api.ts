import { FullConfig } from '@playwright/test';
import { Logger } from './logger';
import * as fs from 'fs';
import * as path from 'path';

async function globalSetup(_config: FullConfig) {
  const logger = new Logger('GlobalSetup');
  
  logger.info('Starting global setup...');

  // Create logs directory if it doesn't exist
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    logger.info('Created logs directory');
  }

  // Create test-results directory if it doesn't exist
  const resultsDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
    logger.info('Created test-results directory');
  }

  // Clean up old test results (optional)
  if (process.env.CLEAN_RESULTS === 'true') {
    const files = fs.readdirSync(resultsDir);
    files.forEach(file => {
      const filePath = path.join(resultsDir, file);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    });
    logger.info('Cleaned up old test results');
  }

  // Set up any global test data or configuration
  logger.info('Global setup completed successfully');
}

export default globalSetup;
