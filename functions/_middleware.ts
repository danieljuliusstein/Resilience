// Middleware for Cloudflare Pages Functions
// This runs before all API routes

export async function onRequest(context: any) {
  const { request, next } = context;
  const start = Date.now();
  
  // CORS headers for all requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Continue to the next handler
    const response = await next();
    
    // Add CORS headers to response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Log API requests
    const duration = Date.now() - start;
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api/')) {
      console.log(`${request.method} ${url.pathname} ${response.status} in ${duration}ms`);
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // Return error response with CORS headers
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}