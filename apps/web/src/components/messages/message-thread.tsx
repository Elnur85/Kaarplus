"use client";

import { useEffect, useRef, useState } from "react";
import { Send, ArrowLeft, Car } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessageStore, type Conversation } from "@/store/use-message-store";

interface MessageThreadProps {
  conversation: Conversation;
  currentUserId: string;
  onBack?: () => void;
}

import { useTranslation } from "react-i18next";
import { et, enUS, ru } from "date-fns/locale";

const locales: Record<string, any> = {
  et,
  en: enUS,
  ru,
};

export function MessageThread({
  conversation,
  currentUserId,
  onBack,
}: MessageThreadProps) {
  const { t, i18n } = useTranslation('messages');
  const dateLocale = locales[i18n.language] || et;
  const { currentThread, isLoadingThread, isSending, loadThread, sendMessage } =
    useMessageStore();
  const [messageBody, setMessageBody] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherUser =
    conversation.senderId === currentUserId
      ? conversation.recipient
      : conversation.sender;

  const otherUserInitials = (otherUser.name ?? "K")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    loadThread(otherUser.id, conversation.listing?.id);
  }, [otherUser.id, conversation.listing?.id, loadThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentThread]);

  const handleSend = async () => {
    const trimmed = messageBody.trim();
    if (!trimmed) return;

    const success = await sendMessage({
      recipientId: otherUser.id,
      listingId: conversation.listing?.id,
      body: trimmed,
    });

    if (success) {
      setMessageBody("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-1 lg:hidden"
            onClick={onBack}
          >
            <ArrowLeft className="size-5" />
          </Button>
        )}

        <Avatar className="size-9">
          {otherUser.image && (
            <AvatarImage src={otherUser.image} alt={otherUser.name ?? ""} />
          )}
          <AvatarFallback className="text-xs">
            {otherUserInitials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {otherUser.name ?? t('user')}
          </p>
          {conversation.listing && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Car className="size-3" />
              <span className="truncate">
                {conversation.listing.year} {conversation.listing.make}{" "}
                {conversation.listing.model}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoadingThread ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  i % 2 === 0 ? "justify-start" : "justify-end"
                )}
              >
                <Skeleton
                  className={cn(
                    "h-12 rounded-2xl",
                    i % 2 === 0 ? "w-2/3" : "w-1/2"
                  )}
                />
              </div>
            ))}
          </div>
        ) : currentThread.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              {t('thread.emptyThread')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentThread.map((msg) => {
              const isSent = msg.senderId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={cn("flex", isSent ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5",
                      isSent
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md bg-muted text-foreground"
                    )}
                  >
                    <p className="whitespace-pre-wrap text-sm">{msg.body}</p>
                    <p
                      className={cn(
                        "mt-1 text-right text-[10px]",
                        isSent
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {formatDistanceToNow(new Date(msg.createdAt), {
                        addSuffix: true,
                        locale: dateLocale,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('thread.placeholder')}
            rows={1}
            className="min-h-[40px] max-h-[120px] resize-none"
            disabled={isSending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={isSending || !messageBody.trim()}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

