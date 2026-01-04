"use client";

import { useState } from "react";
import { IconButton } from "@/app/components/ui/icon-button";
import { Button } from "@/app/components/ui/button";
import { Avatar } from "@/app/components/ui/avatar";
import {
  MoreIcon,
  ArchiveIcon,
  PinIcon,
} from "@/app/components/ui/icons";
import { 
  HiVolumeUp, 
  HiVolumeOff, 
  HiBan, 
  HiTrash, 
  HiSearch,
  HiUser,
  HiUserGroup,
  HiDownload,
  HiCheckCircle,
  HiXCircle,
  HiExclamationCircle
} from "react-icons/hi";
import { cn } from "@/app/lib/utils";
import { useToast } from "@/app/components/ui/toast";
import type { Chat } from "@/app/store/types";

interface ChatActionsModalProps {
  chat: Chat | null;
  isOpen: boolean;
  onClose: () => void;
  onBlock: (chatId: string) => void;
  onMute: (chatId: string, muted: boolean) => void;
  onPin: (chatId: string, pinned: boolean) => void;
  onArchive: (chatId: string) => void;
  onDelete?: (chatId: string) => void;
  onClearChat?: (chatId: string) => void;
  onMarkAsRead?: (chatId: string) => void;
  onMarkAsUnread?: (chatId: string) => void;
  onViewInfo?: (chatId: string) => void;
  onSearch?: (chatId: string) => void;
  onExport?: (chatId: string) => void;
}

export function ChatActionsModal({
  chat,
  isOpen,
  onClose,
  onBlock,
  onMute,
  onPin,
  onArchive,
  onDelete,
  onClearChat,
  onMarkAsRead,
  onMarkAsUnread,
  onViewInfo,
  onSearch,
  onExport,
}: ChatActionsModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const toast = useToast();

  if (!isOpen || !chat) return null;

  const isMuted = chat.isMuted || false;
  const isPinned = chat.isPinned;
  const isBlocked = chat.isBlocked || false;
  const hasUnread = (chat.unreadCount || 0) > 0;

  const handleMute = () => {
    onMute(chat.id, !isMuted);
    toast.success(isMuted ? "Notifications enabled" : "Notifications muted");
    onClose();
  };

  const handlePin = () => {
    onPin(chat.id, !isPinned);
    toast.success(isPinned ? "Chat unpinned" : "Chat pinned");
    onClose();
  };

  const handleBlock = () => {
    onBlock(chat.id);
    toast.success(isBlocked ? "User unblocked" : "User blocked");
    onClose();
  };

  const handleArchive = () => {
    onArchive(chat.id);
    toast.success(chat.isArchived ? "Chat unarchived" : "Chat archived");
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(chat.id);
      toast.success("Chat deleted");
      onClose();
    }
    setShowDeleteConfirm(false);
  };

  const handleClearChat = () => {
    if (onClearChat) {
      onClearChat(chat.id);
      toast.success("Chat cleared");
      onClose();
    }
    setShowClearConfirm(false);
  };

  const handleMarkAsRead = () => {
    if (onMarkAsRead) {
      onMarkAsRead(chat.id);
      toast.success("Marked as read");
      onClose();
    }
  };

  const handleMarkAsUnread = () => {
    if (onMarkAsUnread) {
      onMarkAsUnread(chat.id);
      toast.success("Marked as unread");
      onClose();
    }
  };

  const handleViewInfo = () => {
    if (onViewInfo) {
      onViewInfo(chat.id);
    }
    onClose();
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(chat.id);
    }
    onClose();
  };

  const handleExport = () => {
    if (onExport) {
      onExport(chat.id);
      toast.info("Exporting chat...");
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-surface-elevated rounded-t-2xl shadow-xl animate-slide-up">
        <div className="p-4">
          {/* Handle bar */}
          <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4" />

          {/* Chat Info */}
          <div className="flex items-center gap-3 mb-6 px-2">
            <Avatar
              src={chat.avatar}
              name={chat.name}
              size="lg"
              online={chat.type === "individual" ? chat.isOnline : undefined}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-primary text-lg">{chat.name}</h3>
              <p className="text-sm text-secondary">
                {chat.type === "group" && chat.memberCount
                  ? `${chat.memberCount} members`
                  : chat.isOnline
                  ? "Online"
                  : "Offline"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-1">
            {/* View Info */}
            {onViewInfo && (
              <button
                onClick={handleViewInfo}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-surface text-primary text-left"
              >
                <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center">
                  {chat.type === "group" ? (
                    <HiUserGroup className="w-5 h-5" />
                  ) : (
                    <HiUser className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">View {chat.type === "group" ? "Group" : "Contact"} Info</p>
                  <p className="text-xs text-secondary">
                    {chat.type === "group" ? "See group details and members" : "See contact details"}
                  </p>
                </div>
              </button>
            )}

            {/* Search */}
            {onSearch && (
              <button
                onClick={handleSearch}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-surface text-primary text-left"
              >
                <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center">
                  <HiSearch className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Search in Chat</p>
                  <p className="text-xs text-secondary">Find messages in this conversation</p>
                </div>
              </button>
            )}

            <div className="border-t border-border my-2" />

            {/* Pin */}
            <button
              onClick={handlePin}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                isPinned
                  ? "bg-primary-light text-primary"
                  : "hover:bg-surface text-primary"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isPinned ? "bg-primary text-inverse" : "bg-surface-elevated"
              )}>
                <PinIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{isPinned ? "Unpin Chat" : "Pin Chat"}</p>
                <p className="text-xs text-secondary">
                  {isPinned ? "Remove from pinned" : "Keep at the top"}
                </p>
              </div>
            </button>

            {/* Mute */}
            <button
              onClick={handleMute}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                isMuted
                  ? "bg-primary-light text-primary"
                  : "hover:bg-surface text-primary"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isMuted ? "bg-primary text-inverse" : "bg-surface-elevated"
              )}>
                {isMuted ? (
                  <HiVolumeOff className="w-5 h-5" />
                ) : (
                  <HiVolumeUp className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{isMuted ? "Unmute Notifications" : "Mute Notifications"}</p>
                <p className="text-xs text-secondary">
                  {isMuted ? "Enable notifications" : "Disable notifications"}
                </p>
              </div>
            </button>

            {/* Mark as Read/Unread */}
            {hasUnread && onMarkAsRead && (
              <button
                onClick={handleMarkAsRead}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-surface text-primary text-left"
              >
                <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center">
                  <HiCheckCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Mark as Read</p>
                  <p className="text-xs text-secondary">Mark all messages as read</p>
                </div>
              </button>
            )}

            {!hasUnread && onMarkAsUnread && (
              <button
                onClick={handleMarkAsUnread}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-surface text-primary text-left"
              >
                <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center">
                  <HiXCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Mark as Unread</p>
                  <p className="text-xs text-secondary">Mark chat as unread</p>
                </div>
              </button>
            )}

            {/* Archive */}
            <button
              onClick={handleArchive}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-surface text-primary text-left"
            >
              <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center">
                <ArchiveIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{chat.isArchived ? "Unarchive Chat" : "Archive Chat"}</p>
                <p className="text-xs text-secondary">
                  {chat.isArchived ? "Show in main list" : "Hide from main list"}
                </p>
              </div>
            </button>

            {/* Export */}
            {onExport && (
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-surface text-primary text-left"
              >
                <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center">
                  <HiDownload className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Export Chat</p>
                  <p className="text-xs text-secondary">Download chat history</p>
                </div>
              </button>
            )}

            <div className="border-t border-border my-2" />

            {/* Clear Chat */}
            {onClearChat && (
              <>
                {!showClearConfirm ? (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-surface text-warning text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center">
                      <HiTrash className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Clear Chat</p>
                      <p className="text-xs text-secondary">Delete all messages</p>
                    </div>
                  </button>
                ) : (
                  <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                    <div className="flex items-start gap-3 mb-3">
                      <HiExclamationCircle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-warning mb-1">Clear all messages?</p>
                        <p className="text-xs text-secondary">This action cannot be undone</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => setShowClearConfirm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="flex-1"
                        onClick={handleClearChat}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Block */}
            <button
              onClick={handleBlock}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                isBlocked
                  ? "bg-error/10 text-error"
                  : "hover:bg-surface text-error"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isBlocked ? "bg-error text-inverse" : "bg-surface-elevated"
              )}>
                <HiBan className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{isBlocked ? "Unblock" : "Block"}</p>
                <p className="text-xs text-secondary">
                  {isBlocked
                    ? "Unblock and restore contact"
                    : "Block messages and calls"}
                </p>
              </div>
            </button>

            {/* Delete Chat */}
            {onDelete && (
              <>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-surface text-error text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center">
                      <HiTrash className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Delete Chat</p>
                      <p className="text-xs text-secondary">Permanently delete this chat</p>
                    </div>
                  </button>
                ) : (
                  <div className="p-4 bg-error/10 rounded-lg border border-error/20">
                    <div className="flex items-start gap-3 mb-3">
                      <HiExclamationCircle className="w-5 h-5 text-error mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-error mb-1">Delete this chat?</p>
                        <p className="text-xs text-secondary">This action cannot be undone. All messages will be permanently deleted.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="flex-1"
                        onClick={handleDelete}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="lg"
            className="w-full mt-4"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
}

