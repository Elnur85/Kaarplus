import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@kaarplus/database';
import { ListingService, ListingQuery } from './listingService';

// Mock the database
vi.mock('@kaarplus/database', () => ({
	prisma: {
		listing: {
			findMany: vi.fn(),
			count: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			groupBy: vi.fn(),
			aggregate: vi.fn(),
		},
	},
	ListingStatus: {
		ACTIVE: 'ACTIVE',
		PENDING: 'PENDING',
		SOLD: 'SOLD',
	},
}));

describe('Search & Filtering Robustness Audit', () => {
	let service: ListingService;

	beforeEach(() => {
		service = new ListingService();
		vi.clearAllMocks();
	});

	describe('Normal Use Cases', () => {
		it('should correctly filter by Make (Case Insensitive)', async () => {
			vi.mocked(prisma.listing.findMany).mockResolvedValue([]);
			vi.mocked(prisma.listing.count).mockResolvedValue(0);

			const query: ListingQuery = { page: 1, pageSize: 20, sort: 'newest', make: 'bmw' };
			await service.getAllListings(query);

			expect(prisma.listing.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						make: { equals: 'bmw', mode: 'insensitive' },
						status: 'ACTIVE'
					})
				})
			);
		});

		it('should correctly handle Price Ranger (Min & Max)', async () => {
			vi.mocked(prisma.listing.findMany).mockResolvedValue([]);
			vi.mocked(prisma.listing.count).mockResolvedValue(0);

			const query: ListingQuery = {
				page: 1,
				pageSize: 20,
				sort: 'newest',
				priceMin: 10000,
				priceMax: 30000
			};
			await service.getAllListings(query);

			expect(prisma.listing.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						price: { gte: 10000, lte: 30000 }
					})
				})
			);
		});

		it('should correctly parse comma-separated Fuel Types', async () => {
			vi.mocked(prisma.listing.findMany).mockResolvedValue([]);
			vi.mocked(prisma.listing.count).mockResolvedValue(0);

			const query: ListingQuery = {
				page: 1,
				pageSize: 20,
				sort: 'newest',
				fuelType: 'Petrol,Diesel'
			};
			await service.getAllListings(query);

			expect(prisma.listing.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						fuelType: { in: ['Petrol', 'Diesel'] }
					})
				})
			);
		});
	});

	describe('Search Query (q) Logic', () => {
		it('should perform OR search on make, model, and description', async () => {
			vi.mocked(prisma.listing.findMany).mockResolvedValue([]);
			vi.mocked(prisma.listing.count).mockResolvedValue(0);

			const query: ListingQuery = { page: 1, pageSize: 20, sort: 'newest', q: 'Tesla' };
			await service.getAllListings(query);

			expect(prisma.listing.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						OR: [
							{ make: { contains: 'Tesla', mode: 'insensitive' } },
							{ model: { contains: 'Tesla', mode: 'insensitive' } },
							{ description: { contains: 'Tesla', mode: 'insensitive' } },
						]
					})
				})
			);
		});
	});

	describe('Complex Combinations (The "Billionaire" Search)', () => {
		it('should handle multiple filters simultaneously', async () => {
			vi.mocked(prisma.listing.findMany).mockResolvedValue([]);
			vi.mocked(prisma.listing.count).mockResolvedValue(0);

			const query: ListingQuery = {
				page: 1,
				pageSize: 20,
				sort: 'price_desc',
				make: 'Porsche',
				yearMin: 2022,
				fuelType: 'Electric',
				bodyType: 'Coupe',
				priceMin: 100000
			};
			await service.getAllListings(query);

			const expectedWhere = {
				status: 'ACTIVE',
				make: { equals: 'Porsche', mode: 'insensitive' },
				year: { gte: 2022, lte: undefined },
				fuelType: { in: ['Electric'] },
				bodyType: { in: ['Coupe'] },
				price: { gte: 100000, lte: undefined }
			};

			expect(prisma.listing.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining(expectedWhere),
					orderBy: { price: 'desc' }
				})
			);
		});
	});

	describe('Edge Cases & Bug Potentials', () => {
		it('should handle empty status in public search by forcing ACTIVE', async () => {
			vi.mocked(prisma.listing.findMany).mockResolvedValue([]);
			vi.mocked(prisma.listing.count).mockResolvedValue(0);

			// Public user trying to search for all statuses (should be prevented)
			const query: ListingQuery = { page: 1, pageSize: 20, sort: 'newest' };
			await service.getAllListings(query, false); // isAdmin = false

			expect(prisma.listing.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({ status: 'ACTIVE' })
				})
			);
		});

		it('should handle yearMax being same as yearMin', async () => {
			vi.mocked(prisma.listing.findMany).mockResolvedValue([]);
			vi.mocked(prisma.listing.count).mockResolvedValue(0);

			const query: ListingQuery = { page: 1, pageSize: 20, sort: 'newest', yearMin: 2020, yearMax: 2020 };
			await service.getAllListings(query);

			expect(prisma.listing.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						year: { gte: 2020, lte: 2020 }
					})
				})
			);
		});
	});
});
