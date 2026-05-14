const MAX_IMAGES = 99;
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
  if (typeof value !== "string" && typeof value !== "number") {
    return "";
  }

  return String(value).trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizeUrl(value) {
  const url = normalizeText(value, 900);
  return /^https?:\/\/\S+$/i.test(url) ? url : "";
}

function normalizeAspectRatio(value) {
  const ratio = Number(value);
  if (!Number.isFinite(ratio) || ratio <= 0) {
    return 9 / 16;
  }

  return Math.max(0.45, Math.min(1.2, ratio));
}

function normalizeImage(item) {
  const order = Number(item?.order);
  const imageUrl = normalizeUrl(item?.imageUrl);

  if (!Number.isInteger(order) || order < 1 || order > 99 || !imageUrl) {
    return null;
  }

  return {
    id: normalizeText(item?.id, 40) || `name-${order}`,
    order,
    transliteration: normalizeText(item?.transliteration, 80),
    imageUrl,
    aspectRatio: normalizeAspectRatio(item?.aspectRatio)
  };
}

function normalizeImages(value) {
  const source = Array.isArray(value) ? value : [];
  const byOrder = new Map();

  for (const item of source) {
    const image = normalizeImage(item);
    if (image) {
      byOrder.set(image.order, image);
    }
  }

  return [...byOrder.values()].sort((a, b) => a.order - b.order).slice(0, MAX_IMAGES);
}

function mergeImages(existingImages, incomingImages) {
  return normalizeImages([...existingImages, ...incomingImages]);
}

async function getNamesOfAllahConfig() {
  const stored = await redisCommand("GET", "huzur:names-of-allah:images");
  const parsed = stored ? JSON.parse(stored) : {};
  const images = normalizeImages(parsed.images);

  return {
    ok: true,
    images,
    updatedAt: parsed.updatedAt || null
  };
}

async function setNamesOfAllahConfig(payload) {
  const incomingImages = normalizeImages(payload.images);
  const currentConfig = await getNamesOfAllahConfig();
  const replaceAll = payload.mode === "replace";
  const images = replaceAll ? incomingImages : mergeImages(currentConfig.images, incomingImages);
  const config = {
    images,
    updatedAt: new Date().toISOString()
  };

  await redisCommand("SET", "huzur:names-of-allah:images", JSON.stringify(config));
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

async function uploadNameImage(payload) {
  const decoded = decodeDataUrl(payload.imageData);
  if (!decoded) {
    return { ok: false, statusCode: 400, error: "Image must be PNG, JPG or WEBP and under 8 MB." };
  }

  const order = Number(payload.order);
  if (!Number.isInteger(order) || order < 1 || order > 99) {
    return { ok: false, statusCode: 400, error: "A valid order between 1 and 99 is required." };
  }

  const { put } = require("@vercel/blob");
  const extension = decoded.mimeType === "image/png" ? "png" : decoded.mimeType === "image/webp" ? "webp" : "jpg";
  const safeName = normalizeText(payload.fileName, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const blob = await put(`names-of-allah/${String(order).padStart(2, "0")}-${Date.now()}-${safeName || "isim"}.${extension}`, decoded.bytes, {
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
  getNamesOfAllahConfig,
  handleCors,
  html,
  isAdminRequest,
  json,
  readBody,
  setNamesOfAllahConfig,
  uploadNameImage
};
