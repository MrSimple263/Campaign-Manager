FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json yarn.lock ./
COPY packages/frontend/package.json ./packages/frontend/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy frontend source
COPY packages/frontend ./packages/frontend

WORKDIR /app/packages/frontend

EXPOSE 5173

CMD ["yarn", "dev", "--host", "0.0.0.0"]
