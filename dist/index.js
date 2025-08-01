var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  chatMessages: () => chatMessages,
  chatSessions: () => chatSessions,
  emailCampaignSends: () => emailCampaignSends,
  emailSubscribers: () => emailSubscribers,
  estimates: () => estimates,
  insertChatMessageSchema: () => insertChatMessageSchema,
  insertChatSessionSchema: () => insertChatSessionSchema,
  insertEmailCampaignSendSchema: () => insertEmailCampaignSendSchema,
  insertEmailSubscriberSchema: () => insertEmailSubscriberSchema,
  insertEstimateSchema: () => insertEstimateSchema,
  insertLeadSchema: () => insertLeadSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertMilestoneSchema: () => insertMilestoneSchema,
  insertProjectLogSchema: () => insertProjectLogSchema,
  insertProjectSchema: () => insertProjectSchema,
  insertTestimonialSchema: () => insertTestimonialSchema,
  leads: () => leads,
  messages: () => messages,
  milestones: () => milestones,
  projectLogs: () => projectLogs,
  projects: () => projects,
  testimonials: () => testimonials
});
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var leads, projects, testimonials, estimates, messages, projectLogs, milestones, emailSubscribers, emailCampaignSends, chatMessages, chatSessions, insertLeadSchema, insertProjectSchema, insertTestimonialSchema, insertEstimateSchema, insertMessageSchema, insertProjectLogSchema, insertMilestoneSchema, insertEmailSubscriberSchema, insertEmailCampaignSendSchema, insertChatMessageSchema, insertChatSessionSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    leads = pgTable("leads", {
      id: serial("id").primaryKey(),
      firstName: text("first_name").notNull(),
      lastName: text("last_name").notNull(),
      email: text("email").notNull(),
      phone: text("phone").notNull(),
      serviceType: text("service_type"),
      projectDetails: text("project_details"),
      consent: boolean("consent").notNull().default(false)
    });
    projects = pgTable("projects", {
      id: serial("id").primaryKey(),
      clientName: text("client_name").notNull(),
      clientEmail: text("client_email"),
      clientPhone: text("client_phone"),
      projectType: text("project_type").notNull(),
      status: text("status").notNull().default("consultation"),
      budget: integer("budget").notNull(),
      progress: integer("progress").notNull().default(0),
      projectManager: text("project_manager").notNull(),
      estimatedCompletion: text("estimated_completion").notNull(),
      tags: text("tags").array().default([]),
      isOverdue: boolean("is_overdue").default(false),
      address: text("address"),
      notes: text("notes"),
      magicLink: text("magic_link").notNull(),
      completedAt: timestamp("completed_at"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    testimonials = pgTable("testimonials", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      location: text("location").notNull(),
      rating: integer("rating").notNull().default(5),
      review: text("review").notNull()
    });
    estimates = pgTable("estimates", {
      id: serial("id").primaryKey(),
      projectType: text("project_type").notNull(),
      roomSize: text("room_size"),
      budget: text("budget"),
      timeline: text("timeline"),
      contactInfo: text("contact_info").notNull(),
      estimatedCost: integer("estimated_cost")
    });
    messages = pgTable("messages", {
      id: serial("id").primaryKey(),
      projectId: integer("project_id").references(() => projects.id),
      customerName: text("customer_name").notNull(),
      customerEmail: text("customer_email").notNull(),
      message: text("message").notNull(),
      timestamp: timestamp("timestamp").defaultNow().notNull()
    });
    projectLogs = pgTable("project_logs", {
      id: serial("id").primaryKey(),
      projectId: integer("project_id").references(() => projects.id).notNull(),
      action: text("action").notNull(),
      details: text("details"),
      userId: text("user_id").notNull().default("admin"),
      timestamp: timestamp("timestamp").defaultNow().notNull()
    });
    milestones = pgTable("milestones", {
      id: serial("id").primaryKey(),
      projectId: integer("project_id").references(() => projects.id).notNull(),
      title: text("title").notNull(),
      description: text("description"),
      dueDate: text("due_date"),
      completedDate: text("completed_date"),
      isCompleted: boolean("is_completed").default(false),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    emailSubscribers = pgTable("email_subscribers", {
      id: serial("id").primaryKey(),
      email: text("email").notNull(),
      firstName: text("first_name"),
      lastName: text("last_name"),
      subscriptionSource: text("subscription_source").notNull(),
      // 'quote_request', 'newsletter', 'contact_form'
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    emailCampaignSends = pgTable("email_campaign_sends", {
      id: serial("id").primaryKey(),
      subscriberId: integer("subscriber_id").references(() => emailSubscribers.id).notNull(),
      campaignType: text("campaign_type").notNull(),
      // 'welcome', 'day2_portfolio', 'day5_consultation'
      emailSubject: text("email_subject").notNull(),
      sentAt: timestamp("sent_at").defaultNow().notNull(),
      isOpened: boolean("is_opened").default(false),
      isClicked: boolean("is_clicked").default(false)
    });
    chatMessages = pgTable("chat_messages", {
      id: serial("id").primaryKey(),
      sessionId: text("session_id").notNull(),
      senderType: text("sender_type").notNull(),
      // 'visitor', 'admin'
      senderName: text("sender_name"),
      message: text("message").notNull(),
      timestamp: timestamp("timestamp").defaultNow().notNull()
    });
    chatSessions = pgTable("chat_sessions", {
      id: serial("id").primaryKey(),
      sessionId: text("session_id").notNull(),
      visitorEmail: text("visitor_email"),
      visitorName: text("visitor_name"),
      isActive: boolean("is_active").notNull().default(true),
      startedAt: timestamp("started_at").defaultNow().notNull(),
      endedAt: timestamp("ended_at")
    });
    insertLeadSchema = createInsertSchema(leads).omit({
      id: true
    });
    insertProjectSchema = createInsertSchema(projects).omit({
      id: true,
      magicLink: true,
      completedAt: true,
      createdAt: true
    });
    insertTestimonialSchema = createInsertSchema(testimonials).omit({
      id: true
    });
    insertEstimateSchema = createInsertSchema(estimates).omit({
      id: true
    });
    insertMessageSchema = createInsertSchema(messages).omit({
      id: true,
      timestamp: true
    });
    insertProjectLogSchema = createInsertSchema(projectLogs).omit({
      id: true,
      timestamp: true
    });
    insertMilestoneSchema = createInsertSchema(milestones).omit({
      id: true,
      createdAt: true
    });
    insertEmailSubscriberSchema = createInsertSchema(emailSubscribers).omit({
      id: true,
      createdAt: true
    });
    insertEmailCampaignSendSchema = createInsertSchema(emailCampaignSends).omit({
      id: true,
      sentAt: true
    });
    insertChatMessageSchema = createInsertSchema(chatMessages).omit({
      id: true,
      timestamp: true
    });
    insertChatSessionSchema = createInsertSchema(chatSessions).omit({
      id: true,
      startedAt: true
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var databaseUrl, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    databaseUrl = process.env.DATABASE_URL || "postgresql://localhost:5432/resilience_dev";
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    console.log("Connecting to database:", databaseUrl.replace(/\/\/.*@/, "//***:***@"));
    pool = new Pool({ connectionString: databaseUrl });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/storage.ts
import { eq, asc } from "drizzle-orm";
import crypto from "crypto";
async function createStorageInstance() {
  if (storageInstance) {
    return storageInstance;
  }
  try {
    await db.select().from(leads).limit(1);
    console.log("Database connection successful, using DatabaseStorage");
    storageInstance = new DatabaseStorage();
    return storageInstance;
  } catch (error) {
    console.warn("Database connection failed, using MockStorage for development:", error instanceof Error ? error.message : String(error));
    storageInstance = new MockStorage();
    return storageInstance;
  }
}
async function getStorage() {
  return await createStorageInstance();
}
var MockStorage, DatabaseStorage, storageInstance, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    MockStorage = class {
      leads = [];
      projects = [
        {
          id: 1,
          clientName: "John Doe",
          clientEmail: "john@example.com",
          clientPhone: "(555) 123-4567",
          projectType: "remodeling",
          status: "in-progress",
          budget: 15e3,
          progress: 65,
          projectManager: "Sarah Johnson",
          estimatedCompletion: "2024-02-15",
          tags: ["\u{1F7E2} On-Time"],
          isOverdue: false,
          address: "123 Main St, Anytown, USA",
          notes: "Kitchen remodel with custom cabinets",
          magicLink: "sample-magic-link-1",
          completedAt: null,
          createdAt: /* @__PURE__ */ new Date()
        }
      ];
      testimonials = [
        {
          id: 1,
          name: "Sarah Johnson",
          location: "Austin, TX",
          rating: 5,
          review: "Outstanding work! The team transformed our kitchen beyond our expectations."
        }
      ];
      estimates = [];
      messages = [];
      projectLogs = [];
      milestones = [];
      emailSubscribers = [];
      emailCampaignSends = [];
      chatMessages = [];
      chatSessions = [];
      idCounter = 2;
      async createLead(insertLead) {
        const lead = {
          id: this.idCounter++,
          ...insertLead,
          serviceType: insertLead.serviceType || null,
          projectDetails: insertLead.projectDetails || null,
          consent: insertLead.consent || false
        };
        this.leads.push(lead);
        return lead;
      }
      async getLeads() {
        return this.leads;
      }
      async createProject(insertProject) {
        const project = {
          id: this.idCounter++,
          ...insertProject,
          clientEmail: insertProject.clientEmail || null,
          clientPhone: insertProject.clientPhone || null,
          address: insertProject.address || null,
          notes: insertProject.notes || null,
          tags: insertProject.tags || [],
          isOverdue: insertProject.isOverdue || false,
          progress: insertProject.progress || 0,
          status: insertProject.status || "consultation",
          magicLink: crypto.randomUUID(),
          completedAt: null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.projects.push(project);
        return project;
      }
      async getProjects() {
        return this.projects;
      }
      async getProject(id) {
        return this.projects.find((p) => p.id === id);
      }
      async updateProjectProgress(id, progress) {
        const project = this.projects.find((p) => p.id === id);
        if (project) {
          project.progress = progress;
        }
        return project;
      }
      async updateProject(id, updates) {
        const project = this.projects.find((p) => p.id === id);
        if (project) {
          Object.assign(project, updates);
        }
        return project;
      }
      async updateProjectTimestamps(id, updates) {
        const project = this.projects.find((p) => p.id === id);
        if (project) {
          if (updates.completedAt !== void 0) {
            project.completedAt = updates.completedAt;
          }
        }
        return project;
      }
      async getTestimonials() {
        return this.testimonials;
      }
      async createTestimonial(insertTestimonial) {
        const testimonial = {
          id: this.idCounter++,
          ...insertTestimonial,
          rating: insertTestimonial.rating || 5
        };
        this.testimonials.push(testimonial);
        return testimonial;
      }
      async createEstimate(insertEstimate) {
        const estimate = {
          id: this.idCounter++,
          ...insertEstimate,
          roomSize: insertEstimate.roomSize || null,
          budget: insertEstimate.budget || null,
          timeline: insertEstimate.timeline || null,
          estimatedCost: insertEstimate.estimatedCost || null
        };
        this.estimates.push(estimate);
        return estimate;
      }
      async getEstimates() {
        return this.estimates;
      }
      async getEstimate(id) {
        return this.estimates.find((e) => e.id === id);
      }
      async createMessage(insertMessage) {
        const message = {
          id: this.idCounter++,
          ...insertMessage,
          projectId: insertMessage.projectId || null,
          timestamp: /* @__PURE__ */ new Date()
        };
        this.messages.push(message);
        return message;
      }
      async getMessages(projectId) {
        if (projectId) {
          return this.messages.filter((m) => m.projectId === projectId);
        }
        return this.messages;
      }
      async createProjectLog(log2) {
        const projectLog = {
          id: this.idCounter++,
          ...log2,
          details: log2.details || null,
          userId: log2.userId || "admin",
          timestamp: /* @__PURE__ */ new Date()
        };
        this.projectLogs.push(projectLog);
        return projectLog;
      }
      async getProjectLogs(projectId) {
        return this.projectLogs.filter((l) => l.projectId === projectId);
      }
      async createMilestone(milestone) {
        const newMilestone = {
          id: this.idCounter++,
          ...milestone,
          description: milestone.description || null,
          dueDate: milestone.dueDate || null,
          completedDate: milestone.completedDate || null,
          isCompleted: milestone.isCompleted || false,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.milestones.push(newMilestone);
        return newMilestone;
      }
      async getMilestones(projectId) {
        return this.milestones.filter((m) => m.projectId === projectId);
      }
      async updateMilestone(id, updates) {
        const milestone = this.milestones.find((m) => m.id === id);
        if (milestone) {
          Object.assign(milestone, updates);
        }
        return milestone;
      }
      async getDashboardMetrics() {
        const activeProjects = this.projects.filter((p) => p.status !== "completed").length;
        const completedToday = this.projects.filter(
          (p) => p.status === "completed" && p.completedAt && new Date(p.completedAt).toDateString() === (/* @__PURE__ */ new Date()).toDateString()
        ).length;
        const overdueProjects = this.projects.filter((p) => p.isOverdue).length;
        const totalProgress = this.projects.reduce((sum, p) => sum + p.progress, 0) / Math.max(this.projects.length, 1);
        return {
          activeProjects,
          completedToday,
          overdueProjects,
          totalProgress: Math.round(totalProgress)
        };
      }
      async getProjectByMagicLink(magicLink) {
        return this.projects.find((p) => p.magicLink === magicLink);
      }
      async regenerateMagicLink(id) {
        const project = this.projects.find((p) => p.id === id);
        if (project) {
          project.magicLink = crypto.randomUUID();
        }
        return project;
      }
      async createEmailSubscriber(subscriber) {
        const emailSubscriber = {
          id: this.idCounter++,
          ...subscriber,
          firstName: subscriber.firstName || null,
          lastName: subscriber.lastName || null,
          isActive: subscriber.isActive !== void 0 ? subscriber.isActive : true,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.emailSubscribers.push(emailSubscriber);
        return emailSubscriber;
      }
      async getEmailSubscriber(id) {
        return this.emailSubscribers.find((s) => s.id === id);
      }
      async getEmailSubscribers() {
        return this.emailSubscribers;
      }
      async createEmailCampaignSend(send) {
        const campaignSend = {
          id: this.idCounter++,
          ...send,
          isOpened: send.isOpened || null,
          isClicked: send.isClicked || null,
          sentAt: /* @__PURE__ */ new Date()
        };
        this.emailCampaignSends.push(campaignSend);
        return campaignSend;
      }
      async getEmailCampaignSends(subscriberId) {
        if (subscriberId) {
          return this.emailCampaignSends.filter((s) => s.subscriberId === subscriberId);
        }
        return this.emailCampaignSends;
      }
      async createChatSession(session) {
        const chatSession = {
          id: this.idCounter++,
          ...session,
          visitorEmail: session.visitorEmail || null,
          visitorName: session.visitorName || null,
          isActive: session.isActive !== void 0 ? session.isActive : true,
          startedAt: /* @__PURE__ */ new Date(),
          endedAt: null
        };
        this.chatSessions.push(chatSession);
        return chatSession;
      }
      async getChatSessions() {
        return this.chatSessions;
      }
      async getChatSession(sessionId) {
        return this.chatSessions.find((s) => s.sessionId === sessionId);
      }
      async endChatSession(sessionId) {
        const session = this.chatSessions.find((s) => s.sessionId === sessionId);
        if (session) {
          session.isActive = false;
          session.endedAt = /* @__PURE__ */ new Date();
        }
        return session;
      }
      async createChatMessage(message) {
        const chatMessage = {
          id: this.idCounter++,
          ...message,
          senderName: message.senderName || null,
          timestamp: /* @__PURE__ */ new Date()
        };
        this.chatMessages.push(chatMessage);
        return chatMessage;
      }
      async getChatMessages(sessionId) {
        return this.chatMessages.filter((m) => m.sessionId === sessionId);
      }
    };
    DatabaseStorage = class {
      async createLead(insertLead) {
        const [lead] = await db.insert(leads).values(insertLead).returning();
        return lead;
      }
      async getLeads() {
        return await db.select().from(leads);
      }
      async createProject(insertProject) {
        const magicLink = crypto.randomUUID();
        const [project] = await db.insert(projects).values({
          ...insertProject,
          magicLink
        }).returning();
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
      async updateProject(id, updates) {
        const [project] = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
        return project || void 0;
      }
      async updateProjectTimestamps(id, updates) {
        const [project] = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
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
      async createProjectLog(insertProjectLog) {
        const [log2] = await db.insert(projectLogs).values(insertProjectLog).returning();
        return log2;
      }
      async getProjectLogs(projectId) {
        return await db.select().from(projectLogs).where(eq(projectLogs.projectId, projectId));
      }
      async createMilestone(insertMilestone) {
        const [milestone] = await db.insert(milestones).values(insertMilestone).returning();
        return milestone;
      }
      async getMilestones(projectId) {
        return await db.select().from(milestones).where(eq(milestones.projectId, projectId)).orderBy(asc(milestones.createdAt));
      }
      async updateMilestone(id, updates) {
        const [milestone] = await db.update(milestones).set(updates).where(eq(milestones.id, id)).returning();
        return milestone || void 0;
      }
      async getDashboardMetrics() {
        const allProjects = await db.select().from(projects);
        const activeProjects = allProjects.filter((p) => p.status !== "completed").length;
        const overdueProjects = allProjects.filter((p) => p.isOverdue).length;
        const totalProgress = allProjects.length > 0 ? Math.round(allProjects.reduce((sum, p) => sum + p.progress, 0) / allProjects.length) : 0;
        const completedToday = allProjects.filter(
          (p) => p.status === "completed" && p.completedAt && new Date(p.completedAt).toDateString() === (/* @__PURE__ */ new Date()).toDateString()
        ).length;
        return {
          activeProjects,
          completedToday,
          overdueProjects,
          totalProgress
        };
      }
      async getProjectByMagicLink(magicLink) {
        const [project] = await db.select().from(projects).where(eq(projects.magicLink, magicLink));
        return project || void 0;
      }
      async regenerateMagicLink(id) {
        const newMagicLink = crypto.randomUUID();
        const [project] = await db.update(projects).set({ magicLink: newMagicLink }).where(eq(projects.id, id)).returning();
        return project || void 0;
      }
      async createEmailSubscriber(insertSubscriber) {
        const [subscriber] = await db.insert(emailSubscribers).values(insertSubscriber).returning();
        return subscriber;
      }
      async getEmailSubscriber(id) {
        const [subscriber] = await db.select().from(emailSubscribers).where(eq(emailSubscribers.id, id));
        return subscriber || void 0;
      }
      async getEmailSubscribers() {
        return await db.select().from(emailSubscribers);
      }
      async createEmailCampaignSend(insertSend) {
        const [send] = await db.insert(emailCampaignSends).values(insertSend).returning();
        return send;
      }
      async getEmailCampaignSends(subscriberId) {
        if (subscriberId) {
          return await db.select().from(emailCampaignSends).where(eq(emailCampaignSends.subscriberId, subscriberId));
        }
        return await db.select().from(emailCampaignSends);
      }
      async createChatSession(insertSession) {
        const [session] = await db.insert(chatSessions).values(insertSession).returning();
        return session;
      }
      async getChatSessions() {
        return await db.select().from(chatSessions).orderBy(asc(chatSessions.startedAt));
      }
      async getChatSession(sessionId) {
        const [session] = await db.select().from(chatSessions).where(eq(chatSessions.sessionId, sessionId));
        return session || void 0;
      }
      async endChatSession(sessionId) {
        const [session] = await db.update(chatSessions).set({
          isActive: false,
          endedAt: /* @__PURE__ */ new Date()
        }).where(eq(chatSessions.sessionId, sessionId)).returning();
        return session || void 0;
      }
      async createChatMessage(insertMessage) {
        const [message] = await db.insert(chatMessages).values(insertMessage).returning();
        return message;
      }
      async getChatMessages(sessionId) {
        return await db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(asc(chatMessages.timestamp));
      }
    };
    storageInstance = null;
    storage = {
      async createLead(lead) {
        const store = await getStorage();
        return store.createLead(lead);
      },
      async getLeads() {
        const store = await getStorage();
        return store.getLeads();
      },
      async createProject(project) {
        const store = await getStorage();
        return store.createProject(project);
      },
      async getProjects() {
        const store = await getStorage();
        return store.getProjects();
      },
      async getProject(id) {
        const store = await getStorage();
        return store.getProject(id);
      },
      async updateProjectProgress(id, progress) {
        const store = await getStorage();
        return store.updateProjectProgress(id, progress);
      },
      async updateProject(id, updates) {
        const store = await getStorage();
        return store.updateProject(id, updates);
      },
      async updateProjectTimestamps(id, updates) {
        const store = await getStorage();
        return store.updateProjectTimestamps(id, updates);
      },
      async getTestimonials() {
        const store = await getStorage();
        return store.getTestimonials();
      },
      async createTestimonial(testimonial) {
        const store = await getStorage();
        return store.createTestimonial(testimonial);
      },
      async createEstimate(estimate) {
        const store = await getStorage();
        return store.createEstimate(estimate);
      },
      async getEstimates() {
        const store = await getStorage();
        return store.getEstimates();
      },
      async getEstimate(id) {
        const store = await getStorage();
        return store.getEstimate(id);
      },
      async createMessage(message) {
        const store = await getStorage();
        return store.createMessage(message);
      },
      async getMessages(projectId) {
        const store = await getStorage();
        return store.getMessages(projectId);
      },
      async createProjectLog(log2) {
        const store = await getStorage();
        return store.createProjectLog(log2);
      },
      async getProjectLogs(projectId) {
        const store = await getStorage();
        return store.getProjectLogs(projectId);
      },
      async createMilestone(milestone) {
        const store = await getStorage();
        return store.createMilestone(milestone);
      },
      async getMilestones(projectId) {
        const store = await getStorage();
        return store.getMilestones(projectId);
      },
      async updateMilestone(id, updates) {
        const store = await getStorage();
        return store.updateMilestone(id, updates);
      },
      async getDashboardMetrics() {
        const store = await getStorage();
        return store.getDashboardMetrics();
      },
      async getProjectByMagicLink(magicLink) {
        const store = await getStorage();
        return store.getProjectByMagicLink(magicLink);
      },
      async regenerateMagicLink(id) {
        const store = await getStorage();
        return store.regenerateMagicLink(id);
      },
      async createEmailSubscriber(subscriber) {
        const store = await getStorage();
        return store.createEmailSubscriber(subscriber);
      },
      async getEmailSubscriber(id) {
        const store = await getStorage();
        return store.getEmailSubscriber(id);
      },
      async getEmailSubscribers() {
        const store = await getStorage();
        return store.getEmailSubscribers();
      },
      async createEmailCampaignSend(send) {
        const store = await getStorage();
        return store.createEmailCampaignSend(send);
      },
      async getEmailCampaignSends(subscriberId) {
        const store = await getStorage();
        return store.getEmailCampaignSends(subscriberId);
      },
      async createChatSession(session) {
        const store = await getStorage();
        return store.createChatSession(session);
      },
      async getChatSessions() {
        const store = await getStorage();
        return store.getChatSessions();
      },
      async getChatSession(sessionId) {
        const store = await getStorage();
        return store.getChatSession(sessionId);
      },
      async endChatSession(sessionId) {
        const store = await getStorage();
        return store.endChatSession(sessionId);
      },
      async createChatMessage(message) {
        const store = await getStorage();
        return store.createChatMessage(message);
      },
      async getChatMessages(sessionId) {
        const store = await getStorage();
        return store.getChatMessages(sessionId);
      }
    };
  }
});

// server/email.ts
async function sendEmailOctopusEmail(emailData) {
  const service = new EmailService();
  return await service.sendQuoteNotification({
    email: emailData.to,
    firstName: "Customer",
    lastName: "",
    phone: "",
    consent: true,
    serviceType: "Email Campaign",
    projectDetails: `Subject: ${emailData.subject}

${emailData.html || emailData.text || ""}`
  });
}
var EmailService, emailService;
var init_email = __esm({
  "server/email.ts"() {
    "use strict";
    EmailService = class {
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
      // Test email functionality
      async sendTestEmail() {
        const testLead = {
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          phone: "555-0123",
          serviceType: "testing",
          projectDetails: "This is a test email to verify EmailOctopus integration is working correctly.",
          consent: true
        };
        console.log("Sending test email...");
        return await this.sendQuoteNotification(testLead);
      }
    };
    emailService = new EmailService();
  }
});

// server/email-drip.ts
var email_drip_exports = {};
__export(email_drip_exports, {
  scheduleEmailDripCampaign: () => scheduleEmailDripCampaign,
  sendDripEmail: () => sendDripEmail,
  startEmailDripProcessor: () => startEmailDripProcessor
});
async function scheduleEmailDripCampaign(subscriberData) {
  try {
    const subscriber = await storage.createEmailSubscriber(subscriberData);
    await sendDripEmail(subscriber.id, "welcome");
    setTimeout(async () => {
      try {
        await sendDripEmail(subscriber.id, "day2_portfolio");
      } catch (error) {
        console.error("Failed to send day 2 email:", error);
      }
    }, 2 * 24 * 60 * 60 * 1e3);
    setTimeout(async () => {
      try {
        await sendDripEmail(subscriber.id, "day5_consultation");
      } catch (error) {
        console.error("Failed to send day 5 email:", error);
      }
    }, 5 * 24 * 60 * 60 * 1e3);
    console.log(`Email drip campaign scheduled for ${subscriberData.email}`);
    return subscriber;
  } catch (error) {
    console.error("Failed to schedule email drip campaign:", error);
    throw error;
  }
}
async function sendDripEmail(subscriberId, campaignType) {
  try {
    const subscriber = await storage.getEmailSubscriber(subscriberId);
    if (!subscriber || !subscriber.isActive) {
      console.log(`Subscriber ${subscriberId} not found or inactive`);
      return;
    }
    const template = EMAIL_TEMPLATES[campaignType];
    if (!template) {
      throw new Error(`Unknown campaign type: ${campaignType}`);
    }
    let personalizedHtml = template.html;
    if (subscriber.firstName) {
      personalizedHtml = personalizedHtml.replace(/Hi there/g, `Hi ${subscriber.firstName}`);
    }
    const success = await sendEmailOctopusEmail({
      to: subscriber.email,
      subject: template.subject,
      html: personalizedHtml
    });
    if (success) {
      await storage.createEmailCampaignSend({
        subscriberId: subscriber.id,
        campaignType,
        emailSubject: template.subject
      });
      console.log(`Sent ${campaignType} email to ${subscriber.email}`);
    } else {
      console.error(`Failed to send ${campaignType} email to ${subscriber.email}`);
    }
    return success;
  } catch (error) {
    console.error(`Error sending drip email:`, error);
    throw error;
  }
}
function startEmailDripProcessor() {
  setInterval(async () => {
    try {
      console.log("Email drip processor running...");
    } catch (error) {
      console.error("Email drip processor error:", error);
    }
  }, 6e4);
}
var EMAIL_TEMPLATES;
var init_email_drip = __esm({
  "server/email-drip.ts"() {
    "use strict";
    init_storage();
    init_email();
    EMAIL_TEMPLATES = {
      welcome: {
        subject: "Welcome to Resilience Solutions - Your Remodeling Journey Begins!",
        html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <header style="background-color: #1a365d; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Welcome to Resilience Solutions!</h1>
          <p style="margin: 10px 0 0 0; color: #e2e8f0;">Quality Remodeling & Finishing</p>
        </header>
        
        <div style="padding: 30px; background-color: #f7fafc;">
          <h2 style="color: #1a365d; margin-bottom: 20px;">Thank you for your interest!</h2>
          
          <p>We're thrilled that you're considering Resilience Solutions for your remodeling project. Our team is committed to transforming your vision into reality with exceptional craftsmanship and attention to detail.</p>
          
          <div style="background-color: white; padding: 20px; border-left: 4px solid #ed8936; margin: 20px 0;">
            <h3 style="color: #1a365d; margin-top: 0;">What happens next?</h3>
            <ol style="color: #4a5568;">
              <li>Our team will review your project details</li>
              <li>We'll prepare a customized proposal for your needs</li>
              <li>Schedule your free consultation within 48 hours</li>
              <li>Begin planning your dream space transformation</li>
            </ol>
          </div>
          
          <p>In the meantime, you'll receive exclusive updates about our latest projects and helpful remodeling tips over the next few days.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="tel:+1234567890" style="background-color: #ed8936; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Call Us: (123) 456-7890
            </a>
          </div>
        </div>
        
        <footer style="background-color: #2d3748; color: #a0aec0; padding: 20px; text-align: center;">
          <p style="margin: 0;">Resilience Solutions - Transforming Homes, Building Dreams</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">Visit our website or call us anytime for questions</p>
        </footer>
      </div>
    `
      },
      day2_portfolio: {
        subject: "See What We've Built - Resilience Solutions Project Gallery",
        html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <header style="background-color: #1a365d; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Our Recent Projects</h1>
          <p style="margin: 10px 0 0 0; color: #e2e8f0;">Quality You Can See</p>
        </header>
        
        <div style="padding: 30px; background-color: #f7fafc;">
          <h2 style="color: #1a365d; margin-bottom: 20px;">Transformations That Inspire</h2>
          
          <p>We thought you'd love to see some of our recent work! These projects showcase the quality and attention to detail that Resilience Solutions brings to every remodeling job.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a365d; margin-top: 0;">\u2B50 Recent Client Review</h3>
            <blockquote style="font-style: italic; color: #4a5568; border-left: 4px solid #ed8936; padding-left: 15px; margin: 15px 0;">
              "The team at Resilience Solutions exceeded our expectations! Our kitchen remodel was completed on time, within budget, and the quality is outstanding. We couldn't be happier!"
            </blockquote>
            <p style="color: #718096; margin: 0;"><strong>- Sarah & Mike Johnson</strong>, Kitchen Remodel</p>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a365d; margin-top: 0;">\u{1F3E0} Project Highlights</h3>
            <ul style="color: #4a5568;">
              <li><strong>Modern Kitchen Renovation</strong> - Complete transformation with custom cabinets</li>
              <li><strong>Master Bathroom Remodel</strong> - Luxury finishes and smart storage solutions</li>
              <li><strong>Open Concept Living</strong> - Removed walls to create spacious family areas</li>
              <li><strong>Basement Finishing</strong> - Added valuable living space and entertainment area</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: #ed8936; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px 10px 0;">
              View Full Gallery
            </a>
            <a href="#" style="background-color: #1a365d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px 10px 0;">
              Get Your Quote
            </a>
          </div>
        </div>
        
        <footer style="background-color: #2d3748; color: #a0aec0; padding: 20px; text-align: center;">
          <p style="margin: 0;">Ready to start your project? We're here to help!</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">Call (123) 456-7890 | Email: info@resilience-solutions.com</p>
        </footer>
      </div>
    `
      },
      day5_consultation: {
        subject: "Ready to Start? Book Your Free Consultation - Resilience Solutions",
        html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <header style="background-color: #ed8936; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Your Free Consultation Awaits!</h1>
          <p style="margin: 10px 0 0 0; color: #fed7aa;">Let's Bring Your Vision to Life</p>
        </header>
        
        <div style="padding: 30px; background-color: #f7fafc;">
          <h2 style="color: #1a365d; margin-bottom: 20px;">Ready to Transform Your Space?</h2>
          
          <p>It's been a few days since you first reached out, and we hope you've enjoyed seeing what Resilience Solutions can do for homeowners like you. Now it's time to take the next step!</p>
          
          <div style="background-color: #ed8936; color: white; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <h3 style="margin: 0 0 15px 0; font-size: 24px;">\u{1F3AF} Special Offer</h3>
            <p style="margin: 0; font-size: 18px;">Book your consultation this week and receive a <strong>FREE 3D design rendering</strong> of your project!</p>
            <p style="margin: 10px 0 0 0; font-size: 14px;">*$500 value - Limited time offer</p>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a365d; margin-top: 0;">What You'll Get In Your Free Consultation:</h3>
            <ul style="color: #4a5568;">
              <li>\u2705 Detailed project assessment and planning</li>
              <li>\u2705 Material recommendations and options</li>
              <li>\u2705 Accurate timeline and budget estimates</li>
              <li>\u2705 3D rendering of your finished space (limited time)</li>
              <li>\u2705 No-obligation proposal tailored to your needs</li>
            </ul>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a365d; margin-top: 0;">\u{1F4C5} Easy Scheduling Options:</h3>
            <p style="color: #4a5568; margin-bottom: 15px;">Choose what works best for you:</p>
            <ul style="color: #4a5568;">
              <li><strong>In-Home Visit:</strong> We come to you (most popular)</li>
              <li><strong>Video Consultation:</strong> Convenient virtual meeting</li>
              <li><strong>Showroom Visit:</strong> See materials and finishes in person</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="tel:+1234567890" style="background-color: #ed8936; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 18px; font-weight: bold; margin: 0 10px 10px 0;">
              \u{1F4DE} Call Now: (123) 456-7890
            </a>
            <br>
            <a href="#" style="background-color: #1a365d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 10px 0 0;">
              \u{1F4E7} Email Us
            </a>
            <a href="#" style="border: 2px solid #1a365d; color: #1a365d; padding: 10px 22px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 10px 0 0;">
              \u{1F310} Schedule Online
            </a>
          </div>
          
          <div style="background-color: #fef5e7; border: 1px solid #f6ad55; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #744210; text-align: center;"><strong>\u23F0 Don't Wait!</strong> Our calendar fills up quickly. The sooner we meet, the sooner you can start enjoying your beautiful new space.</p>
          </div>
        </div>
        
        <footer style="background-color: #2d3748; color: #a0aec0; padding: 20px; text-align: center;">
          <p style="margin: 0;">Resilience Solutions - Your Local Remodeling Experts</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">Licensed | Insured | 2-Year Warranty on All Work</p>
        </footer>
      </div>
    `
      }
    };
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage();
init_schema();
init_email();
import { createServer } from "http";
import { z } from "zod";
async function registerRoutes(app2) {
  app2.post("/api/leads", async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      await emailService.sendQuoteNotification(leadData);
      try {
        const { scheduleEmailDripCampaign: scheduleEmailDripCampaign2 } = await Promise.resolve().then(() => (init_email_drip(), email_drip_exports));
        await scheduleEmailDripCampaign2({
          email: leadData.email,
          firstName: leadData.firstName,
          lastName: leadData.lastName,
          subscriptionSource: "quote_request"
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
  app2.get("/api/estimates", async (req, res) => {
    try {
      const estimates2 = await storage.getEstimates();
      res.json(estimates2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch estimates" });
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
  app2.post("/api/testimonials", async (req, res) => {
    try {
      const testimonial = await storage.createTestimonial(req.body);
      res.json(testimonial);
    } catch (error) {
      res.status(500).json({ message: "Failed to create testimonial" });
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
  app2.post("/api/projects", async (req, res) => {
    try {
      const project = await storage.createProject(req.body);
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to create project" });
    }
  });
  app2.patch("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`Updating project ${id} with data:`, req.body);
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
  app2.post("/api/test-email", async (req, res) => {
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/admin-routes.ts
init_storage();
init_schema();
import { z as z2 } from "zod";
function registerAdminRoutes(app2) {
  app2.patch("/api/projects/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { progress } = req.body;
      if (typeof progress !== "number" || progress < 0 || progress > 100) {
        res.status(400).json({ message: "Progress must be between 0 and 100" });
        return;
      }
      const currentProject = await storage.getProject(id);
      if (!currentProject) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      const project = await storage.updateProject(id, { progress });
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
  app2.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      await storage.createProjectLog({
        projectId: project.id,
        action: "Project Created",
        details: `New project "${project.clientName} - ${project.projectType}" created`,
        userId: "admin"
      });
      res.json(project);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid project data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create project" });
      }
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
  app2.patch("/api/projects/:id", async (req, res) => {
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
  app2.patch("/api/projects/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const validStatuses = ["consultation", "in-progress", "completed", "on-hold"];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ message: "Invalid status" });
        return;
      }
      const currentProject = await storage.getProject(id);
      if (!currentProject) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      const updated = await storage.updateProject(id, { status });
      if (status === "completed" && currentProject.status !== "completed") {
        await storage.updateProjectTimestamps(id, { completedAt: /* @__PURE__ */ new Date() });
      }
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
  app2.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });
  app2.get("/api/projects/:id/logs", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const logs = await storage.getProjectLogs(id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project logs" });
    }
  });
  app2.get("/api/projects/:id/milestones", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const milestones2 = await storage.getMilestones(id);
      res.json(milestones2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });
  app2.post("/api/projects/:id/milestones", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const milestoneData = insertMilestoneSchema.parse({
        ...req.body,
        projectId
      });
      const milestone = await storage.createMilestone(milestoneData);
      res.json(milestone);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid milestone data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create milestone" });
      }
    }
  });
  app2.post("/api/projects/:id/regenerate-link", async (req, res) => {
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
  app2.get("/api/track/:magicLink", async (req, res) => {
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
  app2.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });
  app2.get("/api/messages", async (req, res) => {
    try {
      const messages2 = await storage.getMessages();
      res.json(messages2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create message" });
      }
    }
  });
}

// server/chat-routes.ts
init_storage();
init_schema();
import { z as z3 } from "zod";
function registerChatRoutes(app2) {
  app2.post("/api/chat/sessions", async (req, res) => {
    try {
      const sessionData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(sessionData);
      res.json(session);
    } catch (error) {
      if (error instanceof z3.ZodError) {
        res.status(400).json({ message: "Invalid session data", errors: error.errors });
        return;
      }
      console.error("Failed to create chat session:", error);
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });
  app2.get("/api/chat/sessions", async (req, res) => {
    try {
      const sessions = await storage.getChatSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Failed to get chat sessions:", error);
      res.status(500).json({ message: "Failed to get chat sessions" });
    }
  });
  app2.post("/api/chat/messages", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(messageData);
      res.json(message);
    } catch (error) {
      if (error instanceof z3.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
        return;
      }
      console.error("Failed to create chat message:", error);
      res.status(500).json({ message: "Failed to create chat message" });
    }
  });
  app2.get("/api/chat/messages/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages2 = await storage.getChatMessages(sessionId);
      res.json(messages2);
    } catch (error) {
      console.error("Failed to get chat messages:", error);
      res.status(500).json({ message: "Failed to get chat messages" });
    }
  });
  app2.patch("/api/chat/sessions/:sessionId/end", async (req, res) => {
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
  registerAdminRoutes(app);
  registerChatRoutes(app);
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
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime()
    });
  });
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
