import "dotenv/config";
import path from "path";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@kaarplus/database";

const prisma = new PrismaClient();

const r2 = new S3Client({
	region: "auto",
	endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID!,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
	},
});

async function migrate() {
	// Find all local images (URLs starting with '/' indicate local storage)
	const images = await prisma.listingImage.findMany({
		where: { url: { startsWith: "/" } },
	});

	console.log(`Found ${images.length} local images to migrate`);

	for (const image of images) {
		const localPath = path.join(process.cwd(), "apps/api", image.url);

		if (!fs.existsSync(localPath)) {
			console.warn(`SKIP (not found): ${localPath}`);
			continue;
		}

		const buffer = fs.readFileSync(localPath);
		const key = `uploads/${path.basename(localPath)}`;
		const mimeType = key.endsWith(".png")
			? "image/png"
			: key.endsWith(".webp")
				? "image/webp"
				: "image/jpeg";

		try {
			await r2.send(
				new PutObjectCommand({
					Bucket: process.env.R2_BUCKET_NAME!,
					Key: key,
					Body: buffer,
					ContentType: mimeType,
				})
			);

			await prisma.listingImage.update({
				where: { id: image.id },
				data: { url: `${process.env.R2_PUBLIC_URL}/${key}` },
			});

			console.log(`✓ ${image.url}`);
		} catch (err) {
			console.error(`✗ ${image.url}`, err);
		}
	}

	await prisma.$disconnect();
	console.log("Done");
}

migrate();
