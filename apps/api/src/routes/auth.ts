import { prisma } from "@kaarplus/database";
import bcrypt from "bcrypt";
import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { requireAuth } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimiter";
import { AuthError, BadRequestError } from "../utils/errors";

export const authRouter = Router();

// Apply rate limiter to all auth routes
authRouter.use(authLimiter);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
const JWT_EXPIRES_IN = "24h";

// Zod schemas
const registerSchema = z.object({
    email: z.string().email(),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    name: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

// POST /api/auth/register
authRouter.post("/register", async (req: Request, res: Response) => {
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
        token, // Return token for client-side use if needed (usually redundant with cookie but helpful for debugging/mobile)
    });
});

// POST /api/auth/login
authRouter.post("/login", async (req: Request, res: Response) => {
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
        token,
    });
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

authRouter.post("/forgot-password", async (req: Request, res: Response) => {
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
    
    // TODO: Implement actual password reset email sending
    // 1. Generate secure random token
    // 2. Save token hash to database with expiration
    // 3. Send email with reset link
    // 4. Log the request for security audit
    
    res.json({ message: "If an account exists, a password reset email has been sent." });
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

authRouter.post("/reset-password", async (req: Request, _res: Response) => {
    const result = resetPasswordSchema.safeParse(req.body);
    if (!result.success) {
        throw new BadRequestError(result.error.issues[0].message);
    }

    // TODO: Implement actual password reset
    // 1. Validate token against database
    // 2. Check token expiration
    // 3. Hash new password
    // 4. Update user password
    // 5. Invalidate token
    // 6. Log password change
    
    throw new BadRequestError("Password reset functionality is not yet implemented");
});
