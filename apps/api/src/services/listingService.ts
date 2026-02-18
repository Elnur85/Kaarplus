import { prisma, ListingStatus, Prisma } from "@kaarplus/database";

import { cacheService } from "../utils/cache";
import { ForbiddenError, NotFoundError } from "../utils/errors";

import { UploadService } from "./uploadService";

const uploadService = new UploadService();

export interface ListingQuery {
    page: number;
    pageSize: number;
    sort: "newest" | "oldest" | "price_asc" | "price_desc";
    make?: string;
    model?: string;
    yearMin?: number;
    yearMax?: number;
    priceMin?: number;
    priceMax?: number;
    fuelType?: string;
    transmission?: string;
    bodyType?: string;
    color?: string;
    q?: string;
    status?: string;
    mileageMin?: number;
    mileageMax?: number;
    powerMin?: number;
    powerMax?: number;
    driveType?: string;
    doors?: number;
    seats?: number;
    condition?: string;
    location?: string;
}

const LISTING_SUMMARY_SELECT = {
    id: true,
    make: true,
    model: true,
    variant: true,
    year: true,
    price: true,
    priceVatIncluded: true,
    mileage: true,
    fuelType: true,
    transmission: true,
    bodyType: true,
    status: true,
    location: true,
    createdAt: true,
    publishedAt: true,
    verifiedAt: true,
} satisfies Prisma.ListingSelect;

export class ListingService {
    private invalidateSearchCache() {
        cacheService.invalidatePattern("search:");
    }

    async getAllListings(query: ListingQuery, isAdmin: boolean = false): Promise<any> {
        const {
            page,
            pageSize,
            sort,
            make,
            model,
            yearMin,
            yearMax,
            priceMin,
            priceMax,
            fuelType,
            transmission,
            bodyType,
            color,
            q,
            status,
            mileageMin,
            mileageMax,
            powerMin,
            powerMax,
            driveType,
            doors,
            seats,
            condition,
            location,
        } = query;

        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const where: Prisma.ListingWhereInput = {};

        // Default status for public is ACTIVE
        if (!isAdmin) {
            where.status = "ACTIVE";
        } else if (status) {
            where.status = status as ListingStatus;
        }

        if (make) where.make = { equals: make, mode: "insensitive" };
        if (model) where.model = { equals: model, mode: "insensitive" };
        if (yearMin || yearMax) {
            where.year = {
                gte: yearMin,
                lte: yearMax,
            };
        }
        if (priceMin || priceMax) {
            where.price = {
                gte: priceMin,
                lte: priceMax,
            };
        }
        if (fuelType) {
            const fuels = fuelType.split(",");
            where.fuelType = { in: fuels };
        }
        if (transmission) where.transmission = transmission;
        if (bodyType) where.bodyType = bodyType;
        if (color) where.colorExterior = { equals: color, mode: "insensitive" };
        if (mileageMin || mileageMax) {
            where.mileage = {
                gte: mileageMin,
                lte: mileageMax,
            };
        }
        if (powerMin || powerMax) {
            where.powerKw = {
                gte: powerMin,
                lte: powerMax,
            };
        }
        if (driveType && driveType !== "none") where.driveType = driveType;
        if (doors) where.doors = doors;
        if (seats) where.seats = seats;
        if (condition && condition !== "none") where.condition = condition;
        if (location && location !== "none") where.location = { equals: location, mode: "insensitive" };

        if (q) {
            where.OR = [
                { make: { contains: q, mode: "insensitive" } },
                { model: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
            ];
        }

        let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: "desc" };
        if (sort === "oldest") orderBy = { createdAt: "asc" };
        if (sort === "price_asc") orderBy = { price: "asc" };
        if (sort === "price_desc") orderBy = { price: "desc" };
        if (sort === "newest") orderBy = { publishedAt: "desc" };

        // Only cache public searches
        const cacheKey = !isAdmin ? `search:results:${JSON.stringify(query)}` : null;
        if (cacheKey) {
            const cached = cacheService.get(cacheKey);
            if (cached) return cached as any;
        }

        const [listings, total] = await Promise.all([
            prisma.listing.findMany({
                where,
                select: {
                    ...LISTING_SUMMARY_SELECT,
                    images: {
                        where: { verified: true },
                        orderBy: { order: "asc" },
                        take: 1,
                        select: { url: true },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            role: true,
                            dealershipId: true,
                        },
                    },
                },
                orderBy,
                skip,
                take,
            }),
            prisma.listing.count({ where }),
        ]);

        const result = {
            data: listings,
            meta: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };

        if (cacheKey) {
            cacheService.set(cacheKey, result, 300); // 5 minutes cache for results
        }

        return result;
    }



    async getListingById(id: string): Promise<any> {
        const cacheKey = `search:listing:${id}`;
        const cached = cacheService.get(cacheKey);
        if (cached) return cached as any;

        const listing = await prisma.listing.findUnique({
            where: { id },
            include: {
                images: {
                    orderBy: { order: "asc" },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phone: true,
                        role: true,
                        dealershipId: true,
                        image: true,
                    },
                },
            },
        });

        if (!listing) {
            throw new NotFoundError("Listing not found");
        }

        // Increment view count (async, don't block)
        prisma.listing.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        }).catch(err => console.error("Failed to increment view count:", err));

        cacheService.set(cacheKey, listing, 600); // 10 minutes cache for details
        return listing;
    }

    async createListing(userId: string, data: Prisma.ListingCreateWithoutUserInput) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundError("User not found");

        if (user.role === "INDIVIDUAL_SELLER") {
            const activeCount = await prisma.listing.count({
                where: {
                    userId,
                    status: { in: ["ACTIVE", "PENDING"] },
                },
            });

            if (activeCount >= 5) {
                throw new ForbiddenError("Erakasutajana on Teil lubatud maksimaalselt 5 aktiivset kuulutust. Vormistage end automüügiks ümber, et lisada rohkem kuulutusi.");
            }
        }

        const result = await prisma.listing.create({
            data: {
                ...data,
                userId,
                status: "PENDING",
            },
        });

        this.invalidateSearchCache();
        return result;
    }

    async updateListing(id: string, userId: string, isAdmin: boolean, data: Prisma.ListingUpdateInput) {
        const listing = await prisma.listing.findUnique({ where: { id } });
        if (!listing) throw new NotFoundError("Listing not found");

        if (!isAdmin && listing.userId !== userId) {
            throw new ForbiddenError("You don't have permission to update this listing");
        }

        const result = await prisma.listing.update({
            where: { id },
            data,
        });

        this.invalidateSearchCache();
        cacheService.delete(`search:listing:${id}`);
        return result;
    }

    async deleteListing(id: string, userId: string, isAdmin: boolean) {
        const listing = await prisma.listing.findUnique({ where: { id } });
        if (!listing) throw new NotFoundError("Listing not found");

        if (!isAdmin && listing.userId !== userId) {
            throw new ForbiddenError("You don't have permission to delete this listing");
        }

        const result = await prisma.listing.delete({ where: { id } });

        this.invalidateSearchCache();
        cacheService.delete(`search:listing:${id}`);
        return result;
    }

    async getSimilarListings(id: string) {
        const listing = await prisma.listing.findUnique({ where: { id } });
        if (!listing) throw new NotFoundError("Listing not found");

        return prisma.listing.findMany({
            where: {
                id: { not: id },
                status: "ACTIVE",
                OR: [
                    { make: listing.make },
                    { bodyType: listing.bodyType },
                ],
            },
            take: 4,
            include: {
                images: {
                    where: { verified: true },
                    orderBy: { order: "asc" },
                    take: 1,
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async contactSeller(
        id: string,
        contactData: { name: string; email: string; phone?: string; message: string },
        senderId?: string
    ) {
        const listing = await prisma.listing.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!listing) throw new NotFoundError("Listing not found");

        // For anonymous users, create a system message with contact details
        // For logged-in users, use their user ID as sender
        const messageBody = senderId
            ? contactData.message
            : `Nimi: ${contactData.name}\nEmail: ${contactData.email}\nTelefon: ${contactData.phone || "Puudub"}\n\nSõnum:\n${contactData.message}`;

        return prisma.message.create({
            data: {
                senderId: senderId || "system",
                recipientId: listing.userId,
                listingId: listing.id,
                subject: `Päring kuulutuse kohta: ${listing.make} ${listing.model}`,
                body: messageBody,
            },
        });
    }

    async addImages(listingId: string, userId: string, isAdmin: boolean, images: { url: string; order: number }[]) {
        const listing = await prisma.listing.findUnique({ where: { id: listingId } });
        if (!listing) throw new NotFoundError("Listing not found");

        if (!isAdmin && listing.userId !== userId) {
            throw new ForbiddenError("You don't have permission to add images to this listing");
        }

        return prisma.listingImage.createMany({
            data: images.map((img) => ({
                listingId,
                url: img.url,
                order: img.order,
            })),
        });
    }

    async reorderImages(listingId: string, userId: string, isAdmin: boolean, imageOrders: { id: string; order: number }[]) {
        const listing = await prisma.listing.findUnique({ where: { id: listingId } });
        if (!listing) throw new NotFoundError("Listing not found");

        if (!isAdmin && listing.userId !== userId) {
            throw new ForbiddenError("You don't have permission to reorder images for this listing");
        }

        const updates = imageOrders.map((img) =>
            prisma.listingImage.update({
                where: { id: img.id },
                data: { order: img.order },
            })
        );

        return prisma.$transaction(updates);
    }

    async deleteImage(listingId: string, imageId: string, userId: string, isAdmin: boolean) {
        const listing = await prisma.listing.findUnique({ where: { id: listingId } });
        if (!listing) throw new NotFoundError("Listing not found");

        if (!isAdmin && listing.userId !== userId) {
            throw new ForbiddenError("You don't have permission to delete images from this listing");
        }

        const image = await prisma.listingImage.findUnique({ where: { id: imageId } });
        if (!image) throw new NotFoundError("Image not found");

        // Delete from S3
        await uploadService.deleteFile(image.url);

        return prisma.listingImage.delete({
            where: { id: imageId },
        });
    }
}
