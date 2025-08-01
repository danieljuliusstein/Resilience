import { drizzle } from 'drizzle-orm/d1';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from "@shared/schema";

// Cloudflare D1 Database Connection
export function createD1DB(env: any) {
  if (!env.DB) {
    throw new Error("D1 database binding not found. Make sure DB is configured in wrangler.toml");
  }
  return drizzle(env.DB, { schema });
}

// External PostgreSQL Database Connection (Neon, Supabase, etc.)
export function createPostgreSQLDB(databaseUrl: string) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be set for PostgreSQL connection");
  }
  
  const client = new Pool({ connectionString: databaseUrl });
  return drizzleNeon(client, { schema });
}

// Universal database factory for Cloudflare environment
export function createDB(env: any) {
  // Prefer D1 if available, fallback to PostgreSQL
  if (env.DB) {
    console.log("Using Cloudflare D1 database");
    return createD1DB(env);
  } else if (env.DATABASE_URL) {
    console.log("Using external PostgreSQL database");
    return createPostgreSQLDB(env.DATABASE_URL);
  } else {
    throw new Error("No database configuration found. Set up either D1 binding or DATABASE_URL");
  }
}

// Session management using Cloudflare KV
export class CloudflareSessionService {
  private kv: any;
  
  constructor(env: any) {
    if (!env.KV) {
      throw new Error("KV namespace binding not found. Make sure KV is configured in wrangler.toml");
    }
    this.kv = env.KV;
  }

  async getSession(sessionId: string): Promise<any | null> {
    try {
      const session = await this.kv.get(`session:${sessionId}`, 'json');
      return session;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  async setSession(sessionId: string, sessionData: any, ttl: number = 86400): Promise<boolean> {
    try {
      await this.kv.put(`session:${sessionId}`, JSON.stringify(sessionData), {
        expirationTtl: ttl // 24 hours default
      });
      return true;
    } catch (error) {
      console.error('Failed to set session:', error);
      return false;
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await this.kv.delete(`session:${sessionId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }

  generateSessionId(): string {
    return crypto.randomUUID();
  }
}

// Utility function to get cookie from request
export function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies[name] || null;
}

// Utility function to set cookie in response
export function setCookie(response: Response, name: string, value: string, options: {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  maxAge?: number;
  path?: string;
} = {}): Response {
  const {
    httpOnly = true,
    secure = true,
    sameSite = 'Lax',
    maxAge = 86400, // 24 hours
    path = '/'
  } = options;

  let cookieString = `${name}=${value}; Path=${path}; Max-Age=${maxAge}; SameSite=${sameSite}`;
  
  if (httpOnly) cookieString += '; HttpOnly';
  if (secure) cookieString += '; Secure';

  response.headers.set('Set-Cookie', cookieString);
  return response;
}