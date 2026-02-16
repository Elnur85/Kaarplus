"use client";

import { useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessageStore, type Conversation } from "@/store/use-message-store";

interface ConversationListProps {
  currentUserId: string;
  onSelect: (conv: Conversation) => void;
}

import { useTranslation } from "react-i18next";
import { et, enUS, ru } from "date-fns/locale";

const locales: Record<string, any> = {
  et,
  en: enUS,
  ru,
};

export function ConversationList({
  currentUserId,
  onSelect,
}: ConversationListProps) {
  const { t, i18n } = useTranslation('messages');
  const dateLocale = locales[i18n.language] || et;
  const { conversations, selectedConversation, isLoadingConversations, loadConversations } =
    useMessageStore();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  if (isLoadingConversations && conversations.length === 0) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <MessageCircle className="size-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{t('empty.title')}</p>
          <p className="text-xs text-muted-foreground">
            {t('empty.subtitle')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((conv) => {
        const otherUser =
          conv.senderId === currentUserId ? conv.recipient : conv.sender;
        const isSelected = selectedConversation?.id === conv.id;
        const isUnread = !conv.read && conv.recipientId === currentUserId;
        const initials = (otherUser.name ?? "K")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={cn(
              "flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/50",
              isSelected && "bg-muted"
            )}
          >
            <div className="relative flex-shrink-0">
              <Avatar className="size-10">
                {otherUser.image && (
                  <AvatarImage src={otherUser.image} alt={otherUser.name ?? ""} />
                )}
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              {isUnread && (
                <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-primary" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "truncate text-sm",
                    isUnread ? "font-semibold text-foreground" : "font-medium text-foreground"
                  )}
                >
                  {otherUser.name ?? t('user')}
                </p>
                <span className="flex-shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(conv.createdAt), {
                    addSuffix: true,
                    locale: dateLocale,
                  })}
                </span>
              </div>

              {conv.listing && (
                <p className="truncate text-xs text-primary">
                  {conv.listing.year} {conv.listing.make} {conv.listing.model}
                </p>
              )}

              <p
                className={cn(
                  "mt-0.5 truncate text-xs",
                  isUnread ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {conv.body}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

