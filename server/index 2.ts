import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { registerAdminRoutes } from "./admin-routes";
import { registerChatRoutes } from "./chat-routes";
import { setupVite, serveStatic, log } from "./vite";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create Express app instance
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Middleware for logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize app for both Vercel and local development
let isInitialized = false;
async function initializeApp() {
  if (isInitialized) return;
  
  const server = await registerRoutes(app);
  registerAdminRoutes(app);
  registerChatRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error('Express error:', err);
  });

  // Health check endpoint for monitoring
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV || 'development'
    });
  });

  // Static file serving for production
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    serveStatic(app);
  } else {
    // Development mode
    const server = createServer(app);
    await setupVite(app, server);
  }

  isInitialized = true;
}

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await initializeApp();
    
    // Convert Vercel request/response to Express format
    const expressReq = req as any;
    const expressRes = res as any;
    
    // Add CORS headers for production
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Let Express handle the request
    app(expressReq, expressRes);
  } catch (error) {
    console.error('Vercel handler error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    });
  }
}

// Local development server startup
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  (async () => {
    try {
      await initializeApp();
      
      const server = createServer(app);
      
      // ALWAYS serve the app on the port specified in the environment variable PORT
      // Other ports are firewalled. Default to 5000 if not specified.
      // this serves both the API and the client.
      // It is the only port that is not firewalled.
      const port = parseInt(process.env.PORT || '5000', 10);
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`serving on port ${port}`);
      });
    } catch (error) {
      console.error('Failed to start development server:', error);
      process.exit(1);
    }
  })();
}