/**
 * Messages API Service
 * Handles all message-related API calls
 */

import { apiClient } from "@/app/lib/api-client";
import { Message } from "@/app/store/types";

export interface SendMessageRequest {
  chatId: string;
  content?: string;
  type: "text" | "image" | "file" | "audio";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyTo?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  messages?: T[]; // API might return 'messages' instead of 'items'
  items?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AddReactionRequest {
  emoji: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

class MessagesAPI {
  private basePath = "/api/messages";

  /**
   * Send a message
   */
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    const response = await apiClient.axiosInstance.post<
      ApiResponse<{ message: Message } | Message>
    >(this.basePath, data);

    if (response.data.success && response.data.data) {
      // Handle both response formats: { message: {} } or {}
      const data = response.data.data;
      return "message" in data ? data.message : data;
    }

    throw new Error(response.data.message || "Failed to send message");
  }

  /**
   * Get messages in a chat (paginated)
   */
  async getChatMessages(
    chatId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Message>> {
    const response = await apiClient.axiosInstance.get<
      ApiResponse<PaginatedResponse<Message>>
    >(`${this.basePath}/chat/${chatId}`, {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 50,
      },
    });

    if (response.data.success && response.data.data) {
      // Handle both 'messages' and 'items' response formats
      const data = response.data.data;
      return {
        items: data.messages || data.items || [],
        pagination: data.pagination,
      };
    }

    throw new Error(response.data.message || "Failed to get messages");
  }

  /**
   * Get message by ID
   */
  async getMessageById(messageId: string): Promise<Message> {
    const response = await apiClient.axiosInstance.get<
      ApiResponse<{ message: Message }>
    >(`${this.basePath}/${messageId}`);

    if (response.data.success && response.data.data) {
      return response.data.data.message;
    }

    throw new Error(response.data.message || "Failed to get message");
  }

  /**
   * Update message (sender only)
   */
  async updateMessage(
    messageId: string,
    content: string
  ): Promise<Message> {
    const response = await apiClient.axiosInstance.put<
      ApiResponse<{ message: Message }>
    >(`${this.basePath}/${messageId}`, { content });

    if (response.data.success && response.data.data) {
      return response.data.data.message;
    }

    throw new Error(response.data.message || "Failed to update message");
  }

  /**
   * Delete message (sender or admin)
   */
  async deleteMessage(messageId: string): Promise<void> {
    const response = await apiClient.axiosInstance.delete<
      ApiResponse<void>
    >(`${this.basePath}/${messageId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete message");
    }
  }

  /**
   * Mark all messages in chat as read
   */
  async markAsRead(chatId: string, messageIds?: string[]): Promise<void> {
    const response = await apiClient.axiosInstance.post<
      ApiResponse<void>
    >(`${this.basePath}/${chatId}/read`, { messageIds });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to mark as read");
    }
  }

  /**
   * Search messages in a chat
   */
  async searchMessages(chatId: string, query: string): Promise<Message[]> {
    const response = await apiClient.axiosInstance.get<
      ApiResponse<{ messages: Message[] }>
    >(`${this.basePath}/search/${chatId}`, {
      params: { q: query },
    });

    if (response.data.success && response.data.data) {
      return response.data.data.messages;
    }

    throw new Error(response.data.message || "Search failed");
  }

  /**
   * Add reaction to message
   */
  async addReaction(
    messageId: string,
    data: AddReactionRequest
  ): Promise<Message> {
    const response = await apiClient.axiosInstance.post<
      ApiResponse<{ message: Message }>
    >(`${this.basePath}/${messageId}/reactions`, data);

    if (response.data.success && response.data.data) {
      return response.data.data.message;
    }

    throw new Error(response.data.message || "Failed to add reaction");
  }

  /**
   * Remove reaction from message
   */
  async removeReaction(messageId: string): Promise<Message> {
    const response = await apiClient.axiosInstance.delete<
      ApiResponse<{ message: Message }>
    >(`${this.basePath}/${messageId}/reactions`);

    if (response.data.success && response.data.data) {
      return response.data.data.message;
    }

    throw new Error(response.data.message || "Failed to remove reaction");
  }
}

export const messagesAPI = new MessagesAPI();

