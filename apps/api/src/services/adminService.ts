import { prisma } from "@kaarplus/database";

import { NotFoundError, BadRequestError } from "../utils/errors";

export class AdminService {
    async getPendingListings(page: number = 1, pageSize: number = 20) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const [listings, total] = await Promise.all([
            prisma.listing.findMany({
                where: { status: "PENDING" },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    images: {
                        orderBy: { order: "asc" },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            prisma.listing.count({ where: { status: "PENDING" } }),
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

    async verifyListing(id: string, action: "approve" | "reject", _reason?: string) {
        const listing = await prisma.listing.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!listing) {
            throw new NotFoundError("Listing not found");
        }

        if (listing.status !== "PENDING") {
            throw new BadRequestError(`Listing is already ${listing.status.toLowerCase()}`);
        }

        if (action === "approve") {
            return prisma.listing.update({
                where: { id },
                data: {
                    status: "ACTIVE",
                    verifiedAt: new Date(),
                    publishedAt: new Date(),
                    // Automatically verify all images when listing is approved
                    images: {
                        updateMany: {
                            where: { listingId: id },
                            data: { verified: true, verifiedAt: new Date() },
                        },
                    },
                },
            });
        } else {
            // rejection logic
            return prisma.listing.update({
                where: { id },
                data: {
                    status: "REJECTED",
                    // In a real app, we would store the reason in the database or send an email
                    // For now, we just update the status
                },
            });
        }
    }

    async getUsers(page: number = 1, pageSize: number = 20) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            prisma.user.count(),
        ]);

        return {
            data: users,
            meta: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
}
