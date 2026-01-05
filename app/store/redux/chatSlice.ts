import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Chat, Message } from "../types";
import { chatsAPI } from "@/app/services/api";
import { RootState } from "./store";

interface ChatState {
  chats: Chat[];
  selectedChatId: string | null;
  messages: Record<string, Message[]>; // chatId -> messages
  searchQuery: string;
  isLoadingChats: boolean;
  isLoadingMoreChats: boolean;
  hasMoreChats: boolean;
  currentPage: number;
}

const initialState: ChatState = {
  chats: [],
  selectedChatId: null,
  messages: {},
  searchQuery: "",
  isLoadingChats: false,
  isLoadingMoreChats: false,
  hasMoreChats: true,
  currentPage: 1,
};

// Normalize chat data from API to match Chat interface
export const normalizeChat = (apiChat: any, currentUserId: string | null = null): Chat => {

  // Format timestamp for display
  const formatTimestamp = (date: string | Date | undefined): string => {
    if (!date) return "";
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return "";
      const now = new Date();
      const diff = now.getTime() - dateObj.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  // Extract last message text from various formats
  const getLastMessageText = (lastMessage: any): string => {
    if (!lastMessage) return "";
    if (typeof lastMessage === "string") return lastMessage;
    if (typeof lastMessage === "object") {
      return lastMessage.text || lastMessage.content || "";
    }
    return "";
  };

  const timestampValue = apiChat.timestamp || apiChat.updatedAt || apiChat.lastMessageAt;
  const lastMessageValue = apiChat.lastMessage || apiChat.lastMessageText || apiChat.lastMessageContent;

  // Normalize participants/members
  const participants = apiChat.participants || apiChat.members || [];
  
  const normalizedParticipants = Array.isArray(participants)
    ? participants.map((p: any) => ({
        id: p.id || p._id || "",
        name: p.name || p.username || "Unknown",
        username: p.username,
        email: p.email,
        phone: p.phone || p.phoneNumber,
        avatar: p.avatar || p.image || "",
        status: p.status,
        isOnline: p.isOnline || false,
      }))
    : [];

  // Derive chat name from participants (exclude current user)
  const getChatName = (): string => {
    if (apiChat.name || apiChat.title) {
      return apiChat.name || apiChat.title;
    }
    
    // For individual chats, get the other participant's name
    if (!apiChat.isGroup && normalizedParticipants.length > 0) {
      const otherParticipants = currentUserId
        ? normalizedParticipants.filter((p) => p.id !== currentUserId)
        : normalizedParticipants;
      
      if (otherParticipants.length > 0) {
        return otherParticipants[0].name || otherParticipants[0].username || "Unknown";
      }
      
      // If we couldn't filter, just use the first participant
      return normalizedParticipants[0].name || normalizedParticipants[0].username || "Unknown";
    }
    
    // For group chats, use a default name or participant count
    if (apiChat.isGroup) {
      return `Group (${normalizedParticipants.length})`;
    }
    
    return "Unknown";
  };

  // Get chat avatar (use other participant's avatar for individual chats)
  const getChatAvatar = (): string | undefined => {
    if (apiChat.avatar) return apiChat.avatar;
    
    if (!apiChat.isGroup && normalizedParticipants.length > 0) {
      const otherParticipants = currentUserId
        ? normalizedParticipants.filter((p) => p.id !== currentUserId)
        : normalizedParticipants;
      
      if (otherParticipants.length > 0 && otherParticipants[0].avatar) {
        return otherParticipants[0].avatar;
      }
    }
    
    return undefined;
  };

  return {
    id: apiChat.id || apiChat._id,
    name: getChatName(),
    avatar: getChatAvatar(),
    lastMessage: getLastMessageText(lastMessageValue),
    timestamp: formatTimestamp(timestampValue) || formatTimestamp(apiChat.updatedAt) || new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    unreadCount: apiChat.unreadCount || apiChat.unread || 0,
    isOnline: normalizedParticipants.some((p) => p.isOnline && p.id !== currentUserId) || false,
    isTyping: apiChat.isTyping || false,
    isPinned: apiChat.isPinned || false,
    isMuted: apiChat.isMuted || false,
    isBlocked: apiChat.isBlocked || false,
    isArchived: apiChat.isArchived || false,
    type: apiChat.isGroup ? "group" : "individual",
    participants: normalizedParticipants,
    members: normalizedParticipants.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      isAdmin: false,
      isOnline: p.isOnline,
    })),
    memberCount: apiChat.memberCount || normalizedParticipants.length,
    // Store dates as ISO strings for Redux serialization
    createdAt: apiChat.createdAt 
      ? (typeof apiChat.createdAt === "string" 
          ? apiChat.createdAt 
          : new Date(apiChat.createdAt).toISOString())
      : undefined,
    updatedAt: apiChat.updatedAt 
      ? (typeof apiChat.updatedAt === "string" 
          ? apiChat.updatedAt 
          : new Date(apiChat.updatedAt).toISOString())
      : undefined,
  };
};

// Async thunk to load chats (initial load)
export const loadChats = createAsyncThunk(
  "chat/loadChats",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (!token) {
        return { chats: [], hasMore: false };
      }

      const response = await chatsAPI.getChats({ page: 1, limit: 20 });
      const safeApiChats = Array.isArray(response.chats) ? response.chats : [];
      
      console.log("Raw API chats:", safeApiChats);
      console.log("Number of chats from API:", safeApiChats.length);
      console.log("Has more chats:", response.hasMore);
      
      // Get current user ID from Redux state for name derivation
      const state = getState() as RootState;
      const currentUserId = state.user.currentUser?.id || null;
      
      console.log("Current user ID for normalization:", currentUserId);
      
      const normalizedChats = safeApiChats
        .map((chat, index) => {
          try {
            const normalized = normalizeChat(chat, currentUserId);
            // Validate that the normalized chat has required fields
            if (!normalized || !normalized.id) {
              console.warn(`Chat ${index} normalized but missing required fields:`, normalized, "from:", chat);
              return null;
            }
            console.log(`Chat ${index} normalized successfully:`, normalized.name, normalized.id);
            return normalized;
          } catch (error) {
            console.error(`Error normalizing chat ${index}:`, error, chat);
            return null;
          }
        })
        .filter((chat): chat is Chat => chat !== null);

      console.log(`Loaded ${normalizedChats.length} chats from ${safeApiChats.length} API chats`);
      console.log("Normalized chats:", normalizedChats);
      return { chats: normalizedChats, hasMore: response.hasMore };
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to load chats");
    }
  }
);

// Async thunk to load more chats (pagination)
export const loadMoreChats = createAsyncThunk(
  "chat/loadMoreChats",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (!token) {
        return { chats: [], hasMore: false };
      }

      const state = getState() as RootState;
      const currentPage = state.chat.currentPage;
      const nextPage = currentPage + 1;

      const response = await chatsAPI.getChats({ page: nextPage, limit: 20 });
      const safeApiChats = Array.isArray(response.chats) ? response.chats : [];
      
      // Get current user ID from Redux state for name derivation
      const currentUserId = state.user.currentUser?.id || null;
      
      const normalizedChats = safeApiChats
        .map((chat) => {
          try {
            const normalized = normalizeChat(chat, currentUserId);
            if (!normalized || !normalized.id) {
              return null;
            }
            return normalized;
          } catch (error) {
            console.error("Error normalizing chat:", error, chat);
            return null;
          }
        })
        .filter((chat): chat is Chat => chat !== null);

      return { chats: normalizedChats, hasMore: response.hasMore, page: nextPage };
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to load more chats");
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    addChat: (state, action: PayloadAction<Chat>) => {
      // Check if chat already exists before adding
      const exists = state.chats.some((chat) => chat.id === action.payload.id);
      if (!exists) {
        state.chats.push(action.payload);
      } else {
        // Update existing chat instead
        const index = state.chats.findIndex((chat) => chat.id === action.payload.id);
        if (index !== -1) {
          state.chats[index] = action.payload;
        }
      }
    },
    updateChat: (state, action: PayloadAction<{ chatId: string; updates: Partial<Chat> }>) => {
      const index = state.chats.findIndex((chat) => chat.id === action.payload.chatId);
      if (index !== -1) {
        state.chats[index] = { ...state.chats[index], ...action.payload.updates };
      }
    },
    deleteChat: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.filter((chat) => chat.id !== action.payload);
      if (state.selectedChatId === action.payload) {
        state.selectedChatId = null;
      }
      delete state.messages[action.payload];
    },
    selectChat: (state, action: PayloadAction<string | null>) => {
      state.selectedChatId = action.payload;
      if (action.payload) {
        // Mark messages as read when selecting a chat
        const messages = state.messages[action.payload];
        if (messages) {
          messages.forEach((msg) => {
            msg.isRead = true;
          });
        }
        // Reset unread count
        const chat = state.chats.find((c) => c.id === action.payload);
        if (chat) {
          chat.unreadCount = 0;
        }
      }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    blockChat: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find((c) => c.id === action.payload);
      if (chat) {
        chat.isBlocked = !chat.isBlocked;
      }
    },
    muteChat: (state, action: PayloadAction<{ chatId: string; muted: boolean }>) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId);
      if (chat) {
        chat.isMuted = action.payload.muted;
      }
    },
    pinChat: (state, action: PayloadAction<{ chatId: string; pinned: boolean }>) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId);
      if (chat) {
        chat.isPinned = action.payload.pinned;
      }
    },
    archiveChat: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find((c) => c.id === action.payload);
      if (chat) {
        chat.isArchived = !chat.isArchived;
      }
    },
    addMessage: (state, action: PayloadAction<{ chatId: string; message: Message; isCurrentUser?: boolean }>) => {
      const { chatId, message, isCurrentUser = false } = action.payload;
      
      // Ensure timestamp is a valid ISO string for Redux serialization
      const normalizedMessage: Message = {
        ...message,
        timestamp: typeof message.timestamp === "string" 
          ? message.timestamp 
          : (message.timestamp instanceof Date 
              ? message.timestamp.toISOString() 
              : new Date().toISOString()),
      };
      
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId].push(normalizedMessage);
      
      // Update chat's last message and unread count
      const chat = state.chats.find((c) => c.id === chatId);
      if (chat) {
        chat.lastMessage = normalizedMessage.text || normalizedMessage.content || "";
        chat.timestamp = new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
        
        // Increment unread count if this chat is not currently selected
        // Only count messages from other users (not the current user)
        if (chatId !== state.selectedChatId && !isCurrentUser) {
          chat.unreadCount = (chat.unreadCount || 0) + 1;
        } else {
          // If chat is selected or it's the current user's message, mark as read
          normalizedMessage.isRead = true;
        }
      } else {
        // Chat doesn't exist in list yet - this shouldn't happen, but handle gracefully
        console.warn(`Chat ${chatId} not found in chat list when adding message`);
      }
    },
    updateMessage: (state, action: PayloadAction<{ chatId: string; messageId: string; updates: Partial<Message> }>) => {
      const { chatId, messageId, updates } = action.payload;
      const messages = state.messages[chatId];
      if (messages) {
        const index = messages.findIndex((msg) => msg.id === messageId);
        if (index !== -1) {
          // Ensure timestamp is serializable if it's being updated
          const normalizedUpdates = { ...updates };
          if (normalizedUpdates.timestamp !== undefined) {
            normalizedUpdates.timestamp = typeof normalizedUpdates.timestamp === "string" 
              ? normalizedUpdates.timestamp 
              : (normalizedUpdates.timestamp instanceof Date 
                  ? normalizedUpdates.timestamp.toISOString() 
                  : new Date().toISOString());
          }
          messages[index] = { ...messages[index], ...normalizedUpdates };
        }
      }
    },
    deleteMessage: (state, action: PayloadAction<{ chatId: string; messageId: string }>) => {
      const { chatId, messageId } = action.payload;
      const messages = state.messages[chatId];
      if (messages) {
        state.messages[chatId] = messages.filter((msg) => msg.id !== messageId);
      }
    },
    markAsRead: (state, action: PayloadAction<{ chatId: string; messageIds: string[] }>) => {
      const { chatId, messageIds } = action.payload;
      const messages = state.messages[chatId];
      if (messages) {
        messages.forEach((msg) => {
          if (messageIds.length === 0 || messageIds.includes(msg.id)) {
            // If messageIds is empty, mark all messages as read
            msg.isRead = true;
          }
        });
        
        // Also reset unread count for this chat
        const chat = state.chats.find((c) => c.id === chatId);
        if (chat) {
          chat.unreadCount = 0;
        }
      }
    },
    setTyping: (state, action: PayloadAction<{ chatId: string; isTyping: boolean }>) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId);
      if (chat) {
        chat.isTyping = action.payload.isTyping;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadChats.pending, (state) => {
        state.isLoadingChats = true;
      })
            .addCase(loadChats.fulfilled, (state, action) => {
              state.isLoadingChats = false;
              if (action.payload && typeof action.payload === "object" && "chats" in action.payload) {
                // Remove duplicates by ID
                const newChats = action.payload.chats;
                const uniqueChats = newChats.reduce((acc: Chat[], chat: Chat) => {
                  if (!acc.find((c) => c.id === chat.id)) {
                    acc.push(chat);
                  }
                  return acc;
                }, []);
                state.chats = uniqueChats;
                state.hasMoreChats = action.payload.hasMore;
                state.currentPage = 1;
              } else {
                // Backward compatibility
                const payload = Array.isArray(action.payload) ? action.payload : [];
                // Remove duplicates
                const uniqueChats = payload.reduce((acc: Chat[], chat: Chat) => {
                  if (!acc.find((c) => c.id === chat.id)) {
                    acc.push(chat);
                  }
                  return acc;
                }, []);
                state.chats = uniqueChats;
              }
            })
      .addCase(loadChats.rejected, (state) => {
        state.isLoadingChats = false;
        // Don't clear existing chats on error - keep what we have
      })
      .addCase(loadMoreChats.pending, (state) => {
        state.isLoadingMoreChats = true;
      })
            .addCase(loadMoreChats.fulfilled, (state, action) => {
              state.isLoadingMoreChats = false;
              if (action.payload && typeof action.payload === "object" && "chats" in action.payload) {
                // Append new chats to existing ones (avoid duplicates)
                const newChats = action.payload.chats.filter(
                  (newChat) => !state.chats.some((existingChat) => existingChat.id === newChat.id)
                );
                // Combine and remove any duplicates that might have been introduced
                const combinedChats = [...state.chats, ...newChats];
                const uniqueChats = combinedChats.reduce((acc: Chat[], chat: Chat) => {
                  if (!acc.find((c) => c.id === chat.id)) {
                    acc.push(chat);
                  }
                  return acc;
                }, []);
                state.chats = uniqueChats;
                state.hasMoreChats = action.payload.hasMore;
                if (action.payload.page) {
                  state.currentPage = action.payload.page;
                }
              }
            })
      .addCase(loadMoreChats.rejected, (state) => {
        state.isLoadingMoreChats = false;
      });
  },
});

export const {
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
} = chatSlice.actions;

// Selectors
export const selectChats = (state: { chat: ChatState }) => state.chat.chats;
export const selectSelectedChatId = (state: { chat: ChatState }) => state.chat.selectedChatId;
export const selectMessages = (state: { chat: ChatState }) => state.chat.messages;
export const selectSearchQuery = (state: { chat: ChatState }) => state.chat.searchQuery;
export const selectIsLoadingChats = (state: { chat: ChatState }) => state.chat.isLoadingChats;
export const selectIsLoadingMoreChats = (state: { chat: ChatState }) => state.chat.isLoadingMoreChats;
export const selectHasMoreChats = (state: { chat: ChatState }) => state.chat.hasMoreChats;
export const selectCurrentPage = (state: { chat: ChatState }) => state.chat.currentPage;

export const selectSelectedChat = (state: { chat: ChatState }): Chat | null => {
  const selectedId = state.chat.selectedChatId;
  if (!selectedId) return null;
  return state.chat.chats.find((chat) => chat.id === selectedId) || null;
};

export const selectChatMessages = (chatId: string) => (state: { chat: ChatState }): Message[] => {
  return state.chat.messages[chatId] || [];
};

export const selectUnreadCount = (state: { chat: ChatState }): number => {
  return state.chat.chats.reduce((total, chat) => total + chat.unreadCount, 0);
};

export default chatSlice.reducer;

