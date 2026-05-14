const DEFAULT_MESSAGES = [];
const MAX_MESSAGES = 80;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function json(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type,x-admin-token");
  response.end(JSON.stringify(body));
}

function html(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.end(body);
}

function handleCors(request, response) {
  if (request.method !== "OPTIONS") {
    return false;
  }

  json(response, 204, {});
  return true;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

function readBody(request, maxBytes = 20000) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > maxBytes) {
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

function isAdminRequest(request) {
  const expectedToken = process.env.REWARDS_ADMIN_TOKEN?.trim();
  const providedToken = request.headers["x-admin-token"] || request.query?.token;

  return Boolean(expectedToken && providedToken && String(providedToken) === expectedToken);
}

function normalizeText(value, maxLength) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizeUrl(value) {
  const url = normalizeText(value, 700);
  return /^https?:\/\/\S+$/i.test(url) ? url : "";
}

function normalizeAspectRatio(value) {
  const ratio = Number(value);
  if (!Number.isFinite(ratio) || ratio <= 0) {
    return 9 / 16;
  }

  return Math.max(0.56, Math.min(1.8, ratio));
}

function createId(value, index) {
  const source = normalizeText(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return source || `friday-${index + 1}`;
}

function normalizeMessage(item, index) {
  const message = normalizeText(item?.message, 260);
  const imageUrl = normalizeUrl(item?.imageUrl);

  if (!message || !imageUrl) {
    return null;
  }

  return {
    id: createId(item?.id || message, index),
    category: normalizeText(item?.category, 40) || "Cuma Mesajları",
    message,
    background: normalizeText(item?.background, 16) || "#075E47",
    accent: normalizeText(item?.accent, 16) || "#D7B35A",
    imageUrl,
    aspectRatio: normalizeAspectRatio(item?.aspectRatio)
  };
}

function normalizeMessages(value) {
  const source = Array.isArray(value) ? value : DEFAULT_MESSAGES;
  return source.map(normalizeMessage).filter(Boolean).slice(0, MAX_MESSAGES);
}

async function getFridayMessagesConfig() {
  const stored = await redisCommand("GET", "huzur:friday:messages");
  const parsed = stored ? JSON.parse(stored) : {};
  const messages = normalizeMessages(parsed.messages);

  return {
    ok: true,
    messages,
    updatedAt: parsed.updatedAt || null
  };
}

async function setFridayMessagesConfig(payload) {
  const messages = normalizeMessages(payload.messages);
  const config = {
    messages,
    updatedAt: new Date().toISOString()
  };

  await redisCommand("SET", "huzur:friday:messages", JSON.stringify(config));
  return { ok: true, statusCode: 200, ...config };
}

function decodeDataUrl(dataUrl) {
  const match = /^data:(image\/(?:png|jpeg|jpg|webp));base64,([a-z0-9+/=]+)$/i.exec(String(dataUrl || ""));

  if (!match) {
    return null;
  }

  const mimeType = match[1] === "image/jpg" ? "image/jpeg" : match[1];
  const bytes = Buffer.from(match[2], "base64");

  if (!bytes.length || bytes.length > MAX_UPLOAD_BYTES) {
    return null;
  }

  return { mimeType, bytes };
}

async function uploadFridayImage(payload) {
  const decoded = decodeDataUrl(payload.imageData);
  if (!decoded) {
    return { ok: false, statusCode: 400, error: "Image must be PNG, JPG or WEBP and under 8 MB." };
  }

  const { put } = require("@vercel/blob");
  const extension = decoded.mimeType === "image/png" ? "png" : decoded.mimeType === "image/webp" ? "webp" : "jpg";
  const safeName = createId(payload.fileName || "cuma-mesaji", Date.now());
  const blob = await put(`friday-messages/${Date.now()}-${safeName}.${extension}`, decoded.bytes, {
    access: "public",
    contentType: decoded.mimeType
  });

  return {
    ok: true,
    statusCode: 200,
    url: blob.url
  };
}

module.exports = {
  escapeHtml,
  getFridayMessagesConfig,
  handleCors,
  html,
  isAdminRequest,
  json,
  readBody,
  setFridayMessagesConfig,
  uploadFridayImage
};
