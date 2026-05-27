// const { FullConfig } = require("@playwright/test");
import dotenv from 'dotenv';
import path from 'path';

export default async function globalSetup() {
  // Set default values if environment variables are not provided
  const testEnv = process.env.test_env || process.env.TEST_ENV || 'qa';
  const testProject = process.env.TEST_PROJECT || process.env.PROJECT || 'projname';
  
  // Construct the environment file path
  const envFilePath = path.resolve(__dirname, '..', 'config', testProject, `.env.${testEnv}`);
  // Log the environment and project details
  console.log(`🔧 Loading environment: ${testEnv.toUpperCase()}`);
  console.log(`📁 Project: ${testProject}`);
  console.log(`📄 Environment file: ${envFilePath}`);
  
  try {
    const result = dotenv.config({ path: envFilePath, override: true });
    if (result.error) {
      throw result.error;
    }
    console.log(`✅ Successfully loaded environment variables from ${envFilePath}`);
    
    // Log key environment variables for verification (without sensitive data)
    console.log(`🌐 Base URL: ${process.env.BASE_URL || 'Not set'}`);
  
  } catch (error) {
    throw new Error(`Failed to load environment configuration: ${error}`);
  }
}

// module.exports = globalSetup;


// export default async function globalSetup() {
//  // Load environment-specific variables
//   if (process.env.test_env && process.env.TEST_PROJECT) {
//     console.log(`config/${process.env.TEST_PROJECT}/.env.${process.env.test_env}`);
//     const result = dotenv.config({ path: `config/${process.env.TEST_PROJECT}/.env.${process.env.test_env}`, override: true });
//     if (result.error) {
//       throw result.error;
//     }
//   }
// }
// async function globalSetup(config: { projects: any[]; }) {
//   // Load environment variables
//   dotenv.config({
//     path: `config/${process.env.PRODUCT}/.env.${process.env.ENV}`,
//     override: true
//   });
 
//   // Check if the `smoke` project is being used
//   const project = config.projects.find((p: { name: string; }) => p.name === 'smoke');
//   if (project) {
//     console.log('🔥 Running smoke tests...');
//   }
// }
 
// module.exports = globalSetup;
