import type { FridayMessage } from "@/types";

const API_URL = process.env.EXPO_PUBLIC_REWARDS_API_URL;
const REQUEST_TIMEOUT_MS = 7000;

type RemoteFridayMessage = {
  id: string;
  category: string;
  message: string;
  background?: string;
  accent?: string;
  imageUrl?: string;
  aspectRatio?: number;
};

function getApiUrl() {
  return API_URL?.trim().replace(/\/$/, "");
}

function hasApiUrl() {
  return typeof API_URL === "string" && API_URL.trim().length > 0;
}

function normalizeAspectRatio(value: unknown) {
  const ratio = Number(value);
  return Number.isFinite(ratio) && ratio > 0 ? Math.max(0.56, Math.min(1.8, ratio)) : undefined;
}

export async function fetchRemoteFridayMessages() {
  if (!hasApiUrl()) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getApiUrl()}/friday-messages/config`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as { messages?: RemoteFridayMessage[] };
    if (!Array.isArray(body.messages)) {
      return null;
    }

    return body.messages
      .filter((item) => item.imageUrl && item.message)
      .map<FridayMessage>((item) => ({
        id: item.id,
        category: item.category || "Cuma Mesajları",
        message: item.message,
        background: item.background || "#075E47",
        accent: item.accent || "#D7B35A",
        imageUrl: item.imageUrl,
        aspectRatio: normalizeAspectRatio(item.aspectRatio),
        mediaType: "image"
      }));
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
