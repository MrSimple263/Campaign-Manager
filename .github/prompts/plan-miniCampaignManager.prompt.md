# Plan: Mini Campaign Manager Full-Stack

## TL;DR
Build a full-stack email campaign manager using a **yarn workspaces monorepo** with Express/PostgreSQL/Knex backend and React/TypeScript/Vite frontend. **Zod validation on both BE and FE**. **React Query for all FE API calls**. Plan separates backend into 11 API endpoints across 4 modules, and frontend into 4 pages with reusable components.

---

## Project Structure

```
Campaign Manager/
├── package.json              # Yarn workspaces root
├── docker-compose.yml        # PostgreSQL + app services
├── README.md
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/       # DB, JWT config
│   │   │   ├── middleware/   # Auth, validation, error handling
│   │   │   ├── db/           # Knex instance & query helpers
│   │   │   ├── routes/       # Express routes
│   │   │   ├── controllers/  # Business logic
│   │   │   ├── services/     # Campaign sending simulation
│   │   │   ├── migrations/   # Knex migrations
│   │   │   ├── seeds/        # Knex seed data
│   │   │   └── index.ts
│   │   ├── tests/
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── components/   # Reusable UI components
│       │   ├── pages/        # Route pages
│       │   ├── hooks/        # Custom hooks (React Query)
│       │   ├── store/        # Redux Toolkit store
│       │   ├── api/          # API client
│       │   ├── types/        # TypeScript types
│       │   └── App.tsx
│       └── package.json
```

---

## Phase 1: Project Setup & Infrastructure

### Step 1.1: Initialize Monorepo
- Create root `package.json` with yarn workspaces
- Configure `packages/backend` and `packages/frontend` workspaces
- Setup shared TypeScript config

### Step 1.2: Docker Compose Setup
- PostgreSQL service (port 5432)
- Backend service (port 3000)
- Frontend service (port 5173, dev mode)
- Environment variables for DB connection

### Step 1.3: Backend Boilerplate
- Express app with TypeScript
- Knex setup with PostgreSQL (knexfile.ts)
- Environment config (dotenv)
- Error handling middleware
- CORS configuration

### Step 1.4: Frontend Boilerplate
- Vite + React 18 + TypeScript
- **React Router v6** for routing
- **@tanstack/react-query** — QueryClientProvider in App.tsx
- Install UI library (shadcn/ui + Tailwind recommended)
- Redux Toolkit store setup (auth state only)
- **react-hook-form + Zod** for form validation (`@hookform/resolvers/zod`)

---

## Phase 2: Backend — Database & Models

### Step 2.1: Database Schema & Migrations (4 tables)

**Migration 1: Users table**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default uuid_generate_v4() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

**Migration 2: Recipients table**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| name | VARCHAR(255) | |
| created_at | TIMESTAMP | DEFAULT NOW() |

**Migration 3: Campaigns table**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| subject | VARCHAR(255) | NOT NULL |
| body | TEXT | NOT NULL |
| status | ENUM | 'draft', 'sending', 'scheduled', 'sent' |
| scheduled_at | TIMESTAMP | NULLABLE |
| created_by | UUID | FK → Users(id) |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

**INDEX:** `idx_campaigns_status` on `status` (filter by status)
**INDEX:** `idx_campaigns_created_at` on `created_at` (cursor-based pagination)

**Migration 4: CampaignRecipients table**
| Column | Type | Constraints |
|--------|------|-------------|
| campaign_id | UUID | PK, FK → Campaigns(id) |
| recipient_id | UUID | PK, FK → Recipients(id) |
| status | ENUM | 'pending', 'sent', 'failed' |
| sent_at | TIMESTAMP | NULLABLE |
| opened_at | TIMESTAMP | NULLABLE |

**INDEX:** `idx_campaign_recipients_campaign_id` on `campaign_id` (stats aggregation)
**INDEX:** `idx_campaign_recipients_status` on `status` (count by status)

**INDEX on Recipients:** `idx_recipients_created_at` on `created_at` (cursor-based pagination)

### Step 2.2: Knex Query Helpers & Types
- TypeScript interfaces for each table (User, Campaign, Recipient, CampaignRecipient)
- Query helper functions in `src/db/` for common operations
- Password hashing utility (bcrypt) called in auth controller
- No ORM models — use Knex query builder directly in controllers/services

---

## Phase 3: Backend — API Endpoints

### Module A: Authentication (2 endpoints)

**API 3.1: POST /auth/register**
- **Zod validation:** `{ email: string.email, name: string.min(1), password: string.min(8) }`
- Check email uniqueness
- Hash password with bcrypt
- Create user, return JWT + user data
- Response: `{ token, user: { id, email, name } }`

**API 3.2: POST /auth/login**
- **Zod validation:** `{ email: string.email, password: string.min(1) }`
- Verify credentials
- Return JWT (expires in 24h)
- Response: `{ token, user: { id, email, name } }`

### Module B: Recipients (2 endpoints)

**API 3.3: GET /recipients**
- Auth required
- **Zod validation:** query params schema
- Query params: `limit`, `cursor`, `search` (cursor-based pagination)
- Response: `{ data: [...], nextCursor, hasMore }`

**API 3.4: POST /recipients**
- Auth required
- **Zod validation:** `{ email: string (unique), name?: string }`
- Response: `{ id, email, name, created_at }`

### Module C: Campaigns CRUD (5 endpoints)

**API 3.5: GET /campaigns**
- Auth required
- **Zod validation:** query params schema
- Query params: `status`, `limit`, `cursor` (cursor-based pagination)
- Include recipient count (subquery or COUNT)
- Response: `{ data: [...], nextCursor, hasMore }`

**API 3.6: POST /campaigns**
- Auth required
- **Zod validation:** `{ name: string.min(1), subject: string.min(1), body: string.min(1), recipient_ids: array(uuid).min(1) }`
- Status defaults to 'draft'
- Create CampaignRecipient entries (status='pending')
- Response: full campaign object with recipients

**API 3.7: GET /campaigns/:id**
- Auth required
- **Zod validation:** `params.id` is valid UUID
- Include recipients with their send status
- Include stats: total, sent, failed, opened, rates
- Response: `{ campaign, recipients, stats }`

**API 3.8: PATCH /campaigns/:id**
- Auth required
- **Zod validation:** `params.id` is valid UUID, body partial of campaign schema
- **Business rule:** Only if status='draft'
- Updatable: name, subject, body, recipient_ids
- If updating recipients, replace CampaignRecipient entries
- Response: updated campaign

**API 3.9: DELETE /campaigns/:id**
- Auth required
- **Zod validation:** `params.id` is valid UUID
- **Business rule:** Only if status='draft'
- Cascade delete CampaignRecipients
- Response: 204 No Content

### Module D: Campaign Actions (2 endpoints)

**API 3.10: POST /campaigns/:id/schedule**
- Auth required
- **Zod validation:** `params.id` is valid UUID, `{ scheduled_at: string.datetime.refine(isFuture) }`
- **Business rule:** Status must be 'draft'
- **Business rule:** scheduled_at must be future timestamp
- Update status to 'scheduled', set scheduled_at
- Response: updated campaign

**API 3.11: POST /campaigns/:id/send**
- Auth required
- **Zod validation:** `params.id` is valid UUID
- **Business rule:** Status must be 'draft' or 'scheduled'
- Set status to 'sending'
- **Async simulation:** For each recipient, randomly:
  - 90% chance: status='sent', sent_at=now
  - 10% chance: status='failed'
- After processing, set campaign status='sent'
- Simulate with `setTimeout` or async queue
- Response: `{ message: "Sending started", campaign }`

### Step 3.12: JWT Auth Middleware
- Extract token from Authorization header
- Verify JWT signature
- Attach user to request object
- Return 401 if invalid/expired

### Step 3.13: Zod Validation Middleware (Backend)
- Create reusable `validate(schema)` middleware factory
- Validates `req.body`, `req.query`, or `req.params` based on schema
- Returns 400 with structured `{ errors: {...} }` on validation failure
- Schemas defined in `src/validations/schemas.ts`:
  - `registerSchema`, `loginSchema`
  - `createCampaignSchema`, `updateCampaignSchema`
  - `scheduleSchema`, `recipientSchema`
  - `paginationSchema` (limit, cursor validation)
  - `uuidParamSchema` (for :id params)

---

## Phase 4: Backend — Testing

### Step 4.1: Test Setup
- Jest or Vitest configuration
- Test database setup (separate DB or transactions)
- Supertest for API integration tests

### Step 4.2: Critical Business Logic Tests (minimum 3)
1. **Test: Cannot edit campaign with status != draft**
   - Create campaign → send → try PATCH → expect 400
2. **Test: Cannot schedule with past timestamp**
   - Create campaign → schedule with past date → expect 400
3. **Test: Send marks recipients correctly**
   - Create campaign with recipients → send → verify statuses

---

## Phase 5: Frontend — Core Setup

### Step 5.1: API Client Layer
- Axios instance with base URL
- Request interceptor: attach JWT from store
- Response interceptor: handle 401 → redirect to login
- API functions for each endpoint

### Step 5.2: TypeScript Types
- Define interfaces for: `User`, `Campaign`, `Recipient`, `CampaignRecipient`, `CampaignStats`
- Define type for `CampaignStatus = 'draft' | 'sending' | 'scheduled' | 'sent'`
- Define pagination response type with `nextCursor` and `hasMore`
- Infer types from Zod schemas where possible

### Step 5.3: Zod Validation Schemas (Frontend)
- `loginSchema` — email, password validation
- `registerSchema` — email, name, password validation
- `campaignSchema` — name, subject, body, recipient_ids validation
- `scheduleSchema` — scheduled_at (must be future timestamp)
- `recipientSchema` — email, name validation
- Export inferred types: `LoginInput`, `CampaignInput`, `ScheduleInput`, etc.
- Schemas mirror backend validation for consistent error handling on both sides

### Step 5.4: Redux Toolkit Auth Slice
- State: `user`, `token`, `isAuthenticated`, `loading`
- Actions: `login()`, `logout()`, `setCredentials()`
- `createAsyncThunk` for login/register
- Persist token (localStorage or memory via redux-persist optional)

### Step 5.5: React Query Hooks (All API Calls)
**Queries (GET requests):**
- `useCampaigns({ status?, limit?, cursor? })` — list campaigns with cursor pagination
- `useCampaign(id)` — single campaign with stats
- `useRecipients({ search?, limit?, cursor? })` — list recipients with cursor pagination

**Mutations (POST/PATCH/DELETE):**
- `useLogin()` — login, store token in Redux on success
- `useRegister()` — register new user
- `useCreateCampaign()` — create campaign, invalidate campaigns list
- `useUpdateCampaign()` — update campaign, invalidate campaign + list
- `useDeleteCampaign()` — delete campaign, invalidate campaigns list
- `useScheduleCampaign()` — schedule campaign, invalidate campaign
- `useSendCampaign()` — send campaign, invalidate campaign
- `useCreateRecipient()` — create recipient, invalidate recipients list

**React Query Benefits:**
- Automatic caching & background refetching
- Loading/error states built-in
- Mutation invalidation for cache sync
- Cursor-based pagination with `useInfiniteQuery` option

---

## Phase 6: Frontend — Components

### Component 6.1: Layout & Navigation
- `AppLayout` — header, sidebar/nav, main content
- `ProtectedRoute` — redirect to login if not authenticated

### Component 6.2: Reusable UI Components
- `StatusBadge` — color-coded by campaign status
  - draft = grey
  - sending = yellow
  - scheduled = blue
  - sent = green
- `LoadingSpinner` — centered spinner
- `SkeletonLoader` — placeholder while loading
- `ErrorAlert` — styled error message display
- `StatsCard` — display rate with progress bar
- `LoadMoreButton` — cursor-based pagination trigger
- `ConfirmDialog` — confirmation modal for destructive actions

### Component 6.3: Campaign Components
- `CampaignCard` — list item with name, status badge, recipient count
- `CampaignForm` — create/edit form (name, subject, body, recipients)
- `RecipientSelector` — multi-select recipients or enter emails
- `CampaignActions` — conditional buttons (Schedule, Send, Delete)
- `CampaignStats` — open rate, send rate progress bars
- `RecipientList` — table of recipients with status

---

## Phase 7: Frontend — Pages

### Page 7.1: /login
- Login form: email, password
- **Zod + react-hook-form** for validation
- **React Query mutation** (`useLogin`) for API call
- On success: store token in Redux, redirect to /campaigns
- Show `isLoading` state during submission
- Display `error` from mutation below form

### Page 7.2: /campaigns (List)
- **React Query** `useCampaigns({ status, limit, cursor })` for data fetching
- Display campaign cards with status badges
- Show `isLoading` → skeleton loader
- Show `data.length === 0` → empty state
- Link to /campaigns/new
- **Cursor-based pagination:** "Load More" button using `nextCursor`

### Page 7.3: /campaigns/new (Create)
- **Zod + react-hook-form** for campaign form validation
- Recipient selector uses `useRecipients()` query
- **React Query mutation** `useCreateCampaign()` on submit
- On success: redirect to /campaigns/:id
- Show validation errors inline, API errors in toast

### Page 7.4: /campaigns/:id (Detail)
- **React Query** `useCampaign(id)` for data + stats
- Display campaign info + stats cards
- Recipient list table with status badges
- Action buttons (conditional) use mutations:
  - **Schedule:** `useScheduleCampaign()` mutation
  - **Send:** `useSendCampaign()` mutation  
  - **Delete:** `useDeleteCampaign()` mutation
- Show `isLoading` states on buttons during mutations
- Confirmation dialogs before destructive actions

---

## Phase 8: Polish & Documentation

### Step 8.1: Error Handling
- Global error boundary (React)
- API error extraction and display
- 404 page for unknown routes

### Step 8.2: Docker Compose Final
- Production build commands
- DB initialization script
- Health checks

### Step 8.3: Seed Data Script
- Create demo user
- Create sample campaigns in various states
- Create sample recipients

### Step 8.4: README.md
- Project overview
- Local setup instructions (`docker compose up`)
- API documentation summary
- **"How I Used Claude Code"** section

---

## Relevant Files (to be created)

**Root:**
- `package.json` — yarn workspaces config
- `docker-compose.yml` — services definition
- `README.md` — documentation

**Backend (`packages/backend/`):**
- `src/index.ts` — Express app entry
- `src/config/database.ts` — Knex instance export
- `src/config/auth.ts` — JWT secret, expiry
- `knexfile.ts` — Knex configuration (dev, test, prod)
- `src/middleware/auth.ts` — JWT verification
- `src/middleware/validate.ts` — Zod validation middleware
- `src/middleware/errorHandler.ts` — Global error handler
- `src/db/index.ts` — Knex instance
- `src/db/types.ts` — TypeScript interfaces for tables
- `src/routes/auth.ts` — Auth routes
- `src/routes/campaigns.ts` — Campaign routes
- `src/routes/recipients.ts` — Recipient routes
- `src/controllers/authController.ts` — Auth logic
- `src/controllers/campaignController.ts` — Campaign CRUD + actions
- `src/controllers/recipientController.ts` — Recipient CRUD
- `src/services/emailService.ts` — Send simulation
- `src/validations/schemas.ts` — Zod schemas
- `migrations/` — Knex migration files
- `seeds/` — Knex seed files
- `tests/campaigns.test.ts` — Business logic tests

**Frontend (`packages/frontend/`):**
- `src/App.tsx` — React Router v6 setup + QueryClientProvider
- `src/api/client.ts` — Axios instance with auth interceptor
- `src/api/auth.ts` — Auth API functions (login, register)
- `src/api/campaigns.ts` — Campaign API functions
- `src/api/recipients.ts` — Recipient API functions
- `src/store/authSlice.ts` — Redux Toolkit auth slice
- `src/store/index.ts` — Redux store configuration
- `src/hooks/useAuth.ts` — Auth mutation hooks (useLogin, useRegister)
- `src/hooks/useCampaigns.ts` — Campaign React Query hooks (queries + mutations)
- `src/hooks/useRecipients.ts` — Recipient React Query hooks
- `src/types/index.ts` — TypeScript interfaces
- `src/validations/schemas.ts` — Zod schemas (mirrors backend for consistency)
- `src/components/StatusBadge.tsx`
- `src/components/CampaignCard.tsx`
- `src/components/CampaignForm.tsx` — Uses react-hook-form + Zod
- `src/components/CampaignStats.tsx`
- `src/components/RecipientList.tsx`
- `src/pages/LoginPage.tsx` — Uses react-hook-form + Zod + useLogin mutation
- `src/pages/CampaignsPage.tsx` — Uses useCampaigns query
- `src/pages/CampaignNewPage.tsx` — Uses useCreateCampaign mutation
- `src/pages/CampaignDetailPage.tsx` — Uses useCampaign query + action mutations

---

## Verification

1. **Backend API Tests:** Run `yarn workspace backend test` — all 3+ tests pass
2. **Manual API Test:** Use Postman/curl to verify auth flow and campaign CRUD
3. **Frontend Build:** `yarn workspace frontend build` — no TypeScript errors
4. **End-to-End Flow:** 
   - Register user → Login → Create campaign → Add recipients → Schedule → Send → View stats
5. **Docker:** `docker compose up` starts all services successfully
6. **Business Rules:** 
   - Try editing sent campaign → expect error
   - Try scheduling with past date → expect error

---

## Decisions

- **Knex** query builder with migrations (lightweight, flexible SQL control, no heavy ORM)
- **Zod validation on BOTH sides:**
  - Backend: validation middleware on every API endpoint, returns 400 with structured errors
  - Frontend: react-hook-form + @hookform/resolvers/zod for instant client validation
- **React Query (@tanstack/react-query)** for ALL frontend API calls:
  - `useQuery` for GET requests (campaigns list, campaign detail, recipients)
  - `useMutation` for POST/PATCH/DELETE with cache invalidation
- **Cursor-based pagination** (nextCursor) instead of offset-based for better performance on large datasets
- **React Router v6** for client-side routing (industry standard, excellent React 18 support)
- **Redux Toolkit** for auth state only (user, token, isAuthenticated)
- **Recipient Selection:** Select existing + inline create (user selected)
- **shadcn/ui + Tailwind** for styling (modern, tree-shakeable, customizable)
- **UUID** for all IDs (better for distributed systems, no auto-increment exposure)
- **Async send simulation** using setTimeout (keeps it simple, no queue needed)
