/**
 * API Services Index
 * Central export for all API services
 */

export { authAPI } from "./auth-api";
export { usersAPI } from "./users-api";
export { chatsAPI } from "./chats-api";
export { messagesAPI } from "./messages-api";
export { filesAPI } from "./files-api";
export { websocketService } from "./websocket";

export type {
  SignupRequest,
  LoginRequest,
  AuthResponse,
} from "./auth-api";

export type {
  UpdateUserRequest,
} from "./users-api";

export type {
  CreateChatRequest,
  UpdateChatRequest,
  AddParticipantsRequest,
} from "./chats-api";

export type {
  SendMessageRequest,
  PaginationParams,
  PaginatedResponse,
  AddReactionRequest,
} from "./messages-api";

export type {
  UploadResponse,
} from "./files-api";

