import { UserRole } from "@kaarplus/database";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { AuthError, ForbiddenError } from "../utils/errors";

const JWT_SECRET: string | undefined = process.env.JWT_SECRET;

interface DecodedToken {
	id: string;
	email: string;
	role: UserRole;
	name?: string | null;
	iat: number;
	exp: number;
}

/**
 * JWT auth middleware
 * Verifies token from cookie or Authorization header
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
	try {
		let token = req.cookies?.token;

		// Backend-to-Backend or Mobile apps can still use Authorization header
		if (!token && req.headers.authorization) {
			const parts = req.headers.authorization.split(" ");
			if (parts.length === 2 && parts[0] === "Bearer") {
				token = parts[1];
			}
		}

		if (!token) {
			throw new AuthError("Authentication required (Session missing)");
		}

		if (!JWT_SECRET) {
			throw new AuthError("Server configuration error");
		}

		const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as DecodedToken;

		req.user = {
			id: decoded.id,
			email: decoded.email,
			role: decoded.role,
			name: decoded.name,
		};

		next();
	} catch (error) {
		if (error instanceof AuthError) {
			next(error);
		} else {
			next(new AuthError("Invalid or expired token"));
		}
	}
}

/**
 * Optional JWT auth middleware
 * Verifies token if present, but proceeds anonymously if missing or invalid.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
	try {
		let token = req.cookies?.token;

		if (!token && req.headers.authorization) {
			const parts = req.headers.authorization.split(" ");
			if (parts.length === 2 && parts[0] === "Bearer") {
				token = parts[1];
			}
		}

		if (token && JWT_SECRET) {
			const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as DecodedToken;

			req.user = {
				id: decoded.id,
				email: decoded.email,
				role: decoded.role,
				name: decoded.name,
			};
		}
	} catch (error) {
		// Silently ignore token errors for optional auth
	} finally {
		next();
	}
}

/**
 * Role-based authorization middleware.
 * Must be used after requireAuth.
 */
export function requireRole(...roles: UserRole[]) {
	return (req: Request, _res: Response, next: NextFunction): void => {
		if (!req.user) {
			return next(new AuthError("Authentication required"));
		}
		if (!roles.includes(req.user.role)) {
			return next(new ForbiddenError("Insufficient permissions"));
		}
		next();
	};
}
