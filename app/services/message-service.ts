/**
 * Message Service
 * Handles all message-related business logic
 */

import { Message } from "@/app/store/types";

export class MessageService {
  /**
   * Creates a new message object
   */
  static createMessage(
    text: string,
    senderId: string,
    senderName: string
  ): Message {
    return {
      id: Date.now().toString(),
      text,
      content: text, // Also set content for API compatibility
      senderId,
      senderName,
      timestamp: new Date(),
      isRead: false,
      isDelivered: false,
    };
  }

  /**
   * Normalizes message from API format
   */
  static normalizeMessage(message: Message): Message {
    return {
      ...message,
      text: message.text || message.content || "",
      timestamp: typeof message.timestamp === "string" 
        ? new Date(message.timestamp) 
        : message.timestamp,
    };
  }

  /**
   * Formats a date for display in message list
   */
  static formatMessageDate(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  }

  /**
   * Determines if a date separator should be shown
   */
  static shouldShowDateSeparator(
    current: Date | string,
    previous?: Date | string
  ): boolean {
    if (!previous) return true;
    const currentDate = typeof current === "string" ? new Date(current) : current;
    const previousDate = typeof previous === "string" ? new Date(previous) : previous;
    return currentDate.toDateString() !== previousDate.toDateString();
  }

  /**
   * Determines if an avatar should be shown for a message
   */
  static shouldShowAvatar(
    currentMessage: Message,
    previousMessage?: Message,
    currentUserId?: string,
    timeThreshold: number = 300000 // 5 minutes
  ): boolean {
    if (!previousMessage) return true;
    if (previousMessage.senderId !== currentMessage.senderId) return true;
    if (currentMessage.senderId === currentUserId) return false;

    const currentTime = typeof currentMessage.timestamp === "string"
      ? new Date(currentMessage.timestamp).getTime()
      : currentMessage.timestamp.getTime();
    const previousTime = typeof previousMessage.timestamp === "string"
      ? new Date(previousMessage.timestamp).getTime()
      : previousMessage.timestamp.getTime();

    const timeDiff = currentTime - previousTime;

    return timeDiff > timeThreshold;
  }

  /**
   * Formats timestamp for message bubble
   */
  static formatMessageTime(date: Date): string {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  /**
   * Groups messages by date
   */
  static groupMessagesByDate(messages: Message[]): Map<string, Message[]> {
    const grouped = new Map<string, Message[]>();

    messages.forEach((message) => {
      const timestamp = typeof message.timestamp === "string"
        ? new Date(message.timestamp)
        : message.timestamp;
      const dateKey = timestamp.toDateString();
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(message);
    });

    return grouped;
  }
}

