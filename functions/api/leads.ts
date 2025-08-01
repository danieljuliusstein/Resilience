import { createDB } from '../../server/db-cloudflare';
import { insertLeadSchema } from '@shared/schema';
import { z } from 'zod';

// Storage functions (imported from server/storage.ts logic)
async function createLead(db: any, leadData: any) {
  const { leads } = await import('@shared/schema');
  const [lead] = await db.insert(leads).values(leadData).returning();
  return lead;
}

async function getLeads(db: any) {
  const { leads } = await import('@shared/schema');
  const allLeads = await db.select().from(leads);
  return allLeads;
}

// POST /api/leads - Create new lead
export async function onRequestPost(context: any) {
  try {
    const db = createDB(context.env);
    const body = await context.request.json();
    const leadData = insertLeadSchema.parse(body);
    
    // Create lead in database
    const lead = await createLead(db, leadData);
    
    // Send email notification
    try {
      const { EmailOctopusService } = await import('../../server/email-octopus');
      const emailService = new EmailOctopusService(context.env);
      await emailService.sendQuoteNotification(leadData);
    } catch (error) {
      console.error("Failed to send email notification:", error);
    }
    
    // Schedule drip campaign
    try {
      const { scheduleEmailDripCampaign } = await import('../../server/email-drip-octopus');
      await scheduleEmailDripCampaign({
        email: leadData.email,
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        subscriptionSource: 'quote_request'
      }, context.env);
    } catch (error) {
      console.error("Failed to schedule drip campaign:", error);
    }
    
    return Response.json(lead);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { message: "Invalid lead data", errors: error.errors }, 
        { status: 400 }
      );
    } else {
      console.error("Lead creation error:", error);
      return Response.json(
        { message: "Failed to create lead" }, 
        { status: 500 }
      );
    }
  }
}

// GET /api/leads - Get all leads
export async function onRequestGet(context: any) {
  try {
    const db = createDB(context.env);
    const leads = await getLeads(db);
    return Response.json(leads);
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return Response.json(
      { message: "Failed to fetch leads" }, 
      { status: 500 }
    );
  }
}