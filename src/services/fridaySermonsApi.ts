import type { FridayKhutbah } from "@/data/fridayKhutbahs";

const API_URL = process.env.EXPO_PUBLIC_REWARDS_API_URL;
const REQUEST_TIMEOUT_MS = 7000;
const TRUSTED_SOURCES = new Set(["Diyanet Dijital", "Diyanet Haber", "Diyanet TV"]);

type RemoteFridayKhutbah = Partial<FridayKhutbah> & {
  publishedAt?: string;
};

function getApiUrl() {
  return API_URL?.trim().replace(/\/$/, "");
}

function hasApiUrl() {
  return typeof API_URL === "string" && API_URL.trim().length > 0;
}

function normalizeSermon(item: RemoteFridayKhutbah): FridayKhutbah | null {
  if (!item.isoDate || !item.title || !item.youtubeVideoId) {
    return null;
  }

  const sourceName = item.sourceName || "Diyanet Dijital";
  if (!TRUSTED_SOURCES.has(sourceName)) {
    return null;
  }

  return {
    id: item.id || item.isoDate,
    isoDate: item.isoDate,
    date: item.date || item.isoDate,
    monthKey: item.monthKey || item.isoDate.slice(0, 7),
    monthLabel: item.monthLabel || item.isoDate.slice(0, 7),
    title: item.title,
    summary: item.summary || "Diyanet Dijital tarafından yayımlanan resmi Cuma hutbesi videosu.",
    sourceName,
    sourceUrl: item.sourceUrl || `https://www.youtube.com/watch?v=${item.youtubeVideoId}`,
    youtubeVideoId: item.youtubeVideoId
  };
}

export async function fetchRemoteFridaySermons() {
  if (!hasApiUrl()) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getApiUrl()}/friday-sermons/config`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as { sermons?: RemoteFridayKhutbah[] };
    if (!Array.isArray(body.sermons)) {
      return null;
    }

    return body.sermons.map(normalizeSermon).filter(Boolean) as FridayKhutbah[];
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
