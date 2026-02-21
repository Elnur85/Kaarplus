import { Resend } from "resend";

import { logger } from "../utils/logger";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const FROM_NAME = process.env.RESEND_FROM_NAME ?? "Kaarplus";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

// Only initialize Resend if API key is provided
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Escape HTML special characters to prevent XSS in email templates.
 */
function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * Send email using Resend.
 * Logs errors but never throws — email failure must not crash a request.
 */
async function sendEmail({
	to,
	subject,
	html,
}: {
	to: string;
	subject: string;
	html: string;
}): Promise<void> {
	if (!resend) {
		logger.info("[Email] Email logged (Resend not configured)", { to, subject });
		return;
	}

	const { error } = await resend.emails.send({
		from: `${FROM_NAME} <${FROM_EMAIL}>`,
		to,
		subject,
		html,
	});

	if (error) {
		logger.error("[Email] Failed to send email", { error, to, subject });
	} else {
		logger.info("[Email] Email sent successfully", { to, subject });
	}
}

/**
 * Email service for sending transactional emails.
 * Uses Resend API; logs to console if RESEND_API_KEY is not set.
 */
export class EmailService {
	async sendEmail(to: string, subject: string, html: string): Promise<void> {
		await sendEmail({ to, subject, html });
	}

	async sendListingApprovedEmail(
		email: string,
		listingTitle: string,
		listingId: string
	): Promise<void> {
		const safeTitle = escapeHtml(listingTitle);
		const subject = "Teie kuulutus on kinnitatud! | Your listing has been approved!";
		const html = `
            <h2>Teie kuulutus on kinnitatud!</h2>
            <p>Teie kuulutus "<strong>${safeTitle}</strong>" on nüüd aktiivne ja nähtav ostjatele.</p>
            <p><a href="${FRONTEND_URL}/listings/${encodeURIComponent(listingId)}">Vaata kuulutust</a></p>
            <hr />
            <p><em>Your listing "${safeTitle}" has been approved and is now visible to buyers.</em></p>
        `;
		await this.sendEmail(email, subject, html);
	}

	async sendNewMessageEmail(
		email: string,
		senderName: string,
		listingTitle: string
	): Promise<void> {
		const safeSender = escapeHtml(senderName);
		const safeTitle = escapeHtml(listingTitle);
		const subject = "Uus sõnum | New message";
		const html = `
            <h2>Teil on uus sõnum</h2>
            <p><strong>${safeSender}</strong> saatis teile sõnumi kuulutuse "<strong>${safeTitle}</strong>" kohta.</p>
            <p><a href="${FRONTEND_URL}/dashboard/messages">Vaata sõnumeid</a></p>
            <hr />
            <p><em>${safeSender} sent you a message about "${safeTitle}".</em></p>
        `;
		await this.sendEmail(email, subject, html);
	}

	async sendReviewNotificationEmail(
		email: string,
		reviewerName: string,
		rating: number
	): Promise<void> {
		const safeReviewer = escapeHtml(reviewerName);
		const stars = "\u2605".repeat(rating) + "\u2606".repeat(5 - rating);
		const subject = "Uus arvustus | New review";
		const html = `
            <h2>Teile on jäetud uus arvustus</h2>
            <p><strong>${safeReviewer}</strong> andis teile hinnangu: ${stars} (${rating}/5)</p>
            <p><a href="${FRONTEND_URL}/dashboard">Vaata arvustusi</a></p>
            <hr />
            <p><em>${safeReviewer} left you a review: ${rating}/5 stars.</em></p>
        `;
		await this.sendEmail(email, subject, html);
	}

	async sendInspectionStatusEmail(
		email: string,
		listingTitle: string,
		status: string
	): Promise<void> {
		const safeTitle = escapeHtml(listingTitle);
		const statusLabels: Record<string, string> = {
			PENDING: "Ootel / Pending",
			SCHEDULED: "Planeeritud / Scheduled",
			IN_PROGRESS: "Käimas / In Progress",
			COMPLETED: "Lõpetatud / Completed",
			CANCELLED: "Tühistatud / Cancelled",
		};
		const label = statusLabels[status] || escapeHtml(status);
		const subject = `Ülevaatuse staatus muutus | Inspection status update`;
		const html = `
            <h2>Ülevaatuse staatus uuendatud</h2>
            <p>Kuulutuse "<strong>${safeTitle}</strong>" ülevaatuse staatus: <strong>${label}</strong></p>
            <p><a href="${FRONTEND_URL}/dashboard">Vaata ülevaatust</a></p>
            <hr />
            <p><em>Inspection status for "${safeTitle}" updated to: ${label}</em></p>
        `;
		await this.sendEmail(email, subject, html);
	}

	async sendNewsletterWelcome(
		email: string,
		token: string,
		language: string
	): Promise<void> {
		const unsubUrl = `${FRONTEND_URL}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;

		const subjects: Record<string, string> = {
			et: "Tere tulemast Kaarplusi uudiskirja!",
			ru: "Dobro povzhalovat v rassylku Kaarplus!",
			en: "Welcome to the Kaarplus newsletter!",
		};

		const bodies: Record<string, string> = {
			et: `
                <h2>Tere tulemast!</h2>
                <p>Te olete edukalt liitunud Kaarplusi uudiskirjaga. Hoiame teid kursis parimate pakkumistega.</p>
                <p><small><a href="${unsubUrl}">Loobu uudiskirjast</a></small></p>
            `,
			ru: `
                <h2>Dobro pozhalovat!</h2>
                <p>Vy uspeshno podpisalis na rassylku Kaarplus. My budem informirovat vas o luchshikh predlozheniyakh.</p>
                <p><small><a href="${unsubUrl}">Otpisatsya</a></small></p>
            `,
			en: `
                <h2>Welcome!</h2>
                <p>You have successfully subscribed to the Kaarplus newsletter. We will keep you updated with the best deals.</p>
                <p><small><a href="${unsubUrl}">Unsubscribe</a></small></p>
            `,
		};

		const subject = subjects[language] || subjects["en"];
		const html = bodies[language] || bodies["en"];

		await this.sendEmail(email, subject, html);
	}

	async sendPasswordResetEmail(
		email: string,
		resetToken: string,
		language: string = "et"
	): Promise<void> {
		const resetUrl = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

		const subjects: Record<string, string> = {
			et: "Parooli taastamine | Kaarplus",
			en: "Password Reset | Kaarplus",
			ru: "Vosstanovlenie parolya | Kaarplus",
		};

		const bodies: Record<
			string,
			{
				title: string;
				greeting: string;
				instruction: string;
				button: string;
				expiry: string;
				ignore: string;
			}
		> = {
			et: {
				title: "Parooli taastamine",
				greeting: "Tere",
				instruction:
					"Saime taotluse teie Kaarplus konto parooli lähtestamiseks. Kui te seda taotlust ei esitanud, võite selle e-kirja ignoreerida.",
				button: "Lähtesta parool",
				expiry: "See link aegub 24 tunni pärast.",
				ignore: "Kui te ei soovi parooli muuta, ignoreerige lihtsalt seda e-kirja.",
			},
			en: {
				title: "Password Reset",
				greeting: "Hello",
				instruction:
					"We received a request to reset your Kaarplus account password. If you didn't make this request, you can ignore this email.",
				button: "Reset Password",
				expiry: "This link will expire in 24 hours.",
				ignore: "If you don't want to change your password, simply ignore this email.",
			},
			ru: {
				title: "Vosstanovlenie parolya",
				greeting: "Zdravstvuyte",
				instruction:
					"My poluchili zapros na sbros parolya dlya vashego akkaunta Kaarplus. Yesli vy ne otpravlyali etot zapros, mozhete proignorirovat' eto pis'mo.",
				button: "Sbrosit' parol'",
				expiry: "Eta ssylka istechet cherez 24 chasa.",
				ignore: "Yesli vy ne khotite menyat' parol', prosto proignoriruyte eto pis'mo.",
			},
		};

		const t = bodies[language] || bodies["et"];
		const subject = subjects[language] || subjects["et"];

		const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">${t.title}</h2>
                <p>${t.greeting},</p>
                <p>${t.instruction}</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                        ${t.button}
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">${t.expiry}</p>
                <p style="color: #666; font-size: 14px;">${t.ignore}</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
                <p style="color: #999; font-size: 12px;">
                    Kui nupp ei tööta, kopeerige see link oma brauserisse:<br>
                    ${resetUrl}
                </p>
            </div>
        `;

		await this.sendEmail(email, subject, html);
	}
}

export const emailService = new EmailService();
