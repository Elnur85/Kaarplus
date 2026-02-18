import { Socket } from "socket.io";

import { messageService } from "../services/messageService";
import { socketService } from "../services/socketService";
import {
  ClientToServerEvents,
  MessageSendCallback,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "../types/socket";
import { logger } from "../utils/logger";

import {
  handleSendMessage,
  handleMarkMessagesRead,
  handleJoinConversation,
  handleLeaveConversation,
  handleTypingStart,
  handleTypingStop,
} from "./handlers/messageHandler";

/**
 * Handle new socket connections
 * Sets up event listeners and manages user presence
 */
export function handleSocketConnection(
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
): void {
  const { userId, userName } = socket.data;

  logger.info(`[Socket] User connected: ${userName || userId} (${socket.id})`);

  // Register user in socket service
  socketService.registerUser(userId, socket.id);

  // Broadcast user online status
  socketService.broadcastUserPresence(userId, "online");

  // Send initial unread count to user
  sendInitialUnreadCount(socket, userId);

  // Set up event listeners
  setupEventListeners(socket);

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    handleDisconnect(socket, reason);
  });

  // Handle errors
  socket.on("error", (error) => {
    logger.error(`[Socket] Error from ${userId} (${socket.id}):`, error);
  });
}

/**
 * Set up all event listeners for a socket
 */
function setupEventListeners(
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
): void {
  const { userId } = socket.data;

  // Message events
  socket.on("message:send", (payload, callback) => {
    handleSendMessage(socket, payload, callback as MessageSendCallback);
  });

  socket.on("messages:mark_read", (payload) => {
    handleMarkMessagesRead(socket, payload);
  });

  // Conversation room events
  socket.on("conversation:join", (payload) => {
    handleJoinConversation(socket, payload);
  });

  socket.on("conversation:leave", (payload) => {
    handleLeaveConversation(socket, payload);
  });

  // Typing indicators
  socket.on("typing:start", (payload) => {
    handleTypingStart(socket, payload);
  });

  socket.on("typing:stop", (payload) => {
    handleTypingStop(socket, payload);
  });

  // Ping/pong for connection health check
  socket.on("ping", () => {
    socket.emit("pong");
  });

  logger.debug(`[Socket] Event listeners set up for user ${userId}`);
}

/**
 * Send initial unread count to user on connection
 */
async function sendInitialUnreadCount(
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  userId: string
): Promise<void> {
  try {
    const count = await messageService.getUnreadCount(userId);
    socket.emit("unread_count:update", { count });
    logger.debug(`[Socket] Sent initial unread count (${count}) to user ${userId}`);
  } catch (error) {
    logger.error(`[Socket] Error sending initial unread count to ${userId}:`, error);
  }
}

/**
 * Handle socket disconnection
 */
function handleDisconnect(
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  reason: string
): void {
  const { userId, userName } = socket.data;

  logger.info(`[Socket] User disconnected: ${userName || userId} (${socket.id}), reason: ${reason}`);

  // Unregister user from socket service
  const unregisteredUserId = socketService.unregisterSocket(socket.id);

  // If user has no more active sockets, broadcast offline status
  if (unregisteredUserId && !socketService.isUserOnline(unregisteredUserId)) {
    socketService.broadcastUserPresence(unregisteredUserId, "offline");
  }
}
