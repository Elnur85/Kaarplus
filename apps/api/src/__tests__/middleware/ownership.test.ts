import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { requireListingOwnership } from "../../middleware/ownership";
import { prisma } from "@kaarplus/database";
import { ForbiddenError, NotFoundError } from "../../utils/errors";

vi.mock("@kaarplus/database", () => ({
    prisma: {
        listing: {
            findUnique: vi.fn(),
        },
    },
}));

describe("requireListingOwnership Middleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            params: { id: "listing-1" },
            user: { id: "user-1", email: "test@example.com", role: "INDIVIDUAL_SELLER" },
        };
        res = {};
        next = vi.fn();
        vi.clearAllMocks();
    });

    it("should allow access if user is the owner", async () => {
        vi.mocked(prisma.listing.findUnique).mockResolvedValue({ userId: "user-1" } as any);

        await requireListingOwnership(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith();
        expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it("should allow access if user is an admin even if not the owner", async () => {
        req.user!.id = "admin-1";
        req.user!.role = "ADMIN";
        vi.mocked(prisma.listing.findUnique).mockResolvedValue({ userId: "user-1" } as any);

        await requireListingOwnership(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith();
        expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it("should throw ForbiddenError if user is not the owner and not an admin", async () => {
        req.user!.id = "user-2";
        vi.mocked(prisma.listing.findUnique).mockResolvedValue({ userId: "user-1" } as any);

        await requireListingOwnership(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it("should throw NotFoundError if listing does not exist", async () => {
        vi.mocked(prisma.listing.findUnique).mockResolvedValue(null);

        await requireListingOwnership(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it("should throw NotFoundError if ID is missing", async () => {
        req.params = {};

        await requireListingOwnership(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });
});
