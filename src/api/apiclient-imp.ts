import { APIRequestContext, APIResponse } from '@playwright/test';
import { Logger } from '../../utils/logger';
import { ApiHelper } from '../../utils/api-helper';

export interface ApiClientOptions {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class ApiClient {
  private request: APIRequestContext;
  private logger: Logger;
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(request: APIRequestContext, options: ApiClientOptions = {}) {
    this.request = request;
    this.logger = new Logger('ApiClient');
    this.baseURL = options.baseURL || process.env.BASE_URL || '';
    const baseHeaders = ApiHelper.loadHeaders('default');
    this.defaultHeaders = {
      ...baseHeaders,
      'effectivetime': '', // Keep this empty by default
      ...options.headers,
    };
  }

  /**
   * Perform GET request
   */
  async get(endpoint: string, options: any = {}): Promise<APIResponse> {
    const url = this.buildUrl(endpoint);
    this.logger.info(`GET ${url}`);
    
    try {
      const response = await this.request.get(url, {
        headers: { ...this.defaultHeaders, ...options.headers },
        params: options.params,
        timeout: options.timeout,
      });
      
      this.logger.info(`GET ${url} - Status: ${response.status()}`);
      return response;
    } catch (error) {
      this.logger.error(`GET ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Perform POST request
   */
  async post(endpoint: string, data: any = {}, options: any = {}): Promise<APIResponse> {
    const url = this.buildUrl(endpoint);
    this.logger.info(`POST ${url}`);
    
    try {
      const response = await this.request.post(url, {
        headers: { ...this.defaultHeaders, ...options.headers },
        data: JSON.stringify(data),
        timeout: options.timeout,
      });
      
      this.logger.info(`POST ${url} - Status: ${response.status()}`);
      return response;
    } catch (error) {
      this.logger.error(`POST ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Perform PUT request
   */
  async put(endpoint: string, data: any = {}, options: any = {}): Promise<APIResponse> {
    const url = this.buildUrl(endpoint);
    this.logger.info(`PUT ${url}`);
    
    try {
      const response = await this.request.put(url, {
        headers: { ...this.defaultHeaders, ...options.headers },
        data: JSON.stringify(data),
        timeout: options.timeout,
      });
      
      this.logger.info(`PUT ${url} - Status: ${response.status()}`);
      return response;
    } catch (error) {
      this.logger.error(`PUT ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Perform PATCH request
   */
  async patch(endpoint: string, data: any = {}, options: any = {}): Promise<APIResponse> {
    const url = this.buildUrl(endpoint);
    this.logger.info(`PATCH ${url}`);
    
    try {
      const response = await this.request.patch(url, {
        headers: { ...this.defaultHeaders, ...options.headers },
        data: JSON.stringify(data),
        timeout: options.timeout,
      });
      
      this.logger.info(`PATCH ${url} - Status: ${response.status()}`);
      return response;
    } catch (error) {
      this.logger.error(`PATCH ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Perform DELETE request
   */
  async delete(endpoint: string, options: any = {}): Promise<APIResponse> {
    const url = this.buildUrl(endpoint);
    this.logger.info(`DELETE ${url}`);
    
    try {
      const response = await this.request.delete(url, {
        headers: { ...this.defaultHeaders, ...options.headers },
        timeout: options.timeout,
      });
      
      this.logger.info(`DELETE ${url} - Status: ${response.status()}`);
      return response;
    } catch (error) {
      this.logger.error(`DELETE ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Build full URL from endpoint
   */
  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseURL}${cleanEndpoint}`;
  }

  /**
   * Set authorization header
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Set API key header
   */
  setApiKey(key: string, headerName: string = 'X-API-Key'): void {
    this.defaultHeaders[headerName] = key;
  }

  /**
   * Add custom header
   */
  setHeader(name: string, value: string): void {
    this.defaultHeaders[name] = value;
  }

  /**
   * Remove header
   */
  removeHeader(name: string): void {
    delete this.defaultHeaders[name];
  }
}
