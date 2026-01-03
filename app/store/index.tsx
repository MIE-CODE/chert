"use client";

import React, { useCallback } from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import {
  selectChats,
  selectSelectedChatId,
  selectMessages,
  selectSearchQuery,
  selectIsLoadingChats,
  selectSelectedChat,
  selectChatMessages,
  selectUnreadCount,
} from "./redux/chatSlice";
import {
  selectCurrentUser,
  selectContacts,
  selectIsAuthenticated,
  selectContact,
  selectSearchContacts,
} from "./redux/userSlice";
import { selectUIState } from "./redux/uiSlice";
import {
  setChats,
  addChat,
  updateChat,
  deleteChat,
  selectChat,
  setSearchQuery,
  blockChat,
  muteChat,
  pinChat,
  archiveChat,
  addMessage,
  updateMessage,
  deleteMessage,
  markAsRead,
  setTyping,
  loadChats,
} from "./redux/chatSlice";
import {
  setCurrentUser,
  updateCurrentUser,
  setContacts,
  addContact,
  updateContact,
  deleteContact,
  login,
  logout,
} from "./redux/userSlice";
import {
  setShowNewGroup,
  setShowNewChat,
  setShowSettings,
  setShowContacts,
  setShowProfile,
  setSidebarOpen,
  setTheme,
  toggleSidebar,
  closeAllModals,
} from "./redux/uiSlice";

/**
 * Redux store provider
 * This should be placed at the root of your application
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

// Re-export hooks for convenience
export {
  useAppDispatch,
  useAppSelector,
} from "./redux/hooks";

// Re-export all actions
export {
  // Chat actions
  setChats,
  addChat,
  updateChat,
  deleteChat,
  selectChat,
  setSearchQuery,
  blockChat,
  muteChat,
  pinChat,
  archiveChat,
  addMessage,
  updateMessage,
  deleteMessage,
  markAsRead,
  setTyping,
  loadChats,
  // Chat selectors
  selectChats,
  selectSelectedChatId,
  selectMessages,
  selectSearchQuery,
  selectIsLoadingChats,
  selectSelectedChat,
  selectChatMessages,
  selectUnreadCount,
} from "./redux/chatSlice";

export {
  // User actions
  setCurrentUser,
  updateCurrentUser,
  setContacts,
  addContact,
  updateContact,
  deleteContact,
  login,
  logout,
  // User selectors
  selectCurrentUser,
  selectContacts,
  selectIsAuthenticated,
  selectContact,
  selectSearchContacts,
} from "./redux/userSlice";

export {
  // UI actions
  setShowNewGroup,
  setShowNewChat,
  setShowSettings,
  setShowContacts,
  setShowProfile,
  setSidebarOpen,
  setTheme,
  toggleSidebar,
  closeAllModals,
  // UI selectors
  selectUIState,
} from "./redux/uiSlice";

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

// Legacy hook exports for backward compatibility during migration
export function useChatStore() {
  const dispatch = useAppDispatch();
  const chats = useAppSelector(selectChats);
  const selectedChatId = useAppSelector(selectSelectedChatId);
  const messages = useAppSelector(selectMessages);
  const searchQuery = useAppSelector(selectSearchQuery);
  const isLoadingChats = useAppSelector(selectIsLoadingChats);
  const selectedChat = useAppSelector(selectSelectedChat);
  const unreadCount = useAppSelector(selectUnreadCount);
  
  const getChatMessages = useCallback((chatId: string) => {
    return messages[chatId] || [];
  }, [messages]);
  
  const getUnreadCount = useCallback(() => {
    return unreadCount;
  }, [unreadCount]);
  
  const getSelectedChat = useCallback(() => {
    return selectedChat;
  }, [selectedChat]);
  
  const handleSelectChat = useCallback(async (chatId: string | null) => {
    dispatch(selectChat(chatId));
    if (chatId) {
      // Mark as read via API (only if authenticated)
      const token = typeof window !== "undefined" 
        ? localStorage.getItem("auth_token") 
        : null;
      if (token) {
        try {
          const { messagesAPI } = await import("@/app/services/api");
          await messagesAPI.markAsRead(chatId);
        } catch (error) {
          // Silently fail - this is a non-critical operation
        }
      }
    }
  }, [dispatch]);

  return {
    chats,
    selectedChatId,
    messages,
    searchQuery,
    isLoadingChats,
    setChats: (chats: any) => dispatch(setChats(chats)),
    addChat: (chat: any) => dispatch(addChat(chat)),
    updateChat: (chatId: string, updates: any) => dispatch(updateChat({ chatId, updates })),
    deleteChat: (chatId: string) => dispatch(deleteChat(chatId)),
    selectChat: handleSelectChat,
    setSearchQuery: (query: string) => dispatch(setSearchQuery(query)),
    blockChat: (chatId: string) => dispatch(blockChat(chatId)),
    muteChat: (chatId: string, muted: boolean) => dispatch(muteChat({ chatId, muted })),
    pinChat: (chatId: string, pinned: boolean) => dispatch(pinChat({ chatId, pinned })),
    archiveChat: (chatId: string) => dispatch(archiveChat(chatId)),
    addMessage: (chatId: string, message: any) => dispatch(addMessage({ chatId, message })),
    updateMessage: (chatId: string, messageId: string, updates: any) =>
      dispatch(updateMessage({ chatId, messageId, updates })),
    deleteMessage: (chatId: string, messageId: string) =>
      dispatch(deleteMessage({ chatId, messageId })),
    markAsRead: (chatId: string, messageIds: string[]) =>
      dispatch(markAsRead({ chatId, messageIds })),
    setTyping: (chatId: string, isTyping: boolean) => dispatch(setTyping({ chatId, isTyping })),
    getSelectedChat,
    getChatMessages,
    getUnreadCount,
    loadChats: useCallback(() => dispatch(loadChats()), [dispatch]),
  };
}

export function useUserStore() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const contacts = useAppSelector(selectContacts);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const getContact = useCallback((contactId: string) => {
    return contacts.find((contact) => contact.id === contactId) || null;
  }, [contacts]);

  const searchContacts = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(lowerQuery) ||
        contact.email?.toLowerCase().includes(lowerQuery) ||
        contact.phone?.includes(lowerQuery)
    );
  }, [contacts]);

  return {
    currentUser,
    contacts,
    isAuthenticated,
    setCurrentUser: (user: any) => dispatch(setCurrentUser(user)),
    updateCurrentUser: (updates: any) => dispatch(updateCurrentUser(updates)),
    setContacts: (contacts: any) => dispatch(setContacts(contacts)),
    addContact: (contact: any) => dispatch(addContact(contact)),
    updateContact: (contactId: string, updates: any) =>
      dispatch(updateContact({ contactId, updates })),
    deleteContact: (contactId: string) => dispatch(deleteContact(contactId)),
    login: (user: any) => dispatch(login(user)),
    logout: () => dispatch(logout()),
    getContact,
    searchContacts,
  };
}

export function useUIStore() {
  const dispatch = useAppDispatch();
  const uiState = useAppSelector(selectUIState);

  return {
    uiState,
    setShowNewGroup: (show: boolean) => dispatch(setShowNewGroup(show)),
    setShowNewChat: (show: boolean) => dispatch(setShowNewChat(show)),
    setShowSettings: (show: boolean) => dispatch(setShowSettings(show)),
    setShowContacts: (show: boolean) => dispatch(setShowContacts(show)),
    setShowProfile: (show: boolean) => dispatch(setShowProfile(show)),
    setSidebarOpen: (open: boolean) => dispatch(setSidebarOpen(open)),
    setTheme: (theme: "light" | "dark" | "system") => dispatch(setTheme(theme)),
    toggleSidebar: () => dispatch(toggleSidebar()),
    closeAllModals: () => dispatch(closeAllModals()),
  };
}
