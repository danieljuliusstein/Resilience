// This function handles all routes that don't match the API routes
// It serves the React SPA for client-side routing

export async function onRequest(context: any): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // If the request is for a static asset, let it pass through
  if (url.pathname.startsWith('/assets/') || 
      url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return new Response(null, { status: 404 });
  }
  
  // For all other routes, serve the React SPA
  try {
    // Get the index.html file from the static assets
    const indexResponse = await env.ASSETS.fetch(new URL('/index.html', request.url));
    
    if (indexResponse.ok) {
      // Return the index.html with proper headers
      return new Response(indexResponse.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache',
        },
      });
    }
  } catch (error) {
    console.error('Error serving SPA:', error);
  }
  
  // Fallback HTML for SPA
  const fallbackHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loading...</title>
</head>
<body>
    <div id="root">
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
            <div>Loading application...</div>
        </div>
    </div>
    <script>
        // Redirect to the main app
        window.location.reload();
    </script>
</body>
</html>`;
  
  return new Response(fallbackHTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache',
    },
  });
}