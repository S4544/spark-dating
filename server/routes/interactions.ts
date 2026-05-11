import { RequestHandler } from "express";
import { db } from "../db";

export const handleLike: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { profileId } = req.body;
    if (!profileId) { res.status(400).json({ success: false, message: "profileId required" }); return; }
    const result = await db.like(userId, profileId);
    res.json(result);
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
};

export const handlePass: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { profileId } = req.body;
    if (!profileId) { res.status(400).json({ success: false, message: "profileId required" }); return; }
    const result = await db.pass(userId, profileId);
    res.json(result);
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
};
