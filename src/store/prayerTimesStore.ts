import { create } from "zustand";
import { prayerTimes as fallbackPrayerTimes } from "@/data/mock";
import { fetchPrayerTimesForLocation, type PrayerTimesLocation } from "@/services/prayerTimesApi";
import type { PrayerTime } from "@/types";

type PrayerTimesState = {
  times: PrayerTime[];
  isLoading: boolean;
  errorMessage?: string;
  sourceLabel: string;
  dateLabel?: string;
  placeLabel?: string;
  lastLocationKey?: string;
  loadPrayerTimes: (location: PrayerTimesLocation) => Promise<void>;
};

function buildLocationKey(location: PrayerTimesLocation) {
  return [location.country, location.city, location.district, location.latitude?.toFixed(3), location.longitude?.toFixed(3)].filter(Boolean).join("|");
}

export const usePrayerTimesStore = create<PrayerTimesState>((set, get) => ({
  times: fallbackPrayerTimes,
  isLoading: false,
  sourceLabel: "Örnek vakitler",

  loadPrayerTimes: async (location) => {
    const locationKey = buildLocationKey(location);
    const state = get();

    if (!location.city && !location.latitude) {
      return;
    }

    if (state.isLoading || (state.lastLocationKey === locationKey && state.sourceLabel !== "Örnek vakitler")) {
      return;
    }

    set({ isLoading: true, errorMessage: undefined });

    try {
      const result = await fetchPrayerTimesForLocation(location);
      set({
        times: result.times,
        sourceLabel: result.sourceLabel,
        dateLabel: result.dateLabel,
        placeLabel: result.placeLabel,
        lastLocationKey: locationKey,
        isLoading: false,
        errorMessage: result.sourceLabel === "Örnek vakitler" ? "Güncel vakitlere ulaşılamadı, örnek vakitler gösteriliyor." : undefined
      });
    } catch {
      set({
        times: fallbackPrayerTimes,
        sourceLabel: "Örnek vakitler",
        lastLocationKey: locationKey,
        isLoading: false,
        errorMessage: "Namaz vakitleri şu anda alınamadı."
      });
    }
  }
}));
