export interface AdData {
  id: string;
  title: string;
  imageUrl: string | null;
  imageUrlMobile: string | null;
  linkUrl: string | null;
  adSenseSnippet: string | null;
  campaign: {
    id: string;
    priority: number;
  };
  adUnit: {
    placementId: string;
    width: number;
    height: number;
    type: "BANNER" | "NATIVE" | "ADSENSE";
  };
}

export interface SponsoredListingData {
  id: string;
  listingId: string;
  boostMultiplier: number;
  listing: {
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
    bodyType: string;
    status: string;
    images: Array<{ url: string; order: number }>;
    user: {
      id: string;
      name: string | null;
      role: string;
    };
  };
}
