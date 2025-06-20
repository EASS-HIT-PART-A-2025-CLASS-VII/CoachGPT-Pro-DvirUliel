# Use Node.js LTS version (with full capabilities)
FROM node:18-alpine

WORKDIR /app

# Install curl, bash, and Python for optional native builds (if needed)
RUN apk add --no-cache curl bash

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install full dependencies (including devDeps because ts-node is dev)
ENV NODE_ENV=development
RUN npm install

# Install ts-node globally
RUN npm install -g ts-node

# Copy source code
COPY src ./src

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S llmservice -u 1001 -G nodejs

# Give ownership to non-root user
RUN chown -R llmservice:nodejs /app
USER llmservice

# Expose API port
EXPOSE 5003

# Health check
HEALTHCHECK --interval=30s --timeout=15s --start-period=180s --retries=3 \
    CMD curl -f http://localhost:5003/health/ready || exit 1

# Start the TypeScript app directly using ts-node
CMD ["ts-node", "src/server.ts"]