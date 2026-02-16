import { prisma } from "@kaarplus/database";

export const messageService = {
    /**
     * Get conversations grouped by unique sender-recipient-listing combination.
     * Returns the latest message from each conversation thread.
     */
    async getConversations(userId: string) {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { recipientId: userId },
                ],
            },
            include: {
                sender: { select: { id: true, name: true, image: true } },
                recipient: { select: { id: true, name: true, image: true } },
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

        // Group by conversation (unique pair of users + listing)
        const conversationMap = new Map<string, (typeof messages)[0]>();
        for (const msg of messages) {
            const participants = [msg.senderId, msg.recipientId].sort().join("-");
            const key = `${participants}:${msg.listingId || "general"}`;
            if (!conversationMap.has(key)) {
                conversationMap.set(key, msg);
            }
        }

        return Array.from(conversationMap.values());
    },

    /**
     * Get all messages in a conversation thread between two users,
     * optionally scoped to a specific listing.
     * Marks unread messages as read for the current user.
     */
    async getThread(userId: string, otherUserId: string, listingId?: string) {
        const whereCondition: Record<string, unknown> = {
            OR: [
                { senderId: userId, recipientId: otherUserId },
                { senderId: otherUserId, recipientId: userId },
            ],
        };
        if (listingId) {
            whereCondition.listingId = listingId;
        }

        // Mark unread messages from the other user as read
        await prisma.message.updateMany({
            where: {
                recipientId: userId,
                senderId: otherUserId,
                ...(listingId ? { listingId } : {}),
                read: false,
            },
            data: { read: true },
        });

        return prisma.message.findMany({
            where: whereCondition,
            include: {
                sender: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: "asc" },
        });
    },

    /**
     * Send a message from one user to another.
     * Prevents sending messages to yourself.
     */
    async sendMessage(
        senderId: string,
        data: {
            recipientId: string;
            listingId?: string;
            subject?: string;
            body: string;
        },
    ) {
        if (senderId === data.recipientId) {
            throw new Error("CANNOT_MESSAGE_SELF");
        }

        return prisma.message.create({
            data: {
                senderId,
                recipientId: data.recipientId,
                listingId: data.listingId || null,
                subject: data.subject || null,
                body: data.body,
            },
            include: {
                sender: { select: { id: true, name: true, image: true } },
            },
        });
    },

    /**
     * Get the count of unread messages for a user.
     */
    async getUnreadCount(userId: string) {
        return prisma.message.count({
            where: {
                recipientId: userId,
                read: false,
            },
        });
    },
};
