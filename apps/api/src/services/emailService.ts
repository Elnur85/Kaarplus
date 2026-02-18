const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@kaarplus.ee";
const FROM_NAME = process.env.SENDGRID_FROM_NAME || "Kaarplus";
const FRONTEND_URL = process.env.CORS_ORIGIN || "http://localhost:3000";

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
 * Email service for sending transactional emails.
 * Uses SendGrid in production; logs to console in development.
 */
export class EmailService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private sgMail: any = null;
    private ready: Promise<void>;

    constructor() {
        if (SENDGRID_API_KEY) {
            this.ready = this.initSendGrid();
        } else {
            this.ready = Promise.resolve();
        }
    }

    private async initSendGrid() {
        try {
            const sgMail = await import("@sendgrid/mail");
            sgMail.default.setApiKey(SENDGRID_API_KEY!);
            this.sgMail = sgMail.default;
        } catch {
            console.warn("[Email] @sendgrid/mail not installed. Emails will be logged to console.");
        }
    }

    async sendEmail(to: string, subject: string, html: string): Promise<void> {
        await this.ready;

        if (!SENDGRID_API_KEY || !this.sgMail) {
            console.log("[Email] To:", to, "Subject:", subject);
            return;
        }

        try {
            await this.sgMail.send({
                to,
                from: {
                    email: FROM_EMAIL,
                    name: FROM_NAME,
                },
                subject,
                html,
            });
        } catch (error) {
            console.error("[Email] Failed to send email:", error);
            throw new Error(`Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    async sendListingApprovedEmail(email: string, listingTitle: string, listingId: string): Promise<void> {
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

    async sendNewMessageEmail(email: string, senderName: string, listingTitle: string): Promise<void> {
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

    async sendReviewNotificationEmail(email: string, reviewerName: string, rating: number): Promise<void> {
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

    async sendInspectionStatusEmail(email: string, listingTitle: string, status: string): Promise<void> {
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

    async sendNewsletterWelcome(email: string, token: string, language: string): Promise<void> {
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

    async sendPurchaseConfirmationEmail(email: string, listingTitle: string, listingId: string): Promise<void> {
        const safeTitle = escapeHtml(listingTitle);
        const subject = "Ostukinnitus | Purchase confirmation";
        const html = `
            <h2>Täname ostu eest!</h2>
            <p>Olete edukalt ostnud sõiduki: <strong>${safeTitle}</strong>.</p>
            <p>Müüja võtab teiega peagi ühendust, et kokku leppida üleandmine.</p>
            <p><a href="${FRONTEND_URL}/listings/${encodeURIComponent(listingId)}">Vaata kuulutust</a></p>
            <hr />
            <p><em>Thank you for your purchase of "${safeTitle}". The seller will contact you soon.</em></p>
        `;
        await this.sendEmail(email, subject, html);
    }

    async sendSaleNotificationEmail(email: string, listingTitle: string, listingId: string): Promise<void> {
        const safeTitle = escapeHtml(listingTitle);
        const encodedId = encodeURIComponent(listingId);
        const subject = "Teie sõiduk on müüdud! | Your vehicle has been sold!";
        const html = `
            <h2>Õnnitleme! Teie auto on müüdud</h2>
            <p>Sõiduk "<strong>${safeTitle}</strong>" on edukalt müüdud Kaarplus platvormil.</p>
            <p>Palun võtke ostjaga ühendust ja leppige kokku vormistamine.</p>
            <p><a href="${FRONTEND_URL}/listings/${encodedId}">Vaata müüdud kuulutust</a></p>
            <p><a href="${FRONTEND_URL}/dashboard/listings">Halda oma kuulutusi</a></p>
            <hr />
            <p><em>Congratulations! Your vehicle "${safeTitle}" has been sold on Kaarplus. <a href="${FRONTEND_URL}/listings/${encodedId}">View listing</a></em></p>
        `;
        await this.sendEmail(email, subject, html);
    }

    async sendPasswordResetEmail(email: string, resetToken: string, language: string = "et"): Promise<void> {
        const resetUrl = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

        const subjects: Record<string, string> = {
            et: "Parooli taastamine | Kaarplus",
            en: "Password Reset | Kaarplus",
            ru: "Vosstanovlenie parolya | Kaarplus",
        };

        const bodies: Record<string, { title: string; greeting: string; instruction: string; button: string; expiry: string; ignore: string }> = {
            et: {
                title: "Parooli taastamine",
                greeting: "Tere",
                instruction: "Saime taotluse teie Kaarplus konto parooli lähtestamiseks. Kui te seda taotlust ei esitanud, võite selle e-kirja ignoreerida.",
                button: "Lähtesta parool",
                expiry: "See link aegub 24 tunni pärast.",
                ignore: "Kui te ei soovi parooli muuta, ignoreerige lihtsalt seda e-kirja.",
            },
            en: {
                title: "Password Reset",
                greeting: "Hello",
                instruction: "We received a request to reset your Kaarplus account password. If you didn't make this request, you can ignore this email.",
                button: "Reset Password",
                expiry: "This link will expire in 24 hours.",
                ignore: "If you don't want to change your password, simply ignore this email.",
            },
            ru: {
                title: "Vosstanovlenie parolya",
                greeting: "Zdravstvuyte",
                instruction: "My poluchili zapros na sbros parolya dlya vashego akkaunta Kaarplus. Yesli vy ne otpravlyali etot zapros, mozhete proignorirovat' eto pis'mo.",
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
