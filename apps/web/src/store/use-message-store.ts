import { create } from "zustand";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface MessageUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface MessageListing {
  id: string;
  make: string;
  model: string;
  year: number;
  images: { url: string }[];
}

export interface Conversation {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string | null;
  body: string;
  read: boolean;
  createdAt: string;
  sender: MessageUser;
  recipient: MessageUser;
  listing: MessageListing | null;
}

export interface ThreadMessage {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  sender: MessageUser;
}

interface MessageStore {
  conversations: Conversation[];
  currentThread: ThreadMessage[];
  selectedConversation: Conversation | null;
  unreadCount: number;
  isLoadingConversations: boolean;
  isLoadingThread: boolean;
  isSending: boolean;
  error: string | null;
  loadConversations: () => Promise<void>;
  loadThread: (otherUserId: string, listingId?: string) => Promise<void>;
  sendMessage: (data: {
    recipientId: string;
    listingId?: string;
    body: string;
  }) => Promise<boolean>;
  selectConversation: (conv: Conversation) => void;
  loadUnreadCount: () => Promise<void>;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  conversations: [],
  currentThread: [],
  selectedConversation: null,
  unreadCount: 0,
  isLoadingConversations: false,
  isLoadingThread: false,
  isSending: false,
  error: null,

  loadConversations: async () => {
    set({ isLoadingConversations: true, error: null });
    try {
      const response = await fetch(`${API_URL}/user/messages`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load conversations");
      }

      const json = await response.json();
      const conversations: Conversation[] = json.data ?? [];

      set({ conversations, isLoadingConversations: false });
    } catch (error) {
      console.error("Failed to load conversations:", error);
      set({ isLoadingConversations: false, error: "Vestluste laadimine ebaõnnestus" });
    }
  },

  loadThread: async (otherUserId: string, listingId?: string) => {
    set({ isLoadingThread: true, error: null });
    try {
      const params = new URLSearchParams({ userId: otherUserId });
      if (listingId) {
        params.set("listingId", listingId);
      }

      const response = await fetch(
        `${API_URL}/user/messages/thread?${params.toString()}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("Failed to load thread");
      }

      const json = await response.json();
      const currentThread: ThreadMessage[] = json.data ?? [];

      set({ currentThread, isLoadingThread: false });
    } catch (error) {
      console.error("Failed to load thread:", error);
      set({ isLoadingThread: false, error: "Sõnumite laadimine ebaõnnestus" });
    }
  },

  sendMessage: async (data) => {
    set({ isSending: true, error: null });
    try {
      const response = await fetch(`${API_URL}/user/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const json = await response.json();
      const newMessage: ThreadMessage = json.data;

      set((state) => ({
        currentThread: [...state.currentThread, newMessage],
        isSending: false,
      }));

      // Reload conversations to update last message preview
      get().loadConversations();
      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      set({ isSending: false, error: "Sõnumi saatmine ebaõnnestus" });
      return false;
    }
  },

  selectConversation: (conv: Conversation) => {
    set({ selectedConversation: conv });
  },

  loadUnreadCount: async () => {
    try {
      const response = await fetch(`${API_URL}/user/messages/unread-count`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load unread count");
      }

      const json = await response.json();
      const unreadCount: number = json.data ?? 0;

      set({ unreadCount });
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  },
}));
