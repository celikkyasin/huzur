const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
function json(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
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
    throw new Error(`Redis command failed with ${response.status}.`);
  }

  const body = await response.json();
  return body.result;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > 20000) {
        reject(new Error("Request body is too large."));
      }
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });

    request.on("error", reject);
  });
}

function normalizeCode(value) {
  if (typeof value !== "string") {
    return null;
  }

  const code = value.trim().toUpperCase();
  return /^[A-Z0-9-]{4,24}$/.test(code) ? code : null;
}

function normalizePoints(value) {
  const points = Number(value);

  if (!Number.isFinite(points)) {
    return 0;
  }

  return Math.max(0, Math.min(10000000, Math.floor(points)));
}

function normalizeKey(value, fallback) {
  return typeof value === "string" && /^[0-9]{4}-(W[0-9]{2}|[0-9]{2})$/.test(value) ? value : fallback;
}

function getIstanbulDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const get = (type) => Number(parts.find((part) => part.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

function getWeekKey() {
  const { year, month, day } = getIstanbulDate();
  const date = new Date(Date.UTC(year, month - 1, day));
  const start = new Date(Date.UTC(year, 0, 1));
  const dayOffset = Math.floor((date.getTime() - start.getTime()) / 86400000);
  const week = Math.ceil((dayOffset + start.getUTCDay() + 1) / 7);
  return `${year}-W${week.toString().padStart(2, "0")}`;
}

function getMonthKey() {
  const { year, month } = getIstanbulDate();
  return `${year}-${month.toString().padStart(2, "0")}`;
}

function getLeaderboardKey(period) {
  if (period === "monthly") {
    return `huzur:leaderboard:month:${getMonthKey()}`;
  }

  if (period === "all") {
    return "huzur:leaderboard:all";
  }

  return `huzur:leaderboard:week:${getWeekKey()}`;
}

function normalizePeriod(value) {
  return value === "monthly" || value === "all" ? value : "weekly";
}

function normalizeLimit(value) {
  const limit = Number(value);

  if (!Number.isFinite(limit)) {
    return DEFAULT_LIMIT;
  }

  return Math.max(1, Math.min(MAX_LIMIT, Math.floor(limit)));
}

function mapLeaderboardResult(result) {
  if (!Array.isArray(result)) {
    return [];
  }

  const items = [];

  for (let index = 0; index < result.length; index += 2) {
    items.push({
      code: result[index],
      points: normalizePoints(result[index + 1]),
      rank: items.length + 1
    });
  }

  return items;
}

async function syncRewardScore(payload) {
  const code = normalizeCode(payload.userCode);

  if (!code) {
    return { ok: false, statusCode: 400, error: "Invalid user code." };
  }

  const currentWeekKey = getWeekKey();
  const currentMonthKey = getMonthKey();
  const totalPoints = normalizePoints(payload.totalPoints);
  const weeklyPoints = normalizePoints(payload.weeklyPoints);
  const monthlyPoints = normalizePoints(payload.monthlyPoints);
  const weekKey = normalizeKey(payload.weekKey, currentWeekKey);
  const monthKey = normalizeKey(payload.monthKey, currentMonthKey);

  await redisCommand("ZADD", "huzur:leaderboard:all", totalPoints, code);
  await redisCommand("ZADD", `huzur:leaderboard:week:${weekKey}`, weeklyPoints, code);
  await redisCommand("ZADD", `huzur:leaderboard:month:${monthKey}`, monthlyPoints, code);

  return { ok: true, statusCode: 200, syncedAt: new Date().toISOString() };
}

async function getLeaderboard(period, limit) {
  const normalizedPeriod = normalizePeriod(period);
  const normalizedLimit = normalizeLimit(limit);
  const key = getLeaderboardKey(normalizedPeriod);
  const result = await redisCommand("ZREVRANGE", key, 0, normalizedLimit - 1, "WITHSCORES");

  return {
    ok: true,
    period: normalizedPeriod,
    items: mapLeaderboardResult(result)
  };
}

module.exports = {
  getLeaderboard,
  handleCors,
  json,
  readBody,
  syncRewardScore
};
