# Docker Separation Plan: Dashboard in Separate Container

**Status:** 🔵 PLANNING  
**Date:** January 30, 2026  
**Priority:** MEDIUM - Infrastructure improvement  
**Complexity:** MEDIUM (6-8 hours)

---

## Executive Summary

Separate the necrobot-dashboard (Next.js web UI) into its own Docker container, allowing:

- **Lightweight bot container** (277MB → ~150MB potential)
- **Independent scaling** - scale web/bot separately
- **Simplified deployments** - update UI without restarting bot
- **Better separation of concerns** - web server vs bot process
- **Easier local development** - run containers independently

---

## Current State Analysis

### Existing Architecture

**Single Container (Current):**

```
necromundabot (277MB)
├── necrobot-core (Discord bot)
├── necrobot-commands (Slash commands)
├── necrobot-utils (Shared utilities)
└── necrobot-dashboard (Next.js - UNUSED in current container)
```

**Problem:** Dashboard dependencies were removed from Docker build in last optimization. Dashboard runs on separate Node.js locally but has no containerized deployment.

### Container Breakdown

- Bot code: 11MB
- Node.js dependencies (production): 28MB
- Base image + system: ~238MB
- **Total:** 277MB

---

## Proposed Architecture

```
┌─────────────────────────────────────────┐
│         Docker Compose Network          │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────┐  ┌────────────┐  │
│  │  necromundabot   │  │ necrobot-  │  │
│  │  (Bot Service)   │  │ dashboard  │  │
│  │                  │  │ (Web UI)   │  │
│  │ • Discord bot    │  │            │  │
│  │ • 150MB image    │  │ • Next.js  │  │
│  │ • Port: internal │  │ • 300-400MB│  │
│  │ • CPU: 0.5-1     │  │ • Port: 3000 │
│  │ • RAM: 256-512M  │  │ • CPU: 0.25  │
│  │                  │  │ • RAM: 128M  │
│  └──────────────────┘  └────────────┘  │
│        ↓ shared          (optional)     │
│  ┌──────────────────┐                  │
│  │  Shared Data     │                  │
│  │  Volume          │                  │
│  │ /app/data        │                  │
│  └──────────────────┘                  │
│                                         │
└─────────────────────────────────────────┘
     Docker Network (necromundabot-network)
```

---

## Implementation Plan

### Phase 1: Create Dashboard Dockerfile

**File:** `Dockerfile.dashboard`

```dockerfile
# Multi-stage build for Next.js dashboard
FROM node:22-alpine AS dependencies

WORKDIR /app

# Copy root and dashboard workspace files
COPY package*.json ./
COPY repos/necrobot-dashboard ./repos/necrobot-dashboard
COPY repos/necrobot-utils ./repos/necrobot-utils

# Install dependencies (including Next.js and dev tools)
RUN npm ci --ignore-scripts

# Build Next.js application
FROM dependencies AS builder

WORKDIR /app

RUN npm run build --workspace=necrobot-dashboard

# Production runtime stage
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init && \
    addgroup -g 1001 -S nextjs && \
    adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nextjs /app/package.json /app/package.json
COPY --from=builder --chown=nextjs:nextjs /app/package-lock.json /app/package-lock.json
COPY --from=builder --chown=nextjs:nextjs /app/repos/necrobot-dashboard ./repos/necrobot-dashboard
COPY --from=builder --chown=nextjs:nextjs /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["dumb-init", "--"]

CMD ["npm", "start", "--workspace=necrobot-dashboard"]
```

**Size Estimate:** 300-400MB (Next.js, React, build artifacts)

---

### Phase 2: Update docker-compose.yml

**Current:** Single service (`necromundabot`)

**New:** Two services

```yaml
version: '3.9'

services:
  # Discord Bot Service
  necromundabot:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: necromundabot
    restart: unless-stopped
    env_file:
      - .env
    environment:
      DATABASE_PATH: /app/data/necromundabot.db
      NODE_ENV: production
    volumes:
      - necromundabot_data:/app/data
      - ./.env:/app/.env:ro
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    logging:
      driver: 'json-file'
      options:
        max-size: '10m'
        max-file: '3'
    networks:
      - necromundabot-network

  # Web Dashboard Service (NEW)
  necrobot-dashboard:
    build:
      context: .
      dockerfile: Dockerfile.dashboard
    container_name: necrobot-dashboard
    restart: unless-stopped
    env_file:
      - .env
    environment:
      NODE_ENV: production
      PORT: 3000
      # Optional: API endpoint for dashboard to communicate with bot
      NEXT_PUBLIC_API_URL: http://necromundabot:3001/api
    volumes:
      - necromundabot_data:/app/data:ro # Read-only access to shared data
      - ./.env:/app/.env:ro
    ports:
      - '3000:3000' # Expose dashboard to host
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
    logging:
      driver: 'json-file'
      options:
        max-size: '5m'
        max-file: '2'
    networks:
      - necromundabot-network
    depends_on:
      - necromundabot

volumes:
  necromundabot_data:
    driver: local

networks:
  necromundabot-network:
    driver: bridge
```

---

### Phase 3: Optimize Bot Dockerfile

**Current size:** 277MB

**Optimizations possible:**

- Remove unnecessary files from repos (tests, docs, etc.)
- Use .dockerignore to exclude build artifacts
- Potential size: 150-180MB

**Action:** Create `.dockerignore` file

```
# Git files
.git
.gitignore
.gitattributes

# Node files
node_modules (handled by multi-stage)
npm-debug.log
yarn-debug.log
yarn-error.log

# Build artifacts
coverage
dist
build
.next
out

# Development
*.test.js
tests/
__tests__/
.eslintignore
.prettierignore
.editorconfig

# Docker
Dockerfile*
docker-compose.yml
.dockerignore

# CI/CD
.github
.gitlab-ci.yml

# IDE
.vscode
.idea
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Documentation
docs/
*.md
CHANGELOG.md
LICENSE
README.md

# Configuration
.env.example
.env.local
.env.*.local
jest.config.js
eslint.config.js

# Project docs
project-docs/
DEFINITION-OF-DONE.md
CONTRIBUTING.md
CODE_OF_CONDUCT.md
```

---

### Phase 4: Update GitHub Actions Workflows

**Changes needed:**

1. **publish-packages.yml** - No changes (both containers still use same packages)

2. **security.yml** - No changes (workspace scanning still works)

3. **release.yml** - Add dashboard build step (optional, for multi-container deployments)

4. **New workflow: docker-publish.yml** (Optional)
   - Publish both images to container registry
   - Build and push necromundabot:latest and necrobot-dashboard:latest

---

### Phase 5: Environment Configuration

**Dashboard-specific variables:**

```env
# .env (already exists, add these)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_BOT_NAME=NecromundaBot
NEXT_PUBLIC_DISCORD_INVITE=<your-invite-url>

# Optional for production
NEXTAUTH_SECRET=<generate-new-secret>
NEXTAUTH_URL=https://dashboard.example.com
```

**Note:** Dashboard likely won't need `.env` if it's just a static UI. Check if it requires backend API.

---

### Phase 6: Networking & Communication

**Container-to-Container Communication:**

Option A: **Dashboard is read-only UI** (current approach)

- Dashboard runs independently
- No communication between containers needed
- Share database volume (read-only)
- Simplest approach

Option B: **Dashboard needs bot API**

- Bot exposes REST API on port 3001
- Dashboard calls `http://necromundabot:3001/api`
- Requires building API endpoints in bot
- More complex, future enhancement

**Recommendation:** Start with Option A (read-only), add API later if needed.

---

## Implementation Checklist

### ✅ Pre-Implementation

- [ ] Review necrobot-dashboard `next.config.js` for any port/env requirements
- [ ] Check if dashboard currently runs locally (test with `npm run dev --workspace=necrobot-dashboard`)
- [ ] Document any environment variables dashboard needs
- [ ] Verify shared data volume needs (does dashboard need bot database?)

### 📝 Implementation Steps

- [ ] Create `.dockerignore` file
- [ ] Create `Dockerfile.dashboard`
- [ ] Update `docker-compose.yml` with dashboard service
- [ ] Test locally: `docker-compose up -d`
- [ ] Verify bot container still works
- [ ] Verify dashboard container starts
- [ ] Check dashboard accessible at `http://localhost:3000`

### ✅ Testing

- [ ] Run `docker-compose up -d --build`
- [ ] Check both containers running: `docker ps`
- [ ] Check bot logs: `docker logs necromundabot | head -20`
- [ ] Check dashboard logs: `docker logs necrobot-dashboard | head -20`
- [ ] Access bot Discord: verify in guild
- [ ] Access dashboard web: `curl http://localhost:3000`
- [ ] Verify network connectivity: `docker network inspect necromundabot-network`
- [ ] Test resource limits: monitor CPU/memory with `docker stats`

### 🚀 Deployment

- [ ] Commit changes
- [ ] Push to origin/main
- [ ] Monitor GitHub Actions workflows
- [ ] Verify both containers publish (if using registry)
- [ ] Deploy to production environment
- [ ] Smoke test: bot + dashboard both running
- [ ] Document in DEPLOYMENT.md

---

## Estimated Effort

| Phase     | Task                        | Time          | Difficulty |
| --------- | --------------------------- | ------------- | ---------- |
| 1         | Create Dockerfile.dashboard | 30 min        | LOW        |
| 2         | Update docker-compose.yml   | 20 min        | LOW        |
| 3         | Create .dockerignore        | 15 min        | LOW        |
| 4         | Update workflows (optional) | 30 min        | LOW        |
| 5         | Environment config          | 20 min        | LOW        |
| 6         | Testing & debugging         | 90 min        | MEDIUM     |
| 7         | Documentation               | 30 min        | LOW        |
| **TOTAL** |                             | **3-4 hours** |            |

---

## Benefits & Trade-offs

### Benefits ✅

- **Smaller bot image** (277MB → ~150MB)
- **Independent scaling** (run multiple bots, one dashboard)
- **Separate lifecycle** (update UI without restarting bot)
- **Clear separation** (bot process ≠ web server)
- **Easier debugging** (separate logs per service)
- **Production-ready** (standard Docker Compose pattern)

### Trade-offs ⚠️

- **More complex setup** (2 containers instead of 1)
- **More memory usage** (both running together)
- **More storage** (2 images instead of 1)
- **Network latency** (if containers communicate)
- **More orchestration** (manage 2 services)

---

## Risk Assessment

### Low Risk (Proceed Confidently)

- ✅ Docker Compose well-established pattern
- ✅ Both services use same dependencies
- ✅ No database migration needed
- ✅ Can run independently

### Medium Risk (Plan For)

- 🟡 Dashboard startup time (Next.js slower than bot)
- 🟡 Resource contention (both in same Docker Compose)
- 🟡 Dashboard not currently used/tested in production

### Mitigations

- [ ] Document startup order and dependencies
- [ ] Set reasonable resource limits per container
- [ ] Add health checks to both containers
- [ ] Create runbook for troubleshooting

---

## Alternative: Keep Single Container

If separation seems too complex:

- Keep current single container approach
- Accept 277MB image size (acceptable for most use cases)
- Can always split later when needed
- Current approach is simpler to manage

---

## Next Steps

### Decision Point

1. **Proceed with separation?** (Recommended for scalability)
2. **Keep single container?** (Simpler, works fine)
3. **Other approach?** (Kubernetes, managed services, etc.)

### If Proceeding

1. Review this plan with team
2. Confirm dashboard needs/use cases
3. Begin Phase 1 implementation
4. Test locally before committing
5. Update CI/CD workflows as needed

---

## Related Documentation

- [DOCKER-FIXES-SUMMARY.md](./DOCKER-FIXES-SUMMARY.md) - Current Docker setup
- [docker-compose.yml](../docker-compose.yml) - Current configuration
- [Dockerfile](../Dockerfile) - Bot container definition
- [repos/necrobot-dashboard](../repos/necrobot-dashboard) - Dashboard source

---

**Owner:** Infrastructure Team  
**Last Updated:** January 30, 2026  
**Next Review:** When ready to implement
