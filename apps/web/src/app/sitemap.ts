import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

async function getListings() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings?pageSize=100`, {
            next: { revalidate: 3600 }, // Cache for 1 hour
        });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
    } catch (error) {
        console.error("Failed to fetch listings for sitemap:", error);
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const listings = await getListings();

    const listingEntries: MetadataRoute.Sitemap = listings.map((listing: any) => ({
        url: `${SITE_URL}/listings/${listing.id}`,
        lastModified: listing.updatedAt || listing.createdAt,
        changeFrequency: "daily",
        priority: 0.7,
    }));

    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/listings`,
            lastModified: new Date(),
            changeFrequency: "always",
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/sell`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/faq`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.4,
        },
        {
            url: `${SITE_URL}/privacy`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/terms`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
    ];

    return [...staticPages, ...listingEntries];
}
