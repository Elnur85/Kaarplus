import { prisma } from "@kaarplus/database";

interface PaginationParams {
	page?: number;
	pageSize?: number;
}

interface PaginatedResult<T> {
	data: T[];
	meta: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
}

export const messageService = {
	/**
	 * Get conversations grouped by unique sender-recipient-listing combination.
	 * Returns the latest message from each conversation thread with pagination.
	 */
	async getConversations(
		userId: string,
		pagination: PaginationParams = {}
	): Promise<PaginatedResult<unknown>> {
		const page = Math.max(1, pagination.page ?? 1);
		const pageSize = Math.min(50, Math.max(1, pagination.pageSize ?? 20));
		const skip = (page - 1) * pageSize;

		// First, get the total count of unique conversations
		const conversationsData = await prisma.$queryRaw<{ conversation_key: string; max_date: Date }[]>`
            SELECT 
                CONCAT(LEAST("senderId", "recipientId"), '-', GREATEST("senderId", "recipientId"), ':', COALESCE("listingId", 'general')) as conversation_key,
                MAX("createdAt") as max_date
            FROM "Message"
            WHERE "senderId" = ${userId} OR "recipientId" = ${userId}
            GROUP BY 
                LEAST("senderId", "recipientId"), 
                GREATEST("senderId", "recipientId"), 
                COALESCE("listingId", 'general')
            ORDER BY max_date DESC
        `;

		const totalConversations = conversationsData.length;
		const paginatedKeys = conversationsData.slice(skip, skip + pageSize);

		if (paginatedKeys.length === 0) {
			return {
				data: [],
				meta: { page, pageSize, total: 0, totalPages: 0 }
			};
		}

		// Get the latest message for each conversation
		const conversationKeys = paginatedKeys.map(k => k.conversation_key);

		const messages = await prisma.message.findMany({
			where: {
				OR: conversationKeys.map(key => {
					const [participants, listingId] = key.split(':');
					const [senderId, recipientId] = participants.split('-');
					return {
						senderId: { in: [senderId, recipientId] },
						recipientId: { in: [senderId, recipientId] },
						listingId: listingId === 'general' ? null : listingId
					};
				})
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

		// Get the latest message for each conversation
		const latestMessages = new Map<string, typeof messages[0]>();
		for (const msg of messages) {
			const participants = [msg.senderId, msg.recipientId].sort().join("-");
			const key = `${participants}:${msg.listingId || "general"}`;
			if (!latestMessages.has(key)) {
				latestMessages.set(key, msg);
			}
		}

		return {
			data: Array.from(latestMessages.values()),
			meta: {
				page,
				pageSize,
				total: totalConversations,
				totalPages: Math.ceil(totalConversations / pageSize),
			},
		};
	},

	/**
	 * Get all messages in a conversation thread between two users,
	 * optionally scoped to a specific listing with pagination.
	 * Marks unread messages as read for the current user.
	 */
	async getThread(
		userId: string,
		otherUserId: string,
		listingId?: string,
		pagination: PaginationParams = {}
	): Promise<PaginatedResult<unknown>> {
		const page = Math.max(1, pagination.page ?? 1);
		const pageSize = Math.min(100, Math.max(1, pagination.pageSize ?? 50));
		const skip = (page - 1) * pageSize;

		const whereCondition = {
			OR: [
				{ senderId: userId, recipientId: otherUserId },
				{ senderId: otherUserId, recipientId: userId },
			],
			...(listingId ? { listingId } : {}),
		};

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

		const [messages, total] = await Promise.all([
			prisma.message.findMany({
				where: whereCondition,
				include: {
					sender: { select: { id: true, name: true, image: true } },
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: pageSize,
			}),
			prisma.message.count({ where: whereCondition }),
		]);

		return {
			data: messages.reverse(), // Return in chronological order
			meta: {
				page,
				pageSize,
				total,
				totalPages: Math.ceil(total / pageSize),
			},
		};
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

		// Verify recipient exists
		const recipient = await prisma.user.findUnique({
			where: { id: data.recipientId },
			select: { id: true },
		});
		if (!recipient) {
			throw new Error("RECIPIENT_NOT_FOUND");
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
