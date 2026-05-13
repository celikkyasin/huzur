const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DEFAULT_REWARD_CONFIG = {
  isActive: true,
  mode: "monthly",
  minimumMonthlyPoints: 500,
  prizeTitle: "Ayın Huzur Ödülü",
  prizeDescription: "Ay içinde en çok puanı toplayan kullanıcı ödül kazanır.",
  prizeImageUrl: ""
};
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
    const errorText = await response.text();
    throw new Error(`Redis command failed with ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const body = await response.json();
  if (body.error) {
    throw new Error(`Redis command failed: ${String(body.error).slice(0, 200)}`);
  }
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

function normalizeText(value, maxLength) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
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

function isAdminRequest(request) {
  const expectedToken = process.env.REWARDS_ADMIN_TOKEN?.trim();
  const providedToken = request.headers["x-admin-token"] || request.query?.token;

  return Boolean(expectedToken && providedToken && String(providedToken) === expectedToken);
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

async function getRewardConfig() {
  const stored = await redisCommand("GET", "huzur:reward:config");
  const config = stored ? JSON.parse(stored) : {};

  return {
    ok: true,
    ...DEFAULT_REWARD_CONFIG,
    ...config,
    isActive: config.isActive !== false,
    minimumMonthlyPoints: normalizePoints(config.minimumMonthlyPoints || DEFAULT_REWARD_CONFIG.minimumMonthlyPoints)
  };
}

async function setRewardConfig(payload) {
  const current = await getRewardConfig();
  const nextConfig = {
    isActive: typeof payload.isActive === "boolean" ? payload.isActive : current.isActive,
    mode: "monthly",
    minimumMonthlyPoints: normalizePoints(payload.minimumMonthlyPoints ?? current.minimumMonthlyPoints),
    prizeTitle: normalizeText(payload.prizeTitle, 80) || current.prizeTitle,
    prizeDescription: normalizeText(payload.prizeDescription, 180) || current.prizeDescription,
    prizeImageUrl: normalizeText(payload.prizeImageUrl, 500) || ""
  };

  await redisCommand("SET", "huzur:reward:config", JSON.stringify(nextConfig));
  return { ok: true, statusCode: 200, ...nextConfig };
}

async function submitRewardClaim(payload) {
  const config = await getRewardConfig();
  const code = normalizeCode(payload.userCode);
  const fullName = normalizeText(payload.fullName, 80);
  const contact = normalizeText(payload.contact, 120);
  const address = normalizeText(payload.address, 500);
  const monthKey = getMonthKey();

  if (!config.isActive) {
    return { ok: false, statusCode: 403, error: "Reward campaign is not active." };
  }

  if (!code || fullName.length < 3 || contact.length < 5 || address.length < 10) {
    return { ok: false, statusCode: 400, error: "Claim form is incomplete." };
  }

  const monthlyKey = `huzur:leaderboard:month:${monthKey}`;
  const topResult = await redisCommand("ZREVRANGE", monthlyKey, 0, 0, "WITHSCORES");
  const winnerCode = Array.isArray(topResult) ? topResult[0] : null;
  const winnerPoints = normalizePoints(Array.isArray(topResult) ? topResult[1] : 0);

  if (winnerCode !== code || winnerPoints < config.minimumMonthlyPoints) {
    return { ok: false, statusCode: 403, error: "User is not eligible for this month reward." };
  }

  const submittedAt = new Date().toISOString();
  const claim = {
    id: `${monthKey}:${code}`,
    userCode: code,
    fullName,
    contact,
    address,
    monthKey,
    points: winnerPoints,
    prizeTitle: config.prizeTitle,
    submittedAt
  };
  const claimJson = JSON.stringify(claim);

  await redisCommand("SET", `huzur:reward:claim:${monthKey}:${code}`, claimJson);
  await redisCommand("LPUSH", `huzur:reward:claims:${monthKey}`, claimJson);

  return { ok: true, statusCode: 200, claimId: claim.id };
}

async function getRewardClaims() {
  const monthKey = getMonthKey();
  const result = await redisCommand("LRANGE", `huzur:reward:claims:${monthKey}`, 0, 100);
  const claims = Array.isArray(result)
    ? result
        .map((item) => {
          try {
            return JSON.parse(item);
          } catch {
            return null;
          }
        })
        .filter(Boolean)
    : [];

  return { ok: true, monthKey, claims };
}

async function removeRewardUser(code) {
  const normalizedCode = normalizeCode(code);

  if (normalizedCode !== "HZR-TEST1") {
    return { ok: false, statusCode: 400, error: "Only the test reward user can be removed." };
  }

  const currentWeekKey = getWeekKey();
  const currentMonthKey = getMonthKey();
  const removed = await Promise.all([
    redisCommand("ZREM", "huzur:leaderboard:all", normalizedCode),
    redisCommand("ZREM", `huzur:leaderboard:week:${currentWeekKey}`, normalizedCode),
    redisCommand("ZREM", `huzur:leaderboard:month:${currentMonthKey}`, normalizedCode)
  ]);

  return {
    ok: true,
    statusCode: 200,
    removed: removed.reduce((total, value) => total + normalizePoints(value), 0)
  };
}

module.exports = {
  getRewardClaims,
  getRewardConfig,
  getLeaderboard,
  handleCors,
  isAdminRequest,
  json,
  readBody,
  removeRewardUser,
  setRewardConfig,
  submitRewardClaim,
  syncRewardScore
};
