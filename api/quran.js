const DIB_KURAN_API_BASE_URL = (process.env.DIB_KURAN_API_BASE_URL || "https://t061.diyanet.gov.tr/apigateway/acikkaynakkuran").replace(/\/$/, "");
const DIB_KURAN_API_TOKEN = process.env.DIB_KURAN_API_TOKEN;

function json(response, status, body) {
  response.status(status).setHeader("Content-Type", "application/json; charset=utf-8").send(JSON.stringify(body));
}

function handleCors(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return true;
  }

  return false;
}

function getRoute(request) {
  return String(request.query?.route || "").replace(/^\/+|\/+$/g, "");
}

async function fetchDiyanet(path) {
  if (!DIB_KURAN_API_TOKEN) {
    throw new Error("Diyanet Quran API token is not configured.");
  }

  const response = await fetch(`${DIB_KURAN_API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${DIB_KURAN_API_TOKEN}`
    }
  });

  if (!response.ok) {
    throw new Error(`Diyanet Quran API failed with ${response.status}.`);
  }

  return response.json();
}

module.exports = async function handler(request, response) {
  if (handleCors(request, response)) {
    return;
  }

  if (request.method !== "GET") {
    json(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  try {
    const route = getRoute(request);

    if (route === "chapters") {
      json(response, 200, await fetchDiyanet("/api/v1/chapters?language=tr"));
      return;
    }

    if (route === "chapter") {
      const chapter = Math.max(1, Math.min(114, Number(request.query?.chapter || 1)));
      json(response, 200, await fetchDiyanet(`/api/v1/chapters/${chapter}?language_id=1`));
      return;
    }

    if (route === "juz") {
      const juz = Math.max(1, Math.min(30, Number(request.query?.juz || 1)));
      json(response, 200, await fetchDiyanet(`/api/v1/juz/${juz}?language_id=1`));
      return;
    }

    if (route === "page") {
      const page = Math.max(1, Math.min(604, Number(request.query?.page || 1)));
      json(response, 200, await fetchDiyanet(`/api/v1/verses/page/${page}?language_id=1`));
      return;
    }

    json(response, 404, { ok: false, error: "Route not found." });
  } catch (error) {
    json(response, 500, {
      ok: false,
      error: "Quran request failed.",
      detail: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
