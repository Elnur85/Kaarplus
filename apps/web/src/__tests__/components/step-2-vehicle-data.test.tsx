/// <reference types="@testing-library/jest-dom" />
import React, { useEffect } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, options?: { defaultValue?: string }) => {
            if (key === "sell.validation.contactName.minLength") {
                return "Translated contact name error";
            }

            if (options && typeof options === "object" && "defaultValue" in options) {
                return options.defaultValue ?? key;
            }

            return key;
        },
        i18n: {
            language: "en",
            changeLanguage: vi.fn(),
        },
    }),
}));

vi.mock("@/components/sell/equipment-checkboxes", () => ({
    EquipmentCheckboxes: () => <div data-testid="equipment-checkboxes" />,
}));

import { Step2VehicleData } from "@/components/sell/step-2-vehicle-data";
import type { SellFormValues } from "@/schemas/sell-form";
import type { SellReferenceData } from "@/lib/sell-reference-data";

const referenceData: SellReferenceData = {
    makes: ["BMW"],
    fuelTypes: ["Petrol"],
    transmissions: ["Automatic"],
    driveTypes: ["RWD"],
    colors: ["Black"],
    locations: ["Tallinn"],
    conditions: ["Used"],
    bodyTypeHierarchy: [{ category: "passengerCar", subtypes: ["sedan"] }],
};

function TestForm() {
    const methods = useForm<SellFormValues>({
        defaultValues: {
            contactName: "",
            contactEmail: "",
            contactPhone: "",
            make: "",
            model: "",
            variant: "",
            year: 2024,
            vin: "",
            mileage: 0,
            price: 0,
            priceVatIncluded: true,
            location: "",
            bodyType: "",
            fuelType: "",
            transmission: "",
            powerKw: 0,
            driveType: "",
            doors: 4,
            seats: 5,
            colorExterior: "",
            colorInterior: "",
            condition: "",
            description: "",
            features: {},
        },
    });

    useEffect(() => {
        methods.setError("contactName", {
            type: "manual",
            message: "sell.validation.contactName.minLength",
        });
    }, [methods]);

    return (
        <FormProvider {...methods}>
            <Step2VehicleData
                validationAttempted={true}
                referenceData={referenceData}
                models={["3 Series"]}
                isLoadingModels={false}
                modelError={null}
                onRetryModels={vi.fn()}
            />
        </FormProvider>
    );
}

describe("Step2VehicleData", () => {
    it("translates schema validation keys before rendering them", async () => {
        render(<TestForm />);

        await waitFor(() => {
            expect(screen.getByText("Translated contact name error")).toBeInTheDocument();
        });

        expect(screen.queryByText("sell.validation.contactName.minLength")).not.toBeInTheDocument();
    });
});
