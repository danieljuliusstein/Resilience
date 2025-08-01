# Cloudflare Pages Deployment Guide

This guide will help you deploy your React + Express application to Cloudflare Pages with Functions.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Already installed globally
3. **Git Repository**: Your code should be in a Git repository

## Environment Setup

### 1. Database Configuration

Your application uses Neon Database. You'll need to configure the database connection:

1. **Set up environment variables** in Cloudflare:
   ```bash
   # Set your database URL
   wrangler secret put DATABASE_URL
   # Enter your Neon database URL when prompted
   
   # Set other required environment variables
   wrangler secret put SENDGRID_API_KEY
   wrangler secret put OPENAI_API_KEY
   ```

2. **Alternative**: Use the Cloudflare Dashboard:
   - Go to Cloudflare Pages > Your Project > Settings > Environment Variables
   - Add the following variables:
     - `DATABASE_URL`: Your Neon database connection string
     - `SENDGRID_API_KEY`: Your SendGrid API key (if using email)
     - `OPENAI_API_KEY`: Your OpenAI API key (if using AI features)
     - `NODE_ENV`: Set to "production"

### 2. Build Configuration

The project is already configured with:
- `wrangler.toml`: Cloudflare configuration
- `functions/`: Cloudflare Functions directory
- `functions/_routes.json`: Routing configuration
- Updated `package.json` with Cloudflare scripts

## Deployment Options

### Option 1: Automatic Deployment (Recommended)

1. **Connect your Git repository**:
   ```bash
   wrangler pages project create rest-express-app
   ```

2. **Connect to Git** (via Cloudflare Dashboard):
   - Go to Cloudflare Pages
   - Click "Connect to Git"
   - Select your repository
   - Configure build settings:
     - **Build command**: `npm run build:cloudflare`
     - **Build output directory**: `dist/public`
     - **Root directory**: `/` (leave empty)

3. **Set environment variables** in the dashboard as described above

4. **Deploy**: Push to your main branch, and Cloudflare will automatically deploy

### Option 2: Manual Deployment

1. **Build the project**:
   ```bash
   npm run build:cloudflare
   ```

2. **Deploy manually**:
   ```bash
   npm run deploy
   ```

## Database Migration

Since you're using Drizzle ORM, you'll need to run database migrations:

1. **Run migrations** (from your local environment):
   ```bash
   npm run db:push
   ```

2. **Or use the production database URL**:
   ```bash
   DATABASE_URL="your-production-db-url" npm run db:push
   ```

## Testing Your Deployment

1. **Local preview**:
   ```bash
   npm run preview
   ```

2. **Test API endpoints**:
   - `https://your-domain.pages.dev/api/leads`
   - `https://your-domain.pages.dev/api/projects`
   - `https://your-domain.pages.dev/api/testimonials`

3. **Test the frontend**:
   - Navigate to `https://your-domain.pages.dev`
   - Ensure client-side routing works

## Custom Domain (Optional)

1. **Add custom domain** in Cloudflare Pages:
   - Go to your project > Custom domains
   - Add your domain
   - Update DNS records as instructed

## Monitoring and Logs

1. **View logs**:
   ```bash
   wrangler pages deployment tail
   ```

2. **Monitor in dashboard**:
   - Go to Cloudflare Pages > Your Project > Functions
   - View real-time logs and metrics

## Troubleshooting

### Common Issues:

1. **Database Connection Issues**:
   - Verify `DATABASE_URL` is set correctly
   - Ensure Neon database allows connections from Cloudflare IPs

2. **Function Timeout**:
   - Cloudflare Functions have a 100-second timeout
   - Optimize long-running operations

3. **Static Asset Issues**:
   - Ensure `dist/public` contains all built assets
   - Check `_routes.json` for proper routing

4. **CORS Issues**:
   - CORS headers are already configured in the API function
   - Verify your frontend is making requests to the correct domain

### Getting Help:

1. **Check Cloudflare Logs**:
   ```bash
   wrangler pages deployment tail --project-name=rest-express-app
   ```

2. **Verify Build Output**:
   ```bash
   ls -la dist/public/
   ls -la functions/
   ```

## Migration from Vercel

If you're migrating from Vercel:

1. **Remove Vercel configuration**:
   - You can keep `vercel.json` for reference but it won't be used
   
2. **Update environment variables**:
   - Export from Vercel and import to Cloudflare
   
3. **Update DNS**:
   - Point your domain to Cloudflare Pages instead of Vercel

## Performance Benefits

Cloudflare Pages offers:
- **Global CDN**: Your app is served from 200+ locations worldwide
- **Edge Functions**: API runs closer to users
- **Free tier**: Generous limits for most applications
- **Integrated security**: DDoS protection and security features

## Next Steps

1. Deploy your application using one of the methods above
2. Set up monitoring and alerting
3. Configure custom domain if needed
4. Set up CI/CD pipeline for automatic deployments

Your application is now ready for Cloudflare Pages deployment!