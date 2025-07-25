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
- **Status**: Database tables created and seeded with sample testimonials and projects

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
- **Client Dashboard**: Project tracking interface for customers

## Data Flow

1. **Lead Generation**: Visitors fill out contact forms, data is validated and stored
2. **Estimate Process**: Multi-step calculator collects project requirements and generates cost estimates
3. **Project Management**: Leads convert to projects with progress tracking
4. **Client Communication**: Dashboard provides real-time project updates
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