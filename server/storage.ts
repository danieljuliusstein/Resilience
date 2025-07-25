import { 
  leads, 
  projects, 
  testimonials, 
  estimates,
  messages,
  projectLogs,
  milestones,
  emailSubscribers,
  emailCampaignSends,
  chatMessages,
  chatSessions,
  type Lead, 
  type InsertLead,
  type Project,
  type InsertProject,
  type Testimonial,
  type InsertTestimonial,
  type Estimate,
  type InsertEstimate,
  type Message,
  type InsertMessage,
  type ProjectLog,
  type InsertProjectLog,
  type Milestone,
  type InsertMilestone,
  type EmailSubscriber,
  type InsertEmailSubscriber,
  type EmailCampaignSend,
  type InsertEmailCampaignSend,
  type ChatMessage,
  type InsertChatMessage,
  type ChatSession,
  type InsertChatSession
} from "@shared/schema";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  // Lead management
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
  
  // Project management
  createProject(project: InsertProject): Promise<Project>;
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  updateProjectProgress(id: number, progress: number): Promise<Project | undefined>;
  
  // Testimonials
  getTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  // Estimates
  createEstimate(estimate: InsertEstimate): Promise<Estimate>;
  getEstimates(): Promise<Estimate[]>;
  getEstimate(id: number): Promise<Estimate | undefined>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(projectId?: number): Promise<Message[]>;
  
  // Project updates
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined>;
  getProject(id: number): Promise<Project | undefined>;
  
  // Project logs
  createProjectLog(log: InsertProjectLog): Promise<ProjectLog>;
  getProjectLogs(projectId: number): Promise<ProjectLog[]>;
  
  // Milestones
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  getMilestones(projectId: number): Promise<Milestone[]>;
  updateMilestone(id: number, updates: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  
  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    activeProjects: number;
    completedToday: number;
    overdueProjects: number;
    totalProgress: number;
  }>;
  
  // Magic links
  getProjectByMagicLink(magicLink: string): Promise<Project | undefined>;
  regenerateMagicLink(id: number): Promise<Project | undefined>;
  
  // Email subscribers and drip campaigns
  createEmailSubscriber(subscriber: InsertEmailSubscriber): Promise<EmailSubscriber>;
  getEmailSubscriber(id: number): Promise<EmailSubscriber | undefined>;
  getEmailSubscribers(): Promise<EmailSubscriber[]>;
  createEmailCampaignSend(send: InsertEmailCampaignSend): Promise<EmailCampaignSend>;
  getEmailCampaignSends(subscriberId?: number): Promise<EmailCampaignSend[]>;
  
  // Chat functionality
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSessions(): Promise<ChatSession[]>;
  getChatSession(sessionId: string): Promise<ChatSession | undefined>;
  endChatSession(sessionId: string): Promise<ChatSession | undefined>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<Lead | undefined> {
    const [user] = await db.select().from(leads).where(eq(leads.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<Lead | undefined> {
    const [user] = await db.select().from(leads).where(eq(leads.firstName, username));
    return user || undefined;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values(insertLead)
      .returning();
    return lead;
  }

  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    // Generate magic link UUID
    const magicLink = crypto.randomUUID();
    
    const [project] = await db
      .insert(projects)
      .values({
        ...insertProject,
        magicLink
      })
      .returning();
    return project;
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async updateProjectProgress(id: number, progress: number): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ progress })
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async getTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db
      .insert(testimonials)
      .values(insertTestimonial)
      .returning();
    return testimonial;
  }

  async createEstimate(insertEstimate: InsertEstimate): Promise<Estimate> {
    const [estimate] = await db
      .insert(estimates)
      .values(insertEstimate)
      .returning();
    return estimate;
  }

  async getEstimates(): Promise<Estimate[]> {
    return await db.select().from(estimates);
  }

  async getEstimate(id: number): Promise<Estimate | undefined> {
    const [estimate] = await db.select().from(estimates).where(eq(estimates.id, id));
    return estimate || undefined;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getMessages(projectId?: number): Promise<Message[]> {
    if (projectId) {
      return await db.select().from(messages).where(eq(messages.projectId, projectId));
    }
    return await db.select().from(messages);
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async createProjectLog(insertProjectLog: InsertProjectLog): Promise<ProjectLog> {
    const [log] = await db
      .insert(projectLogs)
      .values(insertProjectLog)
      .returning();
    return log;
  }

  async getProjectLogs(projectId: number): Promise<ProjectLog[]> {
    return await db.select().from(projectLogs).where(eq(projectLogs.projectId, projectId));
  }

  async createMilestone(insertMilestone: InsertMilestone): Promise<Milestone> {
    const [milestone] = await db
      .insert(milestones)
      .values(insertMilestone)
      .returning();
    return milestone;
  }

  async getMilestones(projectId: number): Promise<Milestone[]> {
    return await db.select().from(milestones).where(eq(milestones.projectId, projectId)).orderBy(asc(milestones.createdAt));
  }

  async updateMilestone(id: number, updates: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const [milestone] = await db
      .update(milestones)
      .set(updates)
      .where(eq(milestones.id, id))
      .returning();
    return milestone || undefined;
  }

  async getDashboardMetrics(): Promise<{
    activeProjects: number;
    completedToday: number;
    overdueProjects: number;
    totalProgress: number;
  }> {
    const allProjects = await db.select().from(projects);
    const activeProjects = allProjects.filter(p => p.status !== 'completed').length;
    const overdueProjects = allProjects.filter(p => p.isOverdue).length;
    const totalProgress = allProjects.length > 0 
      ? Math.round(allProjects.reduce((sum, p) => sum + p.progress, 0) / allProjects.length)
      : 0;
    
    // For completedToday, we'd need to track completion dates - simplified for now
    const completedToday = 0;

    return {
      activeProjects,
      completedToday,
      overdueProjects,
      totalProgress,
    };
  }

  async getProjectByMagicLink(magicLink: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.magicLink, magicLink));
    return project || undefined;
  }

  async regenerateMagicLink(id: number): Promise<Project | undefined> {
    const newMagicLink = crypto.randomUUID();
    const [project] = await db
      .update(projects)
      .set({ magicLink: newMagicLink })
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }
  
  // Email subscribers and drip campaigns
  async createEmailSubscriber(insertSubscriber: InsertEmailSubscriber): Promise<EmailSubscriber> {
    const [subscriber] = await db
      .insert(emailSubscribers)
      .values(insertSubscriber)
      .returning();
    return subscriber;
  }

  async getEmailSubscriber(id: number): Promise<EmailSubscriber | undefined> {
    const [subscriber] = await db
      .select()
      .from(emailSubscribers)
      .where(eq(emailSubscribers.id, id));
    return subscriber || undefined;
  }

  async getEmailSubscribers(): Promise<EmailSubscriber[]> {
    return await db.select().from(emailSubscribers);
  }

  async createEmailCampaignSend(insertSend: InsertEmailCampaignSend): Promise<EmailCampaignSend> {
    const [send] = await db
      .insert(emailCampaignSends)
      .values(insertSend)
      .returning();
    return send;
  }

  async getEmailCampaignSends(subscriberId?: number): Promise<EmailCampaignSend[]> {
    if (subscriberId) {
      return await db.select().from(emailCampaignSends).where(eq(emailCampaignSends.subscriberId, subscriberId));
    }
    return await db.select().from(emailCampaignSends);
  }
  
  // Chat functionality
  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const [session] = await db
      .insert(chatSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getChatSessions(): Promise<ChatSession[]> {
    return await db.select().from(chatSessions).orderBy(asc(chatSessions.startedAt));
  }

  async getChatSession(sessionId: string): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.sessionId, sessionId));
    return session || undefined;
  }

  async endChatSession(sessionId: string): Promise<ChatSession | undefined> {
    const [session] = await db
      .update(chatSessions)
      .set({ 
        isActive: false,
        endedAt: new Date()
      })
      .where(eq(chatSessions.sessionId, sessionId))
      .returning();
    return session || undefined;
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages) 
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.timestamp));
  }
}

export const storage = new DatabaseStorage();
