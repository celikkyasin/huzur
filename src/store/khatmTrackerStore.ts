import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEY = "huzur.khatm-tracker.v1";
export const KHATM_TOTAL_JUZ = 30;

export type KhatmJuzStatus = "unread" | "reading" | "done";

type KhatmTrackerStoredState = {
  startedAt: string;
  statuses: Record<number, KhatmJuzStatus>;
  completionRewarded: boolean;
};

type KhatmTrackerState = KhatmTrackerStoredState & {
  isHydrated: boolean;
  hydrateKhatmTracker: () => Promise<void>;
  setJuzStatus: (juz: number, status: KhatmJuzStatus) => Promise<void>;
  resetKhatm: () => Promise<void>;
  markCompletionRewarded: () => Promise<void>;
};

function createDefaultState(): KhatmTrackerStoredState {
  return {
    startedAt: new Date().toISOString(),
    statuses: {},
    completionRewarded: false
  };
}

function normalizeStatus(status?: unknown): KhatmJuzStatus | undefined {
  return status === "reading" || status === "done" || status === "unread" ? status : undefined;
}

function normalizeState(stored?: Partial<KhatmTrackerStoredState> | null): KhatmTrackerStoredState {
  const statuses: Record<number, KhatmJuzStatus> = {};

  if (stored?.statuses && typeof stored.statuses === "object") {
    Object.entries(stored.statuses).forEach(([key, value]) => {
      const juz = Number(key);
      const status = normalizeStatus(value);

      if (Number.isInteger(juz) && juz >= 1 && juz <= KHATM_TOTAL_JUZ && status) {
        statuses[juz] = status;
      }
    });
  }

  return {
    startedAt: typeof stored?.startedAt === "string" ? stored.startedAt : new Date().toISOString(),
    statuses,
    completionRewarded: stored?.completionRewarded === true
  };
}

async function persistKhatmTracker(state: KhatmTrackerStoredState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getKhatmProgress(statuses: Record<number, KhatmJuzStatus>) {
  const completed = Array.from({ length: KHATM_TOTAL_JUZ }, (_, index) => index + 1).filter((juz) => statuses[juz] === "done").length;
  return {
    completed,
    total: KHATM_TOTAL_JUZ,
    percent: Math.round((completed / KHATM_TOTAL_JUZ) * 100),
    isComplete: completed === KHATM_TOTAL_JUZ
  };
}

export const useKhatmTrackerStore = create<KhatmTrackerState>((set, get) => ({
  ...createDefaultState(),
  isHydrated: false,

  hydrateKhatmTracker: async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      const tracker = normalizeState(value ? (JSON.parse(value) as Partial<KhatmTrackerStoredState>) : null);
      set({ ...tracker, isHydrated: true });
      await persistKhatmTracker(tracker);
    } catch {
      set({ ...createDefaultState(), isHydrated: true });
    }
  },

  setJuzStatus: async (juz, status) => {
    if (!Number.isInteger(juz) || juz < 1 || juz > KHATM_TOTAL_JUZ) {
      return;
    }

    const state = normalizeState(get());
    const nextState: KhatmTrackerStoredState = {
      ...state,
      statuses: {
        ...state.statuses,
        [juz]: status
      },
      completionRewarded: status !== "done" ? false : state.completionRewarded
    };

    set({ ...nextState, isHydrated: true });
    await persistKhatmTracker(nextState);
  },

  resetKhatm: async () => {
    const nextState = createDefaultState();
    set({ ...nextState, isHydrated: true });
    await persistKhatmTracker(nextState);
  },

  markCompletionRewarded: async () => {
    const state = normalizeState(get());
    const nextState = {
      ...state,
      completionRewarded: true
    };

    set({ ...nextState, isHydrated: true });
    await persistKhatmTracker(nextState);
  }
}));
