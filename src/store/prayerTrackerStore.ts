import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import type { IconName } from "@/types";

const STORAGE_KEY = "huzur.prayer-tracker.v1";
const MAX_REWARDED_KEYS = 500;

export type TrackedPrayerId = "sabah" | "ogle" | "ikindi" | "aksam" | "yatsi";
export type PrayerCompletionStatus = "done" | "later" | "missed";

export type TrackedPrayer = {
  id: TrackedPrayerId;
  timeId: string;
  name: string;
  icon: IconName;
};

export type PrayerDayRecord = {
  dateKey: string;
  prayers: Partial<Record<TrackedPrayerId, PrayerCompletionStatus>>;
};

type StoredPrayerTrackerState = {
  records: Record<string, PrayerDayRecord>;
  rewardedPrayerKeys: string[];
  rewardedDayKeys: string[];
};

type PrayerRewardResult = {
  prayerReward?: {
    title: string;
    description: string;
    points: number;
  };
  dayReward?: {
    title: string;
    description: string;
    points: number;
  };
};

type PrayerTrackerState = StoredPrayerTrackerState & {
  isHydrated: boolean;
  hydratePrayerTracker: () => Promise<void>;
  markPrayer: (dateKey: string, prayerId: TrackedPrayerId, status: PrayerCompletionStatus) => Promise<PrayerRewardResult>;
};

export const trackedPrayers: TrackedPrayer[] = [
  { id: "sabah", timeId: "imsak", name: "Sabah", icon: "sunny" },
  { id: "ogle", timeId: "ogle", name: "Öğle", icon: "partly-sunny" },
  { id: "ikindi", timeId: "ikindi", name: "İkindi", icon: "cloudy" },
  { id: "aksam", timeId: "aksam", name: "Akşam", icon: "moon" },
  { id: "yatsi", timeId: "yatsi", name: "Yatsı", icon: "sparkles" }
];

function createDefaultState(): StoredPrayerTrackerState {
  return {
    records: {},
    rewardedPrayerKeys: [],
    rewardedDayKeys: []
  };
}

function normalizeState(stored?: Partial<StoredPrayerTrackerState> | null): StoredPrayerTrackerState {
  return {
    records: stored?.records && typeof stored.records === "object" ? stored.records : {},
    rewardedPrayerKeys: Array.isArray(stored?.rewardedPrayerKeys) ? stored.rewardedPrayerKeys.slice(-MAX_REWARDED_KEYS) : [],
    rewardedDayKeys: Array.isArray(stored?.rewardedDayKeys) ? stored.rewardedDayKeys.slice(-MAX_REWARDED_KEYS) : []
  };
}

async function persistPrayerTracker(state: StoredPrayerTrackerState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getDateKey(date = new Date()) {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

export function formatDateLabel(date: Date) {
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });
}

export function getPrayerProgress(records: Record<string, PrayerDayRecord>, dateKey = getDateKey()) {
  const record = records[dateKey];
  const completed = trackedPrayers.filter((prayer) => record?.prayers[prayer.id] === "done").length;
  return {
    completed,
    total: trackedPrayers.length,
    isComplete: completed === trackedPrayers.length
  };
}

export function getCompletionStreak(records: Record<string, PrayerDayRecord>, startDate = new Date()) {
  let streak = 0;

  for (let index = 0; index < 365; index += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() - index);

    if (!getPrayerProgress(records, getDateKey(date)).isComplete) {
      break;
    }

    streak += 1;
  }

  return streak;
}

export function getRecentPrayerDates(count = 7) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - 1 - index));
    return date;
  });
}

export const usePrayerTrackerStore = create<PrayerTrackerState>((set, get) => ({
  ...createDefaultState(),
  isHydrated: false,

  hydratePrayerTracker: async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      const stored = value ? (JSON.parse(value) as Partial<StoredPrayerTrackerState>) : null;
      const tracker = normalizeState(stored);
      set({ ...tracker, isHydrated: true });
      await persistPrayerTracker(tracker);
    } catch {
      set({ ...createDefaultState(), isHydrated: true });
    }
  },

  markPrayer: async (dateKey, prayerId, status) => {
    const state = normalizeState(get());
    const currentRecord = state.records[dateKey] ?? { dateKey, prayers: {} };
    const previousStatus = currentRecord.prayers[prayerId];
    const nextRecord: PrayerDayRecord = {
      dateKey,
      prayers: {
        ...currentRecord.prayers,
        [prayerId]: status
      }
    };
    const nextRecords = {
      ...state.records,
      [dateKey]: nextRecord
    };
    const prayerRewardKey = `${dateKey}:${prayerId}`;
    const dayRewardKey = dateKey;
    const rewardResult: PrayerRewardResult = {};
    let rewardedPrayerKeys = state.rewardedPrayerKeys;
    let rewardedDayKeys = state.rewardedDayKeys;

    if (status === "done" && previousStatus !== "done" && !rewardedPrayerKeys.includes(prayerRewardKey)) {
      rewardedPrayerKeys = [...rewardedPrayerKeys, prayerRewardKey].slice(-MAX_REWARDED_KEYS);
      const prayer = trackedPrayers.find((item) => item.id === prayerId);
      rewardResult.prayerReward = {
        title: `${prayer?.name ?? "Namaz"} tamamlandı`,
        description: "Namaz devamlılığı",
        points: 2
      };
    }

    if (getPrayerProgress(nextRecords, dateKey).isComplete && !rewardedDayKeys.includes(dayRewardKey)) {
      rewardedDayKeys = [...rewardedDayKeys, dayRewardKey].slice(-MAX_REWARDED_KEYS);
      rewardResult.dayReward = {
        title: "Günlük namaz hedefi tamamlandı",
        description: "5 vakit namaz tamamlandı",
        points: 10
      };
    }

    const nextState: StoredPrayerTrackerState = {
      records: nextRecords,
      rewardedPrayerKeys,
      rewardedDayKeys
    };

    set({ ...nextState, isHydrated: true });
    await persistPrayerTracker(nextState);
    return rewardResult;
  }
}));
