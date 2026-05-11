import { RequestHandler } from "express";
import { db } from "../db";

export const handleGetProfile: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    const profile = await db.getProfile(userId);
    if (!profile) { res.status(404).json({ success: false, message: "Profile not found" }); return; }
    res.json({ success: true, profile });
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
};

export const handleUpdateProfile: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    const result = await db.updateProfile(userId, req.body);
    if (result.success) res.json(result);
    else res.status(400).json(result);
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
};
