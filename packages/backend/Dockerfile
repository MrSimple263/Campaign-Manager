FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json yarn.lock ./
COPY tsconfig.base.json ./

# Copy backend package
COPY packages/backend/package.json ./packages/backend/

# Install dependencies
RUN corepack enable && yarn install

# Copy backend source
COPY packages/backend ./packages/backend

WORKDIR /app/packages/backend

EXPOSE 3000

CMD ["yarn", "dev"]
