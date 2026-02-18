import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock must be before importing the service
vi.mock('@kaarplus/database', () => ({
    prisma: {
        listing: {
            findMany: vi.fn(),
            aggregate: vi.fn(),
        },
    },
}));

import { SearchService } from './searchService';

import { prisma } from '@kaarplus/database';

describe('SearchService', () => {
    let service: SearchService;

    beforeEach(() => {
        service = new SearchService();
        vi.clearAllMocks();
    });

    describe('getMakes', () => {
        it('should return unique makes', async () => {
            vi.mocked(prisma.listing.findMany).mockResolvedValue([
                { make: 'BMW' }, { make: 'Audi' }
            ] as any);
            const result = await service.getMakes();
            expect(result).toEqual(['BMW', 'Audi']);
            expect(prisma.listing.findMany).toHaveBeenCalledWith(expect.objectContaining({
                distinct: ['make'],
                where: { status: 'ACTIVE' },
            }));
        });
    });

    describe('getModels', () => {
        it('should return models for make', async () => {
            vi.mocked(prisma.listing.findMany).mockResolvedValue([
                { model: 'X5' }, { model: 'M3' }
            ] as any);
            const result = await service.getModels('BMW');
            expect(result).toEqual(['X5', 'M3']);
            expect(prisma.listing.findMany).toHaveBeenCalledWith(expect.objectContaining({
                distinct: ['model'],
                where: { status: 'ACTIVE', make: { equals: 'BMW', mode: 'insensitive' } },
            }));
        });
    });

    describe('getFilterOptions', () => {
        it('should return all filter options', async () => {
            vi.mocked(prisma.listing.findMany)
                .mockResolvedValueOnce([{ make: 'BMW' }, { make: 'Audi' }] as any)
                .mockResolvedValueOnce([{ fuelType: 'Petrol' }, { fuelType: 'Diesel' }] as any)
                .mockResolvedValueOnce([{ bodyType: 'Sedan' }, { bodyType: 'SUV' }] as any)
                .mockResolvedValueOnce([{ transmission: 'Automatic' }, { transmission: 'Manual' }] as any);
            
            vi.mocked(prisma.listing.aggregate).mockResolvedValue({
                _min: { year: 2000, price: 1000 },
                _max: { year: 2024, price: 50000 },
            } as any);

            const result = await service.getFilterOptions();
            
            expect(result.makes).toContain('BMW');
            expect(result.fuelTypes).toContain('Petrol');
            expect(result.bodyTypes).toContain('Sedan');
            expect(result.transmissions).toContain('Automatic');
            expect(result.years.min).toBe(2000);
            expect(result.price.max).toBe(50000);
        });
    });

    describe('getLocations', () => {
        it('should return unique locations', async () => {
            vi.mocked(prisma.listing.findMany).mockResolvedValue([
                { location: 'Tallinn' }, { location: 'Tartu' }
            ] as any);
            
            const result = await service.getLocations();
            expect(result).toEqual(['Tallinn', 'Tartu']);
        });
    });

    describe('getColors', () => {
        it('should return unique colors', async () => {
            vi.mocked(prisma.listing.findMany).mockResolvedValue([
                { colorExterior: 'Black' }, { colorExterior: 'White' }
            ] as any);
            
            const result = await service.getColors();
            expect(result).toEqual(['Black', 'White']);
        });
    });

    describe('getDriveTypes', () => {
        it('should return unique drive types', async () => {
            vi.mocked(prisma.listing.findMany).mockResolvedValue([
                { driveType: 'FWD' }, { driveType: 'AWD' }
            ] as any);
            
            const result = await service.getDriveTypes();
            expect(result).toEqual(['FWD', 'AWD']);
        });
    });

    describe('getBodyTypes', () => {
        it('should return unique body types', async () => {
            vi.mocked(prisma.listing.findMany).mockResolvedValue([
                { bodyType: 'Sedan' }, { bodyType: 'SUV' }
            ] as any);
            
            const result = await service.getBodyTypes();
            expect(result).toEqual(['Sedan', 'SUV']);
        });
    });
});
