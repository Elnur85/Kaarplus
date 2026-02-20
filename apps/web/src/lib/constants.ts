export const API_URL = "/api/v1";

export const SITE_NAME = "Kaarplus";
export const SITE_DESCRIPTION = "Eesti suurim autode ost-müügi platvorm. Leia oma unistuste auto!";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const CURRENCY = "EUR";
export const DEFAULT_LOCALE = "et";

export const LISTING_PHOTO_MIN = 3;
export const LISTING_PHOTO_MAX = 30;
export const LISTING_PHOTO_MAX_SIZE_MB = 10;

export const INDIVIDUAL_LISTING_LIMIT = 5;
export const COMPARISON_MAX = 4;

export const BODY_TYPES = [
	"Micro",
	"Sedan",
	"Hatchback",
	"Family Car",
	"Sport",
	"SUV",
	"Truck",
	"Van",
] as const;

export const FUEL_TYPES = [
	"Petrol",
	"Diesel",
	"Hybrid",
	"Electric",
	"CNG",
	"LPG",
	"Ethanol",
] as const;

export const TRANSMISSION_TYPES = ["Manual", "Automatic"] as const;

export const DRIVE_TYPES = ["FWD", "RWD", "AWD", "4WD"] as const;

export const ESTONIAN_CITIES = [
	"Tallinn",
	"Tartu",
	"Narva",
	"Pärnu",
	"Kohtla-Järve",
	"Viljandi",
	"Maardu",
	"Rakvere",
	"Sillamäe",
	"Kuressaare",
	"Võru",
	"Valga",
	"Jõhvi",
	"Haapsalu",
	"Keila",
	"Paide",
	"Tapa",
	"Põlva",
	"Kiviõli",
	"Türi",
	"Elva",
	"Saue",
	"Põltsamaa",
	"Saku",
	"Laagri",
	"Anslia",
	"Kunda",
	"Loksa",
	"Tõrva",
	"Kehra",
	"Räpina",
	"Narva-Jõesuu",
	"Tamsalu",
	"Kilingi-Nõmme",
	"Otepää",
	"Karksi-Nuia",
	"Lihula",
	"Mustvee",
	"Võhma",
	"Antsla",
	"Abja-Paluoja",
	"Püssi",
	"Kallaste",
	"Mõisaküla",
] as const;
