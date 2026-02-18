"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState, useCallback, type ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { API_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AdData } from "@/types/ad";

interface AdSlotProps {
  placementId: string;
  className?: string;
  fallback?: ReactNode;
  context?: {
    fuelType?: string;
    bodyType?: string;
    make?: string;
    location?: string;
  };
}

export function AdSlot({ placementId, className, fallback, context }: AdSlotProps) {
  const [ad, setAd] = useState<AdData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [impressionFired, setImpressionFired] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchAd = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (context?.fuelType) params.set("fuelType", context.fuelType);
      if (context?.bodyType) params.set("bodyType", context.bodyType);
      if (context?.make) params.set("make", context.make);
      if (context?.location) params.set("location", context.location);

      const qs = params.toString();
      const url = `${API_URL}/content-blocks/${placementId}${qs ? `?${qs}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch ad");
      const json = await res.json();
      setAd(json.data);
    } catch {
      setAd(null);
    } finally {
      setIsLoading(false);
    }
  }, [placementId, context?.fuelType, context?.bodyType, context?.make, context?.location]);

  useEffect(() => {
    fetchAd();
  }, [fetchAd]);

  // Intersection Observer: fire IMPRESSION when 50%+ visible for 1 second
  useEffect(() => {
    if (!ad || impressionFired || !containerRef.current) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const element = containerRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            fireEvent("IMPRESSION");
            setImpressionFired(true);
            observer.disconnect();
          }, 1000);
        } else if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad, impressionFired]);

  const fireEvent = async (eventType: "IMPRESSION" | "CLICK") => {
    if (!ad) return;
    try {
      await fetch(`${API_URL}/content-blocks/${ad.id}/engage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          device: getDeviceType(),
          locale: document.documentElement.lang || "et",
        }),
      });
    } catch {
      // fire-and-forget
    }
  };

  const handleClick = () => {
    if (!ad?.linkUrl) return;
    fireEvent("CLICK");
    window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
  };

  // Loading state with skeleton for CLS prevention
  if (isLoading) {
    return (
      <div ref={containerRef} className={cn("w-full", className)}>
        <Skeleton className="w-full h-[200px] rounded-xl" />
      </div>
    );
  }

  // No internal ad available
  if (!ad) {
    if (fallback) return <div className={className}>{fallback}</div>;
    return null;
  }

  // AdSense type: render script snippet
  if (ad.adUnit.type === "ADSENSE" && ad.adSenseSnippet) {
    return (
      <div
        ref={containerRef}
        className={cn("w-full", className)}
        dangerouslySetInnerHTML={{ __html: ad.adSenseSnippet }}
      />
    );
  }

  // Banner/Native: render image ad
  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full overflow-hidden rounded-xl cursor-pointer transition-opacity hover:opacity-95",
        className
      )}
      onClick={handleClick}
      role="complementary"
      aria-label={ad.title}
    >
      {ad.imageUrl && (
        <Image
          src={ad.imageUrl}
          alt={ad.title}
          width={ad.adUnit.width}
          height={ad.adUnit.height}
          className="w-full h-auto object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
      )}
    </div>
  );
}

function getDeviceType(): string {
  if (typeof window === "undefined") return "unknown";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}
