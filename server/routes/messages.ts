import { RequestHandler } from "express";
import { dbGetConversations, dbGetMessages, dbSendMessage, dbGetMatches } from "../db";

export const handleGetConversations: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    res.json({ success: true, conversations: await dbGetConversations(userId) });
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
};

export const handleGetMessages: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    res.json({ success: true, messages: await dbGetMessages(userId, req.params.matchId) });
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
};

export const handleSendMessage: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { text } = req.body;
    if (!text?.trim()) { res.status(400).json({ success: false, message: "Empty message" }); return; }
    res.json({ success: true, message: await dbSendMessage(userId, req.params.matchId, text.trim()) });
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
};

export const handleGetMatches: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    res.json({ success: true, matches: await dbGetMatches(userId) });
  } catch { res.status(500).json({ success: false, message: "Server error" }); }
};
