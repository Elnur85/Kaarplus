import { prisma } from "@kaarplus/database";

import { emailService } from "../services/emailService";
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
            const updated = await prisma.listing.update({
                where: { id },
                data: {
                    status: "ACTIVE",
                    verifiedAt: new Date(),
                    publishedAt: new Date(),
                    images: {
                        updateMany: {
                            where: { listingId: id },
                            data: { verified: true, verifiedAt: new Date() },
                        },
                    },
                },
            });

            // Send notification email (non-blocking)
            if (listing.user.email) {
                emailService.sendListingApprovedEmail(
                    listing.user.email,
                    `${listing.year} ${listing.make} ${listing.model}`,
                    listing.id
                ).catch(() => { });
            }

            return updated;
        } else {
            // rejection logic
            return prisma.listing.update({
                where: { id },
                data: {
                    status: "REJECTED",
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

    async getAnalytics() {
        const [
            usersCount,
            listingsCount,
            activeListingsCount,
            soldListingsCount,
            pendingListingsCount,
            revenueAggregate,
            recentUsers,
            recentPayments,
            dailyRegistrations,
            dailyListings
        ] = await Promise.all([
            prisma.user.count(),
            prisma.listing.count(),
            prisma.listing.count({ where: { status: "ACTIVE" } }),
            prisma.listing.count({ where: { status: "SOLD" } }),
            prisma.listing.count({ where: { status: "PENDING" } }),
            prisma.payment.aggregate({
                where: { status: "COMPLETED" },
                _sum: { amount: true }
            }),
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                select: { id: true, name: true, email: true, role: true, createdAt: true }
            }),
            prisma.payment.findMany({
                take: 5,
                where: { status: "COMPLETED" },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    amount: true,
                    currency: true,
                    status: true,
                    createdAt: true
                }
            }),
            // Last 30 days registrations
            prisma.$queryRaw`
                SELECT DATE("createdAt") as date, COUNT(*) as count 
                FROM "User" 
                WHERE "createdAt" > NOW() - INTERVAL '30 days' 
                GROUP BY DATE("createdAt") 
                ORDER BY DATE("createdAt") ASC
            `,
            // Last 30 days listings
            prisma.$queryRaw`
                SELECT DATE("createdAt") as date, COUNT(*) as count 
                FROM "Listing" 
                WHERE "createdAt" > NOW() - INTERVAL '30 days' 
                GROUP BY DATE("createdAt") 
                ORDER BY DATE("createdAt") ASC
            `
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const safeDailyRegistrations = (dailyRegistrations as any[]).map(r => ({
            date: r.date,
            count: Number(r.count)
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const safeDailyListings = (dailyListings as any[]).map(r => ({
            date: r.date,
            count: Number(r.count)
        }));

        return {
            summary: {
                totalUsers: usersCount,
                totalListings: listingsCount,
                activeListings: activeListingsCount,
                soldListings: soldListingsCount,
                pendingListings: pendingListingsCount,
                totalRevenue: Number(revenueAggregate._sum.amount || 0),
            },
            recent: {
                users: recentUsers,
                payments: recentPayments,
            },
            charts: {
                registrations: safeDailyRegistrations,
                listings: safeDailyListings
            }
        };
    }

    async getStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            pendingListings,
            activeUsers,
            totalListings,
            verifiedToday
        ] = await Promise.all([
            prisma.listing.count({ where: { status: "PENDING" } }),
            prisma.user.count({ where: { deletedAt: null } }),
            prisma.listing.count(),
            prisma.listing.count({
                where: {
                    status: "ACTIVE",
                    verifiedAt: { gte: today }
                }
            })
        ]);

        return {
            pendingListings,
            activeUsers,
            totalListings,
            verifiedToday
        };
    }
}
