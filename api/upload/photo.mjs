function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  if (req.body) return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { success: true });
  if (req.method !== "POST") return json(res, 405, { success: false, message: "Method not allowed" });

  try {
    const body = await readBody(req);
    if (!body.imageData) return json(res, 400, { success: false, message: "No image" });
    if (String(body.imageData).length > 7000000) {
      return json(res, 400, { success: false, message: "Image too large. Please upload a smaller image." });
    }
    return json(res, 200, { success: true, url: body.imageData });
  } catch (error) {
    return json(res, 500, { success: false, message: error.message || "Photo upload failed" });
  }
}
