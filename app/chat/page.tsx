"use client";

import { useState } from "react";
import { ChatList } from "@/app/components/chat/chat-list";
import { Conversation } from "@/app/components/chat/conversation";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<{
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
  } | null>(null);

  return (
    <div className="flex h-screen bg-background w-full">
      {/* Chat List - Hidden on mobile when chat is selected */}
      <div
        className={`${
          selectedChat ? "hidden md:flex" : "flex"
        } w-full md:w-96 border-r border-border`}
      >
        <ChatList />
      </div>

      {/* Conversation - Full width on mobile */}
      {selectedChat ? (
        <div className="flex-1 flex">
          <Conversation
            chatId={selectedChat.id}
            chatName={selectedChat.name}
            chatAvatar={selectedChat.avatar}
            isOnline={selectedChat.isOnline}
            onBack={() => setSelectedChat(null)}
          />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-surface">
          <div className="text-center">
            <p className="text-secondary">Select a chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}

