# Docker Multi-Target Build - Quick Reference

**Status:** ✅ FIXED (Commit 0480866)  
**Issue:** GitHub Actions staging deployment failing - Docker target stages missing  
**Solution:** Restructured Dockerfile with 3 named stages supporting multiple build targets

---

## Quick Facts

| Aspect     | Details                                                          |
| ---------- | ---------------------------------------------------------------- |
| **Commit** | `0480866`                                                        |
| **Date**   | January 31, 2026                                                 |
| **Issue**  | `docker build --target bot` failed with "target stage not found" |
| **Fix**    | Added named stages: `base-builder`, `bot`, `dashboard`           |
| **Status** | ✅ Deployed to main                                              |

---

## Build Commands

```bash
# Build Discord bot image
docker build -t necromundabot:staging --target bot .

# Build dashboard (web UI) image
docker build -t necromundabot-dashboard:staging --target dashboard .

# Default build (uses last stage)
docker build -t necromundabot .
```

---

## Dockerfile Structure

```
base-builder (shared)
├── Install Node 22 Alpine
├── Install build tools (python3, make, g++)
├── Copy all workspace packages
└── npm ci --workspaces

     ↓ (copies from)

bot (Discord bot runtime)      dashboard (Web UI runtime)
├── nodejs user setup          ├── nodejs user setup
├── Copy bot packages          ├── Copy dashboard packages
├── Health check               ├── Health check (port 3000)
├── CMD: node bot.js           └── CMD: npm start (dashboard)
└── EXPOSE 3000

```

---

## GitHub Actions Integration

### Deployment Workflow

File: `.github/workflows/deployment-coordination.yml`

```yaml
- name: 🐳 Build Docker images (staging)
  run: |
    docker build -t necromundabot:staging --target bot .
    docker build -t necromundabot-dashboard:staging --target dashboard .
```

**Status:** ✅ NOW WORKS (was failing before fix)

---

## Key Changes

| Stage             | Old                            | New                                    |
| ----------------- | ------------------------------ | -------------------------------------- |
| Builder           | `AS builder` (unnamed runtime) | `AS base-builder` (shared)             |
| Bot               | Merged with builder            | `AS bot` (separate target)             |
| Dashboard         | Not built                      | `AS dashboard` (new target)            |
| Buildable targets | None                           | `--target bot` or `--target dashboard` |

---

## Version Information

- **Dockerfile Version:** 1.8.0 (updated from 0.0.2)
- **Node.js:** 22-alpine (consistent across all stages)
- **npm:** 10.x (included with Node 22)

---

## Testing Locally

```bash
# Test bot image builds
docker build --target bot -t test-bot .
docker run test-bot node --version

# Test dashboard image builds
docker build --target dashboard -t test-dashboard .
docker run test-dashboard npm --version

# Verify sizes (bot should be smaller than dashboard)
docker images | grep test
```

---

## Troubleshooting

**Q: Build fails with "target stage 'bot' could not be found"**  
A: You have an old Dockerfile. Pull latest: `git pull origin main`

**Q: Which stage is default?**  
A: The last stage in Dockerfile (`dashboard`). Use `--target bot` to build bot.

**Q: Why three stages?**  
A: `base-builder` is shared to cache dependencies. `bot` and `dashboard` are separate runtime environments.

**Q: Can I build both in parallel?**  
A: Yes! Both share `base-builder` cache layer, so second build is much faster.

---

## Performance

- First build: ~35-40s (builds base-builder)
- Subsequent builds (same target): ~5-10s (uses cache)
- Building both targets: ~40-50s (shares base-builder cache)

---

## Related Documentation

- [Full Docker Multi-Target Build Fix](./DOCKER-MULTI-TARGET-BUILD-FIX.md)
- [Deployment Coordination Workflow](./../.github/workflows/deployment-coordination.yml)
- [Dockerfile](../../Dockerfile)

---

**Status:** ✅ Ready for production  
**Last Updated:** January 31, 2026
