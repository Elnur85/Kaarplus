"use client";

import { useState, useEffect } from "react";
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

  const [form, setForm] = useState({
    title: "",
    adUnitId: "",
    imageUrl: "",
    imageUrlMobile: "",
    linkUrl: "",
    adSenseSnippet: "",
  });

  useEffect(() => {
    if (open) {
      fetch(`${API_URL}/admin/ad-units`, { credentials: "include" })
        .then((res) => res.json())
        .then((json) => setAdUnits(json.data || []))
        .catch(console.error);
    }
  }, [open]);

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
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : t("admin.advertisements.toasts.error"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
            <Select value={form.adUnitId} onValueChange={(v) => updateField("adUnitId", v)}>
              <SelectTrigger>
                <SelectValue placeholder={t("admin.advertisements.form.unitPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {adUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name} ({unit.placementId} — {unit.width}x{unit.height})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="submit" disabled={isSubmitting || !form.adUnitId} className="bg-primary text-white">
              {isSubmitting ? t("admin.advertisements.form.creating") : t("admin.advertisements.form.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
