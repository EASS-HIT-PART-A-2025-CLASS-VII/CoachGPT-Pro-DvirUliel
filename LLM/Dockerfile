# Use Node.js LTS version
FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl bash

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S llmservice -u 1001 -G nodejs
RUN chown -R llmservice:nodejs /app
USER llmservice

EXPOSE 5003

# Simple health check
HEALTHCHECK --interval=30s --timeout=15s --start-period=120s --retries=5 \
    CMD curl -f http://localhost:5003/health || exit 1

# Start the application directly
CMD ["npm", "start"]