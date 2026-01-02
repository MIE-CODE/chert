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
    const response = await apiClient.axiosInstance.get<
      ApiResponse<{ user: User }>
    >(`${this.basePath}/me`);

    if (response.data.success && response.data.data) {
      return response.data.data.user;
    }

    throw new Error(response.data.message || "Failed to get user");
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
  async refreshToken(): Promise<string> {
    const response = await apiClient.axiosInstance.post<
      ApiResponse<{ token: string; refreshToken: string }>
    >(`${this.basePath}/refresh-token`);

    if (response.data.success && response.data.data) {
      const { token, refreshToken } = response.data.data;
      apiClient.setAuthTokens(token, refreshToken);
      return token;
    }

    throw new Error(response.data.message || "Token refresh failed");
  }
}

export const authAPI = new AuthAPI();

