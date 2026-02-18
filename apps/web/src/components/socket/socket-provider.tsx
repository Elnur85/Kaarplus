"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

// Types matching the backend socket types
interface MessageSender {
  id: string;
  name: string | null;
  image: string | null;
}

interface MessageWithSender {
  id: string;
  senderId: string;
  recipientId: string;
  listingId: string | null;
  subject: string | null;
  body: string;
  read: boolean;
  delivered: boolean;
  createdAt: string;
  updatedAt: string;
  sender: MessageSender;
}

interface MessageReceivedPayload {
  message: MessageWithSender;
  conversationId: string;
}

interface MessageStatusUpdatePayload {
  messageId: string;
  status: "sent" | "delivered" | "read";
  timestamp: string;
}

interface UnreadCountUpdatePayload {
  count: number;
  increment?: number;
}

interface MessagesReadPayload {
  readerId: string;
  conversationId: string;
  readAt: string;
  messageIds?: string[];
}

interface UserPresencePayload {
  userId: string;
  status: "online" | "offline";
  lastSeen?: string;
}

interface SocketErrorPayload {
  code: string;
  message: string;
  event?: string;
}

// Client to server events
interface ClientToServerEvents {
  "message:send": (
    payload: {
      recipientId: string;
      listingId?: string;
      subject?: string;
      body: string;
      tempId?: string;
    },
    callback: (response: {
      success: boolean;
      message?: MessageWithSender;
      error?: string;
      tempId?: string;
    }) => void
  ) => void;
  "messages:mark_read": (payload: {
    conversationId: string;
    senderId: string;
    listingId?: string;
  }) => void;
  "conversation:join": (payload: {
    conversationId: string;
    otherUserId: string;
    listingId?: string;
  }) => void;
  "conversation:leave": (payload: { conversationId: string }) => void;
  "typing:start": (payload: { conversationId: string; userId: string }) => void;
  "typing:stop": (payload: { conversationId: string; userId: string }) => void;
  ping: () => void;
}

// Server to client events
interface ServerToClientEvents {
  "message:received": (payload: MessageReceivedPayload) => void;
  "message:status_update": (payload: MessageStatusUpdatePayload) => void;
  "unread_count:update": (payload: UnreadCountUpdatePayload) => void;
  "user:presence": (payload: UserPresencePayload) => void;
  "messages:read": (payload: MessagesReadPayload) => void;
  "typing:start": (payload: { conversationId: string; userId: string }) => void;
  "typing:stop": (payload: { conversationId: string; userId: string }) => void;
  error: (payload: SocketErrorPayload) => void;
  pong: () => void;
}

// Context type
interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  isConnecting: boolean;
  unreadCount: number;
  onlineUsers: Set<string>;
  sendMessage: (
    recipientId: string,
    body: string,
    options?: { listingId?: string; subject?: string; tempId?: string }
  ) => Promise<{ success: boolean; message?: MessageWithSender; error?: string; tempId?: string }>;
  joinConversation: (conversationId: string, otherUserId: string, listingId?: string) => void;
  leaveConversation: (conversationId: string) => void;
  markMessagesAsRead: (conversationId: string, senderId: string, listingId?: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      return;
    }

    // Get token from session or cookie
    const token = (session as unknown as { accessToken?: string })?.accessToken;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsConnecting(true);

    // Create socket connection
    const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    setSocket(newSocket);

    // Connection event handlers
    newSocket.on("connect", () => {
      setIsConnected(true);
      setIsConnecting(false);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("connect_error", () => {
      setIsConnected(false);
      setIsConnecting(false);
    });

    // Message event handlers
    newSocket.on("message:received", () => {
      // Increment unread count for new messages not in current conversation
      setUnreadCount((prev) => prev + 1);
    });

    newSocket.on("message:status_update", () => {
      // Handle message status update
    });

    newSocket.on("unread_count:update", (payload) => {
      setUnreadCount(payload.count);
    });

    newSocket.on("messages:read", () => {
      // Handle messages read
    });

    newSocket.on("user:presence", (payload) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (payload.status === "online") {
          newSet.add(payload.userId);
        } else {
          newSet.delete(payload.userId);
        }
        return newSet;
      });
    });

    newSocket.on("error", (payload) => {
      console.error("[Socket] Error:", payload);
    });

    // Cleanup on unmount or session change
    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [session, status]);

  // Send message function
  const sendMessage = useCallback(
    (
      recipientId: string,
      body: string,
      options?: { listingId?: string; subject?: string; tempId?: string }
    ): Promise<{ success: boolean; message?: MessageWithSender; error?: string; tempId?: string }> => {
      return new Promise((resolve) => {
        if (!socket?.connected) {
          resolve({ success: false, error: "Not connected", tempId: options?.tempId });
          return;
        }

        socket.emit(
          "message:send",
          {
            recipientId,
            body,
            listingId: options?.listingId,
            subject: options?.subject,
            tempId: options?.tempId,
          },
          (response) => {
            resolve(response);
          }
        );
      });
    },
    [socket]
  );

  // Join conversation
  const joinConversation = useCallback(
    (conversationId: string, otherUserId: string, listingId?: string) => {
      socket?.emit("conversation:join", {
        conversationId,
        otherUserId,
        listingId,
      });
    },
    [socket]
  );

  // Leave conversation
  const leaveConversation = useCallback((conversationId: string) => {
    socket?.emit("conversation:leave", { conversationId });
  }, [socket]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(
    (conversationId: string, senderId: string, listingId?: string) => {
      socket?.emit("messages:mark_read", {
        conversationId,
        senderId,
        listingId,
      });
    },
    [socket]
  );

  // Typing indicators
  const startTyping = useCallback((conversationId: string) => {
    const userId = session?.user?.id;
    if (userId) {
      socket?.emit("typing:start", { conversationId, userId });
    }
  }, [session?.user?.id, socket]);

  const stopTyping = useCallback((conversationId: string) => {
    const userId = session?.user?.id;
    if (userId) {
      socket?.emit("typing:stop", { conversationId, userId });
    }
  }, [session?.user?.id, socket]);

  const value: SocketContextType = {
    socket,
    isConnected,
    isConnecting,
    unreadCount,
    onlineUsers,
    sendMessage,
    joinConversation,
    leaveConversation,
    markMessagesAsRead,
    startTyping,
    stopTyping,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

// Hook to use socket context
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
