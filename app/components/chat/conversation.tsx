"use client";

import { useState } from "react";
import { Avatar } from "@/app/components/ui/avatar";
import { IconButton } from "@/app/components/ui/icon-button";
import {
  ArrowLeftIcon,
  PhoneIcon,
  VideoIcon,
  MoreIcon,
} from "@/app/components/ui/icons";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { cn } from "@/app/lib/utils";
import { useMessages, useDragDrop } from "@/app/hooks";
import { useUserStore } from "@/app/store";
import { useToast } from "@/app/components/ui/toast";

interface ConversationProps {
  chatId: string;
  chatName: string;
  chatAvatar?: string;
  isOnline?: boolean;
  onBack?: () => void;
}


export function Conversation({
  chatId,
  chatName,
  chatAvatar,
  isOnline = false,
  onBack,
  onChatDrop,
}: ConversationProps & { onChatDrop?: (chat: any) => void }) {
  const { currentUser } = useUserStore();
  const toast = useToast();
  
  // Try to get user ID from currentUser, or fallback to token payload
  const getCurrentUserId = (): string => {
    if (currentUser?.id) {
      return currentUser.id;
    }
    
    // Fallback: Try to decode JWT token to get user ID
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem("auth_token");
        if (token) {
          // Decode JWT (simple base64 decode, not full validation)
          const payload = JSON.parse(atob(token.split(".")[1]));
          const userId = payload.id || payload.userId || payload._id || payload.sub;
          if (userId) {
            console.warn("Using user ID from token payload:", userId);
            return userId;
          }
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
    
    return "";
  };
  
  const currentUserId = getCurrentUserId();
  
  // Debug: Log current user ID to verify it's being set correctly
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("Conversation - Current User ID:", currentUserId, "Current User:", currentUser);
    if (!currentUser) {
      console.warn("⚠️ Current user is null! Messages may not align correctly.");
    }
  }
  const { messages, messagesEndRef, sendMessage, shouldShowDate, shouldShowAvatar } =
    useMessages({ chatId, currentUserId });
  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } = useDragDrop(
    (data) => {
      if (onChatDrop) {
        onChatDrop(data);
      }
    }
  );

  const handleVoiceCall = () => {
    toast.info("Voice call feature coming soon");
  };

  const handleVideoCall = () => {
    toast.info("Video call feature coming soon");
  };

  const handleMoreOptions = () => {
    toast.info("More options coming soon");
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-background w-full transition-all overflow-hidden",
        isDragOver && "ring-2 ring-primary ring-offset-2"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-border bg-surface-elevated flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          {onBack && (
            <IconButton variant="ghost" size="md" onClick={onBack} className="md:hidden">
              <ArrowLeftIcon />
            </IconButton>
          )}
          <Avatar
            src={chatAvatar}
            name={chatName}
            size="md"
            online={isOnline}
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-primary text-sm md:text-base truncate">{chatName}</h2>
            <p className="text-xs text-secondary">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
          <IconButton 
            variant="ghost" 
            size="md" 
            title="Voice call" 
            className="hidden md:flex"
            onClick={handleVoiceCall}
          >
            <PhoneIcon />
          </IconButton>
          <IconButton 
            variant="ghost" 
            size="md" 
            title="Video call" 
            className="hidden md:flex"
            onClick={handleVideoCall}
          >
            <VideoIcon />
          </IconButton>
          <IconButton 
            variant="ghost" 
            size="md" 
            title="More options"
            onClick={handleMoreOptions}
          >
            <MoreIcon />
          </IconButton>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-2 md:gap-4 flex-1 overflow-y-auto p-3 md:p-4 space-y-1 min-h-0 w-full">
        {Array.isArray(messages) && messages.map((message, index) => (
          <MessageBubble
            key={message?.id || `message-${index}`}
            message={message}
            currentUserId={currentUserId}
            showAvatar={shouldShowAvatar(index) && message?.senderId !== currentUserId}
            showDate={shouldShowDate(index)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
