/**
 * Users API Service
 * Handles all user-related API calls
 */

import { apiClient } from "@/app/lib/api-client";
import { User, Contact } from "@/app/store/types";

export interface UpdateUserRequest {
  username?: string;
  status?: string;
  avatar?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

class UsersAPI {
  private basePath = "/api/users";

  /**
   * Get current user profile
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
   * Update current user profile
   */
  async updateCurrentUser(data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.axiosInstance.put<
      ApiResponse<{ user: User }>
    >(`${this.basePath}/me`, data);

    if (response.data.success && response.data.data) {
      return response.data.data.user;
    }

    throw new Error(response.data.message || "Failed to update user");
  }

  /**
   * Normalize API user response to Contact format
   */
  private normalizeUserToContact(user: any): Contact {
    return {
      id: user.id || user._id || "",
      name: user.name || user.username || "Unknown",
      avatar: user.avatar || "",
      email: user.email,
      phone: user.phone || user.phoneNumber || "",
      isUser: true,
      isOnline: user.isOnline || false,
    };
  }

  /**
   * Search users by username/email/phone
   */
  async searchUsers(query: string): Promise<Contact[]> {
    try {
      const response = await apiClient.axiosInstance.get<
        ApiResponse<any[]>
      >(`${this.basePath}/search`, {
        params: { q: query },
      });

      if (response.data.success && response.data.data) {
        // API returns data as an array directly, not wrapped in { users: [...] }
        const users = response.data.data;
        if (Array.isArray(users)) {
          return users.map((user) => this.normalizeUserToContact(user));
        }
        return [];
      }

      throw new Error(response.data.message || "Search failed");
    } catch (error: any) {
      // Preserve timeout and network error flags
      if (error?.isTimeout || error?.isNetworkError) {
        error.isTimeout = error.isTimeout || error.code === 'ECONNABORTED' || error.message?.includes('timeout');
        error.isNetworkError = error.isNetworkError || error.code === 'ERR_NETWORK';
      }
      // Log the error for debugging
      console.error("searchUsers error:", error);
      throw error;
    }
  }

  /**
   * Search user by phone number
   */
  async searchByPhone(phone: string): Promise<Contact[]> {
    try {
      const response = await apiClient.axiosInstance.get<
        ApiResponse<any[]>
      >(`${this.basePath}/search`, {
        params: { q: phone },
      });

      if (response.data.success && response.data.data) {
        // API returns data as an array directly, not wrapped in { users: [...] }
        const users = response.data.data;
        if (Array.isArray(users)) {
          return users.map((user) => this.normalizeUserToContact(user));
        }
        return [];
      }

      throw new Error(response.data.message || "Phone search failed");
    } catch (error: any) {
      // Preserve timeout and network error flags
      if (error?.isTimeout || error?.isNetworkError) {
        error.isTimeout = error.isTimeout || error.code === 'ECONNABORTED' || error.message?.includes('timeout');
        error.isNetworkError = error.isNetworkError || error.code === 'ERR_NETWORK';
      }
      // Log the error for debugging
      console.error("searchByPhone error:", error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const response = await apiClient.axiosInstance.get<
      ApiResponse<{ user: User }>
    >(`${this.basePath}/${userId}`);

    if (response.data.success && response.data.data) {
      return response.data.data.user;
    }

    throw new Error(response.data.message || "Failed to get user");
  }
}

export const usersAPI = new UsersAPI();

