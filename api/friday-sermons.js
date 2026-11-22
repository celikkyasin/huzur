const { getFridaySermonsConfig, handleCors, json, setFridaySermonsConfig, syncLatestDiyanetSermons } = require("./_lib/fridaySermonsStore");

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 50000) {
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

function getRoute(request) {
  const route = String(request.query?.route || "").replace(/^\/+|\/+$/g, "");
  if (route) {
    return route;
  }

  return "config";
}

function shouldAutoSync(config) {
  if (!Array.isArray(config?.sermons) || config.sermons.length === 0) {
    return true;
  }

  if (!config?.lastSyncAt) {
    return true;
  }

  const lastSyncMs = new Date(config.lastSyncAt).getTime();
  if (!Number.isFinite(lastSyncMs)) {
    return true;
  }

  const hoursSinceSync = (Date.now() - lastSyncMs) / (1000 * 60 * 60);
  return hoursSinceSync >= 6;
}

module.exports = async function handler(request, response) {
  if (handleCors(request, response)) {
    return;
  }

  try {
    const route = getRoute(request);

    if (route === "config") {
      if (request.method !== "GET") {
        json(response, 405, { ok: false, error: "Method not allowed." });
        return;
      }

      let config = await getFridaySermonsConfig();
      if (shouldAutoSync(config)) {
        try {
          config = await syncLatestDiyanetSermons();
        } catch {
          // Return cached config if live sync fails
        }
      }

      json(response, 200, config);
      return;
    }

    if (route === "sync") {
      if (request.method !== "GET" && request.method !== "POST") {
        json(response, 405, { ok: false, error: "Method not allowed." });
        return;
      }

      const result = await syncLatestDiyanetSermons();
      json(response, 200, result);
      return;
    }

    if (route === "save") {
      if (request.method !== "POST") {
        json(response, 405, { ok: false, error: "Method not allowed." });
        return;
      }

      const adminToken = process.env.REWARDS_ADMIN_TOKEN?.trim();
      const providedToken = request.headers["x-admin-token"] || request.query?.token;
      if (!adminToken || !providedToken || String(providedToken) !== adminToken) {
        json(response, 401, { ok: false, error: "Admin token şifresi geçersiz veya eksik." });
        return;
      }

      const body = await readBody(request);
      if (!body.title) {
        json(response, 400, { ok: false, error: "Hutbe başlığı gereklidir." });
        return;
      }

      let youtubeVideoId = body.youtubeVideoId || "";
      if (youtubeVideoId.includes("youtube.com") || youtubeVideoId.includes("youtu.be")) {
        const match = /(?:watch\?v=|embed\/|youtu\.be\/)([a-zA-Z0-9_-]{6,})/i.exec(youtubeVideoId);
        if (match) {
          youtubeVideoId = match[1];
        }
      }

      const sermonItem = {
        title: String(body.title).trim(),
        date: body.date || new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
        isoDate: body.isoDate || new Date().toISOString().slice(0, 10),
        youtubeVideoId: youtubeVideoId.trim(),
        sourceUrl: body.sourceUrl || (youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : "https://www.diyanethaber.com.tr/hutbeler"),
        summary: body.summary || ""
      };

      const result = await setFridaySermonsConfig([sermonItem]);
      json(response, 200, { ok: true, message: "Hutbe başarıyla kaydedildi.", sermon: sermonItem, result });
      return;
    }

    json(response, 404, { ok: false, error: "Route not found." });
  } catch (error) {
    json(response, 500, {
      ok: false,
      error: "Friday sermons request failed.",
      detail: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
