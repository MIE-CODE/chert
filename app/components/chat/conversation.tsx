"use client";

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
  const currentUserId = "me";
  const { messages, messagesEndRef, sendMessage, shouldShowDate, shouldShowAvatar } =
    useMessages({ chatId, currentUserId });
  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } = useDragDrop(
    (data) => {
      if (onChatDrop) {
        onChatDrop(data);
      }
    }
  );

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-background w-full transition-all",
        isDragOver && "ring-2 ring-primary ring-offset-2"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface-elevated">
        <div className="flex items-center gap-3">
          {onBack && (
            <IconButton variant="ghost" size="md" onClick={onBack}>
              <ArrowLeftIcon />
            </IconButton>
          )}
          <Avatar
            src={chatAvatar}
            name={chatName}
            size="md"
            online={isOnline}
          />
          <div>
            <h2 className="font-semibold text-primary">{chatName}</h2>
            <p className="text-xs text-secondary">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <IconButton variant="ghost" size="md" title="Voice call">
            <PhoneIcon />
          </IconButton>
          <IconButton variant="ghost" size="md" title="Video call">
            <VideoIcon />
          </IconButton>
          <IconButton variant="ghost" size="md" title="More options">
            <MoreIcon />
          </IconButton>
        </div>
      </div>

      {/* Messages */}
      <div className=" flex flex-col gap-4 flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            currentUserId={currentUserId}
            showAvatar={shouldShowAvatar(index) && message.senderId !== currentUserId}
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
