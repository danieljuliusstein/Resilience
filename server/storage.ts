import { 
  leads, 
  projects, 
  testimonials, 
  estimates,
  messages,
  projectLogs,
  milestones,
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
  type InsertMilestone
} from "@shared/schema";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";

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

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
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
}

export const storage = new DatabaseStorage();
