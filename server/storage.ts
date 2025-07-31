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
  updateProjectTimestamps(id: number, updates: { completedAt?: Date | null }): Promise<Project | undefined>;
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

// Mock storage for development when database is not available
export class MockStorage implements IStorage {
  private leads: Lead[] = [];
  private projects: Project[] = [
    {
      id: 1,
      clientName: "John Doe",
      clientEmail: "john@example.com",
      clientPhone: "(555) 123-4567",
      projectType: "remodeling",
      status: "in-progress",
      budget: 15000,
      progress: 65,
      projectManager: "Sarah Johnson",
      estimatedCompletion: "2024-02-15",
      tags: ["🟢 On-Time"],
      isOverdue: false,
      address: "123 Main St, Anytown, USA",
      notes: "Kitchen remodel with custom cabinets",
      magicLink: "sample-magic-link-1",
      completedAt: null,
      createdAt: new Date()
    }
  ];
  private testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "Austin, TX",
      rating: 5,
      review: "Outstanding work! The team transformed our kitchen beyond our expectations."
    }
  ];
  private estimates: Estimate[] = [];
  private messages: Message[] = [];
  private projectLogs: ProjectLog[] = [];
  private milestones: Milestone[] = [];
  private emailSubscribers: EmailSubscriber[] = [];
  private emailCampaignSends: EmailCampaignSend[] = [];
  private chatMessages: ChatMessage[] = [];
  private chatSessions: ChatSession[] = [];
  private idCounter = 2;

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const lead: Lead = {
      id: this.idCounter++,
      ...insertLead,
      serviceType: insertLead.serviceType || null,
      projectDetails: insertLead.projectDetails || null,
      consent: insertLead.consent || false
    };
    this.leads.push(lead);
    return lead;
  }

  async getLeads(): Promise<Lead[]> {
    return this.leads;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const project: Project = {
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
      createdAt: new Date()
    };
    this.projects.push(project);
    return project;
  }

  async getProjects(): Promise<Project[]> {
    return this.projects;
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.find(p => p.id === id);
  }

  async updateProjectProgress(id: number, progress: number): Promise<Project | undefined> {
    const project = this.projects.find(p => p.id === id);
    if (project) {
      project.progress = progress;
    }
    return project;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.find(p => p.id === id);
    if (project) {
      Object.assign(project, updates);
    }
    return project;
  }

  async updateProjectTimestamps(id: number, updates: { completedAt?: Date | null }): Promise<Project | undefined> {
    const project = this.projects.find(p => p.id === id);
    if (project) {
      if (updates.completedAt !== undefined) {
        project.completedAt = updates.completedAt;
      }
    }
    return project;
  }

  async getTestimonials(): Promise<Testimonial[]> {
    return this.testimonials;
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const testimonial: Testimonial = {
      id: this.idCounter++,
      ...insertTestimonial,
      rating: insertTestimonial.rating || 5
    };
    this.testimonials.push(testimonial);
    return testimonial;
  }

  async createEstimate(insertEstimate: InsertEstimate): Promise<Estimate> {
    const estimate: Estimate = {
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

  async getEstimates(): Promise<Estimate[]> {
    return this.estimates;
  }

  async getEstimate(id: number): Promise<Estimate | undefined> {
    return this.estimates.find(e => e.id === id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.idCounter++,
      ...insertMessage,
      projectId: insertMessage.projectId || null,
      timestamp: new Date()
    };
    this.messages.push(message);
    return message;
  }

  async getMessages(projectId?: number): Promise<Message[]> {
    if (projectId) {
      return this.messages.filter(m => m.projectId === projectId);
    }
    return this.messages;
  }

  async createProjectLog(log: InsertProjectLog): Promise<ProjectLog> {
    const projectLog: ProjectLog = {
      id: this.idCounter++,
      ...log,
      details: log.details || null,
      userId: log.userId || "admin",
      timestamp: new Date()
    };
    this.projectLogs.push(projectLog);
    return projectLog;
  }

  async getProjectLogs(projectId: number): Promise<ProjectLog[]> {
    return this.projectLogs.filter(l => l.projectId === projectId);
  }

  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const newMilestone: Milestone = {
      id: this.idCounter++,
      ...milestone,
      description: milestone.description || null,
      dueDate: milestone.dueDate || null,
      completedDate: milestone.completedDate || null,
      isCompleted: milestone.isCompleted || false,
      createdAt: new Date()
    };
    this.milestones.push(newMilestone);
    return newMilestone;
  }

  async getMilestones(projectId: number): Promise<Milestone[]> {
    return this.milestones.filter(m => m.projectId === projectId);
  }

  async updateMilestone(id: number, updates: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const milestone = this.milestones.find(m => m.id === id);
    if (milestone) {
      Object.assign(milestone, updates);
    }
    return milestone;
  }

  async getDashboardMetrics(): Promise<{
    activeProjects: number;
    completedToday: number;
    overdueProjects: number;
    totalProgress: number;
  }> {
    const activeProjects = this.projects.filter(p => p.status !== 'completed').length;
    const completedToday = this.projects.filter(p => 
      p.status === 'completed' && 
      p.completedAt && 
      new Date(p.completedAt).toDateString() === new Date().toDateString()
    ).length;
    const overdueProjects = this.projects.filter(p => p.isOverdue).length;
    const totalProgress = this.projects.reduce((sum, p) => sum + p.progress, 0) / Math.max(this.projects.length, 1);

    return {
      activeProjects,
      completedToday,
      overdueProjects,
      totalProgress: Math.round(totalProgress)
    };
  }

  async getProjectByMagicLink(magicLink: string): Promise<Project | undefined> {
    return this.projects.find(p => p.magicLink === magicLink);
  }

  async regenerateMagicLink(id: number): Promise<Project | undefined> {
    const project = this.projects.find(p => p.id === id);
    if (project) {
      project.magicLink = crypto.randomUUID();
    }
    return project;
  }

  async createEmailSubscriber(subscriber: InsertEmailSubscriber): Promise<EmailSubscriber> {
    const emailSubscriber: EmailSubscriber = {
      id: this.idCounter++,
      ...subscriber,
      firstName: subscriber.firstName || null,
      lastName: subscriber.lastName || null,
      isActive: subscriber.isActive !== undefined ? subscriber.isActive : true,
      createdAt: new Date()
    };
    this.emailSubscribers.push(emailSubscriber);
    return emailSubscriber;
  }

  async getEmailSubscriber(id: number): Promise<EmailSubscriber | undefined> {
    return this.emailSubscribers.find(s => s.id === id);
  }

  async getEmailSubscribers(): Promise<EmailSubscriber[]> {
    return this.emailSubscribers;
  }

  async createEmailCampaignSend(send: InsertEmailCampaignSend): Promise<EmailCampaignSend> {
    const campaignSend: EmailCampaignSend = {
      id: this.idCounter++,
      ...send,
      isOpened: send.isOpened || null,
      isClicked: send.isClicked || null,
      sentAt: new Date()
    };
    this.emailCampaignSends.push(campaignSend);
    return campaignSend;
  }

  async getEmailCampaignSends(subscriberId?: number): Promise<EmailCampaignSend[]> {
    if (subscriberId) {
      return this.emailCampaignSends.filter(s => s.subscriberId === subscriberId);
    }
    return this.emailCampaignSends;
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const chatSession: ChatSession = {
      id: this.idCounter++,
      ...session,
      visitorEmail: session.visitorEmail || null,
      visitorName: session.visitorName || null,
      isActive: session.isActive !== undefined ? session.isActive : true,
      startedAt: new Date(),
      endedAt: null
    };
    this.chatSessions.push(chatSession);
    return chatSession;
  }

  async getChatSessions(): Promise<ChatSession[]> {
    return this.chatSessions;
  }

  async getChatSession(sessionId: string): Promise<ChatSession | undefined> {
    return this.chatSessions.find(s => s.sessionId === sessionId);
  }

  async endChatSession(sessionId: string): Promise<ChatSession | undefined> {
    const session = this.chatSessions.find(s => s.sessionId === sessionId);
    if (session) {
      session.isActive = false;
      session.endedAt = new Date();
    }
    return session;
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const chatMessage: ChatMessage = {
      id: this.idCounter++,
      ...message,
      senderName: message.senderName || null,
      timestamp: new Date()
    };
    this.chatMessages.push(chatMessage);
    return chatMessage;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return this.chatMessages.filter(m => m.sessionId === sessionId);
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
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

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async updateProjectTimestamps(id: number, updates: { completedAt?: Date | null }): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set(updates)
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
    
    const completedToday = allProjects.filter(p => 
      p.status === 'completed' && 
      p.completedAt && 
      new Date(p.completedAt).toDateString() === new Date().toDateString()
    ).length;

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

// Create storage instance with fallback to mock storage if database is not available
let storageInstance: IStorage | null = null;

async function createStorageInstance(): Promise<IStorage> {
  if (storageInstance) {
    return storageInstance;
  }
  
  try {
    // Try to test database connection
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

// Export a function that returns the storage instance
export async function getStorage(): Promise<IStorage> {
  return await createStorageInstance();
}

// For backwards compatibility, export a storage object that lazy-loads
export const storage = {
  async createLead(lead: InsertLead): Promise<Lead> {
    const store = await getStorage();
    return store.createLead(lead);
  },
  async getLeads(): Promise<Lead[]> {
    const store = await getStorage();
    return store.getLeads();
  },
  async createProject(project: InsertProject): Promise<Project> {
    const store = await getStorage();
    return store.createProject(project);
  },
  async getProjects(): Promise<Project[]> {
    const store = await getStorage();
    return store.getProjects();
  },
  async getProject(id: number): Promise<Project | undefined> {
    const store = await getStorage();
    return store.getProject(id);
  },
  async updateProjectProgress(id: number, progress: number): Promise<Project | undefined> {
    const store = await getStorage();
    return store.updateProjectProgress(id, progress);
  },
  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const store = await getStorage();
    return store.updateProject(id, updates);
  },
  async updateProjectTimestamps(id: number, updates: { completedAt?: Date | null }): Promise<Project | undefined> {
    const store = await getStorage();
    return store.updateProjectTimestamps(id, updates);
  },
  async getTestimonials(): Promise<Testimonial[]> {
    const store = await getStorage();
    return store.getTestimonials();
  },
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const store = await getStorage();
    return store.createTestimonial(testimonial);
  },
  async createEstimate(estimate: InsertEstimate): Promise<Estimate> {
    const store = await getStorage();
    return store.createEstimate(estimate);
  },
  async getEstimates(): Promise<Estimate[]> {
    const store = await getStorage();
    return store.getEstimates();
  },
  async getEstimate(id: number): Promise<Estimate | undefined> {
    const store = await getStorage();
    return store.getEstimate(id);
  },
  async createMessage(message: InsertMessage): Promise<Message> {
    const store = await getStorage();
    return store.createMessage(message);
  },
  async getMessages(projectId?: number): Promise<Message[]> {
    const store = await getStorage();
    return store.getMessages(projectId);
  },
  async createProjectLog(log: InsertProjectLog): Promise<ProjectLog> {
    const store = await getStorage();
    return store.createProjectLog(log);
  },
  async getProjectLogs(projectId: number): Promise<ProjectLog[]> {
    const store = await getStorage();
    return store.getProjectLogs(projectId);
  },
  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const store = await getStorage();
    return store.createMilestone(milestone);
  },
  async getMilestones(projectId: number): Promise<Milestone[]> {
    const store = await getStorage();
    return store.getMilestones(projectId);
  },
  async updateMilestone(id: number, updates: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const store = await getStorage();
    return store.updateMilestone(id, updates);
  },
  async getDashboardMetrics(): Promise<{
    activeProjects: number;
    completedToday: number;
    overdueProjects: number;
    totalProgress: number;
  }> {
    const store = await getStorage();
    return store.getDashboardMetrics();
  },
  async getProjectByMagicLink(magicLink: string): Promise<Project | undefined> {
    const store = await getStorage();
    return store.getProjectByMagicLink(magicLink);
  },
  async regenerateMagicLink(id: number): Promise<Project | undefined> {
    const store = await getStorage();
    return store.regenerateMagicLink(id);
  },
  async createEmailSubscriber(subscriber: InsertEmailSubscriber): Promise<EmailSubscriber> {
    const store = await getStorage();
    return store.createEmailSubscriber(subscriber);
  },
  async getEmailSubscriber(id: number): Promise<EmailSubscriber | undefined> {
    const store = await getStorage();
    return store.getEmailSubscriber(id);
  },
  async getEmailSubscribers(): Promise<EmailSubscriber[]> {
    const store = await getStorage();
    return store.getEmailSubscribers();
  },
  async createEmailCampaignSend(send: InsertEmailCampaignSend): Promise<EmailCampaignSend> {
    const store = await getStorage();
    return store.createEmailCampaignSend(send);
  },
  async getEmailCampaignSends(subscriberId?: number): Promise<EmailCampaignSend[]> {
    const store = await getStorage();
    return store.getEmailCampaignSends(subscriberId);
  },
  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const store = await getStorage();
    return store.createChatSession(session);
  },
  async getChatSessions(): Promise<ChatSession[]> {
    const store = await getStorage();
    return store.getChatSessions();
  },
  async getChatSession(sessionId: string): Promise<ChatSession | undefined> {
    const store = await getStorage();
    return store.getChatSession(sessionId);
  },
  async endChatSession(sessionId: string): Promise<ChatSession | undefined> {
    const store = await getStorage();
    return store.endChatSession(sessionId);
  },
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const store = await getStorage();
    return store.createChatMessage(message);
  },
  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    const store = await getStorage();
    return store.getChatMessages(sessionId);
  }
};
