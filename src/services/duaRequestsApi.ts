const DEFAULT_API_URL = "https://huzur-six.vercel.app";
const API_URL = process.env.EXPO_PUBLIC_REWARDS_API_URL;
const REQUEST_TIMEOUT_MS = 7000;

export type RemoteDuaRequest = {
  id: string;
  name: string;
  text: string;
  prayerCount: number;
  createdAt: string;
};

function getApiUrl() {
  const envUrl = API_URL?.trim();
  return (envUrl && envUrl.startsWith("http") ? envUrl : DEFAULT_API_URL).replace(/\/$/, "");
}

function isConfigured() {
  return true;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getApiUrl()}${path}`, {
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

export async function fetchDuaRequests() {
  const result = await requestJson<{ ok?: boolean; requests?: RemoteDuaRequest[] }>("/dua-requests");
  return Array.isArray(result?.requests) ? result.requests : null;
}

export async function submitDuaRequest(payload: { name: string; text: string }) {
  return requestJson<{ ok?: boolean; request?: RemoteDuaRequest; error?: string }>("/dua-requests", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function sendDuaPrayer(id: string) {
  return requestJson<{ ok?: boolean; request?: RemoteDuaRequest; error?: string }>("/dua-requests/pray", {
    method: "POST",
    body: JSON.stringify({ id })
  });
}

export function isDuaRequestsApiConfigured() {
  return isConfigured();
}
