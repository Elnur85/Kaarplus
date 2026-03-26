/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import CampaignDetailPage from "./page";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    use: () => ({ id: "campaign-1" }),
  };
});

vi.mock("react-i18next", () => {
  const t = (key: string) => key;

  return {
    useTranslation: () => ({
      t,
      i18n: {
        changeLanguage: vi.fn(),
        language: "et",
      },
    }),
  };
});

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/admin/ad-form", () => ({
  AdForm: () => null,
}));

vi.mock("@/components/admin/campaign-analytics-chart", () => ({
  CampaignAnalyticsChart: ({ timeSeries, totals }: any) => (
    <div data-testid="campaign-analytics-chart">
      {JSON.stringify({ timeSeries, totals })}
    </div>
  ),
}));

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: any) => <button data-value={value}>{children}</button>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));

describe("CampaignDetailPage", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const params = Promise.resolve({ id: "campaign-1" });

  const campaignResponse = {
    data: {
      id: "campaign-1",
      name: "Spring Sale",
      status: "ACTIVE",
      budget: 5000,
      spent: 1250,
      startDate: "2026-03-01T00:00:00.000Z",
      endDate: "2026-03-31T00:00:00.000Z",
      priority: 1,
      advertiser: { name: "LHV", email: "ads@example.com" },
      advertisements: [],
    },
  };

  it("keeps the existing not-found state for 404 campaign responses", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ code: "CAMPAIGN_NOT_FOUND" }),
    });

    render(<CampaignDetailPage params={params} />);

    await waitFor(() => {
      expect(screen.getByText("admin.campaigns.notFoundTitle")).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("shows a retryable campaign error state instead of not-found for generic failures", async () => {
    (fetch as any)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: "Server error" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(campaignResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            data: { timeSeries: [], totals: { impressions: 0, clicks: 0, ctr: 0 } },
          }),
      });

    render(<CampaignDetailPage params={params} />);

    await waitFor(() => {
      expect(screen.getByText("admin.campaigns.detailError.title")).toBeInTheDocument();
    });

    expect(screen.queryByText("admin.campaigns.notFoundTitle")).not.toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[CampaignDetailPage] Failed to fetch campaign",
      expect.objectContaining({
        error: expect.any(Error),
        id: "campaign-1",
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "admin.campaigns.detailError.retry" }));

    await waitFor(() => {
      expect(screen.getByText("Spring Sale")).toBeInTheDocument();
    });

    expect(screen.getByTestId("campaign-analytics-chart")).toBeInTheDocument();
  });

  it("shows an analytics error state while keeping the campaign page visible", async () => {
    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(campaignResponse),
      })
      .mockRejectedValueOnce(new Error("Analytics failed"));

    render(<CampaignDetailPage params={params} />);

    await waitFor(() => {
      expect(screen.getByText("Spring Sale")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("admin.analytics.error.title")).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[CampaignDetailPage] Failed to fetch analytics",
      expect.objectContaining({
        error: expect.any(Error),
        id: "campaign-1",
      })
    );
  });
});
