"use client";

import React from "react";
import { ChatStoreProvider } from "./chat-store";
import { UserStoreProvider } from "./user-store";
import { UIStoreProvider } from "./ui-store";

/**
 * Main store provider that wraps all individual store providers
 * This should be placed at the root of your application
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <ChatStoreProvider>
      <UserStoreProvider>
        <UIStoreProvider>{children}</UIStoreProvider>
      </UserStoreProvider>
    </ChatStoreProvider>
  );
}

// Re-export all hooks for convenience
export { useChatStore } from "./chat-store";
export { useUserStore } from "./user-store";
export { useUIStore } from "./ui-store";

// Re-export types
export type {
  User,
  Chat,
  Message,
  Contact,
  Group,
  ChatMember,
  UIState,
} from "./types";

