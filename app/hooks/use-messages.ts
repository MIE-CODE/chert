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
  const loadedChatIdRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);
  
  // Store function references in refs to avoid dependency issues
  const getChatMessagesRef = useRef(getChatMessages);
  const addMessageToStoreRef = useRef(addMessageToStore);
  
  // Update refs when functions change
  useEffect(() => {
    getChatMessagesRef.current = getChatMessages;
    addMessageToStoreRef.current = addMessageToStore;
  }, [getChatMessages, addMessageToStore]);

  // Load messages from API and store
  useEffect(() => {
    // Reset when chatId changes
    if (loadedChatIdRef.current !== chatId) {
      loadedChatIdRef.current = null;
      isLoadingRef.current = false;
      setLocalMessages([]); // Clear previous chat's messages
    }

    // Prevent loading if already loading or if this chat is already loaded
    if (!chatId || isLoadingRef.current || loadedChatIdRef.current === chatId) {
      return;
    }

    const loadMessages = async () => {
      // Set loading flag to prevent concurrent loads
      isLoadingRef.current = true;
      loadedChatIdRef.current = chatId;
      
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
          const safeItems = Array.isArray(response?.items) ? response.items : [];
          const normalizedMessages = safeItems.map((msg) =>
            MessageService.normalizeMessage(msg)
          );
          setLocalMessages(normalizedMessages);
          // Also update store (batch updates to avoid triggering re-renders)
          normalizedMessages.forEach((msg) => {
            if (msg) {
              addMessageToStoreRef.current(chatId, msg);
            }
          });
        } else {
          // No token, use store messages
          const storeMessages = getChatMessagesRef.current(chatId);
          setLocalMessages(Array.isArray(storeMessages) ? storeMessages : []);
        }
      } catch (error) {
        // Fallback to store if API fails
        console.error("Failed to load messages:", error);
        const storeMessages = getChatMessagesRef.current(chatId);
        setLocalMessages(Array.isArray(storeMessages) ? storeMessages : []);
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    };

    loadMessages();
  }, [chatId]); // Only depend on chatId - use refs to access stable functions

  // Join chat room via WebSocket and listen for messages
  useEffect(() => {
    if (!chatId) return;

    // Function to join chat room (optional - server auto-joins on connect, but we can manually join for specific cases)
    const joinChatRoom = () => {
      if (websocketService.connected) {
        console.log("Manually joining chat room:", chatId);
        // Note: Server automatically joins user to all chats on connect,
        // but we can manually join for specific cases or to ensure we're in the room
        websocketService.joinChat(chatId);
      } else {
        console.log("WebSocket not connected, cannot join chat:", chatId);
        // Try to connect if we have a token
        const token = typeof window !== "undefined" 
          ? localStorage.getItem("auth_token") 
          : null;
        if (token && !websocketService.connected) {
          console.log("Attempting to connect WebSocket...");
          websocketService.connect(token);
        }
      }
    };

    // Listen for new messages
    const handleNewMessage = (data: { message: Message }) => {
      if (data.message) {
        const normalizedMessage = MessageService.normalizeMessage(data.message);
        // Extract chatId from message (could be in normalizedMessage or data.message)
        const messageChatId = normalizedMessage.chatId || data.message.chatId || (data.message as any).chat?._id || (data.message as any).chat?.id;
        
        // Only add if it's for this chat or if chatId matches
        if (!messageChatId || messageChatId === chatId) {
          console.log("Received new message via WebSocket for chat", chatId, ":", normalizedMessage);
          setLocalMessages((prev) => {
            // Check if message already exists by ID
            const existsById = prev.some((msg) => msg.id === normalizedMessage.id);
            if (existsById) {
              console.log("Message already exists by ID, skipping:", normalizedMessage.id);
              return prev;
            }
            
            // Check if this is a message we just sent (by content and senderId)
            // If so, replace the temp message instead of adding duplicate
            const tempMessageIndex = prev.findIndex((msg) => 
              msg.senderId === normalizedMessage.senderId &&
              msg.senderId === currentUserId &&
              (msg.text === normalizedMessage.text || msg.content === normalizedMessage.content) &&
              (msg.id.match(/^\d+$/) || msg.id.startsWith("temp-")) // Temp messages have timestamp IDs
            );
            
            if (tempMessageIndex !== -1 && normalizedMessage.senderId === currentUserId) {
              console.log("Replacing temp message with server message from WebSocket");
              const updated = [...prev];
              updated[tempMessageIndex] = normalizedMessage;
              return updated;
            }
            
            console.log("Adding new message to local state");
            return [...prev, normalizedMessage];
          });
          addMessageToStore(chatId, normalizedMessage);
        } else {
          console.log("Message is for different chat, ignoring. Expected:", chatId, "Got:", messageChatId);
        }
      }
    };

    // Set up message listener first (before checking connection)
    websocketService.on("new_message", handleNewMessage);
    
    // Set up connection listener to join chat when connected
    const handleConnect = () => {
      console.log("WebSocket connected, joining chat:", chatId);
      joinChatRoom();
    };

    websocketService.on("connect", handleConnect);

    // Join immediately if already connected
    if (websocketService.connected) {
      joinChatRoom();
    } else {
      console.log("WebSocket not yet connected, will join when it connects");
    }

    return () => {
      console.log("Cleaning up WebSocket listeners for chat:", chatId);
      websocketService.off("new_message", handleNewMessage);
      websocketService.off("connect", handleConnect);
      if (websocketService.connected) {
        websocketService.leaveChat(chatId);
      }
    };
  }, [chatId, addMessageToStore, currentUserId]);

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
      console.log("Adding temp message:", tempMessage);
      setLocalMessages((prev) => {
        console.log("Current messages before adding temp:", prev.length);
        return [...prev, tempMessage];
      });
      // Also add to store immediately for instant feedback
      addMessageToStore(chatId, tempMessage);

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
          console.log("Sending message via WebSocket");
          websocketService.sendMessage({
            chatId,
            content: text,
            type: "text",
          });
        } else {
          console.log("WebSocket not connected, skipping WebSocket send");
        }

        // Also send via API for persistence
        console.log("Sending message via API");
        const message = await messagesAPI.sendMessage({
          chatId,
          content: text,
          type: "text",
        });

        console.log("Received message from API:", message);

        // Update with server response - match by temp message ID or by content/sender
        const normalizedMessage = MessageService.normalizeMessage(message);
        console.log("Normalized message from API:", normalizedMessage);
        
        setLocalMessages((prev) => {
          // Try to find and replace the temp message
          const tempIndex = prev.findIndex((msg) => msg.id === tempMessage.id);
          if (tempIndex !== -1) {
            console.log("Replacing temp message at index:", tempIndex);
            const updated = [...prev];
            updated[tempIndex] = normalizedMessage;
            return updated;
          } else {
            // Temp message not found, check if server message already exists
            const exists = prev.some((msg) => msg.id === normalizedMessage.id);
            if (!exists) {
              console.log("Temp message not found, adding server message");
              return [...prev, normalizedMessage];
            } else {
              console.log("Server message already exists");
              return prev;
            }
          }
        });
        
        // Update store with server message
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
