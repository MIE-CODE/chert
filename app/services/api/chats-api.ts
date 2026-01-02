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
   * Get all user's chats
   */
  async getChats(): Promise<Chat[]> {
    const response = await apiClient.axiosInstance.get<
      ApiResponse<{ chats: Chat[] }>
    >(this.basePath);

    if (response.data.success && response.data.data) {
      return response.data.data.chats;
    }

    throw new Error(response.data.message || "Failed to get chats");
  }

  /**
   * Get chat by ID
   */
  async getChatById(chatId: string): Promise<Chat> {
    const response = await apiClient.axiosInstance.get<
      ApiResponse<{ chat: Chat }>
    >(`${this.basePath}/${chatId}`);

    if (response.data.success && response.data.data) {
      return response.data.data.chat;
    }

    throw new Error(response.data.message || "Failed to get chat");
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

