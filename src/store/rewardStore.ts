import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { fetchRewardLeaderboard, isRewardsApiConfigured, syncRewardScore, type LeaderboardPeriod, type RemoteLeaderboardItem } from "@/services/rewardsApi";

const REWARD_STORAGE_KEY = "huzur.rewards.v1";
const MAX_HISTORY_ITEMS = 30;
export const DAILY_REWARDED_AD_LIMIT = 15;

export type RewardAction = "dhikr33" | "dhikr99" | "fridayShare" | "surahListen" | "rewardedAd" | "prayerDone" | "prayerCompleteDay" | "khatmComplete";

export type RewardTransaction = {
  id: string;
  action: RewardAction;
  title: string;
  description: string;
  points: number;
  createdAt: string;
};

type StoredRewardState = {
  userCode: string;
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  weekKey: string;
  monthKey: string;
  fridayShareRewardDates: string[];
  rewardedAdRewardDates: string[];
  history: RewardTransaction[];
};

type AwardRewardInput = {
  action: RewardAction;
  title: string;
  description: string;
  points: number;
};

type RewardState = StoredRewardState & {
  isHydrated: boolean;
  leaderboard: RemoteLeaderboardItem[];
  leaderboardPeriod: LeaderboardPeriod;
  isSyncing: boolean;
  lastSyncedAt?: string;
  syncError?: string;
  isRemoteLeaderboardEnabled: boolean;
  hydrateRewards: () => Promise<void>;
  awardReward: (input: AwardRewardInput) => Promise<RewardTransaction | null>;
  syncRewards: () => Promise<void>;
  loadLeaderboard: (period?: LeaderboardPeriod) => Promise<void>;
};

function getWeekKey(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  const dayOffset = Math.floor((date.getTime() - start.getTime()) / 86400000);
  const week = Math.ceil((dayOffset + start.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${week.toString().padStart(2, "0")}`;
}

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
}

function getDateKey(date = new Date()) {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

function createUserCode() {
  return `HZR-${Math.floor(10000 + Math.random() * 90000)}`;
}

function createDefaultState(): StoredRewardState {
  return {
    userCode: createUserCode(),
    totalPoints: 0,
    weeklyPoints: 0,
    monthlyPoints: 0,
    weekKey: getWeekKey(),
    monthKey: getMonthKey(),
    fridayShareRewardDates: [],
    rewardedAdRewardDates: [],
    history: []
  };
}

function normalizeStoredState(stored?: Partial<StoredRewardState> | null): StoredRewardState {
  const defaults = createDefaultState();
  const nextState = {
    ...defaults,
    ...stored,
    userCode: stored?.userCode || defaults.userCode,
    fridayShareRewardDates: Array.isArray(stored?.fridayShareRewardDates) ? stored.fridayShareRewardDates.slice(-60) : [],
    rewardedAdRewardDates: Array.isArray(stored?.rewardedAdRewardDates) ? stored.rewardedAdRewardDates.slice(-450) : [],
    history: Array.isArray(stored?.history) ? stored.history.slice(0, MAX_HISTORY_ITEMS) : []
  };

  const currentWeekKey = getWeekKey();
  const currentMonthKey = getMonthKey();

  if (nextState.weekKey !== currentWeekKey) {
    nextState.weekKey = currentWeekKey;
    nextState.weeklyPoints = 0;
  }

  if (nextState.monthKey !== currentMonthKey) {
    nextState.monthKey = currentMonthKey;
    nextState.monthlyPoints = 0;
  }

  return nextState;
}

async function persistRewards(state: StoredRewardState) {
  await AsyncStorage.setItem(REWARD_STORAGE_KEY, JSON.stringify(state));
}

export const useRewardStore = create<RewardState>((set, get) => ({
  ...createDefaultState(),
  isHydrated: false,
  leaderboard: [],
  leaderboardPeriod: "monthly",
  isSyncing: false,
  isRemoteLeaderboardEnabled: isRewardsApiConfigured(),

  hydrateRewards: async () => {
    try {
      const value = await AsyncStorage.getItem(REWARD_STORAGE_KEY);
      const parsed = value ? (JSON.parse(value) as Partial<StoredRewardState>) : null;
      const rewards = normalizeStoredState(parsed);

      set({ ...rewards, isHydrated: true });
      await persistRewards(rewards);
      void get().syncRewards();
      void get().loadLeaderboard();
    } catch {
      set({ ...createDefaultState(), isHydrated: true });
    }
  },

  awardReward: async ({ action, title, description, points }) => {
    if (points <= 0) {
      return null;
    }

    const state = normalizeStoredState(get());
    const today = new Date();
    const todayKey = getDateKey(today);

    if (action === "fridayShare") {
      const isFriday = today.getDay() === 5;
      if (!isFriday || state.fridayShareRewardDates.includes(todayKey)) {
        return null;
      }
    }

    if (action === "rewardedAd") {
      const todayRewardedAds = state.rewardedAdRewardDates.filter((dateKey) => dateKey === todayKey).length;
      if (todayRewardedAds >= DAILY_REWARDED_AD_LIMIT) {
        return null;
      }
    }

    const transaction: RewardTransaction = {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      action,
      title,
      description,
      points,
      createdAt: new Date().toISOString()
    };
    const rewards: StoredRewardState = {
      ...state,
      totalPoints: state.totalPoints + points,
      weeklyPoints: state.weeklyPoints + points,
      monthlyPoints: state.monthlyPoints + points,
      fridayShareRewardDates: action === "fridayShare" ? [...state.fridayShareRewardDates, todayKey].slice(-60) : state.fridayShareRewardDates,
      rewardedAdRewardDates: action === "rewardedAd" ? [...state.rewardedAdRewardDates, todayKey].slice(-450) : state.rewardedAdRewardDates,
      history: [transaction, ...state.history].slice(0, MAX_HISTORY_ITEMS)
    };

    set({ ...rewards, isHydrated: true });
    await persistRewards(rewards);
    void get().syncRewards();
    return transaction;
  },

  syncRewards: async () => {
    if (!isRewardsApiConfigured()) {
      set({ isRemoteLeaderboardEnabled: false, syncError: undefined });
      return;
    }

    const state = normalizeStoredState(get());
    set({ isSyncing: true, isRemoteLeaderboardEnabled: true, syncError: undefined });

    const result = await syncRewardScore({
      userCode: state.userCode,
      totalPoints: state.totalPoints,
      weeklyPoints: state.weeklyPoints,
      monthlyPoints: state.monthlyPoints,
      weekKey: state.weekKey,
      monthKey: state.monthKey,
      latestTransaction: state.history[0]
    });

    set({
      isSyncing: false,
      lastSyncedAt: result?.ok ? new Date().toISOString() : get().lastSyncedAt,
      syncError: result?.ok ? undefined : "Puan tablosu şu anda güncellenemedi."
    });
  },

  loadLeaderboard: async (period = get().leaderboardPeriod) => {
    if (!isRewardsApiConfigured()) {
      set({ leaderboard: [], leaderboardPeriod: period, isRemoteLeaderboardEnabled: false, syncError: undefined });
      return;
    }

    set({ isSyncing: true, leaderboardPeriod: period, isRemoteLeaderboardEnabled: true, syncError: undefined });

    const items = await fetchRewardLeaderboard(period);

    set({
      leaderboard: items ?? get().leaderboard,
      isSyncing: false,
      lastSyncedAt: items ? new Date().toISOString() : get().lastSyncedAt,
      syncError: items ? undefined : "Puan tablosu şu anda güncellenemedi."
    });
  }
}));
