# API Integration Guide

## Overview
The application has been fully integrated with the Chert API endpoints using axios for HTTP requests and Socket.IO for real-time WebSocket communication.

## Installation

Install required dependencies:
```bash
yarn add axios socket.io-client
```

## Environment Variables

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

## API Client Architecture

### 1. API Client (`app/lib/api-client.ts`)
- Centralized axios instance
- Automatic token injection via interceptors
- Automatic token refresh on 401 errors
- Token storage in localStorage

### 2. API Services (`app/services/api/`)
- **auth-api.ts**: Authentication endpoints
- **users-api.ts**: User management endpoints
- **chats-api.ts**: Chat CRUD operations
- **messages-api.ts**: Message operations with pagination
- **files-api.ts**: File upload handling
- **websocket.ts**: Socket.IO real-time communication

### 3. Updated Business Logic Services
- **auth-service.ts**: Now uses real API calls
- **message-service.ts**: Added normalization for API responses

### 4. Updated Hooks
- **use-messages.ts**: Loads from API, uses WebSocket for real-time
- **use-auth.ts**: Integrated with API authentication
- **use-websocket.ts**: Manages WebSocket connection lifecycle

## Key Features

### Authentication Flow
1. User logs in → Gets JWT token and refresh token
2. Tokens stored in localStorage
3. Token automatically added to all API requests
4. Token refresh on 401 errors
5. WebSocket connects with token on login

### Real-time Features
- Messages sent/received via WebSocket
- Typing indicators
- Online/offline status
- Read receipts
- Presence updates

### Data Flow
1. **Initial Load**: Chats and messages loaded from API
2. **Real-time Updates**: WebSocket events update UI
3. **Fallback**: If API fails, falls back to local store
4. **Optimistic Updates**: UI updates immediately, syncs with server

## API Response Handling

The services handle multiple response formats:
- `{ data: { chats: [] } }` or `{ data: [] }`
- `{ data: { message: {} } }` or `{ data: {} }`
- `{ data: { messages: [] } }` or `{ data: { items: [] } }`

## Message Format

Messages support both `text` and `content` fields for API compatibility:
- API uses `content`
- UI uses `text`
- Normalization happens automatically

## WebSocket Events

### Client → Server
- `join_chat` - Join a chat room
- `send_message` - Send a message
- `typing` / `stop_typing` - Typing indicators
- `read_message` - Mark as read

### Server → Client
- `new_message` - Receive new message
- `user_typing` - User is typing
- `user_online` / `user_offline` - Presence updates
- `messages_read` - Read receipts

## Usage Examples

### Sending a Message
```typescript
const { sendMessage } = useMessages({ chatId, currentUserId });
sendMessage("Hello!");
// Automatically sends via WebSocket and API
```

### Creating a Group
```typescript
const chat = await chatsAPI.createChat({
  participantIds: ["user1", "user2"],
  isGroup: true,
  name: "My Group",
});
```

### Uploading a File
```typescript
const file = event.target.files[0];
const uploadResult = await filesAPI.uploadFile(file);
// Then send message with fileUrl
```

## Error Handling

- API errors are caught and logged
- Fallback to local store if API unavailable
- User-friendly error messages
- Automatic retry on token refresh

## Next Steps

1. Install dependencies: `yarn install`
2. Set up environment variables
3. Start your API server
4. Test the integration

The app is now ready to connect to your backend API!

