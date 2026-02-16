"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConversationList } from "@/components/messages/conversation-list";
import { MessageThread } from "@/components/messages/message-thread";
import { useMessageStore, type Conversation } from "@/store/use-message-store";

export function MessagesPageClient() {
  const { data: session, status } = useSession();
  const currentUserId = session?.user?.id || "";

  const [showThread, setShowThread] = useState(false);
  const { selectedConversation, selectConversation, loadThread } =
    useMessageStore();

  const handleSelectConversation = useCallback(
    (conv: Conversation) => {
      selectConversation(conv);
      const otherUserId =
        conv.senderId === currentUserId ? conv.recipientId : conv.senderId;
      loadThread(otherUserId, conv.listing?.id);
      setShowThread(true);
    },
    [currentUserId, selectConversation, loadThread]
  );

  const handleBack = useCallback(() => {
    setShowThread(false);
  }, []);

  if (status === "loading") {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground">Sisselogimine on vajalik sõnumite vaatamiseks.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Sõnumid</h1>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex h-[600px]">
          {/* Conversation list - hidden on mobile when thread is shown */}
          <div
            className={cn(
              "w-full border-r border-border lg:w-1/3",
              showThread ? "hidden lg:block" : "block"
            )}
          >
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">
                Vestlused
              </h2>
            </div>
            <ConversationList
              currentUserId={currentUserId}
              onSelect={handleSelectConversation}
            />
          </div>

          {/* Message thread - hidden on mobile when no thread selected */}
          <div
            className={cn(
              "w-full lg:w-2/3",
              showThread ? "block" : "hidden lg:block"
            )}
          >
            {selectedConversation ? (
              <MessageThread
                conversation={selectedConversation}
                currentUserId={currentUserId}
                onBack={handleBack}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                  <MessageCircle className="size-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Valige vestlus
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Valige vestlus vasakult, et naha sonumeid
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
