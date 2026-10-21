# Multi-stage Dockerfile for Barruu Backend Server
# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma client
RUN npm ci
RUN npx prisma generate

# Copy source code and build TypeScript
COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Create non-root user
RUN addgroup -S barruugroup && adduser -S barruuuser -G barruugroup

# Copy build artifacts and runtime files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

USER barruuuser

EXPOSE 5000

CMD ["node", "dist/index.js"]
