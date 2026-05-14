const { handleCors, isAdminRequest, json, readBody, uploadFridayImage } = require("../_lib/fridayMessagesStore");

module.exports = async function handler(request, response) {
  if (handleCors(request, response)) {
    return;
  }

  if (request.method !== "POST") {
    json(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  if (!isAdminRequest(request)) {
    json(response, 401, { ok: false, error: "Admin token is required." });
    return;
  }

  try {
    const payload = await readBody(request, 12000000);
    const result = await uploadFridayImage(payload);
    json(response, result.statusCode, result);
  } catch (error) {
    json(response, 500, { ok: false, error: "Image could not be uploaded.", detail: error instanceof Error ? error.message : "Unknown error" });
  }
};
