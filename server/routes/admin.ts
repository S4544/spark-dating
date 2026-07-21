import { RequestHandler } from "express";
import { db } from "../db";

export const handleAdminGetUsers: RequestHandler = async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json({ success: true, count: users.length, users });
  } catch (e: any) {
    console.error("Admin getUsers error:", e.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const handleAdminDeleteUser: RequestHandler = async (req, res) => {
  try {
    const result = await db.deleteUser(req.params.userId);
    res.json(result);
  } catch (e: any) {
    console.error("Admin deleteUser error:", e.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const handleAdminUpdateUser: RequestHandler = async (req, res) => {
  try {
    const result = await db.updateProfile(req.params.userId, req.body);
    res.json(result);
  } catch (e: any) {
    console.error("Admin updateUser error:", e.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const handleAdminStats: RequestHandler = async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        usersWithPhotos: users.filter((u: any) => u.photos?.length > 0).length,
        usersWithBio: users.filter((u: any) => u.bio?.length > 0).length,
      }
    });
  } catch (e: any) {
    console.error("Admin stats error:", e.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
