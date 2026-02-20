import { prisma } from "@kaarplus/database";

import { NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";

import { emailService } from "./emailService";
import { socketService } from "./socketService";

export class DealershipService {
    async getDealerships() {
        return prisma.user.findMany({
            where: {
                role: "DEALERSHIP",
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                image: true,
                coverImage: true,
                bio: true,
                website: true,
                address: true,
                openingHours: true,
                _count: {
                    select: {
                        listings: {
                            where: { status: "ACTIVE" },
                        },
                    },
                },
            },
            orderBy: { name: "asc" },
        });
    }

    async getDealershipById(id: string) {
        const dealership = await prisma.user.findFirst({
            where: {
                id,
                role: "DEALERSHIP",
                deletedAt: null,
            },
            select: {
                id: true,
                email: true,
                phone: true,
                name: true,
                image: true,
                coverImage: true,
                bio: true,
                website: true,
                address: true,
                openingHours: true,
                createdAt: true,
            },
        });

        if (!dealership) {
            throw new NotFoundError("Dealership not found");
        }

        return dealership;
    }

    async getDealershipListings(id: string) {
        return prisma.listing.findMany({
            where: {
                userId: id,
                status: "ACTIVE",
            },
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

    async contactDealership(
        id: string,
        contactData: { name?: string; email?: string; phone?: string; message: string },
        senderId?: string
    ) {
        const dealership = await prisma.user.findFirst({
            where: {
                id,
                role: "DEALERSHIP",
                deletedAt: null,
            },
        });
        if (!dealership) throw new NotFoundError("Dealership not found");

        const messageBody = senderId
            ? contactData.message
            : `Nimi: ${contactData.name || "Anonüümne"}\nEmail: ${contactData.email || "Puudub"}\nTelefon: ${contactData.phone || "Puudub"}\n\nSõnum:\n${contactData.message}`;

        const message = await prisma.message.create({
            data: {
                recipientId: dealership.id,
                subject: `Päring esindusele: ${contactData.name || "Kasutaja"}`,
                body: messageBody,
                ...(senderId && { senderId }),
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                }
            }
        });

        // Notify recipient via Socket.io if initialized
        try {
            if (socketService.isInitialized() && message.senderId) {
                // @ts-expect-error Ignoring type mismatch for socket emission matching listingService
                socketService.emitNewMessage(message);
            }
        } catch (error) {
            logger.warn("[DealershipService] Failed to emit socket message", {
                error: error instanceof Error ? error.message : String(error),
            });
        }

        // Send email notification to seller (async, non-blocking)
        if (dealership.email) {
            const senderName = senderId
                ? (message.sender?.name || "Kasutaja")
                : contactData.name;

            emailService.sendNewMessageEmail(
                dealership.email,
                senderName || "Huviline",
                "Teie esindusele" // general subject
            ).catch(err => {
                logger.warn("[DealershipService] Failed to send email notification", {
                    error: err instanceof Error ? err.message : String(err),
                });
            });
        }

        return message;
    }
}
