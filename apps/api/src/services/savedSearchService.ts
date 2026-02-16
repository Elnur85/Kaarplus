import { prisma } from "@kaarplus/database";
import { Prisma } from "@prisma/client";

export class SavedSearchService {
    async getSavedSearches(userId: string) {
        return prisma.savedSearch.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    async createSavedSearch(
        userId: string,
        data: { name: string; filters: Prisma.InputJsonValue; emailAlerts?: boolean },
    ) {
        const count = await prisma.savedSearch.count({ where: { userId } });
        if (count >= 20) {
            throw new Error("Maximum 20 saved searches allowed");
        }
        return prisma.savedSearch.create({
            data: {
                userId,
                name: data.name,
                filters: data.filters,
                emailAlerts: data.emailAlerts ?? false,
            },
        });
    }

    async updateSavedSearch(
        id: string,
        userId: string,
        data: { name?: string; emailAlerts?: boolean },
    ) {
        const search = await prisma.savedSearch.findFirst({ where: { id, userId } });
        if (!search) throw new Error("Saved search not found");
        return prisma.savedSearch.update({
            where: { id },
            data,
        });
    }

    async deleteSavedSearch(id: string, userId: string) {
        const search = await prisma.savedSearch.findFirst({ where: { id, userId } });
        if (!search) throw new Error("Saved search not found");
        return prisma.savedSearch.delete({ where: { id } });
    }
}

export const savedSearchService = new SavedSearchService();
