function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { success: true });
  if (req.method !== "POST") return json(res, 405, { success: false, message: "Method not allowed" });
  return json(res, 200, { success: true, message: "If that email exists, a reset link has been sent." });
}
