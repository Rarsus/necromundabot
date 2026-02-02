# Dashboard Development Epic - Summary

**Date Created:** February 2, 2026  
**Epic:** #27 - Guild-Aware Dashboard with Discord OAuth & Encrypted Database  
**Target:** 5 weeks  
**Methodology:** Test-Driven Development (TDD)

---

## What's Been Created

### 1. Epic Issue #27

**Guild-Aware Dashboard with Discord OAuth & Encrypted Database**

- Complete specification of all components
- Phase breakdown (5 phases over 5 weeks)
- File structure and architecture
- Environment variables and Docker setup
- Definition of Done criteria
- Success metrics

### 2. Implementation Tasks

#### Task #28: DashboardAuthService (necrobot-utils)

**Discord OAuth Authentication**

- OAuth code exchange → tokens
- Token refresh and validation
- User profile retrieval
- Guild membership verification
- User role fetching
- TDD workflow detailed for 6 test categories

#### Task #29: DashboardDatabaseService (necrobot-utils)

**Encrypted Guild-Specific Database**

- Guild configuration CRUD
- AES-256-GCM encryption at rest
- Role-based permissions storage
- Audit logging for all changes
- Database transactions
- TDD workflow detailed for 6 test categories

#### Task #30: RBACService (necrobot-utils)

**Role-Based Access Control**

- Permission definitions
- Role configuration
- User authorization checks
- Permission level hierarchy (admin > editor > viewer > restricted)
- Access decision logging
- Permission caching with Redis
- TDD workflow detailed for 7 test categories

### 3. Development Guide

**DASHBOARD-DEVELOPMENT-GUIDE.md**

- Complete TDD workflow explanation (RED → GREEN → REFACTOR)
- Environment setup instructions
- Docker configuration
- File structure overview
- Testing patterns and examples
- Commit message format
- Pre-commit and post-PR checklists
- Troubleshooting guide
- FAQ

---

## Task Breakdown by Phase

### Phase 1: Foundation & Authentication (Week 1-2)

- **#28** DashboardAuthService (OAuth, token management)
- **#29** DashboardDatabaseService (config storage)
- **Related Frontend:** Login page, OAuth callback

### Phase 2: Database & Authorization (Week 2-3)

- **#30** RBACService (role-based access control)
- **Related Frontend:** Permission middleware, access checks

### Phase 3: Caching & Performance (Week 3)

- **#31** (to create) CacheService (Redis integration)
- **#32** (to create) Cache invalidation strategy

### Phase 4: Dashboard UI (Week 4)

- **#33** (to create) Guild Header Component
- **#34** (to create) Member List Component
- **#35** (to create) Roles List Component
- **#36** (to create) Bot Stats Component
- **#37** (to create) Contributors Component

### Phase 5: Polish & Security (Week 5)

- **#38** (to create) Security audit and hardening
- **#39** (to create) Performance optimization
- **#40** (to create) Documentation and deployment testing

---

## Key Features Delivered

### 1. Guild-Aware Architecture

✅ All operations filtered by guild ID  
✅ Single guild per dashboard instance  
✅ Guild ID from environment configuration

### 2. Discord OAuth Authentication

✅ Standard OAuth 2.0 flow  
✅ Access and refresh tokens  
✅ Secure token storage  
✅ Session management

### 3. Encrypted Database

✅ AES-256-GCM encryption  
✅ Guild-specific settings storage  
✅ Audit log for compliance  
✅ Docker volume persistence

### 4. Role-Based Authorization

✅ 4-level permission hierarchy  
✅ Configurable role mappings  
✅ Per-resource authorization  
✅ Audit logging

### 5. Redis Caching

✅ Fast reads with configurable TTL  
✅ Automatic cache invalidation  
✅ Graceful fallback if cache unavailable

### 6. MVP Dashboard

✅ Guild member list  
✅ Available roles display  
✅ Bot uptime tracking  
✅ GitHub contributor list  
✅ Guild statistics

---

## Database Schema (Overview)

```sql
-- Configuration storage
dashboard_guild_config
  - id, guild_id, setting_key, setting_value, encrypted, timestamps

-- Permission mappings
dashboard_role_permissions
  - id, guild_id, discord_role_id, permission_name, timestamps

-- Compliance tracking
dashboard_audit_log
  - id, guild_id, user_id, action, resource_type, resource_id, timestamps

-- Session management (optional)
dashboard_sessions
  - id, guild_id, user_id, token, expires_at, timestamps
```

---

## Technology Stack

### Backend (necrobot-utils)

- **Node.js** 22+ (existing)
- **SQLite3** (existing database)
- **Redis** 7 (caching)
- **crypto-js** (encryption)
- **jose** (JWT tokens)
- **winston** (logging)
- **jest** (testing)

### Frontend (necrobot-dashboard)

- **Next.js** 16 (already upgraded)
- **React** 19 (already upgraded)
- **next-auth** (OAuth)
- **axios** (HTTP client)
- **joi** (validation)
- **@testing-library/react** (component testing)

### Infrastructure

- **Docker** with volume mounts
- **Docker Compose** with Redis service
- **GitHub Actions** for CI/CD

---

## TDD Emphasis

**Every task follows RED → GREEN → REFACTOR:**

1. **RED Phase**
   - Write comprehensive tests first
   - Tests describe desired behavior
   - Tests intentionally fail
   - No implementation code yet

2. **GREEN Phase**
   - Implement minimal code to pass tests
   - Focus on making tests pass
   - Don't add extra features
   - Code may not be pretty yet

3. **REFACTOR Phase**
   - Optimize and improve code
   - Add error handling and logging
   - Improve documentation
   - Ensure ≥90% coverage
   - All tests still pass

**Coverage Requirements:**

- Service layer (necrobot-utils): ≥90%
- API routes: ≥85%
- React components: ≥75%
- Critical paths: 100%

---

## File Organization

### Created/Modified

**New:**

- `docs/guides/DASHBOARD-DEVELOPMENT-GUIDE.md` (this guide)
- `repos/necrobot-utils/src/services/DashboardAuthService.js` (to create)
- `repos/necrobot-utils/src/services/DashboardDatabaseService.js` (to create)
- `repos/necrobot-utils/src/services/RBACService.js` (to create)
- `repos/necrobot-utils/src/services/CacheService.js` (to create)
- `repos/necrobot-utils/tests/unit/test-*.test.js` (multiple test files)
- `repos/necrobot-dashboard/src/api/auth/` (API routes)
- `repos/necrobot-dashboard/src/api/guild/` (API routes)
- `repos/necrobot-dashboard/src/components/` (React components)
- `repos/necrobot-dashboard/src/pages/` (Next.js pages)

**Docker volumes (persistent storage):**

- `/dashboard-data/dashboard.db` (database)
- `/redis-data/` (Redis backup)

---

## Development Workflow

### For Each Task:

1. **Checkout feature branch**

   ```bash
   git checkout -b feat/dashboard-[feature-name]
   ```

2. **RED Phase** (~2 hours)
   - Write comprehensive test suite
   - Ensure all tests fail
   - Example test count: 12-20 tests per service

3. **GREEN Phase** (~1-2 hours)
   - Implement service to pass all tests
   - Write minimal, focused code

4. **REFACTOR Phase** (~1 hour)
   - Optimize and document
   - Check coverage (≥90%)
   - Verify ESLint passing

5. **Commit & Push**

   ```bash
   git commit -m "feat(scope): Short description

   - Detailed bullet points
   - TDD workflow: RED → GREEN → REFACTOR
   - Coverage: 91%
   - Tests: 15 passing

   Closes #28"

   git push origin feat/dashboard-[feature-name]
   ```

6. **Create Pull Request**
   - Link to epic #27
   - Link to task #28 (or relevant)
   - Include test results
   - Request code review

---

## Getting Started

### Prerequisites

- [ ] Read Epic #27 completely
- [ ] Read this summary
- [ ] Read DASHBOARD-DEVELOPMENT-GUIDE.md
- [ ] Read Task #28 (or current task)

### Setup (10 minutes)

```bash
# Install dependencies
npm install
npm install next-auth redis crypto-js jose axios joi winston -w repos/necrobot-dashboard
npm install redis crypto-js jose winston -w repos/necrobot-utils

# Create .env.local
cp repos/necrobot-dashboard/.env.example repos/necrobot-dashboard/.env.local

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Add to .env.local

# Create Docker volumes
mkdir -p data/dashboard-db data/redis
```

### Start Development

```bash
# Choose a task (e.g., #28)
git checkout -b feat/dashboard-auth-service

# Phase 1: RED - Write tests (don't implement yet)
cd repos/necrobot-utils
touch tests/unit/test-dashboard-auth-service.test.js
# Write test cases...
npm test -- test-dashboard-auth-service.test.js
# Expect FAIL

# Phase 2: GREEN - Implement
touch src/services/DashboardAuthService.js
# Implement service...
npm test -- test-dashboard-auth-service.test.js
# Expect PASS

# Phase 3: REFACTOR - Optimize
# Improve code, add docs...
npm test -- test-dashboard-auth-service.test.js
# Expect still PASS

# Commit
git add repos/necrobot-utils/
git commit -m "feat(utils): Add DashboardAuthService..."
git push origin feat/dashboard-auth-service
```

---

## Success Criteria

All tasks must meet:

- ✅ TDD workflow completed (RED → GREEN → REFACTOR)
- ✅ Test coverage ≥90% (service layer)
- ✅ All tests passing (131/131 current + new tests)
- ✅ ESLint passing (no warnings)
- ✅ Code reviewed and approved
- ✅ Tested in Docker environment
- ✅ Security review passed
- ✅ Performance benchmarks met

---

## Related GitHub Issues

- **#27** Epic: Guild-Aware Dashboard with Discord OAuth & Encrypted Database
- **#28** Task: DashboardAuthService - Discord OAuth Authentication
- **#29** Task: DashboardDatabaseService - Encrypted Guild-Specific Database
- **#30** Task: RBACService - Role-Based Access Control

---

## Support & Resources

**Questions?** Check:

1. DASHBOARD-DEVELOPMENT-GUIDE.md (comprehensive guide)
2. Task description (#28, #29, #30)
3. Test examples in guide
4. Troubleshooting section in guide

**Code Examples:**

- Test patterns in guide
- Mock patterns in guide
- Database patterns in guide
- Authorization patterns in guide

**External Resources:**

- Discord OAuth: https://discord.com/developers/docs/topics/oauth2
- Next.js: https://nextjs.org/docs
- Redis: https://redis.io/docs/
- Jest: https://jestjs.io/docs/getting-started
- SQLite3: https://www.sqlite.org/docs.html

---

## Timeline

| Week | Phase              | Tasks    | Deliverable              |
| ---- | ------------------ | -------- | ------------------------ |
| 1-2  | Foundation & Auth  | #28, #29 | OAuth + Database working |
| 2-3  | DB & Authorization | #30, #31 | RBAC + Caching working   |
| 3    | Caching & Perf     | #31, #32 | Cache layer optimized    |
| 4    | Dashboard UI       | #33-37   | MVP dashboard complete   |
| 5    | Polish & Security  | #38-40   | Production-ready         |

---

## Metrics to Track

**Code Quality:**

- Test coverage trend (target: ≥90%)
- ESLint warnings (target: 0)
- Test pass rate (target: 100%)

**Performance:**

- Average response time (target: <1s cached)
- Cache hit rate (target: >80%)
- Database query time (target: <100ms)

**Completion:**

- Tasks completed on schedule
- Code review feedback incorporated
- No regressions in existing tests

---

**Created:** February 2, 2026  
**Status:** 🟡 Ready to Start  
**Next Step:** Begin Task #28 (DashboardAuthService)
