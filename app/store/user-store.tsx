"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { User, Contact } from "./types";

interface UserStoreContextType {
  // State
  currentUser: User | null;
  contacts: Contact[];
  isAuthenticated: boolean;

  // Actions
  setCurrentUser: (user: User | null) => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  updateContact: (contactId: string, updates: Partial<Contact>) => void;
  deleteContact: (contactId: string) => void;
  login: (user: User) => void;
  logout: () => void;

  // Getters
  getContact: (contactId: string) => Contact | null;
  searchContacts: (query: string) => Contact[];
}

const UserStoreContext = createContext<UserStoreContextType | undefined>(undefined);

// Mock initial data
const initialContacts: Contact[] = [
  { id: "1", name: "Alice Johnson", isUser: true, isOnline: true },
  { id: "2", name: "Bob Smith", isUser: true, isOnline: true },
  { id: "3", name: "Charlie Brown", isUser: true, isOnline: false },
  { id: "4", name: "Diana Prince", isUser: true, isOnline: true },
  { id: "5", name: "Eve Wilson", isUser: true, isOnline: false },
];

export function UserStoreProvider({ children }: { children: React.ReactNode }) {
  // Initialize authentication state from localStorage if token exists
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if token exists in localStorage on initial load
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      return !!token;
    }
    return false;
  });

  const setCurrentUser = useCallback((user: User | null) => {
    setCurrentUserState(user);
    setIsAuthenticated(user !== null);
  }, []);

  const updateCurrentUser = useCallback((updates: Partial<User>) => {
    setCurrentUserState((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const addContact = useCallback((contact: Contact) => {
    setContacts((prev) => [...prev, contact]);
  }, []);

  const updateContact = useCallback((contactId: string, updates: Partial<Contact>) => {
    setContacts((prev) =>
      prev.map((contact) => (contact.id === contactId ? { ...contact, ...updates } : contact))
    );
  }, []);

  const deleteContact = useCallback((contactId: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
  }, []);

  const login = useCallback((user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    // Clear tokens from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
    }
  }, []);

  const getContact = useCallback(
    (contactId: string) => {
      return contacts.find((contact) => contact.id === contactId) || null;
    },
    [contacts]
  );

  const searchContacts = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(lowerQuery) ||
          contact.email?.toLowerCase().includes(lowerQuery) ||
          contact.phone?.includes(lowerQuery)
      );
    },
    [contacts]
  );

  const value = useMemo(
    () => ({
      currentUser,
      contacts,
      isAuthenticated,
      setCurrentUser,
      updateCurrentUser,
      setContacts,
      addContact,
      updateContact,
      deleteContact,
      login,
      logout,
      getContact,
      searchContacts,
    }),
    [
      currentUser,
      contacts,
      isAuthenticated,
      setCurrentUser,
      updateCurrentUser,
      addContact,
      updateContact,
      deleteContact,
      login,
      logout,
      getContact,
      searchContacts,
    ]
  );

  return (
    <UserStoreContext.Provider value={value}>{children}</UserStoreContext.Provider>
  );
}

export function useUserStore() {
  const context = useContext(UserStoreContext);
  if (context === undefined) {
    throw new Error("useUserStore must be used within a UserStoreProvider");
  }
  return context;
}

