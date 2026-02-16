const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@kaarplus.ee";
const FRONTEND_URL = process.env.CORS_ORIGIN || "http://localhost:3000";

/**
 * Email service for sending transactional emails.
 * Uses SendGrid in production; logs to console in development.
 */
export class EmailService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private sgMail: any = null;

    constructor() {
        if (SENDGRID_API_KEY) {
            this.initSendGrid();
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
        if (!SENDGRID_API_KEY || !this.sgMail) {
            console.log("[Email] To:", to, "Subject:", subject);
            return;
        }

        try {
            await this.sgMail.send({
                to,
                from: FROM_EMAIL,
                subject,
                html,
            });
        } catch (error) {
            console.error("[Email] Failed to send email:", error);
        }
    }

    async sendListingApprovedEmail(email: string, listingTitle: string, listingId: string): Promise<void> {
        const subject = "Teie kuulutus on kinnitatud! | Your listing has been approved!";
        const html = `
            <h2>Teie kuulutus on kinnitatud!</h2>
            <p>Teie kuulutus "<strong>${listingTitle}</strong>" on nüüd aktiivne ja nähtav ostjatele.</p>
            <p><a href="${FRONTEND_URL}/listings/${listingId}">Vaata kuulutust</a></p>
            <hr />
            <p><em>Your listing "${listingTitle}" has been approved and is now visible to buyers.</em></p>
        `;
        await this.sendEmail(email, subject, html);
    }

    async sendNewMessageEmail(email: string, senderName: string, listingTitle: string): Promise<void> {
        const subject = "Uus sõnum | New message";
        const html = `
            <h2>Teil on uus sõnum</h2>
            <p><strong>${senderName}</strong> saatis teile sõnumi kuulutuse "<strong>${listingTitle}</strong>" kohta.</p>
            <p><a href="${FRONTEND_URL}/dashboard/messages">Vaata sõnumeid</a></p>
            <hr />
            <p><em>${senderName} sent you a message about "${listingTitle}".</em></p>
        `;
        await this.sendEmail(email, subject, html);
    }

    async sendReviewNotificationEmail(email: string, reviewerName: string, rating: number): Promise<void> {
        const stars = "\u2605".repeat(rating) + "\u2606".repeat(5 - rating);
        const subject = "Uus arvustus | New review";
        const html = `
            <h2>Teile on jäetud uus arvustus</h2>
            <p><strong>${reviewerName}</strong> andis teile hinnangu: ${stars} (${rating}/5)</p>
            <p><a href="${FRONTEND_URL}/dashboard">Vaata arvustusi</a></p>
            <hr />
            <p><em>${reviewerName} left you a review: ${rating}/5 stars.</em></p>
        `;
        await this.sendEmail(email, subject, html);
    }

    async sendInspectionStatusEmail(email: string, listingTitle: string, status: string): Promise<void> {
        const statusLabels: Record<string, string> = {
            PENDING: "Ootel / Pending",
            SCHEDULED: "Planeeritud / Scheduled",
            IN_PROGRESS: "Käimas / In Progress",
            COMPLETED: "Lõpetatud / Completed",
            CANCELLED: "Tühistatud / Cancelled",
        };
        const label = statusLabels[status] || status;
        const subject = `Ülevaatuse staatus muutus | Inspection status update`;
        const html = `
            <h2>Ülevaatuse staatus uuendatud</h2>
            <p>Kuulutuse "<strong>${listingTitle}</strong>" ülevaatuse staatus: <strong>${label}</strong></p>
            <p><a href="${FRONTEND_URL}/dashboard">Vaata ülevaatust</a></p>
            <hr />
            <p><em>Inspection status for "${listingTitle}" updated to: ${label}</em></p>
        `;
        await this.sendEmail(email, subject, html);
    }

    async sendNewsletterWelcome(email: string, token: string, language: string): Promise<void> {
        const unsubUrl = `${FRONTEND_URL}/api/newsletter/unsubscribe?token=${token}`;

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
        const subject = "Ostukinnitus | Purchase confirmation";
        const html = `
            <h2>Täname ostu eest!</h2>
            <p>Olete edukalt ostnud sõiduki: <strong>${listingTitle}</strong>.</p>
            <p>Müüja võtab teiega peagi ühendust, et kokku leppida üleandmine.</p>
            <p><a href="${FRONTEND_URL}/listings/${listingId}">Vaata kuulutust</a></p>
            <hr />
            <p><em>Thank you for your purchase of "${listingTitle}". The seller will contact you soon.</em></p>
        `;
        await this.sendEmail(email, subject, html);
    }

    async sendSaleNotificationEmail(email: string, listingTitle: string, listingId: string): Promise<void> {
        const subject = "Teie sõiduk on müüdud! | Your vehicle has been sold!";
        const html = `
            <h2>Õnnitleme! Teie auto on müüdud</h2>
            <p>Sõiduk "<strong>${listingTitle}</strong>" on edukalt müüdud Kaarplus platvormil.</p>
            <p>Palun võtke ostjaga ühendust ja leppige kokku vormistamine.</p>
            <p><a href="${FRONTEND_URL}/listings/${listingId}">Vaata müüdud kuulutust</a></p>
            <p><a href="${FRONTEND_URL}/dashboard/listings">Halda oma kuulutusi</a></p>
            <hr />
            <p><em>Congratulations! Your vehicle "${listingTitle}" has been sold on Kaarplus. <a href="${FRONTEND_URL}/listings/${listingId}">View listing</a></em></p>
        `;
        await this.sendEmail(email, subject, html);
    }
}

export const emailService = new EmailService();
