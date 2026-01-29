# Discord.js v15 Migration Implementation Plan

**Document Version:** 1.0  
**Date:** January 27, 2026  
**Status:** 📋 Planning Phase  
**Related Phase:** PHASE-3.1.1 - Vulnerability Analysis & discord.js v15 Compatibility

---

## Executive Summary

This document provides a **detailed, step-by-step implementation plan** for migrating NecromundaBot from discord.js v14.14.0 to v15.0.0. This plan is designed to be executed once discord.js v15 reaches stable release.

**Migration Approach:** Incremental, test-driven, with rollback capability at each step

**Total Estimated Effort:** 3-5 days (22-35 hours)

**Key Principles:**
1. ✅ Test after every change
2. ✅ Maintain rollback capability
3. ✅ Document all issues encountered
4. ✅ Validate functionality at each step

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Implementation Phases](#implementation-phases)
3. [Detailed Step-by-Step Guide](#detailed-step-by-step-guide)
4. [Testing Procedures](#testing-procedures)
5. [Troubleshooting Guide](#troubleshooting-guide)
6. [Success Criteria](#success-criteria)

---

## Prerequisites

### Before Starting Migration

**Checklist:**

- [ ] discord.js v15 is **stable** and officially released (not dev preview)
- [ ] Migration analysis complete (DISCORD-JS-V15-MIGRATION.md)
- [ ] Test failure report reviewed (DISCORD-JS-V15-TEST-REPORT.md)
- [ ] All current tests passing on v14 (baseline)
- [ ] Production backup created
- [ ] Test environment prepared
- [ ] Team notified of migration timeline

### Required Tools

- Node.js 20+ (NecromundaBot uses 22+) ✅
- npm 10+ ✅
- Git (for version control) ✅
- Discord test bot instance ✅
- Discord test server ✅

### Team Roles

| Role | Responsibility |
|------|---------------|
| **Developer** | Execute migration steps |
| **Tester** | Validate functionality |
| **DevOps** | Monitor deployment |
| **Product Owner** | Approve go-live |

---

## Implementation Phases

### Overview

```
Phase 1: Preparation (4 hours)
    ↓
Phase 2: ESM Conversion (8-12 hours)
    ↓
Phase 3: Builder Updates (4-6 hours)
    ↓
Phase 4: Event Handler Updates (2-4 hours)
    ↓
Phase 5: Testing & Fixes (4-8 hours)
    ↓
Phase 6: Production Deployment (2 hours)
```

### Phase Timeline

| Phase | Duration | Can Pause? | Rollback Point? |
|-------|----------|------------|-----------------|
| 1. Preparation | 4 hours | ✅ Yes | ✅ Yes |
| 2. ESM Conversion | 8-12 hours | ✅ Yes | ✅ Yes |
| 3. Builder Updates | 4-6 hours | ✅ Yes | ✅ Yes |
| 4. Event Updates | 2-4 hours | ✅ Yes | ✅ Yes |
| 5. Testing | 4-8 hours | ⚠️ Partial | ✅ Yes |
| 6. Deployment | 2 hours | ❌ No | ⚠️ Limited |

---

## Detailed Step-by-Step Guide

### Phase 1: Preparation (4 hours)

#### Step 1.1: Create Migration Branch

```bash
cd /home/runner/work/necromundabot/necromundabot

# Ensure main branch is up to date
git checkout main
git pull origin main

# Create migration branch
git checkout -b feature/discord-js-v15-migration

# Tag current version for rollback
git tag v0.2.6-pre-v15-migration
git push origin v0.2.6-pre-v15-migration
```

**Success Criteria:** Branch created, baseline tagged

---

#### Step 1.2: Backup Production Data

```bash
# Backup database (SQLite)
cp database.sqlite database.sqlite.backup-$(date +%Y%m%d)

# OR if PostgreSQL
pg_dump necromundabot > backup-$(date +%Y%m%d).sql

# Backup environment configuration
cp .env .env.backup

# Backup Docker volumes (if applicable)
docker run --rm -v necromundabot_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/data-backup-$(date +%Y%m%d).tar.gz /data
```

**Success Criteria:** Backups created and verified

---

#### Step 1.3: Run Baseline Tests

```bash
# Run full test suite on v14
npm test --workspaces 2>&1 | tee baseline-tests-v14.log

# Capture test count
TOTAL_TESTS=$(grep -E "Tests:.*total" baseline-tests-v14.log | tail -1)
echo "Baseline: $TOTAL_TESTS" > migration-progress.txt

# Verify 100% pass rate
grep -E "Tests:.*passed" baseline-tests-v14.log
```

**Expected Output:**
```
Tests: 245 passed, 245 total
Test Suites: 17 passed, 17 total
```

**Success Criteria:** All tests passing on v14

---

#### Step 1.4: Set Up Test Environment

```bash
# Create test bot configuration
cp .env.example .env.test

# Edit .env.test with test bot token
# DISCORD_TOKEN=your_test_bot_token
# CLIENT_ID=your_test_client_id
# GUILD_ID=your_test_guild_id

# Create test Discord server
# Manual: Go to Discord, create server "NecromundaBot v15 Testing"
# Invite test bot to server
```

**Success Criteria:** Test environment ready

---

### Phase 2: ESM Conversion (8-12 hours)

#### Step 2.1: Update Root package.json

```bash
cd /home/runner/work/necromundabot/necromundabot
```

**Edit `package.json`:**
```json
{
  "name": "necromundabot",
  "version": "0.2.6",
  "type": "module",  // ← ADD THIS
  "workspaces": [ /* ... */ ]
}
```

**Commit:**
```bash
git add package.json
git commit -m "feat: Add ESM module type to root package.json"
```

---

#### Step 2.2: Update necrobot-core package.json

```bash
cd repos/necrobot-core
```

**Edit `package.json`:**
```json
{
  "name": "necrobot-core",
  "version": "0.3.0",
  "type": "module",  // ← ADD THIS
  "dependencies": {
    "discord.js": "^15.0.0",  // ← UPDATE VERSION
    "dotenv": "^17.2.3"
  }
}
```

**Commit:**
```bash
git add package.json
git commit -m "feat(core): Update to ESM and discord.js v15"
```

---

#### Step 2.3: Convert necrobot-core Main Entry Point

**File:** `repos/necrobot-core/src/index.js`

**Before (CommonJS):**
```javascript
const { Client, GatewayIntentBits, Events } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

module.exports = client;
```

**After (ESM):**
```javascript
import { Client, GatewayIntentBits, Events } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

export default client;
```

**Commit:**
```bash
git add src/index.js
git commit -m "feat(core): Convert index.js to ESM"
```

---

#### Step 2.4: Convert Event Handlers

**File:** `repos/necrobot-core/src/events/ready.js`

**Before:**
```javascript
const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
  }
};
```

**After:**
```javascript
import { Events } from 'discord.js';

export default {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
  }
};
```

**Repeat for all event files:**
- `src/events/interactionCreate.js`
- `src/events/messageCreate.js`

**Commit:**
```bash
git add src/events/
git commit -m "feat(core): Convert event handlers to ESM"
```

---

#### Step 2.5: Convert Middleware

**Files:**
- `repos/necrobot-core/src/middleware/errorHandler.js`
- `repos/necrobot-core/src/middleware/logger.js`

**Pattern:**
```javascript
// Before
const someModule = require('./module');
module.exports = { function1, function2 };

// After
import someModule from './module.js';  // ← Note .js extension
export { function1, function2 };
```

**Key Points:**
- Add `.js` extensions to relative imports
- Use `export` instead of `module.exports`
- Use `import` instead of `require()`

**Commit:**
```bash
git add src/middleware/
git commit -m "feat(core): Convert middleware to ESM"
```

---

#### Step 2.6: Update Jest Configuration

**File:** `repos/necrobot-core/jest.config.js`

**Before:**
```javascript
module.exports = {
  testEnvironment: 'node',
  // ...
};
```

**After:**
```javascript
export default {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.js'],
  transform: {},
  // ...
};
```

**Commit:**
```bash
git add jest.config.js
git commit -m "test(core): Update Jest for ESM support"
```

---

#### Step 2.7: Test necrobot-core ESM Conversion

```bash
cd repos/necrobot-core

# Syntax check
node --check src/index.js

# Run tests
npm test 2>&1 | tee test-results-esm.log

# Check for failures
grep -E "FAIL|ERROR" test-results-esm.log
```

**If tests fail:**
- Review error messages
- Fix import/export issues
- Add `.js` extensions if needed
- Retest until passing

**Success Criteria:** All necrobot-core tests passing with ESM

---

### Phase 3: Builder Updates (4-6 hours)

#### Step 3.1: Install @discordjs/builders

```bash
cd repos/necrobot-commands

# Install builder package
npm install @discordjs/builders

# Update package.json
```

**Edit `package.json`:**
```json
{
  "name": "necrobot-commands",
  "version": "0.1.0",
  "type": "module",  // ← ADD THIS
  "dependencies": {
    "necrobot-core": "*",
    "necrobot-utils": "*",
    "@discordjs/builders": "^1.x.x"  // ← ADD THIS
  }
}
```

**Commit:**
```bash
git add package.json package-lock.json
git commit -m "feat(commands): Add @discordjs/builders dependency"
```

---

#### Step 3.2: Update Command Files

**Example:** `repos/necrobot-commands/src/commands/misc/ping.js`

**Before:**
```javascript
const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');

async function executeInteraction(interaction) {
  await interaction.reply('Pong!');
}

module.exports = {
  name: 'ping',
  description: 'Replies with Pong!',
  data,
  executeInteraction
};
```

**After:**
```javascript
import { SlashCommandBuilder } from '@discordjs/builders';

const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');

async function executeInteraction(interaction) {
  await interaction.reply('Pong!');
}

export default {
  name: 'ping',
  description: 'Replies with Pong!',
  data,
  executeInteraction
};
```

**Automation Script:**

Create `scripts/convert-commands.sh`:
```bash
#!/bin/bash
# Convert all command files to ESM

find repos/necrobot-commands/src/commands -name "*.js" -type f | while read file; do
  echo "Converting $file..."
  
  # Replace require with import
  sed -i "s/const { SlashCommandBuilder } = require('discord.js');/import { SlashCommandBuilder } from '@discordjs\/builders';/g" "$file"
  
  # Replace module.exports with export
  sed -i "s/module.exports = {/export default {/g" "$file"
  
  echo "✓ Converted $file"
done
```

**Run automation:**
```bash
chmod +x scripts/convert-commands.sh
./scripts/convert-commands.sh
```

**Manual verification:** Check a few files to ensure correct conversion

**Commit:**
```bash
git add repos/necrobot-commands/src/commands/
git commit -m "feat(commands): Convert all commands to ESM with @discordjs/builders"
```

---

#### Step 3.3: Update Command Registration

**File:** `repos/necrobot-commands/src/register-commands.js`

**Before:**
```javascript
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Command loading logic...

module.exports = registerCommands;
```

**After:**
```javascript
import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Command loading logic...

export default registerCommands;
```

**Note:** ESM doesn't have `__dirname`, must use `import.meta.url`

**Commit:**
```bash
git add src/register-commands.js
git commit -m "feat(commands): Convert command registration to ESM"
```

---

#### Step 3.4: Test Command Loading

```bash
cd repos/necrobot-commands

# Test command registration
node src/register-commands.js

# Expected output:
# ✅ Loaded: ping (ping.js)
# ✅ Loaded: help (help.js)
# ✅ Loaded: add-quote (add-quote.js)
# [...]
# ✅ Successfully registered 15 commands

# Run tests
npm test 2>&1 | tee test-results-builders.log

# Check for failures
grep -E "FAIL|ERROR" test-results-builders.log
```

**Success Criteria:** All commands load and tests pass

---

### Phase 4: Event Handler Updates (2-4 hours)

#### Step 4.1: Verify Event Names

Check if v15 changed event enum values:

```javascript
// Test file: repos/necrobot-core/test-events.js
import { Events } from 'discord.js';

console.log('Events.ClientReady:', Events.ClientReady);
console.log('Events.InteractionCreate:', Events.InteractionCreate);
console.log('Events.MessageCreate:', Events.MessageCreate);
```

Run:
```bash
node test-events.js
```

**Expected output:**
```
Events.ClientReady: ready
Events.InteractionCreate: interactionCreate
Events.MessageCreate: messageCreate
```

**If output differs:** Update event handler files accordingly

---

#### Step 4.2: Update Event Handler Signatures

**Check v15 documentation** for parameter changes

**Example potential change:**

```javascript
// v14
client.on(Events.InteractionCreate, async (interaction) => {
  // Handle interaction
});

// v15 (hypothetical)
client.on(Events.InteractionCreate, async (shard, interaction) => {
  // Handle interaction (shard parameter added)
});
```

**Update files:**
- `repos/necrobot-core/src/events/interactionCreate.js`
- `repos/necrobot-core/src/events/messageCreate.js`

**Commit:**
```bash
git add src/events/
git commit -m "feat(core): Update event handlers for v15 signatures"
```

---

#### Step 4.3: Test Event Handlers

```bash
cd repos/necrobot-core

# Run event handler tests
npm test -- test-event-handlers.test.js

# Start bot in test mode
npm start

# In Discord test server, trigger events:
# 1. Bot should show "Ready!" in console
# 2. Send /ping command → should respond
# 3. Send regular message → should process (if applicable)
```

**Success Criteria:** All events fire correctly

---

### Phase 5: Testing & Fixes (4-8 hours)

#### Step 5.1: Run Full Test Suite

```bash
cd /home/runner/work/necromundabot/necromundabot

# Run all tests
npm test --workspaces 2>&1 | tee test-results-v15-full.log

# Compare with baseline
grep -E "Tests:.*total" test-results-v15-full.log
grep -E "Tests:.*total" baseline-tests-v14.log

# Analyze failures
grep -E "FAIL" test-results-v15-full.log > failures.txt
wc -l failures.txt
```

**Target:** 90%+ test pass rate

---

#### Step 5.2: Fix Remaining Failures

**For each failure:**

1. **Identify root cause:**
   ```bash
   grep -A 10 "FAIL.*test-name" test-results-v15-full.log
   ```

2. **Fix the issue:**
   - Update mocks for v15 APIs
   - Update assertions
   - Fix import/export issues

3. **Retest:**
   ```bash
   npm test -- path/to/test-file.test.js
   ```

4. **Commit fix:**
   ```bash
   git add .
   git commit -m "fix(module): Description of fix"
   ```

5. **Repeat until 100% pass rate**

---

#### Step 5.3: Integration Testing

**Start bot:**
```bash
cd repos/necrobot-core
npm start
```

**Test all commands:**

| Command | Test | Expected Result |
|---------|------|-----------------|
| `/ping` | Execute command | "Pong!" response |
| `/help` | Execute command | Help embed displayed |
| `/quote add "Test quote" --author "Test"` | Add quote | Success message |
| `/quote search test` | Search quotes | Results displayed |
| `/quote delete 1` | Delete quote | Confirmation |
| Invalid command | Try `/invalid` | Error handled gracefully |
| No permissions | Restricted command | Permission error |

**Document results:**
```bash
echo "Integration Test Results" > integration-results.txt
echo "========================" >> integration-results.txt
echo "/ping: ✅ PASS" >> integration-results.txt
# etc.
```

---

#### Step 5.4: Performance Testing

```bash
# Monitor memory usage
ps aux | grep "node src/index.js"

# Check response times
# Use Discord: /ping (note response time)

# Run load test (optional)
# Send multiple commands concurrently
# Monitor bot stability
```

**Optimization (if needed):**

Configure v15 caching:
```javascript
import { Client, Options } from 'discord.js';

const client = new Client({
  intents: [/* ... */],
  makeCache: Options.cacheWithLimits({
    GuildManager: 100,
    UserManager: 50,
    MessageManager: 0,
  })
});
```

---

### Phase 6: Production Deployment (2 hours)

#### Step 6.1: Final Validation

**Checklist:**

- [ ] All unit tests passing (100%)
- [ ] All integration tests passing
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Migration changelog created
- [ ] Rollback plan verified

---

#### Step 6.2: Create Release Tag

```bash
cd /home/runner/work/necromundabot/necromundabot

# Merge to main
git checkout main
git merge feature/discord-js-v15-migration

# Create release tag
git tag v0.3.0-discord-js-v15
git push origin main --tags

# Update CHANGELOG.md
```

---

#### Step 6.3: Deploy to Production

```bash
# Stop current bot
docker-compose down

# OR
sudo systemctl stop necromundabot

# Pull latest code
git pull origin main

# Install dependencies
npm ci --workspaces

# Start bot
docker-compose up -d

# OR
sudo systemctl start necromundabot
```

---

#### Step 6.4: Monitor Deployment

```bash
# Check logs
docker logs -f necromundabot

# OR
journalctl -u necromundabot -f

# Verify bot status
# Discord: Check bot online status
# Discord: Test /ping command
```

**Monitor for:**
- Connection errors
- Command failures
- Error rate increase
- Memory issues
- Performance degradation

---

#### Step 6.5: Post-Deployment Validation

**Test in production:**

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Bot online | ✅ Online | | |
| `/ping` | Responds | | |
| `/help` | Displays help | | |
| Quote commands | Work correctly | | |
| Error handling | Graceful errors | | |
| Performance | Response < 200ms | | |

**If issues detected:**
- Review logs
- Check for errors
- Consider rollback if critical

---

## Testing Procedures

### Unit Testing

```bash
# Test specific module
npm test --workspace=repos/necrobot-core

# Test specific file
npm test -- path/to/test-file.test.js

# Test with coverage
npm test -- --coverage

# Watch mode (for development)
npm test -- --watch
```

### Integration Testing

```bash
# Start test bot
npm start

# Manual testing checklist
# 1. Bot connects
# 2. Commands load
# 3. Commands execute
# 4. Errors handled
# 5. Database operations work
```

### Regression Testing

```bash
# Compare test results
diff baseline-tests-v14.log test-results-v15-full.log

# Verify no new failures
# Verify test count unchanged
# Verify coverage maintained
```

---

## Troubleshooting Guide

### Common Issues

#### Issue 1: ERR_REQUIRE_ESM

**Error:**
```
Error [ERR_REQUIRE_ESM]: require() of ES Module not supported
```

**Solution:**
- Convert file to ESM (use `import`/`export`)
- Add `"type": "module"` to package.json
- Update Jest configuration for ESM

---

#### Issue 2: SlashCommandBuilder Not Found

**Error:**
```
TypeError: SlashCommandBuilder is not a constructor
```

**Solution:**
```javascript
// Wrong
import { SlashCommandBuilder } from 'discord.js';

// Correct
import { SlashCommandBuilder } from '@discordjs/builders';
```

---

#### Issue 3: __dirname Not Defined

**Error:**
```
ReferenceError: __dirname is not defined in ES module scope
```

**Solution:**
```javascript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

---

#### Issue 4: Event Handler Not Firing

**Symptom:** Commands don't respond

**Solution:**
- Check event name spelling
- Verify handler signature
- Check client intents configured
- Review v15 documentation for changes

---

#### Issue 5: Tests Failing After Conversion

**Symptom:** Tests worked on v14, failing on v15

**Solution:**
- Update test mocks for v15 APIs
- Update Jest configuration for ESM
- Check for v15 API signature changes
- Review test assertions

---

## Success Criteria

### Phase Completion Criteria

#### Phase 1: Preparation ✅
- [ ] Migration branch created
- [ ] Baseline tests pass (100%)
- [ ] Backup completed
- [ ] Test environment ready

#### Phase 2: ESM Conversion ✅
- [ ] All files converted to ESM
- [ ] No import/export errors
- [ ] Jest configured for ESM
- [ ] Tests passing

#### Phase 3: Builder Updates ✅
- [ ] @discordjs/builders installed
- [ ] All commands updated
- [ ] Command registration working
- [ ] Tests passing

#### Phase 4: Event Updates ✅
- [ ] Event names verified
- [ ] Handler signatures updated
- [ ] Events firing correctly
- [ ] Tests passing

#### Phase 5: Testing ✅
- [ ] 100% test pass rate
- [ ] Integration tests pass
- [ ] Performance acceptable
- [ ] No regressions

#### Phase 6: Deployment ✅
- [ ] Merged to main
- [ ] Deployed to production
- [ ] Bot online
- [ ] Commands working
- [ ] Monitoring active

---

## Final Checklist

**Before declaring migration complete:**

- [ ] All tests passing (100%)
- [ ] All commands working in production
- [ ] No error rate increase
- [ ] Performance within acceptable range
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Team notified of completion
- [ ] Rollback plan documented
- [ ] Lessons learned captured

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-27 | GitHub Copilot | Initial implementation plan |

---

**End of Document**
