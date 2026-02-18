import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock must be before importing the service
vi.mock('@kaarplus/database', () => ({
    prisma: {
        message: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            updateMany: vi.fn(),
            count: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        },
        listing: {
            findUnique: vi.fn(),
        },
        $queryRaw: vi.fn(),
        $transaction: vi.fn((callback) => callback(prisma)),
    },
}));

import { messageService } from './messageService';

import { prisma } from '@kaarplus/database';

describe('MessageService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getConversations', () => {
        it('should return paginated conversations', async () => {
            const mockConversations = [
                { conversation_key: 'u1-u2:l1', max_date: new Date() }
            ];
            const mockMessages = [
                { id: 'm1', senderId: 'u1', recipientId: 'u2', listingId: 'l1', body: 'Hello' }
            ];
            vi.mocked(prisma.$queryRaw).mockResolvedValue(mockConversations);
            vi.mocked(prisma.message.findMany).mockResolvedValue(mockMessages as any);

            const result = await messageService.getConversations('u1', { page: 1, pageSize: 20 });
            expect(result.data).toBeDefined();
            expect(prisma.$queryRaw).toHaveBeenCalled();
        });

        it('should return empty array when no conversations', async () => {
            vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

            const result = await messageService.getConversations('u1');
            expect(result.data).toEqual([]);
            expect(result.meta.total).toBe(0);
        });
    });

    describe('getThread', () => {
        it('should return message thread between users', async () => {
            const mockMessages = [
                { id: 'm1', senderId: 'u1', recipientId: 'u2', body: 'Hello' },
                { id: 'm2', senderId: 'u2', recipientId: 'u1', body: 'Hi' },
            ];
            vi.mocked(prisma.message.findMany).mockResolvedValue(mockMessages as any);
            vi.mocked(prisma.message.updateMany).mockResolvedValue({ count: 1 } as any);

            const result = await messageService.getThread('u1', 'u2', 'l1', { page: 1, pageSize: 20 });
            expect(result.data).toHaveLength(2);
            expect(prisma.message.updateMany).toHaveBeenCalled();
        });
    });

    describe('sendMessage', () => {
        it('should create message', async () => {
            const messageData = {
                recipientId: 'u2',
                listingId: 'l1',
                subject: 'Question',
                body: 'Is this still available?',
            };
            
            vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u2' } as any);
            vi.mocked(prisma.message.create).mockResolvedValue({ 
                id: 'm1', 
                senderId: 'u1',
                ...messageData 
            } as any);

            const result = await messageService.sendMessage('u1', messageData);
            expect(result).toBeDefined();
            expect(prisma.message.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        senderId: 'u1',
                        recipientId: 'u2',
                        body: 'Is this still available?',
                    }),
                })
            );
        });

        it('should throw error if messaging self', async () => {
            const messageData = {
                recipientId: 'u1',
                subject: 'Test',
                body: 'Hello',
            };

            await expect(messageService.sendMessage('u1', messageData))
                .rejects.toThrow('CANNOT_MESSAGE_SELF');
        });

        it('should throw error if recipient not found', async () => {
            const messageData = {
                recipientId: 'u2',
                subject: 'Test',
                body: 'Hello',
            };
            
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

            await expect(messageService.sendMessage('u1', messageData))
                .rejects.toThrow('RECIPIENT_NOT_FOUND');
        });

        it('should include sender info in returned message', async () => {
            const messageData = {
                recipientId: 'u2',
                body: 'Hello!',
            };

            const mockSender = { id: 'u1', name: 'User 1', image: null };
            
            vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u2' } as any);
            vi.mocked(prisma.message.create).mockResolvedValue({
                id: 'm1',
                senderId: 'u1',
                recipientId: 'u2',
                listingId: null,
                subject: null,
                body: 'Hello!',
                read: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                sender: mockSender,
            } as any);

            const result = await messageService.sendMessage('u1', messageData);
            
            expect(result).toBeDefined();
            expect(result.sender).toBeDefined();
        });
    });

    describe('getUnreadCount', () => {
        it('should return unread message count', async () => {
            vi.mocked(prisma.message.count).mockResolvedValue(5);

            const result = await messageService.getUnreadCount('u1');
            expect(result).toBe(5);
            expect(prisma.message.count).toHaveBeenCalledWith({
                where: { recipientId: 'u1', read: false },
            });
        });

        it('should return 0 when no unread messages', async () => {
            vi.mocked(prisma.message.count).mockResolvedValue(0);

            const result = await messageService.getUnreadCount('u1');
            expect(result).toBe(0);
        });
    });
});
