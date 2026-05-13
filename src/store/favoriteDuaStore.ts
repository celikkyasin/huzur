import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEY = "huzur.favorite-duas.v1";

type FavoriteDuaState = {
  favoriteIds: string[];
  isHydrated: boolean;
  hydrateFavorites: () => Promise<void>;
  isFavorite: (duaId: string) => boolean;
  toggleFavorite: (duaId: string) => Promise<void>;
};

export const useFavoriteDuaStore = create<FavoriteDuaState>((set, get) => ({
  favoriteIds: [],
  isHydrated: false,

  hydrateFavorites: async () => {
    try {
      const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
      const favoriteIds = storedValue ? (JSON.parse(storedValue) as string[]) : [];
      set({ favoriteIds, isHydrated: true });
    } catch {
      set({ favoriteIds: [], isHydrated: true });
    }
  },

  isFavorite: (duaId) => get().favoriteIds.includes(duaId),

  toggleFavorite: async (duaId) => {
    const currentFavorites = get().favoriteIds;
    const favoriteIds = currentFavorites.includes(duaId)
      ? currentFavorites.filter((id) => id !== duaId)
      : [...currentFavorites, duaId];

    set({ favoriteIds });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
  }
}));
