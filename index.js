var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  estimates: () => estimates,
  insertEstimateSchema: () => insertEstimateSchema,
  insertLeadSchema: () => insertLeadSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertProjectSchema: () => insertProjectSchema,
  insertTestimonialSchema: () => insertTestimonialSchema,
  leads: () => leads,
  messages: () => messages,
  projects: () => projects,
  testimonials: () => testimonials
});
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  serviceType: text("service_type"),
  projectDetails: text("project_details"),
  consent: boolean("consent").notNull().default(false)
});
var projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  projectType: text("project_type").notNull(),
  status: text("status").notNull().default("consultation"),
  budget: integer("budget").notNull(),
  progress: integer("progress").notNull().default(0),
  projectManager: text("project_manager").notNull(),
  estimatedCompletion: text("estimated_completion").notNull()
});
var testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  rating: integer("rating").notNull().default(5),
  review: text("review").notNull()
});
var estimates = pgTable("estimates", {
  id: serial("id").primaryKey(),
  projectType: text("project_type").notNull(),
  roomSize: text("room_size"),
  budget: text("budget"),
  timeline: text("timeline"),
  contactInfo: text("contact_info").notNull(),
  estimatedCost: integer("estimated_cost")
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});
var insertLeadSchema = createInsertSchema(leads).omit({
  id: true
});
var insertProjectSchema = createInsertSchema(projects).omit({
  id: true
});
var insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true
});
var insertEstimateSchema = createInsertSchema(estimates).omit({
  id: true
});
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(leads).where(eq(leads.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(leads).where(eq(leads.firstName, username));
    return user || void 0;
  }
  async createLead(insertLead) {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }
  async getLeads() {
    return await db.select().from(leads);
  }
  async createProject(insertProject) {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }
  async getProjects() {
    return await db.select().from(projects);
  }
  async getProject(id) {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || void 0;
  }
  async updateProjectProgress(id, progress) {
    const [project] = await db.update(projects).set({ progress }).where(eq(projects.id, id)).returning();
    return project || void 0;
  }
  async getTestimonials() {
    return await db.select().from(testimonials);
  }
  async createTestimonial(insertTestimonial) {
    const [testimonial] = await db.insert(testimonials).values(insertTestimonial).returning();
    return testimonial;
  }
  async createEstimate(insertEstimate) {
    const [estimate] = await db.insert(estimates).values(insertEstimate).returning();
    return estimate;
  }
  async getEstimates() {
    return await db.select().from(estimates);
  }
  async getEstimate(id) {
    const [estimate] = await db.select().from(estimates).where(eq(estimates.id, id));
    return estimate || void 0;
  }
  async createMessage(insertMessage) {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }
  async getMessages(projectId) {
    if (projectId) {
      return await db.select().from(messages).where(eq(messages.projectId, projectId));
    }
    return await db.select().from(messages);
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z } from "zod";

// server/email.ts
var EmailService = class {
  adminEmail = "danieljuliusstein@gmail.com";
  apiKey = process.env.EMAILOCTOPUS_API_KEY;
  async sendQuoteNotification(lead) {
    try {
      const emailContent = this.generateQuoteEmail(lead);
      if (this.apiKey) {
        return await this.sendEmailViaEmailOctopus(emailContent);
      } else {
        console.log("=== NEW QUOTE REQUEST ===");
        console.log(`To: ${this.adminEmail}`);
        console.log(`Subject: ${emailContent.subject}`);
        console.log(`Body:
${emailContent.body}`);
        console.log("========================");
        return true;
      }
    } catch (error) {
      console.error("Failed to send quote notification:", error);
      return false;
    }
  }
  async sendEstimateNotification(estimate) {
    try {
      const emailContent = this.generateEstimateEmail(estimate);
      if (this.apiKey) {
        return await this.sendEmailViaEmailOctopus(emailContent);
      } else {
        console.log("=== NEW ESTIMATE REQUEST ===");
        console.log(`To: ${this.adminEmail}`);
        console.log(`Subject: ${emailContent.subject}`);
        console.log(`Body:
${emailContent.body}`);
        console.log("============================");
        return true;
      }
    } catch (error) {
      console.error("Failed to send estimate notification:", error);
      return false;
    }
  }
  generateQuoteEmail(lead) {
    return {
      subject: `New Quote Request from ${lead.firstName} ${lead.lastName}`,
      body: `
New quote request received from your Resilience Solutions website:

Customer Details:
- Name: ${lead.firstName} ${lead.lastName}
- Email: ${lead.email}
- Phone: ${lead.phone}
- Service Type: ${lead.serviceType || "Not specified"}

Project Details:
${lead.projectDetails || "No additional details provided"}

Please contact this customer within 24 hours to provide their personalized quote.

---
Resilience Solutions Website
      `.trim()
    };
  }
  generateEstimateEmail(estimate) {
    return {
      subject: `New Project Estimate Request - ${estimate.projectType}`,
      body: `
New estimate request received from your calculator:

Project Details:
- Type: ${estimate.projectType}
- Room Size: ${estimate.roomSize || "Not specified"}
- Budget Range: ${estimate.budget || "Not specified"}
- Timeline: ${estimate.timeline || "Not specified"}
- Estimated Cost: $${estimate.estimatedCost?.toLocaleString() || "Calculating..."}

Contact Information:
${estimate.contactInfo}

Follow up with this customer to discuss their project in detail.

---
Resilience Solutions Website
      `.trim()
    };
  }
  // EmailOctopus API integration
  async sendEmailViaEmailOctopus(emailContent) {
    try {
      if (!this.apiKey) {
        console.error("EmailOctopus API key not configured");
        return false;
      }
      const response = await fetch("https://emailoctopus.com/api/1.6/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          name: `Quote Notification - ${(/* @__PURE__ */ new Date()).toISOString()}`,
          subject: emailContent.subject,
          content: {
            html: emailContent.body.replace(/\n/g, "<br>"),
            text: emailContent.body
          },
          from: {
            name: "Resilience Solutions",
            email_address: this.adminEmail
          },
          to: [this.adminEmail]
        })
      });
      if (response.ok) {
        console.log("Email notification sent via EmailOctopus");
        return true;
      } else {
        const error = await response.text();
        console.error("EmailOctopus API error:", error);
        return false;
      }
    } catch (error) {
      console.error("Failed to send email via EmailOctopus:", error);
      return false;
    }
  }
  async sendMessageNotification(message) {
    try {
      const emailContent = this.generateMessageEmail(message);
      if (this.apiKey) {
        return await this.sendEmailViaEmailOctopus(emailContent);
      } else {
        console.log("=== NEW MESSAGE FROM CLIENT ===");
        console.log(`To: ${this.adminEmail}`);
        console.log(`Subject: ${emailContent.subject}`);
        console.log(`Body:
${emailContent.body}`);
        console.log("===============================");
        return true;
      }
    } catch (error) {
      console.error("Failed to send message notification:", error);
      return false;
    }
  }
  generateMessageEmail(message) {
    return {
      subject: `New Message from ${message.customerName}`,
      body: `
New message received from your client dashboard:

From: ${message.customerName}
Email: ${message.customerEmail}
Project ID: ${message.projectId || "General Inquiry"}

Message:
${message.message}

Please respond to the customer promptly.

---
Resilience Solutions Website
      `.trim()
    };
  }
};
var emailService = new EmailService();

// server/routes.ts
async function registerRoutes(app2) {
  app2.post("/api/leads", async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      await emailService.sendQuoteNotification(leadData);
      res.json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create lead" });
      }
    }
  });
  app2.get("/api/leads", async (req, res) => {
    try {
      const leads2 = await storage.getLeads();
      res.json(leads2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });
  app2.post("/api/estimates", async (req, res) => {
    try {
      const estimateData = insertEstimateSchema.parse(req.body);
      let estimatedCost = 0;
      switch (estimateData.projectType) {
        case "remodeling":
          estimatedCost = 15e3;
          break;
        case "painting":
          estimatedCost = 2e3;
          break;
        case "drywall":
          estimatedCost = 500;
          break;
        case "design":
          estimatedCost = 5e3;
          break;
        default:
          estimatedCost = 1e3;
      }
      const estimateWithCost = {
        ...estimateData,
        estimatedCost
      };
      const estimate = await storage.createEstimate(estimateWithCost);
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
  app2.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials2 = await storage.getTestimonials();
      res.json(testimonials2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });
  app2.get("/api/projects", async (req, res) => {
    try {
      const projects2 = await storage.getProjects();
      res.json(projects2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });
  app2.get("/api/projects/:id", async (req, res) => {
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
  app2.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
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
  app2.get("/api/messages", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId) : void 0;
      const messages2 = await storage.getMessages(projectId);
      res.json(messages2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
