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

  // Connect WebSocket when user is authenticated
  useEffect(() => {
    const token = typeof window !== "undefined" 
      ? localStorage.getItem("auth_token") 
      : null;

    if (token && currentUser && !websocketService.connected) {
      console.log("Connecting WebSocket...");
      websocketService.connect(token);
    }

    return () => {
      if (!currentUser) {
        console.log("Disconnecting WebSocket (user logged out)");
        websocketService.disconnect();
      }
    };
  }, [currentUser]);

  // Handle connection events
  useEffect(() => {
    const handleConnect = () => {
      console.log("WebSocket connected");
    };

    const handleDisconnect = () => {
      console.log("WebSocket disconnected");
    };

    const handleError = (error: { message: string }) => {
      console.error("WebSocket error:", error.message);
    };

    websocketService.on("connect", handleConnect);
    websocketService.on("disconnect", handleDisconnect);
    websocketService.on("error", handleError);

    return () => {
      websocketService.off("connect", handleConnect);
      websocketService.off("disconnect", handleDisconnect);
      websocketService.off("error", handleError);
    };
  }, []);

  return {
    connected: websocketService.connected,
    socket: websocketService.socketInstance,
  };
}

