# Stage 1: Build TypeScript Application
FROM node:22-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/tsconfig.json ./
COPY backend/src ./src

RUN npm run build

# Stage 2: Production Execution
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

COPY backend/package*.json ./
RUN npm ci

COPY --from=builder /app/dist ./dist
COPY backend/src/db/schema.sql ./src/db/schema.sql
COPY dataset ./dataset

EXPOSE 5001

CMD ["node", "dist/server.js"]
