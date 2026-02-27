import path from "path";

import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

import { BadRequestError } from "../utils/errors";
import { logger } from "../utils/logger";
import { s3Client, BUCKET_NAME } from "../utils/s3";

export class UploadService {
    async generatePresignedUrl(fileName: string, fileType: string, listingId: string) {
        // Validate file type — normalize image/jpg (WhatsApp, Android) to image/jpeg
        const normalizedType = fileType === "image/jpg" ? "image/jpeg" : fileType;
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
        if (!allowedTypes.includes(normalizedType)) {
            throw new BadRequestError(`Invalid file type "${fileType}". Only JPEG, PNG, WebP, and HEIC are allowed.`);
        }

        // Normalize extension: image/jpg → .jpg → use .jpg, image/heic → .jpg (convert to jpeg key)
        const extFromName = path.extname(fileName);
        const ext = extFromName || (normalizedType === "image/jpeg" ? ".jpg" : `.${normalizedType.split("/")[1]}`);
        const key = `listings/${listingId}/${uuidv4()}${ext}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: normalizedType,
        });

        // Signed URL expires in 15 minutes
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

        const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

        return {
            uploadUrl,
            key,
            publicUrl,
        };
    }

    async deleteFile(url: string) {
        // Extract key from URL by stripping the R2_PUBLIC_URL prefix
        const publicUrl = process.env.R2_PUBLIC_URL;
        if (!publicUrl || !url.startsWith(publicUrl)) {
            logger.warn(`Cannot delete file: URL does not match R2_PUBLIC_URL prefix: ${url}`);
            return;
        }

        const key = url.replace(`${publicUrl}/`, "");

        try {
            const command = new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            });

            await s3Client.send(command);
        } catch (error) {
            logger.warn(`Failed to delete R2 file: ${key}`, { error: error instanceof Error ? error.message : String(error) });
            // Non-critical error, don't throw
        }
    }
}
