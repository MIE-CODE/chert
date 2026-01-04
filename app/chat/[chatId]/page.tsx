"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatList } from "@/app/components/chat/chat-list";
import { Conversation } from "@/app/components/chat/conversation";
import { GroupChat } from "@/app/components/groups/group-chat";
import { useChatStore, useUIStore } from "@/app/store";
import { ProtectedRoute } from "@/app/components/auth/protected-route";
import { useAuthContext } from "@/app/components/auth/auth-provider";
import { useUserStore } from "@/app/store";
import { chatsAPI } from "@/app/services/api";
import { normalizeChat } from "@/app/store/redux/chatSlice";
import { useToast } from "@/app/components/ui/toast";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params?.chatId as string;
  const { getSelectedChat, selectChat, loadChats, chats, isLoadingChats, addChat, updateChat } = useChatStore();
  const { uiState, setShowNewGroup, setShowNewChat } = useUIStore();
  const { isAuthenticated } = useAuthContext();
  const { isAuthenticated: userIsAuthenticated, currentUser } = useUserStore();
  const toast = useToast();
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Load chats if not loaded
  useEffect(() => {
    if ((isAuthenticated || userIsAuthenticated) && chats.length === 0 && !isLoadingChats) {
      loadChats();
    }
  }, [isAuthenticated, userIsAuthenticated, chats.length, isLoadingChats, loadChats]);

  // Fetch chat by ID if not in store
  useEffect(() => {
    if (!chatId) return;
    
    const selectedChat = getSelectedChat();
    
    // If chat is not in store, fetch it by ID
    if (!selectedChat && !isLoadingChat && (isAuthenticated || userIsAuthenticated)) {
      setIsLoadingChat(true);
      chatsAPI.getChatById(chatId)
        .then((apiChat) => {
          // Normalize the chat
          const normalizedChat = normalizeChat(apiChat, currentUser?.id || null);
          // Add to store
          addChat(normalizedChat);
          // Select it
          selectChat(chatId);
        })
        .catch((error) => {
          console.error("Failed to load chat by ID:", error);
          toast.error("Failed to load chat. Redirecting...");
          router.replace("/");
        })
        .finally(() => {
          setIsLoadingChat(false);
        });
    } else if (selectedChat) {
      // Chat is in store, just select it
      selectChat(chatId);
    }
  }, [chatId, getSelectedChat, isLoadingChat, isAuthenticated, userIsAuthenticated, addChat, selectChat, currentUser?.id, toast, router]);

  const selectedChat = getSelectedChat();

  if (!chatId) {
    router.replace("/");
    return null;
  }

  if (isLoadingChats || isLoadingChat || !selectedChat) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-secondary">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Chat List - Hidden on mobile when chat is open */}
        <div className="hidden md:flex w-96 border-r border-border shrink-0">
          <ChatList
            selectedChatId={chatId}
            onChatSelect={(chat) => {
              router.push(`/chat/${chat.id}`);
            }}
            onNewChat={() => setShowNewChat(true)}
            onNewGroup={() => setShowNewGroup(true)}
          />
        </div>

        {/* Conversation */}
        <div className="flex-1 flex min-w-0 w-full md:w-auto">
          {selectedChat.type === "group" ? (
            <GroupChat
              groupId={selectedChat.id}
              groupName={selectedChat.name}
              groupAvatar={selectedChat.avatar}
              members={selectedChat.members || []}
              onBack={() => router.push("/")}
              onChatDrop={(chat) => router.push(`/chat/${chat.id}`)}
            />
          ) : (
            <Conversation
              chatId={selectedChat.id}
              chatName={selectedChat.name}
              chatAvatar={selectedChat.avatar}
              isOnline={selectedChat.isOnline}
              onBack={() => router.push("/")}
              onChatDrop={(chat) => router.push(`/chat/${chat.id}`)}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

