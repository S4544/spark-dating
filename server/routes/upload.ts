import { RequestHandler } from "express";
import * as fs from "fs";
import * as path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// POST /api/upload/photo — base64 image upload
export const handlePhotoUpload: RequestHandler = (req, res) => {
  try {
    const userId = (req as any).userId;
    if (!userId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }

    const { imageData, filename } = req.body;
    if (!imageData) { res.status(400).json({ success: false, message: "No image data" }); return; }

    ensureUploadDir();

    // Strip base64 header
    const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");

    // Validate size (max 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      res.status(400).json({ success: false, message: "Image too large (max 5MB)" });
      return;
    }

    const ext = (filename || "photo.jpg").split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg","jpeg","png","webp","gif"].includes(ext) ? ext : "jpg";
    const fname = `${userId}_${Date.now()}.${safeExt}`;
    const fpath = path.join(UPLOAD_DIR, fname);

    fs.writeFileSync(fpath, buffer);

    res.json({ success: true, url: `/uploads/${fname}` });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};
