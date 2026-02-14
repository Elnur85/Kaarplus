import { z } from "zod";

export const createListingSchema = z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    variant: z.string().optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    vin: z.string().optional(),
    mileage: z.number().int().min(0),
    price: z.number().positive(),
    priceVatIncluded: z.boolean().default(true),
    bodyType: z.string().min(1, "Body type is required"),
    fuelType: z.string().min(1, "Fuel type is required"),
    transmission: z.string().min(1, "Transmission is required"),
    powerKw: z.number().int().positive(),
    driveType: z.string().optional(),
    doors: z.number().int().positive().optional(),
    seats: z.number().int().positive().optional(),
    colorExterior: z.string().min(1, "Exterior color is required"),
    colorInterior: z.string().optional(),
    condition: z.string().min(1, "Condition is required"),
    description: z.string().optional(),
    features: z.record(z.string(), z.any()).default({}),
    location: z.string().min(1, "Location is required"),
});

export const updateListingSchema = createListingSchema.partial();

export const listingQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(20),
    sort: z.enum(["newest", "oldest", "price_asc", "price_desc"]).default("newest"),
    make: z.string().optional(),
    model: z.string().optional(),
    yearMin: z.coerce.number().int().optional(),
    yearMax: z.coerce.number().int().optional(),
    priceMin: z.coerce.number().optional(),
    priceMax: z.coerce.number().optional(),
    fuelType: z.string().optional(), // Can be comma-separated
    transmission: z.string().optional(),
    bodyType: z.string().optional(),
    color: z.string().optional(),
    q: z.string().optional(),
    status: z.string().optional(),
});

export const contactSellerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    message: z.string().min(1, "Message is required"),
    phone: z.string().optional(),
});
