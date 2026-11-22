const { getFridaySermonsConfig, handleCors, json, syncLatestDiyanetSermons } = require("./_lib/fridaySermonsStore");

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

    json(response, 404, { ok: false, error: "Route not found." });
  } catch (error) {
    json(response, 500, {
      ok: false,
      error: "Friday sermons request failed.",
      detail: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
