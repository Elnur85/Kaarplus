import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock must be before importing the service
vi.mock('@kaarplus/database', () => ({
    prisma: {
        savedSearch: {
            findMany: vi.fn(),
            count: vi.fn(),
            create: vi.fn(),
            findFirst: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

import { savedSearchService } from './savedSearchService';

import { prisma } from '@kaarplus/database';

describe('SavedSearchService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getSavedSearches', () => {
        it('should return list', async () => {
            vi.mocked(prisma.savedSearch.findMany).mockResolvedValue([]);
            const result = await savedSearchService.getSavedSearches('u1');
            expect(result).toEqual([]);
        });
    });

    describe('createSavedSearch', () => {
        it('should create if under limit', async () => {
            vi.mocked(prisma.savedSearch.count).mockResolvedValue(5);
            vi.mocked(prisma.savedSearch.create).mockResolvedValue({ id: 's1' } as any);

            await savedSearchService.createSavedSearch('u1', { name: 'Test', filters: {} });
            expect(prisma.savedSearch.create).toHaveBeenCalled();
        });
    });

    describe('deleteSavedSearch', () => {
        it('should delete owned search', async () => {
            vi.mocked(prisma.savedSearch.findFirst).mockResolvedValue({ id: 's1', userId: 'u1' } as any);
            vi.mocked(prisma.savedSearch.delete).mockResolvedValue({} as any);

            await savedSearchService.deleteSavedSearch('s1', 'u1');
            expect(prisma.savedSearch.delete).toHaveBeenCalledWith({ where: { id: 's1' } });
        });
    });
});
