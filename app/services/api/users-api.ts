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
   * Search users by username/email/phone
   */
  async searchUsers(query: string): Promise<Contact[]> {
    const response = await apiClient.axiosInstance.get<
      ApiResponse<{ users: Contact[] }>
    >(`${this.basePath}/search`, {
      params: { q: query },
    });

    if (response.data.success && response.data.data) {
      return response.data.data.users;
    }

    throw new Error(response.data.message || "Search failed");
  }

  /**
   * Search user by phone number
   */
  async searchByPhone(phone: string): Promise<Contact[]> {
    const response = await apiClient.axiosInstance.get<
      ApiResponse<{ users: Contact[] }>
    >(`${this.basePath}/search`, {
      params: { phone: phone },
    });

    if (response.data.success && response.data.data) {
      return response.data.data.users;
    }

    throw new Error(response.data.message || "Phone search failed");
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

