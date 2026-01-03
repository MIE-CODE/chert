"use client";

import React from "react";
import { ChatList } from "./components/chat/chat-list";
import { Conversation } from "./components/chat/conversation";
import { GroupChat } from "./components/groups/group-chat";
import { NewGroup } from "./components/groups/new-group";
import { NewChat } from "./components/chat/new-chat";
import { ProtectedRoute } from "./components/auth/protected-route";
import { useChatStore, useUIStore } from "./store";
import { cn } from "./lib/utils";
import { useAuthContext } from "./components/auth/auth-provider";
import { useUserStore } from "./store";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useToast } from "./components/ui/toast";
import { websocketService } from "./services/api";
import { MessageService } from "./services/message-service";

function HomeContent() {
  const {
    selectedChatId,
    selectChat,
    getSelectedChat,
    setSearchQuery,
    loadChats,
    chats,
    isLoadingChats,
    addChat,
  } = useChatStore();
  const { uiState, setShowNewGroup, setShowNewChat } = useUIStore();
  const { isAuthenticated } = useAuthContext();
  const { isAuthenticated: userIsAuthenticated } = useUserStore();
  const toast = useToast();

  const selectedChat = getSelectedChat();
  const hasLoadedChats = useRef(false);

  // Load chats when authenticated (only once, and only if not already loading/loaded)
  useEffect(() => {
    if (
      (isAuthenticated || userIsAuthenticated) &&
      !hasLoadedChats.current &&
      !isLoadingChats &&
      chats.length === 0
    ) {
      hasLoadedChats.current = true;
      loadChats().catch((error: any) => {
        const errorMessage = error?.message || "Failed to load chats";
        const isTimeout = error?.isTimeout || error?.code === 'ECONNABORTED' || errorMessage.includes('timeout');
        const isNetworkError = error?.isNetworkError || error?.code === 'ERR_NETWORK';

        if (isTimeout) {
          toast.warning("Connection timeout. Please check your internet connection.");
        } else if (isNetworkError) {
          toast.warning("Network error. Please check your connection.");
        } else {
          toast.error(errorMessage);
        }
        hasLoadedChats.current = false; // Allow retry on error
      });
    }
    // Reset the ref if user logs out
    if (!isAuthenticated && !userIsAuthenticated) {
      hasLoadedChats.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, userIsAuthenticated, isLoadingChats, chats.length]);

  // Listen for new chat notifications from WebSocket
  useEffect(() => {
    if (!isAuthenticated && !userIsAuthenticated) return;

    const handleNewChat = (data: { 
      chatId: string; 
      message: any; 
      sender: { id: string; username: string; avatar?: string } 
    }) => {
      console.log("New chat notification received:", data);
      
      // Reload chats to get the new chat with full details
      loadChats().then(() => {
        toast.info(`New chat started with ${data.sender.username}`);
        // Optionally select the new chat
        // selectChat(data.chatId);
      }).catch((error) => {
        console.error("Failed to reload chats after new chat notification:", error);
      });
    };

    websocketService.on("new_chat", handleNewChat);

    return () => {
      websocketService.off("new_chat", handleNewChat);
    };
  }, [isAuthenticated, userIsAuthenticated, loadChats, toast]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Chat List - Hide when showing NewChat/NewGroup on mobile, or when a chat is selected on mobile */}
      <div
        className={`${
          (uiState.showNewChat || uiState.showNewGroup || selectedChat) ? "hidden md:flex" : "flex"
        } w-full md:w-96 border-r border-border shrink-0`}
      >
        <ChatList
          selectedChatId={selectedChatId}
          onChatSelect={(chat) => {
            selectChat(chat.id);
          }}
          onNewChat={() => setShowNewChat(true)}
          onNewGroup={() => setShowNewGroup(true)}
        />
      </div>

      {/* Conversation, New Chat, or New Group */}
      {uiState.showNewChat ? (
        <div className="flex-1 flex min-w-0 w-full md:w-auto absolute md:relative inset-0 z-10 bg-background">
          <NewChat
            onBack={() => setShowNewChat(false)}
            onChatCreated={(chatId) => {
              setShowNewChat(false);
              selectChat(chatId);
            }}
          />
        </div>
      ) : uiState.showNewGroup ? (
        <div className="flex-1 flex min-w-0 w-full md:w-auto absolute md:relative inset-0 z-10 bg-background">
          <NewGroup
            onBack={() => setShowNewGroup(false)}
            onCreateGroup={(group) => {
              // In a real app, you'd create the group and add it to the chat list
              console.log("Creating group:", group);
              setShowNewGroup(false);
              // You could navigate to the new group chat here
            }}
          />
        </div>
      ) : selectedChat ? (
        <div className="flex-1 flex min-w-0 w-full md:w-auto">
          {selectedChat.type === "group" ? (
            <GroupChat
              groupId={selectedChat.id}
              groupName={selectedChat.name}
              groupAvatar={selectedChat.avatar}
              members={selectedChat.members || []}
              onBack={() => selectChat(null)}
              onChatDrop={(chat) => selectChat(chat.id)}
            />
          ) : (
            <Conversation
              chatId={selectedChat.id}
              chatName={selectedChat.name}
              chatAvatar={selectedChat.avatar}
              isOnline={selectedChat.isOnline}
              onBack={() => selectChat(null)}
              onChatDrop={(chat) => selectChat(chat.id)}
            />
          )}
        </div>
      ) : (
        <DropZone onChatDrop={(chat) => selectChat(chat.id)} />
      )}
    </div>
  );
}

function DropZone({
  onChatDrop,
}: {
  onChatDrop: (chat: {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
    type?: "individual" | "group";
    members?: Array<{ id: string; name: string; avatar?: string; isAdmin?: boolean }>;
  }) => void;
}) {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const chatData = JSON.parse(e.dataTransfer.getData("application/json"));
      if (chatData && chatData.id) {
        onChatDrop(chatData);
      }
    } catch (error) {
      console.error("Error parsing dropped chat data:", error);
    }
  };

  return (
    <div
      className={cn(
        "hidden md:flex flex-1 items-center justify-center bg-surface transition-all",
        isDragOver && "ring-2 ring-primary ring-offset-2 bg-primary-light/10"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-primary mb-2">
          {isDragOver ? "Drop chat here" : "Welcome to Chert"}
        </h2>
        <p className="text-secondary">
          {isDragOver
            ? "Release to open this chat"
            : "Select a chat or drag one here to start messaging"}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { isInitialized, isAuthenticated } = useAuthContext();
  const { isAuthenticated: userIsAuthenticated } = useUserStore();

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated && !userIsAuthenticated) {
      router.replace("/landing");
    }
  }, [isInitialized, isAuthenticated, userIsAuthenticated, router]);

  // Show loading while checking auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (redirect in progress)
  if (!isAuthenticated && !userIsAuthenticated) {
    return null;
  }

  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}
