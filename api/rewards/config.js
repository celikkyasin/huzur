const { getLeaderboard, getRewardConfig, getRewardEligibility, handleCors, isAdminRequest, json, readBody, setRewardConfig } = require("../_lib/rewardsStore");

module.exports = async function handler(request, response) {
  if (handleCors(request, response)) {
    return;
  }

  try {
    if (request.method === "GET") {
      if (request.query?.route === "leaderboard") {
        const leaderboard = await getLeaderboard(request.query?.period, request.query?.limit);
        json(response, 200, leaderboard);
        return;
      }

      const config = await getRewardConfig();
      const userCode = request.query?.userCode;

      if (userCode) {
        const eligibility = await getRewardEligibility(userCode);
        json(response, 200, { ...config, eligibility });
        return;
      }

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
