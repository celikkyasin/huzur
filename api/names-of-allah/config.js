const { getNamesOfAllahConfig, handleCors, isAdminRequest, json, readBody, setNamesOfAllahConfig } = require("../_lib/namesOfAllahStore");

module.exports = async function handler(request, response) {
  if (handleCors(request, response)) {
    return;
  }

  try {
    if (request.method === "GET") {
      const config = await getNamesOfAllahConfig();
      json(response, 200, config);
      return;
    }

    if (request.method === "POST") {
      if (!isAdminRequest(request)) {
        json(response, 401, { ok: false, error: "Admin token is required." });
        return;
      }

      const payload = await readBody(request, 120000);
      const result = await setNamesOfAllahConfig(payload);
      json(response, result.statusCode, result);
      return;
    }

    json(response, 405, { ok: false, error: "Method not allowed." });
  } catch (error) {
    json(response, 500, { ok: false, error: "Names of Allah images could not be loaded.", detail: error instanceof Error ? error.message : "Unknown error" });
  }
};
