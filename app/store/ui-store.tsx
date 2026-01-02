"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { UIState } from "./types";

interface UIStoreContextType {
  // State
  uiState: UIState;

  // Actions
  setShowNewGroup: (show: boolean) => void;
  setShowNewChat: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowContacts: (show: boolean) => void;
  setShowProfile: (show: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleSidebar: () => void;
  closeAllModals: () => void;
}

const UIStoreContext = createContext<UIStoreContextType | undefined>(undefined);

const initialUIState: UIState = {
  showNewGroup: false,
  showNewChat: false,
  showSettings: false,
  showContacts: false,
  showProfile: false,
  sidebarOpen: true,
  theme: "system",
};

export function UIStoreProvider({ children }: { children: React.ReactNode }) {
  const [uiState, setUIState] = useState<UIState>(initialUIState);

  // Apply theme based on system preference
  useEffect(() => {
    if (uiState.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        document.documentElement.classList.toggle("dark", mediaQuery.matches);
      };
      handleChange();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      document.documentElement.classList.toggle("dark", uiState.theme === "dark");
    }
  }, [uiState.theme]);

  const setShowNewGroup = useCallback((show: boolean) => {
    setUIState((prev) => ({ ...prev, showNewGroup: show }));
  }, []);

  const setShowNewChat = useCallback((show: boolean) => {
    setUIState((prev) => ({ ...prev, showNewChat: show }));
  }, []);

  const setShowSettings = useCallback((show: boolean) => {
    setUIState((prev) => ({ ...prev, showSettings: show }));
  }, []);

  const setShowContacts = useCallback((show: boolean) => {
    setUIState((prev) => ({ ...prev, showContacts: show }));
  }, []);

  const setShowProfile = useCallback((show: boolean) => {
    setUIState((prev) => ({ ...prev, showProfile: show }));
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setUIState((prev) => ({ ...prev, sidebarOpen: open }));
  }, []);

  const setTheme = useCallback((theme: "light" | "dark" | "system") => {
    setUIState((prev) => ({ ...prev, theme }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setUIState((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  const closeAllModals = useCallback(() => {
    setUIState((prev) => ({
      ...prev,
      showNewGroup: false,
      showNewChat: false,
      showSettings: false,
      showContacts: false,
      showProfile: false,
    }));
  }, []);

  const value = useMemo(
    () => ({
      uiState,
      setShowNewGroup,
      setShowNewChat,
      setShowSettings,
      setShowContacts,
      setShowProfile,
      setSidebarOpen,
      setTheme,
      toggleSidebar,
      closeAllModals,
    }),
    [
      uiState,
      setShowNewGroup,
      setShowNewChat,
      setShowSettings,
      setShowContacts,
      setShowProfile,
      setSidebarOpen,
      setTheme,
      toggleSidebar,
      closeAllModals,
    ]
  );

  return <UIStoreContext.Provider value={value}>{children}</UIStoreContext.Provider>;
}

export function useUIStore() {
  const context = useContext(UIStoreContext);
  if (context === undefined) {
    throw new Error("useUIStore must be used within a UIStoreProvider");
  }
  return context;
}

