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

  const filteredContacts = mockContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background w-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-surface-elevated">
        <IconButton variant="ghost" size="md" onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <h1 className="text-xl font-bold text-primary">New Group</h1>
      </div>

      {/* Group Info */}
      <div className="p-4 border-b border-border bg-surface-elevated">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <Avatar name={groupName || "Group"} size="xl" />
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-inverse flex items-center justify-center hover:bg-primary-hover transition-colors">
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1">
            <Input
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
        </div>

        {selectedMembers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedMembers.map((id) => {
              const contact = mockContacts.find((c) => c.id === id);
              return (
                <Badge
                  key={id}
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  {contact?.name}
                  <button
                    onClick={() => toggleMember(id)}
                    className="ml-1 hover:opacity-70"
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
      <div className="p-4 border-b border-border bg-surface-elevated">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tertiary w-5 h-5" />
          <input
            type="text"
            placeholder="Search contacts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface text-primary placeholder:text-tertiary focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => toggleMember(contact.id)}
            className={cn(
              "flex items-center gap-3 p-3 cursor-pointer hover:bg-surface transition-colors",
              selectedMembers.includes(contact.id) && "bg-primary-light"
            )}
          >
            <Avatar
              src={contact.avatar}
              name={contact.name}
              size="md"
            />
            <div className="flex-1">
              <h3 className="font-medium text-primary">{contact.name}</h3>
            </div>
            {selectedMembers.includes(contact.id) && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <svg className="w-3 h-3 text-inverse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Button */}
      <div className="p-4 border-t border-border bg-surface-elevated">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!groupName || selectedMembers.length < 2}
          onClick={async () => {
            if (groupName && selectedMembers.length >= 2) {
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

