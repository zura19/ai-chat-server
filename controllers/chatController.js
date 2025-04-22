import genAI from "../lib/geminiClient.js";
import { prisma } from "../lib/prisma.js";
import { io } from "../server.js";
import { formatDate } from "../lib/utils.js";

export const sentMessageToAI = async (req, res) => {
  try {
    const { prompt } = req.body;

    io.to(req.user.id).emit("userMessage", {
      sender: "user",
      text: prompt,
      createdAt: Date.now(),
    });
    const date = formatDate(Date.now());

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const chatHistory = await prisma.message.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    console.log("Chat history:", chatHistory);

    const chat = model.startChat({
      history: chatHistory.map((message) => ({
        role: message.sender,
        parts: [{ text: message.text }],
      })),
    });

    const respo = await chat.sendMessage(prompt);
    const aiResponse = await respo.response;
    const text = aiResponse.text();

    const isConversation = await prisma.conversation.findFirst({
      where: { date, userId: req.user.id },
    });

    if (!isConversation) {
      const conv = await prisma.conversation.create({
        data: {
          date,
          userId: req.user.id,
        },
      });

      await prisma.message.create({
        data: {
          userId: req.user.id,
          conversationId: conv.id,
          sender: "user",
          text: prompt,
        },
      });
      await prisma.message.create({
        data: {
          userId: req.user.id,
          conversationId: conv.id,
          sender: "model",
          text: text,
        },
      });
      io.to(req.user.id).emit("botResponse", {
        sender: "model",
        text: text,
        createdAt: Date.now(),
      });
    } else {
      await prisma.message.create({
        data: {
          userId: req.user.id,
          conversationId: isConversation.id,
          text: prompt,
          sender: "user",
        },
      });

      await prisma.message.create({
        data: {
          userId: req.user.id,
          conversationId: isConversation.id,
          text: text,
          sender: "model",
        },
      });
      io.to(req.user.id).emit("botResponse", {
        sender: "model",
        text: text,
        createdAt: Date.now(),
      });
    }

    // res.json({ success: true, res: result, reply: text, question: prompt });
    res.json({ success: true, reply: text, question: prompt });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const getChats = async (req, res) => {
  const { user } = req;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const chats = await prisma.conversation.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          where: { sender: "user" },
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },

      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, chats });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error });
  }
};

export const getConversation = async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id, userId: user.id },
      include: { messages: { orderBy: { createdAt: "desc" } } },
    });
    if (!conversation || conversation.userId !== user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json({ success: true, conversation });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error });
  }
};
