"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Bell,
  Shield,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTranslation, Trans } from "react-i18next";
import { useSession } from "next-auth/react";

// Mock user data; in production, fetch from API / session
const mockUser = {
  name: "Mart Tamm",
  email: "mart.tamm@email.ee",
  phone: "+372 5555 1234",
};

export function SettingsPage() {
  const { t } = useTranslation('dashboard');
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState({
    email: true,
    messages: true,
    favorites: false,
    marketing: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('settings.description')}
        </p>
      </div>

      {/* Profile section */}
      <Card className="rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="size-5" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            {t('settings.profile.title')}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              {t('settings.profile.name')}
            </Label>
            <Input
              id="name"
              defaultValue={session?.user?.name || mockUser.name}
              readOnly
              className="bg-muted/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              {t('settings.profile.email')}
            </Label>
            <Input
              id="email"
              type="email"
              defaultValue={session?.user?.email || mockUser.email}
              readOnly
              className="bg-muted/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" />
              {t('settings.profile.phone')}
            </Label>
            <Input
              id="phone"
              type="tel"
              defaultValue={mockUser.phone}
              readOnly
              className="bg-muted/30"
            />
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          {t('settings.profile.help')}
        </p>
      </Card>

      {/* Notification preferences */}
      <Card className="rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-500">
            <Bell className="size-5" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            {t('settings.notifications.title')}
          </h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {t('settings.notifications.email.title')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('settings.notifications.email.description')}
              </p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={() => toggleNotification("email")}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {t('settings.notifications.messages.title')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('settings.notifications.messages.description')}
              </p>
            </div>
            <Switch
              checked={notifications.messages}
              onCheckedChange={() => toggleNotification("messages")}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {t('settings.notifications.favorites.title')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('settings.notifications.favorites.description')}
              </p>
            </div>
            <Switch
              checked={notifications.favorites}
              onCheckedChange={() => toggleNotification("favorites")}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {t('settings.notifications.marketing.title')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('settings.notifications.marketing.description')}
              </p>
            </div>
            <Switch
              checked={notifications.marketing}
              onCheckedChange={() => toggleNotification("marketing")}
            />
          </div>
        </div>
      </Card>

      {/* GDPR section */}
      <Card className="rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <Shield className="size-5" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            {t('settings.gdpr.title')}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {t('settings.gdpr.export.title')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('settings.gdpr.export.description')}
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 size-4" />
              {t('settings.gdpr.export.button')}
            </Button>
          </div>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {t('settings.gdpr.delete.title')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('settings.gdpr.delete.description')}
              </p>
            </div>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 size-4" />
              {t('settings.gdpr.delete.button')}
            </Button>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          <Trans
            i18nKey="settings.gdpr.privacy"
            ns="dashboard"
            components={{
              privacy: <a href="/privacy" className="text-primary underline hover:no-underline" />
            }}
          />
        </p>
      </Card>
    </div>
  );
}

