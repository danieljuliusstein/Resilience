import { createDB } from '../../server/db-cloudflare';
import { insertMessageSchema } from '@shared/schema';
import { z } from 'zod';

// Storage functions for messages
async function createMessage(db: any, messageData: any) {
  const { messages } = await import('@shared/schema');
  const [message] = await db.insert(messages).values(messageData).returning();
  return message;
}

async function getMessages(db: any) {
  const { messages } = await import('@shared/schema');
  const allMessages = await db.select().from(messages);
  return allMessages;
}

// POST /api/messages - Create new message
export async function onRequestPost(context: any) {
  try {
    const db = createDB(context.env);
    const body = await context.request.json();
    const messageData = insertMessageSchema.parse(body);
    
    // Create message in database
    const message = await createMessage(db, messageData);
    
    // Send email notification
    try {
      const { EmailOctopusService } = await import('../../server/email-octopus');
      const emailService = new EmailOctopusService(context.env);
      await emailService.sendMessageNotification(message);
    } catch (error) {
      console.error("Failed to send message notification:", error);
    }
    
    return Response.json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { message: "Invalid message data", errors: error.errors }, 
        { status: 400 }
      );
    } else {
      console.error("Message creation error:", error);
      return Response.json(
        { message: "Failed to create message" }, 
        { status: 500 }
      );
    }
  }
}

// GET /api/messages - Get all messages
export async function onRequestGet(context: any) {
  try {
    const db = createDB(context.env);
    const messages = await getMessages(db);
    return Response.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return Response.json(
      { message: "Failed to fetch messages" }, 
      { status: 500 }
    );
  }
}