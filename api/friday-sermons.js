const { getFridaySermonsConfig, handleCors, isSyncRequest, json, syncLatestDiyanetSermons } = require("./_lib/fridaySermonsStore");

function getRoute(request) {
  const route = String(request.query?.route || "").replace(/^\/+|\/+$/g, "");
  if (route) {
    return route;
  }

  if (isSyncRequest(request)) {
    return "sync";
  }

  return "config";
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

      const config = await getFridaySermonsConfig();
      json(response, 200, config);
      return;
    }

    if (route === "sync") {
      if (request.method !== "GET" && request.method !== "POST") {
        json(response, 405, { ok: false, error: "Method not allowed." });
        return;
      }

      if (!isSyncRequest(request)) {
        json(response, 401, { ok: false, error: "Sync token is required." });
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
