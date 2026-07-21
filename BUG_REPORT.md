# 🐛 Spark Dating App - Comprehensive Bug Report

## Critical Issues Found

### 1. **Missing `/api/discover/filtered` Route** ⚠️ CRITICAL
**Location:** `client/pages/Discover.tsx` (line 176)
**Issue:** The frontend calls `/api/discover/filtered` but this route doesn't exist in `server/index.ts`
```typescript
// Current request:
const r = await fetch(`/api/discover/filtered?${params}`, {...});

// But the route is not defined in server/index.ts
```
**Impact:** Discover page fails to load profiles
**Fix:** Add route to `server/index.ts`

---

### 2. **Missing Database Function** ⚠️ CRITICAL
**Location:** `server/index.ts` imports and `server/db.ts`
**Issue:** Route calls `db.getNearbyUsers()` but `db` is a class instance that needs the method to handle filters
**Impact:** Discover filtering won't work

---

### 3. **Incorrect `like()` Return Value** ⚠️ HIGH
**Location:** `server/routes/interactions.ts` (line 158)
**Issue:** The `like()` function doesn't return `isMatch` flag that frontend expects
```typescript
// Frontend expects:
if (d.isMatch) setMatchProfile(profile);

// But db.like() returns only:
{ success: true, message: "Liked" }
```
**Impact:** Match notifications won't show even when there's a match

---

### 4. **Missing Admin Endpoint** ⚠️ HIGH
**Location:** `server/index.ts` (lines 48-51)
**Issue:** Admin routes don't have authentication - they're publicly accessible!
```typescript
app.get("/api/admin/users", handleAdminGetUsers);  // ❌ No ADMIN_KEY check
app.delete("/api/admin/users/:userId", handleAdminDeleteUser);  // ❌ No ADMIN_KEY check
```
**Impact:** Security vulnerability - anyone can access admin functions

---

### 5. **Missing Signup Route Handler** ⚠️ HIGH  
**Location:** `server/routes/auth.ts`
**Issue:** Route imports `handleSignup` but never exported
```typescript
// server/routes/auth.ts doesn't export handleSignup and handleLogin
export const handleSignup // Missing!
```
**Impact:** Signup endpoint will fail

---

### 6. **Incorrect SQL for Photo Upload** ⚠️ MEDIUM
**Location:** `server/db.ts` (line 100-104)
**Issue:** Photo handling in `updateProfile` might lose existing photos
```typescript
// Should append to photos, not replace
if (updates.existingPhotos !== undefined || updates.photos !== undefined) {
    const photos = updates.existingPhotos || updates.photos || [];
    // This doesn't merge - it replaces
}
```

---

### 7. **Missing API Response Field** ⚠️ MEDIUM
**Location:** `server/db.ts` (line 158-166)
**Issue:** `like()` should return whether it's a match
```typescript
// Need to check if other user also liked this user
// Current code only returns { success: true, message: "Liked" }
// Should return { success: true, message: "Liked", isMatch?: boolean }
```

---

### 8. **Incomplete SVG Paths in HomePage** ⚠️ MEDIUM
**Location:** `client/pages/Index.tsx` (lines 35-39)
**Issue:** Social links have truncated SVG paths
```typescript
{ name: "Instagram", href: "...", svg: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.1[...]"
// SVG is cut off with [...]
```
**Impact:** Social media icons might not render correctly

---

### 9. **Missing Type Safety in Messages** ⚠️ MEDIUM
**Location:** `server/db.ts` (line 200-202)
**Issue:** Message response mapping is incorrect
```typescript
// Currently returns camelCase but database has snake_case
const result = await pool.query(`...`);
return result.rows.map((r) => ({
    id: r.id,
    fromId: r.from_id,  // ✓ OK
    toId: r.to_id,      // ✓ OK
    text: r.text,
    read: r.read,
    createdAt: r.created_at,  // ✓ OK
}));
```
**This is actually correct** ✓

---

### 10. **Missing Filtering Logic** ⚠️ CRITICAL
**Location:** `server/db.ts` 
**Issue:** `getNearbyUsers()` doesn't support age, distance, and gender filtering
```typescript
// Frontend sends filters but backend ignores them:
const r = await fetch(`/api/discover/filtered?${params}`, {
    // minAge, maxAge, maxDistance, gender
});

// But server only does basic nearby search without filters
```
**Impact:** Users can't filter profiles by age/distance/gender

---

### 11. **Race Condition in Discover Page** ⚠️ MEDIUM
**Location:** `client/pages/Discover.tsx` (line 104-108)
**Issue:** Multiple mouse/touch event handlers can cause conflicts
```typescript
onMouseDown={e => handleDragStart(e.clientX)}
onMouseMove={e => handleDragMove(e.clientX)}  // ❌ Fires on ALL mouse moves
onMouseUp={handleDragEnd}
onMouseLeave={handleDragEnd}
```
**Impact:** Card swiping might be jittery or unresponsive

---

### 12. **Missing Error Handling in Key Routes** ⚠️ MEDIUM
**Location:** Multiple route files
**Issue:** Routes catch errors but don't log them properly
```typescript
// server/routes/discover.ts
export const handleGetNearby: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    const users = await db.getNearbyUsers(userId);  // ❌ No error context
    res.json({ success: true, users });
  } catch { 
    res.status(500).json({ success: false, message: "Server error" }); 
  }
};
```

---

### 13. **Typo in Package Start Command** ⚠️ LOW
**Location:** `package.json` (line 10)
**Issue:** Script uses `server.mjs` but no such file exists
```json
"start": "node server.mjs",  // ❌ File doesn't exist
// Should be:
"start": "node dist/server/node-build.mjs",
```

---

### 14. **Missing Endpoint for Filtered Discovery** ⚠️ CRITICAL
**Location:** `server/index.ts`
**Issue:** Frontend expects `/api/discover/filtered` with query params
```typescript
// Current routes in server/index.ts:
app.get("/api/discover/nearby", authenticate, handleGetNearby);

// But client calls:
fetch(`/api/discover/filtered?${params}`)  // ❌ Route doesn't exist
```

---

### 15. **Potential SQL Injection in Admin Routes** ⚠️ MEDIUM
**Location:** `server/routes/admin.ts` (line 10)
**Issue:** Admin key can come from header or query - should be header only
```typescript
const key = req.headers["x-admin-key"] || req.query.adminKey;  // ❌ Query param leaks key in URL logs
// Should be:
const key = req.headers["x-admin-key"];
```

---

## Summary of Errors by Severity

| Severity | Count | Issues |
|----------|-------|--------|
| 🔴 CRITICAL | 3 | Missing routes, missing filtering logic, type mismatches |
| 🟠 HIGH | 4 | Match detection, auth exports, admin security, photo handling |
| 🟡 MEDIUM | 6 | SVG truncation, race conditions, error handling, SQL safety |
| 🟢 LOW | 1 | Package script typo |

**Total: 14 significant issues found**

