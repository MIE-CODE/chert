# Backend Requirements for Read/Unread Messages

## Overview
This document outlines what the backend API needs to provide for the read/unread message functionality to work correctly.

## API Endpoints

### 1. Mark Messages as Read
**Endpoint:** `POST /api/messages/:chatId/read`

**Request Body:**
```json
{
  "messageIds": ["messageId1", "messageId2"] // Optional: if empty or omitted, mark all messages in chat as read
}
```

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

**Expected Behavior:**
- If `messageIds` is provided and not empty, mark only those specific messages as read
- If `messageIds` is empty or omitted, mark ALL unread messages in the chat as read
- Update the `readBy` array for each message to include the current user's ID
- Set `isRead: true` for messages that the current user has read
- Emit WebSocket event `messages_read` to notify other participants

---

### 2. Get Chat Messages
**Endpoint:** `GET /api/messages/chat/:chatId`

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "messageId",
        "chatId": "chatId",
        "senderId": "userId",
        "content": "Message text",
        "readBy": ["userId1", "userId2"], // Array of user IDs who have read this message
        "isRead": true, // Computed: true if current user's ID is in readBy array
        "createdAt": "2024-01-01T00:00:00.000Z",
        "status": "sent" | "delivered" | "read"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "pages": 2
    }
  }
}
```

**Expected Behavior:**
- Include `readBy` array in each message object
- Include `isRead` boolean (computed based on whether current user's ID is in `readBy`)
- Messages should reflect the current read status

---

## WebSocket Events

### 1. Client → Server: Mark Messages as Read
**Event:** `read_message`

**Payload:**
```json
{
  "chatId": "chatId",
  "messageIds": ["messageId1", "messageId2"] // Optional: if empty or omitted, mark all as read
}
```

**Expected Behavior:**
- Mark the specified messages (or all messages if `messageIds` is empty) as read for the current user
- Update `readBy` array for each message
- Emit `messages_read` event to all participants in the chat

---

### 2. Server → Client: Messages Read Notification
**Event:** `messages_read`

**Payload:**
```json
{
  "chatId": "chatId",
  "userId": "userId", // User who read the messages
  "username": "username", // Username of the user who read
  "messageIds": ["messageId1", "messageId2"] // Optional: specific message IDs that were read
}
```

**Expected Behavior:**
- Emit this event to all participants in the chat when messages are marked as read
- If `messageIds` is provided, only those messages were read
- If `messageIds` is empty or omitted, all messages in the chat were read

---

## Message Object Structure

Each message object should include:

```typescript
{
  _id: string; // Message ID
  chatId: string; // Chat ID
  senderId: string; // User ID of sender
  content: string; // Message content
  readBy: string[]; // Array of user IDs who have read this message
  isRead?: boolean; // Computed: true if current user's ID is in readBy (optional, can be computed client-side)
  status: "sent" | "delivered" | "read"; // Message status
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
```

---

## Chat Object Structure

Each chat object should include:

```typescript
{
  _id: string; // Chat ID
  unreadCount: number; // Number of unread messages for current user
  lastMessage: {
    _id: string;
    content: string;
    readBy: string[];
    // ... other message fields
  };
  // ... other chat fields
}
```

**Expected Behavior:**
- `unreadCount` should be the count of messages where:
  - `senderId !== currentUserId` (not sent by current user)
  - `currentUserId` is NOT in `readBy` array
- Update `unreadCount` when messages are marked as read
- Update `unreadCount` when new messages arrive

---

## Implementation Notes

1. **Read Status Calculation:**
   - A message is considered "read" by a user if that user's ID is in the `readBy` array
   - The backend should compute `isRead` based on the current user's ID and the `readBy` array

2. **Unread Count:**
   - Should be calculated server-side based on messages where:
     - Message sender is not the current user
     - Current user's ID is not in the message's `readBy` array

3. **Real-time Updates:**
   - When messages are marked as read via API, emit `messages_read` WebSocket event
   - When messages are marked as read via WebSocket, also emit `messages_read` event
   - All participants in the chat should receive the `messages_read` event

4. **Performance:**
   - Consider batching read updates for better performance
   - Update `unreadCount` efficiently when marking messages as read

---

## Current Frontend Implementation

The frontend currently:
- Calls `POST /api/messages/:chatId/read` with `messageIds` array when a chat is opened
- Listens for `messages_read` WebSocket events to update read status in real-time
- Updates `unreadCount` when messages are marked as read
- Marks messages as read automatically when a chat is opened

---

## Testing Checklist

- [ ] Mark specific messages as read via API
- [ ] Mark all messages as read via API (empty messageIds)
- [ ] Mark messages as read via WebSocket
- [ ] Receive `messages_read` event when other users read messages
- [ ] `unreadCount` updates correctly when messages are read
- [ ] `readBy` array is updated correctly
- [ ] `isRead` flag is computed correctly based on current user
- [ ] Read status persists across page refreshes

