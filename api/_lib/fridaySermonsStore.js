const SERMONS_KEY = "huzur:friday:sermons";
const DIJANET_DIGITAL_CHANNEL_ID = "UCE7X5yJpLm4k_L-V_WH7yWA";
const DIJANET_DIGITAL_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${DIJANET_DIGITAL_CHANNEL_ID}`;
const DIJANET_DIGITAL_VIDEOS_URL = "https://www.youtube.com/@DiyanetDijital/videos";
const DIYANET_HABER_HUTBELER_URL = "https://www.diyanethaber.com.tr/hutbeler";
const DIYANET_HABER_ORIGIN = "https://www.diyanethaber.com.tr";
const DIYANET_TV_ARCHIVE_URL = "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/bolumler";
const DIYANET_TV_ORIGIN = "https://www.diyanet.tv";
const MAX_SERMONS = 120;

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

function json(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type,x-admin-token");
  response.end(JSON.stringify(body));
}

function handleCors(request, response) {
  if (request.method !== "OPTIONS") {
    return false;
  }

  json(response, 204, {});
  return true;
}

function getRedisConfig() {
  const url = (
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.UPSTASH_REDIS_REST_KV_REST_API_URL ||
    process.env.STORAGE_URL ||
    process.env.STORAGE_KV_REST_API_URL
  )
    ?.trim()
    .replace(/\/$/, "");
  const token = (
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN ||
    process.env.STORAGE_TOKEN ||
    process.env.STORAGE_KV_REST_API_TOKEN
  )?.trim();

  if (!url || !token) {
    return null;
  }

  return { url, token };
}

async function redisCommand(...command) {
  const config = getRedisConfig();

  if (!config) {
    throw new Error("Redis environment variables are missing.");
  }

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Redis command failed with ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const body = await response.json();
  if (body.error) {
    throw new Error(`Redis command failed: ${String(body.error).slice(0, 200)}`);
  }

  return body.result;
}

function isSyncRequest(request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const adminToken = process.env.REWARDS_ADMIN_TOKEN?.trim();
  const authHeader = request.headers.authorization || request.headers.Authorization;
  const providedAdminToken = request.headers["x-admin-token"] || request.query?.token;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  return Boolean(adminToken && providedAdminToken && String(providedAdminToken) === adminToken);
}

function decodeXml(value) {
  return String(value || "")
    .replace(/\\u0026/g, "&")
    .replace(/\\u003d/g, "=")
    .replace(/\\u002f/g, "/")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function isTrustedDiyanetPage(value) {
  const source = String(value || "");
  return source.includes(`youtube.com/channel/${DIJANET_DIGITAL_CHANNEL_ID}`) && source.includes("Diyanet Dijital");
}

function normalizeTitle(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function slugify(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseTitleDate(title) {
  const normalized = normalizeTitle(title).replace(/\s+-\s+/g, " ");
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

function parseSermonTitle(title) {
  const cleaned = normalizeTitle(title);
  const parts = cleaned.split(/\s+-\s+/);
  if (parts.length > 1) {
    return normalizeTitle(parts.slice(1).join(" - "));
  }

  return cleaned.replace(/^\d{1,2}\s+[A-Za-zÇĞİÖŞÜçğıöşü]+\s+\d{4}\s+Cuma\s+Hutbesi\s*/i, "").trim() || cleaned;
}

function stripHtml(value) {
  return decodeXml(
    String(value || "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

function toAbsoluteDiyanetHaberUrl(value) {
  const url = decodeXml(value);
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${DIYANET_HABER_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function toAbsoluteDiyanetTvUrl(value) {
  const url = decodeXml(value);
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${DIYANET_TV_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function parseYoutubeVideoId(html) {
  return (
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/i.exec(String(html || ""))?.[1] ||
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,})/i.exec(String(html || ""))?.[1] ||
    /youtu\.be\/([a-zA-Z0-9_-]{6,})/i.exec(String(html || ""))?.[1] ||
    ""
  );
}

function parseDiyanetHaberSubject(html) {
  const text = stripHtml(html);
  const quotedSubject = /"([^"]{4,120})"\s+konulu\s+Cuma hutbesi/i.exec(text)?.[1];
  if (quotedSubject) {
    return normalizeTitle(quotedSubject);
  }

  const headings = [...text.matchAll(/\b([A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜ\s,;:'-]{6,90})\b/g)].map((match) => normalizeTitle(match[1]));
  return headings.find((heading) => !/HUTBELER|CUMA HUTBESİ|DİYANET|MÜSLÜMANLAR/.test(heading)) || "";
}

function parseDiyanetHaberList(html) {
  const sermons = [];
  const seen = new Set();
  const linkPattern = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of String(html || "").matchAll(linkPattern)) {
    const sourceUrl = toAbsoluteDiyanetHaberUrl(match[1]);
    const linkText = stripHtml(match[2]);

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
      title: "Cuma Hutbesi",
      summary: "Diyanet Haber tarafından yayımlanan resmi Cuma hutbesi metni.",
      sourceName: "Diyanet Haber",
      sourceUrl,
      youtubeVideoId: "",
      publishedAt: null
    });
  }

  return sermons.sort((a, b) => b.isoDate.localeCompare(a.isoDate));
}

function parseDiyanetTvArchiveLinks(html) {
  const links = [];
  const seen = new Set();
  const linkPattern = /<a\b[^>]*href="([^"]+)"[^>]*(?:alt|title)="([^"]*?Cuma Hutbesi[^"]*?)"[^>]*>/gi;

  for (const match of String(html || "").matchAll(linkPattern)) {
    const sourceUrl = toAbsoluteDiyanetTvUrl(match[1]);
    const title = decodeXml(match[2]);

    if (!sourceUrl.includes("diyanet.tv") || !/cuma\s+hutbesi/i.test(title) || /işaret dili/i.test(title)) {
      continue;
    }

    const dateInfo = parseTitleDate(title);
    if (!dateInfo || seen.has(dateInfo.isoDate)) {
      continue;
    }

    seen.add(dateInfo.isoDate);
    links.push({ sourceUrl, title, dateInfo });
  }

  return links.sort((a, b) => b.dateInfo.isoDate.localeCompare(a.dateInfo.isoDate));
}

function buildDiyanetTvSermon(link, detailHtml) {
  const videoId = parseYoutubeVideoId(detailHtml);
  if (!videoId) {
    return null;
  }

  return {
    id: link.dateInfo.isoDate,
    isoDate: link.dateInfo.isoDate,
    date: link.dateInfo.date,
    monthKey: link.dateInfo.monthKey,
    monthLabel: link.dateInfo.monthLabel,
    title: parseSermonTitle(link.title),
    summary: "Diyanet TV arşivinde yer alan resmi Cuma hutbesi videosu.",
    sourceName: "Diyanet TV",
    sourceUrl: link.sourceUrl,
    youtubeVideoId: videoId,
    publishedAt: null
  };
}

function parseFeedEntries(xml) {
  return [...String(xml || "").matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((match) => match[1]);
}

function parseFeedSermons(xml) {
  const channelId = decodeXml(/<yt:channelId>([\s\S]*?)<\/yt:channelId>/.exec(xml)?.[1]);
  const authorName = decodeXml(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/.exec(xml)?.[1]);

  if (authorName !== "Diyanet Dijital" && channelId !== DIJANET_DIGITAL_CHANNEL_ID && !isTrustedDiyanetPage(xml)) {
    throw new Error("Feed source is not Diyanet Dijital.");
  }

  return parseFeedEntries(xml)
    .map((entry) => {
      const videoId = decodeXml(/<yt:videoId>([\s\S]*?)<\/yt:videoId>/.exec(entry)?.[1]);
      const title = decodeXml(/<title>([\s\S]*?)<\/title>/.exec(entry)?.[1]);
      const publishedAt = decodeXml(/<published>([\s\S]*?)<\/published>/.exec(entry)?.[1]);
      const url = decodeXml(/<link[^>]*href="([^"]+)"/.exec(entry)?.[1]);

      if (!videoId || !/cuma\s+hutbesi/i.test(title)) {
        return null;
      }

      const dateInfo = parseTitleDate(title);
      if (!dateInfo) {
        return null;
      }

      const sermonTitle = parseSermonTitle(title);

      return {
        id: dateInfo.isoDate,
        isoDate: dateInfo.isoDate,
        date: dateInfo.date,
        monthKey: dateInfo.monthKey,
        monthLabel: dateInfo.monthLabel,
        title: sermonTitle,
        summary: "Diyanet Dijital tarafından yayımlanan resmi Cuma hutbesi videosu.",
        sourceName: "Diyanet Dijital",
        sourceUrl: url || `https://www.youtube.com/watch?v=${videoId}`,
        youtubeVideoId: videoId,
        publishedAt
      };
    })
    .filter(Boolean);
}

function buildSermonFromVideo(title, videoId) {
  const cleanTitle = decodeXml(title);
  const cleanVideoId = decodeXml(videoId);

  if (!cleanVideoId || !/cuma\s+hutbesi/i.test(cleanTitle)) {
    return null;
  }

  const dateInfo = parseTitleDate(cleanTitle);
  if (!dateInfo) {
    return null;
  }

  return {
    id: dateInfo.isoDate,
    isoDate: dateInfo.isoDate,
    date: dateInfo.date,
    monthKey: dateInfo.monthKey,
    monthLabel: dateInfo.monthLabel,
    title: parseSermonTitle(cleanTitle),
    summary: "Diyanet Dijital tarafından yayımlanan resmi Cuma hutbesi videosu.",
    sourceName: "Diyanet Dijital",
    sourceUrl: `https://www.youtube.com/watch?v=${cleanVideoId}`,
    youtubeVideoId: cleanVideoId,
    publishedAt: null
  };
}

function parseVideosPageSermons(html) {
  if (!isTrustedDiyanetPage(html)) {
    throw new Error("Videos page source is not Diyanet Dijital.");
  }

  const sermons = [];
  const seen = new Set();
  const titleThenIdPattern = /"title":\{"content":"([^"]*?Cuma Hutbesi[^"]*?)"\}[\s\S]{0,10000}?"contentId":"([a-zA-Z0-9_-]{6,})"/gi;
  const idThenTitlePattern = /"contentId":"([a-zA-Z0-9_-]{6,})"[\s\S]{0,10000}?"title":\{"content":"([^"]*?Cuma Hutbesi[^"]*?)"\}/gi;

  for (const match of html.matchAll(titleThenIdPattern)) {
    const sermon = buildSermonFromVideo(match[1], match[2]);
    if (sermon && !seen.has(sermon.isoDate)) {
      seen.add(sermon.isoDate);
      sermons.push(sermon);
    }
  }

  for (const match of html.matchAll(idThenTitlePattern)) {
    const sermon = buildSermonFromVideo(match[2], match[1]);
    if (sermon && !seen.has(sermon.isoDate)) {
      seen.add(sermon.isoDate);
      sermons.push(sermon);
    }
  }

  return sermons.sort((a, b) => b.isoDate.localeCompare(a.isoDate));
}

function normalizeSermon(item) {
  const dateInfo = parseTitleDate(`${item?.date || ""} Cuma Hutbesi`);
  const isoDate = String(item?.isoDate || dateInfo?.isoDate || "").trim();
  const title = normalizeTitle(item?.title);
  const youtubeVideoId = String(item?.youtubeVideoId || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate) || !title || !youtubeVideoId) {
    return null;
  }

  const [year, month, day] = isoDate.split("-").map(Number);
  const monthName = monthNames[month - 1] || "";
  const sourceName = normalizeTitle(item?.sourceName) || "Diyanet Dijital";

  if (!["Diyanet Dijital", "Diyanet Haber", "Diyanet TV"].includes(sourceName)) {
    return null;
  }

  return {
    id: String(item?.id || isoDate).trim() || isoDate,
    isoDate,
    date: normalizeTitle(item?.date) || `${day} ${monthName} ${year}`,
    monthKey: String(item?.monthKey || `${year}-${String(month).padStart(2, "0")}`).trim(),
    monthLabel: normalizeTitle(item?.monthLabel) || `${monthName} ${year}`,
    title,
    summary: normalizeTitle(item?.summary) || "Diyanet Dijital tarafından yayımlanan resmi Cuma hutbesi videosu.",
    sourceName,
    sourceUrl: String(item?.sourceUrl || `https://www.youtube.com/watch?v=${youtubeVideoId}`).trim(),
    youtubeVideoId,
    publishedAt: item?.publishedAt || null
  };
}

function mergeSermons(existing, incoming) {
  const byId = new Map();

  for (const sermon of [...existing, ...incoming]) {
    const normalized = normalizeSermon(sermon);
    if (!normalized) {
      continue;
    }

    const key = normalized.isoDate || normalized.id || slugify(normalized.title);
    byId.set(key, { ...(byId.get(key) || {}), ...normalized });
  }

  return [...byId.values()].sort((a, b) => b.isoDate.localeCompare(a.isoDate)).slice(0, MAX_SERMONS);
}

async function getFridaySermonsConfig() {
  const stored = await redisCommand("GET", SERMONS_KEY);
  const parsed = stored ? JSON.parse(stored) : {};

  return {
    ok: true,
    sermons: mergeSermons([], Array.isArray(parsed.sermons) ? parsed.sermons : []),
    updatedAt: parsed.updatedAt || null,
    lastSyncAt: parsed.lastSyncAt || null
  };
}

async function setFridaySermonsConfig(sermons, meta = {}) {
  const current = await getFridaySermonsConfig();
  const merged = mergeSermons(current.sermons, sermons);
  const config = {
    sermons: merged,
    updatedAt: new Date().toISOString(),
    lastSyncAt: meta.lastSyncAt || current.lastSyncAt || null
  };

  await redisCommand("SET", SERMONS_KEY, JSON.stringify(config));
  return { ok: true, statusCode: 200, ...config };
}

async function syncLatestDiyanetSermons() {
  const headers = {
    "User-Agent": "HuzurApp/1.0 (+https://huzur.app)"
  };
  const pageResponse = await fetch(DIJANET_DIGITAL_VIDEOS_URL, { headers });
  const feedResponse = await fetch(DIJANET_DIGITAL_FEED_URL, { headers });
  const haberResponse = await fetch(DIYANET_HABER_HUTBELER_URL, { headers });
  const tvResponse = await fetch(DIYANET_TV_ARCHIVE_URL, { headers });
  const fetchedSermons = [];
  const errors = [];

  if (pageResponse.ok) {
    try {
      fetchedSermons.push(...parseVideosPageSermons(await pageResponse.text()));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Videos page parse failed.");
    }
  } else {
    errors.push(`Diyanet Dijital videos page failed with ${pageResponse.status}`);
  }

  if (feedResponse.ok) {
    try {
      fetchedSermons.push(...parseFeedSermons(await feedResponse.text()));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Feed parse failed.");
    }
  } else {
    errors.push(`Diyanet Dijital feed failed with ${feedResponse.status}`);
  }

  if (haberResponse.ok) {
    try {
      const haberSermons = parseDiyanetHaberList(await haberResponse.text()).slice(0, 10);
      for (const sermon of haberSermons) {
        try {
          const detailResponse = await fetch(sermon.sourceUrl, { headers });
          if (detailResponse.ok) {
            const subject = parseDiyanetHaberSubject(await detailResponse.text());
            if (subject && !/cuma hutbesi/i.test(subject)) {
              sermon.title = subject;
              sermon.summary = `Diyanet Haber tarafından yayımlanan ${sermon.date} tarihli resmi Cuma hutbesi metni.`;
            }
          }
        } catch {
          // Keep the list item when the detail page cannot be read.
        }
      }
      fetchedSermons.push(...haberSermons);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Diyanet Haber hutbeler parse failed.");
    }
  } else {
    errors.push(`Diyanet Haber hutbeler page failed with ${haberResponse.status}`);
  }

  if (tvResponse.ok) {
    try {
      const tvLinks = parseDiyanetTvArchiveLinks(await tvResponse.text()).slice(0, 12);
      for (const link of tvLinks) {
        try {
          const detailResponse = await fetch(link.sourceUrl, { headers });
          if (!detailResponse.ok) {
            errors.push(`Diyanet TV detail failed with ${detailResponse.status}: ${link.sourceUrl}`);
            continue;
          }

          const sermon = buildDiyanetTvSermon(link, await detailResponse.text());
          if (sermon) {
            fetchedSermons.push(sermon);
          }
        } catch (error) {
          errors.push(error instanceof Error ? error.message : "Diyanet TV detail parse failed.");
        }
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Diyanet TV archive parse failed.");
    }
  } else {
    errors.push(`Diyanet TV archive failed with ${tvResponse.status}`);
  }

  if (!fetchedSermons.length) {
    throw new Error(`No Diyanet Friday sermon videos found. ${errors.join(" ")}`.trim());
  }

  const sermons = mergeSermons([], fetchedSermons);
  const result = await setFridaySermonsConfig(sermons, { lastSyncAt: new Date().toISOString() });

  return {
    ...result,
    syncedCount: sermons.length,
    latestSynced: sermons[0] || null,
    warnings: errors
  };
}

module.exports = {
  getFridaySermonsConfig,
  handleCors,
  isSyncRequest,
  json,
  setFridaySermonsConfig,
  syncLatestDiyanetSermons
};
