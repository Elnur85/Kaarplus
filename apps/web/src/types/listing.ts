import { VehicleSummary } from "./vehicle";

export interface ListingImage {
    id: string;
    url: string;
    order: number;
}

export interface ListingDetailed extends Omit<VehicleSummary, 'thumbnailUrl' | 'user'> {
    vin?: string;
    description?: string;
    features: Record<string, boolean>;
    driveType?: string;
    doors?: number;
    seats?: number;
    colorExterior: string;
    colorInterior?: string;
    condition: string;
    powerKw: number;
    location: string;
    viewCount: number;
    favoriteCount: number;
    verifiedAt?: string;
    publishedAt?: string;
    updatedAt: string;
    images: ListingImage[];
    user: {
        id: string;
        name: string | null;
        email: string;
        phone: string | null;
        role: "USER" | "DEALERSHIP" | "ADMIN" | "SUPPORT" | string;
        dealershipId: string | null;
        image?: string | null;
        coverImage?: string | null;
        bio?: string | null;
        website?: string | null;
        address?: string | null;
        openingHours?: string | null;
    };
}
