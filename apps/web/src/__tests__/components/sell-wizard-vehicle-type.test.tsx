/// <reference types="@testing-library/jest-dom" />
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (
			key: string,
			defaultValueOrOptions?: string | { defaultValue?: string }
		) => {
			if (typeof defaultValueOrOptions === "string") {
				return defaultValueOrOptions;
			}

			if (
				defaultValueOrOptions &&
				typeof defaultValueOrOptions === "object" &&
				"defaultValue" in defaultValueOrOptions
			) {
				return defaultValueOrOptions.defaultValue ?? key;
			}

			return key;
		},
		i18n: {
			language: "en",
			changeLanguage: vi.fn(),
		},
	}),
}));

vi.mock("next-auth/react", () => ({
	useSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
	}),
}));

vi.mock("@/hooks/use-toast", () => ({
	useToast: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
	api: {
		get: vi.fn(),
	},
}));

vi.mock("@/components/sell/step-indicator", () => ({
	StepIndicator: () => <div data-testid="step-indicator" />,
}));

vi.mock("@/components/sell/step-2-vehicle-data", () => ({
	Step2VehicleData: () => <div data-testid="step-2" />,
}));

vi.mock("@/components/sell/step-3-photo-upload", () => ({
	Step3PhotoUpload: () => <div data-testid="step-3" />,
}));

vi.mock("@/components/sell/step-4-confirmation", () => ({
	Step4Confirmation: () => <div data-testid="step-4" />,
}));

import { useSession } from "next-auth/react";

import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { SellWizard } from "@/components/sell/sell-wizard";

describe("SellWizard vehicle type selector", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		window.scrollTo = vi.fn();

		(useSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			data: {
				user: {
					name: "Test User",
					email: "test@example.com",
				},
			},
			status: "authenticated",
		});

		(useToast as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			toast: vi.fn(),
		});
	});

	it("renders vehicle type cards when the API only returns canonical bodyTypes", async () => {
		(api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
			data: {
				makes: [],
				fuelTypes: [],
				bodyTypes: ["passengerCar:sedan", "suv:coupe"],
				transmissions: [],
				driveTypes: [],
				colors: [],
				locations: [],
				years: { min: 1990, max: 2026 },
				price: { min: 0, max: 100000 },
			},
		});

		render(<SellWizard />);

		await waitFor(() => {
			expect(screen.getByText("passengerCar")).toBeInTheDocument();
		});

		expect(screen.getByText("suv")).toBeInTheDocument();
		expect(screen.queryByText("sell:taxonomy.error")).not.toBeInTheDocument();
	});

	it("shows the retryable taxonomy error panel when no vehicle taxonomy can be derived", async () => {
		(api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
			data: {
				makes: [],
				fuelTypes: [],
				bodyTypes: [],
				bodyTypeHierarchy: [],
				transmissions: [],
				driveTypes: [],
				colors: [],
				locations: [],
				years: { min: 1990, max: 2026 },
				price: { min: 0, max: 100000 },
			},
		});

		render(<SellWizard />);

		await waitFor(() => {
			expect(screen.getByText("sell:taxonomy.error")).toBeInTheDocument();
		});

		expect(
			screen.getByRole("button", { name: "common:errorBoundary.retry" })
		).toBeInTheDocument();
	});
});
