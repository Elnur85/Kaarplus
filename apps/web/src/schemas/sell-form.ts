import { z } from "zod";

export const sellFormSchema = z.object({
    // Contact info
    contactName: z.string().min(2, "Nimi peab olema vähemalt 2 tähemärki"),
    contactEmail: z.string().email("Palun sisestage kehtiv e-posti aadress"),
    contactPhone: z.string().min(5, "Palun sisestage kehtiv telefoninumber"),

    // Basic info
    make: z.string().min(1, "Mark on kohustuslik"),
    model: z.string().min(1, "Mudel on kohustuslik"),
    variant: z.string().optional(),
    year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
    vin: z.string().length(17, "VIN-kood peab olema 17 tähemärki").optional().or(z.literal("")),
    mileage: z.coerce.number().int().min(0, "Läbisõit ei saa olla negatiivne"),
    price: z.coerce.number().positive("Hind peab olema positiivne"),
    priceVatIncluded: z.boolean().default(true),
    location: z.string().min(1, "Asukoht on kohustuslik"),

    // Technical info
    bodyType: z.string().min(1, "Keretüüp on kohustuslik"),
    fuelType: z.string().min(1, "Kütuse liik on kohustuslik"),
    transmission: z.string().min(1, "Käigukast on kohustuslik"),
    powerKw: z.coerce.number().int().positive("Võimsus on kohustuslik"),
    driveType: z.string().min(1, "Veoskeem on kohustuslik"),
    doors: z.coerce.number().int().min(2).max(5),
    seats: z.coerce.number().int().min(1).max(9),
    colorExterior: z.string().min(1, "Värvus on kohustuslik"),
    colorInterior: z.string().optional(),
    condition: z.string().min(1, "Seisukord on kohustuslik"),
    description: z.string().max(5000, "Kirjeldus on liigpikk").optional(),

    // Features (stored as Boolean record)
    features: z.record(z.string(), z.boolean()).default({}),
});

export type SellFormValues = z.infer<typeof sellFormSchema>;
