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

# Remove dev dependencies and TypeScript source files to reduce image size
RUN npm prune --production && \
    rm -rf src/ tsconfig.json

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S llmservice -u 1001 -G nodejs

# Change ownership to non-root user
RUN chown -R llmservice:nodejs /app
USER llmservice

# Expose port
EXPOSE 5003

# Updated health check to use the new health endpoint
HEALTHCHECK --interval=30s --timeout=15s --start-period=180s --retries=3 \
    CMD curl -f http://localhost:5003/health/ready || exit 1

# Start the application
CMD ["npm", "start"]