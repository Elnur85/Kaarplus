"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { API_URL } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

interface AdUnit {
  id: string;
  name: string;
  placementId: string;
  type: string;
  width: number;
  height: number;
}

interface AdFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  onSuccess: () => void;
}

export function AdForm({ open, onOpenChange, campaignId, onSuccess }: AdFormProps) {
  const { t } = useTranslation("ads");
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adUnits, setAdUnits] = useState<AdUnit[]>([]);
  const [isLoadingAdUnits, setIsLoadingAdUnits] = useState(false);
  const [adUnitsError, setAdUnitsError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    adUnitId: "",
    imageUrl: "",
    imageUrlMobile: "",
    linkUrl: "",
    adSenseSnippet: "",
  });

  const loadAdUnits = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoadingAdUnits(true);
      setAdUnitsError(null);

      try {
        const res = await fetch(`${API_URL}/admin/ad-units`, {
          credentials: "include",
          signal,
        });

        if (!res.ok) {
          throw new Error(t("admin.advertisements.adUnits.error.message"));
        }

        const json = await res.json();
        const nextAdUnits: AdUnit[] = Array.isArray(json.data) ? json.data : [];

        setAdUnits(nextAdUnits);
        setForm((prev) =>
          nextAdUnits.some((unit) => unit.id === prev.adUnitId)
            ? prev
            : { ...prev, adUnitId: "" }
        );
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("[AdForm] Failed to load ad units", {
          error,
          campaignId,
        });

        setAdUnits([]);
        setAdUnitsError(t("admin.advertisements.adUnits.error.message"));
        setForm((prev) => ({ ...prev, adUnitId: "" }));
      } finally {
        if (!signal?.aborted) {
          setIsLoadingAdUnits(false);
        }
      }
    },
    [campaignId, t]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const controller = new AbortController();
    void loadAdUnits(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadAdUnits, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/admin/advertisements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          campaignId,
          adUnitId: form.adUnitId,
          title: form.title,
          imageUrl: form.imageUrl || undefined,
          imageUrlMobile: form.imageUrlMobile || undefined,
          linkUrl: form.linkUrl || undefined,
          adSenseSnippet: form.adSenseSnippet || undefined,
          active: true,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || t("admin.advertisements.toasts.error"));
      }

      toast({ title: t("admin.advertisements.toasts.success") });
      onSuccess();
      onOpenChange(false);
      setForm({
        title: "",
        adUnitId: "",
        imageUrl: "",
        imageUrlMobile: "",
        linkUrl: "",
        adSenseSnippet: "",
      });
    } catch (error) {
      console.error("[AdForm] Failed to create advertisement", {
        error,
        campaignId,
        adUnitId: form.adUnitId,
      });

      toast({
        variant: "destructive",
        title: t("admin.advertisements.toasts.errorTitle"),
        description:
          error instanceof Error ? error.message : t("admin.advertisements.toasts.error"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const hasAvailableAdUnits = adUnits.length > 0;
  const isAdUnitReady = hasAvailableAdUnits && adUnits.some((unit) => unit.id === form.adUnitId);

  const getPlacementName = (placementId: string | undefined) => {
    if (!placementId) return "";

    const key = `admin.units.placements.${placementId}.name`;
    const translated = t(key);

    return translated === key ? placementId : translated;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {t("admin.advertisements.create")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ad-title">{t("admin.advertisements.form.title")}</Label>
            <Input
              id="ad-title"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder={t("admin.advertisements.form.titlePlaceholder")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{t("admin.advertisements.unit")}</Label>
            {isLoadingAdUnits ? (
              <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("admin.advertisements.adUnits.loading")}</span>
              </div>
            ) : adUnitsError ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/20 bg-destructive/10 p-4"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
                  <div className="flex-1">
                    <p className="font-semibold text-destructive">
                      {t("admin.advertisements.adUnits.error.title")}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{adUnitsError}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => void loadAdUnits()}
                    >
                      {t("admin.advertisements.adUnits.error.retry")}
                    </Button>
                  </div>
                </div>
              </div>
            ) : !hasAvailableAdUnits ? (
              <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                {t("admin.advertisements.adUnits.empty")}
              </div>
            ) : (
              <Select value={form.adUnitId} onValueChange={(v) => updateField("adUnitId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("admin.advertisements.form.unitPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {adUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {getPlacementName(unit.placementId)} ({unit.placementId} — {unit.width}x
                      {unit.height})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">{t("admin.advertisements.form.imageDesktop")}</Label>
            <Input
              id="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={(e) => updateField("imageUrl", e.target.value)}
              placeholder={t("admin.advertisements.form.urlPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrlMobile">{t("admin.advertisements.form.imageMobile")}</Label>
            <Input
              id="imageUrlMobile"
              type="url"
              value={form.imageUrlMobile}
              onChange={(e) => updateField("imageUrlMobile", e.target.value)}
              placeholder={t("admin.advertisements.form.urlPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkUrl">{t("admin.advertisements.form.linkUrl")}</Label>
            <Input
              id="linkUrl"
              type="url"
              value={form.linkUrl}
              onChange={(e) => updateField("linkUrl", e.target.value)}
              placeholder={t("admin.advertisements.form.linkPlaceholder")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("admin.advertisements.form.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || isLoadingAdUnits || !!adUnitsError || !hasAvailableAdUnits || !isAdUnitReady
              }
              className="bg-primary text-white"
            >
              {isSubmitting
                ? t("admin.advertisements.form.creating")
                : t("admin.advertisements.form.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
