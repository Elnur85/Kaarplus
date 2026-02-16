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
        throw new Error(err?.error ?? "Arvustuse saatmine ebaonnestus");
      }

      toast({
        title: "Arvustus saadetud",
        description: "Tanan tagasiside eest!",
      });

      setOpen(false);
      setRating(0);
      setTitle("");
      setBody("");
      onSuccess?.();
    } catch (err) {
      toast({
        title: "Viga",
        description:
          err instanceof Error ? err.message : "Arvustuse saatmine ebaonnestus",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button>Kirjuta arvustus</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kirjuta arvustus</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">
              Hinne
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
              Pealkiri (valikuline)
            </label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Luhike kokkuvote"
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="review-body" className="text-sm font-medium text-foreground">
              Arvustus
            </label>
            <Textarea
              id="review-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Kirjeldage oma kogemust (vahemalt 10 tarki)"
              rows={4}
              className="mt-1"
            />
            {body.length > 0 && body.trim().length < 10 && (
              <p className="mt-1 text-xs text-destructive">
                Vahemalt 10 tarki on vajalik
              </p>
            )}
          </div>

          <Button type="submit" disabled={!isValid || submitting} className="w-full">
            {submitting ? "Saadan..." : "Saada arvustus"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
