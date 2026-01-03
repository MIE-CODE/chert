/**
 * useMessages Hook
 * Manages message state and operations for a chat
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Message } from "@/app/store/types";
import { useChatStore } from "@/app/store";
import { MessageService } from "@/app/services/message-service";
import { messagesAPI, websocketService } from "@/app/services/api";
import { useToast } from "../components/ui/toast";

interface UseMessagesOptions {
  chatId: string;
  currentUserId: string;
}

export function useMessages({ chatId, currentUserId }: UseMessagesOptions) {
  const { getChatMessages, addMessage: addMessageToStore } = useChatStore();
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load messages from API and store
  useEffect(() => {
    const loadMessages = async () => {
      // Check if user is authenticated before making API call
      const token = typeof window !== "undefined" 
        ? localStorage.getItem("auth_token") 
        : null;
      
      setIsLoading(true);
      try {
        // Try to load from API first (only if authenticated)
        if (token) {
          const response = await messagesAPI.getChatMessages(chatId, {
            page: 1,
            limit: 50,
          });
          const normalizedMessages = (response.items || []).map((msg) =>
            MessageService.normalizeMessage(msg)
          );
          setLocalMessages(normalizedMessages);
          // Also update store
          normalizedMessages.forEach((msg) => {
            addMessageToStore(chatId, msg);
          });
        } else {
          // No token, use store messages
          const storeMessages = getChatMessages(chatId);
          setLocalMessages(storeMessages);
        }
      } catch (error) {
        // Fallback to store if API fails
        console.error("Failed to load messages:", error);
        const storeMessages = getChatMessages(chatId);
        setLocalMessages(storeMessages);
      } finally {
        setIsLoading(false);
      }
    };

    if (chatId) {
      loadMessages();
    }
  }, [chatId, getChatMessages, addMessageToStore]);

  // Join chat room via WebSocket
  useEffect(() => {
    if (chatId && websocketService.connected) {
      websocketService.joinChat(chatId);

      // Listen for new messages
      const handleNewMessage = (data: { message: Message }) => {
        if (data.message) {
          const normalizedMessage = MessageService.normalizeMessage(data.message);
          // Only add if it's for this chat or if chatId matches
          if (!normalizedMessage.chatId || normalizedMessage.chatId === chatId) {
            setLocalMessages((prev) => [...prev, normalizedMessage]);
            addMessageToStore(chatId, normalizedMessage);
          }
        }
      };

      websocketService.on("new_message", handleNewMessage);

      return () => {
        websocketService.off("new_message", handleNewMessage);
        websocketService.leaveChat(chatId);
      };
    }
  }, [chatId, addMessageToStore]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  /**
   * Sends a new message
   */
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const tempMessage = MessageService.createMessage(
        text,
        currentUserId,
        "Me"
      );

      // Add to local state immediately for instant feedback
      setLocalMessages((prev) => [...prev, tempMessage]);

      try {
        // Check if authenticated before sending
        const token = typeof window !== "undefined" 
          ? localStorage.getItem("auth_token") 
          : null;

        if (!token) {
          // No token, remove temp message and show error
          setLocalMessages((prev) =>
            prev.filter((msg) => msg.id !== tempMessage.id)
          );
          toast.error("Cannot send message: Please log in again");
          return;
        }

        // Send via WebSocket for real-time
        if (websocketService.connected) {
          websocketService.sendMessage({
            chatId,
            content: text,
            type: "text",
          });
        }

        // Also send via API for persistence
        const message = await messagesAPI.sendMessage({
          chatId,
          content: text,
          type: "text",
        });

        // Update with server response
        const normalizedMessage = MessageService.normalizeMessage(message);
        setLocalMessages((prev) =>
          prev.map((msg) => (msg.id === tempMessage.id ? normalizedMessage : msg))
        );
        addMessageToStore(chatId, normalizedMessage);
      } catch (error) {
        // Remove temp message on error
        setLocalMessages((prev) =>
          prev.filter((msg) => msg.id !== tempMessage.id)
        );
        const errorMessage = error instanceof Error ? error.message : "Failed to send message";
        toast.error(errorMessage);
      }
    },
    [chatId, currentUserId, addMessageToStore]
  );

  /**
   * Determines if date separator should be shown
   */
  const shouldShowDate = (index: number): boolean => {
    const message = localMessages[index];
    const previousMessage = index > 0 ? localMessages[index - 1] : undefined;
    return MessageService.shouldShowDateSeparator(
      message.timestamp,
      previousMessage?.timestamp
    );
  };

  /**
   * Determines if avatar should be shown
   */
  const shouldShowAvatar = (index: number): boolean => {
    const message = localMessages[index];
    const previousMessage = index > 0 ? localMessages[index - 1] : undefined;
    return MessageService.shouldShowAvatar(
      message,
      previousMessage,
      currentUserId
    );
  };

  return {
    messages: localMessages,
    messagesEndRef,
    sendMessage,
    shouldShowDate,
    shouldShowAvatar,
    isLoading,
  };
}
