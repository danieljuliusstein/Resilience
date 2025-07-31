# Local Development Setup Guide

This guide will help you set up and run the Resilience Solutions application locally.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- PostgreSQL (optional - app can run with mock storage)

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://localhost:5432/resilience_dev
   
   # Application Configuration
   NODE_ENV=development
   PORT=5000
   
   # Email Configuration (optional for local dev)
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   FROM_EMAIL=hello@resiliencesolutions.com
   
   # OpenAI Configuration (optional)
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Database Setup (Optional)**
   
   If you have PostgreSQL installed:
   ```bash
   # Create database
   createdb resilience_dev
   
   # Run migrations
   npm run db:push
   ```
   
   If you don't have PostgreSQL, the app will automatically use mock storage.

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Main App: http://localhost:5000
   - Admin Panel: http://localhost:5000/admin
   - Database Admin: http://localhost:5000/database
   - Health Check: http://localhost:5000/health

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── lib/           # Utilities and configurations
│   │   └── hooks/         # Custom React hooks
│   └── index.html         # HTML template
├── server/                # Express backend
│   ├── index.ts          # Main server entry point
│   ├── routes.ts         # API routes
│   ├── admin-routes.ts   # Admin panel routes
│   ├── chat-routes.ts    # Chat functionality
│   ├── db.ts             # Database configuration
│   ├── storage.ts        # Data storage layer
│   └── vite.ts           # Vite dev server setup
├── shared/               # Shared code between client/server
│   └── schema.ts         # Database schema definitions
└── public/              # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema changes

## Features

The application includes:

### Frontend Features
- **Home Page**: Company showcase with services and testimonials
- **Admin Panel**: Project management dashboard
- **Database Admin**: Direct database management interface
- **Project Tracking**: Client project status tracking
- **Responsive Design**: Mobile-first responsive UI

### Backend Features
- **RESTful API**: Express.js API endpoints
- **Database Integration**: PostgreSQL with Drizzle ORM
- **Mock Storage**: Fallback storage when database unavailable
- **Email Integration**: SendGrid for email notifications
- **Session Management**: Express sessions with PostgreSQL store
- **File Upload**: Image and document handling

### Database Schema
- **Leads**: Customer inquiries and contact information
- **Projects**: Active projects with status tracking
- **Testimonials**: Customer reviews and ratings
- **Estimates**: Project cost estimates
- **Users**: Admin user accounts
- **Sessions**: User session data

## Development Workflow

1. **Frontend Development**
   - Hot reload enabled via Vite
   - React components in `client/src/`
   - Tailwind CSS for styling
   - TypeScript for type safety

2. **Backend Development**
   - Express server with TypeScript
   - API routes in `server/routes.ts`
   - Database queries via Drizzle ORM
   - Automatic server restart with tsx

3. **Database Development**
   - Schema defined in `shared/schema.ts`
   - Migrations via `drizzle-kit`
   - Mock storage for development without DB

## Vercel Deployment

The application is configured for Vercel deployment:

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

The `vercel.json` configuration handles:
- Static build for the frontend
- Serverless function for the backend
- Route configuration for SPA behavior

## Environment Variables for Production

Set these in your Vercel dashboard:

- `DATABASE_URL` - PostgreSQL connection string
- `SENDGRID_API_KEY` - For email functionality
- `FROM_EMAIL` - Sender email address
- `OPENAI_API_KEY` - For AI features (optional)

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill process using port: `lsof -ti:5000 | xargs kill -9`

2. **Database Connection Issues**
   - Check PostgreSQL is running
   - Verify DATABASE_URL format
   - App will fallback to mock storage

3. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run check`

4. **Vite Dev Server Issues**
   - Clear Vite cache: `rm -rf node_modules/.vite`
   - Check for port conflicts

### Performance Tips

- Use `npm run build` before production deployment
- Enable PostgreSQL for better performance than mock storage
- Configure proper database indexes for large datasets
- Use environment variables for sensitive configuration

## Testing the Application

1. **Frontend Testing**
   - Navigate to all routes
   - Test responsive design
   - Verify form submissions

2. **Backend Testing**
   - Test API endpoints via admin panel
   - Verify database operations
   - Check error handling

3. **Integration Testing**
   - Test full user workflows
   - Verify data persistence
   - Check email functionality (if configured)

## Next Steps

After successful local setup:

1. Configure your database with real data
2. Set up email integration with SendGrid
3. Customize the UI for your specific needs
4. Deploy to Vercel for production use
5. Set up monitoring and analytics

The application is production-ready and includes all necessary features for a professional home remodeling business website with admin capabilities.