"use client";

import { IconButton } from "@/app/components/ui/icon-button";
import { Button } from "@/app/components/ui/button";
import { Avatar } from "@/app/components/ui/avatar";
import {
  MoreIcon,
  ArchiveIcon,
  PinIcon,
} from "@/app/components/ui/icons";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";
import { HiBan } from "react-icons/hi";
import { cn } from "@/app/lib/utils";
import type { Chat } from "@/app/store/types";

interface ChatActionsModalProps {
  chat: Chat | null;
  isOpen: boolean;
  onClose: () => void;
  onBlock: (chatId: string) => void;
  onMute: (chatId: string, muted: boolean) => void;
  onPin: (chatId: string, pinned: boolean) => void;
  onArchive: (chatId: string) => void;
}

export function ChatActionsModal({
  chat,
  isOpen,
  onClose,
  onBlock,
  onMute,
  onPin,
  onArchive,
}: ChatActionsModalProps) {
  if (!isOpen || !chat) return null;

  const isMuted = chat.isMuted || false;
  const isPinned = chat.isPinned;
  const isBlocked = chat.isBlocked || false;

  const handleMute = () => {
    onMute(chat.id, !isMuted);
    onClose();
  };

  const handlePin = () => {
    onPin(chat.id, !isPinned);
    onClose();
  };

  const handleBlock = () => {
    onBlock(chat.id);
    onClose();
  };

  const handleArchive = () => {
    onArchive(chat.id);
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

            <button
              onClick={handleArchive}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-surface text-primary text-left"
            >
              <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center">
                <ArchiveIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Archive Chat</p>
                <p className="text-xs text-secondary">Hide from main list</p>
              </div>
            </button>

            <div className="border-t border-border my-2" />

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

