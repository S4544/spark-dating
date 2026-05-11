import "dotenv/config";
import express, { RequestHandler } from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import { handleSignup, handleLogin } from "./routes/auth";
import { handleGetNearby } from "./routes/discover";
import { handleLike, handlePass } from "./routes/interactions";
import { handleGetProfile, handleUpdateProfile } from "./routes/profile";
import { handleAdminGetUsers, handleAdminDeleteUser, handleAdminUpdateUser, handleAdminStats } from "./routes/admin";
import { handleGetConversations, handleGetMessages, handleSendMessage, handleGetMatches } from "./routes/messages";
import { handlePhotoUpload } from "./routes/upload";
import { db } from "./db";

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Serve uploaded photos
  const uploadsDir = path.join(process.cwd(), "data", "uploads");
  app.use("/uploads", express.static(uploadsDir));

  // Auth middleware
  const authenticate: RequestHandler = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "Unauthorized" }); return;
    }
    const userId = await db.validateToken(authHeader.slice(7));
    if (!userId) {
      res.status(401).json({ success: false, message: "Invalid token" }); return;
    }
    (req as any).userId = userId;
    next();
  };

  // Public routes
  app.get("/api/ping", (_req, res) => res.json({ message: process.env.PING_MESSAGE ?? "ping" }));
  app.get("/api/demo", handleDemo);
  app.post("/api/auth/signup", handleSignup);
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/demo", async (req, res) => {
    let result = await db.login({ email: "demo@spark.app", password: "demo1234" });
    if (!result.success) result = await db.signup({ name: "Demo User", email: "demo@spark.app", password: "demo1234", age: 25, agreedToTerms: true, agreedToPrivacy: true });
    res.json(result);
  });

  // Protected routes
  app.get("/api/discover/nearby", authenticate, handleGetNearby);
  app.post("/api/interactions/like", authenticate, handleLike);
  app.post("/api/interactions/pass", authenticate, handlePass);
  app.get("/api/profile", authenticate, handleGetProfile);
  app.post("/api/profile", authenticate, handleUpdateProfile);
  app.post("/api/profile/update", authenticate, handleUpdateProfile);

  // Photo upload
  app.post("/api/upload/photo", authenticate, handlePhotoUpload);

  // Messaging
  app.get("/api/matches", authenticate, handleGetMatches);
  app.get("/api/messages/conversations", authenticate, handleGetConversations);
  app.get("/api/messages/:matchId", authenticate, handleGetMessages);
  app.post("/api/messages/:matchId", authenticate, handleSendMessage);

  // Admin
  app.get("/api/admin/users", handleAdminGetUsers);
  app.delete("/api/admin/users/:userId", handleAdminDeleteUser);
  app.post("/api/admin/users/:userId/profile", handleAdminUpdateUser);
  app.get("/api/admin/stats", handleAdminStats);

  return app;
}
