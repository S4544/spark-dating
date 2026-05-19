# 🔥 Spark Dating App — Complete Edition

## Quick Start (Local)

```bash
pnpm install
# Fill in your .env file
pnpm build
node server.mjs
```

Open: http://localhost:3000
Admin: http://localhost:3000/admin

---

## .env Setup (Required)

Create `.env` file in root folder:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
ADMIN_KEY=your-secret-admin-key
EMAIL_FROM=your-gmail@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_SERVICE=gmail
APP_URL=http://localhost:3000
PORT=3000
```

---

## Deploy to Railway (Free)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Spark Dating App"
git remote add origin https://github.com/YOUR_USERNAME/spark-dating.git
git push -u origin main
```

### Step 2 — Deploy on Railway
1. Go to railway.app
2. Login with GitHub
3. New Project → Deploy from GitHub repo
4. Select your repo

### Step 3 — Add Environment Variables
In Railway dashboard → Variables tab, add:

| Variable | Value |
|----------|-------|
| DATABASE_URL | your Supabase URL |
| ADMIN_KEY | your secret key |
| PORT | 3000 |
| NODE_ENV | production |
| APP_URL | https://your-app.up.railway.app |
| EMAIL_FROM | your Gmail |
| EMAIL_PASSWORD | Gmail app password |

### Step 4 — Set Start Command
In Settings → Start Command:
```
node server.mjs
```

### Step 5 — Fix Database (first time only)
After deploying, run locally:
```bash
node fix-db.mjs
```

---

## Make Android APK

### Method 1 — WebIntoApp (Easiest)
1. Start server: `node server.mjs`
2. Create tunnel: `ssh -R 80:localhost:3000 nokey@localhost.run`
3. Go to webintoapp.com
4. Enter tunnel URL
5. Download APK

### Method 2 — After Railway Deploy
1. Go to webintoapp.com
2. Enter your Railway URL
3. Download APK (works 24/7!)

---

## App Features

### User Features
- Cinematic intro animation (first visit)
- Signup / Login with email
- Email verification
- Forgot password / Reset password
- Real GPS location detection
- Swipe cards (drag or tap)
- Like & Pass profiles
- Match animation when both like
- Real-time messaging
- Photo upload (up to 6 photos)
- Profile completion tracker
- Age, distance & gender filters
- Who liked me page
- Block & Report users
- Live notifications (match, message, like)
- PWA — installable on phone

### Security
- bcrypt password hashing
- Rate limiting on all routes
- Account lockout (5 wrong attempts)
- Token expiry (30 days)
- Photo file validation
- Security headers (XSS, clickjacking)
- SQL injection safe

### Admin Dashboard (/admin)
- Stats: users, matches, messages
- Search and filter users
- View full user details
- Delete users
- Protected by ADMIN_KEY

---

## Pages
- / — Landing page
- /login — Login
- /signup — Signup
- /discover — Swipe profiles
- /messages — Chat
- /profile — Edit profile
- /likes — Who liked you
- /forgot-password — Forgot password
- /reset-password — Reset password
- /admin — Admin dashboard
- /terms, /privacy, /faq, /contact, /safety — Legal

---

## Admin API
Header required: x-admin-key: YOUR_ADMIN_KEY

- GET /api/admin/users — all users
- GET /api/admin/stats — statistics
- DELETE /api/admin/users/:id — delete user

---

## Tech Stack
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Node.js + Express
- Database: PostgreSQL (Supabase)
- Auth: Custom JWT tokens + bcrypt
- Email: Nodemailer + Gmail
- PWA: Service Worker + Web Manifest
