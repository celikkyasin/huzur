const { handleCors, json, readBody, removeRewardUser } = require("../_lib/rewardsStore");

module.exports = async function handler(request, response) {
  if (handleCors(request, response)) {
    return;
  }

  if (request.method !== "POST") {
    json(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  try {
    const payload = await readBody(request);

    if (payload.confirm !== "remove-test-user") {
      json(response, 400, { ok: false, error: "Cleanup confirmation is required." });
      return;
    }

    const result = await removeRewardUser(payload.code);
    json(response, result.statusCode, result);
  } catch (error) {
    json(response, 500, { ok: false, error: "Test reward user could not be removed.", detail: error instanceof Error ? error.message : "Unknown error" });
  }
};
