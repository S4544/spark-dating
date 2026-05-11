# 🔥 Spark Dating App — Complete Edition

## Quick Start

```bash
# 1. Install packages
pnpm install

# 2. Set up your .env file (fill in your real values)
# Edit .env with your Supabase URL, Gmail, etc.

# 3. Build the app
pnpm build

# 4. Start the server
node server.mjs
```

Open: http://localhost:3000
Admin: http://localhost:3000/admin

---

## .env Setup

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
ADMIN_KEY=your-secret-admin-key
EMAIL_FROM=your-gmail@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
APP_URL=http://localhost:3000
```

---

## Features

### User Features
- ✅ Signup / Login with email
- ✅ Email verification
- ✅ Forgot password / Reset password
- ✅ Real GPS location detection
- ✅ Swipe cards (drag or tap buttons)
- ✅ Like & Pass profiles
- ✅ Match animation when both like
- ✅ Real-time messaging
- ✅ Photo upload (up to 6 photos)
- ✅ Profile completion tracker
- ✅ Age & distance filters
- ✅ Gender preference filter
- ✅ Who liked me page
- ✅ Block users
- ✅ Report users
- ✅ Live notifications (match, message, like)
- ✅ Intro animation (first visit only)

### Security
- ✅ bcrypt password hashing
- ✅ Rate limiting on all routes
- ✅ Account lockout after 5 failed logins
- ✅ Token expiry (30 days)
- ✅ Photo file validation
- ✅ Security headers (XSS, clickjacking protection)
- ✅ SQL injection safe (parameterized queries)

### Admin Dashboard (/admin)
- ✅ Total users, matches, messages stats
- ✅ Search and filter users
- ✅ View full user details
- ✅ Delete users
- ✅ See reports

### Pages
- / — Landing page with intro animation
- /login — Login
- /signup — Signup
- /discover — Swipe profiles
- /messages — Chat with matches
- /profile — Edit profile & upload photos
- /likes — Who liked you
- /forgot-password — Forgot password
- /reset-password — Reset password
- /admin — Admin dashboard
- /terms, /privacy, /faq, /contact, /safety — Legal pages

---

## Admin API

All endpoints require header: x-admin-key: YOUR_ADMIN_KEY

- GET  /api/admin/users     — list all users
- GET  /api/admin/stats     — app statistics
- DELETE /api/admin/users/:id — delete user

---

## Sample Accounts (auto-created)
- priya@example.com / password123
- sneha@example.com / password123
- rahul@example.com / password123
- arjun@example.com / password123
