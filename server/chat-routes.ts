import type { Express } from "express";
import { storage } from "./storage";
import { insertChatSessionSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";

export function registerChatRoutes(app: Express) {
  // Create chat session
  app.post("/api/chat/sessions", async (req, res) => {
    try {
      const sessionData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(sessionData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid session data", errors: error.errors });
        return;
      }
      console.error("Failed to create chat session:", error);
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  // Get chat sessions (admin)
  app.get("/api/chat/sessions", async (req, res) => {
    try {
      const sessions = await storage.getChatSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Failed to get chat sessions:", error);
      res.status(500).json({ message: "Failed to get chat sessions" });
    }
  });

  // Create chat message
  app.post("/api/chat/messages", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(messageData);
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
        return;
      }
      console.error("Failed to create chat message:", error);
      res.status(500).json({ message: "Failed to create chat message" });
    }
  });

  // Get messages for a session
  app.get("/api/chat/messages/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Failed to get chat messages:", error);
      res.status(500).json({ message: "Failed to get chat messages" });
    }
  });

  // End chat session
  app.patch("/api/chat/sessions/:sessionId/end", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.endChatSession(sessionId);
      res.json(session);
    } catch (error) {
      console.error("Failed to end chat session:", error);
      res.status(500).json({ message: "Failed to end chat session" });
    }
  });
}