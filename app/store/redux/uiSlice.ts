import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UIState } from "../types";

const initialState: UIState = {
  showNewGroup: false,
  showNewChat: false,
  showSettings: false,
  showContacts: false,
  showProfile: false,
  sidebarOpen: true,
  theme: "system",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setShowNewGroup: (state, action: PayloadAction<boolean>) => {
      state.showNewGroup = action.payload;
    },
    setShowNewChat: (state, action: PayloadAction<boolean>) => {
      state.showNewChat = action.payload;
    },
    setShowSettings: (state, action: PayloadAction<boolean>) => {
      state.showSettings = action.payload;
    },
    setShowContacts: (state, action: PayloadAction<boolean>) => {
      state.showContacts = action.payload;
    },
    setShowProfile: (state, action: PayloadAction<boolean>) => {
      state.showProfile = action.payload;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    closeAllModals: (state) => {
      state.showNewGroup = false;
      state.showNewChat = false;
      state.showSettings = false;
      state.showContacts = false;
      state.showProfile = false;
    },
  },
});

export const {
  setShowNewGroup,
  setShowNewChat,
  setShowSettings,
  setShowContacts,
  setShowProfile,
  setSidebarOpen,
  setTheme,
  toggleSidebar,
  closeAllModals,
} = uiSlice.actions;

// Selectors
export const selectUIState = (state: { ui: UIState }) => state.ui;

export default uiSlice.reducer;

