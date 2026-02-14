import { prisma, ListingStatus, Prisma } from "@kaarplus/database";

import { ForbiddenError, NotFoundError } from "../utils/errors";

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
}

export class ListingService {
    async getAllListings(query: ListingQuery, isAdmin: boolean = false) {
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

        const [listings, total] = await Promise.all([
            prisma.listing.findMany({
                where,
                include: {
                    images: {
                        where: { verified: true },
                        orderBy: { order: "asc" },
                        take: 1,
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

        return {
            data: listings,
            meta: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }

    async getListingById(id: string) {
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
                    },
                },
            },
        });

        if (!listing) {
            throw new NotFoundError("Listing not found");
        }

        // Increment view count
        await prisma.listing.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });

        return listing;
    }

    async createListing(userId: string, data: Prisma.ListingCreateWithoutUserInput) {
        return prisma.listing.create({
            data: {
                ...data,
                userId,
                status: "PENDING",
            },
        });
    }

    async updateListing(id: string, userId: string, isAdmin: boolean, data: Prisma.ListingUpdateInput) {
        const listing = await prisma.listing.findUnique({ where: { id } });
        if (!listing) throw new NotFoundError("Listing not found");

        if (!isAdmin && listing.userId !== userId) {
            throw new ForbiddenError("You don't have permission to update this listing");
        }

        return prisma.listing.update({
            where: { id },
            data,
        });
    }

    async deleteListing(id: string, userId: string, isAdmin: boolean) {
        const listing = await prisma.listing.findUnique({ where: { id } });
        if (!listing) throw new NotFoundError("Listing not found");

        if (!isAdmin && listing.userId !== userId) {
            throw new ForbiddenError("You don't have permission to delete this listing");
        }

        return prisma.listing.delete({ where: { id } });
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

    async contactSeller(id: string, contactData: { name: string; email: string; phone?: string; message: string }) {
        const listing = await prisma.listing.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!listing) throw new NotFoundError("Listing not found");

        return prisma.message.create({
            data: {
                senderId: listing.userId,
                recipientId: listing.userId,
                listingId: listing.id,
                subject: `Päring kuulutuse kohta: ${listing.make} ${listing.model}`,
                body: `Nimi: ${contactData.name}\nEmail: ${contactData.email}\nTelefon: ${contactData.phone || "Puudub"}\n\nSõnum:\n${contactData.message}`,
            },
        });
    }
}
