// Core types for the application state

export interface User {
  id: string;
  name: string;
  username?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: string;
  isOnline: boolean;
}

export interface ChatMember {
  id: string;
  name: string;
  avatar?: string;
  isAdmin?: boolean;
  isOnline?: boolean;
}

export interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  isTyping: boolean;
  isPinned: boolean;
  isMuted?: boolean;
  isBlocked?: boolean;
  isArchived?: boolean;
  type: "individual" | "group";
  participants: User[];
  members?: ChatMember[];
  memberCount?: number;
  createdAt?: string; // ISO string for Redux serialization
  updatedAt?: string; // ISO string for Redux serialization
}

export interface Message {
  id: string;
  text?: string; // For display
  content?: string; // API uses 'content'
  chatId?: string; // Added for WebSocket messages
  senderId: string;
  senderName: string;
  timestamp: Date | string; // Can be string from API
  isRead: boolean;
  isDelivered: boolean;
  reactions?: Array<{ emoji: string; count: number }>;
  replyTo?: string;
  attachments?: Array<{
    type: "image" | "video" | "file" | "audio";
    url: string;
    name?: string;
    size?: number;
  }>;
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
  isUser: boolean;
  isOnline?: boolean;
}

export interface Group {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  members: ChatMember[];
  createdBy: string;
  createdAt: Date;
  isAdmin: boolean;
}

export interface UIState {
  showNewGroup: boolean;
  showNewChat: boolean;
  showSettings: boolean;
  showContacts: boolean;
  showProfile: boolean;
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
}

