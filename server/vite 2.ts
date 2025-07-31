import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    console.warn(`Build directory not found: ${distPath}. This is expected during development.`);
    
    // Fallback to serving index.html for client-side routing
    app.use("*", (req, res) => {
      // Simple HTML response for routes that aren't API endpoints
      if (!req.originalUrl.startsWith('/api')) {
        res.status(200).set({ "Content-Type": "text/html" }).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Resilience Solutions</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body>
              <div id="root">
                <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
                  <div style="text-align: center;">
                    <h1>Resilience Solutions</h1>
                    <p>Build files not found. Please run 'npm run build' first.</p>
                    <p>Current path: ${req.originalUrl}</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `);
      } else {
        res.status(404).json({ error: 'Not Found' });
      }
    });
    return;
  }

  // Serve static files
  app.use(express.static(distPath, {
    maxAge: '1y',
    etag: true,
    lastModified: true
  }));

  // Handle client-side routing - serve index.html for non-API routes
  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    
    if (!req.originalUrl.startsWith('/api')) {
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Application not built. Please run `npm run build` first.');
      }
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
}