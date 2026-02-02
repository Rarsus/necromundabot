# Dashboard Development - Quick Reference Card

## TDD Workflow

```
RED → GREEN → REFACTOR → Commit → PR
```

### RED Phase (Write Tests First)

```bash
# 1. Create test file
touch tests/unit/test-dashboard-auth-service.test.js

# 2. Write all test cases (describe desired behavior)
# - Should handle X
# - Should throw error when Y
# - Should return Z

# 3. Run tests (expect all FAIL)
npm test -- test-dashboard-auth-service.test.js
# Expected: 0 passing, 15 failing ❌
```

### GREEN Phase (Implement Code)

```bash
# 1. Create implementation file
touch src/services/DashboardAuthService.js

# 2. Write minimal code to pass tests
class DashboardAuthService {
  async exchangeCodeForTokens(code, redirectUri) {
    // ... minimal implementation
  }
}

# 3. Run tests (expect all PASS)
npm test -- test-dashboard-auth-service.test.js
# Expected: 15 passing ✅
```

### REFACTOR Phase (Improve Code)

```bash
# 1. Optimize and improve
# - Extract helper functions
# - Add error handling
# - Add logging
# - Add JSDoc comments

# 2. Check coverage (≥90%)
npm run test:coverage -- test-dashboard-auth-service.test.js

# 3. Run linter
npm run lint -- src/services/DashboardAuthService.js

# 4. Final test run (still GREEN)
npm test -- test-dashboard-auth-service.test.js
# Expected: 15 passing ✅
```

---

## File Locations (Memorize These)

```
SERVICES (necrobot-utils):
  src/services/DashboardAuthService.js
  src/services/DashboardDatabaseService.js
  src/services/RBACService.js
  src/services/CacheService.js

TESTS (necrobot-utils):
  tests/unit/test-dashboard-auth-service.test.js
  tests/unit/test-dashboard-database-service.test.js
  tests/unit/test-rbac-service.test.js
  tests/unit/test-cache-service.test.js

ROUTES (necrobot-dashboard):
  src/pages/api/auth/login.js
  src/pages/api/auth/callback.js
  src/pages/api/auth/logout.js
  src/pages/api/guild/info.js
  src/pages/api/guild/stats.js

COMPONENTS (necrobot-dashboard):
  src/components/GuildHeader.jsx
  src/components/MemberList.jsx
  src/components/RolesList.jsx
  src/components/BotStats.jsx
  src/components/Contributors.jsx

PAGES (necrobot-dashboard):
  src/pages/_app.jsx
  src/pages/index.jsx
  src/pages/login.jsx
```

---

## Common Commands

```bash
# Start development
npm test -- test-file.test.js              # Run specific test
npm test                                   # Run all tests
npm run test:coverage                      # Check coverage
npm run lint                               # Check lint
npm run lint:fix                           # Auto-fix lint

# Docker
docker-compose up --build                  # Start all services
docker-compose logs -f                     # View logs
docker-compose down                        # Stop services

# Git
git checkout -b feat/dashboard-name        # Create branch
git add repos/necrobot-utils/              # Stage changes
git commit -m "feat(utils): Description"   # Commit
git push origin feat/dashboard-name        # Push
```

---

## Commit Message Template

```
feat(utils): DashboardAuthService - Discord OAuth implementation

- Implemented OAuth code exchange
- Added token refresh mechanism
- Added user profile retrieval
- Added guild membership verification
- TDD workflow: RED → GREEN → REFACTOR
- Test coverage: 91% (15/15 tests passing)

Closes #28
```

---

## Test Structure Template

```javascript
// tests/unit/test-dashboard-auth-service.test.js
const DashboardAuthService = require('../../../src/services/DashboardAuthService');

describe('DashboardAuthService', () => {
  let authService;

  beforeEach(() => {
    authService = new DashboardAuthService('client-id', 'client-secret', 'guild-123', 'bot-token');
  });

  describe('exchangeCodeForTokens()', () => {
    it('should exchange code for tokens', async () => {
      const result = await authService.exchangeCodeForTokens('code', 'uri');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw error for invalid code', async () => {
      await expect(authService.exchangeCodeForTokens('invalid', 'uri')).rejects.toThrow('Invalid authorization code');
    });
  });
});
```

---

## Service Template

```javascript
// src/services/DashboardAuthService.js
/**
 * Discord OAuth Authentication Service
 * Handles token exchange, validation, and user verification
 */
class DashboardAuthService {
  constructor(clientId, clientSecret, guildId, botToken) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.guildId = guildId;
    this.botToken = botToken;
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code from Discord
   * @param {string} redirectUri - Redirect URI
   * @returns {Promise<Object>} - { accessToken, refreshToken, expiresIn }
   * @throws {Error} - If code is invalid
   */
  async exchangeCodeForTokens(code, redirectUri) {
    if (!code) throw new Error('Code is required');
    // Implementation...
  }
}

module.exports = DashboardAuthService;
```

---

## Environment Variables

```bash
# Discord OAuth
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_GUILD_ID=your_guild_id
DISCORD_BOT_TOKEN=your_bot_token

# Dashboard
DASHBOARD_PORT=3000
DASHBOARD_URL=http://localhost:3000
DASHBOARD_SECRET=random_secret

# Database
DASHBOARD_DB_PATH=/dashboard-data/dashboard.db
DASHBOARD_DB_ENCRYPTION_KEY=your_32_byte_hex_key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# GitHub
GITHUB_REPO=Rarsus/necromundabot
GITHUB_API_TOKEN=your_token
```

---

## Coverage Target

```
Service Layer (necrobot-utils):    ≥90%
API Routes:                        ≥85%
Components:                        ≥75%
Critical Paths:                    100%
```

Check coverage:

```bash
npm run test:coverage
# View in: coverage/lcov-report/index.html
```

---

## Task Order

```
1. #28: DashboardAuthService (Week 1-2)
   - OAuth token exchange
   - User profile retrieval
   - Guild membership check
   - Test: 15+ test cases

2. #29: DashboardDatabaseService (Week 2-3)
   - Guild config CRUD
   - Encryption/decryption
   - Audit logging
   - Test: 18+ test cases

3. #30: RBACService (Week 2-3)
   - Permission management
   - Role assignment
   - Access control
   - Test: 20+ test cases

4. #31: CacheService (Week 3)
   - Redis integration
   - Cache invalidation
   - TTL management

5. #33-37: Components (Week 4)
   - GuildHeader, MemberList, RolesList, etc.

6. #38-40: Polish (Week 5)
   - Security, performance, docs
```

---

## Pre-Commit Checklist

- [ ] All tests passing: `npm test`
- [ ] Coverage ≥90%: `npm run test:coverage`
- [ ] No lint warnings: `npm run lint`
- [ ] Commit message follows format
- [ ] Related issue linked (#28, #29, etc.)
- [ ] TDD workflow completed (RED→GREEN→REFACTOR)

---

## Common Issues

**Tests not running?**

```bash
npm test -- --clearCache
npm test -- test-file.test.js --verbose
```

**Coverage not showing?**

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

**Encryption key error?**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy to DASHBOARD_DB_ENCRYPTION_KEY
```

**Redis not connecting?**

```bash
docker run -d -p 6379:6379 redis:7-alpine
redis-cli ping  # Should return PONG
```

---

## Resources

- **Epic:** #27
- **Guide:** docs/guides/DASHBOARD-DEVELOPMENT-GUIDE.md
- **Summary:** project-docs/DASHBOARD-EPIC-SUMMARY.md
- **Discord API:** https://discord.com/developers/docs/topics/oauth2
- **Jest:** https://jestjs.io/docs/getting-started

---

**Print This Card & Keep It Handy!**

Last Updated: February 2, 2026
