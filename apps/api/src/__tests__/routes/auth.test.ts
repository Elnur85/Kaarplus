import { prisma } from '@kaarplus/database';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';

describe('Auth Routes', () => {
	let app: any;

	beforeAll(async () => {
		// Ensure env vars are set before app creation
		process.env.JWT_SECRET = 'test-secret';
		process.env.NODE_ENV = 'test';

		// Dynamic import to ensure process.env.JWT_SECRET is set before authRouter is loaded
		const { createApp } = await import('../../app');
		const instances = createApp();
		app = instances.app;
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('POST /api/auth/register', () => {
		it('should register a new user successfully', async () => {
			const userData = {
				email: 'test@example.com',
				password: 'Password123!',
				name: 'Test User',
			};

			(prisma.user.findUnique as any).mockResolvedValue(null);
			(prisma.user.create as any).mockResolvedValue({
				id: 'user-1',
				email: userData.email,
				name: userData.name,
				role: 'USER',
			});

			const response = await request(app)
				.post('/api/auth/register')
				.send(userData);

			expect(response.status).toBe(201);
			expect(response.headers['set-cookie'][0]).toContain('token=');
			expect(response.body.user).toMatchObject({
				email: userData.email,
				name: userData.name,
			});
		});

		it('should return 400 if email already exists', async () => {
			const userData = {
				email: 'existing@example.com',
				password: 'Password123!',
				name: 'Test User',
			};

			(prisma.user.findUnique as any).mockResolvedValue({ id: 'existing-id' });

			const response = await request(app)
				.post('/api/auth/register')
				.send(userData);

			expect(response.status).toBe(400);
			expect(response.body.error).toContain('already exists');
		});
	});

	describe('POST /api/auth/login', () => {
		it('should login successfully with correct credentials', async () => {
			const loginData = {
				email: 'test@example.com',
				password: 'Password123!',
			};

			const hashedPassword = await bcrypt.hash(loginData.password, 12);
			(prisma.user.findUnique as any).mockResolvedValue({
				id: 'user-1',
				email: loginData.email,
				passwordHash: hashedPassword,
				name: 'Test User',
				role: 'USER',
			});

			const response = await request(app)
				.post('/api/auth/login')
				.send(loginData);

			expect(response.status).toBe(200);
			expect(response.headers['set-cookie'][0]).toContain('token=');
			expect(response.body.user.email).toBe(loginData.email);
		});

		it('should return 401 for invalid password', async () => {
			const loginData = {
				email: 'test@example.com',
				password: 'WrongPassword!',
			};

			const hashedPassword = await bcrypt.hash('CorrectPassword!', 12);
			(prisma.user.findUnique as any).mockResolvedValue({
				id: 'user-1',
				email: loginData.email,
				passwordHash: hashedPassword,
				role: 'USER',
			});

			const response = await request(app)
				.post('/api/auth/login')
				.send(loginData);

			expect(response.status).toBe(401);
			expect(response.body.status).toBeUndefined(); // error format check
			expect(response.body.error).toContain('Invalid email or password');
		});
	});
});
