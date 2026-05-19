import { RequestHandler } from "express";
import { db } from "../db";

export const handleGetNearby: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    const users = await db.getNearbyUsers(userId);
    res.json({ success: true, users });
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
};
