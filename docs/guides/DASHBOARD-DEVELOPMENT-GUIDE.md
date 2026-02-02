# Dashboard Development Guide - TDD Workflow

**Status:** 🟡 In Planning  
**Start Date:** February 2, 2026  
**Target Completion:** 5 weeks  
**Epic:** #27 - Guild-Aware Dashboard with Discord OAuth & Encrypted Database

---

## Quick Start Checklist

Before starting development:

- [ ] Read this entire guide
- [ ] Understand the TDD workflow (RED → GREEN → REFACTOR)
- [ ] Review the epic (#27) and related tasks (#28-30)
- [ ] Set up environment variables (see below)
- [ ] Understand the architecture (see Architecture section)
- [ ] Install dependencies

---

## Environment Setup

### 1. Install Dependencies

```bash
cd /home/olav/repo/necromundabot
npm install

# Dashboard-specific packages
cd repos/necrobot-dashboard
npm install next-auth redis crypto-js jose axios joi winston
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Utils service layer
cd ../necrobot-utils
npm install redis crypto-js jose winston
npm install --save-dev jest-mock-extended
```

### 2. Set Environment Variables

Create `.env.local` in `repos/necrobot-dashboard/`:

```bash
# Discord OAuth Configuration
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_GUILD_ID=your_guild_id
DISCORD_BOT_TOKEN=your_bot_token

# Dashboard Configuration
DASHBOARD_PORT=3000
DASHBOARD_URL=http://localhost:3000
DASHBOARD_SECRET=your_random_secret_key_here

# Database Configuration
DASHBOARD_DB_PATH=/dashboard-data/dashboard.db
DASHBOARD_DB_ENCRYPTION_KEY=your_32_byte_hex_key

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional_password

# GitHub Configuration (for contributors)
GITHUB_REPO=Rarsus/necromundabot
GITHUB_API_TOKEN=your_github_token
```

### 3. Set Up Docker Volumes

Create persistent storage directories:

```bash
mkdir -p /home/olav/repo/necromundabot/data/dashboard-db
mkdir -p /home/olav/repo/necromundabot/data/redis

# Create .gitkeep to preserve directories
touch /home/olav/repo/necromundabot/data/dashboard-db/.gitkeep
touch /home/olav/repo/necromundabot/data/redis/.gitkeep
```

### 4. Generate Encryption Key

```bash
# Generate a random 32-byte hex key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output and set DASHBOARD_DB_ENCRYPTION_KEY
```

---

## TDD Workflow (RED → GREEN → REFACTOR)

### Phase 1: RED - Write Tests First

This is the critical first step. **You will NOT write any implementation code yet.**

**Steps:**

1. **Create test file** (see file structure)
2. **Write test cases** that describe the desired behavior
   - Use descriptive test names: `should <behavior> when <condition>`
   - Test happy paths (success scenarios)
   - Test error paths (failure scenarios)
   - Test edge cases (boundary conditions)

3. **Run tests** and confirm they FAIL

   ```bash
   npm test -- test-file.test.js
   ```

   Expected: RED (all tests failing)

4. **Do NOT implement code yet** - the RED phase is complete when:
   - All tests are written
   - All tests fail with clear error messages
   - Test descriptions match desired behavior

**Example RED Phase Test:**

```javascript
// tests/unit/test-dashboard-auth-service.test.js
describe('DashboardAuthService', () => {
  describe('exchangeCodeForTokens()', () => {
    it('should exchange authorization code for tokens (RED phase)', () => {
      const authService = new DashboardAuthService(
        'client-id',
        'client-secret',
        'guild-123',
        'bot-token'
      );

      const result = await authService.exchangeCodeForTokens(
        'auth-code-xyz',
        'http://localhost:3000/callback'
      );

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result.expiresIn).toBeGreaterThan(0);
    });

    it('should throw error for invalid code (RED phase)', async () => {
      // Test should FAIL because service doesn't exist yet
      await expect(
        authService.exchangeCodeForTokens('invalid-code', 'http://localhost:3000')
      ).rejects.toThrow('Invalid authorization code');
    });
  });
});
```

---

### Phase 2: GREEN - Implement Code

Now you write the minimal code to make tests pass.

**Steps:**

1. **Implement service** to satisfy test requirements
   - Write the minimum code needed to pass tests
   - Don't add extra features
   - Focus on making tests GREEN

2. **Run tests** and confirm they PASS

   ```bash
   npm test -- test-file.test.js
   ```

   Expected: GREEN (all tests passing)

3. **Do NOT refactor yet** - the GREEN phase is complete when:
   - All tests pass
   - Code is minimal (may not be pretty)
   - No new functionality beyond what tests require

**Example GREEN Phase Implementation:**

```javascript
// src/services/DashboardAuthService.js
class DashboardAuthService {
  constructor(clientId, clientSecret, guildId, botToken) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.guildId = guildId;
    this.botToken = botToken;
  }

  async exchangeCodeForTokens(code, redirectUri) {
    if (!code || code === 'invalid-code') {
      throw new Error('Invalid authorization code');
    }

    // Call Discord API
    const response = await fetch('https://discord.com/api/v10/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
    };
  }
}

module.exports = DashboardAuthService;
```

---

### Phase 3: REFACTOR - Improve Code Quality

Now that all tests pass, improve the code.

**Steps:**

1. **Optimize code**
   - Extract repeated code into functions
   - Improve naming for clarity
   - Add error handling
   - Add logging for debugging

2. **Add documentation**
   - JSDoc comments for functions
   - Inline comments for complex logic
   - README if needed

3. **Run tests again** to ensure nothing broke

   ```bash
   npm test -- test-file.test.js
   ```

   Expected: All tests still GREEN

4. **Refactor complete** when:
   - Code is clean and maintainable
   - Tests still pass
   - Coverage is ≥90%
   - No ESLint warnings

**Example REFACTOR Phase Improvements:**

```javascript
// Refactored with better error handling and logging
class DashboardAuthService {
  constructor(clientId, clientSecret, guildId, botToken) {
    if (!clientId || !clientSecret) {
      throw new Error('Discord credentials required');
    }
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.guildId = guildId;
    this.botToken = botToken;
    this.logger = require('winston').createLogger({
      label: 'DashboardAuthService',
    });
  }

  /**
   * Exchange authorization code for access and refresh tokens
   * @param {string} code - Authorization code from Discord OAuth
   * @param {string} redirectUri - Redirect URI from Discord app settings
   * @returns {Promise<{accessToken, refreshToken, expiresIn, tokenType}>}
   * @throws {Error} If code is invalid or Discord API fails
   */
  async exchangeCodeForTokens(code, redirectUri) {
    this.logger.debug(`Exchanging code for tokens`, { code, redirectUri });

    if (!code) {
      throw new Error('Authorization code is required');
    }

    try {
      const response = await this._callDiscordAPI('/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
      });

      this.logger.debug('Token exchange successful');
      return {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresIn: response.expires_in,
        tokenType: response.token_type,
      };
    } catch (error) {
      this.logger.error('Token exchange failed', { error: error.message });
      throw error;
    }
  }

  // Private helper for Discord API calls
  async _callDiscordAPI(endpoint, options = {}) {
    const url = `https://discord.com/api/v10${endpoint}`;
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Discord API error (${response.status}): ${error.message || response.statusText}`);
    }

    return response.json();
  }
}
```

---

## Test Coverage Requirements

All code must meet minimum coverage thresholds:

| Module Type                     | Lines | Functions | Branches |
| ------------------------------- | ----- | --------- | -------- |
| Service Layer (necrobot-utils)  | ≥90%  | ≥90%      | ≥85%     |
| API Routes (necrobot-dashboard) | ≥85%  | ≥85%      | ≥80%     |
| React Components                | ≥75%  | ≥75%      | ≥70%     |
| **Critical Paths**              | ≥100% | ≥100%     | ≥100%    |

**Check coverage:**

```bash
npm run test:coverage --workspace=repos/necrobot-utils
npm run test:coverage --workspace=repos/necrobot-dashboard
```

---

## Project Structure & File Locations

### necrobot-utils (Service Layer - TDD Priority #1)

Services (implement in this order):

```
src/services/
├── DashboardAuthService.js          # OAuth, token management
├── DashboardDatabaseService.js      # Config CRUD, encryption
├── RBACService.js                   # Role-based access control
├── CacheService.js                  # Redis integration
└── EncryptionService.js             # AES-256-GCM encryption
```

Tests (create first, code after):

```
tests/unit/
├── test-dashboard-auth-service.test.js
├── test-dashboard-database-service.test.js
├── test-rbac-service.test.js
├── test-cache-service.test.js
└── test-encryption-service.test.js
```

### necrobot-dashboard (Frontend - TDD Priority #2)

API Routes:

```
src/pages/api/
├── auth/
│   ├── login.js                     # OAuth authorization URL
│   ├── callback.js                  # OAuth callback handler
│   └── logout.js                    # Session cleanup
├── guild/
│   ├── info.js                      # Guild info (members, roles)
│   └── stats.js                     # Bot stats
└── config/
    └── [key].js                     # Configuration endpoints
```

React Components:

```
src/components/
├── GuildHeader.jsx
├── MemberList.jsx
├── RolesList.jsx
├── BotStats.jsx
└── Contributors.jsx
```

Pages:

```
src/pages/
├── _app.jsx                         # App wrapper with auth context
├── index.jsx                        # Dashboard home
├── login.jsx                        # Login page
└── dashboard/
    └── [guildId]/
        └── index.jsx                # Guild dashboard
```

---

## Development Workflow Example

### Step 1: Start Task #28 (DashboardAuthService)

```bash
cd /home/olav/repo/necromundabot

# Create feature branch
git checkout -b feat/dashboard-auth-service

# Read task description
# Task #28: DashboardAuthService - Discord OAuth Authentication
```

### Step 2: RED Phase - Write Tests

```bash
cd repos/necrobot-utils

# Create test file
touch tests/unit/test-dashboard-auth-service.test.js

# Write all test cases (no implementation yet)
# Tests should FAIL when you run them
npm test -- test-dashboard-auth-service.test.js
# Expected: FAIL (0 tests passing)
```

### Step 3: GREEN Phase - Implement Service

```bash
# Create service file
touch src/services/DashboardAuthService.js

# Implement minimal code to make tests pass
npm test -- test-dashboard-auth-service.test.js
# Expected: PASS (all tests passing)
```

### Step 4: REFACTOR Phase - Improve Code

```bash
# Optimize, document, improve error handling
# Check coverage
npm run test:coverage -- test-dashboard-auth-service.test.js

# Ensure no ESLint warnings
npm run lint -- src/services/DashboardAuthService.js

# Final test run
npm test -- test-dashboard-auth-service.test.js
# Expected: PASS (all tests still passing, ≥90% coverage)
```

### Step 5: Commit & Create PR

```bash
# Stage changes
git add repos/necrobot-utils/

# Commit (follow Conventional Commits format)
git commit -m "feat(utils): Add DashboardAuthService for Discord OAuth

- Implemented OAuth code exchange for tokens
- Added token refresh and validation
- Added user profile and guild membership verification
- Full test coverage (91%)
- All tests passing (RED → GREEN → REFACTOR workflow)"

# Push and create PR
git push origin feat/dashboard-auth-service
```

---

## Key Testing Patterns

### Testing Async Code

```javascript
describe('DashboardAuthService', () => {
  it('should handle async operations', async () => {
    const result = await authService.getUserProfile(token);
    expect(result).toEqual({ id: '123', username: 'test' });
  });

  it('should handle errors in async code', async () => {
    await expect(authService.exchangeCodeForTokens('invalid')).rejects.toThrow('Invalid code');
  });
});
```

### Mocking External APIs

```javascript
// Mock Discord API
jest.mock('node-fetch', () =>
  jest.fn((url, options) => {
    if (url.includes('/oauth2/token')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'token_xyz',
            refresh_token: 'refresh_xyz',
            expires_in: 604800,
          }),
      });
    }
    return Promise.reject(new Error('Not mocked'));
  })
);
```

### Testing Database Operations

```javascript
let db;

beforeEach(() => {
  // Create in-memory SQLite for tests
  db = new DatabaseService(':memory:');
  db.initialize();
});

afterEach(() => {
  db.close();
});

it('should create setting', async () => {
  const result = await db.setSetting('guild-123', 'key', 'value');
  expect(result.guildId).toBe('guild-123');
});
```

### Testing Authorization

```javascript
it('should grant access with correct permission', async () => {
  const rbac = new RBACService(db, cache);
  await rbac.assignPermissionToRole('guild-123', 'role-editor', 'editor');

  const hasAccess = await rbac.hasPermission('guild-123', 'user-789', 'guild.settings', 'read');
  expect(hasAccess).toBe(true);
});

it('should deny access without permission', async () => {
  const rbac = new RBACService(db, cache);

  await expect(rbac.enforcePermission('guild-123', 'user-789', 'guild.settings', 'admin')).rejects.toThrow(
    'Insufficient permissions'
  );
});
```

---

## Commit Message Format

Follow Conventional Commits for all commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat:` - New feature
- `fix:` - Bug fix
- `test:` - Test improvements
- `refactor:` - Code restructuring
- `docs:` - Documentation

**Examples:**

```
feat(utils): Add DashboardAuthService OAuth implementation

- Implemented OAuth code exchange
- Added token refresh mechanism
- Full test coverage with 15 test cases

Closes #28
```

```
test(utils): Add encryption service tests

- Write 12 RED phase test cases
- Tests cover happy paths and error scenarios
- Tests verify encryption/decryption operations

Related to #29
```

```
refactor(utils): Optimize database queries

- Added database indexes
- Improved query performance
- All tests still passing
- Coverage: 91%
```

---

## Testing & Validation Before Commit

### Pre-Commit Checklist

Before committing code, verify:

```bash
# 1. Run tests for changed files
npm test -- repos/necrobot-utils/tests/unit/test-*.test.js

# Expected: All tests PASS

# 2. Check test coverage
npm run test:coverage -- repos/necrobot-utils

# Expected: ≥90% coverage

# 3. Run linter
npm run lint -- repos/necrobot-utils/src

# Expected: No errors or warnings

# 4. Run full test suite
npm test

# Expected: All 131 tests PASS
```

### Post-PR Checklist

After creating PR:

- [ ] All tests passing in CI/CD
- [ ] Coverage ≥90% (service layer)
- [ ] ESLint passing (no warnings)
- [ ] Code reviewed
- [ ] Commit message follows format
- [ ] Related issue linked (#28, #29, #30)

---

## Docker Development Setup

### Run Stack Locally

```bash
cd /home/olav/repo/necromundabot

# Start all services
docker-compose up --build

# Services available at:
# - Dashboard: http://localhost:3000
# - Bot: Running in container
# - Redis: localhost:6379
# - Database: /dashboard-data/dashboard.db
```

### View Logs

```bash
# Dashboard logs
docker logs necromundabot-dashboard

# Redis logs
docker logs necromundabot-redis

# All logs
docker-compose logs -f
```

### Stop Services

```bash
docker-compose down

# With volume cleanup
docker-compose down -v
```

---

## Troubleshooting

### Tests Not Running

```bash
# Clear Jest cache
npm test -- --clearCache

# Run specific test file
npm test -- test-dashboard-auth-service.test.js --verbose
```

### Database Errors

```bash
# Check database file permissions
ls -la /dashboard-data/dashboard.db

# Reset database (loses all data)
rm /dashboard-data/dashboard.db
npm test  # Database recreates on next test
```

### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping
# Expected: PONG

# Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# Check Redis in Docker
docker exec necromundabot-redis redis-cli ping
```

### Encryption Key Errors

```bash
# Generate new key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env.local with new key
# Re-run tests (in-memory DB, no persistence issue)
npm test
```

---

## Next Steps

1. ✅ Read this guide completely
2. ✅ Review Epic #27 and related tasks #28-30
3. ⏳ Set up environment (dependencies, .env, Docker)
4. ⏳ Start Task #28 (DashboardAuthService)
   - RED phase: Write tests
   - GREEN phase: Implement
   - REFACTOR phase: Optimize
5. ⏳ Continue with #29, #30, etc.

---

## FAQ

**Q: Do I really have to write tests first?**  
A: Yes. TDD is non-negotiable. Tests define the contract; code satisfies the contract.

**Q: What if I need to change the test after starting implementation?**  
A: That's OK in RED phase. Once implementation starts (GREEN phase), don't change tests without good reason.

**Q: How detailed should my test descriptions be?**  
A: Very detailed. Example: `should return encrypted value when setting is marked encrypted` instead of `should encrypt data`.

**Q: Can I skip REFACTOR phase?**  
A: Only if code is already clean. Usually you want to refactor for maintainability.

**Q: What if tests take too long to run?**  
A: Use test filtering (`npm test -- test-file.test.js`). Run full suite before committing.

**Q: How do I mock Discord API?**  
A: Use `jest.mock()` to intercept fetch/axios calls. See Testing Patterns section.

---

**Last Updated:** February 2, 2026  
**Next Review:** When TDD workflow completes first task
