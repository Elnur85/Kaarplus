/**
 * Socket.io event types and payload definitions for real-time messaging.
 * These types are shared between backend and frontend to ensure consistency.
 */

// Note: Message and User types from @kaarplus/database are intentionally not imported here;
// this file defines its own socket-specific payload types (MessageWithSender, MessageSender)
// to avoid coupling the socket layer directly to the Prisma schema.

// ============================================================================
// Socket Events - Server to Client
// ============================================================================

export interface ServerToClientEvents {
  /** New message received */
  "message:received": (payload: MessageReceivedPayload) => void;
  
  /** Message status updated (delivered/read) */
  "message:status_update": (payload: MessageStatusUpdatePayload) => void;
  
  /** Unread count updated */
  "unread_count:update": (payload: UnreadCountUpdatePayload) => void;
  
  /** User presence status changed */
  "user:presence": (payload: UserPresencePayload) => void;
  
  /** Messages marked as read by recipient */
  "messages:read": (payload: MessagesReadPayload) => void;
  
  /** Typing indicator - user started typing */
  "typing:start": (payload: { conversationId: string; userId: string }) => void;
  
  /** Typing indicator - user stopped typing */
  "typing:stop": (payload: { conversationId: string; userId: string }) => void;
  
  /** Ping/pong for connection health check */
  "pong": () => void;
  
  /** Error occurred */
  "error": (payload: SocketErrorPayload) => void;
}

// ============================================================================
// Socket Events - Client to Server
// ============================================================================

export interface ClientToServerEvents {
  /** Send a new message */
  "message:send": (payload: SendMessagePayload, callback: MessageSendCallback) => void;
  
  /** Mark messages as read */
  "messages:mark_read": (payload: MarkMessagesReadPayload) => void;
  
  /** Join a conversation room */
  "conversation:join": (payload: JoinConversationPayload) => void;
  
  /** Leave a conversation room */
  "conversation:leave": (payload: LeaveConversationPayload) => void;
  
  /** Update typing status */
  "typing:start": (payload: TypingPayload) => void;
  "typing:stop": (payload: TypingPayload) => void;
  
  /** Ping/pong for connection health check */
  "ping": () => void;
}

// ============================================================================
// Inter-Server Events (for Redis adapter or multi-server setup)
// ============================================================================

export interface InterServerEvents {
  ping: () => void;
}

// ============================================================================
// Socket Data (attached to socket instance)
// ============================================================================

export interface SocketData {
  userId: string;
  userEmail: string;
  userName: string | null;
}

// ============================================================================
// Payload Types
// ============================================================================

/** Message sender info (subset of User) */
export interface MessageSender {
  id: string;
  name: string | null;
  image: string | null;
}

/** Full message payload with sender info */
export interface MessageWithSender {
  id: string;
  senderId: string;
  recipientId: string;
  listingId: string | null;
  subject: string | null;
  body: string;
  read: boolean;
  delivered: boolean;
  createdAt: Date;
  updatedAt: Date;
  sender: MessageSender;
}

/** Payload for message:received event */
export interface MessageReceivedPayload {
  message: MessageWithSender;
  conversationId: string;
}

/** Message status (for status updates) */
export type MessageStatus = "sent" | "delivered" | "read";

/** Payload for message:status_update event */
export interface MessageStatusUpdatePayload {
  messageId: string;
  status: MessageStatus;
  timestamp: Date;
}

/** Payload for unread_count:update event */
export interface UnreadCountUpdatePayload {
  count: number;
  increment?: number; // Delta for real-time updates
}

/** Payload for user:presence event */
export interface UserPresencePayload {
  userId: string;
  status: "online" | "offline";
  lastSeen?: Date;
}

/** Payload for messages:read event */
export interface MessagesReadPayload {
  readerId: string;
  conversationId: string;
  readAt: Date;
  messageIds?: string[]; // Optional: specific messages that were read
}

/** Payload for error event */
export interface SocketErrorPayload {
  code: string;
  message: string;
  event?: string;
}

// ============================================================================
// Client to Server Payloads
// ============================================================================

/** Payload for sending a message */
export interface SendMessagePayload {
  recipientId: string;
  listingId?: string;
  subject?: string;
  body: string;
  tempId?: string; // Client-generated temp ID for optimistic UI
}

/** Callback response for message:send */
export interface MessageSendCallback {
  (response: {
    success: boolean;
    message?: MessageWithSender;
    error?: string;
    tempId?: string;
  }): void;
}

/** Payload for marking messages as read */
export interface MarkMessagesReadPayload {
  conversationId: string;
  senderId: string; // The other user in the conversation
  listingId?: string;
}

/** Payload for joining/leaving a conversation */
export interface JoinConversationPayload {
  conversationId: string;
  otherUserId: string;
  listingId?: string;
}

export interface LeaveConversationPayload {
  conversationId: string;
}

/** Payload for typing indicators */
export interface TypingPayload {
  conversationId: string;
  userId: string;
}

// ============================================================================
// Helper Types
// ============================================================================

/** Conversation ID format: "userId1-userId2:listingId" (userIds sorted, listingId optional) */
export type ConversationId = string;

/** Generate a consistent conversation ID from two user IDs and optional listing ID */
export function generateConversationId(
  userId1: string, 
  userId2: string, 
  listingId?: string
): ConversationId {
  const sortedIds = [userId1, userId2].sort();
  return `${sortedIds[0]}-${sortedIds[1]}:${listingId || "general"}`;
}

/** Parse a conversation ID into its components */
export function parseConversationId(conversationId: ConversationId): {
  userId1: string;
  userId2: string;
  listingId: string | null;
} {
  const [participants, listingPart] = conversationId.split(":");
  const [userId1, userId2] = participants.split("-");
  return {
    userId1,
    userId2,
    listingId: listingPart === "general" ? null : listingPart,
  };
}
