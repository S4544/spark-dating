import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
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
        latitude DOUBLE PRECISION DEFAULT 40.7128,
        longitude DOUBLE PRECISION DEFAULT -74.006,
        agreed_to_terms BOOLEAN DEFAULT false,
        agreed_to_privacy BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS likes (
        user_id TEXT NOT NULL,
        liked_id TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id, liked_id)
      );

      CREATE TABLE IF NOT EXISTS passes (
        user_id TEXT NOT NULL,
        passed_id TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id, passed_id)
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        from_id TEXT NOT NULL,
        to_id TEXT NOT NULL,
        text TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tokens (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("✅ Database tables ready");
  } finally {
    client.release();
  }
}

export { pool };
