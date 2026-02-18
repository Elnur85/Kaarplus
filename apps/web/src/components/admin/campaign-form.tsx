"use client";

import { useState } from "react";
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

interface CampaignFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CampaignForm({ open, onOpenChange, onSuccess }: CampaignFormProps) {
  const { t } = useTranslation("ads");
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    advertiserId: "",
    budget: "",
    dailyBudget: "",
    startDate: "",
    endDate: "",
    priority: "3",
    status: "DRAFT",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/admin/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          advertiserId: form.advertiserId,
          budget: parseFloat(form.budget),
          dailyBudget: parseFloat(form.dailyBudget),
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          priority: parseInt(form.priority),
          status: form.status,
          targeting: {},
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || t("admin.campaigns.toasts.error"));
      }

      toast({ title: t("admin.campaigns.toasts.success") });
      onSuccess();
      onOpenChange(false);
      setForm({
        name: "",
        advertiserId: "",
        budget: "",
        dailyBudget: "",
        startDate: "",
        endDate: "",
        priority: "3",
        status: "DRAFT",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : t("admin.campaigns.toasts.error"),
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
            {t("admin.campaigns.create")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("admin.campaigns.name")}</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder={t("admin.campaigns.form.namePlaceholder")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="advertiserId">{t("admin.campaigns.advertiser")}</Label>
            <Input
              id="advertiserId"
              value={form.advertiserId}
              onChange={(e) => updateField("advertiserId", e.target.value)}
              placeholder={t("admin.campaigns.form.advertiserPlaceholder")}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">{t("admin.campaigns.budget")} (€)</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                value={form.budget}
                onChange={(e) => updateField("budget", e.target.value)}
                placeholder={t("admin.campaigns.form.budgetPlaceholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dailyBudget">{t("admin.campaigns.dailyBudget")} (€)</Label>
              <Input
                id="dailyBudget"
                type="number"
                min="0"
                step="0.01"
                value={form.dailyBudget}
                onChange={(e) => updateField("dailyBudget", e.target.value)}
                placeholder={t("admin.campaigns.form.dailyBudgetPlaceholder")}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t("admin.campaigns.startDate")}</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t("admin.campaigns.endDate")}</Label>
              <Input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("admin.campaigns.priority")}</Label>
              <Select value={form.priority} onValueChange={(v) => updateField("priority", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t("admin.campaigns.priorities.1")}</SelectItem>
                  <SelectItem value="2">{t("admin.campaigns.priorities.2")}</SelectItem>
                  <SelectItem value="3">{t("admin.campaigns.priorities.3")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("admin.campaigns.status")}</Label>
              <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">{t("admin.campaigns.statuses.DRAFT")}</SelectItem>
                  <SelectItem value="ACTIVE">{t("admin.campaigns.statuses.ACTIVE")}</SelectItem>
                  <SelectItem value="PAUSED">{t("admin.campaigns.statuses.PAUSED")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("admin.campaigns.form.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary text-white">
              {isSubmitting ? t("admin.campaigns.form.creating") : t("admin.campaigns.form.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
