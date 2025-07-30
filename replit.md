# Resilience Solutions - Home Remodeling Business Website

## Overview

This is a full-stack web application for Resilience Solutions, a home remodeling and contracting business. The application features a modern, responsive website with lead capture, project estimation, client dashboards, and testimonial management. Built with React on the frontend and Express on the backend, it uses PostgreSQL for data persistence and includes a comprehensive UI component library.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Custom component system built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Forms**: React Hook Form with Zod validation

The frontend follows a component-based architecture with a clear separation between UI components, business logic, and data fetching. The design system uses shadcn/ui components for consistency and accessibility.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Development**: Hot reloading with Vite integration for seamless development experience
- **Error Handling**: Centralized error handling middleware
- **Logging**: Request/response logging with performance metrics

The backend uses a layered architecture with clear separation between routes, business logic (storage layer), and data models.

### Data Storage
- **Database**: PostgreSQL with active connection configured
- **ORM**: Drizzle ORM with Zod schema validation and DatabaseStorage implementation
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Neon Database serverless PostgreSQL for scalability
- **Status**: Database fully operational with real data persistence, seeded with sample data

## Key Components

### Database Schema
The application manages four main entities:
- **Leads**: Customer contact information and project inquiries
- **Projects**: Active remodeling projects with progress tracking
- **Testimonials**: Customer reviews and ratings
- **Estimates**: Project cost calculations and quotes

### API Endpoints
- `POST /api/leads` - Capture new customer leads
- `GET /api/leads` - Retrieve all leads
- `POST /api/estimates` - Create project estimates with automatic cost calculation
- `GET /api/estimates` - Retrieve estimates
- Additional endpoints for projects and testimonials (implemented in storage layer)

### Frontend Pages and Components
- **Home Page**: Single-page application with multiple sections
- **Navigation**: Sticky header with smooth scrolling navigation
- **Hero Section**: Eye-catching landing area with call-to-action buttons
- **Service Comparison**: Interactive service selection with pricing
- **Project Gallery**: Image carousel showcasing completed work
- **Testimonials**: Customer review display with ratings
- **Estimate Calculator**: Multi-step form for project cost estimation
- **Contact Form**: Lead capture with form validation
- **Client Resource Center**: Self-service hub with maintenance guides, warranties, and FAQs
- **Live Chat System**: Real-time support with floating chat button and session management

## Data Flow

1. **Lead Generation**: Visitors fill out contact forms, data is validated and stored
2. **Estimate Process**: Multi-step calculator collects project requirements and generates cost estimates
3. **Project Management**: Leads convert to projects with progress tracking
4. **Client Communication**: Magic links provide project tracking; live chat offers real-time support
5. **Email Drip Campaigns**: Automated 3-email sequence nurtures leads after quote requests
5. **Testimonial Collection**: Completed projects generate customer reviews

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **zod**: Runtime type validation

### UI and Styling
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Build Process
1. Frontend builds to `dist/public` using Vite
2. Backend bundles to `dist/index.js` using esbuild
3. Static assets are served by Express in production

### Environment Configuration
- **Development**: Uses Vite dev server with HMR and proxy to Express API
- **Production**: Single Express server serves both API and static frontend
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection

### Production Deployment
- **Start Command**: `npm start` runs the bundled Express server
- **Build Command**: `npm run build` creates production-ready assets
- **Database**: `npm run db:push` applies schema changes to PostgreSQL

The application is designed for deployment on platforms like Replit, Vercel, or any Node.js hosting service that supports PostgreSQL databases.

## Recent Changes

### January 30, 2025
- **Completed Replit Agent to Replit Migration**: Successfully migrated project from Replit Agent environment to standard Replit
- **Navigation Updates**: 
  - Removed tagline "Quality Remodeling & Finishing" from navigation header
  - Removed "Resilience Solutions" text div from navigation, keeping only the logo image for a cleaner, more minimal design
  - Enhanced logo area with improved styling: larger size (12x12), rounded corners, hover effects with scale animation, gradient background on hover, shadow effects, and clickable navigation to home section
- **Database Setup Completed**: 
  - Configured PostgreSQL database with proper schema migration
  - Replaced MockStorage with DatabaseStorage for production-ready data persistence
  - Seeded database with sample testimonials and projects
  - Verified database connection successful
- **Bug Fixes and Improvements**:
  - Fixed "View Complete Portfolio" button to properly navigate to admin database page
  - Connected instant estimate calculator to backend admin dashboard with proper cache invalidation
  - Verified end-to-end estimate flow from frontend form to admin dashboard
- **Environment Configuration**:
  - Added all required secrets: SESSION_SECRET, ADMIN_EMAIL, FROM_EMAIL, EMAILOCTOPUS_API_KEY
  - Removed conflicting SendGrid dependency in favor of EmailOctopus integration
  - Updated browser compatibility data to latest version

### January 29, 2025
- **Completed Replit Agent to Replit Migration**: Successfully migrated project from Replit Agent environment
- **Enhanced Button Component**: Added brand variants (brand, brandSecondary, brandOutline) with improved hover effects and transitions
- **Comprehensive Admin Dashboard**: Created modern admin dashboard with sidebar navigation including:
  - Overview page with key metrics and recent activity
  - Projects management with filtering and search
  - Leads management with contact information
  - Messages center for project communication
  - Live chat session management
  - Real-time data updates with TanStack Query
- **Extended API Endpoints**: Added comprehensive admin API routes for:
  - Dashboard metrics endpoint (`/api/dashboard/metrics`)
  - Full project CRUD operations
  - Message management system
  - Chat session handling
- **Improved UI Components**: Updated project gallery to use new brand button variants
- **Database Setup Ready**: Database schema and API endpoints ready; manual database setup required through Replit interface

### January 25, 2025
- **Updated Email Service**: Switched from EmailOctopus to SendGrid for production email delivery
- **Added Deployment Configurations**: Created comprehensive Hetzner Cloud deployment setup including:
  - Docker configuration with multi-stage builds
  - PM2 ecosystem configuration for production
  - NGINX reverse proxy configuration with SSL support
  - Automated server setup and deployment scripts
  - Database backup automation
  - Production environment templates
- **Enhanced Security**: Added health check endpoint, production-ready error handling