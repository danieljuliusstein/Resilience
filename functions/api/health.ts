// Health check endpoint for Cloudflare Functions
export async function onRequestGet(context: any) {
  try {
    // Test database connection
    let dbStatus = 'unknown';
    try {
      const { createDB } = await import('../../server/db-cloudflare');
      const db = createDB(context.env);
      // Simple query to test connection
      await db.select().from(await import('@shared/schema').then(s => s.leads)).limit(1);
      dbStatus = 'healthy';
    } catch (error) {
      dbStatus = 'error';
      console.error('Database health check failed:', error);
    }

    // Test email service
    let emailStatus = 'unknown';
    try {
      const { EmailOctopusService } = await import('../../server/email-octopus');
      const emailService = new EmailOctopusService(context.env);
      // Just check if API key is configured
      emailStatus = emailService ? 'configured' : 'not_configured';
    } catch (error) {
      emailStatus = 'error';
      console.error('Email service health check failed:', error);
    }

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: context.env.NODE_ENV || 'unknown',
      services: {
        database: dbStatus,
        email: emailStatus
      }
    };

    return Response.json(healthData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return Response.json(
      { 
        status: 'unhealthy', 
        timestamp: new Date().toISOString(),
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}