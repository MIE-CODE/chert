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
import { useEffect } from "react";

function HomeContent() {
  const {
    selectedChatId,
    selectChat,
    getSelectedChat,
    setSearchQuery,
  } = useChatStore();
  const { uiState, setShowNewGroup, setShowNewChat } = useUIStore();

  const selectedChat = getSelectedChat();

  return (
    <div className="flex h-screen bg-background">
      {/* Chat List */}
      <div
        className={`${
          selectedChat ? "hidden md:flex" : "flex"
        } w-full md:w-96 border-r border-border`}
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
        <div className="flex-1 flex">
          <NewChat
            onBack={() => setShowNewChat(false)}
            onChatCreated={(chatId) => {
              setShowNewChat(false);
              selectChat(chatId);
            }}
          />
        </div>
      ) : uiState.showNewGroup ? (
        <div className="flex-1 flex">
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
        <div className="flex-1 flex">
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
