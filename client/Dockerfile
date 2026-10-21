# Multi-stage Dockerfile for Barruu Frontend Client (Next.js)
# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Set production API URL default for build-time evaluation
ENV NEXT_PUBLIC_API_URL=http://localhost:5000/api
ENV NODE_ENV=production

RUN npm run build

# Stage 2: Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN addgroup -S barruugroup && adduser -S barruuuser -G barruugroup

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

USER barruuuser

EXPOSE 3000

CMD ["npm", "start"]
