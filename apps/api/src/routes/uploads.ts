import path from "path";

import { Router } from "express";
// @ts-ignore
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

import * as uploadController from "../controllers/uploadController";
import { requireAuth } from "../middleware/auth";
import { writeLimiter } from "../middleware/rateLimiter";
import { asyncHandler } from "../utils/asyncHandler";
import { BadRequestError } from "../utils/errors";
import { s3Client, BUCKET_NAME } from "../utils/s3";

export const uploadsRouter = Router();

// Configure multer for memory storage - we'll upload to R2
const storage = multer.memoryStorage();

const upload = multer({
	storage,
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
	fileFilter: (req: any, file: any, cb: any) => {
		const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new BadRequestError("Invalid file type. Only JPEG, PNG and WebP are allowed.") as any, false);
		}
	},
});

// Used by S3 Flow (Production)
// Only authenticated users can request presigned URLs
uploadsRouter.post("/presign", requireAuth, writeLimiter, asyncHandler(uploadController.getPresignedUrl));

// Used by Local Flow (Development)
uploadsRouter.post("/", requireAuth, writeLimiter, upload.single("file"), asyncHandler(async (req: any, res) => {
	if (process.env.NODE_ENV !== "development") {
		throw new BadRequestError("Direct uploads are only allowed in development mode. Use S3 presigned URLs.");
	}

	if (!req.file) {
		throw new BadRequestError("No file uploaded");
	}

	// In development, return a data URL for the uploaded file
	const base64 = req.file.buffer.toString("base64");
	const mimeType = req.file.mimetype;
	const dataUrl = `data:${mimeType};base64,${base64}`;

	res.json({
		uploadUrl: dataUrl,
		key: `dev/${uuidv4()}${path.extname(req.file.originalname)}`,
		publicUrl: dataUrl,
	});
}));
