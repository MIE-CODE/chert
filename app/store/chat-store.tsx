"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { Chat, Message } from "./types";

interface ChatStoreContextType {
  // State
  chats: Chat[];
  selectedChatId: string | null;
  messages: Record<string, Message[]>; // chatId -> messages
  searchQuery: string;
  isLoadingChats: boolean;

  // Actions
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  deleteChat: (chatId: string) => void;
  selectChat: (chatId: string | null) => void;
  setSearchQuery: (query: string) => void;
  blockChat: (chatId: string) => void;
  muteChat: (chatId: string, muted: boolean) => void;
  pinChat: (chatId: string, pinned: boolean) => void;
  archiveChat: (chatId: string) => void;

  // Message actions
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  markAsRead: (chatId: string, messageIds: string[]) => void;
  setTyping: (chatId: string, isTyping: boolean) => void;

  // Getters
  getSelectedChat: () => Chat | null;
  getChatMessages: (chatId: string) => Message[];
  getUnreadCount: () => number;
}

const ChatStoreContext = createContext<ChatStoreContextType | undefined>(undefined);

// Mock initial data
const initialChats: Chat[] = [
  {
    id: "1",
    name: "Alice Johnson",
    lastMessage: "Hey! How are you doing?",
    timestamp: "2:30 PM",
    unreadCount: 2,
    isOnline: true,
    isTyping: false,
    isPinned: true,
    type: "individual",
  },
  {
    id: "2",
    name: "Design Team",
    lastMessage: "Sarah: The new mockups look great!",
    timestamp: "1:15 PM",
    unreadCount: 5,
    isOnline: false,
    isTyping: false,
    isPinned: true,
    type: "group",
    memberCount: 8,
    members: [
      { id: "1", name: "Sarah", isAdmin: true },
      { id: "2", name: "John" },
      { id: "3", name: "Emma" },
    ],
  },
  {
    id: "3",
    name: "Bob Smith",
    lastMessage: "Thanks for the help yesterday",
    timestamp: "12:45 PM",
    unreadCount: 0,
    isOnline: true,
    isTyping: true,
    isPinned: false,
    type: "individual",
  },
  {
    id: "4",
    name: "Mom",
    lastMessage: "Don't forget dinner on Sunday",
    timestamp: "Yesterday",
    unreadCount: 0,
    isOnline: false,
    isTyping: false,
    isPinned: false,
    type: "individual",
  },
  {
    id: "5",
    name: "Emma Wilson",
    lastMessage: "See you at the meeting",
    timestamp: "Yesterday",
    unreadCount: 1,
    isOnline: true,
    isTyping: false,
    isPinned: false,
    type: "individual",
  },
  {
    id: "6",
    name: "Family Group",
    lastMessage: "Mom: Don't forget the groceries",
    timestamp: "2 hours ago",
    unreadCount: 3,
    isOnline: false,
    isTyping: false,
    isPinned: false,
    type: "group",
    memberCount: 5,
    members: [
      { id: "1", name: "Mom", isAdmin: true },
      { id: "2", name: "Dad" },
      { id: "3", name: "Sister" },
    ],
  },
  {
    id: "7",
    name: "Project Alpha",
    lastMessage: "John: The deadline is approaching",
    timestamp: "3 hours ago",
    unreadCount: 0,
    isOnline: false,
    isTyping: false,
    isPinned: false,
    type: "group",
    memberCount: 12,
    members: [
      { id: "1", name: "John", isAdmin: true },
      { id: "2", name: "Sarah" },
      { id: "3", name: "Mike" },
    ],
  },
];

// Initial mock messages for chats
const initialMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      text: "Hey! How are you doing?",
      senderId: "other",
      senderName: "Alice Johnson",
      timestamp: new Date(Date.now() - 3600000),
      isRead: true,
      isDelivered: true,
    },
    {
      id: "2",
      text: "I'm doing great! Thanks for asking. How about you?",
      senderId: "me",
      senderName: "Me",
      timestamp: new Date(Date.now() - 3500000),
      isRead: true,
      isDelivered: true,
    },
    {
      id: "3",
      text: "Pretty good! Just working on some projects. Want to grab coffee later?",
      senderId: "other",
      senderName: "Alice Johnson",
      timestamp: new Date(Date.now() - 3400000),
      isRead: true,
      isDelivered: true,
    },
    {
      id: "4",
      text: "That sounds great! What time works for you?",
      senderId: "me",
      senderName: "Me",
      timestamp: new Date(),
      isRead: false,
      isDelivered: true,
    },
  ],
  "2": [
    {
      id: "1",
      text: "Hey everyone! Welcome to the group",
      senderId: "admin",
      senderName: "Sarah",
      timestamp: new Date(Date.now() - 3600000),
      isRead: true,
      isDelivered: true,
    },
    {
      id: "2",
      text: "Thanks for adding me!",
      senderId: "me",
      senderName: "Me",
      timestamp: new Date(Date.now() - 3500000),
      isRead: true,
      isDelivered: true,
    },
    {
      id: "3",
      text: "Excited to be here!",
      senderId: "other1",
      senderName: "John",
      timestamp: new Date(Date.now() - 3400000),
      isRead: true,
      isDelivered: true,
    },
  ],
  "3": [
    {
      id: "1",
      text: "Thanks for the help yesterday",
      senderId: "other",
      senderName: "Bob Smith",
      timestamp: new Date(Date.now() - 7200000),
      isRead: true,
      isDelivered: true,
    },
  ],
  "4": [
    {
      id: "1",
      text: "Don't forget dinner on Sunday",
      senderId: "other",
      senderName: "Mom",
      timestamp: new Date(Date.now() - 86400000),
      isRead: true,
      isDelivered: true,
    },
  ],
  "5": [
    {
      id: "1",
      text: "See you at the meeting",
      senderId: "other",
      senderName: "Emma Wilson",
      timestamp: new Date(Date.now() - 86400000),
      isRead: true,
      isDelivered: true,
    },
  ],
  "6": [
    {
      id: "1",
      text: "Don't forget the groceries",
      senderId: "other",
      senderName: "Mom",
      timestamp: new Date(Date.now() - 7200000),
      isRead: true,
      isDelivered: true,
    },
  ],
  "7": [
    {
      id: "1",
      text: "The deadline is approaching",
      senderId: "other",
      senderName: "John",
      timestamp: new Date(Date.now() - 10800000),
      isRead: true,
      isDelivered: true,
    },
  ],
};

export function ChatStoreProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]); // Start with empty array, load from API
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({}); // Start with empty messages
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingChats, setIsLoadingChats] = useState(true); // Start with loading true

  // Normalize chat data from API to match Chat interface
  const normalizeChat = useCallback((apiChat: any): Chat => {
    // Format timestamp for display
    const formatTimestamp = (date: string | Date | undefined): string => {
      if (!date) return "";
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return "";
      
      const now = new Date();
      const diff = now.getTime() - dateObj.getTime();
      const hours = diff / (1000 * 60 * 60);
      
      if (hours < 24) {
        return dateObj.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
      } else if (hours < 48) {
        return "Yesterday";
      } else {
        return dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    };

    const timestampValue = apiChat.timestamp || apiChat.updatedAt || apiChat.lastMessageAt;
    
    return {
      id: apiChat.id || apiChat._id,
      name: apiChat.name || apiChat.title || "Unknown",
      avatar: apiChat.avatar || apiChat.image,
      lastMessage: apiChat.lastMessage || apiChat.lastMessageText || apiChat.lastMessageContent || "",
      timestamp: formatTimestamp(timestampValue) || new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      unreadCount: apiChat.unreadCount || apiChat.unread || 0,
      isOnline: apiChat.isOnline || false,
      isTyping: apiChat.isTyping || false,
      isPinned: apiChat.isPinned || false,
      isMuted: apiChat.isMuted || false,
      isBlocked: apiChat.isBlocked || false,
      isArchived: apiChat.isArchived || false,
      type: apiChat.type || (apiChat.isGroup ? "group" : "individual"),
      members: apiChat.members || apiChat.participants,
      memberCount: apiChat.memberCount || apiChat.members?.length || apiChat.participants?.length,
      createdAt: apiChat.createdAt ? new Date(apiChat.createdAt) : undefined,
      updatedAt: apiChat.updatedAt ? new Date(apiChat.updatedAt) : undefined,
    };
  }, []);

  // Load chats from API on mount (only if authenticated)
  useEffect(() => {
    const loadChats = async () => {
      // Check if user is authenticated before making API call
      const token = typeof window !== "undefined" 
        ? localStorage.getItem("auth_token") 
        : null;
      
      if (!token) {
        // No token, set loading to false and keep empty array
        setIsLoadingChats(false);
        return;
      }

      try {
        setIsLoadingChats(true);
        const { chatsAPI } = await import("@/app/services/api");
        const apiChats = await chatsAPI.getChats();
        
        // Normalize and set chats from API
        if (apiChats && Array.isArray(apiChats)) {
          const normalizedChats = apiChats.map(normalizeChat);
          setChats(normalizedChats);
        } else {
          // If API returns empty array or null, set empty array
          setChats([]);
        }
      } catch (error) {
        // On error, set empty array (don't use mock data)
        // Toast will be shown by the component that uses this store if needed
        setChats([]);
      } finally {
        setIsLoadingChats(false);
      }
    };

    loadChats();
  }, [normalizeChat]);

  // Chat actions
  const addChat = useCallback((chat: Chat) => {
    setChats((prev) => [...prev, chat]);
  }, []);

  const updateChat = useCallback((chatId: string, updates: Partial<Chat>) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, ...updates } : chat))
    );
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (selectedChatId === chatId) {
      setSelectedChatId(null);
    }
    setMessages((prev) => {
      const newMessages = { ...prev };
      delete newMessages[chatId];
      return newMessages;
    });
  }, [selectedChatId]);

  const selectChat = useCallback(async (chatId: string | null) => {
    setSelectedChatId(chatId);
    if (chatId) {
      // Mark messages as read when selecting a chat
      setMessages((prev) => {
        const chatMessages = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: chatMessages.map((msg) => ({ ...msg, isRead: true })),
        };
      });
      // Reset unread count
      updateChat(chatId, { unreadCount: 0 });
      
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
          // Toast can be shown by the component if needed
        }
      }
    }
  }, [updateChat]);

  // Message actions
  const addMessage = useCallback((chatId: string, message: Message) => {
    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), message],
    }));
    // Update chat's last message
    updateChat(chatId, {
      lastMessage: message.text,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    });
  }, [updateChat]);

  const updateMessage = useCallback(
    (chatId: string, messageId: string, updates: Partial<Message>) => {
      setMessages((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      }));
    },
    []
  );

  const deleteMessage = useCallback((chatId: string, messageId: string) => {
    setMessages((prev) => ({
      ...prev,
      [chatId]: (prev[chatId] || []).filter((msg) => msg.id !== messageId),
    }));
  }, []);

  const markAsRead = useCallback((chatId: string, messageIds: string[]) => {
    setMessages((prev) => ({
      ...prev,
      [chatId]: (prev[chatId] || []).map((msg) =>
        messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
      ),
    }));
  }, []);

  const setTyping = useCallback((chatId: string, isTyping: boolean) => {
    updateChat(chatId, { isTyping });
  }, [updateChat]);

  // Chat management actions
  const blockChat = useCallback((chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    updateChat(chatId, { isBlocked: !chat?.isBlocked });
  }, [updateChat, chats]);

  const muteChat = useCallback((chatId: string, muted: boolean) => {
    updateChat(chatId, { isMuted: muted });
  }, [updateChat]);

  const pinChat = useCallback((chatId: string, pinned: boolean) => {
    updateChat(chatId, { isPinned: pinned });
  }, [updateChat]);

  const archiveChat = useCallback((chatId: string) => {
    updateChat(chatId, { isArchived: true });
  }, [updateChat]);

  // Getters
  const getSelectedChat = useCallback(() => {
    return chats.find((chat) => chat.id === selectedChatId) || null;
  }, [chats, selectedChatId]);

  const getChatMessages = useCallback(
    (chatId: string) => {
      return messages[chatId] || [];
    },
    [messages]
  );

  const getUnreadCount = useCallback(() => {
    return chats.reduce((total, chat) => total + chat.unreadCount, 0);
  }, [chats]);

  const value = useMemo(
    () => ({
      chats,
      selectedChatId,
      messages,
      searchQuery,
      isLoadingChats,
      setChats,
      addChat,
      updateChat,
      deleteChat,
      selectChat,
      setSearchQuery,
      addMessage,
      updateMessage,
      deleteMessage,
      markAsRead,
      setTyping,
      blockChat,
      muteChat,
      pinChat,
      archiveChat,
      getSelectedChat,
      getChatMessages,
      getUnreadCount,
    }),
    [
      chats,
      selectedChatId,
      messages,
      searchQuery,
      isLoadingChats,
      addChat,
      updateChat,
      deleteChat,
      selectChat,
      addMessage,
      updateMessage,
      deleteMessage,
      markAsRead,
      setTyping,
      blockChat,
      muteChat,
      pinChat,
      archiveChat,
      getSelectedChat,
      getChatMessages,
      getUnreadCount,
    ]
  );

  return (
    <ChatStoreContext.Provider value={value}>{children}</ChatStoreContext.Provider>
  );
}

export function useChatStore() {
  const context = useContext(ChatStoreContext);
  if (context === undefined) {
    throw new Error("useChatStore must be used within a ChatStoreProvider");
  }
  return context;
}

