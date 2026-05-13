import type { RewardTransaction } from "@/store/rewardStore";

const REWARDS_API_URL = process.env.EXPO_PUBLIC_REWARDS_API_URL;
const REQUEST_TIMEOUT_MS = 7000;

export type LeaderboardPeriod = "weekly" | "monthly" | "all";

export type RemoteLeaderboardItem = {
  code: string;
  points: number;
  rank?: number;
};

export type RewardSyncPayload = {
  userCode: string;
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  weekKey: string;
  monthKey: string;
  latestTransaction?: RewardTransaction;
};

export type RewardConfig = {
  ok?: boolean;
  isActive: boolean;
  mode: "monthly";
  minimumMonthlyPoints: number;
  prizeTitle: string;
  prizeDescription: string;
  prizeImageUrl: string;
  prizes: RewardPrize[];
};

export type RewardPrize = {
  rank: number;
  title: string;
  description: string;
  imageUrl: string;
};

export type RewardClaimPayload = {
  userCode: string;
  fullName: string;
  contact: string;
  address: string;
};

function hasRewardsApi() {
  return typeof REWARDS_API_URL === "string" && REWARDS_API_URL.trim().length > 0;
}

function getRewardsApiUrl() {
  return REWARDS_API_URL?.trim().replace(/\/$/, "");
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (!hasRewardsApi()) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getRewardsApiUrl()}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      },
      signal: controller.signal
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function syncRewardScore(payload: RewardSyncPayload) {
  return requestJson<{ ok: boolean }>("/rewards/sync", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function fetchRewardLeaderboard(period: LeaderboardPeriod, limit = 20) {
  const result = await requestJson<{ items?: RemoteLeaderboardItem[] }>(`/leaderboard?period=${period}&limit=${limit}`);
  return Array.isArray(result?.items) ? result.items : null;
}

export async function fetchRewardConfig() {
  return requestJson<RewardConfig>("/rewards/config");
}

export async function submitRewardClaim(payload: RewardClaimPayload) {
  return requestJson<{ ok: boolean; claimId?: string; error?: string }>("/rewards/claim", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function isRewardsApiConfigured() {
  return hasRewardsApi();
}
