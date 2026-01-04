/**
 * useWebSocket Hook
 * Manages WebSocket connection and real-time events
 */

import { useEffect, useCallback } from "react";
import { websocketService } from "@/app/services/api";
import { useUserStore } from "@/app/store";
import { apiClient } from "@/app/lib/api-client";

export function useWebSocket() {
  const { currentUser } = useUserStore();

  // Connect WebSocket when we have a token (don't wait for currentUser to be loaded)
  useEffect(() => {
    const token = typeof window !== "undefined" 
      ? localStorage.getItem("auth_token") 
      : null;

    // Connect if we have a token and aren't already connected
    if (token && !websocketService.connected) {
      console.log("Connecting WebSocket with token...");
      websocketService.connect(token);
    }

    return () => {
      // Only disconnect if user explicitly logs out (currentUser becomes null)
      if (!currentUser && token) {
        console.log("Disconnecting WebSocket (user logged out)");
        websocketService.disconnect();
      }
    };
  }, [currentUser]);

  // Handle connection events and global message listener for testing
  useEffect(() => {
    const handleConnect = () => {
      console.log("✅ WebSocket connected - User automatically joined to all chat rooms");
      console.log("📡 Listening for 'new_message' events...");
    };

    const handleDisconnect = (reason: string) => {
      console.log("WebSocket disconnected:", reason);
    };

    const handleConnectError = (error: { message: string }) => {
      console.error("❌ WebSocket connection error:", error.message);
      // Handle authentication errors
      if (error.message.includes("Authentication")) {
        // Token expired or invalid - could redirect to login or refresh token
        console.warn("Authentication error - token may be expired or invalid");
      }
    };

    const handleError = (error: { message: string }) => {
      console.error("WebSocket error:", error.message);
    };

    // Global listener for new_message events to update unread counts
    const handleNewMessage = (data: { message: any }) => {
      console.log("📨 [GLOBAL] New message received via WebSocket:", data.message);
      console.log("📨 [GLOBAL] Message details:", {
        id: data.message?.id || data.message?._id,
        chatId: data.message?.chatId || data.message?.chat?._id || data.message?.chat?.id,
        senderId: data.message?.senderId || data.message?.sender?._id || data.message?.sender?.id,
        content: data.message?.content || data.message?.text,
      });
      
      // Update unread count for chats that are not currently open
      // This is handled by the addMessage reducer in chatSlice, which checks selectedChatId
      // The useMessages hook will handle adding the message to the current chat if it's open
    };

    websocketService.on("connect", handleConnect);
    websocketService.on("disconnect", handleDisconnect);
    websocketService.on("connect_error", handleConnectError);
    websocketService.on("error", handleError);
    websocketService.on("new_message", handleNewMessage);

    return () => {
      websocketService.off("connect", handleConnect);
      websocketService.off("disconnect", handleDisconnect);
      websocketService.off("connect_error", handleConnectError);
      websocketService.off("error", handleError);
      websocketService.off("new_message", handleNewMessage);
    };
  }, []);

  return {
    connected: websocketService.connected,
    socket: websocketService.socketInstance,
  };
}

