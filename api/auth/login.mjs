import bcrypt from "bcryptjs";

const SUPABASE_URL = "https://hzyuudjhtrdwbxqcdfgh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6eXV1ZGpodHJkd2J4cWNkZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjIwMjQsImV4cCI6MjA5Mzc5ODAyNH0._oIGOy-yShoflMxB1RkEEezV35DfgWhGbQzwdfreCZA";

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey");
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  if (req.body) return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function supabaseFetch(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!response.ok) {
    const message = data?.message || data?.details || data?.hint || text || "Supabase request failed";
    throw new Error(message);
  }
  return data;
}

function randToken() {
  return Math.random().toString(36).slice(2, 34);
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { success: true });
  if (req.method !== "POST") return json(res, 405, { success: false, message: "Method not allowed" });

  try {
    const { email, password } = await readBody(req);
    if (!email || !password) {
      return json(res, 400, { success: false, message: "Email and password required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const users = await supabaseFetch(`/users?select=id,password,email_verified&email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`);
    const user = Array.isArray(users) ? users[0] : null;

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return json(res, 401, { success: false, message: "Invalid email or password" });
    }

    const token = randToken();
    await supabaseFetch("/tokens", {
      method: "POST",
      body: JSON.stringify({ token, user_id: user.id }),
    });

    return json(res, 200, {
      success: true,
      userId: user.id,
      token,
      emailVerified: Boolean(user.email_verified),
    });
  } catch (error) {
    return json(res, 500, { success: false, message: error.message || "Login failed" });
  }
}
