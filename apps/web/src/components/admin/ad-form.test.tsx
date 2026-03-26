/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AdForm } from "./ad-form";
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

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: any) => (open ? <div role="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select
      data-testid="ad-unit-select"
      value={value}
      onChange={(event) => onValueChange?.(event.target.value)}
    >
      <option value="">placeholder</option>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

describe("AdForm", () => {
  const mockToast = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnOpenChange = vi.fn();
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

  it("shows an explicit ad unit error state and retries loading", async () => {
    (fetch as any)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              {
                id: "unit-1",
                name: "Homepage Billboard",
                placementId: "HOME_BILLBOARD",
                type: "BANNER",
                width: 1200,
                height: 300,
              },
            ],
          }),
      });

    render(
      <AdForm
        open
        onOpenChange={mockOnOpenChange}
        campaignId="campaign-1"
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("admin.advertisements.adUnits.error.title")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "admin.advertisements.form.create" })).toBeDisabled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[AdForm] Failed to load ad units",
      expect.objectContaining({
        campaignId: "campaign-1",
        error: expect.any(Error),
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "admin.advertisements.adUnits.error.retry" }));

    await waitFor(() => {
      expect(screen.getByTestId("ad-unit-select")).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("shows an explicit empty state when no ad units are available", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    render(
      <AdForm
        open
        onOpenChange={mockOnOpenChange}
        campaignId="campaign-1"
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("admin.advertisements.adUnits.empty")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "admin.advertisements.form.create" })).toBeDisabled();
  });
});
