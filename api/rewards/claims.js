const { getRewardClaims, handleCors, isAdminRequest, json } = require("../_lib/rewardsStore");

module.exports = async function handler(request, response) {
  if (handleCors(request, response)) {
    return;
  }

  if (request.method !== "GET") {
    json(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  if (!isAdminRequest(request)) {
    json(response, 401, { ok: false, error: "Admin token is required." });
    return;
  }

  try {
    const result = await getRewardClaims();
    json(response, 200, result);
  } catch (error) {
    json(response, 500, { ok: false, error: "Reward claims could not be loaded.", detail: error instanceof Error ? error.message : "Unknown error" });
  }
};
