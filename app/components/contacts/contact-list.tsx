"use client";

import { useState } from "react";
import { Avatar } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { SearchIcon, PlusIcon } from "@/app/components/ui/icons";
import { IconButton } from "@/app/components/ui/icon-button";
import { cn } from "@/app/lib/utils";

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  isOnline?: boolean;
  isUser?: boolean;
}

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Alice Johnson",
    phone: "+1 (555) 123-4567",
    isOnline: true,
    isUser: true,
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    isOnline: false,
    isUser: true,
  },
  {
    id: "3",
    name: "Charlie Brown",
    phone: "+1 (555) 987-6543",
    isOnline: true,
    isUser: false,
  },
  {
    id: "4",
    name: "Diana Prince",
    email: "diana@example.com",
    isOnline: true,
    isUser: true,
  },
];

export function ContactList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const filteredContacts = mockContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    const firstLetter = contact.name[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(contact);
    return acc;
  }, {} as Record<string, Contact[]>);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface-elevated">
        <h1 className="text-xl font-bold text-primary">Contacts</h1>
        <IconButton variant="ghost" size="md" title="New contact">
          <PlusIcon />
        </IconButton>
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
        {Object.keys(groupedContacts).sort().map((letter) => (
          <div key={letter} className="px-4 py-2">
            <div className="text-xs font-semibold text-secondary uppercase mb-2 sticky top-0 bg-background py-1">
              {letter}
            </div>
            {groupedContacts[letter].map((contact) => (
              <ContactItem
                key={contact.id}
                contact={contact}
                isSelected={selectedContact === contact.id}
                onClick={() => setSelectedContact(contact.id)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactItem({
  contact,
  isSelected,
  onClick,
}: {
  contact: Contact;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-surface",
        isSelected && "bg-primary-light"
      )}
    >
      <Avatar
        src={contact.avatar}
        name={contact.name}
        size="md"
        online={contact.isOnline}
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-primary">{contact.name}</h3>
        <p className="text-sm text-secondary truncate">
          {contact.phone || contact.email}
        </p>
      </div>
      {!contact.isUser && (
        <Button variant="secondary" size="sm" onClick={(e) => {
          e.stopPropagation();
          // Handle invite
        }}>
          Invite
        </Button>
      )}
    </div>
  );
}

