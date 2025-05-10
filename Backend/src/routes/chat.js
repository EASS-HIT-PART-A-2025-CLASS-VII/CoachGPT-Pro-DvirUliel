import express from "express";
import { getCachedResponse, setCachedResponse } from "../services/cacheService.js";

const router = express.Router();

// נקודת צ'אט בסיסית שמחזירה טקסט מדומה
router.post("/", async (req, res) => {
  const { userId, message } = req.body;

  const cacheKey = `chat:${userId}:${message}`;
  const cached = await getCachedResponse(cacheKey);
  if (cached) {
    return res.json({ from: "cache", response: cached });
  }

  // תוצאה מדומה (במקום LLM)
  const response = `התקבלה הודעה: ${message}`;

  await setCachedResponse(cacheKey, response, 3600);
  res.json({ from: "llm", response });
});

export default router;
