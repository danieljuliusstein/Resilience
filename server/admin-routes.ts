import type { Express } from "express";
import { storage } from "./storage";
import { insertProjectSchema, insertProjectLogSchema, insertMilestoneSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

// Admin routes for updating project dashboard
export function registerAdminRoutes(app: Express) {
  // Update project progress
  app.patch("/api/projects/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { progress } = req.body;
      
      if (typeof progress !== "number" || progress < 0 || progress > 100) {
        res.status(400).json({ message: "Progress must be between 0 and 100" });
        return;
      }

      // Get current project to track changes
      const currentProject = await storage.getProject(id);
      if (!currentProject) {
        res.status(404).json({ message: "Project not found" });
        return;
      }

      const project = await storage.updateProject(id, { progress });
      
      // Log the progress update
      await storage.createProjectLog({
        projectId: id,
        action: "Progress Updated",
        details: `Progress changed from ${currentProject.progress}% to ${progress}%`,
        userId: "admin"
      });
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project progress" });
    }
  });

  // Create new project
  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      
      // Log project creation
      await storage.createProjectLog({
        projectId: project.id,
        action: "Project Created",
        details: `New project "${project.clientName} - ${project.projectType}" created`,
        userId: "admin"
      });
      
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid project data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create project" });
      }
    }
  });

  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Get project by ID
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

  // Update entire project
  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const project = await storage.updateProject(id, updates);
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Update project status
  app.patch("/api/projects/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const validStatuses = ["consultation", "in-progress", "completed", "on-hold"];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ message: "Invalid status" });
        return;
      }

      // Get current project
      const currentProject = await storage.getProject(id);
      if (!currentProject) {
        res.status(404).json({ message: "Project not found" });
        return;
      }

      // Update using storage
      const updated = await storage.updateProject(id, { status });
      
      // If project completed, set completedAt timestamp
      if (status === 'completed' && currentProject.status !== 'completed') {
        await storage.updateProjectTimestamps(id, { completedAt: new Date() });
      }
      
      // Log the status change
      await storage.createProjectLog({
        projectId: id,
        action: "Status Changed", 
        details: `Status changed from "${currentProject.status}" to "${status}"`,
        userId: "admin"
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project status" });
    }
  });

  // Get dashboard metrics
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Get project logs
  app.get("/api/projects/:id/logs", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const logs = await storage.getProjectLogs(id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project logs" });
    }
  });

  // Get project milestones
  app.get("/api/projects/:id/milestones", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const milestones = await storage.getMilestones(id);
      res.json(milestones);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });

  // Create project milestone
  app.post("/api/projects/:id/milestones", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const milestoneData = insertMilestoneSchema.parse({
        ...req.body,
        projectId
      });
      const milestone = await storage.createMilestone(milestoneData);
      res.json(milestone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid milestone data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create milestone" });
      }
    }
  });

  // Regenerate magic link
  app.post("/api/projects/:id/regenerate-link", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.regenerateMagicLink(id);
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to regenerate magic link" });
    }
  });

  // Get project by magic link (for tracking page)
  app.get("/api/track/:magicLink", async (req, res) => {
    try {
      const { magicLink } = req.params;
      const project = await storage.getProjectByMagicLink(magicLink);
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Dashboard metrics
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Get all messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Create new message
  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create message" });
      }
    }
  });
}
