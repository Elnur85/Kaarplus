
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { messageService } from './messageService';

// Mock Prisma
const mockPrisma = {
	message: {
		findMany: vi.fn(),
		count: vi.fn(),
		create: vi.fn(),
		updateMany: vi.fn(),
	},
	user: {
		findUnique: vi.fn(),
	},
	$queryRaw: vi.fn(),
};

vi.mock('@kaarplus/database', () => ({
	prisma: mockPrisma,
}));

describe('MessageService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getConversations', () => {
		it('should return paginated conversations', async () => {
			const userId = 'u1';
			// Mock raw query response for conversation keys
			mockPrisma.$queryRaw.mockResolvedValue([
				{ conversation_key: 'u1-u2:general', max_date: new Date() }
			]);

			mockPrisma.message.findMany.mockResolvedValue([
				{ id: 'm1', senderId: 'u1', recipientId: 'u2', listingId: null, body: 'hello' }
			]);

			const result = await messageService.getConversations(userId, { page: 1, pageSize: 10 });

			expect(result.data).toHaveLength(1);
			expect(result.meta.total).toBe(1);
			expect(mockPrisma.message.findMany).toHaveBeenCalled();
		});

		it('should return empty if no conversations', async () => {
			mockPrisma.$queryRaw.mockResolvedValue([]);
			const result = await messageService.getConversations('u1');
			expect(result.data).toEqual([]);
			expect(result.meta.total).toBe(0);
		});
	});

	describe('getThread', () => {
		it('should return messages and mark as read', async () => {
			const u1 = 'u1';
			const u2 = 'u2';
			const mockMessages = [{ id: 'm1', senderId: u2, recipientId: u1, read: true }];

			mockPrisma.message.findMany.mockResolvedValue(mockMessages);
			mockPrisma.message.count.mockResolvedValue(1);

			const result = await messageService.getThread(u1, u2);

			expect(result.data).toEqual(mockMessages);
			// Check if it marks messages as read
			expect(mockPrisma.message.updateMany).toHaveBeenCalledWith(expect.objectContaining({
				where: expect.objectContaining({
					recipientId: u1,
					senderId: u2,
					read: false,
				}),
				data: { read: true },
			}));
		});
	});

	describe('sendMessage', () => {
		it('should create message', async () => {
			const senderId = 'u1';
			const recipientId = 'u2';
			mockPrisma.user.findUnique.mockResolvedValue({ id: recipientId });
			mockPrisma.message.create.mockResolvedValue({ id: 'm1' });

			await messageService.sendMessage(senderId, {
				recipientId,
				body: 'test',
			});

			expect(mockPrisma.message.create).toHaveBeenCalledWith(expect.objectContaining({
				data: expect.objectContaining({
					senderId,
					recipientId,
					body: 'test',
				}),
			}));
		});

		it('should throw if self-message', async () => {
			await expect(messageService.sendMessage('u1', { recipientId: 'u1', body: 'hi' }))
				.rejects.toThrow('CANNOT_MESSAGE_SELF');
		});

		it('should throw if recipient not found', async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null);
			await expect(messageService.sendMessage('u1', { recipientId: 'u2', body: 'hi' }))
				.rejects.toThrow('RECIPIENT_NOT_FOUND');
		});
	});

	describe('getUnreadCount', () => {
		it('should return count', async () => {
			mockPrisma.message.count.mockResolvedValue(5);
			const count = await messageService.getUnreadCount('u1');
			expect(count).toBe(5);
		});
	});
});
