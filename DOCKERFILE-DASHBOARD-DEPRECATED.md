# DEPRECATED: Dockerfile.dashboard

⚠️ **This file is deprecated as of January 31, 2026**

---

## Migration Path

**Old approach (DEPRECATED):**

```dockerfile
# Separate Dockerfile for dashboard
dockerfile: Dockerfile.dashboard
```

**New approach (CURRENT):**

```dockerfile
# Multi-target Dockerfile
dockerfile: Dockerfile
target: dashboard
```

---

## Why This Changed

The project now uses **multi-target Docker builds** in a single `Dockerfile` to improve:

- **Maintainability:** One Dockerfile instead of multiple files
- **Build efficiency:** Shared `base-builder` stage reduces build time
- **Consistency:** Both bot and dashboard use the same base image and setup
- **Flexibility:** Can build different targets with `--target` flag

---

## Files Updated

All references to `Dockerfile.dashboard` have been migrated:

### GitHub Actions Workflows

1. **`.github/workflows/publish-packages.yml`**
   - Changed from: `file: Dockerfile.dashboard`
   - Changed to: `file: Dockerfile` + `target: dashboard`

2. **`.github/workflows/release.yml`**
   - Changed from: `file: Dockerfile.dashboard`
   - Changed to: `file: Dockerfile` + `target: dashboard`

### Docker Compose

3. **`docker-compose.yml`**
   - Changed from: `dockerfile: Dockerfile.dashboard`
   - Changed to: `dockerfile: Dockerfile` + `target: dashboard`

---

## Building Dashboard Now

### Old Way (No longer used):

```bash
docker build -f Dockerfile.dashboard -t necromundabot-dashboard .
```

### New Way (Current):

```bash
docker build -f Dockerfile --target dashboard -t necromundabot-dashboard .
```

Or via docker-compose:

```bash
docker-compose build necrobot-dashboard
```

---

## File Retention

This file (`Dockerfile.dashboard`) is kept in the repository for:

- **Historical reference:** Shows previous approach
- **Easy rollback:** If needed, can restore old builds
- **Documentation:** Reference for how the split was done

**Status:** ✅ Safe to delete if no longer needed

---

## Next Steps

1. ✅ All workflows updated to use multi-target builds
2. ✅ Docker-compose.yml updated
3. ✅ Documentation created
4. 🟡 _Optional:_ Delete this file after verification period (14 days recommended)

---

**Deprecated Date:** January 31, 2026  
**Replacement:** [Dockerfile](./Dockerfile) with `--target dashboard`  
**Commit:** 0480866 and follow-ups
