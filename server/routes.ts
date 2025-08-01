import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertEstimateSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import { emailService } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  // Lead capture endpoint
  app.post("/api/leads", async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      
      // Send email notification and schedule drip campaign
      await emailService.sendQuoteNotification(leadData);
      
      // Schedule email drip campaign
      try {
        const { scheduleEmailDripCampaign } = await import("./email-drip");
        await scheduleEmailDripCampaign({
          email: leadData.email,
          firstName: leadData.firstName,
          lastName: leadData.lastName,
          subscriptionSource: 'quote_request'
        });
      } catch (error) {
        console.error("Failed to schedule drip campaign:", error);
      }
      
      res.json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create lead" });
      }
    }
  });

  // Get all leads
  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  // Project estimate endpoint
  app.post("/api/estimates", async (req, res) => {
    try {
      const estimateData = insertEstimateSchema.parse(req.body);
      
      // Calculate estimated cost based on project type
      let estimatedCost = 0;
      switch (estimateData.projectType) {
        case "remodeling":
          estimatedCost = 15000;
          break;
        case "painting":
          estimatedCost = 2000;
          break;
        case "drywall":
          estimatedCost = 500;
          break;
        case "design":
          estimatedCost = 5000;
          break;
        default:
          estimatedCost = 1000;
      }

      const estimateWithCost = {
        ...estimateData,
        estimatedCost
      };

      const estimate = await storage.createEstimate(estimateWithCost);
      
      // Send email notification
      await emailService.sendEstimateNotification(estimateWithCost);
      
      res.json(estimate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid estimate data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create estimate" });
      }
    }
  });

  // Get all estimates
  app.get("/api/estimates", async (req, res) => {
    try {
      const estimates = await storage.getEstimates();
      res.json(estimates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch estimates" });
    }
  });

  // Get testimonials
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  // Create testimonial
  app.post("/api/testimonials", async (req, res) => {
    try {
      const testimonial = await storage.createTestimonial(req.body);
      res.json(testimonial);
    } catch (error) {
      res.status(500).json({ message: "Failed to create testimonial" });
    }
  });

  // Get projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Get single project
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Create project
  app.post("/api/projects", async (req, res) => {
    try {
      const project = await storage.createProject(req.body);
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Update project
  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`Updating project ${id} with data:`, req.body);
      
      // Filter out readonly fields that shouldn't be updated
      const { id: _, createdAt, completedAt, magicLink, ...updateData } = req.body;
      
      const project = await storage.updateProject(id, updateData);
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.json(project);
    } catch (error) {
      console.error("Update project error:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Message team endpoint
  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      
      // Send email notification about the message
      await emailService.sendMessageNotification(messageData);
      
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  });

  // Get messages
  app.get("/api/messages", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const messages = await storage.getMessages(projectId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Test email endpoint
  app.post("/api/test-email", async (req, res) => {
    try {
      console.log("Testing EmailOctopus integration...");
      const result = await emailService.sendTestEmail();
      
      if (result) {
        res.json({ success: true, message: "Test email sent successfully via EmailOctopus" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send test email" });
      }
    } catch (error) {
      console.error("Test email error:", error);
      res.status(500).json({ success: false, message: "Error sending test email", error: error instanceof Error ? error.message : String(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
