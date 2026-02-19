import fs from "fs";
import path from "path";

import { Router } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

import * as uploadController from "../controllers/uploadController";
import { requireAuth } from "../middleware/auth";
import { writeLimiter } from "../middleware/rateLimiter";
import { asyncHandler } from "../utils/asyncHandler";
import { BadRequestError } from "../utils/errors";

export const uploadsRouter = Router();

// Configure multer for local development uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = path.join(process.cwd(), 'uploads');
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		cb(null, `${uuidv4()}${ext}`);
	}
});

const upload = multer({
	storage,
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
	fileFilter: (req, file, cb) => {
		const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new BadRequestError("Invalid file type. Only JPEG, PNG and WebP are allowed."));
		}
	}
});

// Used by S3 Flow (Production)
// Only authenticated users can request presigned URLs
uploadsRouter.post("/presign", requireAuth, writeLimiter, asyncHandler(uploadController.getPresignedUrl));

// Used by Local Flow (Development)
uploadsRouter.post("/", requireAuth, writeLimiter, upload.single('file'), asyncHandler(async (req, res) => {
	if (process.env.NODE_ENV !== "development") {
		throw new BadRequestError("Direct uploads are only allowed in development mode. Use S3 presigned URLs.");
	}

	if (!req.file) {
		throw new BadRequestError("No file uploaded");
	}

	// Return the local URL pattern handled by our express.static middleware
	const publicUrl = `http://localhost:${process.env.PORT || 4000}/uploads/${req.file.filename}`;

	res.json({
		uploadUrl: publicUrl, // For consistency, although not actually "uploadable" since it's already uploaded
		key: `uploads/${req.file.filename}`,
		publicUrl
	});
}));
