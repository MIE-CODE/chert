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
   * Normalize user object from API to match User interface
   */
  private normalizeUser(apiUser: any): User {
    const normalized = {
      id: apiUser.id || apiUser._id || "",
      name: apiUser.name || apiUser.username || "Unknown",
      username: apiUser.username,
      email: apiUser.email,
      phone: apiUser.phone || apiUser.phoneNumber,
      avatar: apiUser.avatar || apiUser.image || "",
      status: apiUser.status || "",
      isOnline: apiUser.isOnline || false,
    };
    
    if (!normalized.id) {
      console.error("User normalization failed - missing ID:", apiUser);
    }
    
    return normalized;
  }

  /**
   * Register a new user
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await apiClient.axiosInstance.post<
      ApiResponse<AuthResponse>
    >(`${this.basePath}/signup`, data);

    if (response.data.success && response.data.data) {
      const { token, refreshToken, user } = response.data.data;
      // Normalize user object to ensure it matches User interface
      const normalizedUser = this.normalizeUser(user);
      if (token && refreshToken) {
        apiClient.setAuthTokens(token, refreshToken);
        console.debug("Signup successful, tokens stored");
      } else {
        console.error("Signup response missing token or refreshToken");
      }
      console.log("Signup - Normalized user:", normalizedUser);
      return { user: normalizedUser, token, refreshToken };
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
      // Normalize user object to ensure it matches User interface
      const normalizedUser = this.normalizeUser(user);
      if (token && refreshToken) {
        apiClient.setAuthTokens(token, refreshToken);
        console.debug("Login successful, tokens stored");
      } else {
        console.error("Login response missing token or refreshToken");
      }
      console.log("Login - Normalized user:", normalizedUser);
      return { user: normalizedUser, token, refreshToken };
    }

    throw new Error(response.data.message || "Login failed");
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.axiosInstance.get<
        ApiResponse<{ user: any } | User>
      >(`${this.basePath}/me`);

      if (response.data.success && response.data.data) {
        // Handle both nested { user: {...} } and direct user object
        const userData = (response.data.data as any).user || response.data.data;
        const normalizedUser = this.normalizeUser(userData);
        
        // Validate that we have an ID
        if (!normalizedUser.id) {
          console.error("User object missing ID:", userData);
          throw new Error("Invalid user data: missing ID");
        }
        
        console.log("Normalized user:", normalizedUser);
        return normalizedUser;
      }

      throw new Error(response.data.message || "Failed to get user");
    } catch (error: any) {
      // Preserve timeout and network error flags
      if (error?.isTimeout || error?.isNetworkError) {
        error.isTimeout = error.isTimeout || error.code === 'ECONNABORTED' || error.message?.includes('timeout');
        error.isNetworkError = error.isNetworkError || error.code === 'ERR_NETWORK';
      }
      console.error("getCurrentUser error:", error);
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

