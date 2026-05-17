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

  return url && token ? { url, token } : null;
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
    throw new Error(`Redis command failed with ${response.status}`);
  }

  const body = await response.json();
  if (body.error) {
    throw new Error(String(body.error));
  }

  return body.result;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 12000) {
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

function normalizeText(value, maxLength) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function parseRequest(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function listDuaRequests() {
  const values = await redisCommand("LRANGE", "huzur:dua:requests", 0, 49);
  const requests = Array.isArray(values) ? values.map(parseRequest).filter(Boolean) : [];
  return { ok: true, requests };
}

async function createDuaRequest(payload) {
  const name = normalizeText(payload?.name, 36) || "Huzur kullanıcısı";
  const text = normalizeText(payload?.text, 500);

  if (!text) {
    return { ok: false, statusCode: 400, error: "Dua metni gerekli." };
  }

  const request = {
    id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    name,
    text,
    prayerCount: 0,
    createdAt: new Date().toISOString()
  };

  await redisCommand("LPUSH", "huzur:dua:requests", JSON.stringify(request));
  await redisCommand("LTRIM", "huzur:dua:requests", 0, 49);

  return { ok: true, request };
}

async function prayForDuaRequest(payload) {
  const id = normalizeText(payload?.id, 80);
  if (!id) {
    return { ok: false, statusCode: 400, error: "Dua talebi bulunamadı." };
  }

  const list = await listDuaRequests();
  const nextRequests = list.requests.map((request) => (request.id === id ? { ...request, prayerCount: Number(request.prayerCount || 0) + 1 } : request));
  const updated = nextRequests.find((request) => request.id === id);

  if (!updated) {
    return { ok: false, statusCode: 404, error: "Dua talebi bulunamadı." };
  }

  await redisCommand("DEL", "huzur:dua:requests");
  for (let index = nextRequests.length - 1; index >= 0; index -= 1) {
    await redisCommand("LPUSH", "huzur:dua:requests", JSON.stringify(nextRequests[index]));
  }

  return { ok: true, request: updated };
}

module.exports = {
  createDuaRequest,
  handleCors,
  json,
  listDuaRequests,
  prayForDuaRequest,
  readBody
};
