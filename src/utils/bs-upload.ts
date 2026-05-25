import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

interface UploadOptions {
    reportPath?: string;
    projectName?: string;
    buildName?: string;
    environment?: string;
}

class ConfigurableBrowserStackUploader {
    private readonly apiUrl = 'https://upload-automation.browserstack.com/upload';
    private readonly username: string;
    private readonly accessKey: string;
    private readonly isUploadEnabled: boolean;
    private readonly environment: string;

    constructor(options: UploadOptions = {}) {
        // Determine environment
        this.environment = options.environment || process.env.TEST_ENV || 'qa';
        
        // Load environment-specific configuration
        this.loadEnvironmentConfig();
        
        // Check if BrowserStack upload is enabled
        this.isUploadEnabled = this.checkUploadEnabled();
        
        // Set credentials
        this.username = process.env.BROWSERSTACK_USERNAME || '';
        this.accessKey = process.env.BROWSERSTACK_ACCESS_KEY || '';
        
        // Log configuration status
        this.logConfigurationStatus();
    }

    private loadEnvironmentConfig(): void {
        const candidatePaths = [
            path.resolve(process.cwd(), 'config', `.env.${this.environment}`),
            path.resolve(__dirname, '..', '..', 'config', `.env.${this.environment}`),
            path.resolve(__dirname, '..', '..', '..', 'config', `.env.${this.environment}`),
        ];

        const configPath = candidatePaths.find((candidatePath) => fs.existsSync(candidatePath));

        if (configPath) {
            console.log(`Loading configuration from: ${configPath}`);
            dotenv.config({ path: configPath });
            return;
        }

        console.warn(`Configuration file not found for environment: ${this.environment}`);
    }

    private checkUploadEnabled(): boolean {
        const bsUpload = process.env.BS_UPLOAD;
        
        if (bsUpload === undefined) {
            console.warn('⚠️ BS_UPLOAD not defined in environment configuration, defaulting to false');
            return false;
        }
        
        return bsUpload.toLowerCase() === 'true';
    }

    private logConfigurationStatus(): void {
        console.log('\n🔧 BrowserStack Upload Configuration:');
        console.log(`   Environment: ${this.environment}`);
        console.log(`   Upload Enabled: ${this.isUploadEnabled}`);
        console.log(`   Username Set: ${!!this.username}`);
        console.log(`   Access Key Set: ${!!this.accessKey}`);
        console.log('');
    }

    private generateBuildId(): string {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        try {
            const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
            return `${branch}-${timestamp}`;
        } catch {
            return `local-${timestamp}`;
        }
    }

    async uploadResults(options: UploadOptions = {}): Promise<boolean> {
        // Check if upload is enabled
        if (!this.isUploadEnabled) {
            console.log('⏭️ BrowserStack upload is disabled in environment configuration. Skipping upload.');
            return true; // Return true to not break the workflow
        }

        // Check credentials
        if (!this.username || !this.accessKey) {
            console.error('❌ BrowserStack credentials required: BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY');
            throw new Error('BrowserStack credentials required: BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY');
        }

        const config = {
            reportPath: options.reportPath || './test-results/junit-report.xml',
            projectName: options.projectName || 'dlfi-impl_mfbstage1playwright',
            buildName: options.buildName || process.env.BUILD_NAME || `${this.environment}-tests`,
            buildIdentifier: this.generateBuildId(),
            tags: process.env.GITHUB_ACTIONS ? 
                `playwright,automation,github-actions,ci-cd,${this.environment}` : 
                `playwright,automation,local,${this.environment}`,
            frameworkVersion: `playwright,${process.env.PLAYWRIGHT_VERSION || require('@playwright/test/package.json').version}`,
            ciUrl: process.env.GITHUB_SERVER_URL ? 
                `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : 
                'http://localhost:8080/'
        };

        console.log(`🔍 Looking for test report at: ${config.reportPath}`);
        
        if (!fs.existsSync(config.reportPath)) {
            console.error(`❌ Test report not found: ${config.reportPath}`);
            throw new Error(`Test report not found: ${config.reportPath}`);
        }

        const stats = fs.statSync(config.reportPath);
        console.log(`📊 Report file size: ${stats.size} bytes`);
        
        if (stats.size === 0) {
            console.warn('⚠️ Report file is empty!');
        }

        console.log(`🚀 Uploading ${config.projectName} - ${config.buildName} (${config.buildIdentifier}) for ${this.environment} environment`);

        const curlCmd = process.platform === 'win32' ? 'curl.exe' : 'curl';
        const command = `${curlCmd} -u "${this.username}:${this.accessKey}" -X POST ` +
            `-F "data=@${config.reportPath}" ` +
            `-F "projectName=${config.projectName}" ` +
            `-F "buildName=${config.buildName}" ` +
            `-F "buildIdentifier=${config.buildIdentifier}" ` +
            `-F "tags=${config.tags}" ` +
            `-F "ci=${config.ciUrl}" ` +
            `-F "frameworkVersion=${config.frameworkVersion}" ` +
            this.apiUrl;

        try {
            const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
            console.log('✅ Upload successful!');
            
            try {
                const response = JSON.parse(result);
                if (response.message) {
                    const urlMatch = response.message.match(/https:\/\/automation\.browserstack\.com\/builds\/[a-zA-Z0-9]+/);
                    if (urlMatch) {
                        console.log(`🔗 View results: ${urlMatch[0]}`);
                    }
                }
            } catch {
                console.log('📝 Response:', result);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Upload failed:', (error as Error).message);
            throw error;
        }
    }

    async runTestsAndUpload(testCommand: string, options: UploadOptions = {}): Promise<boolean> {
        console.log(`🧪 Running: ${testCommand}`);
        
        try {
            execSync(testCommand, { stdio: 'inherit' });
            console.log('✅ Tests completed');
        } catch {
            console.warn('⚠️ Tests had failures, uploading results anyway');
        }

        return this.uploadResults(options);
    }

    // Static method for conditional upload based on environment
    static async conditionalUpload(options: UploadOptions = {}): Promise<boolean> {
        const uploader = new ConfigurableBrowserStackUploader(options);
        return uploader.uploadResults(options);
    }
}

// CLI usage
const isMainModule = process.argv[1] && (
    path.basename(process.argv[1]).includes('browserstack-upload')
);

if (isMainModule) {
    const [command, ...args] = process.argv.slice(2);
    
    if (command === 'upload') {
        const [reportPath, projectName, buildName, environment] = args;
        const options: UploadOptions = {};
        if (reportPath) options.reportPath = reportPath;
        if (projectName) options.projectName = projectName;
        if (buildName) options.buildName = buildName;
        if (environment) options.environment = environment;
        
        ConfigurableBrowserStackUploader.conditionalUpload(options)
            .catch(err => {
                console.error('Upload failed:', err.message);
                process.exit(1);
            });
        
    } else if (command === 'test-and-upload') {
        const [testCommand = 'npm run test:Consumer:qa:smoke', projectName, environment] = args;
        const options: UploadOptions = {};
        if (projectName) options.projectName = projectName;
        if (environment) options.environment = environment;
        
        const uploader = new ConfigurableBrowserStackUploader(options);
        uploader.runTestsAndUpload(testCommand, options)
            .catch(err => {
                console.error('Test and upload failed:', err.message);
                process.exit(1);
            });
        
    } else {
        console.log(`
Configurable BrowserStack Test Observability Uploader

Usage:
    npx ts-node tests/utils/browserstack-upload.ts upload [report-path] [project-name] [build-name] [environment]
    npx ts-node tests/utils/browserstack-upload.ts test-and-upload [test-command] [project-name] [environment]

Examples:
    npx ts-node tests/utils/browserstack-upload.ts upload
    npx ts-node tests/utils/browserstack-upload.ts upload "./test-results/junit-report.xml" "My Project" "Build 1" "qa"
    npx ts-node tests/utils/browserstack-upload.ts test-and-upload "npm run test:Consumer:qa:smoke" "dlfi-impl_mfbstage1playwright" "qa"

Environment Variables:
  BROWSERSTACK_USERNAME - Your BrowserStack username  
  BROWSERSTACK_ACCESS_KEY - Your BrowserStack access key
  TEST_ENV - Target environment (qa, uat, prod) - defaults to 'qa'

Configuration:
  Set BS_UPLOAD=true in your .env.[environment] file to enable upload
  Set BS_UPLOAD=false to disable upload for that environment
        `);
    }
}

export default ConfigurableBrowserStackUploader;
