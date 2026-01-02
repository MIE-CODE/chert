"use client";

import { Avatar } from "@/app/components/ui/avatar";
import { IconButton } from "@/app/components/ui/icon-button";
import { ArrowLeftIcon, PhoneIcon, VideoIcon, MoreIcon } from "@/app/components/ui/icons";
import { MessageBubble } from "../chat/message-bubble";
import { MessageInput } from "../chat/message-input";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/lib/utils";
import { useMessages, useDragDrop } from "@/app/hooks";

interface GroupChatProps {
  groupId: string;
  groupName: string;
  groupAvatar?: string;
  members: Array<{ id: string; name: string; avatar?: string; isAdmin?: boolean }>;
  onBack?: () => void;
}

export function GroupChat({
  groupId,
  groupName,
  groupAvatar,
  members,
  onBack,
  onChatDrop,
}: GroupChatProps & { onChatDrop?: (chat: any) => void }) {
  const currentUserId = "me";
  const { messages, sendMessage } = useMessages({ chatId: groupId, currentUserId });
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
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface-elevated w-full ">
        <div className="flex items-center gap-3">
          {onBack && (
            <IconButton variant="ghost" size="md" onClick={onBack}>
              <ArrowLeftIcon />
            </IconButton>
          )}
          <Avatar
            src={groupAvatar}
            name={groupName}
            size="md"
          />
          <div>
            <h2 className="font-semibold text-primary">{groupName}</h2>
            <p className="text-xs text-secondary">
              {members.length} members
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
          <IconButton variant="ghost" size="md" title="Group info">
            <MoreIcon />
          </IconButton>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            currentUserId={currentUserId}
            showAvatar={true}
          />
        ))}
      </div>

      {/* Input */}
      <MessageInput onSend={sendMessage} />
    </div>
  );
}

