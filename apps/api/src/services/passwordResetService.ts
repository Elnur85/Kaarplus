import { prisma } from "@kaarplus/database";
import crypto from "crypto";

const RESET_TOKEN_EXPIRY_HOURS = 24;

/**
 * Service for handling password reset operations
 */
export const passwordResetService = {
    /**
     * Create a new password reset token for a user
     * @param email - User's email address
     * @returns The generated token (for email sending)
     */
    async createResetToken(email: string): Promise<string | null> {
        // Invalidate any existing tokens for this email
        await prisma.passwordResetToken.updateMany({
            where: { email, used: false },
            data: { used: true },
        });

        // Generate a cryptographically secure random token
        const token = crypto.randomBytes(32).toString("hex");

        // Calculate expiration (24 hours from now)
        const expires = new Date();
        expires.setHours(expires.getHours() + RESET_TOKEN_EXPIRY_HOURS);

        // Store the token
        await prisma.passwordResetToken.create({
            data: {
                email,
                token,
                expires,
            },
        });

        return token;
    },

    /**
     * Validate a password reset token
     * @param token - The reset token to validate
     * @returns The email associated with the token if valid, null otherwise
     */
    async validateToken(token: string): Promise<string | null> {
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            return null;
        }

        if (resetToken.used) {
            return null;
        }

        if (new Date() > resetToken.expires) {
            return null;
        }

        return resetToken.email;
    },

    /**
     * Mark a token as used
     * @param token - The token to mark as used
     */
    async markTokenAsUsed(token: string): Promise<void> {
        await prisma.passwordResetToken.update({
            where: { token },
            data: { used: true },
        });
    },

    /**
     * Clean up expired tokens (can be called periodically)
     */
    async cleanupExpiredTokens(): Promise<void> {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7); // Keep tokens for 7 days for audit

        await prisma.passwordResetToken.deleteMany({
            where: {
                OR: [
                    { expires: { lt: new Date() }, used: false },
                    { createdAt: { lt: cutoff } },
                ],
            },
        });
    },
};
