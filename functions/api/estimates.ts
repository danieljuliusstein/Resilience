import { createDB } from '../../server/db-cloudflare';
import { insertEstimateSchema } from '@shared/schema';
import { z } from 'zod';

// Storage functions for estimates
async function createEstimate(db: any, estimateData: any) {
  const { estimates } = await import('@shared/schema');
  const [estimate] = await db.insert(estimates).values(estimateData).returning();
  return estimate;
}

async function getEstimates(db: any) {
  const { estimates } = await import('@shared/schema');
  const allEstimates = await db.select().from(estimates);
  return allEstimates;
}

// POST /api/estimates - Create new estimate
export async function onRequestPost(context: any) {
  try {
    const db = createDB(context.env);
    const body = await context.request.json();
    const estimateData = insertEstimateSchema.parse(body);
    
    // Create estimate in database
    const estimate = await createEstimate(db, estimateData);
    
    // Send email notification
    try {
      const { EmailOctopusService } = await import('../../server/email-octopus');
      const emailService = new EmailOctopusService(context.env);
      await emailService.sendEstimateNotification(estimate);
    } catch (error) {
      console.error("Failed to send estimate notification:", error);
    }
    
    return Response.json(estimate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { message: "Invalid estimate data", errors: error.errors }, 
        { status: 400 }
      );
    } else {
      console.error("Estimate creation error:", error);
      return Response.json(
        { message: "Failed to create estimate" }, 
        { status: 500 }
      );
    }
  }
}

// GET /api/estimates - Get all estimates
export async function onRequestGet(context: any) {
  try {
    const db = createDB(context.env);
    const estimates = await getEstimates(db);
    return Response.json(estimates);
  } catch (error) {
    console.error("Failed to fetch estimates:", error);
    return Response.json(
      { message: "Failed to fetch estimates" }, 
      { status: 500 }
    );
  }
}