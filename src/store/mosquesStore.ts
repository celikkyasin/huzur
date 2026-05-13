import { create } from "zustand";
import { mosques as fallbackMosques } from "@/data/mock";
import { fetchNearbyMosques, getCachedNearbyMosques } from "@/services/mosquesApi";
import type { Mosque } from "@/types";

type MosquesLocation = {
  latitude?: number;
  longitude?: number;
};

type MosquesState = {
  mosques: Mosque[];
  isLoading: boolean;
  errorMessage?: string;
  sourceLabel: string;
  lastLocationKey?: string;
  loadNearbyMosques: (location: MosquesLocation, force?: boolean) => Promise<void>;
};

function buildLocationKey(location: MosquesLocation) {
  if (typeof location.latitude !== "number" || typeof location.longitude !== "number") {
    return "konum-yok";
  }

  return `${location.latitude.toFixed(3)}|${location.longitude.toFixed(3)}`;
}

export const useMosquesStore = create<MosquesState>((set, get) => ({
  mosques: fallbackMosques,
  isLoading: false,
  sourceLabel: "Örnek camiler",

  loadNearbyMosques: async (location, force = false) => {
    const locationKey = buildLocationKey(location);
    const state = get();

    if (locationKey === "konum-yok") {
      return;
    }

    if (!force && state.isLoading) {
      return;
    }

    set({ isLoading: true, errorMessage: undefined });

    try {
      const cachedResult = await getCachedNearbyMosques(location);

      if (cachedResult?.mosques.length && !force) {
        set({
          mosques: cachedResult.mosques,
          sourceLabel: "Kaydedilmiş camiler güncelleniyor",
          lastLocationKey: locationKey,
          isLoading: true,
          errorMessage: undefined
        });
      } else if (!force && state.lastLocationKey === locationKey && state.sourceLabel !== "Örnek camiler") {
        set({ isLoading: false });
        return;
      }

      const result = await fetchNearbyMosques(location);
      set({
        mosques: result.mosques,
        sourceLabel: result.sourceLabel,
        lastLocationKey: locationKey,
        isLoading: false,
        errorMessage: result.sourceLabel === "Örnek camiler" ? "Yakındaki camiler alınamadı, yakın zamanda tekrar deneyin." : undefined
      });
    } catch {
      set({
        mosques: fallbackMosques,
        sourceLabel: "Örnek camiler",
        lastLocationKey: locationKey,
        isLoading: false,
        errorMessage: "Yakındaki camiler şu anda alınamadı."
      });
    }
  }
}));
