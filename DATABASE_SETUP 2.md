# Database Setup Instructions

Your application is currently using mock storage because no database connection is available. To set up a PostgreSQL database in Replit:

## Steps to Add Database:

1. **In your Replit project, go to the Tools panel on the left sidebar**
2. **Click on "Database" or "PostgreSQL"**
3. **Click "Add Database" or "Create Database"**
4. **Select PostgreSQL as the database type**

Once the database is created, Replit will automatically set the `DATABASE_URL` environment variable.

## Alternative: Manual Environment Variable Setup

If the above doesn't work, you can manually set up a database:

1. Go to the "Secrets" tab in your Replit project (lock icon in left sidebar)
2. Add a new secret with key: `DATABASE_URL`
3. Value should be your PostgreSQL connection string, for example:
   `postgresql://username:password@hostname:port/database`

## After Database Setup:

1. The application will automatically detect the database connection
2. Run `npm run db:push` to create the database tables
3. The admin dashboard will have full database functionality

## Current Status:
- ✅ Application running with mock storage
- ⏳ Database connection needed for full functionality
- ✅ All database schemas and migrations ready

The application will automatically switch from MockStorage to DatabaseStorage once a valid DATABASE_URL is detected.