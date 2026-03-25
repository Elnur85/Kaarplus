import { z } from "zod";

export const sellFormSchema = z.object({
    // Contact info
    contactName: z.string().min(2, "sell.validation.contactName.minLength"),
    contactEmail: z.string().email("sell.validation.contactEmail.invalid"),
    contactPhone: z.string().min(5, "sell.validation.contactPhone.invalid"),

    // Basic info
    make: z.string().min(1, "sell.validation.make.required"),
    model: z.string().min(1, "sell.validation.model.required"),
    variant: z.string().nullable().optional(),
    year: z.coerce.number().int().min(1900, "sell.validation.year.range").max(new Date().getFullYear() + 1, "sell.validation.year.range"),
    vin: z.string().length(17, "sell.validation.vin.length").nullable().optional().or(z.literal("")),
    mileage: z.coerce.number().int().min(0, "sell.validation.mileage.nonNegative"),
    price: z.coerce.number().positive("sell.validation.price.positive"),
    priceVatIncluded: z.boolean().default(true),
    location: z.string().min(1, "sell.validation.location.required"),

    // Technical info
    bodyType: z.string().min(1, "sell.validation.bodyType.required"),
    fuelType: z.string().min(1, "sell.validation.fuelType.required"),
    transmission: z.string().min(1, "sell.validation.transmission.required"),
    powerKw: z.coerce.number().int().positive("sell.validation.powerKw.required"),
    driveType: z.string().min(1, "sell.validation.driveType.required"),
    doors: z.coerce.number().int().min(2, "sell.validation.doors.range").max(5, "sell.validation.doors.range"),
    seats: z.coerce.number().int().min(1, "sell.validation.seats.range").max(9, "sell.validation.seats.range"),
    colorExterior: z.string().min(1, "sell.validation.colorExterior.required"),
    colorInterior: z.string().nullable().optional(),
    condition: z.string().min(1, "sell.validation.condition.required"),
    description: z.string().max(5000, "sell.validation.description.maxLength").nullable().optional(),

    // Features (stored as Boolean record)
    features: z.record(z.string(), z.boolean()).default({}),
});

export type SellFormValues = z.infer<typeof sellFormSchema>;
