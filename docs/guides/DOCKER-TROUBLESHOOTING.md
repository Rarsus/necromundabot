# Docker Build & Volume Issues - Troubleshooting Guide

## Quick Fix (Try This First)

### For Volume Mount Error (Issue III)

```bash
# 1. Ensure data directory exists
mkdir -p ./data

# 2. Reset Docker state
docker-compose down -v
docker system prune -f

# 3. Rebuild with verbose output
docker-compose up --build

# 4. Check logs
docker logs necromundabot
```

---

## Issue III: Volume Mount Error

### Problem

```
Error response from daemon: failed to populate volume: error while mounting volume
'/var/lib/docker/volumes/necromundabot_necromundabot_data/_data': failed to mount local volume
```

### Root Causes

1. **WSL path resolution issue** - `${PWD}` doesn't expand correctly in Docker Desktop
2. **Missing `./data` directory** - volume target doesn't exist locally
3. **Permission issues** - docker-desktop user can't access WSL filesystem

### Solutions

#### Solution A: Use Docker Managed Volumes (Recommended for Windows/WSL)

```yaml
# docker-compose.yml
volumes:
  necromundabot_data:
    driver: local
    # Docker manages the volume internally
    # More reliable on Windows/WSL2
```

**Pros:** ✅ Works reliably on Windows/WSL2  
**Cons:** ❌ Hard to access files from WSL filesystem directly

#### Solution B: Create data directory first

```bash
mkdir -p ./data
chmod 777 ./data

# Then use relative path
volumes:
  necromundabot_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./data
```

#### Solution C: For Production (Linux servers)

```bash
# Use absolute paths on Linux
volumes:
  necromundabot_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /var/lib/necromundabot/data
```

---

## Issue II: NPM Deprecation Warnings

### Problem

```
npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead
npm warn deprecated domexception@4.0.0: Use your platform's native DOMException
npm warn deprecated abab@2.0.6: Use your platform's native atob()
npm warn deprecated inflight@1.0.6: This module is not supported, leaks memory
npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
```

### Root Cause

These are **indirect dependencies** (dependencies of dependencies) maintained by external projects. They're not critical but indicate outdated transitive dependencies.

### Solutions

#### Solution 1: Suppress Warnings (Quick Fix)

**.npmrc** file (already added):

```
npm_config_loglevel=warn
legacy-peer-deps=true
prefer-offline=true
```

Build command:

```bash
docker-compose up --build 2>&1 | grep -v "npm warn deprecated"
```

#### Solution 2: Update Direct Dependencies (Better)

```bash
# Check for outdated packages
npm outdated --workspaces

# Update packages that use these dependencies
npm update --workspaces

# Clean install
npm ci --workspaces
```

#### Solution 3: Pin Specific Versions

In each workspace `package.json`:

```json
{
  "dependencies": {
    "glob": "^9.3.0",
    "inflight": "^1.0.6"
  }
}
```

**Recommendation:** These warnings are safe to ignore for now. Focus on Issue I & III first.

---

## Issue I: Slow Build Times (61.3 seconds)

### Problem

Docker build takes 61.3 seconds for npm install step.

### Root Cause

1. **No Docker layer caching** - npm install was running on every build
2. **Inefficient Dockerfile** - workspaces copied before installing root deps
3. **No .npmrc optimization** - missing offline/cache settings

### Solutions Implemented

#### 1. Optimized Dockerfile (Now Using)

```dockerfile
# Separate layers for better caching
COPY .npmrc ./                          # Layer 1: Config (fast, rarely changes)
COPY package*.json ./                  # Layer 2: Root package (fast, rarely changes)
RUN npm ci --only=production            # Layer 3: Install root (cached)
COPY repos ./repos                      # Layer 4: Workspace packages (fast)
RUN npm install --workspaces            # Layer 5: Install workspaces (cached)
```

**Benefits:** Each layer caches independently. Rebuilds only run changed layers.

#### 2. Use npm ci Instead of npm install

```dockerfile
RUN npm ci --legacy-peer-deps
```

**Benefits:** ✅ Faster, deterministic, respects package-lock.json

#### 3. Enable Docker BuildKit (Already Added)

```yaml
build:
  args:
    BUILDKIT_INLINE_CACHE: '1'
```

```bash
# Or enable globally
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

#### 4. .npmrc Optimization (Already Added)

```
prefer-offline=true
offline=false
```

### Expected Improvements

- **First build:** 40-60s (same, first install always takes time)
- **Subsequent builds:** 5-15s (huge improvement, using cache layers)
- **Warnings:** Reduced to just deprecation notices (safe to ignore)

### Benchmark Commands

```bash
# Time the build
time docker-compose up --build

# Measure layer caching effectiveness
docker image history necromundabot

# Monitor in real-time
docker buildx build --progress=plain .
```

---

## Quick Commands Reference

### Clean Build (if stuck)

```bash
# Remove everything
docker-compose down -v
docker system prune -f

# Rebuild from scratch
DOCKER_BUILDKIT=1 docker-compose up --build

# Monitor logs
docker logs -f necromundabot
```

### Debug Builds

```bash
# Build with verbose output
docker-compose build --progress=plain --no-cache

# Inspect image layers
docker image history necromundabot

# Check volume status
docker volume ls
docker volume inspect necromundabot_necromundabot_data
```

### Health Checks

```bash
# Check container health
docker ps --filter name=necromundabot

# View health check logs
docker inspect necromundabot --format='{{.State.Health}}'

# Test manually
docker exec necromundabot node -e "console.log('ok')"
```

---

## Recommended Configuration

### .env File

```env
NODE_ENV=production
DISCORD_TOKEN=your_token_here
CLIENT_ID=your_client_id_here
```

### docker-compose.yml Override (Local Development)

```yaml
# Create docker-compose.override.yml
services:
  necromundabot:
    environment:
      NODE_ENV: development
    volumes:
      # Mount source for hot reload
      - ./repos:/app/repos
      # Keep database persisted
      - necromundabot_data:/app/data
```

### For WSL Users

```bash
# Enable BuildKit for faster builds
echo 'export DOCKER_BUILDKIT=1' >> ~/.bashrc
echo 'export COMPOSE_DOCKER_CLI_BUILD=1' >> ~/.bashrc
source ~/.bashrc

# Check WSL integration
docker run --rm -v /mnt/wsl:/test alpine ls /test
```

---

## Phase 03.3: Dual-Container Troubleshooting

### Issue: One Container Fails but Other Keeps Running

**Problem:**

```
docker-compose logs
WARN: necromundabot-dashboard exited with code 1
INFO: necromundabot is still running (health: healthy)
```

**Solution:** Containers fail independently by design. Check specific container:

```bash
# Check both containers
docker-compose ps

# View logs for specific container
docker-compose logs -f necromundabot          # Bot logs
docker-compose logs -f dashboard              # Dashboard logs

# Restart failed container
docker-compose up -d dashboard

# Or restart both
docker-compose restart
```

### Issue: Containers Can't Communicate

**Problem:**

```
Error: ECONNREFUSED 127.0.0.1:3000 (Dashboard can't reach Bot)
```

**Root Cause:** Containers on same network by default, but hostname resolution might fail.

**Solution:**

```yaml
# docker-compose.yml
services:
  necromundabot:
    # Bot service
    networks:
      - necronet
  dashboard:
    # Dashboard service
    environment:
      - API_URL=http://necromundabot:3000 # Use service name, not localhost
    networks:
      - necronet

networks:
  necronet:
    driver: bridge
```

Then restart:

```bash
docker-compose down
docker-compose up -d
```

### Issue: Memory Leak in One Container

**Problem:** Dashboard container slowly consuming memory, bot is fine.

**Solution:** Restart only the leaking container:

```bash
# Restart dashboard without restarting bot
docker-compose restart dashboard

# Check resource usage
docker stats necromundabot necromundabot-dashboard
```

### Issue: Port Already in Use

**Problem:**

```
Error: bind: address already in use :::3001
```

**Solution:** Find what's using the port:

```bash
# Find process using port 3001
lsof -i :3001
# or
netstat -tulpn | grep 3001

# Stop the other service
kill -9 <PID>

# Or change port in docker-compose.yml
# ports:
#   - "3002:3001"  # Use different host port

docker-compose up -d
```

### Issue: Database Locked

**Problem:** Both containers trying to write to SQLite simultaneously, causing lock timeout.

**Solution:** This is rare with proper locking, but if it happens:

```bash
# Stop both containers
docker-compose down

# Check database file
ls -la data/necromunda.db

# Remove lock file if present
rm -f data/necromunda.db-*

# Restart
docker-compose up -d
```

### Performance: Dual-Container Build Slow

**Problem:** `docker-compose build` taking too long (should be ~5-15s on rebuild).

**Solution:**

```bash
# Enable BuildKit for both containers
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Build with progress output
docker-compose build --progress=plain

# Check layer caching
docker image history necromundabot:v1.5.0
```

---

## Summary of Changes

| Issue                               | Status        | Solution                                              | Expected Improvement               |
| ----------------------------------- | ------------- | ----------------------------------------------------- | ---------------------------------- |
| **Issue III** (Volume Mount)        | ✅ Fixed      | Removed `${PWD}` expansion, use Docker-managed volume | Immediate fix - should work now    |
| **Issue II** (Deprecation Warnings) | ✅ Suppressed | Added .npmrc config, commented notes                  | Warnings reduced to warnings level |
| **Issue I** (Slow Build)            | ✅ Optimized  | Layered Dockerfile, npm ci, BuildKit                  | 60s → 5-15s on rebuilds            |

---

## Next Steps

1. **Test the fixes:**

   ```bash
   docker-compose down -v
   mkdir -p ./data
   docker-compose up --build
   ```

2. **Monitor performance:**

   ```bash
   docker logs -f necromundabot
   ```

3. **For production, consider:**
   - Using PostgreSQL instead of SQLite for persistence
   - Multi-stage builds with distroless base image
   - Docker secrets for token management
   - Load balancing multiple bot instances
