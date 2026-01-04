"use client";

import { Avatar } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { IconButton } from "@/app/components/ui/icon-button";
import { ArrowLeftIcon } from "@/app/components/ui/icons";
import { HiPhone, HiVideoCamera, HiMail, HiUser, HiUserGroup, HiCalendar, HiChat } from "react-icons/hi";
import { cn } from "@/app/lib/utils";
import type { Chat, User } from "@/app/store/types";

interface ChatInfoModalProps {
  chat: Chat | null;
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
}

export function ChatInfoModal({
  chat,
  currentUser,
  isOpen,
  onClose,
  onVoiceCall,
  onVideoCall,
}: ChatInfoModalProps) {
  if (!isOpen || !chat) return null;

  // Get the other participant for individual chats
  const otherParticipant = chat.type === "individual" && currentUser
    ? chat.participants.find((p) => p.id !== currentUser.id) || chat.participants[0]
    : null;

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto md:w-96 z-50 bg-surface-elevated shadow-xl animate-slide-up md:animate-slide-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border flex-shrink-0">
            <IconButton variant="ghost" size="md" onClick={onClose}>
              <ArrowLeftIcon />
            </IconButton>
            <h2 className="text-lg font-semibold text-primary">Chat Info</h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Profile Section */}
            <div className="p-6 text-center border-b border-border">
              <Avatar
                src={chat.avatar || otherParticipant?.avatar}
                name={chat.name}
                size="xl"
                online={chat.type === "individual" ? chat.isOnline : undefined}
                className="mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-primary mb-1">{chat.name}</h3>
              {chat.type === "individual" && (
                <p className="text-sm text-secondary">
                  {chat.isOnline ? "Online" : "Offline"}
                </p>
              )}
              {chat.type === "group" && chat.memberCount && (
                <p className="text-sm text-secondary">
                  {chat.memberCount} {chat.memberCount === 1 ? "member" : "members"}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            {chat.type === "individual" && (
              <div className="p-4 border-b border-border flex gap-2">
                {onVoiceCall && (
                  <Button
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                    onClick={() => {
                      onVoiceCall();
                      onClose();
                    }}
                  >
                    <HiPhone className="w-5 h-5 mr-2" />
                    Call
                  </Button>
                )}
                {onVideoCall && (
                  <Button
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                    onClick={() => {
                      onVideoCall();
                      onClose();
                    }}
                  >
                    <HiVideoCamera className="w-5 h-5 mr-2" />
                    Video
                  </Button>
                )}
              </div>
            )}

            {/* User Info (Individual Chat) */}
            {chat.type === "individual" && otherParticipant && (
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-secondary uppercase mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    {otherParticipant.phone && (
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors">
                        <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center">
                          <HiPhone className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-secondary mb-0.5">Phone</p>
                          <p className="text-sm font-medium text-primary truncate">{otherParticipant.phone}</p>
                        </div>
                      </div>
                    )}
                    {otherParticipant.email && (
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors">
                        <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center">
                          <HiMail className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-secondary mb-0.5">Email</p>
                          <p className="text-sm font-medium text-primary truncate">{otherParticipant.email}</p>
                        </div>
                      </div>
                    )}
                    {otherParticipant.username && (
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors">
                        <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center">
                          <HiUser className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-secondary mb-0.5">Username</p>
                          <p className="text-sm font-medium text-primary truncate">@{otherParticipant.username}</p>
                        </div>
                      </div>
                    )}
                    {otherParticipant.status && (
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors">
                        <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center">
                          <HiChat className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-secondary mb-0.5">Status</p>
                          <p className="text-sm font-medium text-primary">{otherParticipant.status}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Group Info */}
            {chat.type === "group" && (
              <div className="p-4 space-y-4">
                {chat.members && chat.members.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-secondary uppercase mb-3">
                      Members ({chat.members.length})
                    </h4>
                    <div className="space-y-2">
                      {chat.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors"
                        >
                          <Avatar
                            src={member.avatar}
                            name={member.name}
                            size="md"
                            online={member.isOnline}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-primary truncate">
                              {member.name}
                              {member.isAdmin && (
                                <span className="ml-2 text-xs text-secondary">(Admin)</span>
                              )}
                            </p>
                            <p className="text-xs text-secondary">
                              {member.isOnline ? "Online" : "Offline"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chat Details */}
            <div className="p-4 border-t border-border">
              <h4 className="text-sm font-medium text-secondary uppercase mb-3">Chat Details</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors">
                  <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center">
                    <HiCalendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-secondary mb-0.5">Created</p>
                    <p className="text-sm font-medium text-primary">
                      {formatDate(chat.createdAt)}
                    </p>
                  </div>
                </div>
                {chat.lastMessage && (
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors">
                    <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center">
                      <HiChat className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-secondary mb-0.5">Last Message</p>
                      <p className="text-sm font-medium text-primary truncate">{chat.lastMessage}</p>
                    </div>
                  </div>
                )}
                {chat.unreadCount > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors">
                    <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center">
                      <HiChat className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-secondary mb-0.5">Unread Messages</p>
                      <p className="text-sm font-medium text-primary">{chat.unreadCount}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

