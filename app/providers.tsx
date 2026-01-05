"use client";

import { useEffect } from "react";
import { StoreProvider } from "./store";
import { AuthProvider } from "./components/auth/auth-provider";
import { ToastProvider, useToast } from "./components/ui/toast";
import { useWebSocket } from "./hooks/use-websocket";

function WebSocketProvider({ children }: { children: React.ReactNode }) {
  useWebSocket();
  return <>{children}</>;
}

function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
  const toast = useToast();

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Prevent default console error logging
      event.preventDefault();
      
      const error = event.reason;
      const errorMessage = error?.message || error?.toString() || "An unexpected error occurred";
      
      // Check if it's a network or timeout error
      const isTimeout = error?.isTimeout || error?.code === 'ECONNABORTED' || errorMessage.includes('timeout');
      const isNetworkError = error?.isNetworkError || error?.code === 'ERR_NETWORK' || 
                            error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED';
      
      // Show toast notification instead of logging to console
      if (isTimeout) {
        toast.warning("Request timeout. Please check your connection and try again.");
      } else if (isNetworkError) {
        toast.warning("Network error. Please check your connection and try again.");
      } else {
        // Only show toast for known error types, don't spam for every unhandled rejection
        // Most errors should be handled by their respective try-catch blocks
        console.warn("Unhandled promise rejection:", error);
      }
    };

    // Handle unhandled errors
    const handleError = (event: ErrorEvent) => {
      // Prevent default console error logging for network errors
      const errorMessage = event.message || event.error?.message || "";
      const isNetworkError = errorMessage.includes("Network error") || 
                            errorMessage.includes("timeout") ||
                            errorMessage.includes("ERR_NETWORK");
      
      if (isNetworkError) {
        event.preventDefault();
        toast.warning("Network error. Please check your connection and try again.");
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleError);
    };
  }, [toast]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <ToastProvider>
        <GlobalErrorHandler>
          <AuthProvider>
            <WebSocketProvider>{children}</WebSocketProvider>
          </AuthProvider>
        </GlobalErrorHandler>
      </ToastProvider>
    </StoreProvider>
  );
}

