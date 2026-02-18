/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { AdSlot } from "./ad-slot";

import type { AdData } from "@/types/ad";

// ── Helpers ─────────────────────────────────────────────────────

const mockBannerAd: AdData = {
  id: "ad-1",
  title: "Test Banner Ad",
  imageUrl: "https://cdn.kaarplus.ee/ads/banner.jpg",
  imageUrlMobile: null,
  linkUrl: "https://partner.com/offer",
  adSenseSnippet: null,
  campaign: { id: "c1", priority: 1 },
  adUnit: { placementId: "HOME_BILLBOARD", width: 1200, height: 300, type: "BANNER" },
};

const mockNativeAd: AdData = {
  id: "ad-2",
  title: "Native Finance Ad",
  imageUrl: "https://cdn.kaarplus.ee/ads/native.jpg",
  imageUrlMobile: "https://cdn.kaarplus.ee/ads/native-m.jpg",
  linkUrl: "https://lhv.ee/auto",
  adSenseSnippet: null,
  campaign: { id: "c2", priority: 2 },
  adUnit: { placementId: "DETAIL_FINANCE", width: 300, height: 250, type: "NATIVE" },
};

const mockAdSenseAd: AdData = {
  id: "ad-3",
  title: "AdSense Fallback",
  imageUrl: null,
  imageUrlMobile: null,
  linkUrl: null,
  adSenseSnippet: '<ins class="adsbygoogle" data-ad-client="ca-pub-123"></ins>',
  campaign: { id: "c3", priority: 3 },
  adUnit: { placementId: "SEARCH_SIDEBAR", width: 300, height: 600, type: "ADSENSE" },
};

function mockFetchSuccess(ad: AdData | null) {
  vi.mocked(global.fetch).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: ad }),
  } as Response);
}

function mockFetchError() {
  vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"));
}

// ── IntersectionObserver Mock ───────────────────────────────────

type IntersectionCallback = (entries: IntersectionObserverEntry[]) => void;

let intersectionCallback: IntersectionCallback | null = null;
let observedElements: Element[] = [];

class MockIntersectionObserver {
  constructor(callback: IntersectionCallback, _options?: IntersectionObserverInit) {
    intersectionCallback = callback;
    observedElements = [];
  }
  observe(el: Element) {
    observedElements.push(el);
  }
  unobserve() { }
  disconnect() {
    intersectionCallback = null;
    observedElements = [];
  }
  takeRecords() {
    return [];
  }
}

function simulateIntersection(isIntersecting: boolean) {
  if (!intersectionCallback || observedElements.length === 0) return;
  intersectionCallback([
    {
      isIntersecting,
      target: observedElements[0],
      intersectionRatio: isIntersecting ? 0.6 : 0,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now(),
    } as IntersectionObserverEntry,
  ]);
}

// ── Mock next/image ─────────────────────────────────────────────

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => React.createElement("img", props),
}));

vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: (props: Record<string, unknown>) => React.createElement("div", { ...props, "data-testid": "skeleton" }),
}));

// ── Tests ───────────────────────────────────────────────────────

describe("AdSlot", () => {
  let windowOpenSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    intersectionCallback = null;
    observedElements = [];

    // Override the global IntersectionObserver with our interactive mock
    global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

    // Spy on window.open for click tracking tests
    windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    // Default document lang
    Object.defineProperty(document.documentElement, "lang", {
      value: "et",
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    windowOpenSpy.mockRestore();
  });

  // ── Loading State ───────────────────────────────────────────

  describe("loading state", () => {
    it("should show skeleton while fetching", () => {
      // Never resolve fetch — keep in loading state
      vi.mocked(global.fetch).mockReturnValueOnce(new Promise(() => { }));

      const { getByTestId } = render(<AdSlot placementId="HOME_BILLBOARD" />);
      expect(getByTestId("skeleton")).toBeInTheDocument();
    });

    it("should apply custom className during loading", () => {
      vi.mocked(global.fetch).mockReturnValueOnce(new Promise(() => { }));

      const { container } = render(
        <AdSlot placementId="HOME_BILLBOARD" className="mt-8" />
      );

      expect(container.firstChild).toHaveClass("mt-8");
    });
  });

  // ── Banner Ad Rendering ─────────────────────────────────────

  describe("banner ad rendering", () => {
    it("should render banner image with correct attributes", async () => {
      vi.useRealTimers();
      mockFetchSuccess(mockBannerAd);

      render(<AdSlot placementId="HOME_BILLBOARD" />);

      await waitFor(() => {
        const img = screen.getByAltText("Test Banner Ad");
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("src", "https://cdn.kaarplus.ee/ads/banner.jpg");
        expect(img).toHaveAttribute("width", "1200");
        expect(img).toHaveAttribute("height", "300");
      }, { timeout: 4000 });
    });

    it("should set role and aria-label for accessibility", async () => {
      mockFetchSuccess(mockBannerAd);

      render(<AdSlot placementId="HOME_BILLBOARD" />);

      await waitFor(() => {
        const container = screen.getByRole("complementary");
        expect(container).toHaveAttribute("aria-label", "Test Banner Ad");
      });
    });

    it("should have clickable cursor style", async () => {
      mockFetchSuccess(mockBannerAd);

      render(<AdSlot placementId="HOME_BILLBOARD" />);

      await waitFor(() => {
        const container = screen.getByRole("complementary");
        expect(container).toHaveClass("cursor-pointer");
      });
    });
  });

  // ── Fallback Rendering ──────────────────────────────────────

  describe("fallback behavior", () => {
    it("should render nothing when no ad and no fallback", async () => {
      mockFetchSuccess(null);

      const { container } = render(<AdSlot placementId="EMPTY_SLOT" />);

      await waitFor(() => {
        expect(container.innerHTML).toBe("");
      });
    });

    it("should render fallback component when no ad available", async () => {
      mockFetchSuccess(null);

      render(
        <AdSlot
          placementId="EMPTY_SLOT"
          fallback={<div data-testid="fallback">No ads available</div>}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("fallback")).toBeInTheDocument();
        expect(screen.getByText("No ads available")).toBeInTheDocument();
      });
    });

    it("should render fallback on network error", async () => {
      mockFetchError();

      render(
        <AdSlot
          placementId="HOME_BILLBOARD"
          fallback={<div data-testid="error-fallback">Ad unavailable</div>}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("error-fallback")).toBeInTheDocument();
      });
    });
  });

  // ── API Request ─────────────────────────────────────────────

  describe("API requests", () => {
    it("should fetch from correct content-blocks URL", async () => {
      mockFetchSuccess(mockBannerAd);

      render(<AdSlot placementId="HOME_BILLBOARD" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/content-blocks/HOME_BILLBOARD")
        );
      });
    });

    it("should include targeting context as query params", async () => {
      mockFetchSuccess(mockNativeAd);

      render(
        <AdSlot
          placementId="DETAIL_FINANCE"
          context={{ fuelType: "DIESEL", make: "BMW", bodyType: "SUV" }}
        />
      );

      await waitFor(() => {
        const calledUrl = vi.mocked(global.fetch).mock.calls[0][0] as string;
        expect(calledUrl).toContain("fuelType=DIESEL");
        expect(calledUrl).toContain("make=BMW");
        expect(calledUrl).toContain("bodyType=SUV");
      });
    });

    it("should omit empty context fields from query", async () => {
      mockFetchSuccess(mockBannerAd);

      render(
        <AdSlot
          placementId="HOME_BILLBOARD"
          context={{ fuelType: undefined, make: "Audi" }}
        />
      );

      await waitFor(() => {
        const calledUrl = vi.mocked(global.fetch).mock.calls[0][0] as string;
        expect(calledUrl).toContain("make=Audi");
        expect(calledUrl).not.toContain("fuelType");
      });
    });
  });

  // ── Impression Tracking (IntersectionObserver) ──────────────

  describe("impression tracking", () => {
    it("should fire IMPRESSION after 1s of 50%+ visibility", async () => {
      mockFetchSuccess(mockBannerAd);
      // Second fetch call for the IMPRESSION event
      vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);

      render(<AdSlot placementId="HOME_BILLBOARD" />);

      // Wait for ad to load
      await waitFor(() => {
        expect(screen.getByRole("complementary")).toBeInTheDocument();
      });

      vi.useFakeTimers();

      // Simulate element becoming 50%+ visible
      act(() => {
        simulateIntersection(true);
      });

      // Advance timer by 1 second (visibility threshold)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });

      vi.useRealTimers();

      // Check that impression event was sent
      await waitFor(() => {
        const engageCalls = vi.mocked(global.fetch).mock.calls.filter(
          (call) => typeof call[0] === "string" && call[0].includes("/engage")
        );
        expect(engageCalls).toHaveLength(1);

        const [url, options] = engageCalls[0];
        expect(url).toContain(`/api/content-blocks/ad-1/engage`);
        expect(options).toEqual(
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
        );

        const body = JSON.parse((options as RequestInit).body as string);
        expect(body.eventType).toBe("IMPRESSION");
        expect(body.locale).toBe("et");
        expect(body.device).toBeDefined();
      });
    });

    it("should NOT fire impression if element leaves viewport before 1s", async () => {
      mockFetchSuccess(mockBannerAd);

      render(<AdSlot placementId="HOME_BILLBOARD" />);

      await waitFor(() => {
        expect(screen.getByRole("complementary")).toBeInTheDocument();
      });

      vi.useFakeTimers();

      // Enter viewport
      act(() => {
        simulateIntersection(true);
      });

      // Advance only 500ms
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      // Leave viewport before 1s
      act(() => {
        simulateIntersection(false);
      });

      // Advance past the 1s mark
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });

      // No engage call should have been made (only the initial fetch)
      const engageCalls = vi.mocked(global.fetch).mock.calls.filter(
        (call) => typeof call[0] === "string" && call[0].includes("/engage")
      );
      expect(engageCalls).toHaveLength(0);
    });

    it("should fire impression only once even with multiple intersections", async () => {
      mockFetchSuccess(mockBannerAd);
      // Mock engage calls
      vi.mocked(global.fetch).mockResolvedValue({ ok: true, json: async () => ({}) } as Response);

      render(<AdSlot placementId="HOME_BILLBOARD" />);

      await waitFor(() => {
        expect(screen.getByRole("complementary")).toBeInTheDocument();
      });

      vi.useFakeTimers();

      // First intersection — triggers impression
      act(() => {
        simulateIntersection(true);
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });

      // Second intersection — should not trigger again
      act(() => {
        simulateIntersection(false);
      });
      act(() => {
        simulateIntersection(true);
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });

      vi.useRealTimers();

      await waitFor(() => {
        const engageCalls = vi.mocked(global.fetch).mock.calls.filter(
          (call) => typeof call[0] === "string" && call[0].includes("/engage")
        );
        // Should be exactly 1 impression, not 2
        expect(engageCalls).toHaveLength(1);
      });
    });
  });

  // ── Click Tracking ──────────────────────────────────────────

  describe("click tracking", () => {
    it("should fire CLICK event and open link on ad click", async () => {
      mockFetchSuccess(mockBannerAd);
      // Mock the click engage call
      vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);

      const user = userEvent.setup();

      render(<AdSlot placementId="HOME_BILLBOARD" />);

      await waitFor(() => {
        expect(screen.getByRole("complementary")).toBeInTheDocument();
      });

      // Click the ad
      await user.click(screen.getByRole("complementary"));

      // Should open link in new tab
      expect(windowOpenSpy).toHaveBeenCalledWith(
        "https://partner.com/offer",
        "_blank",
        "noopener,noreferrer"
      );

      // Should fire CLICK event
      await waitFor(() => {
        const engageCalls = vi.mocked(global.fetch).mock.calls.filter(
          (call) => typeof call[0] === "string" && call[0].includes("/engage")
        );
        expect(engageCalls.length).toBeGreaterThanOrEqual(1);

        const clickCall = engageCalls.find((call) => {
          const body = JSON.parse((call[1] as RequestInit).body as string);
          return body.eventType === "CLICK";
        });
        expect(clickCall).toBeTruthy();
      });
    });

    it("should not open link when linkUrl is null", async () => {
      const adWithoutLink: AdData = {
        ...mockBannerAd,
        linkUrl: null,
      };
      mockFetchSuccess(adWithoutLink);

      const user = userEvent.setup();

      render(<AdSlot placementId="HOME_BILLBOARD" />);

      await waitFor(() => {
        expect(screen.getByRole("complementary")).toBeInTheDocument();
      });

      await user.click(screen.getByRole("complementary"));

      expect(windowOpenSpy).not.toHaveBeenCalled();
    });
  });

  // ── AdSense Rendering ───────────────────────────────────────

  describe("AdSense rendering", () => {
    it("should render AdSense snippet via dangerouslySetInnerHTML", async () => {
      mockFetchSuccess(mockAdSenseAd);

      const { container } = render(<AdSlot placementId="SEARCH_SIDEBAR" />);

      await waitFor(() => {
        const adsenseEl = container.querySelector(".adsbygoogle");
        expect(adsenseEl).toBeTruthy();
        expect(adsenseEl?.getAttribute("data-ad-client")).toBe("ca-pub-123");
      });
    });

    it("should not render image for AdSense type", async () => {
      mockFetchSuccess(mockAdSenseAd);

      render(<AdSlot placementId="SEARCH_SIDEBAR" />);

      await waitFor(() => {
        const img = screen.queryByRole("img");
        expect(img).not.toBeInTheDocument();
      });
    });
  });

  // ── Device Detection ────────────────────────────────────────

  describe("device detection", () => {
    it("should report desktop for wide viewports", async () => {
      Object.defineProperty(window, "innerWidth", { value: 1440, writable: true });
      mockFetchSuccess(mockBannerAd);
      vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);

      const user = userEvent.setup();

      render(<AdSlot placementId="HOME_BILLBOARD" />);

      await waitFor(() => {
        expect(screen.getByRole("complementary")).toBeInTheDocument();
      });

      await user.click(screen.getByRole("complementary"));

      await waitFor(() => {
        const engageCalls = vi.mocked(global.fetch).mock.calls.filter(
          (call) => typeof call[0] === "string" && call[0].includes("/engage")
        );
        if (engageCalls.length > 0) {
          const body = JSON.parse((engageCalls[0][1] as RequestInit).body as string);
          expect(body.device).toBe("desktop");
        }
      });
    });

    it("should report mobile for narrow viewports", async () => {
      Object.defineProperty(window, "innerWidth", { value: 375, writable: true });
      mockFetchSuccess(mockBannerAd);
      vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);

      const user = userEvent.setup();

      render(<AdSlot placementId="HOME_BILLBOARD" />);

      await waitFor(() => {
        expect(screen.getByRole("complementary")).toBeInTheDocument();
      });

      await user.click(screen.getByRole("complementary"));

      await waitFor(() => {
        const engageCalls = vi.mocked(global.fetch).mock.calls.filter(
          (call) => typeof call[0] === "string" && call[0].includes("/engage")
        );
        if (engageCalls.length > 0) {
          const body = JSON.parse((engageCalls[0][1] as RequestInit).body as string);
          expect(body.device).toBe("mobile");
        }
      });
    });
  });
});
