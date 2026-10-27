# Multi-stage Monorepo Dockerfile for Barruu
ARG NODE_VERSION=22-alpine

# Base node image
FROM node:${NODE_VERSION} AS base
WORKDIR /app

# Stage 1: Build Server
FROM base AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
COPY server/prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY server/tsconfig.json ./
COPY server/src ./src/
RUN npm run build

# Stage 2: Build Client
FROM base AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
ENV NEXT_PUBLIC_API_URL=http://localhost:5000/api
ENV NODE_ENV=production
RUN npm run build

# Stage 3: Unified Production Runtime (Default: API Server)
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Create non-root user
RUN addgroup -S barruugroup && adduser -S barruuuser -G barruugroup

# Copy build artifacts
COPY --from=server-builder /app/server/package*.json ./
COPY --from=server-builder /app/server/node_modules ./node_modules
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/prisma ./prisma

USER barruuuser

EXPOSE 5000

CMD ["node", "dist/index.js"]
