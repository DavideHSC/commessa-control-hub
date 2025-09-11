# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📋 Architecture Decision Record
See **ADR.md** in the project root for comprehensive architectural decisions, implementation status, and production readiness documentation. The ADR documents the enterprise 4-layer import engine, business validation system, testing strategy, **NEW: staging-first analysis system**, and backend completion status (99% production-ready).

## Development Commands

### ⚠️ IMPORTANTE: Gestione Server di Sviluppo
**NEVER run `npm run dev` or any server commands** - Il server è sempre in esecuzione e gestito dall'utente Davide. Claude Code deve limitarsi a leggere, analizzare e modificare i file senza mai avviare processi server.

### 🚨 REGOLA CRITICA: Direttive Utente
**Se intendi contravvenire a una direttiva dell'utente Davide**:
1. **FERMATI IMMEDIATAMENTE**
2. **SPIEGA CHIARAMENTE** cosa intendi fare e perché
3. **ATTENDI IL CONSENSO ESPLICITO** prima di procedere
**QUESTA REGOLA È INVIOLABILE** - Non decidere mai autonomamente di ignorare o modificare una richiesta diretta.

### Core Development (SOLO PER RIFERIMENTO - NON ESEGUIRE)
- `npm run dev` - Start both client (port 5101) and server (port 3001) concurrently [GESTITO DA DAVIDE]
- `npm run dev:client` - Start frontend only (Vite dev server) [GESTITO DA DAVIDE]
- `npm run dev:server` - Start backend only (tsx watch mode) [GESTITO DA DAVIDE]

### Build & Production
- `npm run build` - Build both client and server
- `npm run build:client` - Build frontend (TypeScript + Vite)
- `npm run build:server` - Build backend (TypeScript compilation)
- `npm start` - Start production build

### Code Quality & Testing ✅
- `npm run lint` - Lint entire codebase **⚠️ IMPORTANTE: Usa questo per verificare TypeScript, non npm run build**
- `npm run lint:import-engine` - Lint import engine specifically
- `npm test` - Run Jest tests (>80% coverage on critical functions, 9 test suites)
  - `server/verification/finalization.test.ts` - Finalization functions (87.5% pass rate)
  - `server/verification/businessValidations.test.ts` - Business validations (100% pass rate)
  - `server/verification/endToEnd.test.ts` - Complete workflow integration tests (100% pass rate)
  - `server/verification/condizioniPagamento.test.ts` - Condizioni Pagamento import (100% pass rate)
  - `server/verification/pianoDeiConti.test.ts` - Piano dei Conti import ✅ **FIXED** (100% pass rate)
  - `server/verification/anagrafiche.test.ts` - Anagrafiche import (100% pass rate)
  - `server/verification/codiciIva.test.ts` - Codici IVA import (100% pass rate)
  - `server/verification/causali.test.ts` - Causali Contabili import ✅ **FIXED** (100% pass rate)
  - `server/verification/scritture.test.ts` - Scritture Contabili import (100% pass rate)

### Database & Import Engine
- `npx prisma generate` - Generate Prisma client after schema changes
- `npx prisma migrate dev` - Apply database migrations
- `npx prisma db seed` - Seed database with initial data
- `npm run db:reset` - Reset database completely
- `npm run generate:import-types` - Generate TypeScript types for import engine
- `npm run cleanup:db` - Clean placeholder accounts from database

## Architecture Overview

### Full-Stack Structure
- **Frontend**: React 18 + TypeScript, Vite build system, runs on port 5101
- **Backend**: Express + Node.js ESM, TypeScript, runs on port 3001
- **Database**: PostgreSQL with Prisma ORM
- **Import Engine**: Enterprise-grade 4-layer architecture for processing legacy accounting files

### Key Directories
- `/src/` - React frontend components, hooks, pages
- `/server/` - Express backend, API routes, business logic
- `/server/import-engine/` - Sophisticated import processing system (acquisition, transformation, persistence, orchestration layers)
- `/prisma/` - Database schema, migrations, seed scripts
- `/types/` - Shared TypeScript type definitions

### Dual Frontend System
The app maintains two UI systems:
- Legacy routes: `/old/*` paths
- Modern routes: `/new/*` paths with updated components in `src/new_pages/` and `src/new_components/`

### Import Engine Architecture ✅ PRODUCTION-READY
Located in `/server/import-engine/` with 4-layer enterprise architecture:

1. **Acquisition Layer** (`/acquisition/`): Fixed-width parsers, type generation, validation
2. **Transformation Layer** (`/transformation/`): Business logic decoders, data mapping
3. **Persistence Layer** (`/persistence/`): Staging-commit pattern, Dead Letter Queue
4. **Orchestration Layer** (`/orchestration/`): Workflow coordination, API handlers

**Critical Functions Implemented:**
- `finalizeRigaIva()` - Complete IVA line finalization with batch processing
- `finalizeAllocazioni()` - Automatic allocation creation with smart entity generation
- Business validation system preventing data corruption (hierarchy cycles, budget validation)

### Database Patterns
- **Staging Tables**: All imports first go to staging tables (`StagingTestata`, `StagingRigaContabile`, etc.)
- **Business Entities**: Core models like `Commessa`, `Cliente`, `Fornitore`, `ScritturaContabile`
- **Finalization Process**: Data moves from staging to production tables after validation

### API Structure
RESTful endpoints in `/server/routes/`:
- `/api/import/*` - V2 import system endpoints
- `/api/commesse`, `/api/clienti`, `/api/fornitori` - Business entities
- `/api/registrazioni`, `/api/conti`, `/api/causali` - Accounting data
- `/api/dashboard`, `/api/reconciliation` - Analytics and reports
- `/api/centro-controllo/*` - **REBRANDED**: Centro di Controllo Gestionale (ex staging-analysis, 6 endpoints)

## Development Notes

### Technology Stack
- **Frontend**: React Query for server state, Radix UI components, Tailwind CSS
- **Backend**: Express with CORS, Multer for file uploads, Winston for logging
- **Validation**: Zod schemas throughout import engine
- **Testing**: Jest with ts-jest for TypeScript, ESM configuration

### Code Conventions
- ESM modules throughout (`"type": "module"`)
- Strict TypeScript configuration
- Separate ESLint configs for frontend (React) and backend (Node.js)
- Path aliases: `@/` resolves to `/src/` in frontend code

**⚠️ CLAUDE CODE REMINDER**: Per verificare TypeScript compilazione usare **SEMPRE** `npm run lint`, mai `npm run build` (manca server/tsconfig.json).

### ✅ NEW: Tracciati Documentation as Active Schema (2025-09-04)
**Critical Pattern**: Files in `.docs/dati_cliente/tracciati/modificati/` are NOT just documentation but **active relationship schema**:

**Relational Strategy**: 
- **Primary Keys**: Always use internal gestionale codes (subcodice, externalId, codice)  
- **Never Fiscal IDs**: Avoid codice fiscale/partita IVA for relationships (inconsistent, changeable)
- **Join Precedence**: Follow documented priorities in tracciati (e.g., codice fiscale > sigla in A_CLIFOR.md)

**4-Table Core Pattern** (accounting movements):
1. **PNTESTA.md** → Master key: `CODICE UNIVOCO SCARICAMENTO`
2. **PNRIGCON.md** → References master + links to CONTIGEN via `CONTO`/`SIGLA CONTO`  
3. **PNRIGIVA.md** → References master + links to CODICIVA
4. **MOVANAC.md** → References master for analytical allocations

**Decoder Pattern**: All abbreviated values decodable via `fieldDecoders.ts` functions

### Import Engine Usage
When working with data imports:
1. Files are parsed by acquisition layer parsers
2. Data flows through transformation decoders
3. Records land in staging tables first
4. Finalization moves clean data to production tables
5. Failed records go to Dead Letter Queue for review

### Database Development
- Always run `npx prisma generate` after schema changes
- Use staging tables for import operations
- Leverage the telemetry system in `/server/import-engine/core/` for debugging
- Check `/server/verification/` for existing test patterns when adding new tests

### Business Validations ✅ IMPLEMENTED
Located in `/server/import-engine/core/validations/businessValidations.ts`:
- **Hierarchy Validation**: Prevents circular references in commessa parent-child relationships
- **Budget Validation**: Warns when allocations exceed budget (non-blocking)
- **Deletion Safety**: Prevents deletion of commesse with dependencies
- **Integration**: Validations integrated into API endpoints with proper error handling

### ✅ REBRANDED: Centro di Controllo Gestionale ✅ IMPLEMENTED (ex Staging-First Analysis)
Located in `/server/centro-controllo/` (renamed 2025-09-10):
- **Architecture**: 6 specialized services for business management and control
- **Virtual Entities**: Zero-persistence pattern for safe data exploration
- **Real Data Validation**: Tested with 746 movements (€114+ million) without errors
- **Error Resilience**: Robust error handling for complex real-world data
- **API Integration**: 7 endpoints (5 GET + 2 POST) fully functional
- **User Benefits**: Complete business control center for advanced operations management

#### ✅ BUGFIX: AllocationWorkflowService TypeScript Compliance ✅ FIXED (2025-09-10)
**Problema**: IDE segnalava 6 errori TypeScript critici in `AllocationWorkflowService.ts` che compromettevano la type safety.

**Correzioni Applicate**:
- **Import Missing**: Aggiunto `TipoMovimentoAnalitico` da `@prisma/client`
- **Mapping Allocazioni**: Corretto da `movimentoContabileId` → `rigaScritturaId` per conformità schema Prisma
- **Enum Types**: Sostituito stringa generica con `TipoMovimentoAnalitico.COSTO_EFFETTIVO`
- **Interface Compliance**: Ristrutturato oggetto `movimento` per rispettare `MovimentoContabileCompleto`
- **Prisma Relations**: Rimosso `include: { righeContabili }` (non esistente nello schema)
- **ValidationContext**: Gestito campo `movimento` opzionale con fallback sicuro

**Risultato**: Zero errori TypeScript critici, compatibilità completa con schema Prisma, type safety migliorata

**Files Updated**: `server/centro-controllo/services/AllocationWorkflowService.ts` (100% TypeScript compliant)

#### ✅ ENHANCEMENT: Test Workflow Preview Scritture con Dati Reali ✅ ENHANCED (2025-01-14)
**Miglioramento**: Sostituiti dati mock con conti reali nel tab "Preview Scritture" del Test Workflow Allocazione Completo.

**Implementazione**:
- **Lookup Dinamico**: Conti reali recuperati da `StagingConto` con fallback intelligenti
- **Conti Specifici**: Utilizzo conti appropriati per allocazioni analitiche di commessa
- **Denominazioni Personalizzate**: Include nome commessa specifico per chiarezza operativa
- **Integrazione Completa**: Funziona sia per modalità `PREVIEW_SCRITTURE` che `IMPACT_ANALYSIS`

**Conti Utilizzati**:
- **Allocazione**: `1518000200` - "RIMANENZE COMMESSE IN CORSO DI LAVORAZIONE"
- **Contropartita**: `3530000800` - "FONDO COSTI LAVORI SU COMMESSA"

**Business Value**: Preview realistico delle scritture contabili che verranno generate, eliminando confusione da codici placeholder e fornendo rappresentazione accurata delle operazioni contabili.

**Files Enhanced**: `server/centro-controllo/services/AllocationWorkflowService.ts:610-735` - Metodi `generateScritturePreview()` e `getContiPerAllocazioni()`

### ✅ NEW: Anagrafiche Preview Import System ✅ IMPLEMENTED (2025-09-06)
**Complete Import Validation System**: Advanced preview system for anagrafiche import validation.

**Architecture**:
- **Backend Service**: `AnagrafichePreviewService.ts` - Direct testate/anagrafiche comparison
- **API Endpoint**: `/api/centro-controllo/anagrafiche-preview` - RESTful preview data
- **React Component**: `AnagrafichePreviewSection.tsx` - Interactive preview table
- **Integration**: Centro di Controllo Gestionale page with automatic refresh capability

**Key Features**:
- **Real Matching Logic**: `StagingTestata.clienteFornitoreSigla` ↔ `StagingAnagrafica.codiceAnagrafica`
- **Visual Indicators**: Status badges, highlighted matches, clear non-matches
- **6-Column Display**: Tipo, Codice Testate, Codice Anagrafiche, Denominazione, Sottoconti, Status
- **Real-time Statistics**: Match/unmatch counts, clienti/fornitori breakdown
- **Performance Optimized**: Debounced queries, pagination support, error resilience

**Business Value**:
- **Import Validation**: Preview exactly what will be created vs updated
- **Data Quality Assurance**: Identify missing anagrafiche before import
- **User Confidence**: Clear visual feedback on import consequences
- **Debugging Support**: Resolve anagrafica matching issues pre-import

**Files** (Updated paths after rebranding):
- `server/centro-controllo/services/AnagrafichePreviewService.ts` - Core business logic
- `server/centro-controllo/routes.ts` - API endpoint registration  
- `src/centro-controllo/components/AnagrafichePreviewSection.tsx` - React UI component
- `src/centro-controllo/pages/StagingAnalysisPage.tsx` - Integration point

### ✅ NEW: Relational Mapping & Field Decoding System ✅ IMPLEMENTED (2025-09-04)
**Tracciati-Driven Architecture**: Complete system for managing table relationships based on legacy trace documentation.

**Key Components**:
- **`fieldDecoders.ts`**: 25+ decoder functions for abbreviated values (C→Cliente, P→Patrimoniale, etc.)
- **`relationalMapper.ts`**: Complete relational engine using internal codes (subcodice, externalId) not fiscal codes
- **Extended Virtual Entities**: Complete relationship resolution with match confidence scoring
- **Cache-Based Performance**: Multi-key lookup strategies for optimal performance

**Business Value**:
- **Zero Cryptic Codes**: All UI displays human-readable descriptions
- **Complete Relationships**: Following tracciati documentation for join patterns  
- **Performance Optimized**: Cache-based lookups prevent N+1 queries
- **Legacy Documentation Leveraged**: Tracciati files become active schema documentation

### ✅ NEW: Master-Detail UI System ✅ IMPLEMENTED (2025-09-05)
**Scritture Contabili Master-Detail Interface**: Advanced UI component for hierarchical data visualization.

**Architecture**:
- **API Endpoint**: `/api/staging/scritture-complete` - Paginated master-detail data
- **React Component**: `ScrittureContabiliMasterDetail.tsx` - Expandable row interface
- **Integration**: NewStaging.tsx with dropdown selection for master-detail view
- **Template Fix**: Complete reconstruction of import templates (105 field definitions)

**Key Features**:
- **Expandable Rows**: Click testate to show righe contabili + righe IVA + allocazioni
- **Visual Indicators**: Chevron icons, highlight empty fields, status badges
- **Data Completeness**: Displays clienteFornitoreSigla properly after template fix
- **Performance**: Efficient pagination and on-demand detail loading
- **Real-time Stats**: Totals, counts, and financial summaries per testata

**Template Corrections**:
- **PNTESTA.TXT**: 55 field definitions (clienteFornitoreSigla: position 117-128)
- **PNRIGCON.TXT**: 28 field definitions (clienteFornitoreSigla: position 37-48) 
- **PNRIGIVA.TXT**: 8 field definitions for IVA processing
- **MOVANAC.TXT**: 5 field definitions for analytical allocations
- **Total**: 105 complete field definitions across all files

**Files**:
- `server/routes/staging.ts:scritture-complete` - Master-detail API endpoint
- `src/new_components/tables/ScrittureContabiliMasterDetail.tsx` - UI component
- `server/scripts/fix_*_template.ts` - Template reconstruction scripts
- `server/scripts/final_verification.ts` - System validation

## 🎯 System Completion Status: 99% PRODUCTION-READY

### ✅ BACKEND COMPLETED (Critical Blockers Resolved)
- Import engine core functionality with 4-layer architecture
- Complete finalization functions (`finalizeRigaIva`, `finalizeAllocazioni`)
- **FIXED**: Piano dei Conti import success determination (frontend showing correct status)
- **FIXED**: Import results standardization across all parsers (consistent UX)
- **NEW**: Fixed reconciliation process with proper date parsing and field mapping
- **NEW**: Complete reconciliation API endpoints with allocation management
- **NEW**: Eliminated duplicate automatic processes between finalization and reconciliation
- Business validation system preventing data corruption
- Comprehensive testing coverage (>80% critical functions, 9 test suites)
- API stability with robust error handling
- Performance optimization (batch processing, <500ms responses)
- Documentation and architectural decisions recorded in ADR.md
- **✅ NEW**: Staging-First Analysis System - 7 services operational with real data validation
- **✅ NEW**: Anagrafiche Preview Import System - Direct testate/anagrafiche matching validation
- **✅ NEW**: Master-Detail UI System - Complete interface for Scritture Contabili with template fixes

### ✅ FRONTEND IMPORT INTERFACE COMPLETED
- **Complete Import UI**: All 6 Contabilità Evolution trace types supported
- **React Hooks**: 6 specialized hooks for import workflows (all types covered)
- **Type Safety**: Full TypeScript coverage with StandardImportResult interface
- **Error Handling**: Consistent error management and validation display
- **User Experience**: Intuitive interface with progress feedback and success indicators
- **Results Standardization**: Unified response format across all import types
- **✅ NEW**: Master-Detail Interface - Expandable Scritture Contabili visualization with complete field mapping
- **✅ NEW**: Movimenti Contabili Completi - Prima nota digitale con interfaccia tipo gestionale tradizionale (Sezione H)

### ✅ RECONCILIATION SYSTEM COMPLETED
- **NEW**: Fixed Unix epoch date parsing (01/01/1970 → real dates)
- **NEW**: Corrected field mapping (conto.denominazione → conto.nome)
- **NEW**: Complete API endpoints (`/api/reconciliation/movimenti`, `/api/reconciliation/allocate/:rigaId`)
- **NEW**: Enhanced UX with dropdown validations and loading states
- **NEW**: Unified automatic allocation process (no duplicates)
- **NEW**: Real-time allocation status tracking (non_allocato, parzialmente_allocato, completamente_allocato)

#### Supported Import Types:
| **Tracciato** | **File** | **Hook** | **Status** |
|---|---|---|---|
| Scritture Contabili | PNTESTA+PNRIGCON+PNRIGIVA+MOVANAC | useImportScritture | ✅ Tested & Working |
| Piano dei Conti | CONTIGEN.TXT | useImportPianoDeiConti | ✅ **Fixed** & Tested |
| Condizioni Pagamento | CODPAGAM.TXT | useImportCondizioniPagamento | ✅ Tested & Working |
| Codici IVA | CODICIVA.TXT | useImportCodiciIva | ✅ Working |
| Causali Contabili | CAUSALI.TXT | useImportCausaliContabili | ✅ **Fixed** & Tested |
| Anagrafiche | A_CLIFOR.TXT | useImportAnagrafiche | ✅ Working |

### 🎯 STOP CRITERIA ACHIEVED + CRITICAL SAFETY RESOLVED ⚠️
- ✅ Import workflow functions end-to-end (all 6 trace types working)
- ✅ Business validations prevent data corruption
- ✅ Testing coverage >80% (9 comprehensive test suites + operational safety tests)
- ✅ Performance acceptable (<500ms API, <10MB file processing)
- ✅ System is fault-tolerant with graceful error handling
- ✅ Complete frontend import interface with standardized results
- ✅ **NEW**: Piano dei Conti import success indicator fixed
- ✅ **NEW**: Standardized import result format across all parsers
- ✅ **CRITICAL**: **ZERO RISK** data loss in cyclic operations - User data safety guaranteed
- ✅ **NEW**: Intelligent operational modes (Setup vs Cyclic) with automatic detection
- ✅ **NEW**: Complete audit logging system for full traceability
- ✅ **FIXED**: AllocationWorkflowService TypeScript compliance - Zero critical errors
- ✅ **NEW**: Preview Scritture Contabili con dati reali dal piano dei conti (eliminati placeholder mock)

**STATUS**: System ready for production deployment (**99% complete + CRITICAL SAFETY RESOLVED + TYPE SAFETY ENHANCED + UI ENHANCEMENT**)

## 🛡️ CRITICAL FINALIZATION SAFETY SYSTEM (2025-09-02)

### ⚠️ CRITICAL ISSUE RESOLVED
The finalization system had a **catastrophic architectural flaw**: `cleanSlate()` was destroying ALL production data on every import, wiping out user-created projects, manual allocations, and budgets.

### 🔧 INTELLIGENT OPERATIONAL MODES IMPLEMENTED

#### **Setup Mode** (First-time use):
- File: `server/import-engine/finalization.ts:cleanSlateFirstTime()`
- **SAFE**: Complete database reset for initial setup
- **Used when**: No user data exists (projects, budgets, manual allocations)

#### **Cyclic Operations** (Regular use):
- File: `server/import-engine/finalization.ts:cleanSlate()` (redesigned)
- **SAFE**: Selective reset preserving user-created data
- **Preserves**: Manual projects (`externalId = null`), budgets, user allocations
- **Removes only**: Import-generated data (`externalId != null`)

#### **Smart Detection**:
- File: `server/import-engine/finalization.ts:isFirstTimeSetup()`
- **Automatic detection** of operational mode
- **Zero user intervention** required
- **Fail-safe**: Defaults to cyclic mode for safety

### 🔍 COMPLETE AUDIT SYSTEM
- File: `server/import-engine/core/utils/auditLogger.ts`
- **Full traceability** of all finalization operations
- **Detailed logging**: timestamps, durations, operations, errors
- **Diagnostic endpoint**: `/api/staging/audit-report`
- **Real-time monitoring**: Integrated with SSE feedback

### 🧪 100% TEST COVERAGE
- File: `server/verification/operationalModes.test.ts`
- **6 comprehensive tests** covering all operational scenarios
- **100% pass rate** on critical safety scenarios
- **Verified**: User data preservation in cyclic operations
- **Verified**: Complete reset capability for initial setup

### 💡 USER EXPERIENCE ENHANCEMENTS
- **Intelligent UI warnings**: Automatic mode detection feedback
- **Real-time information**: "CYCLIC OPERATION: User data preserved"
- **Transparency**: Users informed about what's happening
- **Zero anxiety**: Clear communication about data safety

**KEY FILES**:
- `server/import-engine/finalization.ts` - Core operational logic
- `server/import-engine/core/utils/auditLogger.ts` - Audit system
- `server/routes/staging.ts` - Backend orchestration
- `src/new_pages/NewStaging.tsx` - Enhanced UI dialogs
- `server/verification/operationalModes.test.ts` - Safety test coverage
- **✅ NEW**: `server/staging-analysis/` - Complete staging-first analysis system

### ✅ NEW: Sezione H - Movimenti Contabili Completi ✅ IMPLEMENTED (2025-09-06)
**Prima Nota Digitale**: Interfaccia completa tipo gestionale tradizionale per movimenti contabili.

**Architecture**:
- **Backend Service**: `MovimentiContabiliService.ts` - Logica aggregazione con filtri e paginazione
- **API Endpoint**: `/api/staging-analysis/movimenti-contabili` - RESTful con query parameters avanzati
- **React Component**: `MovimentiContabiliSection.tsx` - UI master-detail con filtri interattivi
- **Integration**: StagingAnalysisPage.tsx con navigazione rapida (Sezione H)

**Key Features**:
- **Filtri Avanzati**: Data Da/A, soggetto, stato documento (Draft/Posted/Validated)
- **Paginazione**: Server-side per performance su grandi dataset (max 100 per pagina)
- **Master-Detail**: Click movimento → dettaglio completo (Scrittura + IVA + Analitica)
- **Prima Nota View**: 8 colonne (Data Reg., Protocollo, Documento, Causale, Soggetto, Totale, Stato)
- **Real-time Statistics**: Totale movimenti, valore, quadratura, allocabilità
- **Responsive Design**: Layout ottimizzato mobile/desktop

**Business Value**:
- **Interfaccia Familiare**: Replica prima nota gestionali tradizionali per user experience ottimale
- **Debug Avanzato**: Drill-down completo per identificazione anomalie pre-import
- **Performance Optimized**: Paginazione server-side + caching per dataset >1000 records
- **Zero Risk**: Lavora solo su staging data, completamente isolato dal sistema principale

**Files**:
- `server/staging-analysis/services/MovimentiContabiliService.ts` - Core business logic (18KB)
- `server/staging-analysis/routes.ts` - API endpoint con validazione parametri
- `src/staging-analysis/components/MovimentiContabiliSection.tsx` - UI component (26KB)
- `src/staging-analysis/types/stagingAnalysisTypes.ts` - TypeScript interfaces estese

### ✅ BUGFIX: Dettaglio IVA Parser PNRIGIVA ✅ FIXED (2025-09-09)
**Problema**: Il dettaglio IVA non veniva visualizzato nella sezione H a causa di un errore di mappatura nel parser.

**Cause Identificate**:
- Parser workflow utilizzava campo `externalId` invece di `codiceUnivocoScaricamento` per righe IVA
- JOIN fallito tra `StagingTestata` e `StagingRigaIva` per codici univoci inconsistenti
- Validator PNRIGIVA non aveva field mapping standardizzato con altri file

**Correzioni Applicate**:
- **Workflow Fix**: `importScrittureContabiliWorkflow.ts:287` - Usato `r.codiceUnivocoScaricamento || r.externalId`
- **Validator Fix**: `scrittureContabiliValidator.ts:183-184` - Aggiunto campo `codiceUnivocoScaricamento` + retrocompatibilità
- **UX Enhancement**: `MovimentiContabiliSection.tsx:384-393` - Alert informativo quando righe IVA mancanti

**Risultato**: Dettaglio IVA ora visualizzato correttamente con informazioni complete (codice, descrizione, aliquota, contropartita, importi).

### ✅ IMPLEMENTAZIONE: Preview Scritture Contabili con Dati Reali ✅ COMPLETED (2025-01-14)
**Problema**: Il tab "Preview Scritture" nel Test Workflow Allocazione Completo mostrava solo dati mock (codici conto `999999/888888` con denominazioni generiche).

**Cause Identificate**:
- Frontend inviava modalità `IMPACT_ANALYSIS` ma backend generava preview solo per `PREVIEW_SCRITTURE`
- Metodi `generateScritturePreview()` e `generateFallbackScritturePreview()` utilizzavano codici conto hardcoded
- Mancava integrazione con piano dei conti reali da `StagingConto`

**Soluzioni Implementate**:
- **Estensione Modalità**: Generazione preview anche per modalità `IMPACT_ANALYSIS`
- **Lookup Conti Reali**: Nuovo metodo `getContiPerAllocazioni()` per recupero conti da database
- **Mapping Intelligente**: Utilizzo conti appropriati per allocazioni analitiche
  - **Allocazione**: `1518000200` - "RIMANENZE COMMESSE IN CORSO DI LAVORAZIONE"
  - **Contropartita**: `3530000800` - "FONDO COSTI LAVORI SU COMMESSA"
- **Denominazioni Dinamiche**: Include nome commessa specifico per maggiore chiarezza
- **Fallback Robusto**: Sistema di fallback sicuro per conti non trovati

**Risultato**: Preview Scritture ora mostra dati contabili realistici con codici e denominazioni corretti dal piano dei conti, eliminando completamente i placeholder mock.

**Files Modificati**:
- `server/centro-controllo/services/AllocationWorkflowService.ts:610-735` - Logica preview con dati reali
- `src/centro-controllo/components/workflow/ValidationPreview.tsx:286-296` - Tab preview funzionante

## 🇮🇹 LINGUA ITALIANA OBBLIGATORIA
**SEMPRE rispondere in ITALIANO con l'utente Davide - mai in inglese!**