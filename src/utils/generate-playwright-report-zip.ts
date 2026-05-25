import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';

function resolveReportDirectory(): string {
  const requestedDir = process.argv[2] || process.env.PLAYWRIGHT_REPORT_DIR;
  if (requestedDir) {
    return path.resolve(requestedDir);
  }

  const reportsRoot = path.resolve('playwright-report');
  const timestampedReports = fs
    .readdirSync(reportsRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('playwright-report-'))
    .map(entry => {
      const fullPath = path.join(reportsRoot, entry.name);
      return {
        fullPath,
        modifiedTime: fs.statSync(fullPath).mtimeMs,
      };
    })
    .sort((left, right) => right.modifiedTime - left.modifiedTime);

  if (timestampedReports.length > 0) {
    return timestampedReports[0].fullPath;
  }

  return reportsRoot;
}

function generateZip(): void {
  const reportDir = resolveReportDirectory();
  const htmlFilePath = path.join(reportDir, 'index.html');

  if (!fs.existsSync(htmlFilePath)) {
    throw new Error(`Playwright HTML report not found at ${htmlFilePath}`);
  }

  const zipFilePath = path.join(reportDir, 'playwright-report.zip');
  const zip = new AdmZip();
  zip.addLocalFolder(reportDir);
  zip.writeZip(zipFilePath);

  console.log(`Playwright report ZIP created: ${zipFilePath}`);
}

try {
  generateZip();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
