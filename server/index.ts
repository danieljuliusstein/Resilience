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
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Health check endpoint for monitoring
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  isInitialized = true;
}

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await initializeApp();
    
    // Handle API routes
    if (req.url?.startsWith('/api')) {
      // Let Express handle API routes
      const expressReq = req as any;
      const expressRes = res as any;
      app(expressReq, expressRes);
      return;
    }
    
    // Handle admin route - serve the React app
    if (req.url?.startsWith('/admin')) {
      const indexPath = path.resolve(__dirname, '..', 'dist', 'public', 'index.html');
      if (fs.existsSync(indexPath)) {
        const html = fs.readFileSync(indexPath, 'utf-8');
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(html);
      } else {
        res.status(404).send('Admin page not found');
      }
      return;
    }
    
    // Handle static files
    const url = req.url || '/';
    const filePath = path.resolve(__dirname, '..', 'dist', 'public', url === '/' ? 'index.html' : url);
    
    if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
      const ext = path.extname(filePath);
      const contentType = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject'
      }[ext] || 'application/octet-stream';
      
      res.setHeader('Content-Type', contentType);
      res.status(200).send(fs.readFileSync(filePath));
    } else {
      // Fallback to index.html for client-side routing
      const indexPath = path.resolve(__dirname, '..', 'dist', 'public', 'index.html');
      if (fs.existsSync(indexPath)) {
        const html = fs.readFileSync(indexPath, 'utf-8');
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(html);
      } else {
        res.status(404).send('Not found');
      }
    }
  } catch (error) {
    console.error('Vercel handler error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

// Local development server startup
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  (async () => {
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
  })();
}
