import { beforeAll, vi } from 'vitest';

beforeAll(() => {
	process.env.JWT_SECRET = 'test-secret';
	process.env.NODE_ENV = 'test';
	process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test_db';
});

// Mock Prisma and exports
vi.mock('@kaarplus/database', () => {
	const enums = {
		UserRole: {
			USER: 'USER',
			DEALERSHIP: 'DEALERSHIP',
			ADMIN: 'ADMIN',
			SUPPORT: 'SUPPORT',
		},
		ListingStatus: {
			DRAFT: 'DRAFT',
			PENDING: 'PENDING',
			ACTIVE: 'ACTIVE',
			SOLD: 'SOLD',
			REJECTED: 'REJECTED',
			EXPIRED: 'EXPIRED',
		},
		PaymentStatus: {
			PENDING: 'PENDING',
			COMPLETED: 'COMPLETED',
			FAILED: 'FAILED',
			REFUNDED: 'REFUNDED',
		},
		InspectionStatus: {
			PENDING: 'PENDING',
			SCHEDULED: 'SCHEDULED',
			IN_PROGRESS: 'IN_PROGRESS',
			COMPLETED: 'COMPLETED',
			CANCELLED: 'CANCELLED',
		},
		CampaignStatus: {
			DRAFT: 'DRAFT',
			ACTIVE: 'ACTIVE',
			PAUSED: 'PAUSED',
			COMPLETED: 'COMPLETED',
			ARCHIVED: 'ARCHIVED',
		},
		AdUnitType: {
			BANNER: 'BANNER',
			NATIVE: 'NATIVE',
			ADSENSE: 'ADSENSE',
		},
		AdEventType: {
			IMPRESSION: 'IMPRESSION',
			CLICK: 'CLICK',
		},
	};

	const mockPrisma: any = {
		$queryRaw: vi.fn(),
		$transaction: vi.fn((cb) => {
			if (typeof cb === 'function') return cb(mockPrisma);
			return Promise.all(cb);
		}),
		user: {
			findUnique: vi.fn(),
			findFirst: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
		listing: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			count: vi.fn(),
		},
		favorite: {
			create: vi.fn(),
			delete: vi.fn(),
			findMany: vi.fn(),
			findUnique: vi.fn(),
			count: vi.fn(),
		},
		message: {
			create: vi.fn(),
			findMany: vi.fn(),
			count: vi.fn(),
			updateMany: vi.fn(),
		},
		review: {
			create: vi.fn(),
			findMany: vi.fn(),
		},
		adCampaign: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
		},
		adUnit: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
		},
		advertisement: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
		},
		adAnalytics: {
			create: vi.fn(),
		},
		vehicleInspection: {
			create: vi.fn(),
			findMany: vi.fn(),
		}
	};

	return {
		...enums,
		prisma: mockPrisma,
	};
});
