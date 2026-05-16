import type { AllahName } from "@/data/namesOfAllah";

const API_URL = process.env.EXPO_PUBLIC_REWARDS_API_URL;
const FALLBACK_API_URL = "https://huzur-six.vercel.app";
const REQUEST_TIMEOUT_MS = 7000;

type RemoteNameImage = {
  id?: string;
  order?: number;
  transliteration?: string;
  imageUrl?: string;
  aspectRatio?: number;
};

function getApiUrl() {
  return (API_URL?.trim() || FALLBACK_API_URL).replace(/\/$/, "");
}

function hasApiUrl() {
  return true;
}

function normalizeAspectRatio(value: unknown) {
  const ratio = Number(value);
  return Number.isFinite(ratio) && ratio > 0 ? Math.max(0.45, Math.min(1.2, ratio)) : 9 / 16;
}

function normalizeKey(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("tr-TR");
}

export async function fetchRemoteNameImages(names: AllahName[]) {
  if (!hasApiUrl()) {
    return names;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getApiUrl()}/names-of-allah/config`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal
    });

    if (!response.ok) {
      return names;
    }

    const body = (await response.json()) as { images?: RemoteNameImage[] };
    if (!Array.isArray(body.images)) {
      return names;
    }

    const byId = new Map(body.images.filter((item) => item.imageUrl).map((item) => [normalizeKey(item.id), item]));
    const byName = new Map(body.images.filter((item) => item.imageUrl).map((item) => [normalizeKey(item.transliteration), item]));
    const byOrder = new Map(body.images.filter((item) => item.imageUrl && Number.isFinite(Number(item.order))).map((item) => [Number(item.order), item]));

    return names.map((name) => {
      const remote = byId.get(normalizeKey(name.id)) || byName.get(normalizeKey(name.transliteration)) || byOrder.get(name.order);
      if (!remote?.imageUrl) {
        return name;
      }

      return {
        ...name,
        imageUrl: remote.imageUrl,
        aspectRatio: normalizeAspectRatio(remote.aspectRatio)
      };
    });
  } catch {
    return names;
  } finally {
    clearTimeout(timeout);
  }
}
