import { describe, it, expect } from 'vitest';

import {
    AppError,
    NotFoundError,
    BadRequestError,
    AuthError,
    ForbiddenError,
    ConflictError,
    ValidationError,
} from './errors';

describe('Error Classes', () => {
    describe('AppError (base class)', () => {
        it('should create error with message and status code', () => {
            const error = new AppError('Test error', 400);
            
            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(400);
            expect(error.isOperational).toBe(true);
        });

        it('should be an instance of Error', () => {
            const error = new AppError('Test', 500);
            expect(error).toBeInstanceOf(Error);
        });
    });

    describe('NotFoundError', () => {
        it('should create error with 404 status code', () => {
            const error = new NotFoundError('User not found');
            
            expect(error.message).toBe('User not found');
            expect(error.statusCode).toBe(404);
            expect(error).toBeInstanceOf(AppError);
        });

        it('should have default message', () => {
            const error = new NotFoundError();
            expect(error.message).toBe('Resource not found');
        });
    });

    describe('BadRequestError', () => {
        it('should create error with 400 status code', () => {
            const error = new BadRequestError('Invalid input');
            
            expect(error.message).toBe('Invalid input');
            expect(error.statusCode).toBe(400);
        });

        it('should have default message', () => {
            const error = new BadRequestError();
            expect(error.message).toBe('Bad Request');
        });
    });

    describe('AuthError', () => {
        it('should create error with 401 status code', () => {
            const error = new AuthError('Invalid credentials');
            
            expect(error.message).toBe('Invalid credentials');
            expect(error.statusCode).toBe(401);
        });

        it('should have default message', () => {
            const error = new AuthError();
            expect(error.message).toBe('Unauthorized');
        });
    });

    describe('ForbiddenError', () => {
        it('should create error with 403 status code', () => {
            const error = new ForbiddenError('Access denied');
            
            expect(error.message).toBe('Access denied');
            expect(error.statusCode).toBe(403);
        });

        it('should have default message', () => {
            const error = new ForbiddenError();
            expect(error.message).toBe('Forbidden');
        });
    });

    describe('ConflictError', () => {
        it('should create error with 409 status code', () => {
            const error = new ConflictError('Resource already exists');
            
            expect(error.message).toBe('Resource already exists');
            expect(error.statusCode).toBe(409);
        });

        it('should have default message', () => {
            const error = new ConflictError();
            expect(error.message).toBe('Resource already exists');
        });
    });

    describe('ValidationError', () => {
        it('should create error with 400 status code and details', () => {
            const details = [{ field: 'email', message: 'Invalid email' }];
            const error = new ValidationError('Validation failed', details);
            
            expect(error.message).toBe('Validation failed');
            expect(error.statusCode).toBe(400);
            expect(error.details).toEqual(details);
        });

        it('should have default message and undefined details', () => {
            const error = new ValidationError();
            expect(error.message).toBe('Validation failed');
            expect(error.details).toBeUndefined();
        });
    });
});
