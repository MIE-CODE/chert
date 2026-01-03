"use client";

import { StoreProvider } from "./store";
import { AuthProvider } from "./components/auth/auth-provider";
import { ToastProvider } from "./components/ui/toast";
import { useWebSocket } from "./hooks/use-websocket";

function WebSocketProvider({ children }: { children: React.ReactNode }) {
  useWebSocket();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <ToastProvider>
        <AuthProvider>
          <WebSocketProvider>{children}</WebSocketProvider>
        </AuthProvider>
      </ToastProvider>
    </StoreProvider>
  );
}

