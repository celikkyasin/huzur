import { create } from "zustand";
import { mosques as fallbackMosques } from "@/data/mock";
import { fetchNearbyMosques } from "@/services/mosquesApi";
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

    if (!force && (state.isLoading || (state.lastLocationKey === locationKey && state.sourceLabel !== "Örnek camiler"))) {
      return;
    }

    set({ isLoading: true, errorMessage: undefined });

    try {
      const result = await fetchNearbyMosques(location);
      set({
        mosques: result.mosques,
        sourceLabel: result.sourceLabel,
        lastLocationKey: locationKey,
        isLoading: false,
        errorMessage: result.sourceLabel === "Örnek camiler" ? "Yakındaki camiler alınamadı, örnek liste gösteriliyor." : undefined
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
