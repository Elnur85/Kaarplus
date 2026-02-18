import { create } from "zustand";
import { apiFetch } from "@/lib/api-client";

interface FavoritesStore {
	favoriteIds: Set<string>;
	isLoaded: boolean;
	isLoading: boolean;
	error: string | null;
	toggleFavorite: (listingId: string) => Promise<void>;
	loadFavorites: () => Promise<void>;
	isFavorite: (listingId: string) => boolean;
	clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
	favoriteIds: new Set<string>(),
	isLoaded: false,
	isLoading: false,
	error: null,

	loadFavorites: async () => {
		// Don't load if already loaded or loading
		const { isLoaded, isLoading } = get();
		if (isLoaded || isLoading) return;

		// In cookie-based auth, we try to load and if it's 401, we know we're unauthenticated.
		set({ isLoading: true, error: null });

		try {
			const response = await apiFetch("/user/favorites/ids");

			// Handle 401 - user not authenticated
			if (response.status === 401) {
				set({ favoriteIds: new Set(), isLoaded: true, isLoading: false, error: null });
				return;
			}

			if (!response.ok) {
				throw new Error(`Failed to load favorites: ${response.status}`);
			}

			const json = await response.json();
			const ids: string[] = json.data ?? [];

			set({ favoriteIds: new Set(ids), isLoaded: true, isLoading: false, error: null });
		} catch (error) {
			console.error("Failed to load favorites:", error);
			set({
				favoriteIds: new Set(),
				isLoaded: true,
				isLoading: false,
				error: error instanceof Error ? error.message : "Unknown error"
			});
		}
	},

	toggleFavorite: async (listingId: string) => {
		const { favoriteIds } = get();
		const wasFavorited = favoriteIds.has(listingId);

		// Optimistic update
		const nextIds = new Set(favoriteIds);
		if (wasFavorited) {
			nextIds.delete(listingId);
		} else {
			nextIds.add(listingId);
		}
		set({ favoriteIds: nextIds });

		try {
			const response = await apiFetch(`/user/favorites/${listingId}`, {
				method: wasFavorited ? "DELETE" : "POST",
			});

			if (!response.ok) {
				// Handle 401 - user not authenticated
				if (response.status === 401) {
					throw new Error("Please log in to save favorites");
				}
				throw new Error(`Failed to toggle favorite: ${response.status}`);
			}
		} catch (error) {
			// Revert optimistic update on failure
			console.error("Failed to toggle favorite:", error);
			const revertedIds = new Set(get().favoriteIds);
			if (wasFavorited) {
				revertedIds.add(listingId);
			} else {
				revertedIds.delete(listingId);
			}
			set({ favoriteIds: revertedIds });
			throw error;
		}
	},

	isFavorite: (listingId: string) => {
		return get().favoriteIds.has(listingId);
	},

	clearFavorites: () => {
		set({ favoriteIds: new Set(), isLoaded: false, isLoading: false, error: null });
	},
}));
