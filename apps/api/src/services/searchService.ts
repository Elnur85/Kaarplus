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
}
