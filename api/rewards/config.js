const { getRewardConfig, handleCors, isAdminRequest, json, readBody, setRewardConfig } = require("../_lib/rewardsStore");

module.exports = async function handler(request, response) {
  if (handleCors(request, response)) {
    return;
  }

  try {
    if (request.method === "GET") {
      const config = await getRewardConfig();
      json(response, 200, config);
      return;
    }

    if (request.method === "POST") {
      if (!isAdminRequest(request)) {
        json(response, 401, { ok: false, error: "Admin token is required." });
        return;
      }

      const payload = await readBody(request);
      const config = await setRewardConfig(payload);
      json(response, config.statusCode, config);
      return;
    }

    json(response, 405, { ok: false, error: "Method not allowed." });
  } catch (error) {
    json(response, 500, { ok: false, error: "Reward config could not be loaded.", detail: error instanceof Error ? error.message : "Unknown error" });
  }
};
