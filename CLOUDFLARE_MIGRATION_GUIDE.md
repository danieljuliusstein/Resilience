# Cloudflare Migration Guide for Resilience Solutions

## Overview
This guide will help you migrate your Express.js app from Vercel to Cloudflare Pages + Functions. The migration includes database, email services, and all API endpoints.

## Prerequisites

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Create Cloudflare Pages Project
```bash
wrangler pages project create resilience-solutions
```

## Database Setup

### Option 1: Use Cloudflare D1 (Recommended)

#### Create D1 Database
```bash
# Create production database
wrangler d1 create resilience-solutions-prod

# Create development database  
wrangler d1 create resilience-solutions-dev
```

#### Update wrangler.toml with Database IDs
Replace the placeholder IDs in `wrangler.toml` with your actual database IDs from the previous step.

#### Create Database Schema
```bash
# Create migrations directory
mkdir -p migrations

# Export your current schema
npx drizzle-kit generate:sql

# Apply schema to D1
wrangler d1 execute resilience-solutions-prod --file=./migrations/0000_initial.sql
wrangler d1 execute resilience-solutions-dev --file=./migrations/0000_initial.sql
```

### Option 2: Keep External PostgreSQL

If you prefer to keep your existing PostgreSQL database (Neon, Supabase, etc.), simply set the `DATABASE_URL` environment variable in Cloudflare.

## Environment Variables Setup

### 1. In Cloudflare Dashboard
Go to Pages → Settings → Environment Variables and add:

**Production:**
- `EMAILOCTOPUS_API_KEY`: Your EmailOctopus API key
- `EMAILOCTOPUS_MAIN_LIST_ID`: Your main email list ID
- `ADMIN_EMAIL`: danieljuliusstein@gmail.com
- `FROM_EMAIL`: noreply@resilience-solutions.com
- `DATABASE_URL`: (if using external PostgreSQL)
- `OPENAI_API_KEY`: Your OpenAI API key

**Development:**
- Same variables as production with development values

### 2. EmailOctopus Setup

#### Get API Key
1. Go to EmailOctopus Dashboard
2. Navigate to Settings → API
3. Generate new API key
4. Copy for environment variables

#### Create Email Lists
1. Create "Main List" for drip campaigns
2. Set up automation rules for welcome sequence
3. Note the List ID for `EMAILOCTOPUS_MAIN_LIST_ID`

## Build and Deploy

### 1. Build the Application
```bash
# Build frontend
npm run build:cf

# Install dependencies
npm install
```

### 2. Test Locally
```bash
# Start local development server
npm run preview
```

### 3. Deploy to Production
```bash
# Deploy to Cloudflare Pages
npm run deploy
```

## Verification Steps

### 1. Test API Endpoints
```bash
# Test leads endpoint
curl -X POST https://your-domain.pages.dev/api/leads \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"555-0123"}'

# Test estimates endpoint  
curl -X GET https://your-domain.pages.dev/api/estimates
```

### 2. Test Email Functionality
Submit a test form on your website to verify:
- Lead notifications are sent
- Drip campaigns are triggered
- Email templates render correctly

### 3. Test Database Connection
Check the Cloudflare Pages Functions logs to ensure:
- Database connections are successful
- CRUD operations work correctly
- Data persistence is maintained

## DNS Configuration

### 1. Update DNS Records
In your domain registrar, update DNS to point to Cloudflare:
- Remove old Vercel DNS records
- Add Cloudflare Pages custom domain
- Update CNAME/A records as instructed by Cloudflare

### 2. SSL Certificate
Cloudflare will automatically provision SSL certificates for your custom domain.

## Performance Optimization

### 1. Enable Cloudflare Features
- **Auto Minify**: CSS, JavaScript, HTML
- **Brotli Compression**: Better than gzip
- **Rocket Loader**: Async JavaScript loading
- **Polish**: Image optimization

### 2. Caching Rules
Set up caching rules for:
- Static assets: Cache for 1 year
- API responses: Cache for 5 minutes (if appropriate)
- HTML pages: Cache for 1 hour

## Monitoring and Logs

### 1. Cloudflare Analytics
Monitor:
- Page views and unique visitors
- Performance metrics
- Error rates

### 2. Function Logs
```bash
# View real-time logs
wrangler pages deployment tail
```

### 3. Set Up Alerts
Configure alerts for:
- High error rates
- Performance degradation
- Failed deployments

## Cost Comparison

**Before (Vercel):**
- $20/month + bandwidth overages
- Limited function execution time
- Build minute limitations

**After (Cloudflare):**
- $0-5/month for most applications
- 100,000 requests/day free
- Unlimited bandwidth
- Global edge network

## Rollback Plan

If issues arise, you can quickly rollback:

### 1. DNS Rollback
- Revert DNS records to point back to Vercel
- Keep Vercel deployment active during migration

### 2. Database Rollback
- If using D1, export data back to PostgreSQL
- If using external DB, no changes needed

### 3. Code Rollback
- Revert to Express.js server
- Deploy back to Vercel

## Migration Checklist

- [ ] ✅ Install Wrangler CLI and login to Cloudflare
- [ ] ✅ Create Cloudflare Pages project
- [ ] ✅ Set up database (D1 or external PostgreSQL)
- [ ] ✅ Configure environment variables
- [ ] ✅ Set up EmailOctopus API and lists
- [ ] ✅ Test locally with `npm run preview`
- [ ] ✅ Deploy to Cloudflare Pages
- [ ] ✅ Test all API endpoints
- [ ] ✅ Verify email functionality
- [ ] ✅ Update DNS records
- [ ] ✅ Monitor for 24-48 hours
- [ ] ✅ Disable Vercel deployment

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```
Error: D1 database binding not found
```
**Solution:** Ensure `wrangler.toml` has correct database bindings and IDs.

#### 2. Environment Variables Not Available
```
Error: EMAILOCTOPUS_API_KEY is undefined
```
**Solution:** Check Cloudflare Pages environment variables are set correctly.

#### 3. CORS Issues
```
Error: CORS policy blocked request
```
**Solution:** Add CORS headers to your function responses:
```javascript
return new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type',
  },
});
```

#### 4. Function Timeout
```
Error: Function execution timed out
```
**Solution:** Optimize database queries and reduce external API calls.

### Getting Help

1. **Cloudflare Community**: https://community.cloudflare.com/
2. **Cloudflare Discord**: https://discord.gg/cloudflaredev
3. **Documentation**: https://developers.cloudflare.com/pages/

## Next Steps

After successful migration:

1. **Set up monitoring** with Cloudflare Analytics
2. **Configure caching rules** for optimal performance  
3. **Set up automated backups** for D1 database
4. **Implement CI/CD pipeline** with GitHub Actions
5. **Add more Cloudflare features** like Bot Management, WAF

Your migration to Cloudflare will provide better performance, lower costs, and enhanced security for your Resilience Solutions application!