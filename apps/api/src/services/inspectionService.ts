import { prisma, InspectionStatus } from "@kaarplus/database";

import { BadRequestError, NotFoundError, ForbiddenError } from "../utils/errors";

export class InspectionService {
    async requestInspection(requesterId: string, listingId: string) {
        // Verify listing exists
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        });
        if (!listing) {
            throw new NotFoundError("Listing not found");
        }

        // Check for existing pending/scheduled inspection by same user
        const existing = await prisma.vehicleInspection.findFirst({
            where: {
                listingId,
                requesterId,
                status: { in: [InspectionStatus.PENDING, InspectionStatus.SCHEDULED, InspectionStatus.IN_PROGRESS] },
            },
        });
        if (existing) {
            throw new BadRequestError("You already have an active inspection request for this listing");
        }

        const inspection = await prisma.vehicleInspection.create({
            data: {
                listingId,
                requesterId,
            },
            include: {
                listing: {
                    select: {
                        id: true,
                        make: true,
                        model: true,
                        year: true,
                    },
                },
            },
        });

        return inspection;
    }

    async getInspectionsByUser(userId: string) {
        const inspections = await prisma.vehicleInspection.findMany({
            where: { requesterId: userId },
            include: {
                listing: {
                    select: {
                        id: true,
                        make: true,
                        model: true,
                        year: true,
                        images: {
                            take: 1,
                            orderBy: { order: "asc" },
                            select: { url: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return { data: inspections };
    }

    async getInspectionById(id: string, userId: string, userRole?: string) {
        const inspection = await prisma.vehicleInspection.findUnique({
            where: { id },
            include: {
                listing: {
                    select: {
                        id: true,
                        make: true,
                        model: true,
                        year: true,
                        images: {
                            take: 1,
                            orderBy: { order: "asc" },
                            select: { url: true },
                        },
                    },
                },
                requester: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!inspection) {
            throw new NotFoundError("Inspection not found");
        }

        const isAdmin = userRole === "ADMIN" || userRole === "SUPPORT";
        if (inspection.requesterId !== userId && !isAdmin) {
            throw new ForbiddenError("You can only view your own inspections");
        }

        return { data: inspection };
    }

    async updateInspectionStatus(
        id: string,
        status: InspectionStatus,
        notes?: string,
        reportUrl?: string,
    ) {
        const inspection = await prisma.vehicleInspection.findUnique({
            where: { id },
            include: {
                listing: { select: { make: true, model: true, year: true } },
                requester: { select: { email: true } },
            },
        });

        if (!inspection) {
            throw new NotFoundError("Inspection not found");
        }

        const updateData: {
            status: InspectionStatus;
            inspectorNotes?: string;
            reportUrl?: string;
            scheduledAt?: Date;
            completedAt?: Date;
        } = { status };

        if (notes !== undefined) {
            updateData.inspectorNotes = notes;
        }
        if (reportUrl !== undefined) {
            updateData.reportUrl = reportUrl;
        }
        if (status === InspectionStatus.SCHEDULED) {
            updateData.scheduledAt = new Date();
        }
        if (status === InspectionStatus.COMPLETED) {
            updateData.completedAt = new Date();
        }

        const updated = await prisma.vehicleInspection.update({
            where: { id },
            data: updateData,
        });

        const listingTitle = `${inspection.listing.year} ${inspection.listing.make} ${inspection.listing.model}`;
        return { data: updated, requesterEmail: inspection.requester.email, listingTitle };
    }
}

export const inspectionService = new InspectionService();
