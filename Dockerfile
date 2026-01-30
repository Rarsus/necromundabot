# NecromundaBot - Multi-stage Dockerfile for Discord bot
# This Dockerfile builds and runs the NecromundaBot Discord bot with npm workspaces

# Stage 1: Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy .npmrc for faster builds and deprecation suppression
COPY .npmrc ./

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files (separate layer for better caching)
COPY package*.json ./

# Install root dependencies only (faster layer caching)
# Use --ignore-scripts to prevent postinstall hooks (like Husky) from running in Docker
RUN npm ci --only=production --ignore-scripts && npm ci --only=development --ignore-scripts

# Copy all workspace packages explicitly to ensure they're included in build context
COPY repos/necrobot-utils ./repos/necrobot-utils
COPY repos/necrobot-core ./repos/necrobot-core
COPY repos/necrobot-commands ./repos/necrobot-commands
COPY repos/necrobot-dashboard ./repos/necrobot-dashboard

# Install workspace dependencies using npm ci for reproducible builds
# Set HUSKY=0 to skip Husky installation (not needed in Docker)
RUN HUSKY=0 npm ci --workspaces

# Stage 2: Runtime stage
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy all source files and package files from builder
COPY --from=builder --chown=nodejs:nodejs /app/package.json /app/package.json
COPY --from=builder --chown=nodejs:nodejs /app/package-lock.json /app/package-lock.json
COPY --from=builder --chown=nodejs:nodejs /app/repos /app/repos
COPY --from=builder --chown=nodejs:nodejs /app/node_modules /app/node_modules

# Create database directory for volume mount
RUN mkdir -p /app/data && \
    chown nodejs:nodejs /app/data

# Ensure npm cache directory is writable by nodejs user
RUN mkdir -p /home/nodejs/.npm && \
    chown -R nodejs:nodejs /home/nodejs/.npm && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('ok')" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the bot using necrobot-core start script
CMD ["npm", "start", "--workspace=necrobot-core"]

# Expose port for potential future use (e.g., dashboard)
EXPOSE 3000

# Labels for metadata
LABEL maintainer="Rarsus"
LABEL description="NecromundaBot - Advanced Discord bot for Necromunda campaign management"
LABEL version="0.0.2"
