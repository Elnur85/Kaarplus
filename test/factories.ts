import { prisma } from '@kaarplus/database';

/**
 * Test data factories for creating database records in tests
 */

export function createMockUser(overrides: Partial<{
	id: string;
	email: string;
	name: string;
	role: string;
	passwordHash: string;
}> = {}) {
	const randomId = Math.random().toString(36).substring(7);
	return {
		id: `user-${randomId}`,
		email: `test-${randomId}@example.com`,
		name: 'Test User',
		role: 'USER',
		passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6G', // "password123"
		...overrides,
	};
}

export function createMockListing(overrides: Partial<{
	id: string;
	userId: string;
	make: string;
	model: string;
	year: number;
	price: number;
	mileage: number;
	status: string;
}> = {}) {
	const randomId = Math.random().toString(36).substring(7);
	return {
		id: `listing-${randomId}`,
		userId: `user-${randomId}`,
		make: 'Toyota',
		model: 'Corolla',
		year: 2020,
		price: 15000,
		mileage: 50000,
		status: 'ACTIVE',
		bodyType: 'Sedan',
		fuelType: 'Petrol',
		transmission: 'Automatic',
		powerKw: 100,
		colorExterior: 'Silver',
		condition: 'Used',
		location: 'Tallinn',
		...overrides,
	};
}

export function createMockMessage(overrides: Partial<{
	id: string;
	senderId: string;
	recipientId: string;
	listingId: string;
	subject: string;
	body: string;
}> = {}) {
	const randomId = Math.random().toString(36).substring(7);
	return {
		id: `message-${randomId}`,
		senderId: `sender-${randomId}`,
		recipientId: `recipient-${randomId}`,
		listingId: `listing-${randomId}`,
		subject: 'Test Subject',
		body: 'Test message body',
		isRead: false,
		...overrides,
	};
}

export function createMockReview(overrides: Partial<{
	id: string;
	reviewerId: string;
	targetId: string;
	listingId: string;
	rating: number;
	body: string;
}> = {}) {
	const randomId = Math.random().toString(36).substring(7);
	return {
		id: `review-${randomId}`,
		reviewerId: `reviewer-${randomId}`,
		targetId: `target-${randomId}`,
		listingId: `listing-${randomId}`,
		rating: 5,
		body: 'Great experience!',
		verified: true,
		...overrides,
	};
}

export function createMockFavorite(overrides: Partial<{
	id: string;
	userId: string;
	listingId: string;
}> = {}) {
	const randomId = Math.random().toString(36).substring(7);
	return {
		id: `favorite-${randomId}`,
		userId: `user-${randomId}`,
		listingId: `listing-${randomId}`,
		...overrides,
	};
}

export function createMockPasswordResetToken(overrides: Partial<{
	id: string;
	email: string;
	token: string;
	expires: Date;
	used: boolean;
}> = {}) {
	const randomId = Math.random().toString(36).substring(7);
	const expires = new Date();
	expires.setHours(expires.getHours() + 24);

	return {
		id: `token-${randomId}`,
		email: `test-${randomId}@example.com`,
		token: `reset-token-${randomId}`,
		expires,
		used: false,
		...overrides,
	};
}
