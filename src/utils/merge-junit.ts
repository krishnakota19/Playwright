import * as fs from 'fs';
import * as path from 'path';
import { parseStringPromise, Builder } from 'xml2js';

/**
 * Merge multiple JUnit XML reports (one per shard) into a single consolidated file.
 * Usage: npx ts-node scripts/merge-junit.ts <inputDir> <outputFile>
 * Example: npx ts-node scripts/merge-junit.ts ./junit-reports merged-junit-test-report.xml
 */

interface SuiteCounts {
  tests: number;
  failures: number;
  skipped: number;
  errors: number;
  time: number;
}

async function mergeJUnitReports(inputDir: string, outputFile: string) {
  if (!fs.existsSync(inputDir)) {
    throw new Error(`Input directory not found: ${inputDir}`);
  }

  const files = fs.readdirSync(inputDir)
    .filter(f => f.endsWith('.xml'))
    .map(f => path.join(inputDir, f));

  if (files.length === 0) {
    throw new Error(`No XML files found in ${inputDir}`);
  }

  console.log(`🧩 Found ${files.length} JUnit XML file(s) to merge:`);
  files.forEach(f => console.log(`  • ${f}`));

  const allSuites: any[] = [];
  const counts: SuiteCounts = { tests: 0, failures: 0, skipped: 0, errors: 0, time: 0 };

  for (const file of files) {
    const xml = fs.readFileSync(file, 'utf-8');
    try {
      const parsed = await parseStringPromise(xml, { explicitArray: true });
      let suites: any[] = [];

      if (parsed.testsuites && parsed.testsuites.testsuite) {
        suites = parsed.testsuites.testsuite;
      } else if (parsed.testsuite) {
        // Single testsuite at root
        suites = parsed.testsuite instanceof Array ? parsed.testsuite : [parsed.testsuite];
      } else {
        console.warn(`⚠️ No <testsuite> elements found in ${file}, skipping.`);
        continue;
      }

      for (const suite of suites) {
        const attrs = suite.$ || {};
        counts.tests += numberAttr(attrs.tests);
        counts.failures += numberAttr(attrs.failures);
        counts.errors += numberAttr(attrs.errors);
        // JUnit may use 'skipped' or 'skip'
        counts.skipped += numberAttr(attrs.skipped || attrs.skip);
        counts.time += numberAttr(attrs.time);
        allSuites.push(suite);
      }
    } catch (err) {
      console.error(`❌ Failed to parse ${file}: ${(err as Error).message}`);
    }
  }

  if (allSuites.length === 0) {
    throw new Error('No test suites collected to merge.');
  }

  const merged: any = {
    testsuites: {
      $: {
        name: 'Merged Test Suites',
        tests: counts.tests,
        failures: counts.failures,
        errors: counts.errors,
        skipped: counts.skipped,
        time: counts.time.toFixed(3),
      },
      testsuite: allSuites,
    },
  };

  const builder = new Builder({ headless: true, renderOpts: { pretty: true } });
  const xmlOut = builder.buildObject(merged);
  fs.writeFileSync(outputFile, xmlOut, 'utf-8');
  console.log(`✅ Merged JUnit report written to: ${outputFile}`);
  console.log(`   Total suites: ${allSuites.length}`);
  console.log(`   Tests: ${counts.tests}, Failures: ${counts.failures}, Errors: ${counts.errors}, Skipped: ${counts.skipped}`);
}

function numberAttr(val: any): number {
  if (val === undefined || val === null || val === '') return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

(async () => {
  const inputDir = process.argv[2] || './junit-reports';
  const outputFile = process.argv[3] || 'merged-junit-test-report.xml';

  try {
    await mergeJUnitReports(inputDir, outputFile);
  } catch (err) {
    console.error(`❌ Merge failed: ${(err as Error).message}`);
    process.exit(1);
  }
})();
