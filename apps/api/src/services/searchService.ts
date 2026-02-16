import { prisma } from "@kaarplus/database";

export class SearchService {
    async getMakes() {
        const makes = await prisma.listing.findMany({
            where: { status: "ACTIVE" },
            select: { make: true },
            distinct: ["make"],
            orderBy: { make: "asc" },
        });
        return makes.map((m) => m.make);
    }

    async getModels(make: string) {
        const models = await prisma.listing.findMany({
            where: {
                status: "ACTIVE",
                make: { equals: make, mode: "insensitive" },
            },
            select: { model: true },
            distinct: ["model"],
            orderBy: { model: "asc" },
        });
        return models.map((m) => m.model);
    }

    async getFilterOptions() {
        // This could be optimized by querying distinct values for each field
        const [makes, fuelTypes, bodyTypes, transmissions] = await Promise.all([
            prisma.listing.findMany({ where: { status: "ACTIVE" }, select: { make: true }, distinct: ["make"] }),
            prisma.listing.findMany({ where: { status: "ACTIVE" }, select: { fuelType: true }, distinct: ["fuelType"] }),
            prisma.listing.findMany({ where: { status: "ACTIVE" }, select: { bodyType: true }, distinct: ["bodyType"] }),
            prisma.listing.findMany({ where: { status: "ACTIVE" }, select: { transmission: true }, distinct: ["transmission"] }),
        ]);

        // Query for min/max year and price
        const aggregates = await prisma.listing.aggregate({
            where: { status: "ACTIVE" },
            _min: { year: true, price: true },
            _max: { year: true, price: true },
        });

        return {
            makes: makes.map((m) => m.make).filter(Boolean).sort(),
            fuelTypes: fuelTypes.map((f) => f.fuelType).filter(Boolean).sort(),
            bodyTypes: bodyTypes.map((b) => b.bodyType).filter(Boolean).sort(),
            transmissions: transmissions.map((t) => t.transmission).filter(Boolean).sort(),
            years: {
                min: aggregates._min.year || 1990,
                max: aggregates._max.year || new Date().getFullYear(),
            },
            price: {
                min: Number(aggregates._min.price) || 0,
                max: Number(aggregates._max.price) || 500000,
            }
        };
    }

    async getLocations() {
        const locations = await prisma.listing.findMany({
            where: { status: "ACTIVE" },
            select: { location: true },
            distinct: ["location"],
            orderBy: { location: "asc" },
        });
        return locations.map((l) => l.location).filter(Boolean);
    }

    async getColors() {
        const colors = await prisma.listing.findMany({
            where: { status: "ACTIVE" },
            select: { colorExterior: true },
            distinct: ["colorExterior"],
            orderBy: { colorExterior: "asc" },
        });
        return colors.map((c) => c.colorExterior).filter(Boolean);
    }

    async getDriveTypes() {
        const driveTypes = await prisma.listing.findMany({
            where: { status: "ACTIVE" },
            select: { driveType: true },
            distinct: ["driveType"],
            orderBy: { driveType: "asc" },
        });
        return driveTypes.map((d) => d.driveType).filter(Boolean);
    }

    async getBodyTypes() {
        const bodyTypes = await prisma.listing.findMany({
            where: { status: "ACTIVE" },
            select: { bodyType: true },
            distinct: ["bodyType"],
            orderBy: { bodyType: "asc" },
        });
        return bodyTypes.map((b) => b.bodyType).filter(Boolean);
    }
}
