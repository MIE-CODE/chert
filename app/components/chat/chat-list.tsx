"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import {
  SearchIcon,
  PlusIcon,
  SettingsIcon,
  PinIcon,
  MoreIcon,
  ChatIcon,
} from "@/app/components/ui/icons";
import { IconButton } from "@/app/components/ui/icon-button";
import { cn } from "@/app/lib/utils";
import { useChatStore, useUIStore } from "@/app/store";
import { DragDropService } from "@/app/services/drag-drop-service";
import { ChatActionsModal } from "./chat-actions-modal";

import type { Chat } from "@/app/store/types";



interface ChatListProps {
  selectedChatId?: string | null;
  onChatSelect?: (chat: {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
    type?: "individual" | "group";
    members?: Array<{ id: string; name: string; avatar?: string; isAdmin?: boolean }>;
  }) => void;
  onNewGroup?: () => void;
  onNewChat?: () => void;
}

export function ChatList(
  { selectedChatId, onChatSelect, onNewGroup, onNewChat }: ChatListProps = {} as ChatListProps
) {
  const { chats, searchQuery, setSearchQuery, isLoadingChats, blockChat, muteChat, pinChat, archiveChat } = useChatStore();
  const { setShowSettings } = useUIStore();
  const router = useRouter();
  const [actionsModalChat, setActionsModalChat] = useState<Chat | null>(null);

  // Debug: Log chats to see if they're being received
  console.log("ChatList - chats:", chats);
  console.log("ChatList - isLoadingChats:", isLoadingChats);
  console.log("ChatList - chats length:", Array.isArray(chats) ? chats.length : 0);

  // Ensure chats is always an array
  const safeChats = Array.isArray(chats) ? chats : [];
  const safeSearchQuery = searchQuery || "";
  
  const pinnedChats = safeChats.filter((chat) => chat?.isPinned && !chat?.isArchived);
  const regularChats = safeChats.filter((chat) => !chat?.isPinned && !chat?.isArchived);

  const filteredChats = regularChats.filter(
    (chat) =>
      chat?.name?.toLowerCase().includes(safeSearchQuery.toLowerCase()) ||
      chat?.lastMessage?.toLowerCase().includes(safeSearchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-background w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-border bg-surface-elevated w-full shrink-0">
        <h1 className="text-lg md:text-xl font-bold text-primary">Chert</h1>
        <div className="flex items-center gap-1 md:gap-2">
          <IconButton variant="ghost" size="md" onClick={onNewChat} title="New chat">
            <ChatIcon />
          </IconButton>
          <IconButton variant="ghost" size="md" onClick={onNewGroup} title="New group">
            <PlusIcon />
          </IconButton>
          <IconButton 
            variant="ghost" 
            size="md" 
            title="Settings"
            onClick={() => router.push("/settings")}
          >
            <SettingsIcon />
          </IconButton>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 md:p-4 border-b border-border bg-surface-elevated shrink-0">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tertiary w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            placeholder="Search chats, contacts, messages"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-2.5 text-sm md:text-base rounded-lg border border-border bg-surface text-primary placeholder:text-tertiary focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingChats ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-secondary">Loading chats...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Pinned Chats */}
            {pinnedChats.length > 0 && (
              <div className="px-4 py-2">
                <div className="flex items-center gap-2 text-xs font-medium text-secondary uppercase mb-2">
                  <PinIcon className="w-3 h-3" />
                  Pinned
                </div>
                {pinnedChats.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isSelected={selectedChatId === chat.id}
                    onClick={() =>
                      onChatSelect?.({
                        id: chat.id,
                        name: chat.name,
                        avatar: chat.avatar,
                        isOnline: chat.isOnline,
                        type: chat.type || "individual",
                        members: chat.members,
                      })
                    }
                    onActionsClick={() => setActionsModalChat(chat)}
                  />
                ))}
              </div>
            )}

            {/* Regular Chats */}
            <div className="px-4 py-2">
              {pinnedChats.length > 0 && (
                <div className="flex items-center gap-2 text-xs font-medium text-secondary uppercase mb-2">
                  All Chats
                </div>
              )}
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isSelected={selectedChatId === chat.id}
                    onClick={() =>
                      onChatSelect?.({
                        id: chat.id,
                        name: chat.name,
                        avatar: chat.avatar,
                        isOnline: chat.isOnline,
                        type: chat.type || "individual",
                        members: chat.members,
                      })
                    }
                    onActionsClick={() => setActionsModalChat(chat)}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-secondary">
                  <p>No chats found</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Chat Actions Modal */}
      <ChatActionsModal
        chat={actionsModalChat}
        isOpen={actionsModalChat !== null}
        onClose={() => setActionsModalChat(null)}
        onBlock={blockChat}
        onMute={muteChat}
        onPin={pinChat}
        onArchive={archiveChat}
      />
    </div>
  );
}

function ChatItem({
  chat,
  isSelected,
  onClick,
  onActionsClick,
}: {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
  onActionsClick: (e: React.MouseEvent) => void;
}) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    DragDropService.setupDragStart(e, {
      id: chat.id,
      name: chat.name,
      avatar: chat.avatar,
      isOnline: chat.isOnline,
      type: chat.type || "individual",
      members: chat.members,
    });
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    DragDropService.cleanupDragEnd(e);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg cursor-move transition-all hover:bg-surface active:bg-surface group touch-manipulation",
        isSelected && "bg-primary-light"
      )}
    >
      <Avatar
        src={chat.avatar}
        name={chat.name}
        size="md"
        online={chat.type === "individual" ? chat.isOnline : undefined}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5 md:mb-1">
          <div className="flex items-center gap-1.5 md:gap-2 flex-1 min-w-0">
            <h3 className="font-medium text-primary truncate text-sm md:text-base">
              {chat.name}
            </h3>
            {chat.isPinned && (
              <PinIcon className="w-3 h-3 text-tertiary shrink-0" />
            )}
            {chat.type === "group" && chat.memberCount && (
              <span className="text-xs text-tertiary shrink-0">
                ({chat.memberCount})
              </span>
            )}
          </div>
          <span className="text-xs text-tertiary ml-2 shrink-0">
            {chat.timestamp}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-xs md:text-sm truncate flex-1 min-w-0",
              chat.isTyping
                ? "text-primary font-medium"
                : "text-secondary"
            )}
          >
            {chat.isTyping ? "Typing..." : chat.lastMessage}
          </p>
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            {chat.unreadCount > 0 && (
              <Badge variant="primary" size="sm">
                {chat.unreadCount}
              </Badge>
            )}
            <IconButton
              variant="ghost"
              size="sm"
              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onActionsClick(e);
              }}
              title="More options"
            >
              <MoreIcon />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
