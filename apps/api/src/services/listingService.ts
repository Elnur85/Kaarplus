import { prisma, ListingStatus, Prisma } from "@kaarplus/database";

import { parseBodyType, getBodyTypeValues } from "../utils/bodyTypes";
import { cacheService } from "../utils/cache";
import { ForbiddenError, NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";
import { validateRanges } from "../utils/validation";

import { emailService } from "./emailService";
import { socketService } from "./socketService";
import { UploadService } from "./uploadService";

const uploadService = new UploadService();

export interface ListingQuery {
	page: number;
	pageSize: number;
	sort: "newest" | "oldest" | "price_asc" | "price_desc";
	make?: string;
	model?: string;
	yearMin?: number;
	yearMax?: number;
	priceMin?: number;
	priceMax?: number;
	fuelType?: string;
	transmission?: string;
	bodyType?: string;
	color?: string;
	q?: string;
	status?: string;
	mileageMin?: number;
	mileageMax?: number;
	powerMin?: number;
	powerMax?: number;
	driveType?: string;
	doors?: number;
	seats?: number;
	condition?: string;
	location?: string;
}

const LISTING_SUMMARY_SELECT = {
	id: true,
	make: true,
	model: true,
	variant: true,
	year: true,
	price: true,
	priceVatIncluded: true,
	mileage: true,
	fuelType: true,
	transmission: true,
	bodyType: true,
	status: true,
	location: true,
	createdAt: true,
	publishedAt: true,
	verifiedAt: true,
} satisfies Prisma.ListingSelect;

export class ListingService {
	private invalidateSearchCache() {
		cacheService.invalidatePattern("search:");
	}

	async getAllListings(query: ListingQuery, isAdmin: boolean = false): Promise<{
		data: unknown[];
		meta: { page: number; pageSize: number; total: number; totalPages: number };
	}> {
		const {
			page,
			pageSize,
			sort,
			make,
			model,
			yearMin,
			yearMax,
			priceMin,
			priceMax,
			fuelType,
			transmission,
			bodyType,
			color,
			q,
			status,
			mileageMin,
			mileageMax,
			powerMin,
			powerMax,
			driveType,
			doors,
			seats,
			condition,
			location,
		} = query;

		// Validate all ranges using DRY helper
		validateRanges(
			[yearMin, yearMax, "year"],
			[priceMin, priceMax, "price"],
			[mileageMin, mileageMax, "mileage"],
			[powerMin, powerMax, "power"]
		);


		// Ensure page and pageSize are numbers (handling potential string inputs)
		const pageNum = Number(page) || 1;
		const limit = Number(pageSize) || 20;

		const skip = (pageNum - 1) * limit;
		const take = limit;

		const where: Prisma.ListingWhereInput = {};

		// Default status for public is ACTIVE
		if (!isAdmin) {
			where.status = "ACTIVE";
		} else if (status) {
			where.status = status as ListingStatus;
		}

		if (make) where.make = { equals: make, mode: "insensitive" };
		if (model) where.model = { equals: model, mode: "insensitive" };
		if (yearMin !== undefined || yearMax !== undefined) {
			where.year = {
				...(yearMin !== undefined && { gte: yearMin }),
				...(yearMax !== undefined && { lte: yearMax }),
			};
		}
		if (priceMin !== undefined || priceMax !== undefined) {
			where.price = {
				...(priceMin !== undefined && { gte: priceMin }),
				...(priceMax !== undefined && { lte: priceMax }),
			};
		}
		if (fuelType) {
			const fuels = fuelType.split(",");
			where.fuelType = { in: fuels };
		}
		if (transmission) where.transmission = { equals: transmission, mode: "insensitive" };
		if (bodyType) {
			// Parse hierarchical body type format
			const selections = parseBodyType(bodyType);
			const bodyTypeValues = getBodyTypeValues(selections);
			if (bodyTypeValues.length > 0) {
				where.bodyType = { in: bodyTypeValues };
			}
		}
		if (color) where.colorExterior = { equals: color, mode: "insensitive" };
		if (mileageMin !== undefined || mileageMax !== undefined) {
			where.mileage = {
				...(mileageMin !== undefined && { gte: mileageMin }),
				...(mileageMax !== undefined && { lte: mileageMax }),
			};
		}
		if (powerMin !== undefined || powerMax !== undefined) {
			where.powerKw = {
				...(powerMin !== undefined && { gte: powerMin }),
				...(powerMax !== undefined && { lte: powerMax }),
			};
		}
		if (driveType && driveType !== "none") where.driveType = driveType;
		if (doors) where.doors = doors;
		if (seats) where.seats = seats;
		if (condition && condition !== "none") where.condition = { equals: condition, mode: "insensitive" };
		if (location && location !== "none") where.location = { equals: location, mode: "insensitive" };

		if (q) {
			where.OR = [
				{ make: { contains: q, mode: "insensitive" } },
				{ model: { contains: q, mode: "insensitive" } },
				{ description: { contains: q, mode: "insensitive" } },
			];
		}

		let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: "desc" };
		if (sort === "oldest") orderBy = { createdAt: "asc" };
		if (sort === "price_asc") orderBy = { price: "asc" };
		if (sort === "price_desc") orderBy = { price: "desc" };
		if (sort === "newest") orderBy = { publishedAt: "desc" };

		// Only cache public searches
		const cacheKey = !isAdmin ? `search:results:${JSON.stringify(query)}` : null;
		if (cacheKey) {
			const cached = cacheService.get<{
				data: unknown[];
				meta: { page: number; pageSize: number; total: number; totalPages: number };
			}>(cacheKey);
			if (cached) return cached;
		}

		const [listings, total] = await Promise.all([
			prisma.listing.findMany({
				where,
				select: {
					...LISTING_SUMMARY_SELECT,
					images: {
						where: { verified: true },
						orderBy: { order: "asc" },
						take: 1,
						select: { url: true },
					},
					user: {
						select: {
							id: true,
							name: true,
							role: true,
							dealershipId: true,
						},
					},
				},
				orderBy,
				skip,
				take,
			}),
			prisma.listing.count({ where }),
		]);

		const result = {
			data: listings,
			meta: {
				page: pageNum,
				pageSize: limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};

		if (cacheKey) {
			cacheService.set(cacheKey, result, 300); // 5 minutes cache for results
		}

		return result;
	}



	async getListingById(id: string): Promise<unknown> {
		const cacheKey = `search:listing:${id}`;
		const cached = cacheService.get<unknown>(cacheKey);
		if (cached) return cached;

		const listing = await prisma.listing.findUnique({
			where: { id },
			include: {
				images: {
					orderBy: { order: "asc" },
				},
				user: {
					select: {
						id: true,
						email: true,
						name: true,
						phone: true,
						role: true,
						dealershipId: true,
						image: true,
					},
				},
			},
		});

		if (!listing) {
			throw new NotFoundError("Listing not found");
		}

		// Increment view count (async, don't block)
		Promise.resolve().then(() =>
			prisma.listing.update({
				where: { id },
				data: { viewCount: { increment: 1 } },
			})
		).catch(err => logger.warn("Failed to increment view count", { error: err instanceof Error ? err.message : String(err) }));

		cacheService.set(cacheKey, listing, 600); // 10 minutes cache for details
		return listing;
	}

	async createListing(userId: string, data: Prisma.ListingCreateWithoutUserInput) {
		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user) throw new NotFoundError("User not found");

		if (user.role === "USER") {
			const activeCount = await prisma.listing.count({
				where: {
					userId,
					status: { in: ["ACTIVE", "PENDING"] },
				},
			});

			const INDIVIDUAL_LISTING_LIMIT = 5;
			if (activeCount >= INDIVIDUAL_LISTING_LIMIT) {
				throw new ForbiddenError("LISTING_LIMIT_EXCEEDED");
			}
		}

		const result = await prisma.listing.create({
			data: {
				...data,
				userId,
				status: "PENDING",
			},
		});

		this.invalidateSearchCache();
		return result;
	}

	async updateListing(id: string, userId: string, isAdmin: boolean, data: Prisma.ListingUpdateInput) {
		const listing = await prisma.listing.findUnique({ where: { id } });
		if (!listing) throw new NotFoundError("Listing not found");

		if (!isAdmin && listing.userId !== userId) {
			throw new ForbiddenError("You don't have permission to update this listing");
		}

		const result = await prisma.listing.update({
			where: { id },
			data,
		});

		this.invalidateSearchCache();
		cacheService.delete(`search:listing:${id}`);
		return result;
	}

	async deleteListing(id: string, userId: string, isAdmin: boolean) {
		const listing = await prisma.listing.findUnique({ where: { id } });
		if (!listing) throw new NotFoundError("Listing not found");

		if (!isAdmin && listing.userId !== userId) {
			throw new ForbiddenError("You don't have permission to delete this listing");
		}

		const result = await prisma.listing.delete({ where: { id } });

		this.invalidateSearchCache();
		cacheService.delete(`search:listing:${id}`);
		return result;
	}

	async getSimilarListings(id: string) {
		const listing = await prisma.listing.findUnique({ where: { id } });
		if (!listing) throw new NotFoundError("Listing not found");

		// Define similarity criteria with price and year ranges
		const priceMin = Number(listing.price) * 0.7; // 30% below
		const priceMax = Number(listing.price) * 1.3; // 30% above
		const yearMin = listing.year - 3;
		const yearMax = listing.year + 3;

		// Fetch potential similar listings with multiple criteria
		const candidates = await prisma.listing.findMany({
			where: {
				id: { not: id },
				status: "ACTIVE",
				// Must match at least one of these key criteria
				OR: [
					{ make: listing.make },
					{ bodyType: listing.bodyType },
					{
						AND: [
							{ price: { gte: priceMin, lte: priceMax } },
							{ year: { gte: yearMin, lte: yearMax } },
						],
					},
				],
			},
			take: 20, // Fetch more to score and rank
			include: {
				images: {
					where: { verified: true },
					orderBy: { order: "asc" },
					take: 1,
				},
				user: {
					select: {
						id: true,
						name: true,
						role: true,
						dealershipId: true,
					},
				},
			},
		});

		// Score each candidate based on similarity to the original listing
		const scoredCandidates = candidates.map((candidate) => {
			let score = 0;

			// Same make and model (highest weight: 40 points)
			if (candidate.make === listing.make) {
				score += 20;
				if (candidate.model === listing.model) {
					score += 20;
				}
			}

			// Same body type (15 points)
			if (candidate.bodyType === listing.bodyType) {
				score += 15;
			}

			// Price similarity (max 20 points)
			const candidatePrice = Number(candidate.price);
			const priceDiff = Math.abs(candidatePrice - Number(listing.price));
			const priceDiffPercent = priceDiff / Number(listing.price);
			if (priceDiffPercent <= 0.1) {
				score += 20; // Within 10%
			} else if (priceDiffPercent <= 0.2) {
				score += 15; // Within 20%
			} else if (priceDiffPercent <= 0.3) {
				score += 10; // Within 30%
			}

			// Year similarity (max 15 points)
			const yearDiff = Math.abs(candidate.year - listing.year);
			if (yearDiff === 0) {
				score += 15; // Same year
			} else if (yearDiff <= 1) {
				score += 12; // 1 year difference
			} else if (yearDiff <= 2) {
				score += 8; // 2 years difference
			} else if (yearDiff <= 3) {
				score += 5; // 3 years difference
			}

			// Same fuel type (5 points)
			if (candidate.fuelType === listing.fuelType) {
				score += 5;
			}

			// Same transmission (5 points)
			if (candidate.transmission === listing.transmission) {
				score += 5;
			}

			// Same location/region (bonus 5 points)
			if (candidate.location === listing.location) {
				score += 5;
			}

			// Boost recent listings slightly (max 3 points)
			const daysSincePublished = candidate.publishedAt
				? Math.floor((Date.now() - new Date(candidate.publishedAt).getTime()) / (1000 * 60 * 60 * 24))
				: 365;
			if (daysSincePublished <= 7) {
				score += 3; // Published within a week
			} else if (daysSincePublished <= 30) {
				score += 1; // Published within a month
			}

			return { candidate, score };
		});

		// Sort by score (descending) and take top 8
		const topMatches = scoredCandidates
			.sort((a, b) => b.score - a.score)
			.slice(0, 8)
			.map(({ candidate }) => candidate);

		return topMatches;
	}

	async contactSeller(
		id: string,
		contactData: { name: string; email: string; phone?: string; message: string },
		senderId?: string
	) {
		const listing = await prisma.listing.findUnique({
			where: { id },
			include: { user: true },
		});
		if (!listing) throw new NotFoundError("Listing not found");

		// For anonymous users, include contact details in the message body
		// For logged-in users, use their user ID as sender and send message as-is
		const messageBody = senderId
			? contactData.message
			: `Nimi: ${contactData.name}\nEmail: ${contactData.email}\nTelefon: ${contactData.phone || "Puudub"}\n\nSõnum:\n${contactData.message}`;

		const message = await prisma.message.create({
			data: {
				recipientId: listing.userId,
				listingId: listing.id,
				subject: `Päring kuulutuse kohta: ${listing.make} ${listing.model}`,
				body: messageBody,
				...(senderId && { senderId }),
			} as unknown as Prisma.MessageUncheckedCreateInput,
			include: {
				sender: {
					select: {
						id: true,
						name: true,
						image: true,
					}
				}
			}
		});

		// Notify recipient via Socket.io if initialized
		try {
			if (socketService.isInitialized() && message.senderId) {
				socketService.emitNewMessage(message as unknown as Parameters<typeof socketService.emitNewMessage>[0]);
			}
		} catch (error) {
			logger.warn("[ListingService] Failed to emit socket message", {
				error: error instanceof Error ? error.message : String(error),
			});
		}

		// Send email notification to seller (async, non-blocking)
		if (listing.user?.email) {
			const senderName = senderId
				? (message.sender?.name || "Kasutaja")
				: contactData.name;

			emailService.sendNewMessageEmail(
				listing.user.email,
				senderName || "Huviline",
				`${listing.make} ${listing.model}`
			).catch(err => {
				logger.warn("[ListingService] Failed to send email notification", {
					error: err instanceof Error ? err.message : String(err),
				});
			});
		}

		return message;
	}

	async addImages(listingId: string, userId: string, isAdmin: boolean, images: { url: string; order: number }[]) {
		const listing = await prisma.listing.findUnique({ where: { id: listingId } });
		if (!listing) throw new NotFoundError("Listing not found");

		if (!isAdmin && listing.userId !== userId) {
			throw new ForbiddenError("You don't have permission to add images to this listing");
		}

		return prisma.listingImage.createMany({
			data: images.map((img) => ({
				listingId,
				url: img.url,
				order: img.order,
			})),
		});
	}

	async reorderImages(listingId: string, userId: string, isAdmin: boolean, imageOrders: { id: string; order: number }[]) {
		const listing = await prisma.listing.findUnique({ where: { id: listingId } });
		if (!listing) throw new NotFoundError("Listing not found");

		if (!isAdmin && listing.userId !== userId) {
			throw new ForbiddenError("You don't have permission to reorder images for this listing");
		}

		const updates = imageOrders.map((img) =>
			prisma.listingImage.update({
				where: { id: img.id },
				data: { order: img.order },
			})
		);

		return prisma.$transaction(updates);
	}

	async deleteImage(listingId: string, imageId: string, userId: string, isAdmin: boolean) {
		const listing = await prisma.listing.findUnique({ where: { id: listingId } });
		if (!listing) throw new NotFoundError("Listing not found");

		if (!isAdmin && listing.userId !== userId) {
			throw new ForbiddenError("You don't have permission to delete images from this listing");
		}

		const image = await prisma.listingImage.findUnique({ where: { id: imageId } });
		if (!image) throw new NotFoundError("Image not found");

		// Delete from S3
		await uploadService.deleteFile(image.url);

		return prisma.listingImage.delete({
			where: { id: imageId },
		});
	}

	/**
	 * Get newest active listings for home page
	 */
	async getNewestListings(limit: number = 8) {
		return prisma.listing.findMany({
			where: { status: "ACTIVE" },
			orderBy: { publishedAt: "desc" },
			take: limit,
			select: {
				...LISTING_SUMMARY_SELECT,
				images: {
					where: { verified: true },
					orderBy: { order: "asc" },
					take: 1,
					select: { url: true },
				},
				user: {
					select: {
						id: true,
						name: true,
						role: true,
						dealershipId: true,
					},
				},
			},
		});
	}

	/**
	 * Get listings by fuel type (for Electric/Hybrid sections)
	 */
	async getListingsByFuelType(fuelType: string, limit: number = 8) {
		return prisma.listing.findMany({
			where: {
				status: "ACTIVE",
				fuelType: { equals: fuelType, mode: "insensitive" }
			},
			orderBy: { publishedAt: "desc" },
			take: limit,
			select: {
				...LISTING_SUMMARY_SELECT,
				images: {
					where: { verified: true },
					orderBy: { order: "asc" },
					take: 1,
					select: { url: true },
				},
				user: {
					select: {
						id: true,
						name: true,
						role: true,
						dealershipId: true,
					},
				},
			},
		});
	}

	/**
	 * Get body type counts for category grid
	 */
	async getBodyTypeCounts() {
		const counts = await prisma.listing.groupBy({
			by: ['bodyType'],
			where: { status: "ACTIVE" },
			_count: {
				bodyType: true,
			},
		});

		return counts.map((item) => ({
			bodyType: item.bodyType,
			count: item._count.bodyType,
		})).sort((a, b) => b.count - a.count);
	}
}
