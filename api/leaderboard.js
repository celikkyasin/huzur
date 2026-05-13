const { getLeaderboard, handleCors, json } = require("./_lib/rewardsStore");

module.exports = async function handler(request, response) {
  if (handleCors(request, response)) {
    return;
  }

  if (request.method !== "GET") {
    json(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  try {
    const period = request.query?.period;
    const limit = request.query?.limit;
    const leaderboard = await getLeaderboard(period, limit);
    json(response, 200, leaderboard);
  } catch {
    json(response, 500, { ok: false, error: "Leaderboard could not be loaded." });
  }
};
