/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import AdInventoryPage from "./page";

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

describe("AdInventoryPage", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("shows an inline error state for failed ad-unit fetches and retries successfully", async () => {
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
                description: null,
                active: true,
                activeAdsCount: 2,
              },
            ],
          }),
      });

    render(<AdInventoryPage />);

    await waitFor(() => {
      expect(screen.getByText("admin.units.error.title")).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[AdInventoryPage] Failed to load ad units",
      expect.objectContaining({
        error: expect.any(Error),
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "admin.units.error.retry" }));

    await waitFor(() => {
      expect(screen.getAllByText("HOME_BILLBOARD")).toHaveLength(2);
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("shows an explicit empty state when no ad units are available", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    render(<AdInventoryPage />);

    await waitFor(() => {
      expect(screen.getByText("admin.units.empty")).toBeInTheDocument();
    });
  });
});
