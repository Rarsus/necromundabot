# Discord.js v15 Migration Guide

**Document Version:** 1.0  
**Date:** January 27, 2026  
**Status:** 🟡 Analysis Phase - v15 in Developer Preview  
**Related Phase:** PHASE-3.1.1 - Vulnerability Analysis & discord.js v15 Compatibility

---

## Executive Summary

This document analyzes the breaking changes between discord.js v14 and v15, and provides a migration strategy for NecromundaBot. As of January 2026, discord.js v15 is **still in developer preview** (94% complete) and not yet production-ready, but this analysis prepares us for the eventual migration.

**Current Status:**
- **Current Version:** discord.js v14.14.0
- **Target Version:** discord.js v15.0.0 (when stable)
- **Migration Motivation:** Fix `undici` security vulnerability (transitive dependency)
- **Risk Level:** HIGH - Multiple breaking changes affecting core functionality

---

## Table of Contents

1. [v15 Release Status](#v15-release-status)
2. [Breaking Changes Overview](#breaking-changes-overview)
3. [Impact on NecromundaBot](#impact-on-necromundabot)
4. [Detailed Breaking Changes](#detailed-breaking-changes)
5. [Migration Strategy](#migration-strategy)
6. [Testing Plan](#testing-plan)
7. [Rollback Strategy](#rollback-strategy)
8. [Timeline & Dependencies](#timeline--dependencies)
9. [References](#references)

---

## v15 Release Status

### Current State (January 2026)

| Aspect | Status |
|--------|--------|
| **Milestone Progress** | 94% complete |
| **Official Release** | Not yet announced |
| **Production Ready** | ❌ No - Developer preview only |
| **Install Command** | `npm install discord.js@dev` |
| **Documentation** | Incomplete - preview documentation available |
| **Recommendation** | ⚠️ Wait for stable release before production use |

**Key Insight:** While v15 is nearly complete, it's not yet stable. This analysis prepares us for migration when it becomes production-ready.

---

## Breaking Changes Overview

### Critical Changes (HIGH Impact)

| Change | Impact | NecromundaBot Affected Areas |
|--------|--------|------------------------------|
| **Node.js 20+ Required** | HIGH | Deployment, CI/CD, Docker |
| **ESM Module Support** | HIGH | All imports, module system |
| **Native fetch/Web APIs** | MEDIUM | REST client interactions |
| **Event Handler Changes** | HIGH | necrobot-core event handlers |
| **Builder/Formatter Removal** | HIGH | necrobot-commands command builders |

### Important Changes (MEDIUM Impact)

| Change | Impact | NecromundaBot Affected Areas |
|--------|--------|------------------------------|
| **Interaction API Refactor** | MEDIUM | Command execution, responses |
| **Collector Enhancements** | LOW | Message collectors (if used) |
| **Caching Architecture** | MEDIUM | Performance optimization opportunities |
| **TypeScript Improvements** | LOW | Type definitions (if TypeScript adopted) |

### Minor Changes (LOW Impact)

| Change | Impact | Notes |
|--------|--------|-------|
| **Gateway v11 Support** | LOW | Transparent upgrade |
| **Method Renames** | LOW | `fetchPinned()` → `fetchPins()` etc. |
| **REST-Only Mode** | LOW | Optional performance optimization |

---

## Impact on NecromundaBot

### Architecture Overview

NecromundaBot uses a **submodule-based architecture** with discord.js isolated to specific modules:

```
NecromundaBot/
├── repos/necrobot-core/       ⚠️ HIGH IMPACT - Client, events, interactions
├── repos/necrobot-commands/   ⚠️ HIGH IMPACT - SlashCommandBuilder
├── repos/necrobot-utils/      ✅ NO IMPACT - Pure business logic
└── repos/necrobot-dashboard/  ✅ NO IMPACT - React UI only
```

### Module-Specific Impact Analysis

#### **necrobot-core** (v0.3.0) - HIGH IMPACT

**Current Usage:**
```javascript
const { Client, Events, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on(Events.ClientReady, async () => {
  console.log('Bot ready!');
});

client.login(process.env.DISCORD_TOKEN);
```

**v15 Changes Required:**

1. **ESM Module Conversion:**
   ```javascript
   // v14 (CommonJS)
   const { Client } = require('discord.js');
   
   // v15 (ESM)
   import { Client } from 'discord.js';
   ```

2. **Event Handler Updates:**
   - Event names may change (currently using `Events.ClientReady` - verify v15 naming)
   - Handler signatures may change for certain events
   - `@discordjs/ws` events have new shard ID parameter pattern

3. **Client Initialization:**
   - Verify `GatewayIntentBits` enum values unchanged
   - Check for new required/optional client options
   - Validate caching configuration (new customizable cache layers)

**Files Affected:**
- `repos/necrobot-core/src/index.js` - Main bot entry point
- `repos/necrobot-core/src/events/*.js` - All event handlers
- `repos/necrobot-core/src/middleware/errorHandler.js` - Error handling middleware

#### **necrobot-commands** (v0.1.0) - HIGH IMPACT

**Current Usage:**
```javascript
const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');

async function executeInteraction(interaction) {
  await interaction.reply('Pong!');
}

module.exports = { data, executeInteraction };
```

**v15 Changes Required:**

1. **Builder Import Changes:**
   ```javascript
   // v14 - Re-exported from main package
   const { SlashCommandBuilder } = require('discord.js');
   
   // v15 - May require direct import from @discordjs/builders
   import { SlashCommandBuilder } from '@discordjs/builders';
   ```
   
   ⚠️ **CRITICAL:** v15 removes builders/formatters re-export from main package

2. **Interaction Method Refactor:**
   - `CommandInteractionOptionResolver` split/refactored
   - Verify `interaction.reply()`, `interaction.deferReply()` signatures unchanged
   - Check `interaction.options.get*()` methods for changes

3. **Command Registration:**
   - Verify REST client for command registration still compatible
   - Check `REST` and `Routes` imports and usage

**Files Affected:**
- `repos/necrobot-commands/src/commands/**/*.js` - All command files
- `repos/necrobot-commands/src/register-commands.js` - Command registration
- `repos/necrobot-commands/src/core/CommandBase.js` - Base command class

#### **necrobot-utils** (v0.2.2) - NO IMPACT

✅ **No discord.js imports** - Pure business logic and database services

**Files:** Safe, no changes required

#### **necrobot-dashboard** (v0.1.3) - NO IMPACT

✅ **React-based UI** - No discord.js dependency

**Files:** Safe, no changes required

---

## Detailed Breaking Changes

### 1. Node.js Version Requirement

**Change:** Node.js 20+ required (previously 16+)

**Impact:** HIGH

**NecromundaBot Current:**
```json
// package.json
"engines": {
  "node": ">=22.0.0",
  "npm": ">=10.0.0"
}
```

✅ **Already Compatible** - NecromundaBot requires Node.js 22.0.0+

**Actions Required:**
- Verify all deployment environments use Node.js 20+
- Update CI/CD workflows if needed
- Update Docker base image if needed

---

### 2. ESM Module Support

**Change:** Migration from CommonJS (require) to ESM (import/export)

**Impact:** HIGH

**Current Pattern (v14 - CommonJS):**
```javascript
const { Client, Events } = require('discord.js');
const DatabaseService = require('./services/DatabaseService');

module.exports = {
  name: 'command',
  execute: async (interaction) => { /* ... */ }
};
```

**v15 Pattern (ESM):**
```javascript
import { Client, Events } from 'discord.js';
import DatabaseService from './services/DatabaseService.js';

export default {
  name: 'command',
  execute: async (interaction) => { /* ... */ }
};
```

**Migration Steps:**

1. **Convert package.json to ESM:**
   ```json
   {
     "type": "module"
   }
   ```

2. **Update all imports/exports:**
   - Replace `require()` with `import`
   - Replace `module.exports` with `export` or `export default`
   - Add `.js` extensions to relative imports

3. **Update Jest configuration for ESM:**
   ```javascript
   // jest.config.js
   export default {
     testEnvironment: 'node',
     transform: {},
     extensionsToTreatAsEsm: ['.js'],
   };
   ```

4. **Update all file extensions if using TypeScript:**
   - `.js` → `.mjs` (if needed for clarity)
   - Or use `"type": "module"` in package.json

**Estimated Effort:** 8-12 hours (convert all files, test, fix issues)

---

### 3. Native Web API Support

**Change:** Full native support for `fetch`, `AbortController`, `ReadableStream`

**Impact:** MEDIUM

**Current Usage:** NecromundaBot likely uses internal discord.js REST client

**Benefits:**
- Better performance
- Modern API patterns
- Reduced polyfill overhead

**Actions Required:**
- Review REST client usage in command registration
- Test API interactions after upgrade
- Verify timeout/abort logic works as expected

---

### 4. Builder/Formatter Removal from Main Package

**Change:** `SlashCommandBuilder` and formatters no longer re-exported from main package

**Impact:** HIGH

**Current Import (v14):**
```javascript
const { SlashCommandBuilder } = require('discord.js');
```

**v15 Import:**
```javascript
import { SlashCommandBuilder } from '@discordjs/builders';
```

**Actions Required:**

1. **Update all command files:**
   ```javascript
   // OLD (v14)
   const { SlashCommandBuilder } = require('discord.js');
   
   // NEW (v15)
   import { SlashCommandBuilder } from '@discordjs/builders';
   ```

2. **Update package dependencies:**
   ```json
   {
     "dependencies": {
       "discord.js": "^15.0.0",
       "@discordjs/builders": "^1.x.x",
       "@discordjs/formatters": "^0.x.x"
     }
   }
   ```

3. **Verify formatter usage:**
   - `time()`, `codeBlock()`, `bold()`, etc.
   - Import from `@discordjs/formatters` instead

**Files Affected:** All command files in `repos/necrobot-commands/`

---

### 5. Event Handler Changes

**Change:** Event names and handler signatures may change

**Impact:** HIGH

**Current Event Handlers:**
```javascript
client.on(Events.ClientReady, async () => { /* ... */ });
client.on(Events.InteractionCreate, async (interaction) => { /* ... */ });
client.on(Events.MessageCreate, async (message) => { /* ... */ });
```

**Potential v15 Changes:**
- Event enum values may change
- Handler parameter order may change (especially for `@discordjs/ws` events)
- New events may be available

**Actions Required:**

1. **Audit all event listeners:**
   ```bash
   grep -r "client.on(" repos/necrobot-core/src/
   ```

2. **Verify event enum values:**
   - Check `Events.ClientReady` still valid
   - Check `Events.InteractionCreate` unchanged
   - Check `Events.MessageCreate` unchanged

3. **Test event handlers:**
   - Ready event (bot startup)
   - Interaction event (slash commands)
   - Message event (prefix commands)
   - Error event (error handling)

**Files Affected:**
- `repos/necrobot-core/src/events/ready.js`
- `repos/necrobot-core/src/events/interactionCreate.js`
- `repos/necrobot-core/src/events/messageCreate.js`

---

### 6. Interaction API Refactor

**Change:** `CommandInteractionOptionResolver` split/refactored

**Impact:** MEDIUM

**Current Usage:**
```javascript
async function executeInteraction(interaction) {
  const user = interaction.options.getUser('user');
  const text = interaction.options.getString('text');
  const number = interaction.options.getInteger('number');
  
  await interaction.reply({ content: 'Success!' });
}
```

**Potential v15 Changes:**
- Option resolver methods may change
- Option types may change
- Response methods may have new signatures

**Actions Required:**

1. **Test all option getter methods:**
   - `getUser()`
   - `getString()`
   - `getInteger()`
   - `getBoolean()`
   - `getChannel()`
   - `getRole()`
   - `getSubcommand()`

2. **Verify response methods:**
   - `interaction.reply()`
   - `interaction.deferReply()`
   - `interaction.editReply()`
   - `interaction.followUp()`
   - `interaction.deleteReply()`

3. **Test ephemeral messages:**
   ```javascript
   await interaction.reply({ content: 'Private!', ephemeral: true });
   ```

---

### 7. Method Renames

**Change:** Some methods renamed for consistency

**Impact:** LOW

**Known Renames:**
- `fetchPinned()` → `fetchPins()`
- Other renames TBD (check official changelog when released)

**Actions Required:**

1. **Audit method usage:**
   ```bash
   grep -r "fetchPinned\|fetchPinned" repos/
   ```

2. **Replace with new names:**
   ```javascript
   // OLD
   const pins = await channel.messages.fetchPinned();
   
   // NEW
   const pins = await channel.messages.fetchPins();
   ```

---

### 8. Caching Architecture Improvements

**Change:** New customizable cache layers with per-resource toggles

**Impact:** MEDIUM (opportunity for optimization)

**Benefits:**
- Reduce memory usage
- Customize caching per resource type
- Optional REST-only mode

**Current Client Setup:**
```javascript
const client = new Client({
  intents: [GatewayIntentBits.Guilds, /* ... */]
});
```

**v15 Enhanced Caching:**
```javascript
const client = new Client({
  intents: [GatewayIntentBits.Guilds, /* ... */],
  makeCache: Options.cacheWithLimits({
    GuildManager: 200,      // Cache up to 200 guilds
    UserManager: 100,       // Cache up to 100 users
    MessageManager: 0,      // Don't cache messages
  })
});
```

**Actions Required:**

1. **Evaluate caching needs:**
   - NecromundaBot likely needs guild cache
   - User cache may not be needed
   - Message cache likely not needed

2. **Configure optimal caching:**
   ```javascript
   import { Options } from 'discord.js';
   
   makeCache: Options.cacheWithLimits({
     GuildManager: 100,     // Small bot, limited guilds
     UserManager: 50,       // Limited user caching
     MessageManager: 0,     // No message caching
     ThreadManager: 0,      // No thread caching
   })
   ```

3. **Test performance:**
   - Memory usage before/after
   - Response times
   - Cache hit rates

**Estimated Benefit:** 20-50% memory reduction

---

### 9. TypeScript Improvements

**Change:** Improved type definitions and IntelliSense

**Impact:** LOW (NecromundaBot uses JavaScript)

**Benefits:**
- Better autocomplete
- Stricter type checking
- Improved developer experience

**Actions Required:**
- None (JavaScript project)
- Consider TypeScript adoption for future (optional)

---

## Migration Strategy

### Phase 1: Preparation (Pre-Migration)

**Duration:** 1-2 days

**Tasks:**

1. ✅ **Complete this analysis document**
   - Document all breaking changes
   - Identify affected code areas
   - Estimate migration effort

2. **Create test branch:**
   ```bash
   git checkout -b feature/discord-js-v15-migration
   ```

3. **Backup current state:**
   - Tag current version: `git tag v0.2.6-pre-v15-migration`
   - Document current functionality
   - Create rollback plan

4. **Set up test environment:**
   - Isolated Discord bot instance
   - Test server
   - Test data

### Phase 2: Install v15 (Test Environment)

**Duration:** 1 hour

**Tasks:**

1. **Update package.json:**
   ```json
   {
     "dependencies": {
       "discord.js": "^15.0.0-dev.latest",
       "@discordjs/builders": "^1.x.x",
       "@discordjs/formatters": "^0.x.x"
     }
   }
   ```

2. **Install dependencies:**
   ```bash
   cd repos/necrobot-core
   npm install discord.js@dev
   npm install
   ```

3. **Verify installation:**
   ```bash
   npm list discord.js
   node -e "console.log(require('discord.js').version)"
   ```

### Phase 3: Convert to ESM

**Duration:** 8-12 hours

**Priority:** HIGH

**Tasks:**

1. **Update package.json:**
   ```json
   {
     "type": "module"
   }
   ```

2. **Convert necrobot-core:**
   - `src/index.js` - Main entry point
   - `src/events/*.js` - Event handlers
   - `src/middleware/*.js` - Middleware
   - Update all `require()` → `import`
   - Update all `module.exports` → `export`

3. **Convert necrobot-commands:**
   - `src/commands/**/*.js` - All commands
   - `src/core/*.js` - Command base classes
   - Update builder imports
   - Update command exports

4. **Update Jest configuration:**
   ```javascript
   export default {
     testEnvironment: 'node',
     transform: {},
     extensionsToTreatAsEsm: ['.js'],
   };
   ```

5. **Test compilation:**
   ```bash
   node --check src/index.js
   ```

### Phase 4: Update Builders & Formatters

**Duration:** 4-6 hours

**Priority:** HIGH

**Tasks:**

1. **Update all command files:**
   ```javascript
   // Find all files
   grep -rl "SlashCommandBuilder" repos/necrobot-commands/
   
   // Replace imports
   sed -i "s/require('discord.js')/require('@discordjs\/builders')/g" *.js
   ```

2. **Add @discordjs/builders dependency:**
   ```bash
   cd repos/necrobot-commands
   npm install @discordjs/builders
   ```

3. **Test command registration:**
   ```bash
   node src/register-commands.js
   ```

4. **Verify commands load:**
   ```bash
   npm test
   ```

### Phase 5: Update Event Handlers

**Duration:** 2-4 hours

**Priority:** HIGH

**Tasks:**

1. **Audit event listeners:**
   ```bash
   grep -r "client.on\|Events\." repos/necrobot-core/src/
   ```

2. **Update event names:**
   - Verify `Events.ClientReady`
   - Verify `Events.InteractionCreate`
   - Verify `Events.MessageCreate`

3. **Update handler signatures:**
   - Check parameter order
   - Check parameter types
   - Add new parameters if needed

4. **Test event handling:**
   ```bash
   npm test -- test-event-handlers.test.js
   ```

### Phase 6: Run Full Test Suite

**Duration:** 2-4 hours

**Priority:** CRITICAL

**Tasks:**

1. **Run unit tests:**
   ```bash
   npm test --workspaces
   ```

2. **Document failures:**
   - Capture error messages
   - Identify root causes
   - Prioritize fixes

3. **Fix failing tests:**
   - Update mocks for v15 APIs
   - Update assertions
   - Update test patterns

4. **Achieve 100% pass rate:**
   - All tests passing
   - No warnings
   - Coverage maintained

### Phase 7: Integration Testing

**Duration:** 4-6 hours

**Priority:** CRITICAL

**Tasks:**

1. **Start test bot:**
   ```bash
   npm start
   ```

2. **Test core functionality:**
   - ✅ Bot connects to Discord
   - ✅ Bot responds to ready event
   - ✅ Commands load successfully
   - ✅ Slash commands register
   - ✅ Commands execute correctly

3. **Test all commands:**
   - `/ping` - Basic interaction
   - `/help` - Complex embed response
   - `/quote add` - Database operations
   - `/quote search` - Query operations
   - Error handling

4. **Test edge cases:**
   - Invalid inputs
   - Missing permissions
   - Rate limiting
   - Network errors

### Phase 8: Performance Optimization

**Duration:** 2-4 hours

**Priority:** MEDIUM

**Tasks:**

1. **Configure caching:**
   ```javascript
   makeCache: Options.cacheWithLimits({
     GuildManager: 100,
     UserManager: 50,
     MessageManager: 0,
   })
   ```

2. **Measure performance:**
   - Memory usage
   - Response times
   - API call rates

3. **Optimize if needed:**
   - Adjust cache limits
   - Consider REST-only mode
   - Profile bottlenecks

### Phase 9: Documentation & Rollout

**Duration:** 2-4 hours

**Priority:** HIGH

**Tasks:**

1. **Update documentation:**
   - Installation guide
   - Development guide
   - API references
   - Troubleshooting

2. **Create migration checklist:**
   - Pre-deployment checks
   - Deployment steps
   - Post-deployment validation

3. **Plan production rollout:**
   - Maintenance window
   - Backup plan
   - Monitoring plan

---

## Testing Plan

### Test Categories

#### 1. Unit Tests

**Scope:** Individual functions and methods

**Commands:**
```bash
# Run all unit tests
npm test --workspaces

# Run specific module tests
npm test --workspace=repos/necrobot-core
npm test --workspace=repos/necrobot-commands
```

**Coverage Target:** 90%+ maintained

**Key Areas:**
- Command execution logic
- Event handlers
- Database operations
- Error handling

#### 2. Integration Tests

**Scope:** Full workflow testing

**Test Cases:**

1. **Bot Startup:**
   - ✅ Client connects to Discord
   - ✅ Ready event fires
   - ✅ Commands load from file system
   - ✅ Commands register with Discord API

2. **Command Execution:**
   - ✅ Slash command received
   - ✅ Options parsed correctly
   - ✅ Business logic executes
   - ✅ Response sent successfully

3. **Error Handling:**
   - ✅ Invalid input rejected
   - ✅ Permission errors handled
   - ✅ Database errors caught
   - ✅ User receives error message

#### 3. Regression Tests

**Scope:** Verify existing functionality unchanged

**Test Cases:**
- All existing tests pass
- No new warnings
- Performance within acceptable range
- No breaking changes for users

#### 4. Manual Testing

**Scope:** Real-world usage scenarios

**Test Server Setup:**
```
Test Server: NecromundaBot Testing
Roles: Admin, Moderator, User
Channels: #bot-testing, #general
```

**Test Scenarios:**

1. **Basic Commands:**
   - `/ping` - Verify response
   - `/help` - Verify embed display
   - `/quote add` - Add test quote
   - `/quote search` - Search quotes
   - `/quote delete` - Delete quote

2. **Permission Testing:**
   - Admin-only commands
   - Moderator commands
   - Public commands
   - Permission denial handling

3. **Edge Cases:**
   - Very long inputs
   - Special characters
   - Unicode/emoji
   - Concurrent requests

4. **Error Scenarios:**
   - Invalid command syntax
   - Missing required arguments
   - Database unavailable
   - Network timeout

---

## Rollback Strategy

### Pre-Deployment Preparation

1. **Tag current version:**
   ```bash
   git tag v0.2.6-stable
   git push origin v0.2.6-stable
   ```

2. **Backup database:**
   ```bash
   # SQLite backup
   cp database.sqlite database.sqlite.backup
   
   # PostgreSQL backup (if applicable)
   pg_dump dbname > backup.sql
   ```

3. **Document current configuration:**
   - Discord token
   - Environment variables
   - Server configuration
   - Dependencies

### Rollback Triggers

Rollback if any of these occur:

- ❌ Test suite pass rate < 95%
- ❌ Critical functionality broken
- ❌ Performance degradation > 50%
- ❌ Data loss or corruption
- ❌ Security vulnerability introduced
- ❌ Production errors > 10% increase

### Rollback Procedure

**Step 1: Stop v15 deployment**
```bash
# Stop current bot
docker-compose down

# Or kill process
pkill -f "node src/index.js"
```

**Step 2: Checkout stable version**
```bash
git fetch --all
git checkout v0.2.6-stable
```

**Step 3: Reinstall v14 dependencies**
```bash
npm ci --workspaces
```

**Step 4: Restore database (if needed)**
```bash
cp database.sqlite.backup database.sqlite
```

**Step 5: Restart bot**
```bash
# Docker
docker-compose up -d

# Or direct
npm start
```

**Step 6: Verify rollback**
```bash
# Check bot status
docker logs necromundabot | tail -20

# Test basic command
# Use Discord: /ping
```

**Step 7: Document rollback reason**
- What triggered rollback
- Errors encountered
- Data lost (if any)
- Next steps

### Post-Rollback Analysis

1. **Identify root cause:**
   - Review error logs
   - Analyze test failures
   - Check breaking changes documentation

2. **Create fix plan:**
   - What went wrong
   - How to prevent it
   - Retry strategy

3. **Schedule retry:**
   - Fix issues
   - Retest thoroughly
   - Retry migration

---

## Timeline & Dependencies

### Migration Timeline (When v15 is Stable)

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Preparation | 1-2 days | None |
| Install v15 | 1 hour | Stable v15 release |
| ESM Conversion | 8-12 hours | Install complete |
| Builder Updates | 4-6 hours | ESM complete |
| Event Updates | 2-4 hours | Builder updates complete |
| Unit Testing | 2-4 hours | Code changes complete |
| Integration Testing | 4-6 hours | Unit tests passing |
| Optimization | 2-4 hours | Integration tests passing |
| Documentation | 2-4 hours | All testing complete |
| **TOTAL** | **3-5 days** | v15 stable release |

### Dependencies

#### External Dependencies

1. **discord.js v15 Stable Release**
   - Status: Not yet released (94% milestone)
   - Blocker: YES - Cannot proceed without stable release
   - Monitoring: GitHub milestone #141

2. **Node.js 20+ Availability**
   - Status: ✅ Available and in use (NecromundaBot uses 22+)
   - Blocker: NO

3. **@discordjs/builders v1.x Stable**
   - Status: Unknown - verify when v15 released
   - Blocker: YES - Required for command builders

#### Internal Dependencies

1. **PHASE-3.1.1 Complete** (This Phase)
   - Status: 🔄 In progress
   - Deliverables: Analysis complete, migration plan ready

2. **PHASE-3.1.2 - Test v15 in Isolation**
   - Status: ⏳ Waiting for this phase to complete
   - Depends on: This analysis document

3. **PHASE-3.1.3 - Implement Migration**
   - Status: ⏳ Waiting
   - Depends on: Testing phase complete

4. **PHASE-3.1.4 - Deploy to Production**
   - Status: ⏳ Waiting
   - Depends on: Migration implemented and tested

### Blocking Issues

| Issue | Status | Impact | Resolution |
|-------|--------|--------|------------|
| v15 not stable | 🔴 BLOCKING | Cannot deploy to production | Wait for stable release |
| Submodules unavailable | 🟡 WORKAROUND | Cannot test code directly | Work from documentation |
| Official migration guide missing | 🟡 MINOR | Incomplete information | Use community resources |

---

## References

### Official Resources

1. **discord.js GitHub:**
   - v15 Milestone: https://github.com/discordjs/discord.js/milestone/141
   - Repository: https://github.com/discordjs/discord.js
   - Releases: https://github.com/discordjs/discord.js/releases

2. **npm Package:**
   - Current stable (v14): https://www.npmjs.com/package/discord.js
   - Dev preview (v15): https://www.npmjs.com/package/discord.js/v/15.0.0-dev.latest

3. **Documentation:**
   - v14 docs: https://discord.js.org/docs/packages/discord.js/14.14.0
   - v15 docs: (not yet available - check when released)

### Community Resources

1. **Migration Guides:**
   - djs-guides repository: https://github.com/bre4d777/djs-guides
   - Developer preview summary: https://github.com/nuekkis/Discord.js-v15
   - DeepWiki migration guide: https://deepwiki.com/discordjs/discord.js/1.3-version-history-and-migration-guide

2. **Discussion Forums:**
   - GitHub Discussions: https://github.com/discordjs/discord.js/discussions
   - Discord.js server: https://discord.gg/djs

### NecromundaBot Internal Documentation

1. **Architecture:**
   - Submodule architecture: `docs/architecture/submodule-architecture.md`
   - System architecture: `docs/architecture/system-architecture.md`
   - Design patterns: `docs/architecture/design-patterns.md`

2. **Development:**
   - Release process: `docs/guides/RELEASE-PROCESS.md`
   - Docker setup: `docs/user-guides/docker-setup.md`

3. **Project Planning:**
   - Phase documentation: `project-docs/PHASE-03.1-*`

---

## Appendix A: Command Audit

### Commands Using SlashCommandBuilder

All commands in `repos/necrobot-commands/src/commands/` use `SlashCommandBuilder`:

```
repos/necrobot-commands/src/commands/
├── misc/
│   ├── help.js                 ⚠️ Update builder import
│   ├── ping.js                 ⚠️ Update builder import
│   └── info.js                 ⚠️ Update builder import
├── quote-management/
│   ├── add-quote.js           ⚠️ Update builder import
│   ├── delete-quote.js        ⚠️ Update builder import
│   ├── update-quote.js        ⚠️ Update builder import
│   ├── list-quotes.js         ⚠️ Update builder import
│   └── quote.js               ⚠️ Update builder import
├── quote-discovery/
│   ├── random-quote.js        ⚠️ Update builder import
│   ├── search-quotes.js       ⚠️ Update builder import
│   └── quote-stats.js         ⚠️ Update builder import
├── quote-social/
│   ├── rate-quote.js          ⚠️ Update builder import
│   └── tag-quote.js           ⚠️ Update builder import
└── quote-export/
    └── export-quotes.js       ⚠️ Update builder import
```

**Total Commands:** ~15-20 files need builder import updates

---

## Appendix B: Event Handler Audit

### Event Handlers in necrobot-core

```
repos/necrobot-core/src/events/
├── ready.js                    ⚠️ Verify Events.ClientReady
├── interactionCreate.js        ⚠️ Verify Events.InteractionCreate
└── messageCreate.js            ⚠️ Verify Events.MessageCreate
```

**Total Event Handlers:** 3 files need verification

---

## Appendix C: ESM Conversion Checklist

### Files Requiring ESM Conversion

#### necrobot-core

- [ ] `src/index.js`
- [ ] `src/events/ready.js`
- [ ] `src/events/interactionCreate.js`
- [ ] `src/events/messageCreate.js`
- [ ] `src/middleware/errorHandler.js`
- [ ] `src/middleware/logger.js`
- [ ] `src/core/CommandBase.js`
- [ ] `src/core/EventBase.js`

#### necrobot-commands

- [ ] `src/register-commands.js`
- [ ] `src/core/CommandBase.js`
- [ ] `src/core/CommandOptions.js`
- [ ] All command files (15-20 files)

#### Configuration Files

- [ ] `package.json` - Add `"type": "module"`
- [ ] `jest.config.js` - Update for ESM
- [ ] `.eslintrc.js` - Update for ESM

---

## Appendix D: Testing Checklist

### Pre-Deployment Testing

#### Unit Tests
- [ ] All unit tests pass (100%)
- [ ] Coverage maintained (>90%)
- [ ] No new warnings
- [ ] Test execution time acceptable

#### Integration Tests
- [ ] Bot connects to Discord
- [ ] Commands load successfully
- [ ] Commands register with Discord
- [ ] Database operations work
- [ ] Error handling works

#### Manual Testing
- [ ] `/ping` command works
- [ ] `/help` command works
- [ ] `/quote add` command works
- [ ] `/quote search` command works
- [ ] `/quote delete` command works
- [ ] Permission checks work
- [ ] Error messages display correctly
- [ ] Embeds render correctly

#### Performance Testing
- [ ] Memory usage acceptable
- [ ] Response time < 200ms average
- [ ] No memory leaks
- [ ] CPU usage reasonable

#### Security Testing
- [ ] Input validation works
- [ ] SQL injection prevented
- [ ] XSS prevention works
- [ ] Rate limiting works

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-27 | GitHub Copilot | Initial analysis document created |

---

## Next Steps

1. ✅ **Complete this analysis** (PHASE-3.1.1)
2. ⏳ **Wait for discord.js v15 stable release**
3. ⏳ **Execute PHASE-3.1.2** - Test v15 in isolated environment
4. ⏳ **Execute PHASE-3.1.3** - Implement migration
5. ⏳ **Execute PHASE-3.1.4** - Deploy to production

**Recommendation:** Continue monitoring discord.js v15 milestone and prepare for migration when stable release is announced.

---

**End of Document**
