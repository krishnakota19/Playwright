import { APIResponse } from '@playwright/test';
import { ValidationSchema } from '../src/models/types';
import * as fs from 'fs';
import * as path from 'path';

export class ApiHelper {
  /**
   * Validate response status code
   */
  static validateStatusCode(response: APIResponse, expectedStatus: number): void {
    if (response.status() !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, but got ${response.status()}`);
    }
  }

  /**
   * Extract response headers
   */
  static getResponseHeaders(response: APIResponse): Record<string, string> {
    return response.headers();
  }

  /**
   * Get response time (if available in headers)
   */
  static getResponseTime(response: APIResponse): number | null {
    const responseTime = response.headers()['x-response-time'];
    return responseTime ? parseFloat(responseTime) : null;
  }

  /**
   * Parse JSON response with error handling
   */
  static async parseJsonResponse<T>(response: APIResponse): Promise<T> {
    try {
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${error}`);
    }
  }

  /**
   * Validate response against schema
   */
  static validateResponseSchema(data: any, schema: ValidationSchema): boolean {
    if (schema.type && typeof data !== schema.type) {
      throw new Error(`Expected type ${schema.type}, but got ${typeof data}`);
    }

    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in data)) {
          throw new Error(`Required field '${field}' is missing`);
        }
      }
    }

    if (schema.properties) {
      for (const [key, _value] of Object.entries(schema.properties)) {
        if (key in data) {
          // Additional property validation can be added here
        }
      }
    }

    return true;
  }

  /**
   * Check if response is successful (2xx status codes)
   */
  static isSuccessResponse(response: APIResponse): boolean {
    const status = response.status();
    return status >= 200 && status < 300;
  }

  /**
   * Extract error message from response
   */
  static async getErrorMessage(response: APIResponse): Promise<string> {
    try {
      const errorData = await response.json();
      return errorData.message || errorData.error || `HTTP ${response.status()}`;
    } catch {
      return `HTTP ${response.status()} - ${response.statusText()}`;
    }
  }

  /**
   * Generate random test data
   */
  static generateRandomData(): any {
    return {
      id: Math.floor(Math.random() * 1000) + 1,
      name: `Test User ${Math.floor(Math.random() * 1000)}`,
      email: `test${Math.floor(Math.random() * 1000)}@example.com`,
      username: `user${Math.floor(Math.random() * 1000)}`,
      phone: `555-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      website: `https://test${Math.floor(Math.random() * 1000)}.com`,
    };
  }

  /**
   * Wait for a specified amount of time
   */
  static async wait(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  /**
   * Retry function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        await this.wait(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Format date for API requests
   */
  static formatDate(date: Date): string {
    return date.toISOString();
  }

  /**
   * Parse query parameters from URL
   */
  static parseQueryParams(url: string): Record<string, string> {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};
    
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  }

  /**
   * Build query string from object
   */
  static buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    return searchParams.toString();
  }

  /**
   * Load headers from data file
   */
  static loadHeaders(type: 'default' | 'custom' = 'default'): Record<string, string> {
    const headersPath = path.join(__dirname, '..', 'data', 'headers.json');
    const headersData = JSON.parse(fs.readFileSync(headersPath, 'utf8'));
    return headersData[type] || headersData.default;
  }

  /**
   * Merge headers with custom overrides
   */
  static mergeHeaders(baseHeaders: Record<string, string>, customHeaders: Record<string, string> = {}): Record<string, string> {
    return { ...baseHeaders, ...customHeaders };
  }

  /**
   * Get headers with custom effective time
   */
  static getHeadersWithEffectiveTime(effectiveTime: string, baseType: 'default' | 'custom' = 'default'): Record<string, string> {
    const baseHeaders = this.loadHeaders(baseType);
    return this.mergeHeaders(baseHeaders, { effectivetime: effectiveTime });
  }

  /**
   * Get headers with custom auth token
   */
  static getHeadersWithAuthToken(authToken: string, baseType: 'default' | 'custom' = 'default'): Record<string, string> {
    const baseHeaders = this.loadHeaders(baseType);
    return this.mergeHeaders(baseHeaders, { authtoken: authToken });
  }

  /**
   * Load test data from financial-wellness-data.json
   */
  static loadTestData(): any {
    const dataPath = path.join(__dirname, '..', 'data', 'financial-wellness-data.json');
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }

  /**
   * Get specific customer data by type
   */
  static getCustomerData(type: 'validCustomer' | 'invalidCustomer' = 'validCustomer'): any {
    const testData = this.loadTestData();
    return testData.financialWellness[type];
  }

  /**
   * Get customer data with single account (for simplified tests)
   */
  static getSimpleCustomerData(): any {
    const customerData = this.getCustomerData('validCustomer');
    return {
      ...customerData,
      accounts: [customerData.accounts[0]] // Return only the first account
    };
  }

  /**
   * Create insights payload structure
   */
  static createPayload(customerData: any, customerId?: string): any {
    return {
        "ctxId": "showAll",
        "customerId": customerId || customerData.id,
        "autoGenerate": "true",
        "hints": {
          "customer": customerData
        }
      
    };
  }
}
