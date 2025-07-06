# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server (concurrently runs client and server)
- `npm run dev:client` - Start Vite client development server
- `npm run dev:server` - Start server with tsx watch mode

### Build
- `npm run build` - Build entire project (server + client)
- `npm run build:client` - Build React client with TypeScript check
- `npm run build:server` - Build server TypeScript

### Production
- `npm run start` - Start production build
- `npm run start:client` - Start Vite preview server
- `npm run start:server` - Start built server

### Code Quality
- `npm run lint` - Run ESLint on entire project
- `npm run lint:import-engine` - Run ESLint specifically on import engine

### Database
- `npx prisma migrate dev` - Apply database migrations
- `npx prisma db seed` - Seed database with test data
- `npx prisma generate` - Generate Prisma client

### Import Engine
- `npm run generate:import-types` - Generate TypeScript types for import engine
- `npm run test:import-engine` - Run import engine tests (currently placeholder)

## Architecture

### Project Structure
**Commessa Control Hub** è un'applicazione web per la contabilità e il controllo di gestione per commessa, che consente di monitorare costi, ricavi e analizzare la redditività dei progetti.

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Express.js, TypeScript, Prisma ORM
- **UI**: shadcn/ui components, Tailwind CSS, Radix UI
- **Database**: PostgreSQL
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM v6

### Server Architecture
- **Entry Point**: `server/index.ts` - Express server with comprehensive route registration
- **Routes**: Organized in `server/routes/` with dedicated files for each domain
- **Import Engine**: Complex enterprise-grade import system in `server/import-engine/`
  - **Acquisition**: Parsers and validators for data ingestion
  - **Transformation**: Data transformers and mappers
  - **Orchestration**: Workflow handlers and middleware
  - **Persistence**: Database transactions and DLQ (Dead Letter Queue)
  - **Core**: Services, telemetry, and error handling

### Client Architecture
- **Entry Point**: `src/main.tsx` with React 18 createRoot
- **App**: `src/App.tsx` with QueryClient, routing, and UI providers
- **Components**: 
  - `src/components/ui/` - shadcn/ui components
  - `src/components/database/` - Database management tables and forms
  - `src/components/admin/` - Admin interface components
- **Pages**: `src/pages/` - Main application pages
- **API Layer**: `src/api/` - Frontend API calls using axios
- **Hooks**: `src/hooks/` - Custom React hooks including advanced table management

### Database Schema
Prisma schema defines comprehensive business entities:
- **Core Entities**: Cliente, Fornitore, Commessa, VoceAnalitica, Conto
- **Accounting**: ScritturaContabile, RigaScrittura, Allocazione, CausaleContabile
- **Import System**: ImportScritturaTestata, ImportScritturaRigaContabile, ImportAllocazione
- **Reference Data**: CodiceIva, CondizionePagamento, ImportTemplate
- **Extensions**: Extensive Python parser integration fields

### Key Features
- **Project Management**: Commessa (project) tracking with hierarchical structure
- **Cost Control**: Allocazione system for distributing costs across projects
- **Import System**: Sophisticated fixed-width file parsing with enterprise patterns
- **Reconciliation**: Advanced reconciliation workflows
- **Classification**: Account classification system with badge UI
- **Multi-format Support**: Handles various Italian accounting file formats

### Development Practices
- **TypeScript**: Strict typing throughout the application
- **Prisma**: Database-first approach with comprehensive schema
- **Component Architecture**: Reusable UI components with shadcn/ui
- **API Design**: RESTful Express routes with proper error handling
- **Import Processing**: Enterprise-grade import engine with validation, transformation, and telemetry

### Import Engine Details
The import engine follows enterprise patterns:
- **Acquisition**: Type-safe parsers for fixed-width files
- **Validation**: Comprehensive validators for each entity type
- **Transformation**: Data transformation with decoders and mappers
- **Orchestration**: Workflow-driven processing with handlers
- **Persistence**: Transactional database operations with DLQ support
- **Telemetry**: Comprehensive logging and monitoring

### Environment Configuration
- Requires PostgreSQL database connection via `DATABASE_URL`
- Server runs on port 3001 by default
- Client runs on Vite's default port (5173)
- Uses dotenv for environment variable management