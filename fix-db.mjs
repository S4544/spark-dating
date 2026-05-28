import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function fix() {
  console.log("🔧 Fixing database schema...");
  try {
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
    `);
    console.log("✅ Added email_verified column");

    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS interested_in TEXT DEFAULT '';
    `);
    console.log("✅ Added interested_in column");

    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
    `);
    console.log("✅ Added bio column");

    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
    `);
    console.log("✅ Added photos column");

    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT '';
    `);
    console.log("✅ Added gender column");

    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION DEFAULT 18.5204;
    `);
    console.log("✅ Added latitude column");

    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION DEFAULT 73.8567;
    `);
    console.log("✅ Added longitude column");

    // Also create missing tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blocks (
        blocker_id TEXT, blocked_id TEXT, created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY(blocker_id, blocked_id)
      );
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        reporter_id TEXT, reported_id TEXT,
        reason TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
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
    console.log("✅ All tables ready");

    // Set existing users as verified
    await pool.query(`UPDATE users SET email_verified = true WHERE email_verified IS NULL`);
    console.log("✅ Existing users marked as verified");

    console.log("\n🎉 Database fixed! Now run: node server.mjs");
  } catch (e) {
    console.error("❌ Error:", e.message);
  } finally {
    await pool.end();
  }
}

fix();
