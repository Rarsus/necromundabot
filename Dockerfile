# NecromundaBot - Multi-stage, Multi-target Dockerfile for Discord bot and dashboard
# This Dockerfile builds and runs the NecromundaBot Discord bot with npm workspaces
# Supports multiple targets: 'bot' (default) and 'dashboard'

# Stage 1: Base builder - includes all dependencies for all targets
FROM node:22-alpine AS base-builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files (separate layer for better caching)
COPY package*.json ./

# Copy all workspace packages (for building both bot and dashboard)
COPY repos/necrobot-utils ./repos/necrobot-utils
COPY repos/necrobot-core ./repos/necrobot-core
COPY repos/necrobot-commands ./repos/necrobot-commands
COPY repos/necrobot-dashboard ./repos/necrobot-dashboard

# Install production dependencies
RUN HUSKY=0 npm ci --ignore-scripts --omit=dev --workspaces

# Stage 2: Bot runtime
FROM node:22-alpine AS bot

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy files from base-builder (bot only - excludes dashboard)
COPY --from=base-builder --chown=nodejs:nodejs /app/package.json /app/package.json
COPY --from=base-builder --chown=nodejs:nodejs /app/package-lock.json /app/package-lock.json
COPY --from=base-builder --chown=nodejs:nodejs /app/repos/necrobot-utils /app/repos/necrobot-utils
COPY --from=base-builder --chown=nodejs:nodejs /app/repos/necrobot-core /app/repos/necrobot-core
COPY --from=base-builder --chown=nodejs:nodejs /app/repos/necrobot-commands /app/repos/necrobot-commands
COPY --from=base-builder --chown=nodejs:nodejs /app/node_modules /app/node_modules

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

# Start the bot directly using node (avoids npm workspace delegation issues)
# This runs the necrobot-core bot.js entry point
CMD ["node", "/app/repos/necrobot-core/src/bot.js"]

# Expose port for potential future use (e.g., dashboard)
EXPOSE 3000

# Labels for metadata
LABEL maintainer="Rarsus"
LABEL description="NecromundaBot - Advanced Discord bot for Necromunda campaign management"
LABEL version="1.8.0"

# Stage 3: Dashboard runtime
FROM node:22-alpine AS dashboard

WORKDIR /app

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy files from base-builder (includes dashboard)
COPY --from=base-builder --chown=nodejs:nodejs /app/package.json /app/package.json
COPY --from=base-builder --chown=nodejs:nodejs /app/package-lock.json /app/package-lock.json
COPY --from=base-builder --chown=nodejs:nodejs /app/repos/necrobot-dashboard /app/repos/necrobot-dashboard
COPY --from=base-builder --chown=nodejs:nodejs /app/repos/necrobot-utils /app/repos/necrobot-utils
COPY --from=base-builder --chown=nodejs:nodejs /app/node_modules /app/node_modules

# Ensure npm cache directory is writable by nodejs user
RUN mkdir -p /home/nodejs/.npm && \
    chown -R nodejs:nodejs /home/nodejs/.npm && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Health check for dashboard (checks port 3000)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Expose port for dashboard
EXPOSE 3000

# Start dashboard (if Next.js build exists)
CMD ["npm", "run", "start", "--workspace=repos/necrobot-dashboard"]

# Labels for metadata
LABEL maintainer="Rarsus"
LABEL description="NecromundaBot Dashboard - Web UI for Necromunda campaign management"
LABEL version="1.8.0"
