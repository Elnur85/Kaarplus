/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import AdminAdsPage from "./page";
import { useToast } from "@/hooks/use-toast";

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

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

vi.mock("@/components/admin/campaign-table", () => ({
  CampaignTable: ({ campaigns }: any) => (
    <div data-testid="campaign-table">{JSON.stringify(campaigns)}</div>
  ),
}));

vi.mock("@/components/admin/campaign-form", () => ({
  CampaignForm: () => null,
}));

vi.mock("@/components/shared/pagination", () => ({
  Pagination: () => null,
}));

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: any) => <button data-value={value}>{children}</button>,
}));

describe("AdminAdsPage", () => {
  const mockToast = vi.fn();
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
    global.fetch = vi.fn();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("shows an inline error state for failed campaign fetches and retries successfully", async () => {
    (fetch as any)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: "campaign-1", name: "Spring Sale" }],
            meta: { total: 1 },
          }),
      });

    render(<AdminAdsPage />);

    await waitFor(() => {
      expect(screen.getByText("admin.campaigns.error.title")).toBeInTheDocument();
    });

    expect(mockToast).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[AdminAdsPage] Failed to fetch campaigns",
      expect.objectContaining({
        error: expect.any(Error),
        page: 1,
        statusFilter: "ALL",
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "admin.campaigns.error.retry" }));

    await waitFor(() => {
      expect(screen.getByTestId("campaign-table")).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
