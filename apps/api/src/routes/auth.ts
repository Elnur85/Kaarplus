import { prisma } from "@kaarplus/database";
import bcrypt from "bcrypt";
import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { requireAuth } from "../middleware/auth";
import { authLimiter, strictLimiter } from "../middleware/rateLimiter";
import { emailService } from "../services/emailService";
import { passwordResetService } from "../services/passwordResetService";
import { AuthError, BadRequestError } from "../utils/errors";
import { logger } from "../utils/logger";

export const authRouter = Router();

// Apply rate limiter to all auth routes
authRouter.use(authLimiter);

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "24h";

// Zod schemas
const registerSchema = z.object({
	email: z.string().email(),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/[0-9]/, "Password must contain at least one number"),
	name: z.string().min(2, "Name must be at least 2 characters"),
});

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

// POST /api/auth/register
authRouter.post("/register", async (req: Request, res: Response, next: NextFunction) => {
	try {
		const result = registerSchema.safeParse(req.body);
		if (!result.success) {
			throw new BadRequestError(result.error.issues[0].message);
		}

		const { email, password, name } = result.data;

		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			throw new BadRequestError("User with this email already exists");
		}

		const passwordHash = await bcrypt.hash(password, 12);

		const user = await prisma.user.create({
			data: {
				email,
				passwordHash,
				name,
				role: "BUYER", // Default role
			},
		});

		// Create session/token
		if (!JWT_SECRET) {
			logger.error("JWT_SECRET is not defined");
			throw new AuthError("Server configuration error");
		}
		const token = jwt.sign(
			{ id: user.id, email: user.email, role: user.role, name: user.name },
			JWT_SECRET,
			{ expiresIn: JWT_EXPIRES_IN }
		);

		// Set HTTP-only cookie
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
		});

		res.status(201).json({
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
			},
		});
	} catch (error) {
		logger.error("Registration failed", error);
		next(error);
	}
});

// POST /api/auth/login
authRouter.post("/login", async (req: Request, res: Response, next: NextFunction) => {
	try {
		const result = loginSchema.safeParse(req.body);
		if (!result.success) {
			throw new BadRequestError(result.error.issues[0].message);
		}

		const { email, password } = result.data;

		const user = await prisma.user.findUnique({ where: { email } });
		if (!user || !user.passwordHash) {
			throw new AuthError("Invalid email or password");
		}

		const isValidPassword = await bcrypt.compare(password, user.passwordHash);
		if (!isValidPassword) {
			throw new AuthError("Invalid email or password");
		}

		if (!JWT_SECRET) {
			throw new AuthError("Server configuration error");
		}
		const token = jwt.sign(
			{ id: user.id, email: user.email, role: user.role, name: user.name },
			JWT_SECRET,
			{ expiresIn: JWT_EXPIRES_IN }
		);

		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 24 * 60 * 60 * 1000,
		});

		res.json({
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
			},
		});
	} catch (error) {
		logger.error("Login failed", error);
		next(error);
	}
});

// POST /api/auth/logout
authRouter.post("/logout", (_req: Request, res: Response) => {
	res.clearCookie("token", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	});
	res.json({ message: "Logged out successfully" });
});

// GET /api/auth/session
authRouter.get("/session", requireAuth, (req: Request, res: Response) => {
	res.json({ user: req.user });
});

// POST /api/auth/forgot-password
const forgotPasswordSchema = z.object({
	email: z.string().email("Invalid email address"),
});

authRouter.post("/forgot-password", strictLimiter, async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = forgotPasswordSchema.safeParse(req.body);
		if (!result.success) {
			throw new BadRequestError(result.error.issues[0].message);
		}

		const { email } = result.data;

		// Find user by email
		const user = await prisma.user.findUnique({ where: { email } });

		// Always return success to prevent email enumeration attacks
		if (!user) {
			res.json({ message: "If an account exists, a password reset email has been sent." });
			return;
		}

		// Generate secure reset token
		const resetToken = await passwordResetService.createResetToken(email);

		if (!resetToken) {
			// Log error but don't expose to client
			logger.error("[Password Reset] Failed to create reset token", { email });
			res.json({ message: "If an account exists, a password reset email has been sent." });
			return;
		}

		// Send password reset email
		await emailService.sendPasswordResetEmail(email, resetToken, "et");

		// Log for security audit
		logger.info("[Password Reset] Token generated and email sent", { email });

		res.json({ message: "If an account exists, a password reset email has been sent." });
	} catch (error) {
		logger.error("[Password Reset] Error processing forgot-password request", {
			error: error instanceof Error ? error.message : String(error),
		});
		// Still return success to prevent enumeration
		res.json({ message: "If an account exists, a password reset email has been sent." });
	}
});

// POST /api/auth/reset-password
const resetPasswordSchema = z.object({
	token: z.string().min(1, "Reset token is required"),
	newPassword: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/[0-9]/, "Password must contain at least one number"),
});

authRouter.post("/reset-password", strictLimiter, async (req: Request, res: Response, next: NextFunction) => {
	try {
		const result = resetPasswordSchema.safeParse(req.body);
		if (!result.success) {
			throw new BadRequestError(result.error.issues[0].message);
		}

		const { token, newPassword } = result.data;

		// Validate the reset token
		const email = await passwordResetService.validateToken(token);

		if (!email) {
			throw new BadRequestError("Invalid or expired reset token");
		}

		// Find the user
		const user = await prisma.user.findUnique({ where: { email } });

		if (!user) {
			throw new BadRequestError("Invalid or expired reset token");
		}

		// Hash the new password
		const passwordHash = await bcrypt.hash(newPassword, 12);

		// Update user's password in a transaction
		await prisma.$transaction(async (tx) => {
			await tx.user.update({
				where: { id: user.id },
				data: { passwordHash },
			});

			await tx.passwordResetToken.updateMany({
				where: { token },
				data: { used: true },
			});
		});

		// Log for security audit
		logger.info(`[Password Reset] Password successfully reset for user: ${email}`);

		res.json({ message: "Password has been reset successfully. You can now log in with your new password." });
	} catch (error) {
		if (error instanceof BadRequestError) {
			next(error);
			return;
		}
		logger.error("[Password Reset] Error resetting password", {
			error: error instanceof Error ? error.message : String(error),
		});
		next(new BadRequestError("Failed to reset password. Please try again."));
	}
});

// POST /api/auth/change-password (authenticated)
const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, "Current password is required"),
	newPassword: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/[0-9]/, "Password must contain at least one number"),
});

authRouter.post("/change-password", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
	try {
		const result = changePasswordSchema.safeParse(req.body);
		if (!result.success) {
			throw new BadRequestError(result.error.issues[0].message);
		}

		const { currentPassword, newPassword } = result.data;
		const userId = req.user!.id;

		// Get user with password hash
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, passwordHash: true, email: true },
		});

		if (!user || !user.passwordHash) {
			throw new BadRequestError("User not found or password not set");
		}

		// Verify current password
		const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
		if (!isValidPassword) {
			throw new AuthError("Current password is incorrect");
		}

		// Hash and update new password
		const newPasswordHash = await bcrypt.hash(newPassword, 12);
		await prisma.user.update({
			where: { id: userId },
			data: { passwordHash: newPasswordHash },
		});

		// Log for security audit
		logger.info("[Password Change] Password changed", { email: user.email });

		res.json({ message: "Password changed successfully" });
	} catch (error) {
		logger.error("Password change failed", error);
		next(error);
	}
});
