import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../utils/constants';

// Create axios instance for backend API
const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BACKEND_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for LLM service
export const llmApi: AxiosInstance = axios.create({
  baseURL: API_CONFIG.LLM_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor function
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  // Add timestamp to prevent caching
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
  }

  // Log request in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  }

  return config;
};

// Request error interceptor function
const requestErrorInterceptor = (error: any) => {
  console.error('❌ API Request Error:', error);
  return Promise.reject(error);
};

// Response interceptor function
const responseInterceptor = (response: AxiosResponse) => {
  // Log response in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
  }

  return response;
};

// Response error interceptor function
const responseErrorInterceptor = (error: any) => {
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
  }

  // Handle different error types
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        error.message = data.error || 'Bad Request';
        break;
      case 401:
        error.message = 'Unauthorized - Please login again';
        break;
      case 403:
        error.message = 'Forbidden - Access denied';
        break;
      case 404:
        error.message = data.error || 'Resource not found';
        break;
      case 409:
        error.message = data.error || 'Conflict - Resource already exists';
        break;
      case 422:
        error.message = data.error || 'Validation failed';
        break;
      case 429:
        error.message = 'Too many requests - Please slow down';
        break;
      case 500:
        error.message = 'Server error - Please try again later';
        break;
      case 503:
        error.message = 'Service unavailable - Please try again later';
        break;
      default:
        error.message = data.error || `Server error (${status})`;
    }
  } else if (error.request) {
    // Network error
    error.message = 'Network error - Please check your connection';
  } else {
    // Other error
    error.message = error.message || 'An unexpected error occurred';
  }

  return Promise.reject(error);
};

// Apply interceptors to main API
api.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// Apply same interceptors to LLM API
llmApi.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
llmApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// Helper functions for common request patterns
export const apiUtils = {
  // GET request with error handling
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.get<T>(url, config);
    return response.data;
  },

  // POST request with error handling
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.post<T>(url, data, config);
    return response.data;
  },

  // PUT request with error handling
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.put<T>(url, data, config);
    return response.data;
  },

  // PATCH request with error handling
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.patch<T>(url, data, config);
    return response.data;
  },

  // DELETE request with error handling
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.delete<T>(url, config);
    return response.data;
  },

  // LLM service requests
  llm: {
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
      const response = await llmApi.get<T>(url, config);
      return response.data;
    },

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
      const response = await llmApi.post<T>(url, data, config);
      return response.data;
    },
  },
};

export default api;