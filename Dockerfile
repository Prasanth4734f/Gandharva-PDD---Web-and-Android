# Multi-stage production container for Gandharva AI Music Studio Backend
FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production || npm install --production

# Copy source files
COPY server/ ./server/
COPY assets/ ./assets/

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check probe
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server/index.js"]
