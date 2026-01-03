import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, Contact } from "../types";

interface UserState {
  currentUser: User | null;
  contacts: Contact[];
  isAuthenticated: boolean;
}

const initialState: UserState = {
  currentUser: null,
  contacts: [
    { id: "1", name: "Alice Johnson", isUser: true, isOnline: true },
    { id: "2", name: "Bob Smith", isUser: true, isOnline: true },
    { id: "3", name: "Charlie Brown", isUser: true, isOnline: false },
    { id: "4", name: "Diana Prince", isUser: true, isOnline: true },
    { id: "5", name: "Eve Wilson", isUser: true, isOnline: false },
  ],
  isAuthenticated: typeof window !== "undefined" ? !!localStorage.getItem("auth_token") : false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = action.payload !== null;
    },
    updateCurrentUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    setContacts: (state, action: PayloadAction<Contact[]>) => {
      state.contacts = action.payload;
    },
    addContact: (state, action: PayloadAction<Contact>) => {
      state.contacts.push(action.payload);
    },
    updateContact: (state, action: PayloadAction<{ contactId: string; updates: Partial<Contact> }>) => {
      const index = state.contacts.findIndex((contact) => contact.id === action.payload.contactId);
      if (index !== -1) {
        state.contacts[index] = { ...state.contacts[index], ...action.payload.updates };
      }
    },
    deleteContact: (state, action: PayloadAction<string>) => {
      state.contacts = state.contacts.filter((contact) => contact.id !== action.payload);
    },
    login: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
      }
    },
  },
});

export const {
  setCurrentUser,
  updateCurrentUser,
  setContacts,
  addContact,
  updateContact,
  deleteContact,
  login,
  logout,
} = userSlice.actions;

// Selectors
export const selectCurrentUser = (state: { user: UserState }) => state.user.currentUser;
export const selectContacts = (state: { user: UserState }) => state.user.contacts;
export const selectIsAuthenticated = (state: { user: UserState }) => state.user.isAuthenticated;

export const selectContact = (contactId: string) => (state: { user: UserState }): Contact | null => {
  return state.user.contacts.find((contact) => contact.id === contactId) || null;
};

export const selectSearchContacts = (query: string) => (state: { user: UserState }): Contact[] => {
  const lowerQuery = query.toLowerCase();
  return state.user.contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(lowerQuery) ||
      contact.email?.toLowerCase().includes(lowerQuery) ||
      contact.phone?.includes(lowerQuery)
  );
};

export default userSlice.reducer;

