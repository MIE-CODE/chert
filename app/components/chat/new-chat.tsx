"use client";

import { useState, useEffect } from "react";
import { Avatar } from "@/app/components/ui/avatar";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { IconButton } from "@/app/components/ui/icon-button";
import { ArrowLeftIcon, SearchIcon } from "@/app/components/ui/icons";
import { cn } from "@/app/lib/utils";
import { useChatStore } from "@/app/store";
import { usersAPI, chatsAPI } from "@/app/services/api";
import { Contact } from "@/app/store/types";
import { useToast } from "@/app/components/ui/toast";

interface NewChatProps {
  onBack?: () => void;
  onChatCreated?: (chatId: string) => void;
}

export function NewChat({ onBack, onChatCreated }: NewChatProps) {
  const { addChat, selectChat } = useChatStore();
  const toast = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<Contact | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Search users by phone number
  const handleSearch = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter a phone number");
      return;
    }

    // Basic phone number validation (10-15 digits)
    const phoneRegex = /^[0-9]{10,15}$/;
    const cleanPhone = phoneNumber.replace(/\D/g, ""); // Remove non-digits

    if (!phoneRegex.test(cleanPhone)) {
      setError("Please enter a valid phone number (10-15 digits)");
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResults([]);
    setSelectedUser(null);

    try {
      // Search users by phone number - try phone-specific search first, fallback to general search
      let results: Contact[];
      try {
        results = await usersAPI.searchByPhone(cleanPhone);
      } catch {
        // Fallback to general search if phone-specific endpoint doesn't exist
        results = await usersAPI.searchUsers(cleanPhone);
      }
      setSearchResults(results);
      
      if (results.length === 0) {
        const errorMsg = "No user found with this phone number";
        setError(errorMsg);
        toast.warning(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to search user";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  // Create chat with selected user
  const handleCreateChat = async () => {
    if (!selectedUser) return;

    setIsCreating(true);
    setError(null);

    try {
      // Create one-on-one chat
      const chat = await chatsAPI.createChat({
        participantIds: [selectedUser.id],
        isGroup: false,
      });

      // Add chat to store
      addChat(chat);
      
      // Select the new chat
      selectChat(chat.id);
      
      // Notify parent component
      onChatCreated?.(chat.id);
      
      // Show success toast
      toast.success("Chat created successfully!");
      
      // Close the modal
      onBack?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create chat";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Enter key in phone input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && phoneNumber.trim()) {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background w-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-surface-elevated">
        <IconButton variant="ghost" size="md" onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <h1 className="text-xl font-bold text-primary">New Chat</h1>
      </div>

      {/* Search Section */}
      <div className="p-4 border-b border-border bg-surface-elevated">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Phone Number
            </label>
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setError(null);
                  setSearchResults([]);
                  setSelectedUser(null);
                }}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                variant="primary"
                onClick={handleSearch}
                disabled={!phoneNumber.trim() || isSearching}
                isLoading={isSearching}
              >
                <SearchIcon className="w-5 h-5" />
              </Button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-error">{error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedUser ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-secondary mb-4">Selected user:</p>
              <div className="flex flex-col items-center gap-3 p-4 bg-surface-elevated rounded-lg">
                <Avatar
                  src={selectedUser.avatar}
                  name={selectedUser.name}
                  size="xl"
                  online={selectedUser.isOnline}
                />
                <div className="text-center">
                  <h3 className="font-semibold text-primary text-lg">
                    {selectedUser.name}
                  </h3>
                  {selectedUser.phone && (
                    <p className="text-sm text-secondary mt-1">
                      {selectedUser.phone}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(null);
                    setSearchResults([]);
                  }}
                >
                  Change
                </Button>
              </div>
            </div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-secondary mb-2">
              Search Results
            </p>
            {searchResults.map((user) => (
              <div
                key={user.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-surface transition-colors",
                  selectedUser?.id === user.id && "bg-primary-light"
                )}
                onClick={() => setSelectedUser(user)}
              >
                <Avatar
                  src={user.avatar}
                  name={user.name}
                  size="md"
                  online={user.isOnline}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-primary truncate">
                    {user.name}
                  </h3>
                  {user.phone && (
                    <p className="text-sm text-secondary truncate">
                      {user.phone}
                    </p>
                  )}
                  {user.email && (
                    <p className="text-xs text-tertiary truncate">
                      {user.email}
                    </p>
                  )}
                </div>
                {selectedUser?.id === user.id && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-inverse"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : phoneNumber && !isSearching ? (
          <div className="text-center py-8 text-secondary">
            <p>Enter a phone number and click search to find users</p>
          </div>
        ) : null}
      </div>

      {/* Create Chat Button */}
      {selectedUser && (
        <div className="p-4 border-t border-border bg-surface-elevated">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleCreateChat}
            disabled={isCreating}
            isLoading={isCreating}
          >
            Start Chat with {selectedUser.name}
          </Button>
        </div>
      )}
    </div>
  );
}

