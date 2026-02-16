"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface WriteReviewDialogProps {
  targetId: string;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function WriteReviewDialog({
  targetId,
  onSuccess,
  children,
}: WriteReviewDialogProps) {
  const { t } = useTranslation(['reviews', 'common']);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const displayRating = hoveredRating || rating;
  const isValid = rating > 0 && body.trim().length >= 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            targetId,
            rating,
            title: title.trim() || undefined,
            body: body.trim(),
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error ?? t('dialog.sendError'));
      }

      toast({
        title: t('dialog.successTitle'),
        description: t('dialog.successDesc'),
      });

      setOpen(false);
      setRating(0);
      setTitle("");
      setBody("");
      onSuccess?.();
    } catch (err) {
      toast({
        title: t('common.error', { ns: 'common' }),
        description:
          err instanceof Error ? err.message : t('dialog.sendError'),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button>{t('dialog.title')}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('dialog.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">
              {t('dialog.rating')}
            </label>
            <div className="mt-1 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const starValue = i + 1;
                return (
                  <button
                    key={i}
                    type="button"
                    className="rounded p-0.5 transition-colors hover:bg-muted"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoveredRating(starValue)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    <Star
                      className={cn(
                        "h-6 w-6 transition-colors",
                        starValue <= displayRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-muted text-muted-foreground"
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="review-title" className="text-sm font-medium text-foreground">
              {t('dialog.reviewTitle')}
            </label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('dialog.reviewTitlePlaceholder')}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="review-body" className="text-sm font-medium text-foreground">
              {t('dialog.reviewBody')}
            </label>
            <Textarea
              id="review-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t('dialog.reviewBodyPlaceholder')}
              rows={4}
              className="mt-1"
            />
            {body.length > 0 && body.trim().length < 10 && (
              <p className="mt-1 text-xs text-destructive">
                {t('dialog.minCharsLabel')}
              </p>
            )}
          </div>

          <Button type="submit" disabled={!isValid || submitting} className="w-full">
            {submitting ? t('dialog.submitting') : t('dialog.submit')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
