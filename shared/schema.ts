import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  serviceType: text("service_type"),
  projectDetails: text("project_details"),
  consent: boolean("consent").notNull().default(false),
});

export const projects = pgTable("projects", {
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  rating: integer("rating").notNull().default(5),
  review: text("review").notNull(),
});

export const estimates = pgTable("estimates", {
  id: serial("id").primaryKey(),
  projectType: text("project_type").notNull(),
  roomSize: text("room_size"),
  budget: text("budget"),
  timeline: text("timeline"),
  contactInfo: text("contact_info").notNull(),
  estimatedCost: integer("estimated_cost"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const projectLogs = pgTable("project_logs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  action: text("action").notNull(),
  details: text("details"),
  userId: text("user_id").notNull().default("admin"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: text("due_date"),
  completedDate: text("completed_date"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Email drip campaign subscribers
export const emailSubscribers = pgTable("email_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  subscriptionSource: text("subscription_source").notNull(), // 'quote_request', 'newsletter', 'contact_form'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Email drip campaign sends tracking
export const emailCampaignSends = pgTable("email_campaign_sends", {
  id: serial("id").primaryKey(),
  subscriberId: integer("subscriber_id").references(() => emailSubscribers.id).notNull(),
  campaignType: text("campaign_type").notNull(), // 'welcome', 'day2_portfolio', 'day5_consultation'
  emailSubject: text("email_subject").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  isOpened: boolean("is_opened").default(false),
  isClicked: boolean("is_clicked").default(false),
});

// Live chat messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  senderType: text("sender_type").notNull(), // 'visitor', 'admin'
  senderName: text("sender_name"),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Chat sessions
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  visitorEmail: text("visitor_email"),
  visitorName: text("visitor_name"),
  isActive: boolean("is_active").notNull().default(true),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  magicLink: true,
  completedAt: true,
  createdAt: true,
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
});

export const insertEstimateSchema = createInsertSchema(estimates).omit({
  id: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertProjectLogSchema = createInsertSchema(projectLogs).omit({
  id: true,
  timestamp: true,
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  createdAt: true,
});

export const insertEmailSubscriberSchema = createInsertSchema(emailSubscribers).omit({
  id: true,
  createdAt: true,
});

export const insertEmailCampaignSendSchema = createInsertSchema(emailCampaignSends).omit({
  id: true,
  sentAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  startedAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

export type InsertEstimate = z.infer<typeof insertEstimateSchema>;
export type Estimate = typeof estimates.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertEmailSubscriber = z.infer<typeof insertEmailSubscriberSchema>;
export type EmailSubscriber = typeof emailSubscribers.$inferSelect;

export type InsertEmailCampaignSend = z.infer<typeof insertEmailCampaignSendSchema>;
export type EmailCampaignSend = typeof emailCampaignSends.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;

export type InsertProjectLog = z.infer<typeof insertProjectLogSchema>;
export type ProjectLog = typeof projectLogs.$inferSelect;

export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Milestone = typeof milestones.$inferSelect;
