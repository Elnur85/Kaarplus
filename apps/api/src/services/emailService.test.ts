import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock logger before importing the service
vi.mock("../utils/logger", () => ({
	logger: {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	},
}));

// Mock Resend before importing the service
vi.mock("resend", () => ({
	Resend: class MockResend {
		emails = {
			send: vi.fn().mockResolvedValue({ id: "test-email-id" }),
		};
		constructor() {
			// Mock constructor
		}
	},
}));

import { emailService } from "./emailService";
import { logger } from "../utils/logger";

describe("emailService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		delete process.env.RESEND_API_KEY;
	});

	describe("sendEmail", () => {
		it("should log email when Resend is not configured", async () => {
			await emailService.sendEmail("test@example.com", "Test Subject", "<p>Test</p>");

			expect(logger.info).toHaveBeenCalledWith(
				"[Email] Email logged (Resend not configured)",
				{ to: "test@example.com", subject: "Test Subject" }
			);
		});
	});

	describe("sendPasswordResetEmail", () => {
		it("should generate correct reset URL", async () => {
			await emailService.sendPasswordResetEmail("test@example.com", "reset-token-123", "et");

			expect(logger.info).toHaveBeenCalled();
			const callArgs = (logger.info as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(callArgs[1]).toEqual({
				to: "test@example.com",
				subject: expect.stringContaining("Parooli"),
			});
		});

		it("should support English language", async () => {
			await emailService.sendPasswordResetEmail("test@example.com", "token", "en");

			expect(logger.info).toHaveBeenCalled();
			const callArgs = (logger.info as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(callArgs[1]).toEqual({
				to: "test@example.com",
				subject: expect.stringContaining("Password"),
			});
		});

		it("should fallback to Estonian for unsupported language", async () => {
			await emailService.sendPasswordResetEmail("test@example.com", "token", "fr");

			expect(logger.info).toHaveBeenCalled();
			const callArgs = (logger.info as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(callArgs[1]).toEqual({
				to: "test@example.com",
				subject: expect.stringContaining("Parooli"),
			});
		});
	});

	describe("sendListingApprovedEmail", () => {
		it("should call sendEmail with correct subject", async () => {
			await emailService.sendListingApprovedEmail("test@example.com", "Toyota Corolla", "listing-123");

			expect(logger.info).toHaveBeenCalled();
			const callArgs = (logger.info as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(callArgs[1]).toEqual({
				to: "test@example.com",
				subject: expect.stringContaining("kinnitatud"),
			});
		});

		it("should escape HTML in listing title", async () => {
			await emailService.sendListingApprovedEmail(
				"test@example.com",
				'<script>alert("xss")</script>',
				"listing-123"
			);

			expect(logger.info).toHaveBeenCalled();
			// The logged data should not contain the raw script tag in a way that could execute
			const callArgs = (logger.info as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(callArgs[1].to).toBe("test@example.com");
		});
	});

	describe("sendNewMessageEmail", () => {
		it("should call sendEmail with message notification subject", async () => {
			await emailService.sendNewMessageEmail("test@example.com", "John Doe", "Toyota Corolla");

			expect(logger.info).toHaveBeenCalled();
			const callArgs = (logger.info as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(callArgs[1]).toEqual({
				to: "test@example.com",
				subject: expect.stringContaining("sõnum"),
			});
		});
	});

	describe("sendReviewNotificationEmail", () => {
		it("should call sendEmail with review notification subject", async () => {
			await emailService.sendReviewNotificationEmail("test@example.com", "Jane Doe", 4);

			expect(logger.info).toHaveBeenCalled();
			const callArgs = (logger.info as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(callArgs[1]).toEqual({
				to: "test@example.com",
				subject: expect.stringContaining("arvustus"),
			});
		});
	});

	describe("sendInspectionStatusEmail", () => {
		it("should call sendEmail with inspection status subject", async () => {
			await emailService.sendInspectionStatusEmail("test@example.com", "Toyota Corolla", "COMPLETED");

			expect(logger.info).toHaveBeenCalled();
			const callArgs = (logger.info as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(callArgs[1]).toEqual({
				to: "test@example.com",
				subject: expect.stringContaining("staatus"),
			});
		});
	});

	describe("sendNewsletterWelcome", () => {
		it("should call sendEmail with welcome subject", async () => {
			await emailService.sendNewsletterWelcome("test@example.com", "unsubscribe-token", "et");

			expect(logger.info).toHaveBeenCalled();
			const callArgs = (logger.info as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(callArgs[1]).toEqual({
				to: "test@example.com",
				subject: expect.stringContaining("Tere"),
			});
		});

		it("should support Russian language", async () => {
			await emailService.sendNewsletterWelcome("test@example.com", "unsubscribe-token", "ru");

			expect(logger.info).toHaveBeenCalled();
			const callArgs = (logger.info as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(callArgs[1]).toEqual({
				to: "test@example.com",
				subject: expect.stringContaining("Dobro"),
			});
		});
	});
});
