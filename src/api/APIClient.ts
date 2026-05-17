import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Logger } from '../utils/Logger';

/**
 * API Client for making HTTP requests
 * Supports GET, POST, PUT, DELETE, PATCH methods with automatic logging
 */
export class APIClient {
  private client: AxiosInstance;
  private logger: Logger;

  constructor(baseURL: string, timeout = 10000) {
    this.logger = new Logger('APIClient');
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        this.logger.info(`[${config.method?.toUpperCase()}] ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error(`Request error: ${error.message}`);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        this.logger.info(`Response status: ${response.status}`);
        return response;
      },
      (error) => {
        this.logger.error(`Response error: ${error.message}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authorization header
   * @param token - Bearer token
   */
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Set custom headers
   * @param headers - Headers object
   */
  setHeaders(headers: Record<string, string>): void {
    this.client.defaults.headers.common = { ...this.client.defaults.headers.common, ...headers };
  }

  /**
   * GET request
   * @param endpoint - API endpoint
   * @param config - Axios config
   */
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.client.get<T>(endpoint, config);
    } catch (error) {
      this.logger.error(`GET request failed: ${error}`);
      throw error;
    }
  }

  /**
   * POST request
   * @param endpoint - API endpoint
   * @param data - Request body
   * @param config - Axios config
   */
  async post<T>(endpoint: string, data?: Record<string, any>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.client.post<T>(endpoint, data, config);
    } catch (error) {
      this.logger.error(`POST request failed: ${error}`);
      throw error;
    }
  }

  /**
   * PUT request
   * @param endpoint - API endpoint
   * @param data - Request body
   * @param config - Axios config
   */
  async put<T>(endpoint: string, data?: Record<string, any>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.client.put<T>(endpoint, data, config);
    } catch (error) {
      this.logger.error(`PUT request failed: ${error}`);
      throw error;
    }
  }

  /**
   * DELETE request
   * @param endpoint - API endpoint
   * @param config - Axios config
   */
  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.client.delete<T>(endpoint, config);
    } catch (error) {
      this.logger.error(`DELETE request failed: ${error}`);
      throw error;
    }
  }

  /**
   * PATCH request
   * @param endpoint - API endpoint
   * @param data - Request body
   * @param config - Axios config
   */
  async patch<T>(endpoint: string, data?: Record<string, any>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.client.patch<T>(endpoint, data, config);
    } catch (error) {
      this.logger.error(`PATCH request failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get response status
   * @param endpoint - API endpoint
   */
  async getStatus(endpoint: string): Promise<number> {
    try {
      const response = await this.get(endpoint);
      return response.status;
    } catch (error: any) {
      return error.response?.status || 0;
    }
  }

  /**
   * Verify response contains expected data
   * @param endpoint - API endpoint
   * @param expectedData - Data to verify
   */
  async verifyResponseData(endpoint: string, expectedData: Record<string, any>): Promise<boolean> {
    try {
      const response = await this.get(endpoint);
      return this.objectContains(response.data, expectedData);
    } catch (error) {
      this.logger.error(`Verification failed: ${error}`);
      return false;
    }
  }

  /**
   * Helper to check if object contains expected data
   */
  private objectContains(obj: any, expected: any): boolean {
    for (const key in expected) {
      if (!(key in obj) || obj[key] !== expected[key]) {
        return false;
      }
    }
    return true;
  }
}
