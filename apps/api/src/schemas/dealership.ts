import { z } from "zod";

export const contactDealershipSchema = z.object({
    // Required for unauthenticated users; authenticated users omit these (senderId used instead)
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email address").optional(),
    message: z.string().min(1, "Message is required"),
    phone: z.string().optional(),
});
