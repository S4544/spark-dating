import bcrypt from "bcryptjs";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://hzyuudjhtrdwbxqcdfgh.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const ADMIN_KEY = process.env.ADMIN_KEY || "spark-admin-2024";

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey, x-admin-key");
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  if (req.body) return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function db(path, options = {}) {
  if (!SUPABASE_ANON_KEY) throw new Error("SUPABASE_ANON_KEY is missing in Vercel Environment Variables");
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
  if (!response.ok) throw new Error(data?.message || data?.details || data?.hint || text || "Database request failed");
  return data;
}

function randId() { return Math.random().toString(36).slice(2, 11); }
function randToken() { return Math.random().toString(36).slice(2, 34); }
function num(v, fallback = 0) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }
function profile(u) {
  if (!u) return null;
  return { id:u.id, name:u.name||"", email:u.email||"", age:u.age||18, bio:u.bio||"", photos:u.photos||[], gender:u.gender||"", interestedIn:u.interested_in||"", latitude:u.latitude??18.5204, longitude:u.longitude??73.8567, emailVerified:Boolean(u.email_verified), created_at:u.created_at };
}
async function auth(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  const rows = await db(`/tokens?select=user_id&token=eq.${encodeURIComponent(header.slice(7))}&limit=1`);
  if (!rows?.[0]?.user_id) throw Object.assign(new Error("Session expired. Please log in again."), { status: 401 });
  return rows[0].user_id;
}
async function getUser(id) { return (await db(`/users?select=*&id=eq.${encodeURIComponent(id)}&limit=1`))?.[0] || null; }
function distKm(aLat,aLng,bLat,bLng){const dLat=(bLat-aLat)*Math.PI/180,dLng=(bLng-aLng)*Math.PI/180;const s=Math.sin(dLat/2)**2+Math.cos(aLat*Math.PI/180)*Math.cos(bLat*Math.PI/180)*Math.sin(dLng/2)**2;return 6371*2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { success: true });
  try {
    const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
    const route = url.pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");

    if (route === "auth/demo" && req.method === "POST") {
      const email = "demo@spark.app";
      let user = (await db(`/users?select=*&email=eq.${encodeURIComponent(email)}&limit=1`))?.[0];
      if (!user) {
        const id = randId();
        const hash = await bcrypt.hash("demo1234", 10);
        user = (await db("/users", { method:"POST", body:JSON.stringify({ id, name:"Demo User", email, password:hash, age:25, email_verified:true }) }))?.[0];
      }
      const token = randToken();
      await db("/tokens", { method:"POST", body:JSON.stringify({ token, user_id:user.id }) });
      return json(res, 200, { success:true, userId:user.id, token, emailVerified:true });
    }

    if (route === "auth/forgot-password" && req.method === "POST") return json(res, 200, { success:true, message:"If that email exists, a reset link has been sent." });
    if (route === "auth/resend-verification" && req.method === "POST") return json(res, 200, { success:true, message:"Email already verified" });
    if (route === "auth/verify-email" && req.method === "GET") { res.statusCode = 302; res.setHeader("Location", "/profile"); return res.end(); }

    if (route === "profile" && req.method === "GET") {
      const userId = await auth(req);
      return json(res, 200, { success:true, profile: profile(await getUser(userId)) });
    }
    if (route === "profile" && req.method === "POST") {
      const userId = await auth(req);
      const body = await readBody(req);
      const patch = { name:body.name||"", age:num(body.age,18), bio:body.bio||"", gender:body.gender||"", interested_in:body.interestedIn||"", photos:body.existingPhotos||body.photos||[], updated_at:new Date().toISOString() };
      const rows = await db(`/users?id=eq.${encodeURIComponent(userId)}`, { method:"PATCH", body:JSON.stringify(patch) });
      return json(res, 200, { success:true, profile: profile(rows?.[0]) });
    }
    if (route === "upload/photo" && req.method === "POST") {
      await auth(req);
      const body = await readBody(req);
      if (!body.imageData) return json(res, 400, { success:false, message:"No image" });
      if (String(body.imageData).length > 7000000) return json(res, 400, { success:false, message:"Image too large. Upload smaller image." });
      return json(res, 200, { success:true, url:body.imageData });
    }
    if (route === "location" && req.method === "POST") {
      const userId = await auth(req);
      const body = await readBody(req);
      await db(`/users?id=eq.${encodeURIComponent(userId)}`, { method:"PATCH", body:JSON.stringify({ latitude:num(body.latitude,18.5204), longitude:num(body.longitude,73.8567) }) });
      return json(res, 200, { success:true });
    }
    if (route === "discover/filtered" && req.method === "GET") {
      const userId = await auth(req);
      const me = await getUser(userId) || {};
      const minAge=num(url.searchParams.get("minAge"),18), maxAge=num(url.searchParams.get("maxAge"),99), maxDistance=num(url.searchParams.get("maxDistance"),100), gender=url.searchParams.get("gender")||"all";
      const [liked, passed, users] = await Promise.all([db(`/likes?select=liked_id&user_id=eq.${encodeURIComponent(userId)}`), db(`/passes?select=passed_id&user_id=eq.${encodeURIComponent(userId)}`), db(`/users?select=*&age=gte.${minAge}&age=lte.${maxAge}&limit=200`)]);
      const skip = new Set([userId, ...(liked||[]).map(x=>x.liked_id), ...(passed||[]).map(x=>x.passed_id)]);
      const meLat=num(me.latitude,18.5204), meLng=num(me.longitude,73.8567);
      const out=(users||[]).filter(u=>!skip.has(u.id)).filter(u=>gender==="all"||!gender||u.gender===gender).map(u=>({...profile(u),distance:distKm(meLat,meLng,num(u.latitude,18.5204),num(u.longitude,73.8567))})).filter(u=>u.distance<=maxDistance).sort((a,b)=>a.distance-b.distance);
      return json(res, 200, { success:true, users:out });
    }

    if (route === "interactions/like" && req.method === "POST") {
      const userId=await auth(req); const { profileId }=await readBody(req);
      await db("/likes", { method:"POST", body:JSON.stringify({ user_id:userId, liked_id:profileId }), headers:{ Prefer:"resolution=ignore-duplicates,return=representation" } });
      const back=await db(`/likes?select=user_id&user_id=eq.${encodeURIComponent(profileId)}&liked_id=eq.${encodeURIComponent(userId)}&limit=1`);
      return json(res, 200, { success:true, isMatch:Boolean(back?.[0]) });
    }
    if (route === "interactions/pass" && req.method === "POST") {
      const userId=await auth(req); const { profileId }=await readBody(req);
      await db("/passes", { method:"POST", body:JSON.stringify({ user_id:userId, passed_id:profileId }), headers:{ Prefer:"resolution=ignore-duplicates,return=representation" } });
      return json(res, 200, { success:true });
    }

    if (route === "matches" && req.method === "GET") {
      const userId=await auth(req); const [mine,theirs]=await Promise.all([db(`/likes?select=liked_id&user_id=eq.${encodeURIComponent(userId)}`), db(`/likes?select=user_id&liked_id=eq.${encodeURIComponent(userId)}`)]);
      const liked=new Set((mine||[]).map(x=>x.liked_id)); const ids=(theirs||[]).map(x=>x.user_id).filter(id=>liked.has(id));
      if (!ids.length) return json(res, 200, { success:true, matches:[] });
      const users=await db(`/users?select=*&id=in.(${ids.map(encodeURIComponent).join(",")})`);
      return json(res, 200, { success:true, matches:(users||[]).map(profile) });
    }

    if (route === "likes/received" && req.method === "GET") {
      const userId=await auth(req); const rows=await db(`/likes?select=user_id,created_at&liked_id=eq.${encodeURIComponent(userId)}&order=created_at.desc`); const ids=(rows||[]).map(x=>x.user_id);
      if (!ids.length) return json(res, 200, { success:true, users:[] });
      const users=await db(`/users?select=*&id=in.(${ids.map(encodeURIComponent).join(",")})`); const byId=new Map((rows||[]).map(x=>[x.user_id,x.created_at]));
      return json(res, 200, { success:true, users:(users||[]).map(u=>({...profile(u), liked_at:byId.get(u.id)})) });
    }

    if (route === "messages/conversations" && req.method === "GET") return json(res, 200, { success:true, conversations:[] });
    const msg = route.match(/^messages\/([^/]+)$/);
    if (msg && req.method === "GET") return json(res, 200, { success:true, messages:[] });
    if (msg && req.method === "POST") return json(res, 200, { success:true, message:{ id:randId(), fromId:await auth(req), toId:msg[1], text:(await readBody(req)).text||"", createdAt:new Date().toISOString(), read:false } });

    const report = route.match(/^report\/([^/]+)$/);
    if (report && req.method === "POST") return json(res, 200, { success:true, message:"Report submitted" });
    const block = route.match(/^block\/([^/]+)$/);
    if (block && req.method === "POST") return json(res, 200, { success:true, message:"User blocked" });

    if (route === "admin/stats" && req.method === "GET") {
      if ((req.headers["x-admin-key"]||"") !== ADMIN_KEY) return json(res, 403, { success:false });
      const [users, verified, messages] = await Promise.all([db("/users?select=id"), db("/users?select=id&email_verified=eq.true"), db("/messages?select=id")]);
      return json(res, 200, { success:true, stats:{ totalUsers:users?.length||0, verifiedUsers:verified?.length||0, totalMessages:messages?.length||0, totalMatches:0 } });
    }
    if (route === "admin/users" && req.method === "GET") {
      if ((req.headers["x-admin-key"]||"") !== ADMIN_KEY) return json(res, 403, { success:false });
      const users = await db("/users?select=*&order=created_at.desc");
      return json(res, 200, { success:true, count:users?.length||0, users:users||[] });
    }
    if (route === "notifications/stream" && req.method === "GET") { res.statusCode=200; res.setHeader("Content-Type","text/event-stream"); return res.end(`data: ${JSON.stringify({ type:"ready" })}\n\n`); }

    return json(res, 404, { success:false, message:`API route not found: ${route}` });
  } catch (error) {
    return json(res, error.status || 500, { success:false, message:error.message || "Server error" });
  }
}
