import type { ApiError } from './types';

/**
 * API base URL configuration
 * Falls back to localhost:3001 for development
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * API Error class for handling API errors
 */
export class ApiRequestError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(message: string, statusCode: number, code: string, details?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Base API client with error handling and retry logic
 */
class ApiClient {
  private baseUrl: string;
  private defaultRetryCount = 3;
  private defaultRetryDelay = 1000; // ms

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a fetch request with error handling
   */
  private async fetch<T>(
    endpoint: string,
    options?: RequestInit,
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      // Handle non-JSON responses (like 204 No Content)
      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();

      // Handle error responses
      if (!response.ok) {
        throw this.createError(data, response.status);
      }

      return data;
    } catch (error) {
      // Retry on network errors or 5xx errors
      if (retryCount < this.defaultRetryCount && this.shouldRetry(error)) {
        await this.delay(this.defaultRetryDelay * (retryCount + 1));
        return this.fetch<T>(endpoint, options, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Create an ApiRequestError from response data
   */
  private createError(data: ApiError | unknown, statusCode: number): ApiRequestError {
    if (this.isApiError(data)) {
      return new ApiRequestError(
        data.error.message,
        statusCode,
        data.error.code,
        data.error.details
      );
    }

    // Generic error for non-standard responses
    return new ApiRequestError(
      'An unexpected error occurred',
      statusCode,
      'UNKNOWN_ERROR'
    );
  }

  /**
   * Type guard for ApiError
   */
  private isApiError(data: unknown): data is ApiError {
    return (
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as ApiError).error === 'object' &&
      (data as ApiError).error !== null &&
      'code' in (data as ApiError).error &&
      'message' in (data as ApiError).error
    );
  }

  /**
   * Determine if error should trigger retry
   */
  private shouldRetry(error: unknown): boolean {
    // Retry on network errors
    if (!(error instanceof ApiRequestError)) {
      return true;
    }

    // Retry on 5xx errors and 429 (rate limit)
    return error.statusCode >= 500 || error.statusCode === 429;
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    const queryString = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return this.fetch<T>(`${endpoint}${queryString}`, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.get<{ status: string }>('/health');
      return result.status === 'healthy';
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
