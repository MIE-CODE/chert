/**
 * WebSocket Service
 * Handles Socket.IO connection and real-time events
 */

import { io, Socket } from "socket.io-client";
import { Message } from "@/app/store/types";

// Socket.IO automatically handles protocol conversion (HTTP/HTTPS to WS/WSS)
// So we can use the API URL directly
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
console.log("🔌 WebSocket URL:", SOCKET_URL);

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
  disconnect: (reason: string) => void;
  connect_error: (error: { message: string }) => void;
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
  new_chat: (data: { chatId: string; message: Message; sender: { id: string; username: string; avatar?: string } }) => void;
  error: (data: { message: string }) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private errorCallbacks: Array<(error: { message: string; type: string }) => void> = [];

  /**
   * Register an error callback for toast notifications
   */
  onError(callback: (error: { message: string; type: string }) => void): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Unregister an error callback
   */
  offError(callback: (error: { message: string; type: string }) => void): void {
    this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Emit error to all registered callbacks
   */
  private emitError(error: { message: string; type: string }): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        console.error("Error in WebSocket error callback:", err);
      }
    });
  }

  /**
   * Connect to WebSocket server
   * According to backend guide, server automatically joins user to all their chat rooms on connect
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log("✅ WebSocket already connected");
      return;
    }

    // Disconnect existing socket if any
    if (this.socket) {
      console.log("Disconnecting existing socket...");
      this.socket.disconnect();
      this.socket = null;
    }

    console.log("🔌 Connecting to WebSocket server:", SOCKET_URL);
    this.socket = io(SOCKET_URL, {
      auth: {
        token, // Pass token in auth object as per backend guide
      },
      transports: ["websocket", "polling"], // Allow both transports
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity, // Keep trying to reconnect
      timeout: 20000, // 20 second connection timeout
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log("✅ WebSocket connected");
      console.log("Socket ID:", this.socket?.id);
      console.log("Server URL:", SOCKET_URL);
      // Server automatically joins user to all their chat rooms on connect
    });

    this.socket.on("disconnect", (reason: string) => {
      this.isConnected = false;
      console.log("WebSocket disconnected:", reason);
      // Will automatically reconnect if reconnection is enabled
      // Only show toast for unexpected disconnections (not manual disconnects)
      if (reason !== "io client disconnect" && reason !== "io server disconnect") {
        this.emitError({
          message: "Connection lost. Reconnecting...",
          type: "disconnect"
        });
      }
    });

    this.socket.on("connect_error", (error: { message: string }) => {
      console.error("❌ WebSocket connection error:", error.message);
      this.isConnected = false;
      
      // Determine error type and message
      let errorMessage = "Connection failed. Please check your internet connection.";
      let errorType = "connection_error";
      
      if (error.message.includes("timeout")) {
        errorMessage = "Connection timeout. Please check your internet connection.";
        errorType = "timeout";
      } else if (error.message.includes("Authentication") || error.message.includes("token")) {
        errorMessage = "Authentication failed. Please log in again.";
        errorType = "authentication_error";
      } else if (error.message.includes("Network")) {
        errorMessage = "Network error. Please check your connection.";
        errorType = "network_error";
      }
      
      // Emit error to registered callbacks (for toast notifications)
      this.emitError({ message: errorMessage, type: errorType });
    });

    this.socket.on("error", (error: { message: string }) => {
      console.error("WebSocket error:", error);
      this.emitError({
        message: error.message || "WebSocket error occurred",
        type: "websocket_error"
      });
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
      console.log("📤 Sending message via WebSocket:", data);
      this.socket.emit("send_message", data);
    } else {
      console.warn("⚠️ WebSocket not connected, cannot send message:", data);
      // Try to reconnect if we have a token
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (token) {
        console.log("Attempting to reconnect WebSocket...");
        this.connect(token);
        // Wait a bit and try again
        setTimeout(() => {
          if (this.socket?.connected) {
            console.log("Retrying WebSocket send after reconnection");
            this.socket.emit("send_message", data);
          }
        }, 1000);
      }
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

