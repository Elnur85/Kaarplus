"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { ClipboardCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RequestInspectionDialogProps {
  listingId: string;
  make: string;
  model: string;
  year: number;
  onSuccess?: () => void;
}

export function RequestInspectionDialog({
  listingId,
  make,
  model,
  year,
  onSuccess,
}: RequestInspectionDialogProps) {
  const { t } = useTranslation("inspection");
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleRequest = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/user/inspections`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ listingId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("request.errorSending"));
      }

      setIsSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("request.errorSending")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setIsSuccess(false);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ClipboardCheck className="h-4 w-4" />
          {t("request.orderButton")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            {t("request.dialogTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("request.dialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-sm font-medium text-muted-foreground">{t("request.vehicle")}</p>
          <p className="text-base font-semibold">
            {year} {make} {model}
          </p>
        </div>

        {isSuccess ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
            <ClipboardCheck className="mx-auto mb-2 h-8 w-8 text-green-600" />
            <p className="font-semibold text-green-800">
              {t("request.successOrdered")}
            </p>
            <p className="mt-1 text-sm text-green-700">
              {t("request.successOrderedDesc")}
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={handleRequest}
                disabled={isLoading}
                className="w-full gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("request.orderButton")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
