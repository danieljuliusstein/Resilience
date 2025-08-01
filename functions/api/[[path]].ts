import { storage } from "../../server/storage";
import { insertLeadSchema, insertEstimateSchema, insertMessageSchema } from "../../shared/schema";
import { z } from "zod";
import { emailService } from "../../server/email";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper function to parse URL and get path segments
function getPathSegments(url: string): string[] {
  const urlObj = new URL(url);
  return urlObj.pathname.split('/').filter(segment => segment !== '');
}

// Helper function to get request body as JSON
async function getRequestBody(request: Request): Promise<any> {
  if (request.headers.get('content-type')?.includes('application/json')) {
    return await request.json();
  }
  return {};
}

// Helper function to create JSON response
function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Helper function to create error response
function errorResponse(message: string, status: number = 500): Response {
  return jsonResponse({ message }, status);
}

export async function onRequest(context: any): Promise<Response> {
  const { request } = context;
  const url = new URL(request.url);
  const method = request.method;
  const pathSegments = getPathSegments(url.href);

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Remove 'api' from path segments if present
    if (pathSegments[0] === 'api') {
      pathSegments.shift();
    }

    const [resource, id, subResource] = pathSegments;

    // Route handling
    switch (resource) {
      case 'leads':
        return await handleLeads(method, request, id);
      
      case 'estimates':
        return await handleEstimates(method, request, id);
      
      case 'testimonials':
        return await handleTestimonials(method, request, id);
      
      case 'projects':
        return await handleProjects(method, request, id, subResource);
      
      case 'messages':
        return await handleMessages(method, request, id);
      
      case 'dashboard':
        return await handleDashboard(method, request, id);
      
      case 'chat':
        return await handleChat(method, request, id, subResource);
      
      case 'track':
        return await handleTrack(method, request, id);
      
      case 'test-email':
        return await handleTestEmail(method, request);
      
      default:
        return errorResponse('Not found', 404);
    }
  } catch (error) {
    console.error('API Error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// Leads handlers
async function handleLeads(method: string, request: Request, id?: string): Promise<Response> {
  switch (method) {
    case 'POST':
      try {
        const body = await getRequestBody(request);
        const leadData = insertLeadSchema.parse(body);
        const lead = await storage.createLead(leadData);
        
        // Send email notification and schedule drip campaign
        await emailService.sendQuoteNotification(leadData);
        
        // Schedule email drip campaign
        try {
          const { scheduleEmailDripCampaign } = await import("../../server/email-drip");
          await scheduleEmailDripCampaign({
            email: leadData.email,
            firstName: leadData.firstName,
            lastName: leadData.lastName,
            subscriptionSource: 'quote_request'
          });
        } catch (error) {
          console.error("Failed to schedule drip campaign:", error);
        }
        
        return jsonResponse(lead);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return jsonResponse({ message: "Invalid lead data", errors: error.errors }, 400);
        }
        return errorResponse("Failed to create lead", 500);
      }
    
    case 'GET':
      try {
        const leads = await storage.getLeads();
        return jsonResponse(leads);
      } catch (error) {
        return errorResponse("Failed to fetch leads", 500);
      }
    
    default:
      return errorResponse('Method not allowed', 405);
  }
}

// Estimates handlers
async function handleEstimates(method: string, request: Request, id?: string): Promise<Response> {
  switch (method) {
    case 'POST':
      try {
        const body = await getRequestBody(request);
        const estimateData = insertEstimateSchema.parse(body);
        const estimate = await storage.createEstimate(estimateData);
        return jsonResponse(estimate);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return jsonResponse({ message: "Invalid estimate data", errors: error.errors }, 400);
        }
        return errorResponse("Failed to create estimate", 500);
      }
    
    case 'GET':
      try {
        const estimates = await storage.getEstimates();
        return jsonResponse(estimates);
      } catch (error) {
        return errorResponse("Failed to fetch estimates", 500);
      }
    
    default:
      return errorResponse('Method not allowed', 405);
  }
}

// Testimonials handlers
async function handleTestimonials(method: string, request: Request, id?: string): Promise<Response> {
  switch (method) {
    case 'GET':
      try {
        const testimonials = await storage.getTestimonials();
        return jsonResponse(testimonials);
      } catch (error) {
        return errorResponse("Failed to fetch testimonials", 500);
      }
    
    case 'POST':
      try {
        const body = await getRequestBody(request);
        const testimonial = await storage.createTestimonial(body);
        return jsonResponse(testimonial);
      } catch (error) {
        return errorResponse("Failed to create testimonial", 500);
      }
    
    default:
      return errorResponse('Method not allowed', 405);
  }
}

// Projects handlers
async function handleProjects(method: string, request: Request, id?: string, subResource?: string): Promise<Response> {
  switch (method) {
    case 'GET':
      if (id && subResource === 'logs') {
        try {
          const logs = await storage.getProjectLogs(parseInt(id));
          return jsonResponse(logs);
        } catch (error) {
          return errorResponse("Failed to fetch project logs", 500);
        }
      } else if (id && subResource === 'milestones') {
        try {
          const milestones = await storage.getProjectMilestones(parseInt(id));
          return jsonResponse(milestones);
        } catch (error) {
          return errorResponse("Failed to fetch project milestones", 500);
        }
      } else if (id) {
        try {
          const project = await storage.getProject(parseInt(id));
          return jsonResponse(project);
        } catch (error) {
          return errorResponse("Project not found", 404);
        }
      } else {
        try {
          const projects = await storage.getProjects();
          return jsonResponse(projects);
        } catch (error) {
          return errorResponse("Failed to fetch projects", 500);
        }
      }
      break;
    
    case 'POST':
      if (id && subResource === 'milestones') {
        try {
          const body = await getRequestBody(request);
          const milestone = await storage.createProjectMilestone(parseInt(id), body);
          return jsonResponse(milestone);
        } catch (error) {
          return errorResponse("Failed to create milestone", 500);
        }
      } else if (id && subResource === 'regenerate-link') {
        try {
          const newLink = await storage.regenerateProjectMagicLink(parseInt(id));
          return jsonResponse({ magicLink: newLink });
        } catch (error) {
          return errorResponse("Failed to regenerate link", 500);
        }
      } else {
        try {
          const body = await getRequestBody(request);
          const project = await storage.createProject(body);
          return jsonResponse(project);
        } catch (error) {
          return errorResponse("Failed to create project", 500);
        }
      }
      break;
    
    default:
      return errorResponse('Method not allowed', 405);
  }
}

// Messages handlers
async function handleMessages(method: string, request: Request, id?: string): Promise<Response> {
  switch (method) {
    case 'POST':
      try {
        const body = await getRequestBody(request);
        const messageData = insertMessageSchema.parse(body);
        const message = await storage.createMessage(messageData);
        return jsonResponse(message);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return jsonResponse({ message: "Invalid message data", errors: error.errors }, 400);
        }
        return errorResponse("Failed to create message", 500);
      }
    
    case 'GET':
      try {
        const messages = await storage.getMessages();
        return jsonResponse(messages);
      } catch (error) {
        return errorResponse("Failed to fetch messages", 500);
      }
    
    default:
      return errorResponse('Method not allowed', 405);
  }
}

// Dashboard handlers
async function handleDashboard(method: string, request: Request, resource?: string): Promise<Response> {
  if (method === 'GET' && resource === 'metrics') {
    try {
      const metrics = await storage.getDashboardMetrics();
      return jsonResponse(metrics);
    } catch (error) {
      return errorResponse("Failed to fetch dashboard metrics", 500);
    }
  }
  return errorResponse('Not found', 404);
}

// Chat handlers
async function handleChat(method: string, request: Request, resource?: string, id?: string): Promise<Response> {
  switch (resource) {
    case 'sessions':
      if (method === 'POST') {
        try {
          const body = await getRequestBody(request);
          const session = await storage.createChatSession(body);
          return jsonResponse(session);
        } catch (error) {
          return errorResponse("Failed to create chat session", 500);
        }
      } else if (method === 'GET') {
        try {
          const sessions = await storage.getChatSessions();
          return jsonResponse(sessions);
        } catch (error) {
          return errorResponse("Failed to fetch chat sessions", 500);
        }
      }
      break;
    
    case 'messages':
      if (method === 'POST') {
        try {
          const body = await getRequestBody(request);
          const message = await storage.createChatMessage(body);
          return jsonResponse(message);
        } catch (error) {
          return errorResponse("Failed to create chat message", 500);
        }
      } else if (method === 'GET' && id) {
        try {
          const messages = await storage.getChatMessages(id);
          return jsonResponse(messages);
        } catch (error) {
          return errorResponse("Failed to fetch chat messages", 500);
        }
      }
      break;
  }
  return errorResponse('Not found', 404);
}

// Track handler
async function handleTrack(method: string, request: Request, magicLink?: string): Promise<Response> {
  if (method === 'GET' && magicLink) {
    try {
      const project = await storage.getProjectByMagicLink(magicLink);
      return jsonResponse(project);
    } catch (error) {
      return errorResponse("Project not found", 404);
    }
  }
  return errorResponse('Not found', 404);
}

// Test email handler
async function handleTestEmail(method: string, request: Request): Promise<Response> {
  if (method === 'POST') {
    try {
      const body = await getRequestBody(request);
      const { to, subject, content } = body;
      
      if (!to || !subject || !content) {
        return jsonResponse({ message: "Missing required fields: to, subject, content" }, 400);
      }
      
      await emailService.sendTestEmail(to, subject, content);
      return jsonResponse({ message: "Test email sent successfully" });
    } catch (error) {
      return errorResponse("Failed to send test email", 500);
    }
  }
  return errorResponse('Method not allowed', 405);
}