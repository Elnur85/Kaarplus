import path from "path";

import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

import { BadRequestError } from "../utils/errors";
import { logger } from "../utils/logger";
import { s3Client, BUCKET_NAME } from "../utils/s3";

export class UploadService {
    async generatePresignedUrl(fileName: string, fileType: string, listingId: string) {
        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(fileType)) {
            throw new BadRequestError("Invalid file type. Only JPEG, PNG and WebP are allowed.");
        }

        const ext = path.extname(fileName) || `.${fileType.split("/")[1]}`;
        const key = `listings/${listingId}/${uuidv4()}${ext}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: fileType,
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
