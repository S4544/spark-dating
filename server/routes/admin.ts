import { RequestHandler } from "express";
import { db } from "../db";

const ADMIN_KEY = process.env.ADMIN_KEY || "spark-admin-2024";
function checkAdmin(req: any, res: any): boolean {
  const key = req.headers["x-admin-key"] || req.query.adminKey;
  if (key !== ADMIN_KEY) { res.status(403).json({ success: false, message: "Forbidden" }); return false; }
  return true;
}

export const handleAdminGetUsers: RequestHandler = async (req, res) => {
  if (!checkAdmin(req, res)) return;
  const users = await db.getAllUsers();
  res.json({ success: true, count: users.length, users });
};

export const handleAdminDeleteUser: RequestHandler = async (req, res) => {
  if (!checkAdmin(req, res)) return;
  const result = await db.deleteUser(req.params.userId);
  res.json(result);
};

export const handleAdminUpdateUser: RequestHandler = async (req, res) => {
  if (!checkAdmin(req, res)) return;
  const result = await db.updateProfile(req.params.userId, req.body);
  res.json(result);
};

export const handleAdminStats: RequestHandler = async (req, res) => {
  if (!checkAdmin(req, res)) return;
  const users = await db.getAllUsers();
  res.json({
    success: true,
    stats: {
      totalUsers: users.length,
      usersWithPhotos: users.filter((u: any) => u.photos?.length > 0).length,
      usersWithBio: users.filter((u: any) => u.bio?.length > 0).length,
    }
  });
};
