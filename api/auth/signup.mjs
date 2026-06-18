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

function randId() {
  return Math.random().toString(36).slice(2, 11);
}

function randToken() {
  return Math.random().toString(36).slice(2, 34);
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { success: true });
  if (req.method !== "POST") return json(res, 405, { success: false, message: "Method not allowed" });

  try {
    const body = await readBody(req);
    const { name, email, password, age } = body;

    if (!name || !email || !password || !age) {
      return json(res, 400, { success: false, message: "All fields required" });
    }

    if (parseInt(age, 10) < 18) {
      return json(res, 400, { success: false, message: "Must be 18+" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await supabaseFetch(`/users?select=id&email=eq.${encodeURIComponent(normalizedEmail)}`);
    if (Array.isArray(existing) && existing.length > 0) {
      return json(res, 400, { success: false, message: "Email already registered" });
    }

    const userId = randId();
    const token = randToken();
    const hash = await bcrypt.hash(password, 10);

    await supabaseFetch("/users", {
      method: "POST",
      body: JSON.stringify({
        id: userId,
        name,
        email: normalizedEmail,
        password: hash,
        age: parseInt(age, 10),
        email_verified: true,
      }),
    });

    await supabaseFetch("/tokens", {
      method: "POST",
      body: JSON.stringify({ token, user_id: userId }),
    });

    return json(res, 200, {
      success: true,
      userId,
      token,
      emailVerified: true,
      message: "Account created!",
    });
  } catch (error) {
    return json(res, 500, { success: false, message: error.message || "Signup failed" });
  }
}
