import type { FridayKhutbah } from "@/data/fridayKhutbahs";

const DEFAULT_API_URL = "https://huzur-six.vercel.app";
const API_URL = process.env.EXPO_PUBLIC_REWARDS_API_URL;
const REQUEST_TIMEOUT_MS = 8000;
const TRUSTED_SOURCES = new Set(["Diyanet Dijital", "Diyanet Haber", "Diyanet TV"]);
const DIYANET_DIGITAL_CHANNEL_ID = "UCE7X5yJpLm4k_L-V_WH7yWA";
const DIYANET_DIGITAL_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${DIYANET_DIGITAL_CHANNEL_ID}`;
const DIYANET_HABER_HUTBELER_URL = "https://www.diyanethaber.com.tr/hutbeler";

const monthNames = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık"
];
const monthNumbers = new Map(monthNames.map((month, index) => [month.toLocaleLowerCase("tr-TR"), index + 1]));

type RemoteFridayKhutbah = Partial<FridayKhutbah> & {
  publishedAt?: string;
};

function getApiUrl() {
  const envUrl = API_URL?.trim();
  return (envUrl && envUrl.startsWith("http") ? envUrl : DEFAULT_API_URL).replace(/\/$/, "");
}

function decodeXml(value?: string) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function parseTitleDate(title: string) {
  const normalized = title.trim().replace(/\s+/g, " ").replace(/\s+-\s+/g, " ");
  const match = /(\d{1,2})\s+([A-Za-zÇĞİÖŞÜçğıöşü]+)\s+(\d{4})\s+Cuma\s+Hutbesi/i.exec(normalized);
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = monthNumbers.get(match[2].toLocaleLowerCase("tr-TR"));
  const year = Number(match[3]);

  if (!day || !month || !year) {
    return null;
  }

  const isoDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return {
    isoDate,
    date: `${day} ${monthNames[month - 1]} ${year}`,
    monthKey: `${year}-${String(month).padStart(2, "0")}`,
    monthLabel: `${monthNames[month - 1]} ${year}`
  };
}

function parseSermonTitle(title: string) {
  const cleaned = title.trim().replace(/\s+/g, " ");
  const parts = cleaned.split(/\s+-\s+/);
  if (parts.length > 1) {
    return parts.slice(1).join(" - ").trim();
  }

  return cleaned.replace(/^\d{1,2}\s+[A-Za-zÇĞİÖŞÜçğıöşü]+\s+\d{4}\s+Cuma\s+Hutbesi\s*/i, "").trim() || cleaned;
}

async function fetchDirectYoutubeFeedSermons(): Promise<FridayKhutbah[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(DIYANET_DIGITAL_FEED_URL, { signal: controller.signal });
    if (!response.ok) {
      return [];
    }

    const xml = await response.text();
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]);

    return entries
      .map((entry): FridayKhutbah | null => {
        const videoId = decodeXml(/<yt:videoId>([\s\S]*?)<\/yt:videoId>/.exec(entry)?.[1]);
        const title = decodeXml(/<title>([\s\S]*?)<\/title>/.exec(entry)?.[1]);
        const url = decodeXml(/<link[^>]*href="([^"]+)"/.exec(entry)?.[1]);

        if (!videoId || !/cuma\s+hutbesi/i.test(title)) {
          return null;
        }

        const dateInfo = parseTitleDate(title);
        if (!dateInfo) {
          return null;
        }

        return {
          id: dateInfo.isoDate,
          isoDate: dateInfo.isoDate,
          date: dateInfo.date,
          monthKey: dateInfo.monthKey,
          monthLabel: dateInfo.monthLabel,
          title: parseSermonTitle(title),
          summary: `Diyanet Dijital tarafından yayımlanan ${dateInfo.date} tarihli resmi Cuma hutbesi videosu.`,
          sourceName: "Diyanet Dijital",
          sourceUrl: url || `https://www.youtube.com/watch?v=${videoId}`,
          youtubeVideoId: videoId
        };
      })
      .filter((item): item is FridayKhutbah => Boolean(item));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchDirectDiyanetHaberSermons(): Promise<FridayKhutbah[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(DIYANET_HABER_HUTBELER_URL, { signal: controller.signal });
    if (!response.ok) {
      return [];
    }

    const html = await response.text();
    const sermons: FridayKhutbah[] = [];
    const seen = new Set<string>();
    const linkPattern = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;

    for (const match of html.matchAll(linkPattern)) {
      const rawHref = decodeXml(match[1]);
      const sourceUrl = /^https?:\/\//i.test(rawHref) ? rawHref : `https://www.diyanethaber.com.tr${rawHref.startsWith("/") ? "" : "/"}${rawHref}`;
      const linkText = decodeXml(match[2].replace(/<[^>]+>/g, " "));

      if (!sourceUrl.includes("diyanethaber.com.tr") || !/cuma\s+hutbesi/i.test(linkText)) {
        continue;
      }

      const dateInfo = parseTitleDate(linkText);
      if (!dateInfo || seen.has(dateInfo.isoDate)) {
        continue;
      }

      seen.add(dateInfo.isoDate);
      sermons.push({
        id: dateInfo.isoDate,
        isoDate: dateInfo.isoDate,
        date: dateInfo.date,
        monthKey: dateInfo.monthKey,
        monthLabel: dateInfo.monthLabel,
        title: parseSermonTitle(linkText),
        summary: `Diyanet Haber tarafından yayımlanan ${dateInfo.date} tarihli resmi Cuma hutbesi metni.`,
        sourceName: "Diyanet Haber",
        sourceUrl
      });
    }

    return sermons;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeSermon(item: RemoteFridayKhutbah): FridayKhutbah | null {
  const sourceUrl = item.sourceUrl || (item.youtubeVideoId ? `https://www.youtube.com/watch?v=${item.youtubeVideoId}` : "");

  if (!item.isoDate || !item.title || !sourceUrl) {
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
    sourceUrl,
    youtubeVideoId: item.youtubeVideoId
  };
}

async function fetchBackendFridaySermons(): Promise<FridayKhutbah[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getApiUrl()}/friday-sermons/config`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal
    });

    if (!response.ok) {
      return [];
    }

    const body = (await response.json()) as { sermons?: RemoteFridayKhutbah[] };
    if (!Array.isArray(body.sermons)) {
      return [];
    }

    return body.sermons.map(normalizeSermon).filter(Boolean) as FridayKhutbah[];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchRemoteFridaySermons() {
  const [backendSermons, youtubeSermons, haberSermons] = await Promise.all([
    fetchBackendFridaySermons(),
    fetchDirectYoutubeFeedSermons(),
    fetchDirectDiyanetHaberSermons()
  ]);

  const byDate = new Map<string, FridayKhutbah>();
  for (const item of [...haberSermons, ...youtubeSermons, ...backendSermons]) {
    if (!item || !item.isoDate) {
      continue;
    }
    const existing = byDate.get(item.isoDate);
    if (!existing) {
      byDate.set(item.isoDate, item);
      continue;
    }
    byDate.set(item.isoDate, {
      ...existing,
      ...item,
      title: item.title !== "Cuma Hutbesi" ? item.title : existing.title,
      youtubeVideoId: item.youtubeVideoId || existing.youtubeVideoId
    });
  }

  const merged = [...byDate.values()].sort((a, b) => b.isoDate.localeCompare(a.isoDate));
  return merged.length > 0 ? merged : null;
}
