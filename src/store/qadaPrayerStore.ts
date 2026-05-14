import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import type { TrackedPrayerId } from "@/store/prayerTrackerStore";

const STORAGE_KEY = "huzur.qada-prayers.v1";

type QadaPrayerCounts = Record<TrackedPrayerId, number>;

type QadaPrayerState = {
  counts: QadaPrayerCounts;
  isHydrated: boolean;
  hydrateQadaPrayers: () => Promise<void>;
  setCount: (prayerId: TrackedPrayerId, count: number) => Promise<void>;
  changeCount: (prayerId: TrackedPrayerId, amount: number) => Promise<void>;
};

function createDefaultCounts(): QadaPrayerCounts {
  return {
    sabah: 0,
    ogle: 0,
    ikindi: 0,
    aksam: 0,
    yatsi: 0
  };
}

function normalizeCounts(value?: Partial<QadaPrayerCounts> | null): QadaPrayerCounts {
  const defaults = createDefaultCounts();
  return {
    sabah: Math.max(0, Number(value?.sabah ?? defaults.sabah)),
    ogle: Math.max(0, Number(value?.ogle ?? defaults.ogle)),
    ikindi: Math.max(0, Number(value?.ikindi ?? defaults.ikindi)),
    aksam: Math.max(0, Number(value?.aksam ?? defaults.aksam)),
    yatsi: Math.max(0, Number(value?.yatsi ?? defaults.yatsi))
  };
}

async function persistQadaPrayers(counts: QadaPrayerCounts) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
}

export const useQadaPrayerStore = create<QadaPrayerState>((set, get) => ({
  counts: createDefaultCounts(),
  isHydrated: false,

  hydrateQadaPrayers: async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      const counts = normalizeCounts(value ? (JSON.parse(value) as Partial<QadaPrayerCounts>) : null);
      set({ counts, isHydrated: true });
      await persistQadaPrayers(counts);
    } catch {
      set({ counts: createDefaultCounts(), isHydrated: true });
    }
  },

  setCount: async (prayerId, count) => {
    const counts = normalizeCounts({
      ...get().counts,
      [prayerId]: count
    });
    set({ counts, isHydrated: true });
    await persistQadaPrayers(counts);
  },

  changeCount: async (prayerId, amount) => {
    const current = get().counts[prayerId] ?? 0;
    await get().setCount(prayerId, current + amount);
  }
}));
