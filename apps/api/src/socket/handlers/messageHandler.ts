import { prisma } from "@kaarplus/database";
import { Socket } from "socket.io";

import { messageService } from "../../services/messageService";
import { socketService } from "../../services/socketService";
import {
  ClientToServerEvents,
  MessageSendCallback,
  MessageWithSender,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "../../types/socket";
import { logger } from "../../utils/logger";

/**
 * Handle message:send event
 */
export async function handleSendMessage(
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  payload: {
    recipientId: string;
    listingId?: string;
    subject?: string;
    body: string;
    tempId?: string;
  },
  callback: MessageSendCallback
): Promise<void> {
  const { userId } = socket.data;

  try {
    // Validate input
    if (!payload.recipientId) {
      callback({ success: false, error: "recipientId is required", tempId: payload.tempId });
      return;
    }

    if (!payload.body || payload.body.trim().length === 0) {
      callback({ success: false, error: "Message body is required", tempId: payload.tempId });
      return;
    }

    if (payload.body.length > 10000) {
      callback({ success: false, error: "Message body cannot exceed 10000 characters", tempId: payload.tempId });
      return;
    }

    // Create message in database
    const message = await messageService.sendMessage(userId, {
      recipientId: payload.recipientId,
      listingId: payload.listingId,
      subject: payload.subject,
      body: payload.body.trim(),
    });

    // Emit to recipient in real-time
    socketService.emitNewMessage(message as unknown as {
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
      sender: { id: string; name: string | null; image: string | null };
    });

    // Mark as delivered immediately if recipient is online
    if (socketService.isUserOnline(payload.recipientId)) {
      socketService.emitMessageStatus(message.senderId, message.id, "delivered");
    }

    // Send success response to sender
    callback({ success: true, message: message as unknown as MessageWithSender, tempId: payload.tempId });

    logger.debug(`[SocketHandler] Message sent from ${userId} to ${payload.recipientId}`);
  } catch (error) {
    logger.error(`[SocketHandler] Error sending message:`, error);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to send message";
    callback({ success: false, error: errorMessage, tempId: payload.tempId });
  }
}

/**
 * Handle messages:mark_read event
 */
export async function handleMarkMessagesRead(
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  payload: {
    conversationId: string;
    senderId: string;
    listingId?: string;
  }
): Promise<void> {
  const { userId } = socket.data;

  try {
    // Update messages as read in database
    await prisma.message.updateMany({
      where: {
        recipientId: userId,
        senderId: payload.senderId,
        ...(payload.listingId ? { listingId: payload.listingId } : {}),
        read: false,
      },
      data: { read: true },
    });

    // Get updated unread count
    const unreadCount = await messageService.getUnreadCount(userId);

    // Emit unread count update to current user
    socketService.emitToUser(userId, "unread_count:update", { count: unreadCount });

    // Notify sender that their messages were read
    socketService.emitToUser(payload.senderId, "messages:read", {
      readerId: userId,
      conversationId: payload.conversationId,
      readAt: new Date(),
    });

    logger.debug(`[SocketHandler] Messages marked as read by ${userId} from ${payload.senderId}`);
  } catch (error) {
    logger.error(`[SocketHandler] Error marking messages as read:`, error);
    socket.emit("error", {
      code: "MARK_READ_ERROR",
      message: "Failed to mark messages as read",
      event: "messages:mark_read",
    });
  }
}

/**
 * Handle conversation:join event
 */
export function handleJoinConversation(
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  payload: {
    conversationId: string;
    otherUserId: string;
    listingId?: string;
  }
): void {
  const { userId } = socket.data;

  try {
    // Join the conversation room
    socketService.joinConversation(socket, payload.conversationId);

    // Mark messages as read since user is now viewing the conversation
    handleMarkMessagesRead(socket, {
      conversationId: payload.conversationId,
      senderId: payload.otherUserId,
      listingId: payload.listingId,
    }).catch((err) => {
      logger.error(`[SocketHandler] Error auto-marking messages as read on join:`, err);
    });

    logger.debug(`[SocketHandler] User ${userId} joined conversation ${payload.conversationId}`);
  } catch (error) {
    logger.error(`[SocketHandler] Error joining conversation:`, error);
    socket.emit("error", {
      code: "JOIN_CONVERSATION_ERROR",
      message: "Failed to join conversation",
      event: "conversation:join",
    });
  }
}

/**
 * Handle conversation:leave event
 */
export function handleLeaveConversation(
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  payload: {
    conversationId: string;
  }
): void {
  const { userId } = socket.data;

  try {
    socketService.leaveConversation(socket, payload.conversationId);
    logger.debug(`[SocketHandler] User ${userId} left conversation ${payload.conversationId}`);
  } catch (error) {
    logger.error(`[SocketHandler] Error leaving conversation:`, error);
  }
}

/**
 * Handle typing indicators
 */
export function handleTypingStart(
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  payload: { conversationId: string; userId: string }
): void {
  // Broadcast typing status to conversation room (except sender)
  socket.to(`conversation:${payload.conversationId}`).emit("typing:start", {
    conversationId: payload.conversationId,
    userId: socket.data.userId,
  });
}

export function handleTypingStop(
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  payload: { conversationId: string; userId: string }
): void {
  // Broadcast typing stop to conversation room (except sender)
  socket.to(`conversation:${payload.conversationId}`).emit("typing:stop", {
    conversationId: payload.conversationId,
    userId: socket.data.userId,
  });
}
