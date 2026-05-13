const { handleCors, json, readBody, syncRewardScore } = require("../_lib/rewardsStore");

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
    const result = await syncRewardScore(payload);
    json(response, result.statusCode, result);
  } catch {
    json(response, 500, { ok: false, error: "Reward score could not be synced." });
  }
};
