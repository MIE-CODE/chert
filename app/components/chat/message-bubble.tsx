"use client";

import { Avatar } from "@/app/components/ui/avatar";
import { CheckIcon, DoubleCheckIcon } from "@/app/components/ui/icons";
import { cn } from "@/app/lib/utils";
import { Message as MessageType } from "@/app/store/types";
import { MessageService } from "@/app/services/message-service";

export type { MessageType as Message };

interface MessageBubbleProps {
  message: MessageType;
  currentUserId: string;
  showAvatar?: boolean;
  showDate?: boolean;
}

export function MessageBubble({
  message,
  currentUserId,
  showAvatar = false,
  showDate = false,
}: MessageBubbleProps) {
  const isOwn = message.senderId === currentUserId;
  const messageText = message.text || message.content || "";
  
  // Debug logging to verify alignment
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    if (Math.random() < 0.1) { // Log 10% of messages to avoid spam
      console.log("Message alignment check:", {
        senderId: message.senderId,
        currentUserId,
        isOwn,
        messagePreview: messageText.substring(0, 30),
      });
    }
  }
  
  const timestamp = typeof message.timestamp === "string" 
    ? new Date(message.timestamp) 
    : message.timestamp;
  const timeString = timestamp?.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className={cn(
      "flex gap-2 mb-1 w-full",
      !isOwn ? "justify-end" : "justify-start"
    )}>
      {showAvatar && !isOwn && (
        <Avatar
          src={undefined}
          name={message.senderName}
          size="sm"
          className="mt-1 shrink-0"
        />
      )}
      <div className={cn(
        "flex flex-col max-w-[85%] sm:max-w-[75%] md:max-w-[60%]",
        isOwn ? "items-end ml-auto" : "items-start"
      )}>
        {showDate && (
          <div className="text-center text-xs text-tertiary my-2">
            {formatDate(timestamp)}
          </div>
        )}
        <div
          className={cn(
            "rounded-2xl px-3 py-1.5 md:px-4 md:py-2 shadow-sm",
            isOwn
              ? "bg-message-sent text-message-sent-text rounded-br-md"
              : "bg-message-received text-message-received-text rounded-bl-md"
          )}
        >
          {!isOwn && (
            <div className="text-xs font-medium mb-0.5 md:mb-1 opacity-80">
              {message.senderName}
            </div>
          )}
          <p className="text-xs md:text-sm whitespace-pre-wrap wrap-break-word">{messageText}</p>
          <div
            className={cn(
              "flex items-center gap-1 mt-1 text-xs opacity-70",
              isOwn ? "justify-end" : "justify-start"
            )}
          >
            <span>{timeString}</span>
            {isOwn && (
              <span className="ml-1">
                {message.isRead ? (
                  <DoubleCheckIcon className="text-blue-400" />
                ) : message.isDelivered ? (
                  <CheckIcon />
                ) : (
                  <CheckIcon className="opacity-50" />
                )}
              </span>
            )}
          </div>
          {Array.isArray(message.reactions) && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {message.reactions.map((reaction, idx) => (
              <span
                key={idx}
                className="bg-surface-elevated px-2 py-0.5 rounded-full text-xs"
              >
                {reaction.emoji} {reaction.count}
              </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date?.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date?.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date?.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  }
}

