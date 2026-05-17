const { createDuaRequest, handleCors, json, listDuaRequests, prayForDuaRequest, readBody } = require("./_lib/duaRequestsStore");

module.exports = async function handler(request, response) {
  if (handleCors(request, response)) {
    return;
  }

  try {
    const route = request.query?.route;

    if (request.method === "GET") {
      json(response, 200, await listDuaRequests());
      return;
    }

    if (request.method === "POST" && route === "pray") {
      const body = await readBody(request);
      const result = await prayForDuaRequest(body);
      json(response, result.statusCode || 200, result);
      return;
    }

    if (request.method === "POST") {
      const body = await readBody(request);
      const result = await createDuaRequest(body);
      json(response, result.statusCode || 200, result);
      return;
    }

    json(response, 405, { ok: false, error: "Method not allowed." });
  } catch (error) {
    json(response, 500, { ok: false, error: error instanceof Error ? error.message : "Unexpected error." });
  }
};
