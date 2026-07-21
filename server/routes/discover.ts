import { RequestHandler } from "express";
import { db } from "../db";

export const handleGetNearby: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    const users = await db.getNearbyUsers(userId);
    res.json({ success: true, users });
  } catch (e: any) {
    console.error("getNearbyUsers error:", e.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const handleGetFiltered: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { minAge = 18, maxAge = 100, maxDistance = 100, gender = "all" } = req.query;

    const filters = {
      minAge: Math.max(18, parseInt(minAge as string) || 18),
      maxAge: Math.min(100, parseInt(maxAge as string) || 100),
      maxDistance: Math.max(1, parseInt(maxDistance as string) || 100),
      gender: (gender as string) || "all",
    };

    const users = await db.getNearbyUsersFiltered(userId, filters);
    res.json({ success: true, users });
  } catch (e: any) {
    console.error("getFiltered error:", e.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
