import { Server as HttpServer } from "http";

import { Server as SocketIOServer, Socket } from "socket.io";

import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  MessageWithSender,
  generateConversationId,
} from "../types/socket";
import { logger } from "../utils/logger";

/**
 * SocketService manages Socket.io connections, rooms, and event emission.
 * Follows Singleton pattern to ensure single instance across the application.
 */
export class SocketService {
  private static instance: SocketService | null = null;
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;
  
  /** Map of userId to socketId for presence tracking */
  private userSocketMap = new Map<string, string>();
  
  /** Map of socketId to userId for cleanup */
  private socketUserMap = new Map<string, string>();

  private constructor() {}

  /**
   * Get the singleton instance of SocketService
   */
  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  /**
   * Initialize the Socket.io server
   */
  initialize(httpServer: HttpServer, corsOrigin: string | string[]): void {
    if (this.io) {
      logger.warn("[SocketService] Already initialized");
      return;
    }

    this.io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
      httpServer,
      {
        cors: {
          origin: corsOrigin,
          credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
      }
    );

    logger.info("[SocketService] Socket.io server initialized");
  }

  /**
   * Get the Socket.io server instance
   */
  getIO(): SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
    if (!this.io) {
      throw new Error("SocketService not initialized. Call initialize() first.");
    }
    return this.io;
  }

  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return this.io !== null;
  }

  /**
   * Register a user's socket connection
   */
  registerUser(userId: string, socketId: string): void {
    // Remove old socket mapping if exists
    const oldSocketId = this.userSocketMap.get(userId);
    if (oldSocketId && oldSocketId !== socketId) {
      this.socketUserMap.delete(oldSocketId);
    }

    this.userSocketMap.set(userId, socketId);
    this.socketUserMap.set(socketId, userId);

    logger.debug(`[SocketService] User ${userId} registered with socket ${socketId}`);
  }

  /**
   * Unregister a user's socket connection
   */
  unregisterSocket(socketId: string): string | null {
    const userId = this.socketUserMap.get(socketId);
    if (userId) {
      this.socketUserMap.delete(socketId);
      
      // Only remove from userSocketMap if this is the current socket for the user
      const currentSocketId = this.userSocketMap.get(userId);
      if (currentSocketId === socketId) {
        this.userSocketMap.delete(userId);
        logger.debug(`[SocketService] User ${userId} unregistered`);
      }
      return userId;
    }
    return null;
  }

  /**
   * Check if a user is online
   */
  isUserOnline(userId: string): boolean {
    return this.userSocketMap.has(userId);
  }

  /**
   * Get socket ID for a user
   */
  getSocketId(userId: string): string | undefined {
    return this.userSocketMap.get(userId);
  }

  /**
   * Emit a message to a specific user
   */
  emitToUser(userId: string, event: keyof ServerToClientEvents, data: unknown): boolean {
    const socketId = this.userSocketMap.get(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit(event, data as never);
      logger.debug(`[SocketService] Emitted ${event} to user ${userId}`);
      return true;
    }
    logger.debug(`[SocketService] User ${userId} not online, ${event} not emitted`);
    return false;
  }

  /**
   * Emit a message to a conversation room
   */
  emitToConversation(
    conversationId: string, 
    event: keyof ServerToClientEvents, 
    data: unknown,
    excludeSocketId?: string
  ): void {
    if (!this.io) return;

    const room = this.io.to(`conversation:${conversationId}`);
    if (excludeSocketId) {
      room.except(excludeSocketId).emit(event, data as never);
    } else {
      room.emit(event, data as never);
    }
    logger.debug(`[SocketService] Emitted ${event} to conversation ${conversationId}`);
  }

  /**
   * Make a socket join a conversation room
   */
  joinConversation(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>, 
    conversationId: string): void {
    const roomName = `conversation:${conversationId}`;
    socket.join(roomName);
    logger.debug(`[SocketService] Socket ${socket.id} joined room ${roomName}`);
  }

  /**
   * Make a socket leave a conversation room
   */
  leaveConversation(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>, 
    conversationId: string): void {
    const roomName = `conversation:${conversationId}`;
    socket.leave(roomName);
    logger.debug(`[SocketService] Socket ${socket.id} left room ${roomName}`);
  }

  /**
   * Emit new message to recipient
   */
  emitNewMessage(message: MessageWithSender): void {
    const conversationId = generateConversationId(
      message.senderId,
      message.recipientId,
      message.listingId || undefined
    );

    const payload = {
      message,
      conversationId,
    };

    // Emit to the conversation room (for users actively in the chat)
    this.emitToConversation(conversationId, "message:received", payload);

    // Also emit directly to recipient if they're online but not in the room
    this.emitToUser(message.recipientId, "message:received", payload);

    // Update unread count for recipient
    this.emitUnreadCountUpdate(message.recipientId, 1);
  }

  /**
   * Emit message status update
   */
  emitMessageStatus(
    recipientId: string,
    messageId: string,
    status: "delivered" | "read"
  ): void {
    this.emitToUser(recipientId, "message:status_update", {
      messageId,
      status,
      timestamp: new Date(),
    });
  }

  /**
   * Emit unread count update to a user
   */
  emitUnreadCountUpdate(userId: string, increment?: number, totalCount?: number): void {
    const payload = increment !== undefined 
      ? { count: totalCount ?? 0, increment }
      : { count: totalCount ?? 0 };
    
    this.emitToUser(userId, "unread_count:update", payload);
  }

  /**
   * Emit user presence status to all connected sockets
   */
  broadcastUserPresence(userId: string, status: "online" | "offline"): void {
    if (!this.io) return;

    this.io.emit("user:presence", {
      userId,
      status,
      lastSeen: status === "offline" ? new Date() : undefined,
    });
  }

  /**
   * Get online user count
   */
  getOnlineUserCount(): number {
    return this.userSocketMap.size;
  }

  /**
   * Clean up on server shutdown
   */
  cleanup(): void {
    if (this.io) {
      this.io.close();
      this.io = null;
    }
    this.userSocketMap.clear();
    this.socketUserMap.clear();
    SocketService.instance = null;
    logger.info("[SocketService] Cleaned up");
  }
}

// Export singleton instance
export const socketService = SocketService.getInstance();
