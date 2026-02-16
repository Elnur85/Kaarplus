"use client";

import * as React from "react";
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
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleRequest = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/inspections`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ listingId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Viga päringu saatmisel");
      }

      setIsSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Viga päringu saatmisel"
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
          Telli ülevaatus
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Telli sõiduki ülevaatus
          </DialogTitle>
          <DialogDescription>
            Professionaalne sõiduki ülevaatus annab teile kindluse auto
            tehnilise seisukorra kohta. Meie sertifitseeritud inspektorid
            kontrollivad sõidukit põhjalikult ja koostavad üksikasjaliku
            aruande.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-sm font-medium text-muted-foreground">Sõiduk</p>
          <p className="text-base font-semibold">
            {year} {make} {model}
          </p>
        </div>

        {isSuccess ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
            <ClipboardCheck className="mx-auto mb-2 h-8 w-8 text-green-600" />
            <p className="font-semibold text-green-800">
              Ülevaatus on edukalt tellitud!
            </p>
            <p className="mt-1 text-sm text-green-700">
              Võtame teiega peagi ühendust, et leppida kokku sobiv aeg.
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
                Telli ülevaatus
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
