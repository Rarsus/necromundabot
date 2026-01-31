# Docker Setup Guide for NecromundaBot

## Overview

This guide explains how to run NecromundaBot using Docker, which provides a consistent, isolated environment for the Discord bot with automatic database persistence.

## Files Included

- **Dockerfile** - Multi-stage Docker image definition
- **docker-compose.yml** - Orchestration file for easy container management
- **.dockerignore** - Excludes unnecessary files from the build context
- **.env.docker.example** - Example environment configuration for Docker

## Quick Start

### 1. Prepare Environment File

```bash
# Copy the Docker environment example to .env
cp .env.docker.example .env

# Edit .env with your Discord bot credentials
# Required fields:
#   - DISCORD_TOKEN: Your bot token from Discord Developer Portal
#   - CLIENT_ID: Your application ID
nano .env
```

### 2. Build and Run with Docker Compose

```bash
# Build the Docker image
docker-compose build

# Run the bot in the background
docker-compose up -d

# View logs
docker-compose logs -f necromundabot

# Stop the bot
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v
```

### 3. Manual Docker Commands

If you prefer manual Docker commands:

```bash
# Build image
docker build -t necromundabot:latest .

# Run container with volume mount for database persistence
docker run -d \
  --name necromundabot \
  --restart unless-stopped \
  --env-file .env \
  -e NODE_ENV=production \
  -e DATABASE_PATH=/app/data/necromundabot.db \
  -v necromundabot_data:/app/data \
  --memory 512m \
  --cpus 1 \
  necromundabot:latest

# View logs
docker logs -f necromundabot

# Stop container
docker stop necromundabot

# Start container
docker start necromundabot

# Remove container (keeps volume)
docker rm necromundabot
```

## Features

### Multi-Stage Build

The Dockerfile uses a two-stage build process:

1. **Builder Stage** - Installs dependencies with build tools
2. **Runtime Stage** - Minimal runtime image without build tools
   - Reduces final image size by ~60%
   - Improves security by excluding build tools
   - Uses Alpine Linux (14MB base image)

### Database Persistence

The bot uses Docker volumes to ensure the SQLite database survives container rebuilds:

```yaml
volumes:
  - necromundabot_data:/app/data # Database location
```

Database file location:

- **Inside container:** `/app/data/necromundabot.db`
- **On host machine:** `./data/necromundabot.db` (relative to docker-compose.yml)

The database persists across:

- Container restarts (`docker restart`)
- Container rebuilds (`docker-compose up --build`)
- Image updates

### Signal Handling

The Dockerfile uses `dumb-init` to properly handle signals:

- SIGTERM for graceful shutdown
- SIGINT (Ctrl+C) for immediate termination
- Prevents zombie processes

### Health Check

Built-in health check verifies the container is running:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

Output example:

```
NAMES            STATUS
necromundabot    Up 5 minutes (healthy)
```

### Resource Limits

Docker compose limits resources to prevent excessive usage:

```yaml
cpus: '1' # Maximum 1 CPU core
memory: 512M # Maximum 512MB RAM
reservations: # Recommended baseline
  cpus: '0.5'
  memory: 256M
```

### Logging

Logs are automatically managed:

- Format: JSON
- Max file size: 10MB
- Maximum files: 3 (30MB total)

View logs:

```bash
docker-compose logs -f necromundabot    # Follow logs
docker logs necromundabot               # View all logs
docker-compose logs --tail 100          # Last 100 lines
```

## Environment Variables

All environment variables are configured in `.env` file:

| Variable              | Required | Description                                               |
| --------------------- | -------- | --------------------------------------------------------- |
| `DISCORD_TOKEN`       | ✅       | Bot token from Discord Developer Portal                   |
| `CLIENT_ID`           | ✅       | Application ID from Discord Developer Portal              |
| `GUILD_ID`            | ❌       | Guild ID for faster command registration                  |
| `PREFIX`              | ❌       | Legacy prefix command prefix (default: !)                 |
| `DATABASE_PATH`       | ❌       | Database file location (set by docker-compose)            |
| `NODE_ENV`            | ❌       | Environment: production/development (default: production) |
| `HUGGINGFACE_API_KEY` | ❌       | API key for AI poem generation                            |

## Troubleshooting

### Container Won't Start

```bash
# Check logs for errors
docker-compose logs necromundabot

# Common issues:
# - Missing DISCORD_TOKEN in .env
# - Invalid CLIENT_ID
# - Port conflicts
```

### Database Not Persisting

```bash
# Verify volume exists
docker volume ls | grep necromundabot_data

# Check volume mount point
docker inspect necromundabot | grep -A 10 Mounts

# Verify database file exists
ls -lah ./data/necromundabot.db
```

### Memory/CPU Issues

Adjust limits in `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '2' # Increase to 2 cores
      memory: 1024M # Increase to 1GB
```

### Permission Denied Errors

The container runs as non-root user `nodejs` (UID 1001). If you modify the data directory on the host:

```bash
# Fix permissions
sudo chown -R 1001:1001 ./data
```

## Advanced Configuration

### Using Environment File from Different Location

```bash
docker-compose --env-file /path/to/.env up -d
```

### Building for Specific Architecture

```bash
# Build for ARM64 (for Raspberry Pi, Apple Silicon, etc.)
docker buildx build --platform linux/arm64 -t necromundabot:latest .

# Build for multiple architectures
docker buildx build --platform linux/amd64,linux/arm64 -t necromundabot:latest .
```

### Custom Network Configuration

```yaml
# In docker-compose.yml
services:
  necromundabot:
    networks:
      - backend
    ports:
      - '3000:3000' # For future dashboard

networks:
  backend:
    driver: bridge
```

### Linking with Other Services

```yaml
# Example: Add PostgreSQL database
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_data:/var/lib/postgresql/data

  necromundabot:
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://postgres:secret@postgres:5432/necromunda

volumes:
  postgres_data:
```

## Development vs Production

### Development Setup

```bash
# Use --watch mode for auto-reload
docker-compose exec necromundabot npm run dev

# Or rebuild with development NODE_ENV
docker-compose -f docker-compose.dev.yml up -d
```

### Production Setup

```bash
# Current setup is optimized for production
docker-compose up -d

# Monitor in background
docker-compose logs -f
```

## Monitoring

### View Container Status

```bash
docker ps
docker stats necromundabot
```

### Check Health

```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### View Resource Usage

```bash
docker stats --no-stream necromundabot
```

## Updates and Upgrades

### Update Bot Code

```bash
# Pull latest code
git pull
git submodule update --recursive

# Rebuild image
docker-compose build

# Restart container
docker-compose up -d

# Database automatically persists from volume
```

### Rollback

```bash
# Stop current container
docker-compose down

# Use previous image tag (if you tagged versions)
docker run -d -v necromundabot_data:/app/data ... necromundabot:v0.0.1

# Or keep running old version
docker run ... old-image-id
```

## Dual-Container Architecture (Phase 03.3 - Production Strategy)

NecromundaBot now uses a **dual-container strategy** for improved performance, resource isolation, and independent scaling:

```
┌──────────────────────────────────────────┐
│    Docker Compose (Production Setup)     │
├──────────────────────────────────────────┤
│                                          │
│  ┌─────────────────────┐  ┌───────────┐ │
│  │   Bot Container     │  │Dashboard  │ │
│  │ - discord.js client │  │ - React   │ │
│  │ - commands          │  │ - Web UI  │ │
│  │ - ~150MB            │  │ - ~127MB  │ │
│  │ - Port: 3000        │  │ - Port 3001  │
│  └─────────────────────┘  └───────────┘ │
│           │                      │       │
│           └──────────┬───────────┘       │
│                      │                   │
│         ┌────────────────────────┐       │
│         │  Shared SQLite DB      │       │
│         │  (volumes/)            │       │
│         └────────────────────────┘       │
│                                          │
└──────────────────────────────────────────┘
```

### Key Benefits

- **70% Smaller**: 942MB → 277MB combined (from previous monolithic approach)
- **40-50% Faster**: Parallel container execution and startup
- **Independent Updates**: Update bot or dashboard without affecting the other
- **Better Resource Control**: Dedicated CPU/memory limits per container
- **Improved Reliability**: Dashboard crash doesn't stop bot's Discord connection
- **Horizontal Scaling**: Bot container can be scaled behind load balancer if needed

### Container Images

| Container     | Image                                           | Size   | Port | Memory | Purpose                             |
| ------------- | ----------------------------------------------- | ------ | ---- | ------ | ----------------------------------- |
| **Bot**       | `ghcr.io/Rarsus/necromundabot:v1.5.0`           | ~150MB | 3000 | 512MB  | Discord bot, commands, database ops |
| **Dashboard** | `ghcr.io/Rarsus/necromundabot-dashboard:v1.5.0` | ~127MB | 3001 | 256MB  | React web UI, management, analytics |

### docker-compose Configuration

```yaml
version: '3.9'

services:
  necromundabot:
    image: ghcr.io/Rarsus/necromundabot:v1.5.0
    container_name: necromundabot
    restart: unless-stopped
    ports:
      - '3000:3000'
    environment:
      - DISCORD_TOKEN=${DISCORD_TOKEN}
      - DATABASE_PATH=/app/data/necromunda.db
      - NODE_ENV=production
    volumes:
      - necromundabot_data:/app/data
    networks:
      - necronet
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
    healthcheck:
      test: ['CMD', 'node', '-e', "require('http').get('http://localhost:3000')"]
      interval: 30s
      timeout: 10s
      retries: 3

  dashboard:
    image: ghcr.io/Rarsus/necromundabot-dashboard:v1.5.0
    container_name: necromundabot-dashboard
    restart: unless-stopped
    ports:
      - '3001:3001'
    environment:
      - API_URL=http://necromundabot:3000
      - DATABASE_PATH=/app/data/necromunda.db
      - NODE_ENV=production
    volumes:
      - necromundabot_data:/app/data:ro
    networks:
      - necronet
    depends_on:
      - necromundabot
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

volumes:
  necromundabot_data:
    driver: local

networks:
  necronet:
    driver: bridge
```

### Running Dual Containers

```bash
# Build both images
docker-compose build

# Start both containers
docker-compose up -d

# Check status
docker-compose ps

# View logs (all containers)
docker-compose logs -f

# View specific container logs
docker-compose logs -f necromundabot
docker-compose logs -f dashboard

# Update only bot
docker-compose up -d --build necromundabot

# Update only dashboard
docker-compose up -d --build dashboard

# Stop both
docker-compose down
```

### Local Development (No Docker)

For local development, run both services on your machine:

```bash
# Terminal 1: Bot service
cd repos/necrobot-core
npm install
npm start

# Terminal 2: Dashboard service
cd repos/necrobot-dashboard
npm install
npm start

# Both services share the local database
```

## Security Best Practices

1. **Never commit .env file** - Uses .gitignore
2. **Non-root user** - Container runs as `nodejs` user
3. **Read-only filesystem** - Can be enabled with: `read_only: true`
4. **Network isolation** - Private network by default
5. **Resource limits** - CPU and memory constrained
6. **Health checks** - Automatic container health monitoring

## Performance Tips

1. **Use volume mounts** - Database on fast storage (SSD recommended)
2. **Adjust memory limit** - If bot crashes, increase to 1GB
3. **Enable Docker BuildKit** - `DOCKER_BUILDKIT=1 docker build ...`
4. **Use .dockerignore** - Reduces build context size

## FAQ

**Q: How do I update the bot?**
A: Git pull new code, run `docker-compose up -d --build necromundabot` for bot or `docker-compose up -d --build dashboard` for dashboard. Database persists automatically. Both services can be updated independently.

**Q: Will my database be deleted if I stop the container?**
A: No, the database volume persists across container restarts. It's only deleted with `docker-compose down -v`.

**Q: Can I run multiple instances?**
A: Yes, use `docker-compose -p instance2 up -d` with different project names. Both bot and dashboard containers will be isolated.

**Q: How do I connect to the container shell?**
A: `docker-compose exec necromundabot sh` (bot) or `docker-compose exec dashboard sh` (dashboard)

**Q: What if the port is already in use?**
A: The bot doesn't expose any ports by default. If needed, modify docker-compose.yml.

## Support and Documentation

- [Docker Official Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

**Last Updated:** January 26, 2026  
**Version:** 0.0.2
