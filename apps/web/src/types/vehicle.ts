export interface VehicleSummary {
    id: string;
    make: string;
    model: string;
    variant?: string;
    year: number;
    price: number;
    priceVatIncluded: boolean;
    mileage: number;
    fuelType: string;
    transmission: string;
    powerKw?: number;
    bodyType: string;
    thumbnailUrl: string;
    status: "ACTIVE" | "PENDING" | "SOLD" | "REJECTED" | "EXPIRED";
    badges?: Array<"new" | "hot_deal" | "certified" | "verified">;
    isFavorited?: boolean;
    isSponsored?: boolean;
    createdAt: string;
    location?: string;
    user?: {
        name: string | null;
        role: "BUYER" | "INDIVIDUAL_SELLER" | "DEALERSHIP" | "ADMIN" | "SUPPORT";
        dealershipId: string | null;
    };
}
