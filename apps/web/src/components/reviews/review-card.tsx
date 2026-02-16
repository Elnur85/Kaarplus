import { Star, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { et } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReviewData {
  id: string;
  rating: number;
  title?: string;
  body: string;
  verified: boolean;
  createdAt: string;
  reviewer: {
    name: string | null;
    image: string | null;
  };
}

interface ReviewCardProps {
  review: ReviewData;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { rating, title, body, verified, createdAt, reviewer } = review;

  const initials = reviewer.name
    ? reviewer.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : null;

  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: et,
  });

  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9">
          {reviewer.image && (
            <AvatarImage src={reviewer.image} alt={reviewer.name ?? "Kasutaja"} />
          )}
          <AvatarFallback>
            {initials ?? <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {reviewer.name ?? "Anonuumne"}
            </span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            {verified && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 text-xs"
              >
                Kinnitatud ost
              </Badge>
            )}
          </div>

          <div className="mt-1 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3.5 w-3.5",
                  i < rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted text-muted"
                )}
              />
            ))}
          </div>

          {title && (
            <p className="mt-2 text-sm font-semibold text-foreground">{title}</p>
          )}
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}
