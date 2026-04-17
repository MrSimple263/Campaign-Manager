# Plan: Refactor Backend to Clean Architecture

## TL;DR

Refactor the backend from current "fat controllers" to **Clean Architecture** with 3 layers: **Controller → Service → Repository**, organized by **domain modules** (auth, campaigns, recipients). This improves testability, separation of concerns, and maintainability.

## Current State

- Controllers contain business logic + database queries
- Query helpers exist in `db/queries/` but are **unused**
- Only 1 service exists (`emailService.ts`)
- 3 logical domains: Auth, Campaigns, Recipients

## Target Architecture

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts    # HTTP handling only
│   │   ├── auth.service.ts       # Business logic
│   │   ├── auth.repository.ts    # Data access
│   │   ├── auth.routes.ts        # Route definitions
│   │   └── auth.types.ts         # Module-specific types
│   ├── campaigns/
│   │   ├── campaign.controller.ts
│   │   ├── campaign.service.ts
│   │   ├── campaign.repository.ts
│   │   ├── campaign.routes.ts
│   │   └── campaign.types.ts
│   └── recipients/
│       ├── recipient.controller.ts
│       ├── recipient.service.ts
│       ├── recipient.repository.ts
│       ├── recipient.routes.ts
│       └── recipient.types.ts
├── shared/
│   ├── middleware/
│   ├── utils/
│   ├── constants/
│   └── types/
├── config/
├── db/
│   └── index.ts                  # Knex instance only
├── app.ts
└── index.ts
```

---

## Steps

### Phase 1: Create Module Structure

1. Create `src/modules/` folder with subfolders: `auth/`, `campaigns/`, `recipients/`
2. Move shared code to `src/shared/` (middleware, utils, constants)

### Phase 2: Auth Module

3. Create `auth.repository.ts` — move user queries from controller
   - `findByEmail(email)`, `findById(id)`, `create(data)`, `isEmailTaken(email)`
4. Create `auth.service.ts` — extract business logic
   - `register(input)`, `login(input)`, `getCurrentUser(userId)`
   - JWT generation, password hashing calls
5. Refactor `auth.controller.ts` — HTTP handling only
   - Parse request, call service, format response
6. Move `auth.routes.ts` to module folder
7. Create `auth.types.ts` — module-specific interfaces

### Phase 3: Recipients Module (_parallel with Phase 2_)

8. Create `recipient.repository.ts`
   - `findById(id)`, `findByEmail(email)`, `findMany(options)`, `create(data)`, `findByIds(ids)`
9. Create `recipient.service.ts`
   - `getRecipients(options)`, `createRecipient(input)`
10. Refactor `recipient.controller.ts`
11. Move `recipient.routes.ts` to module folder

### Phase 4: Campaigns Module (_depends on Phase 3 for recipient repo_)

12. Create `campaign.repository.ts`
    - `findById(id)`, `findByIdAndUser(id, userId)`, `findMany(options)`, `create(data)`, `update(id, data)`, `delete(id)`
    - Campaign recipient methods: `addRecipients()`, `clearRecipients()`, `getRecipients()`, `getStats()`
13. Create `campaign.service.ts`
    - `getCampaigns(userId, options)`, `getCampaign(id, userId)`, `createCampaign(userId, input)`, `updateCampaign(id, userId, input)`, `deleteCampaign(id, userId)`, `scheduleCampaign(id, userId, scheduledAt)`, `sendCampaign(id, userId)`
    - Business rules: draft-only edit/delete, future-only scheduling
14. Move `emailService.ts` → `campaign.service.ts` or keep as shared service
15. Refactor `campaign.controller.ts`
16. Move `campaign.routes.ts` to module folder

### Phase 5: Wire Up & Cleanup

17. Update `src/routes/index.ts` to import from modules
18. Delete old `src/controllers/`, `src/routes/auth|campaigns|recipients.ts`
19. Delete unused `src/db/queries/` (replaced by repositories)
20. Update imports across the codebase

---

## Relevant Files

### To Create

- `src/modules/auth/auth.controller.ts`
- `src/modules/auth/auth.service.ts`
- `src/modules/auth/auth.repository.ts`
- `src/modules/auth/auth.routes.ts`
- `src/modules/auth/auth.types.ts`
- `src/modules/campaigns/campaign.controller.ts`
- `src/modules/campaigns/campaign.service.ts`
- `src/modules/campaigns/campaign.repository.ts`
- `src/modules/campaigns/campaign.routes.ts`
- `src/modules/campaigns/campaign.types.ts`
- `src/modules/recipients/recipient.controller.ts`
- `src/modules/recipients/recipient.service.ts`
- `src/modules/recipients/recipient.repository.ts`
- `src/modules/recipients/recipient.routes.ts`
- `src/modules/recipients/recipient.types.ts`
- `src/shared/` — move middleware, utils, constants

### To Delete

- `src/controllers/` — replaced by module controllers
- `src/routes/auth.ts`, `campaigns.ts`, `recipients.ts` — moved to modules
- `src/db/queries/` — replaced by repositories

### To Modify

- `src/routes/index.ts` — import from modules
- `src/app.ts` — may need minor adjustments

---

## Verification

1. **TypeScript Build:** `yarn workspace backend build` — no errors
2. **Tests Pass:** `yarn workspace backend test` — all tests pass
3. **API Unchanged:** Same endpoints, same request/response format
4. **Manual Test:** Register → Login → Create campaign → Send

---

## Decisions

- **Repository returns raw data**, service transforms if needed
- **Services throw AppError** for business rule violations
- **Controllers only handle HTTP** (req parsing, res formatting, status codes)
- **Keep emailService separate** (used internally by campaign.service)
- **One repository per aggregate root** (User, Campaign, Recipient)
- **CampaignRepository handles campaign_recipients** (same aggregate)

---

## Layer Responsibilities

| Layer          | Responsibilities                                          | Does NOT do                |
| -------------- | --------------------------------------------------------- | -------------------------- |
| **Controller** | Parse request, call service, format response, HTTP status | Business logic, DB queries |
| **Service**    | Business rules, orchestration, validation beyond schema   | HTTP handling, raw SQL     |
| **Repository** | Data access, Knex queries, entity mapping                 | Business logic, HTTP       |

---

## Example Flow: Create Campaign

```
Request → Controller.createCampaign()
            ↓
          Service.createCampaign(userId, input)
            ├─→ Validate recipient IDs exist (recipientRepo.findByIds)
            ├─→ Create campaign (campaignRepo.create)
            └─→ Add recipients (campaignRepo.addRecipients)
            ↓
          Return campaign with recipients
            ↓
Response ← Controller formats JSON response
```
