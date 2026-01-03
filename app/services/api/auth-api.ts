/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import { apiClient } from "@/app/lib/api-client";
import { User } from "@/app/store/types";

export interface SignupRequest {
  name: string;
  phone: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Array<{ path: string; message: string }>;
}

class AuthAPI {
  private basePath = "/api/auth";

  /**
   * Register a new user
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await apiClient.axiosInstance.post<
      ApiResponse<AuthResponse>
    >(`${this.basePath}/signup`, data);

    if (response.data.success && response.data.data) {
      const { token, refreshToken, user } = response.data.data;
      if (token && refreshToken) {
        apiClient.setAuthTokens(token, refreshToken);
        console.debug("Signup successful, tokens stored");
      } else {
        console.error("Signup response missing token or refreshToken");
      }
      return { user, token, refreshToken };
    }

    throw new Error(response.data.message || "Signup failed");
  }

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.axiosInstance.post<
      ApiResponse<AuthResponse>
    >(`${this.basePath}/login`, credentials);

    if (response.data.success && response.data.data) {
      const { token, refreshToken, user } = response.data.data;
      if (token && refreshToken) {
        apiClient.setAuthTokens(token, refreshToken);
        console.debug("Login successful, tokens stored");
      } else {
        console.error("Login response missing token or refreshToken");
      }
      return { user, token, refreshToken };
    }

    throw new Error(response.data.message || "Login failed");
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.axiosInstance.get<
        ApiResponse<{ user: User }>
      >(`${this.basePath}/me`);

      if (response.data.success && response.data.data) {
        return response.data.data.user;
      }

      throw new Error(response.data.message || "Failed to get user");
    } catch (error: any) {
      // Preserve timeout and network error flags
      if (error?.isTimeout || error?.isNetworkError) {
        error.isTimeout = error.isTimeout || error.code === 'ECONNABORTED' || error.message?.includes('timeout');
        error.isNetworkError = error.isNetworkError || error.code === 'ERR_NETWORK';
      }
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.axiosInstance.post(`${this.basePath}/logout`);
    } finally {
      apiClient.clearAuthTokens();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken?: string): Promise<string> {
    // Get refresh token from localStorage if not provided
    const tokenToSend = refreshToken || 
      (typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null);
    
    if (!tokenToSend) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.axiosInstance.post<
      ApiResponse<{ token: string; refreshToken: string }>
    >(`${this.basePath}/refresh-token`, {
      refreshToken: tokenToSend,
    });

    if (response.data.success && response.data.data) {
      // Handle both response.data.data and direct response formats
      const responseData = response.data.data as any;
      const token = responseData.token || responseData.accessToken;
      const newRefreshToken = responseData.refreshToken || responseData.refresh_token;
      
      if (token && newRefreshToken) {
        apiClient.setAuthTokens(token, newRefreshToken);
        return token;
      } else {
        throw new Error("Invalid refresh token response format");
      }
    }

    throw new Error(response.data.message || "Token refresh failed");
  }
}

export const authAPI = new AuthAPI();

