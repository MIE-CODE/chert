"use client";

import { useState } from "react";
import { Avatar } from "@/app/components/ui/avatar";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { IconButton } from "@/app/components/ui/icon-button";
import { ArrowLeftIcon, PlusIcon, SearchIcon } from "@/app/components/ui/icons";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/lib/utils";
import { useChatStore } from "@/app/store";
import { useToast } from "@/app/components/ui/toast";

interface Contact {
  id: string;
  name: string;
  avatar?: string;
}

interface NewGroupProps {
  onBack?: () => void;
  onCreateGroup?: (group: {
    name: string;
    avatar?: string;
    members: string[];
  }) => void;
}

const mockContacts: Contact[] = [
  { id: "1", name: "Alice Johnson" },
  { id: "2", name: "Bob Smith" },
  { id: "3", name: "Charlie Brown" },
  { id: "4", name: "Diana Prince" },
  { id: "5", name: "Eve Wilson" },
];

export function NewGroup({ onBack, onCreateGroup }: NewGroupProps) {
  const { addChat } = useChatStore();
  const toast = useToast();
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Ensure arrays are safe
  const safeSearchQuery = searchQuery || "";
  const safeMockContacts = Array.isArray(mockContacts) ? mockContacts : [];
  
  const filteredContacts = safeMockContacts.filter((contact) =>
    contact?.name?.toLowerCase().includes(safeSearchQuery.toLowerCase())
  );

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.includes(id) 
        ? safePrev.filter((m) => m !== id) 
        : [...safePrev, id];
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border-b border-border bg-surface-elevated shrink-0">
        <IconButton variant="ghost" size="md" onClick={onBack} className="shrink-0">
          <ArrowLeftIcon />
        </IconButton>
        <h1 className="text-lg md:text-xl font-bold text-primary">New Group</h1>
      </div>

      {/* Group Info */}
      <div className="p-3 md:p-4 border-b border-border bg-surface-elevated shrink-0">
        <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
          <div className="relative shrink-0">
            <Avatar name={groupName || "Group"} size="xl" />
            <button className="absolute bottom-0 right-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-inverse flex items-center justify-center hover:bg-primary-hover transition-colors touch-manipulation min-w-[44px] min-h-[44px]">
              <PlusIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="text-base"
            />
          </div>
        </div>

        {Array.isArray(selectedMembers) && selectedMembers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedMembers.map((id) => {
              const contact = safeMockContacts.find((c) => c?.id === id);
              return (
                <Badge
                  key={id}
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <span className="text-xs md:text-sm">{contact?.name}</span>
                  <button
                    onClick={() => toggleMember(id)}
                    className="ml-1 hover:opacity-70 min-w-[20px] min-h-[20px] flex items-center justify-center"
                  >
                    ×
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="p-3 md:p-4 border-b border-border bg-surface-elevated shrink-0">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tertiary w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            placeholder="Search contacts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 md:pl-10 pr-4 py-2.5 text-sm md:text-base rounded-lg border border-border bg-surface text-primary placeholder:text-tertiary focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => toggleMember(contact.id)}
            className={cn(
              "flex items-center gap-2 md:gap-3 p-2.5 md:p-3 cursor-pointer hover:bg-surface active:bg-surface transition-colors touch-manipulation",
              selectedMembers.includes(contact.id) && "bg-primary-light"
            )}
          >
            <Avatar
              src={contact.avatar}
              name={contact.name}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-primary text-sm md:text-base truncate">{contact.name}</h3>
            </div>
            {selectedMembers.includes(contact.id) && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-inverse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Button */}
      <div className="p-3 md:p-4 border-t border-border bg-surface-elevated shrink-0 safe-area-bottom">
        <Button
          variant="primary"
          size="lg"
          className="w-full min-h-[44px]"
          disabled={!groupName || !Array.isArray(selectedMembers) || selectedMembers.length < 2}
          onClick={async () => {
            if (groupName && Array.isArray(selectedMembers) && selectedMembers.length >= 2) {
              try {
                const { chatsAPI } = await import("@/app/services/api");
                const chat = await chatsAPI.createChat({
                  participantIds: selectedMembers,
                  isGroup: true,
                  name: groupName,
                });
                // Add chat to store
                addChat(chat);
                onCreateGroup?.({
                  name: groupName,
                  members: selectedMembers,
                });
                toast.success("Group created successfully!");
                onBack?.();
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Failed to create group";
                toast.error(errorMessage);
                // Still call onCreateGroup for UI update even if API fails
                onCreateGroup?.({
                  name: groupName,
                  members: selectedMembers,
                });
              }
            }
          }}
        >
          Create Group ({selectedMembers.length})
        </Button>
      </div>
    </div>
  );
}

