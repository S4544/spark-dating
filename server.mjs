import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import bcrypt from "bcryptjs";
import fs from "fs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// ── Rate Limiter (no extra packages needed) ──────────────────────────────────
const rateLimitStore = new Map();

function rateLimit({ windowMs = 60000, max = 10, message = "Too many requests. Please try again later." } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const key = `${ip}:${req.path}`;
    const now = Date.now();
    let entry = rateLimitStore.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      rateLimitStore.set(key, entry);
    }
    entry.count++;
    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.status(429).json({ success: false, message, retryAfter });
      return;
    }
    next();
  };
}

// Clean up old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) rateLimitStore.delete(key);
  }
}, 5 * 60 * 1000);

// Rate limit presets
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: "Too many attempts. Please wait 15 minutes before trying again." });
const otpLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3, message: "Too many OTP requests. Please wait 1 hour before requesting again." });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, message: "Too many requests. Please slow down." });
const uploadLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: "Too many uploads. Please wait a minute." });



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { Pool } = pg;

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.PG_URL || process.env.DATABASE_PRIVATE_URL;

if (!dbUrl) {
  console.error("❌ No DATABASE_URL found!");
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl.includes("localhost") ? false : { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
  max: 10,
});


// ── Security: Helmet-like headers (no extra package needed) ──────────────────
function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(self), camera=(), microphone=()");
  res.setHeader("Content-Security-Policy", "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:;");
  next();
}

// ── Account Lockout Store ─────────────────────────────────────────────────────
const loginAttempts = new Map(); // email -> { count, lockedUntil }

function checkLockout(email) {
  const entry = loginAttempts.get(email);
  if (!entry) return { locked: false };
  if (entry.lockedUntil && Date.now() < entry.lockedUntil) {
    const mins = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
    return { locked: true, mins };
  }
  return { locked: false };
}

function recordFailedLogin(email) {
  const entry = loginAttempts.get(email) || { count: 0 };
  entry.count++;
  if (entry.count >= 5) {
    entry.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 min lockout
    entry.count = 0;
    console.log(`🔒 Account locked: ${email}`);
  }
  loginAttempts.set(email, entry);
}

function clearFailedLogin(email) {
  loginAttempts.delete(email);
}

// ── Photo Validation ──────────────────────────────────────────────────────────
function validatePhoto(base64Data) {
  // Check magic bytes for real image types
  const buffer = Buffer.from(base64Data.slice(0, 20), "base64");
  const hex = buffer.toString("hex").toUpperCase();
  
  const signatures = {
    "FFD8FF": "jpeg",      // JPEG
    "89504E47": "png",     // PNG  
    "47494638": "gif",     // GIF
    "52494646": "webp",    // WEBP (starts with RIFF)
  };

  for (const [sig, type] of Object.entries(signatures)) {
    if (hex.startsWith(sig)) return { valid: true, type };
  }
  // Check WEBP specifically
  if (hex.includes("57454250")) return { valid: true, type: "webp" };
  
  return { valid: false, type: null };
}

// ── Token Expiry (30 days) ────────────────────────────────────────────────────
async function cleanExpiredTokens() {
  try {
    await pool.query("DELETE FROM tokens WHERE created_at < NOW() - INTERVAL '30 days'");
  } catch {}
}
// Clean expired tokens every hour
setInterval(cleanExpiredTokens, 60 * 60 * 1000);

// ── Real-time Notifications (SSE) ────────────────────────────────────────────
const notificationClients = new Map(); // userId -> res

function sendNotification(userId, data) {
  const client = notificationClients.get(userId);
  if (client) {
    try {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch {}
  }
}

// ── Email Setup ──────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendEmail(to, subject, html) {
  if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASSWORD) {
    console.log(`📧 [Email not configured] To: ${to} | Subject: ${subject}`);
    return true;
  }
  try {
    await transporter.sendMail({ from: `"Spark Dating" <${process.env.EMAIL_FROM}>`, to, subject, html });
    return true;
  } catch (e) {
    console.error("Email send failed:", e.message);
    return false;
  }
}

function emailVerifyHTML(name, link) {
  return `
  <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:40px">🔥</span>
      <h1 style="color:#f43f5e;margin:8px 0;font-size:28px;">Spark Dating</h1>
    </div>
    <h2 style="color:#111;font-size:20px;">Hi ${name}, verify your email!</h2>
    <p style="color:#555;line-height:1.6;">Welcome to Spark! Click the button below to verify your email and start finding connections.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${link}" style="background:linear-gradient(135deg,#f43f5e,#fb923c);color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;">
        ✅ Verify Email
      </a>
    </div>
    <p style="color:#999;font-size:12px;text-align:center;">Link expires in 24 hours. If you didn't sign up, ignore this email.</p>
  </div>`;
}

function resetPasswordHTML(name, link) {
  return `
  <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:40px">🔥</span>
      <h1 style="color:#f43f5e;margin:8px 0;font-size:28px;">Spark Dating</h1>
    </div>
    <h2 style="color:#111;font-size:20px;">Reset your password</h2>
    <p style="color:#555;line-height:1.6;">Hi ${name}, we received a request to reset your password. Click below to set a new one.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${link}" style="background:linear-gradient(135deg,#f43f5e,#fb923c);color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;">
        🔑 Reset Password
      </a>
    </div>
    <p style="color:#999;font-size:12px;text-align:center;">Link expires in 1 hour. If you didn't request this, ignore this email.</p>
  </div>`;
}

// ── DB Init ───────────────────────────────────────────────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      age INTEGER NOT NULL,
      bio TEXT DEFAULT '',
      photos TEXT[] DEFAULT '{}',
      gender TEXT DEFAULT '',
      interested_in TEXT DEFAULT '',
      latitude DOUBLE PRECISION DEFAULT 18.5204,
      longitude DOUBLE PRECISION DEFAULT 73.8567,
      email_verified BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS likes (
      user_id TEXT, liked_id TEXT, PRIMARY KEY(user_id, liked_id)
    );
    CREATE TABLE IF NOT EXISTS passes (
      user_id TEXT, passed_id TEXT, PRIMARY KEY(user_id, passed_id)
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY, from_id TEXT, to_id TEXT,
      text TEXT, read BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS tokens (
      token TEXT PRIMARY KEY, user_id TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS email_verifications (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS password_resets (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log("✅ Database tables ready");
}

function randId() { return Math.random().toString(36).substr(2, 9); }
function randToken() { return Math.random().toString(36).substr(2, 32); }
function secureToken() { return crypto.randomBytes(32).toString("hex"); }

const app = express();
app.use(cors());
app.use(securityHeaders);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

const uploadsDir = path.join(process.cwd(), "data", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

// ── Auth Middleware ───────────────────────────────────────────────────────────
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Unauthorized" }); return;
  }
  const token = authHeader.slice(7);
  // Check token exists and not expired (30 days)
  const r = await pool.query(
    "SELECT user_id FROM tokens WHERE token=$1 AND created_at > NOW() - INTERVAL '30 days'",
    [token]
  );
  if (!r.rows[0]) {
    // Delete expired token
    await pool.query("DELETE FROM tokens WHERE token=$1", [token]);
    res.status(401).json({ success: false, message: "Session expired. Please log in again." }); return;
  }
  req.userId = r.rows[0].user_id;
  next();
}

// ── Signup ────────────────────────────────────────────────────────────────────
app.post("/api/auth/signup", authLimiter, async (req, res) => {
  try {
    const { name, email, password, age, agreedToTerms, agreedToPrivacy } = req.body;
    if (!name || !email || !password || !age) { res.status(400).json({ success: false, message: "All fields required" }); return; }
    const exists = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (exists.rows.length) { res.status(400).json({ success: false, message: "Email already registered" }); return; }
    if (parseInt(age) < 18) { res.status(400).json({ success: false, message: "Must be 18+" }); return; }

    const userId = randId(), token = randToken();
    const hash = await bcrypt.hash(password, 10);
    const emailVerified = !process.env.EMAIL_FROM; // auto-verify if email not configured

    await pool.query(
      "INSERT INTO users(id,name,email,password,age,email_verified) VALUES($1,$2,$3,$4,$5,$6)",
      [userId, name, email, hash, parseInt(age), emailVerified]
    );
    await pool.query("INSERT INTO tokens(token,user_id) VALUES($1,$2)", [token, userId]);

    // Send verification email
    if (process.env.EMAIL_FROM) {
      const verifyToken = secureToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await pool.query("INSERT INTO email_verifications(token,user_id,expires_at) VALUES($1,$2,$3)", [verifyToken, userId, expiresAt]);
      const link = `${process.env.APP_URL}/api/auth/verify-email?token=${verifyToken}`;
      await sendEmail(email, "Verify your Spark account ✅", emailVerifyHTML(name, link));
    }

    res.json({
      success: true, userId, token,
      emailVerified,
      message: process.env.EMAIL_FROM ? "Account created! Please check your email to verify." : "Account created!"
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Verify Email ──────────────────────────────────────────────────────────────
app.get("/api/auth/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    const r = await pool.query("SELECT user_id,expires_at FROM email_verifications WHERE token=$1", [token]);
    if (!r.rows[0]) { res.send(verifyPageHTML("❌ Invalid Link", "This verification link is invalid.", false)); return; }
    if (new Date() > new Date(r.rows[0].expires_at)) { res.send(verifyPageHTML("⏰ Link Expired", "This link has expired. Please request a new one.", false)); return; }
    await pool.query("UPDATE users SET email_verified=true WHERE id=$1", [r.rows[0].user_id]);
    await pool.query("DELETE FROM email_verifications WHERE token=$1", [token]);
    res.send(verifyPageHTML("✅ Email Verified!", "Your email has been verified. You can now use Spark!", true));
  } catch (e) { res.status(500).send("Error: " + e.message); }
});

function verifyPageHTML(title, message, success) {
  return `<!DOCTYPE html><html><head><title>${title}</title><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:linear-gradient(135deg,#fff0f3,#ffd6e8)">
  <div style="text-align:center;background:white;padding:48px;border-radius:24px;box-shadow:0 10px 40px rgba(0,0,0,0.1);max-width:400px">
    <div style="font-size:56px;margin-bottom:16px">${success ? "🎉" : "❌"}</div>
    <h1 style="color:${success ? "#f43f5e" : "#666"};margin-bottom:12px">${title}</h1>
    <p style="color:#666;margin-bottom:28px">${message}</p>
    <a href="/" style="background:linear-gradient(135deg,#f43f5e,#fb923c);color:white;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:bold">
      ${success ? "🔥 Open Spark" : "← Go Back"}
    </a>
  </div></body></html>`;
}

// ── Login ─────────────────────────────────────────────────────────────────────
app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400).json({ success: false, message: "Email and password required" }); return; }
    
    // Check account lockout
    const lockout = checkLockout(email);
    if (lockout.locked) {
      res.status(423).json({ success: false, message: `Account locked due to too many failed attempts. Try again in ${lockout.mins} minute(s).` }); return;
    }

    const r = await pool.query("SELECT id,password,email_verified FROM users WHERE email=$1", [email]);
    if (!r.rows[0] || !(await bcrypt.compare(password, r.rows[0].password))) {
      recordFailedLogin(email);
      const attempts = loginAttempts.get(email);
      const remaining = 5 - (attempts?.count || 0);
      res.status(401).json({ success: false, message: `Invalid email or password. ${remaining > 0 ? remaining + " attempts remaining." : "Account locked for 15 minutes."}` }); return;
    }
    
    clearFailedLogin(email);
    const token = randToken();
    await pool.query("INSERT INTO tokens(token,user_id) VALUES($1,$2)", [token, r.rows[0].id]);
    res.json({ success: true, userId: r.rows[0].id, token, emailVerified: r.rows[0].email_verified });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Demo Login ────────────────────────────────────────────────────────────────
app.post("/api/auth/demo", async (req, res) => {
  try {
    let r = await pool.query("SELECT id FROM users WHERE email=$1", ["demo@spark.app"]);
    let userId;
    if (!r.rows[0]) {
      userId = randId();
      const hash = await bcrypt.hash("demo1234", 10);
      await pool.query("INSERT INTO users(id,name,email,password,age,email_verified) VALUES($1,$2,$3,$4,$5,true)", [userId, "Demo User", "demo@spark.app", hash, 25]);
    } else { userId = r.rows[0].id; }
    const token = randToken();
    await pool.query("INSERT INTO tokens(token,user_id) VALUES($1,$2)", [token, userId]);
    res.json({ success: true, userId, token, emailVerified: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Forgot Password ───────────────────────────────────────────────────────────
app.post("/api/auth/forgot-password", otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) { res.status(400).json({ success: false, message: "Email required" }); return; }
    const r = await pool.query("SELECT id,name FROM users WHERE email=$1", [email]);

    // Always return success (don't reveal if email exists)
    if (r.rows[0]) {
      const resetToken = secureToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await pool.query("INSERT INTO password_resets(token,user_id,expires_at) VALUES($1,$2,$3)", [resetToken, r.rows[0].id, expiresAt]);
      const link = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
      await sendEmail(email, "Reset your Spark password 🔑", resetPasswordHTML(r.rows[0].name, link));
    }

    res.json({ success: true, message: "If that email exists, a reset link has been sent." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Reset Password ────────────────────────────────────────────────────────────
app.post("/api/auth/reset-password", authLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) { res.status(400).json({ success: false, message: "Token and password required" }); return; }
    if (password.length < 6) { res.status(400).json({ success: false, message: "Password must be at least 6 characters" }); return; }

    const r = await pool.query("SELECT user_id,expires_at,used FROM password_resets WHERE token=$1", [token]);
    if (!r.rows[0]) { res.status(400).json({ success: false, message: "Invalid reset link" }); return; }
    if (r.rows[0].used) { res.status(400).json({ success: false, message: "This link has already been used" }); return; }
    if (new Date() > new Date(r.rows[0].expires_at)) { res.status(400).json({ success: false, message: "Reset link has expired" }); return; }

    const hash = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password=$1 WHERE id=$2", [hash, r.rows[0].user_id]);
    await pool.query("UPDATE password_resets SET used=true WHERE token=$1", [token]);
    await pool.query("DELETE FROM tokens WHERE user_id=$1", [r.rows[0].user_id]); // logout all sessions

    res.json({ success: true, message: "Password reset successfully! Please log in." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Resend Verification ───────────────────────────────────────────────────────
app.post("/api/auth/resend-verification", authenticate, otpLimiter, async (req, res) => {
  try {
    const r = await pool.query("SELECT name,email,email_verified FROM users WHERE id=$1", [req.userId]);
    if (!r.rows[0]) { res.status(404).json({ success: false, message: "User not found" }); return; }
    if (r.rows[0].email_verified) { res.json({ success: true, message: "Email already verified" }); return; }

    const verifyToken = secureToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await pool.query("DELETE FROM email_verifications WHERE user_id=$1", [req.userId]);
    await pool.query("INSERT INTO email_verifications(token,user_id,expires_at) VALUES($1,$2,$3)", [verifyToken, req.userId, expiresAt]);
    const link = `${process.env.APP_URL}/api/auth/verify-email?token=${verifyToken}`;
    await sendEmail(r.rows[0].email, "Verify your Spark account ✅", emailVerifyHTML(r.rows[0].name, link));
    res.json({ success: true, message: "Verification email sent!" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Update Location ───────────────────────────────────────────────────────────
app.post("/api/location", authenticate, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) { res.status(400).json({ success: false, message: "Location required" }); return; }
    await pool.query("UPDATE users SET latitude=$1,longitude=$2 WHERE id=$3", [latitude, longitude, req.userId]);
    res.json({ success: true, message: "Location updated" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Profile ───────────────────────────────────────────────────────────────────
app.get("/api/profile", authenticate, async (req, res) => {
  try {
    const r = await pool.query("SELECT id,name,email,age,bio,photos,gender,interested_in,latitude,longitude,email_verified FROM users WHERE id=$1", [req.userId]);
    if (!r.rows[0]) {
      // Create empty profile if not found
      res.json({ success: true, profile: { id: req.userId, name: "", email: "", age: 18, bio: "", photos: [], gender: "", interestedIn: "", latitude: 18.5204, longitude: 73.8567, emailVerified: false }});
      return;
    }
    const u = r.rows[0];
    res.json({ success: true, profile: { 
      id: u.id || req.userId,
      name: u.name || "",
      email: u.email || "",
      age: u.age || 18,
      bio: u.bio || "",
      photos: u.photos || [],
      gender: u.gender || "",
      interestedIn: u.interested_in || "",
      latitude: parseFloat(u.latitude) || 18.5204,
      longitude: parseFloat(u.longitude) || 73.8567,
      emailVerified: u.email_verified || false
    }});
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/profile", authenticate, async (req, res) => {
  try {
    const { name,age,bio,gender,interestedIn,existingPhotos,photos } = req.body;
    const p = existingPhotos || photos || [];
    await pool.query("UPDATE users SET name=$1,age=$2,bio=$3,gender=$4,interested_in=$5,photos=$6,updated_at=NOW() WHERE id=$7",
      [name, parseInt(age)||0, bio||"", gender||"", interestedIn||"", p, req.userId]);
    const r = await pool.query("SELECT id,name,email,age,bio,photos,gender,interested_in,latitude,longitude,email_verified FROM users WHERE id=$1",[req.userId]);
    const u = r.rows[0];
    res.json({ success:true, profile:{ id:u.id,name:u.name,email:u.email,age:u.age,bio:u.bio||"",photos:u.photos||[],gender:u.gender||"",interestedIn:u.interested_in||"",latitude:u.latitude,longitude:u.longitude,emailVerified:u.email_verified }});
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Discover ──────────────────────────────────────────────────────────────────
app.get("/api/discover/nearby", authenticate, apiLimiter, async (req, res) => {
  try {
    const me = await pool.query("SELECT latitude,longitude FROM users WHERE id=$1", [req.userId]);
    const { latitude:lat, longitude:lng } = me.rows[0] || { latitude:18.52, longitude:73.85 };
    const r = await pool.query(`
      SELECT id,name,age,bio,photos,gender,interested_in,latitude,longitude FROM users
      WHERE id!=$1
        AND id NOT IN (SELECT liked_id FROM likes WHERE user_id=$1)
        AND id NOT IN (SELECT passed_id FROM passes WHERE user_id=$1)
      LIMIT 50`, [req.userId]);
    const users = r.rows.map(u => {
      const dLat=(u.latitude-lat)*Math.PI/180, dLon=(u.longitude-lng)*Math.PI/180;
      const a=Math.sin(dLat/2)**2+Math.cos(lat*Math.PI/180)*Math.cos(u.latitude*Math.PI/180)*Math.sin(dLon/2)**2;
      return { id:u.id,name:u.name,age:u.age,bio:u.bio||"",photos:u.photos||[],gender:u.gender||"",interestedIn:u.interested_in||"",latitude:u.latitude,longitude:u.longitude,distance:6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)) };
    }).sort((a,b) => a.distance - b.distance);
    res.json({ success:true, users });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Interactions ──────────────────────────────────────────────────────────────
app.post("/api/interactions/like", authenticate, apiLimiter, async (req, res) => {
  try {
    const { profileId } = req.body;
    await pool.query("INSERT INTO likes(user_id,liked_id) VALUES($1,$2) ON CONFLICT DO NOTHING", [req.userId, profileId]);
    
    // Check if it's a match
    const matchCheck = await pool.query(
      "SELECT 1 FROM likes WHERE user_id=$1 AND liked_id=$2",
      [profileId, req.userId]
    );
    
    let isMatch = false;
    if (matchCheck.rows.length > 0) {
      isMatch = true;
      // Get liker's name for notification
      const liker = await pool.query("SELECT name,photos FROM users WHERE id=$1", [req.userId]);
      const likerData = liker.rows[0];
      
      // Notify the other user of a match
      sendNotification(profileId, {
        type: "match",
        message: `You matched with ${likerData?.name}! 🎉`,
        userId: req.userId,
        userName: likerData?.name,
        userPhoto: likerData?.photos?.[0] || null,
      });
      
      // Notify current user too
      const liked = await pool.query("SELECT name,photos FROM users WHERE id=$1", [profileId]);
      const likedData = liked.rows[0];
      sendNotification(req.userId, {
        type: "match",
        message: `You matched with ${likedData?.name}! 🎉`,
        userId: profileId,
        userName: likedData?.name,
        userPhoto: likedData?.photos?.[0] || null,
      });
    } else {
      // Just a like notification (not a match yet)
      const liker = await pool.query("SELECT name,photos FROM users WHERE id=$1", [req.userId]);
      const likerData = liker.rows[0];
      sendNotification(profileId, {
        type: "like",
        message: `${likerData?.name} liked your profile! ❤️`,
        userId: req.userId,
        userName: likerData?.name,
        userPhoto: likerData?.photos?.[0] || null,
      });
    }
    
    res.json({ success: true, isMatch });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/interactions/pass", authenticate, apiLimiter, async (req, res) => {
  try {
    await pool.query("INSERT INTO passes(user_id,passed_id) VALUES($1,$2) ON CONFLICT DO NOTHING", [req.userId, req.body.profileId]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Matches & Messages ────────────────────────────────────────────────────────
app.get("/api/matches", authenticate, async (req, res) => {
  try {
    const r = await pool.query(`SELECT id,name,age,photos,bio FROM users WHERE id IN (SELECT liked_id FROM likes WHERE user_id=$1) AND id IN (SELECT user_id FROM likes WHERE liked_id=$1)`, [req.userId]);
    res.json({ success:true, matches:r.rows.map(u=>({...u,photos:u.photos||[]})) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get("/api/messages/conversations", authenticate, async (req, res) => {
  try {
    const matches = await pool.query(`SELECT id,name,age,photos FROM users WHERE id IN (SELECT liked_id FROM likes WHERE user_id=$1) AND id IN (SELECT user_id FROM likes WHERE liked_id=$1)`, [req.userId]);
    const convs = await Promise.all(matches.rows.map(async match => {
      const msgs = await pool.query(`SELECT * FROM messages WHERE (from_id=$1 AND to_id=$2) OR (from_id=$2 AND to_id=$1) ORDER BY created_at DESC LIMIT 1`, [req.userId, match.id]);
      const unread = await pool.query("SELECT COUNT(*) FROM messages WHERE to_id=$1 AND from_id=$2 AND read=false", [req.userId, match.id]);
      const m = msgs.rows[0];
      return { match:{...match,photos:match.photos||[]}, lastMessage:m?{id:m.id,fromId:m.from_id,toId:m.to_id,text:m.text,read:m.read,createdAt:m.created_at}:null, unreadCount:parseInt(unread.rows[0].count) };
    }));
    res.json({ success:true, conversations:convs });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get("/api/messages/:matchId", authenticate, async (req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM messages WHERE (from_id=$1 AND to_id=$2) OR (from_id=$2 AND to_id=$1) ORDER BY created_at ASC`, [req.userId, req.params.matchId]);
    res.json({ success:true, messages:r.rows.map(m=>({id:m.id,fromId:m.from_id,toId:m.to_id,text:m.text,read:m.read,createdAt:m.created_at})) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/messages/:matchId", authenticate, async (req, res) => {
  try {
    const id = randId();
    const { matchId } = req.params;
    await pool.query("INSERT INTO messages(id,from_id,to_id,text) VALUES($1,$2,$3,$4)", [id, req.userId, matchId, req.body.text]);
    
    // Notify recipient
    const sender = await pool.query("SELECT name FROM users WHERE id=$1", [req.userId]);
    sendNotification(matchId, {
      type: "message",
      message: `${sender.rows[0]?.name}: ${req.body.text.slice(0, 50)}${req.body.text.length > 50 ? "..." : ""}`,
      userId: req.userId,
      userName: sender.rows[0]?.name,
    });
    
    res.json({ success:true, message:{id,fromId:req.userId,toId:matchId,text:req.body.text,read:false,createdAt:new Date().toISOString()} });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Photo Upload ──────────────────────────────────────────────────────────────
app.post("/api/upload/photo", authenticate, uploadLimiter, async (req, res) => {
  try {
    const { imageData, filename } = req.body;
    if (!imageData) { res.status(400).json({ success: false, message: "No image" }); return; }
    const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
    
    // Validate it is actually an image
    const validation = validatePhoto(base64);
    if (!validation.valid) {
      res.status(400).json({ success: false, message: "Invalid file type. Only JPEG, PNG, GIF, WEBP allowed." }); return;
    }
    
    const buf = Buffer.from(base64, "base64");
    if (buf.length > 10 * 1024 * 1024) { res.status(400).json({ success: false, message: "Too large (max 10MB)" }); return; }
    const ext = validation.type || "jpg";
    const fname = `${req.userId}_${Date.now()}.${ext}`;
    fs.writeFileSync(path.join(uploadsDir, fname), buf);
    res.json({ success: true, url: `/uploads/${fname}` });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});


// ── SSE Notifications ────────────────────────────────────────────────────────
app.get("/api/notifications/stream", authenticate, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const userId = req.userId;
  notificationClients.set(userId, res);

  // Send ping every 30s to keep alive
  const ping = setInterval(() => {
    try { res.write(": ping\n\n"); } catch {}
  }, 30000);

  req.on("close", () => {
    clearInterval(ping);
    notificationClients.delete(userId);
  });
});

// ── Block & Report ────────────────────────────────────────────────────────────
app.post("/api/block/:userId", authenticate, async (req, res) => {
  try {
    const { userId: targetId } = req.params;
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blocks (
        blocker_id TEXT, blocked_id TEXT, created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY(blocker_id, blocked_id)
      )`);
    await pool.query("INSERT INTO blocks(blocker_id,blocked_id) VALUES($1,$2) ON CONFLICT DO NOTHING", [req.userId, targetId]);
    // Also remove from likes/matches
    await pool.query("DELETE FROM likes WHERE (user_id=$1 AND liked_id=$2) OR (user_id=$2 AND liked_id=$1)", [req.userId, targetId]);
    res.json({ success: true, message: "User blocked" });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/report/:userId", authenticate, async (req, res) => {
  try {
    const { userId: targetId } = req.params;
    const { reason } = req.body;
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        reporter_id TEXT, reported_id TEXT,
        reason TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
      )`);
    await pool.query("INSERT INTO reports(id,reporter_id,reported_id,reason) VALUES($1,$2,$3,$4)",
      [Math.random().toString(36).substr(2,9), req.userId, targetId, reason || "No reason given"]);
    res.json({ success: true, message: "Report submitted. We will review it." });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Who Liked Me ─────────────────────────────────────────────────────────────
app.get("/api/likes/received", authenticate, async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT u.id,u.name,u.age,u.photos,u.bio,u.gender,l.created_at as liked_at
      FROM users u
      JOIN likes l ON l.user_id = u.id
      WHERE l.liked_id = $1
      ORDER BY l.created_at DESC
    `, [req.userId]);
    res.json({ success: true, users: r.rows.map(u => ({...u, photos: u.photos||[]})) });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Filters for Discover ─────────────────────────────────────────────────────
app.get("/api/discover/filtered", authenticate, async (req, res) => {
  try {
    const { minAge = 18, maxAge = 99, maxDistance = 100, gender } = req.query;
    const me = await pool.query("SELECT latitude,longitude FROM users WHERE id=$1", [req.userId]);
    const { latitude: lat, longitude: lng } = me.rows[0] || { latitude: 18.52, longitude: 73.85 };

    let query = `
      SELECT id,name,age,bio,photos,gender,interested_in,latitude,longitude FROM users
      WHERE id != $1
        AND age >= $2 AND age <= $3
        AND id NOT IN (SELECT liked_id FROM likes WHERE user_id=$1)
        AND id NOT IN (SELECT passed_id FROM passes WHERE user_id=$1)
    `;
    const params = [req.userId, parseInt(minAge), parseInt(maxAge)];

    if (gender && gender !== "all") {
      query += ` AND gender = $${params.length + 1}`;
      params.push(gender);
    }
    query += " LIMIT 100";

    const r = await pool.query(query, params);
    const users = r.rows.map(u => {
      const dLat=(u.latitude-lat)*Math.PI/180, dLon=(u.longitude-lng)*Math.PI/180;
      const a=Math.sin(dLat/2)**2+Math.cos(lat*Math.PI/180)*Math.cos(u.latitude*Math.PI/180)*Math.sin(dLon/2)**2;
      const distance = 6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
      return { id:u.id,name:u.name,age:u.age,bio:u.bio||"",photos:u.photos||[],gender:u.gender||"",interestedIn:u.interested_in||"",latitude:u.latitude,longitude:u.longitude,distance };
    })
    .filter(u => u.distance <= parseFloat(maxDistance))
    .sort((a,b) => a.distance - b.distance);

    res.json({ success: true, users });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Notify on Like (update the like endpoint) ─────────────────────────────────

// ── Admin ─────────────────────────────────────────────────────────────────────
const ADMIN_KEY = process.env.ADMIN_KEY || "spark-admin-2024";
app.get("/api/admin/users", async (req, res) => {
  if (req.headers["x-admin-key"] !== ADMIN_KEY) { res.status(403).json({ success: false }); return; }
  const r = await pool.query("SELECT id,name,email,age,bio,photos,gender,interested_in,email_verified,created_at FROM users ORDER BY created_at DESC");
  res.json({ success: true, count: r.rows.length, users: r.rows });
});
app.delete("/api/admin/users/:userId", async (req, res) => {
  if (req.headers["x-admin-key"] !== ADMIN_KEY) { res.status(403).json({ success: false }); return; }
  await pool.query("DELETE FROM users WHERE id=$1", [req.params.userId]);
  res.json({ success: true, message: "Deleted" });
});
app.get("/api/admin/stats", async (req, res) => {
  if (req.headers["x-admin-key"] !== ADMIN_KEY) { res.status(403).json({ success: false }); return; }
  const users = await pool.query("SELECT COUNT(*) FROM users");
  const verified = await pool.query("SELECT COUNT(*) FROM users WHERE email_verified=true");
  const messages = await pool.query("SELECT COUNT(*) FROM messages");
  const matches = await pool.query("SELECT COUNT(*) FROM (SELECT l1.user_id FROM likes l1 JOIN likes l2 ON l1.user_id=l2.liked_id AND l1.liked_id=l2.user_id) t");
  res.json({ success: true, stats: { totalUsers: parseInt(users.rows[0].count), verifiedUsers: parseInt(verified.rows[0].count), totalMessages: parseInt(messages.rows[0].count), totalMatches: parseInt(matches.rows[0].count) }});
});

// ── Frontend ──────────────────────────────────────────────────────────────────
const distPath = path.join(__dirname, "dist", "spa");
app.use(express.static(distPath));
app.use((req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) {
    res.status(404).json({ error: "Not found" }); return;
  }
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) res.sendFile(indexPath);
  else res.send("Run: pnpm build");
});

// ── Seed ──────────────────────────────────────────────────────────────────────
async function seedData() {
  const count = await pool.query("SELECT COUNT(*) FROM users");
  if (parseInt(count.rows[0].count) > 0) return;
  console.log("🌱 Seeding sample users (Pune area)...");
  const samples = [
    {name:"Priya",email:"priya@example.com",age:24,bio:"Adventure seeker, coffee lover ☕",gender:"female",interestedIn:"male",lat:18.5204,lng:73.8567},
    {name:"Sneha",email:"sneha@example.com",age:26,bio:"Yoga instructor, dog mom 🐕",gender:"female",interestedIn:"male",lat:18.5314,lng:73.8446},
    {name:"Rahul",email:"rahul@example.com",age:27,bio:"Software engineer, hiking enthusiast 🏔️",gender:"male",interestedIn:"female",lat:18.5642,lng:73.7769},
    {name:"Arjun",email:"arjun@example.com",age:29,bio:"Fitness enthusiast, foodie 🍕",gender:"male",interestedIn:"female",lat:18.4944,lng:73.8560},
    {name:"Anjali",email:"anjali@example.com",age:23,bio:"Photographer and nature lover 📸",gender:"female",interestedIn:"male",lat:18.5089,lng:73.8259},
    {name:"Vikram",email:"vikram@example.com",age:28,bio:"Musician and artist 🎵",gender:"male",interestedIn:"female",lat:18.5822,lng:73.9197},
  ];
  const colors = ["f43f5e","fb923c","a855f7","3b82f6","10b981","f59e0b"];
  for (let i=0; i<samples.length; i++) {
    const s=samples[i], uid=randId(), hash=await bcrypt.hash("password123",10);
    await pool.query("INSERT INTO users(id,name,email,password,age,bio,gender,interested_in,latitude,longitude,photos,email_verified) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true) ON CONFLICT DO NOTHING",
      [uid,s.name,s.email,hash,s.age,s.bio,s.gender,s.interestedIn,s.lat+(Math.random()-.5)*.02,s.lng+(Math.random()-.5)*.02,
      [`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&size=400&background=${colors[i]}&color=fff&bold=true`]]);
  }
  console.log("✅ Sample users seeded!");
}

// ── Start ─────────────────────────────────────────────────────────────────────
const port = parseInt(process.env.PORT || "3000");
async function start() {
  console.log("🔌 Connecting to database...", dbUrl.split("@")[1]?.split("/")[0] || "unknown host");
  await initDB();
  await seedData();
  app.listen(port, "0.0.0.0", () => {
    console.log(`✅ Spark server running on http://localhost:${port}`);
    console.log(`   Open: http://localhost:${port}`);
    console.log(`\n   Press Ctrl+C to stop\n`);
  });
}
start().catch(e => { console.error("❌ Failed:", e.message); process.exit(1); });
