# Mini Campaign Manager

A full-stack email campaign management system built with a modern monorepo architecture.

## Tech Stack

* **Backend:** Node.js, Express, PostgreSQL, Knex
* **Frontend:** React, TypeScript, Vite
* **State Management:** Redux Toolkit
* **Data Fetching:** React Query
* **Validation:** Zod (both backend & frontend)
* **Infrastructure:** Docker, Docker Compose

---

## Local Setup

### Requirements

* Docker
* Docker Compose

### Steps

1. Clone the repository:

```bash
git clone https://github.com/MrSimple263/Campaign-Manager.git
cd https://github.com/MrSimple263/Campaign-Manager.git
```

2. Start all services:

```bash
docker compose up --build
```

3. Access the application:

* Frontend: [http://localhost:80](http://localhost:80)
* Backend: [http://localhost:3000](http://localhost:3000)
* PostgreSQL: localhost:5433

---

## Seed Data / Demo

When running the project with docker compose up the data already seed in service migration :

* Database migrations and seeds run automatically when containers start.

---

## Project Structure

```
packages/
  backend/
    src/
      modules/        # Clean architecture modules
      shared/         # Middleware, utils, constants
      config/         # App config
      db/             # Knex setup
  frontend/
    src/
      components/     # UI components
      pages/          # Application pages
      hooks/          # React Query hooks
      store/          # Redux store
      api/            # API client
```

---

## How I Used Claude Code
 What tasks I delegated to Claude Code

I used Claude Code as a technical planning and structuring assistant, not as an auto code generator. The main areas where it helped:

#### System design & initial planning

-  Generated the full-stack blueprint for the project (monorepo structure, backend/frontend split, API design, DB schema)

#### Feature decomposition into executable steps

- Broke down complex features into clear phases (backend , frontend, testing)
Example: campaign lifecycle (draft → scheduled → sent)

#### Architecture refactoring

- Proposed refactoring from “fat controllers” → Clean Architecture (Controller → Service → Repository)

#### Business rule definition & validation strategy
- Helped formalize rules like:
Only draft campaigns are mutable
scheduled_at must be in the future
sent campaigns are immutable
Suggested where to enforce them (service layer, not controller)

### Test case planning

- Generated structured test scenarios for critical flows

## Real prompts I used

Here are actual types of prompts I used during development:
```
I want to build a mini full-stack email campaign management system using:
- Backend: Node.js + Express + PostgreSQL + Knex
- Frontend: React + TypeScript + Vite + React Query + Redux Toolkit

Please design a clean and scalable architecture for this project.

Requirements:
- Use Clean Architecture (Controller → Service → Repository)
- Suggest folder structure for a monorepo
- Define main modules (auth, campaigns, recipients)
```

```
I currently have a JWT authentication system that stores the token in localStorage.

I want to refactor it to a more secure approach using HTTP-only cookies.

Requirements:
- Design the new authentication flow (login, register, logout)
- Explain how backend should set and verify HTTP-only cookies in Express
- Update frontend approach (React + React Query) to work without localStorage token
- Include security considerations (cookie flags like httpOnly, secure, sameSite)
```

## Where Claude Code was wrong or needed correction
- **Over-engineered architecture suggestions**
- **Missed real-world edge cases (especially auth & CORS)**
- **Generic or incomplete test cases**
- **Security-related decisions (auth, cookies)**
- **Complex database queries and business-rule constraints**
- **Frontend action flow control (e.g. delete → redirect, cache invalidation, refetching, UI side effects across screens)**
- **Docker image optimization**

## What I would NOT let Claude Code do — and why
- **Core business logic check → to ensure correctness**  
  *Reason:* This is the core of the system (campaign state transitions, scheduling, sending flow). Any mistake here directly affects production behavior, so it must be fully controlled and validated by me.