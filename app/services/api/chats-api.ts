/**
 * Chats API Service
 * Handles all chat-related API calls
 */

import { apiClient } from "@/app/lib/api-client";
import { Chat, ChatMember } from "@/app/store/types";

export interface CreateChatRequest {
  participantIds: string[];
  isGroup: boolean;
  name?: string;
  description?: string;
}

export interface UpdateChatRequest {
  name?: string;
  description?: string;
  avatar?: string;
}

export interface AddParticipantsRequest {
  participantIds: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

class ChatsAPI {
  private basePath = "/api/chats";

  /**
   * Start a new chat with a user (one-to-one)
   */
  async startChat(phoneNumber: string): Promise<Chat> {
    const response = await apiClient.axiosInstance.post<
      ApiResponse<{ chat: Chat }>
    >(`${this.basePath}/start`, { phoneNumber });

    if (response.data.success && response.data.data) {
      return response.data.data.chat;
    }

    throw new Error(response.data.message || "Failed to start chat");
  }

  /**
   * Create a new chat (one-to-one or group)
   */
  async createChat(data: CreateChatRequest): Promise<Chat> {
    const response = await apiClient.axiosInstance.post<
      ApiResponse<{ chat: Chat }>
    >(this.basePath, data);

    if (response.data.success && response.data.data) {
      return response.data.data.chat;
    }

    throw new Error(response.data.message || "Failed to create chat");
  }

  /**
   * Get all user's chats with pagination
   */
  async getChats(params?: { page?: number; limit?: number }): Promise<{ chats: any[]; hasMore: boolean; total?: number }> {
    try {
      const response = await apiClient.axiosInstance.get<
        ApiResponse<{ chats?: any[] } | any[] | { chats: any[]; pagination?: any }>
      >(this.basePath, {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 20,
        },
      });

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        
        // Handle paginated response format
        if (data && typeof data === "object" && "chats" in data && "pagination" in data) {
          const paginatedData = data as { chats: any[]; pagination: { hasMore?: boolean; total?: number } };
          return {
            chats: Array.isArray(paginatedData.chats) ? paginatedData.chats : [],
            hasMore: paginatedData.pagination?.hasMore ?? true,
            total: paginatedData.pagination?.total,
          };
        }
        
        // Handle array format (backward compatibility)
        if (Array.isArray(data)) {
          return {
            chats: data,
            hasMore: data.length >= (params?.limit || 20),
          };
        }
        
        // Handle nested format with chats property
        if (data && typeof data === "object" && "chats" in data) {
          const chats = (data as { chats?: any[] }).chats;
          return {
            chats: Array.isArray(chats) ? chats : [],
            hasMore: Array.isArray(chats) && chats.length >= (params?.limit || 20),
          };
        }
        
        console.warn("Unexpected API response format:", data);
        return { chats: [], hasMore: false };
      }

      throw new Error(response.data.message || "Failed to get chats");
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
   * Get chat by ID
   */
  async getChatById(chatId: string): Promise<Chat> {
    try {
      const response = await apiClient.axiosInstance.get<
        ApiResponse<{ chat: Chat } | Chat>
      >(`${this.basePath}/${chatId}`);

      if (response.data.success && response.data.data) {
        // Handle both { chat: Chat } and direct Chat formats
        const data = response.data.data;
        if (data && typeof data === "object" && "chat" in data) {
          return (data as { chat: Chat }).chat;
        }
        return data as Chat;
      }

      throw new Error(response.data.message || "Failed to get chat");
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
   * Update group chat (admin only)
   */
  async updateChat(chatId: string, data: UpdateChatRequest): Promise<Chat> {
    const response = await apiClient.axiosInstance.put<
      ApiResponse<{ chat: Chat }>
    >(`${this.basePath}/${chatId}`, data);

    if (response.data.success && response.data.data) {
      return response.data.data.chat;
    }

    throw new Error(response.data.message || "Failed to update chat");
  }

  /**
   * Add participants to group (admin only)
   */
  async addParticipants(
    chatId: string,
    data: AddParticipantsRequest
  ): Promise<ChatMember[]> {
    const response = await apiClient.axiosInstance.post<
      ApiResponse<{ participants: ChatMember[] }>
    >(`${this.basePath}/${chatId}/participants`, data);

    if (response.data.success && response.data.data) {
      return response.data.data.participants;
    }

    throw new Error(response.data.message || "Failed to add participants");
  }

  /**
   * Remove participant from group
   */
  async removeParticipant(
    chatId: string,
    participantId: string
  ): Promise<void> {
    const response = await apiClient.axiosInstance.delete<
      ApiResponse<void>
    >(`${this.basePath}/${chatId}/participants/${participantId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to remove participant");
    }
  }

  /**
   * Delete chat (admin only for groups)
   */
  async deleteChat(chatId: string): Promise<void> {
    const response = await apiClient.axiosInstance.delete<
      ApiResponse<void>
    >(`${this.basePath}/${chatId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete chat");
    }
  }
}

export const chatsAPI = new ChatsAPI();

