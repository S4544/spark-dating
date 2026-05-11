import { RequestHandler } from "express";
import { db } from "../db";

export const handleSignup: RequestHandler = async (req, res) => {
  try {
    const { name, email, password, age, agreedToTerms, agreedToPrivacy } = req.body;
    if (!name || !email || !password || !age) { res.status(400).json({ success: false, message: "All fields required" }); return; }
    if (!agreedToTerms || !agreedToPrivacy) { res.status(400).json({ success: false, message: "Must agree to terms" }); return; }
    const result = await db.signup({ name, email, password, age: parseInt(age), agreedToTerms, agreedToPrivacy });
    if (result.success) res.json(result);
    else res.status(400).json(result);
  } catch (e: any) { res.status(500).json({ success: false, message: "Server error" }); }
};

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400).json({ success: false, message: "Email and password required" }); return; }
    const result = await db.login({ email, password });
    if (result.success) res.json(result);
    else res.status(401).json(result);
  } catch (e: any) { res.status(500).json({ success: false, message: "Server error" }); }
};
