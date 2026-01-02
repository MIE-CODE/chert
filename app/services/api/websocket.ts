/**
 * WebSocket Service
 * Handles Socket.IO connection and real-time events
 */

import { io, Socket } from "socket.io-client";
import { Message } from "@/app/store/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface SocketEvents {
  // Client → Server
  join_chat: (data: { chatId: string }) => void;
  leave_chat: (data: { chatId: string }) => void;
  send_message: (data: {
    chatId: string;
    content?: string;
    type?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    replyTo?: string;
  }) => void;
  typing: (data: { chatId: string }) => void;
  stop_typing: (data: { chatId: string }) => void;
  read_message: (data: { chatId: string; messageIds?: string[] }) => void;
  presence_update: (data: { status: string }) => void;

  // Server → Client
  connect: () => void;
  disconnect: () => void;
  joined_chat: (data: { chatId: string }) => void;
  left_chat: (data: { chatId: string }) => void;
  new_message: (data: { message: Message }) => void;
  message_sent: (data: { messageId: string; chatId: string }) => void;
  user_typing: (data: { chatId: string; userId: string; username: string }) => void;
  user_stop_typing: (data: { chatId: string; userId: string; username: string }) => void;
  messages_read: (data: { chatId: string; userId: string; username: string }) => void;
  user_online: (data: { userId: string; username: string; chatId?: string }) => void;
  user_offline: (data: { userId: string; username: string; chatId?: string }) => void;
  user_presence: (data: {
    userId: string;
    username: string;
    status: string;
    chatId?: string;
  }) => void;
  error: (data: { message: string }) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  /**
   * Connect to WebSocket server
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log("WebSocket connected");
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
      console.log("WebSocket disconnected");
    });

    this.socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Join a chat room
   */
  joinChat(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("join_chat", { chatId });
    }
  }

  /**
   * Leave a chat room
   */
  leaveChat(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("leave_chat", { chatId });
    }
  }

  /**
   * Send a message via WebSocket
   */
  sendMessage(data: {
    chatId: string;
    content?: string;
    type?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    replyTo?: string;
  }): void {
    if (this.socket?.connected) {
      this.socket.emit("send_message", data);
    }
  }

  /**
   * Indicate user is typing
   */
  startTyping(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("typing", { chatId });
    }
  }

  /**
   * Stop typing indicator
   */
  stopTyping(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("stop_typing", { chatId });
    }
  }

  /**
   * Mark messages as read
   */
  markAsRead(chatId: string, messageIds?: string[]): void {
    if (this.socket?.connected) {
      this.socket.emit("read_message", { chatId, messageIds });
    }
  }

  /**
   * Update presence status
   */
  updatePresence(status: string): void {
    if (this.socket?.connected) {
      this.socket.emit("presence_update", { status });
    }
  }

  /**
   * Subscribe to an event
   */
  on<K extends keyof SocketEvents>(
    event: K,
    callback: SocketEvents[K]
  ): void {
    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof SocketEvents>(
    event: K,
    callback?: SocketEvents[K]
  ): void {
    if (this.socket) {
      this.socket.off(event, callback as any);
    }
  }

  /**
   * Get connection status
   */
  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Get socket instance
   */
  get socketInstance(): Socket | null {
    return this.socket;
  }
}

export const websocketService = new WebSocketService();

