# Docker Quick Reference for NecromundaBot

## Quick Commands

```bash
# Setup (First Time)
mkdir -p ./data
docker-compose up --build -d

# View logs
docker-compose logs -f necromundabot

# Stop containers
docker-compose down

# Status and Health
docker ps                          # View running containers
docker stats necromundabot         # View resource usage
docker inspect necromundabot --format='{{.State.Health.Status}}'
```

## One-Liner Commands

```bash
# Build, run, and watch logs
docker-compose up -d --build && docker logs -f necromundabot

# Rebuild and restart (keeps database)
docker-compose up -d --build

# View last 50 lines of logs
docker logs --tail 50 necromundabot

# Enter container shell
docker exec -it necromundabot sh

# Full reset (DANGER: deletes database!)
docker-compose down -v && rm -rf ./data && docker-compose up --build -d

# Stop everything
docker-compose down
```

## Performance Tips

| Action | Time | Command |
|--------|------|---------|
| **First build** | ~3-5 min | `docker-compose up --build -d` |
| **Rebuild (cached)** | 10-30 sec | `docker-compose up --build -d` |
| **Just start** | <5 sec | `docker-compose up -d` |
| **Stop** | <5 sec | `docker-compose down` |

## What Gets Persisted?

✅ **Persists** (Survives rebuilds and restarts):
- Node modules (reinstalled each build)
- Log files (in container)
- Application code (pulled from repo)

## File Locations

| File | Purpose |
|------|---------|
| `Dockerfile` | Container build recipe |
| `docker-compose.yml` | Container orchestration |
| `.dockerignore` | Exclude files from build |
| `.env.docker.example` | Environment template |
| `docs/user-guides/docker-setup.md` | Full documentation |
| `./data/necromundabot.db` | Database (on host) |

## Key Features

- ✅ Multi-stage build (smaller images)
- ✅ Persistent database volume
- ✅ Non-root user for security
- ✅ Resource limits (512MB RAM, 1 CPU)
- ✅ Health checks
- ✅ Graceful shutdown handling
- ✅ Alpine Linux base (14MB)

## First Time Setup

1. Copy env file: `cp .env.docker.example .env`
2. Edit .env: Add `DISCORD_TOKEN` and `CLIENT_ID`
3. Build: `docker-compose build`
4. Run: `docker-compose up -d`
5. Verify: `docker-compose logs -f`

---

See `docs/user-guides/docker-setup.md` for complete guide.
