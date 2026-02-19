"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Bell,
  Shield,
  Download,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTranslation, Trans } from "react-i18next";
import { useSession } from "next-auth/react";
import { API_URL } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  role: string;
  createdAt: string;
}

export function SettingsPage() {
  const { t } = useTranslation('dashboard');
  const { data: session } = useSession();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [notifications, setNotifications] = useState({
    email: true,
    messages: true,
    favorites: false,
    marketing: false,
  });

  useEffect(() => {
    if (!session?.user) return;

    // Fetch user profile
    fetch(`${API_URL}/user/profile`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setProfile(json.data);
      })
      .catch(() => {
        // Profile will remain null — form fields show empty
      })
      .finally(() => setIsLoading(false));
  }, [session?.user]);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`${API_URL}/user/gdpr/export`, {
        credentials: "include",
      });
      
      if (!res.ok) throw new Error('Export failed');
      
      const data = await res.json();
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kaarplus-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: t('settings.gdpr.export.success', { defaultValue: 'Andmed eksporditud' }),
        description: t('settings.gdpr.export.successDesc', { defaultValue: 'Teie andmed on alla laaditud' }),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('settings.gdpr.export.error', { defaultValue: 'Eksport ebaõnnestus' }),
        description: t('settings.gdpr.export.errorDesc', { defaultValue: 'Proovige uuesti hiljem' }),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm(t('settings.gdpr.delete.confirm', { defaultValue: 'Kas olete kindel? See tegevus on pöördumatu.' }))) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/user/gdpr/delete`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!res.ok) throw new Error('Delete failed');
      
      toast({
        title: t('settings.gdpr.delete.success', { defaultValue: 'Konto kustutatud' }),
        description: t('settings.gdpr.delete.successDesc', { defaultValue: 'Teie konto on edukalt kustutatud' }),
      });
      
      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('settings.gdpr.delete.error', { defaultValue: 'Kustutamine ebaõnnestus' }),
        description: t('settings.gdpr.delete.errorDesc', { defaultValue: 'Proovige uuesti hiljem' }),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Card className="rounded-xl border p-6">
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      </div>
    );
  }

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
              value={profile?.name || ''}
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
              value={profile?.email || ''}
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
              value={profile?.phone || ''}
              readOnly
              className="bg-muted/30"
              placeholder={t('settings.profile.noPhone', { defaultValue: 'Telefoninumber puudub' })}
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportData}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Download className="mr-2 size-4" />
              )}
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
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 size-4" />
              )}
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
