import "dotenv/config";
import { pool, initDB } from "./database";
import bcrypt from "bcryptjs";
import { LoginRequest, SignupRequest } from "@shared/api";

export class Database {
  async init() {
    await initDB();
    await this._seedSampleData();
  }

  private _randomId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  async signup(data: SignupRequest): Promise<{ success: boolean; userId?: string; token?: string; message: string }> {
    try {
      const existing = await pool.query("SELECT id FROM users WHERE email=$1", [data.email]);
      if (existing.rows.length > 0) return { success: false, message: "Email already registered" };
      if (data.age < 18) return { success: false, message: "Must be 18+ to use Spark" };

      const userId = this._randomId();
      const token = Math.random().toString(36).substr(2, 32);
      const hashedPassword = await bcrypt.hash(data.password, 10);

      await pool.query(
        `INSERT INTO users (id,name,email,password,age,agreed_to_terms,agreed_to_privacy)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [userId, data.name, data.email, hashedPassword, data.age, data.agreedToTerms, data.agreedToPrivacy]
      );
      await pool.query("INSERT INTO tokens (token,user_id) VALUES ($1,$2)", [token, userId]);

      return { success: true, userId, token, message: "Account created" };
    } catch (e: any) {
      console.error("Signup error:", e.message);
      return { success: false, message: "Signup failed" };
    }
  }

  async login(data: LoginRequest): Promise<{ success: boolean; userId?: string; token?: string; message: string }> {
    try {
      const result = await pool.query("SELECT id,password FROM users WHERE email=$1", [data.email]);
      if (result.rows.length === 0) return { success: false, message: "Invalid email or password" };

      const user = result.rows[0];
      const valid = await bcrypt.compare(data.password, user.password);
      if (!valid) return { success: false, message: "Invalid email or password" };

      const token = Math.random().toString(36).substr(2, 32);
      await pool.query("INSERT INTO tokens (token,user_id) VALUES ($1,$2)", [token, user.id]);

      return { success: true, userId: user.id, token, message: "Login successful" };
    } catch (e: any) {
      console.error("Login error:", e.message);
      return { success: false, message: "Login failed" };
    }
  }

  async validateToken(token: string): Promise<string | null> {
    try {
      const result = await pool.query("SELECT user_id FROM tokens WHERE token=$1", [token]);
      return result.rows[0]?.user_id || null;
    } catch { return null; }
  }

  // ── Profile ───────────────────────────────────────────────────────────────

  async getProfile(userId: string): Promise<any | null> {
    try {
      const result = await pool.query(
        "SELECT id,name,email,age,bio,photos,gender,interested_in,latitude,longitude,created_at,updated_at FROM users WHERE id=$1",
        [userId]
      );
      if (!result.rows[0]) return null;
      return this._mapUser(result.rows[0]);
    } catch { return null; }
  }

  async updateProfile(userId: string, updates: any): Promise<{ success: boolean; profile?: any; message: string }> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let i = 1;

      const map: Record<string, string> = {
        name: "name", age: "age", bio: "bio", gender: "gender",
        interestedIn: "interested_in", latitude: "latitude", longitude: "longitude",
      };

      for (const [key, col] of Object.entries(map)) {
        if (updates[key] !== undefined) {
          fields.push(`${col}=$${i++}`);
          values.push(updates[key]);
        }
      }

      // Handle photos — merge existing + new
      if (updates.existingPhotos !== undefined || updates.photos !== undefined) {
        const photos = updates.existingPhotos || updates.photos || [];
        fields.push(`photos=$${i++}`);
        values.push(photos);
      }

      if (fields.length === 0) {
        const profile = await this.getProfile(userId);
        return { success: true, profile, message: "No changes" };
      }

      fields.push(`updated_at=NOW()`);
      values.push(userId);

      await pool.query(
        `UPDATE users SET ${fields.join(",")} WHERE id=$${i}`,
        values
      );

      const profile = await this.getProfile(userId);
      return { success: true, profile, message: "Profile updated" };
    } catch (e: any) {
      console.error("Update error:", e.message);
      return { success: false, message: "Update failed" };
    }
  }

  // ── Discovery ─────────────────────────────────────────────────────────────

  async getNearbyUsers(userId: string): Promise<any[]> {
    try {
      const me = await pool.query(
        "SELECT latitude,longitude,gender,interested_in FROM users WHERE id=$1", [userId]
      );
      if (!me.rows[0]) return [];
      const { latitude: lat, longitude: lng } = me.rows[0];

      const result = await pool.query(`
        SELECT u.id,u.name,u.age,u.bio,u.photos,u.gender,u.interested_in,u.latitude,u.longitude
        FROM users u
        WHERE u.id != $1
          AND u.id NOT IN (SELECT liked_id FROM likes WHERE user_id=$1)
          AND u.id NOT IN (SELECT passed_id FROM passes WHERE user_id=$1)
        LIMIT 50
      `, [userId]);

      return result.rows.map((u) => ({
        ...this._mapUser(u),
        distance: this._calcDistance(lat, lng, u.latitude, u.longitude),
      })).sort((a, b) => a.distance - b.distance);
    } catch (e: any) {
      console.error("getNearbyUsers error:", e.message);
      return [];
    }
  }

  // ── Interactions ──────────────────────────────────────────────────────────

  async like(userId: string, likedId: string): Promise<{ success: boolean; message: string }> {
    try {
      await pool.query(
        "INSERT INTO likes (user_id,liked_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
        [userId, likedId]
      );
      return { success: true, message: "Liked" };
    } catch { return { success: false, message: "Failed" }; }
  }

  async pass(userId: string, passedId: string): Promise<{ success: boolean; message: string }> {
    try {
      await pool.query(
        "INSERT INTO passes (user_id,passed_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
        [userId, passedId]
      );
      return { success: true, message: "Passed" };
    } catch { return { success: false, message: "Failed" }; }
  }

  // ── Matches & Messages ────────────────────────────────────────────────────

  async getMatches(userId: string): Promise<any[]> {
    try {
      const result = await pool.query(`
        SELECT u.id,u.name,u.age,u.photos,u.bio,u.gender
        FROM users u
        WHERE u.id IN (SELECT liked_id FROM likes WHERE user_id=$1)
          AND u.id IN (SELECT user_id FROM likes WHERE liked_id=$1)
      `, [userId]);
      return result.rows.map(this._mapUser);
    } catch { return []; }
  }

  async getMessages(userId: string, matchId: string): Promise<any[]> {
    try {
      const result = await pool.query(`
        SELECT * FROM messages
        WHERE (from_id=$1 AND to_id=$2) OR (from_id=$2 AND to_id=$1)
        ORDER BY created_at ASC
      `, [userId, matchId]);
      return result.rows.map((r) => ({
        id: r.id, fromId: r.from_id, toId: r.to_id,
        text: r.text, read: r.read, createdAt: r.created_at,
      }));
    } catch { return []; }
  }

  async sendMessage(fromId: string, toId: string, text: string): Promise<any> {
    try {
      const id = this._randomId();
      await pool.query(
        "INSERT INTO messages (id,from_id,to_id,text) VALUES ($1,$2,$3,$4)",
        [id, fromId, toId, text]
      );
      return { id, fromId, toId, text, read: false, createdAt: new Date().toISOString() };
    } catch (e: any) {
      throw new Error("Send failed: " + e.message);
    }
  }

  async getConversations(userId: string): Promise<any[]> {
    try {
      const matches = await this.getMatches(userId);
      const convs = await Promise.all(matches.map(async (match) => {
        const msgs = await this.getMessages(userId, match.id);
        const last = msgs[msgs.length - 1] || null;
        const unread = msgs.filter((m) => m.toId === userId && !m.read).length;
        return { match, lastMessage: last, unreadCount: unread };
      }));
      return convs;
    } catch { return []; }
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  async getAllUsers(): Promise<any[]> {
    try {
      const result = await pool.query(
        "SELECT id,name,email,age,bio,photos,gender,interested_in,latitude,longitude,created_at FROM users ORDER BY created_at DESC"
      );
      return result.rows.map(this._mapUser);
    } catch { return []; }
  }

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      await pool.query("DELETE FROM users WHERE id=$1", [userId]);
      await pool.query("DELETE FROM likes WHERE user_id=$1 OR liked_id=$1", [userId]);
      await pool.query("DELETE FROM passes WHERE user_id=$1 OR passed_id=$1", [userId]);
      await pool.query("DELETE FROM messages WHERE from_id=$1 OR to_id=$1", [userId]);
      await pool.query("DELETE FROM tokens WHERE user_id=$1", [userId]);
      return { success: true, message: "User deleted" };
    } catch { return { success: false, message: "Delete failed" }; }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _mapUser(u: any) {
    return {
      id: u.id, name: u.name, email: u.email, age: u.age,
      bio: u.bio || "", photos: u.photos || [],
      gender: u.gender || "", interestedIn: u.interested_in || "",
      latitude: parseFloat(u.latitude) || 40.7128,
      longitude: parseFloat(u.longitude) || -74.006,
      createdAt: u.created_at, updatedAt: u.updated_at,
    };
  }

  private _calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  // ── Sample Data ───────────────────────────────────────────────────────────

  private async _seedSampleData() {
    try {
      const count = await pool.query("SELECT COUNT(*) FROM users");
      if (parseInt(count.rows[0].count) > 0) return;

      console.log("🌱 Seeding sample users...");
      const samples = [
        { name:"Sarah", email:"sarah@example.com", age:26, bio:"Adventure seeker, coffee lover ☕", gender:"female", interestedIn:"male", lat:40.7128, lng:-74.006 },
        { name:"Jessica", email:"jessica@example.com", age:24, bio:"Yoga instructor, dog mom 🐕", gender:"female", interestedIn:"male", lat:40.758, lng:-73.985 },
        { name:"Emma", email:"emma@example.com", age:28, bio:"Artist and creative soul 🎨", gender:"female", interestedIn:"male", lat:40.761, lng:-73.977 },
        { name:"Alex", email:"alex@example.com", age:27, bio:"Software engineer, hiking enthusiast 🏔️", gender:"male", interestedIn:"female", lat:40.748, lng:-73.968 },
        { name:"Michael", email:"michael@example.com", age:29, bio:"Fitness enthusiast, foodie 🍕", gender:"male", interestedIn:"female", lat:40.750, lng:-73.997 },
        { name:"Sophie", email:"sophie@example.com", age:23, bio:"Photographer and nature lover 📸", gender:"female", interestedIn:"male", lat:40.735, lng:-73.990 },
      ];

      const colors = ["f43f5e","fb923c","a855f7","3b82f6","10b981","f59e0b"];
      for (let i = 0; i < samples.length; i++) {
        const s = samples[i];
        const result = await this.signup({ name: s.name, email: s.email, password: "password123", age: s.age, agreedToTerms: true, agreedToPrivacy: true });
        if (result.success) {
          await this.updateProfile(result.userId!, {
            bio: s.bio, gender: s.gender, interestedIn: s.interestedIn,
            latitude: s.lat + (Math.random()-0.5)*0.02,
            longitude: s.lng + (Math.random()-0.5)*0.02,
            existingPhotos: [`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&size=400&background=${colors[i]}&color=fff&bold=true`],
          });
        }
      }
      console.log("✅ Sample users seeded!");
    } catch (e: any) {
      console.log("Seed skipped:", e.message);
    }
  }
}

export const db = new Database();

// Standalone messaging functions for routes
export async function dbGetMatches(userId: string) { return db.getMatches(userId); }
export async function dbGetMessages(userId: string, matchId: string) { return db.getMessages(userId, matchId); }
export async function dbSendMessage(fromId: string, toId: string, text: string) { return db.sendMessage(fromId, toId, text); }
export async function dbGetConversations(userId: string) { return db.getConversations(userId); }
