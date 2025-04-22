import express from "express";
import openAI from "../lib/openAI.js";
import genAI from "../lib/geminiClient.js";
import {
  getChats,
  getConversation,
  sentMessageToAI,
} from "../controllers/chatController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.route("/openai").post(async (req, res) => {
  try {
    const { prompt } = req.body;

    const chatCompletion = await openAI.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      maxTokens: 100,
    });

    res.status(201).json({ replay: chatCompletion });
  } catch (error) {
    console.log(error);
    res.status(500).send(error || "Something went wrong");
  }
});

router.route("/gemini").get(protect, getChats).post(protect, sentMessageToAI);
router.route("/gemini/:id").get(protect, getConversation);

// router.route("/models").post(async (req, res) => {
//   try {
//     const models = await genAI.L;
//     res.json({ models: models });
//   } catch (error) {
//     console.error("Error listing models:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to list models", details: error.message });
//   }
// });

export default router;
