# Scenario: Docker & Docker Compose Changes

**When to use:** Modifying Dockerfile, docker-compose.yml, or container configuration

## Prerequisites

- ✅ All tests pass locally: `npm test`
- ✅ All linting passes: `npm run lint`
- ✅ Review [Docker optimization rules](../copilot-patterns/SERVICE-LAYER.md#docker-build-performance)
- ✅ Docker & Docker Compose installed

## Critical: Docker Build Performance

**ENFORCED RULE:** Use `npm ci` NOT `npm install`

```dockerfile
# ❌ WRONG - Slow, rebuilds unnecessarily
RUN npm install

# ✅ CORRECT - Fast, reproducible, cache-friendly
RUN npm ci
```

See full optimization rules in copilot-patterns/SERVICE-LAYER.md

## Step 1: Understand Current Docker Setup

```bash
# Check current Dockerfile
cat /home/olav/repo/necromundabot/Dockerfile | head -30

# Check docker-compose.yml
cat /home/olav/repo/necromundabot/docker-compose.yml | head -30
```

## Step 2: Make Changes to Dockerfile/docker-compose.yml

### Example 1: Add Environment Variable

```dockerfile
# BEFORE
FROM node:22-alpine
WORKDIR /app

# AFTER - Add env var configuration
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV DEBUG=necrobot:*
```

### Example 2: Optimize Layer Ordering (Critical)

```dockerfile
# ❌ WRONG - Inefficient caching
FROM node:22-alpine
COPY . .                          # Layer 1 (code changes trigger rebuild)
RUN npm ci --workspaces          # Layer 2 (dependencies rebuild)

# ✅ CORRECT - Efficient caching
FROM node:22-alpine
COPY package*.json ./             # Layer 1 (rarely changes)
RUN npm ci --workspaces          # Layer 2 (cached if deps unchanged)
COPY . .                          # Layer 3 (code changes only rebuild this)
```

### Example 3: Add Volume for Database

```yaml
# docker-compose.yml
services:
  necromundabot:
    build: .
    volumes:
      # Existing volumes
      - ./data:/app/data           # Persist database
      - ./logs:/app/logs           # Persist logs
```

## Step 3: Test Docker Build

```bash
# Clean slate (remove old containers/images)
docker-compose down && docker system prune -f

# Build with your changes
docker-compose up --build -d

# Check build time in output
# Should show: Build took ~3-5 min (first) or ~30s (rebuild with cache)
```

## Step 4: Verify Container Starts

```bash
# View logs
docker logs necromundabot

# Expected output:
# ✅ (timestamp) Ready on http://...
# ✅ (timestamp) Bot logged in as [botname]#[number]
# ✅ Loaded X command(s) from Y categor(y/ies)
# ❌ No "Invalid command structure" warnings
```

## Step 5: Test Commands in Discord

If bot is running:

```bash
# Get container ID
docker ps

# Check if bot is responsive
docker logs necromundabot | tail -20 | grep -i "command"

# Or test in Discord:
# /ping → should reply with latency
# /help → should list all commands
```

## Step 6: Stop and Verify Cleanup

```bash
# Stop containers
docker-compose down

# Clean up (optional)
docker system prune -f

# Verify no containers running
docker ps
# Should show: No running containers
```

## Common Docker Changes

### Change Base Image

```dockerfile
# BEFORE
FROM node:22-alpine

# AFTER - Update to newer version
FROM node:22.13.0-alpine

# Then rebuild and test
docker-compose down && docker system prune -f
docker-compose up --build -d
```

### Add Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
```

### Multi-Stage Build (Advanced)

```dockerfile
# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --workspaces
COPY . .
RUN npm run build

# Runtime stage
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/bot.js"]
```

## Docker Compose Changes

### Add New Service

```yaml
services:
  necromundabot:
    # existing config
    
  database:
    image: sqlite:latest
    volumes:
      - ./data/db:/data
```

### Change Port Mapping

```yaml
services:
  necromundabot:
    ports:
      # BEFORE
      # - "3000:3000"
      
      # AFTER - Change to different port
      - "3001:3000"
```

### Add Volume Mounts

```yaml
volumes:
  - ./data:/app/data           # Database persistence
  - ./logs:/app/logs           # Log files
  - ./config:/app/config       # Configuration
```

## Performance Testing

After Docker changes, verify performance:

```bash
# Measure first build time
time docker-compose up --build -d

# Should be ~3-5 minutes

# Remove and rebuild (test caching)
docker-compose down && docker system prune -f
time docker-compose up --build -d

# Should be ~30 seconds (significant speedup = good caching)
```

## Troubleshooting Docker Issues

**Issue:** Build fails with "npm: not found"  
**Solution:** Ensure `npm ci --workspaces` is in Dockerfile (not `npm install`)

**Issue:** Container exits immediately  
**Solution:** 
```bash
docker logs necromundabot  # Check error message
docker-compose down
docker-compose up --build -d  # Rebuild
```

**Issue:** Database not persisting between restarts  
**Solution:** Add volume mount in docker-compose.yml:
```yaml
volumes:
  - ./data:/app/data
```

**Issue:** Port already in use  
**Solution:**
```bash
# Find what's using the port
lsof -i :3000

# Change port in docker-compose.yml or kill existing process
docker-compose down
```

## Validation Checklist

- [ ] Dockerfile has `npm ci` (not `npm install`)
- [ ] Layers ordered for cache efficiency
- [ ] First build completes in ~3-5 minutes
- [ ] Rebuild with cache completes in ~30 seconds
- [ ] Container starts without errors
- [ ] Bot logs show successful startup
- [ ] Commands load successfully
- [ ] No "Invalid command structure" warnings
- [ ] Bot responds to Discord commands
- [ ] Linting and tests pass locally

## Commit Message Example

```bash
git commit -m "chore: Optimize Docker build performance

- Reordered Dockerfile layers for better caching
- Changed from npm install to npm ci for reproducibility
- First build: ~3-5 min, rebuild: ~30 sec
- All tests passing
- Bot starts successfully in Docker"
```

## See Also

## PR Title Format Reminder

When creating a pull request for Docker/infrastructure changes, use appropriate format:

```
ci: <description>  # For CI/CD or build infrastructure
chore: <description>  # For Docker configuration updates
feat: <description>  # For new infrastructure features
```

Examples:
- ✅ `ci: update GitHub Actions workflow`
- ✅ `chore: optimize Docker build with multi-stage builds`
- ✅ `feat: add health check to docker-compose`

See [PR-TITLE-FORMAT.md](../copilot-patterns/PR-TITLE-FORMAT.md) for complete details.

## See Also

- [SERVICE-LAYER.md](../copilot-patterns/SERVICE-LAYER.md) - Docker optimization rules
- [TDD-WORKFLOW.md](../copilot-patterns/TDD-WORKFLOW.md) - Test before Docker deployment
- [PR-TITLE-FORMAT.md](../copilot-patterns/PR-TITLE-FORMAT.md) - PR title requirements
- Docker documentation: https://docs.docker.com/
- Docker Compose documentation: https://docs.docker.com/compose/
