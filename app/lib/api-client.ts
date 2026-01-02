/**
 * API Client
 * Centralized axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

class ApiClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          // Only log warning for protected routes (not auth endpoints)
          const isAuthEndpoint = config.url?.includes('/auth/login') || 
                                config.url?.includes('/auth/signup') ||
                                config.url?.includes('/auth/refresh-token');
          if (!isAuthEndpoint && config.url) {
            console.warn('API call made without token:', config.method?.toUpperCase(), config.url);
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // If 401 and not already retrying, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.clearTokens();
            if (typeof window !== "undefined") {
              window.location.href = "/auth/login";
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.debug("No auth token found in localStorage");
      }
      return token;
    } catch (error) {
      console.error("Error reading token from localStorage:", error);
      return null;
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
  }

  private setTokens(token: string, refreshToken: string) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("refresh_token", refreshToken);
        console.debug("Tokens stored successfully");
      } catch (error) {
        console.error("Error storing tokens in localStorage:", error);
      }
    }
  }

  private clearTokens() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    this.refreshTokenPromise = axios
      .post(`${API_BASE_URL}/api/auth/refresh-token`, {
        refreshToken,
      })
      .then((response) => {
        const { token, refreshToken: newRefreshToken } = response.data.data;
        this.setTokens(token, newRefreshToken);
        return token;
      })
      .catch(() => {
        this.clearTokens();
        return null;
      })
      .finally(() => {
        this.refreshTokenPromise = null;
      });

    return this.refreshTokenPromise;
  }

  // Public methods
  setAuthTokens(token: string, refreshToken: string) {
    this.setTokens(token, refreshToken);
  }

  clearAuthTokens() {
    this.clearTokens();
  }

  get axiosInstance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();

