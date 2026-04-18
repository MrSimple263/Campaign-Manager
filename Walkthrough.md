# Walkthrough — Mini Campaign Manager

## Tech Stack

**Backend**
- Node.js, Express
- PostgreSQL
- Knex (migrations, query builder)
- Zod (validation)

**Frontend**
- React, TypeScript, Vite
- Redux Toolkit (state management)
- React Query (data fetching)
- Zod (validation)

**Infrastructure**
- Docker, Docker Compose

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
      migrations/             # Knex migrations
      routes/             # Define route http api
      validations/  # Define zod validation request
    test/ #test file  
  frontend/
    src/
      components/     # UI components
      pages/          # Application pages
      hooks/          # React Query hooks
      store/          # Redux store
      api/            # API client
```

## Project setup

### How to quick test app
Start app with docker compose (include migrate and seed data)
```
docker compose up --build
```
* Frontend: [http://localhost:80](http://localhost:80)
* Backend: [http://localhost:3000](http://localhost:3000)
* PostgreSQL: localhost:5433

##### After docker run use test account:
```
username: demo@example.com
password: password123
```


## Manual

### Install

```bash
yarn install
```
### ENV
Create a file .env
```
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/campaign_manager

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Backend
BACKEND_PORT=3000
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3000
```

### Run Development
```
yarn dev
```
### Or run separately:
```
yarn dev:backend
yarn dev:frontend
```
### Database Setup:
```
yarn db:migrate
yarn db:seed
```
