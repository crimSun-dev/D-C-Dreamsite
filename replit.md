# Shared Wishlist Application

## Overview

A romantic shared wishlist web application designed for couples to track and manage their wishes, goals, and dreams together. The application features a dark, elegant design with pink accents inspired by Pinterest and mood board platforms, complete with an illustrated cherry blossom forest hero section. Users can create, categorize, filter, and track wishes with various attributes like priority levels, categories, and ownership (individual or shared).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing
- Single-page application (SPA) architecture

**State Management:**
- TanStack React Query (v5) for server state management, data fetching, and caching
- Local component state using React hooks for UI-specific state
- Custom hooks for reusable stateful logic (e.g., `use-toast`, `use-mobile`)

**UI Component Library:**
- shadcn/ui component system (Radix UI primitives with custom styling)
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variant management
- Dark theme with custom HSL color system defined in CSS variables

**Form Handling:**
- React Hook Form for performant form management
- Zod for runtime schema validation
- @hookform/resolvers for integrating Zod with React Hook Form

**Design System:**
- Custom color palette with pink primary accent (#FF1E8C)
- Deep charcoal/near-black backgrounds (#1a1a1a to #0f0f0f)
- Typography using system fonts (Inter, SF Pro, Segoe UI)
- Spacing based on Tailwind's standardized scale
- Responsive grid layouts (1-4 columns based on viewport)

### Backend Architecture

**Server Framework:**
- Express.js as the HTTP server framework
- Node.js runtime with ES modules (type: "module")
- TypeScript for type safety across the stack

**API Design:**
- RESTful API endpoints under `/api` prefix
- JSON request/response format
- CRUD operations for wishes resource
- Centralized error handling

**Data Layer:**
- In-memory storage implementation (`MemStorage` class) with interface abstraction
- `IStorage` interface allows for future database integration
- Pre-seeded sample data for development

**Middleware Stack:**
- JSON body parsing with raw body preservation for webhooks
- URL-encoded form data parsing
- Request logging with timestamp and duration tracking
- Static file serving for production builds

### Data Storage Solutions

**Current Implementation:**
- In-memory Map-based storage for development/demo purposes
- UUID-based record identification using crypto.randomUUID()
- Type-safe data models using TypeScript interfaces

**Planned Database Integration:**
- Drizzle ORM configured for PostgreSQL
- Schema defined with Drizzle's pg-core table builders
- Migration support via drizzle-kit
- Connection via DATABASE_URL environment variable
- Two main tables:
  - `users`: Authentication and user management
  - `wishes`: Core wishlist items with categories, priorities, and ownership

**Data Models:**
- User: id, username, password
- Wish: id, title, description, imageUrl, category, priority, owner, isCompleted
- Zod schemas for runtime validation of insertions and updates

### External Dependencies

**UI Component Libraries:**
- Radix UI primitives (accordion, dialog, dropdown, popover, select, etc.)
- Embla Carousel for carousel functionality
- Lucide React for consistent iconography

**Utilities:**
- date-fns for date manipulation
- clsx and tailwind-merge for conditional class name handling
- nanoid for unique ID generation

**Development Tools:**
- tsx for TypeScript execution in development
- esbuild for server-side bundling
- Replit-specific plugins for development experience
- PostCSS with Autoprefixer for CSS processing

**Future Integrations (configured but not implemented):**
- PostgreSQL database via pg driver
- Session management via express-session with connect-pg-simple
- Potential authentication via passport strategies
- Rate limiting via express-rate-limit

### Build and Deployment

**Development Mode:**
- Vite dev server with HMR for client
- tsx watch mode for server hot reload
- Middleware mode integration between Express and Vite
- Dynamic HTML template injection with cache busting

**Production Build:**
- Vite builds client to `dist/public`
- esbuild bundles server to `dist/index.cjs`
- Selected dependencies bundled for faster cold starts
- Static file serving from build directory
- Fallback routing to index.html for SPA

**Environment:**
- NODE_ENV-based configuration
- DATABASE_URL for database connection
- Support for Replit-specific environment variables