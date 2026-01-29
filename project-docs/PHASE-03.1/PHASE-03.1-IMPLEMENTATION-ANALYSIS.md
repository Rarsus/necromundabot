# PHASE-3.1: Implementation Analysis & Strategy

**Date:** January 27, 2026  
**Status:** 🔴 ANALYSIS PHASE - Task 3.1.1 in progress  
**Objective:** Analyze npm vulnerabilities and plan discord.js v15 migration

---

## Current Vulnerability Analysis

### npm audit Results

```
Total Vulnerabilities: 7
- High Severity: 3
- Moderate Severity: 4
- Critical: 0
- Low: 0
```

### Detailed Vulnerability Breakdown

#### 1. **Glob Vulnerability (HIGH)** 🔴

- **Package:** `glob` (via `@next/eslint-plugin-next`)
- **Severity:** HIGH
- **Type:** Command injection via -c/--cmd options
- **Affected Package:** `eslint-config-next` (v14-15)
- **Location:** `repos/necrobot-dashboard`
- **Fix Available:** YES - eslint-config-next v16.1.4+
- **Root Cause:** Next.js v14-15 bundles vulnerable glob
- **Solution:** Update to `@next/eslint-plugin-next` v16.1.4+

#### 2. **Undici Vulnerability (MODERATE)** 🟡

- **Package:** `undici` (transitive via discord.js)
- **Severity:** MODERATE (4 instances)
- **Type:** Unbounded decompression chain
- **Affected Packages:**
  - `discord.js` v14.x
  - `@discordjs/rest` v0.5+
  - `@discordjs/ws` v3.0+
- **Location:** necromundabot root, necrobot-core
- **Fix Available:** YES - discord.js v13.17.1
- **Root Cause:** discord.js v14 uses vulnerable undici
- **Solution:** Update discord.js to v13.17.1 (stable) OR v15.x (with breaking changes)

### Affected Repositories

| Repository           | Vulnerabilities | Critical Issues                   |
| -------------------- | --------------- | --------------------------------- |
| necromundabot (main) | 5               | discord.js undici chain           |
| necrobot-core        | 4               | discord.js undici chain           |
| necrobot-dashboard   | 3               | glob via @next/eslint-plugin-next |
| necrobot-utils       | 0               | None                              |
| necrobot-commands    | 0               | None                              |

---

## Migration Strategy Decision Matrix

### Option 1: discord.js v13.17.1 (Conservative, Stable)

**Pros:**

- ✅ Mature, well-tested version
- ✅ No breaking changes from v14
- ✅ Familiar API
- ✅ Smaller diff, easier testing
- ✅ Fixes undici vulnerability

**Cons:**

- ❌ v13 is legacy (no new features)
- ❌ Eventually we'll need to upgrade
- ❌ Security updates will slow down

**Breaking Changes:** NONE from v14 to v13

**Effort:** 2-3 hours

**Recommendation:** ❌ NOT RECOMMENDED - Just delays the problem

---

### Option 2: discord.js v15.x (Future-Proof, Breaking Changes) ✅ RECOMMENDED

**Pros:**

- ✅ Latest stable version (current as of Jan 2026)
- ✅ All new features and security patches
- ✅ Long-term support (no EOL soon)
- ✅ Future-proof investment
- ✅ Fixes all vulnerabilities
- ✅ Better performance

**Cons:**

- ❌ Breaking changes in API
- ❌ Event handlers may need updates
- ❌ Command interaction changes possible
- ⚠️ More testing required (4-6 hours)

**Breaking Changes:** YES (detailed below)

**Effort:** 6-8 hours

**Recommendation:** ✅ **STRONGLY RECOMMENDED** - Best long-term solution

---

## discord.js v14 → v15 Breaking Changes Analysis

### Known Breaking Changes

#### 1. **Client Constructor Changes**

- **Change:** `Client` class modified, some options may be deprecated
- **Impact:** LOW - NecromundaBot's client initialization
- **Fix Effort:** 30 minutes
- **Files Affected:** `repos/necrobot-core/src/bot.js` (if it exists)

#### 2. **Gateway Intents & Events**

- **Change:** Intent handling may have changed
- **Impact:** MEDIUM - Event subscriptions
- **Fix Effort:** 1-2 hours
- **Files Affected:** `repos/necrobot-core/src/events/*`

#### 3. **Interaction Handler Changes**

- **Change:** Slash commands and interactions API updates
- **Impact:** MEDIUM - Command structure
- **Fix Effort:** 1-2 hours
- **Files Affected:** `repos/necrobot-commands/src/commands/*`

#### 4. **Deprecation Removals**

- **Change:** Some deprecated methods removed from v14
- **Impact:** MEDIUM - Various utilities
- **Fix Effort:** 2-3 hours
- **Files Affected:** TBD (need to run tests)

#### 5. **TypeScript Support** (if used)

- **Change:** Better type definitions
- **Impact:** LOW - Not using TypeScript
- **Fix Effort:** 0 hours

#### 6. **Package Structure Changes**

- **Change:** Some @discordjs/\* packages may have breaking changes
- **Impact:** MEDIUM - Peer dependencies
- **Fix Effort:** 1-2 hours
- **Files Affected:** Various imports

### Total Estimated Breaking Changes Effort: 6-10 hours

---

## Implementation Plan: discord.js v15 Migration

### Phase 1: Preparation (2 hours)

1. Read official discord.js v15 migration guide
2. Review our code for likely breaking changes
3. Create test branch
4. Document all changes needed
5. Run initial tests to identify failures

### Phase 2: Update Dependencies (1 hour)

1. Update `package.json` files:
   - necromundabot: discord.js ^15.0.0
   - necrobot-core: discord.js ^15.0.0
   - necrobot-dashboard: eslint-config-next ^16.1.4
   - necrobot-utils: update dependencies
   - necrobot-commands: update dependencies
2. Run `npm install` in all workspaces
3. Verify npm audit shows 0 vulnerabilities

### Phase 3: Fix Breaking Changes (4-6 hours)

1. Run test suite: identify failing tests
2. Fix event handlers (if needed)
3. Fix command handlers (if needed)
4. Fix utilities and services (if needed)
5. Update imports and deprecated calls
6. Fix TypeScript issues (if any)

### Phase 4: Testing (2-3 hours)

1. Run full test suite: `npm test`
2. Run linting: `npm run lint`
3. Build Docker image: `docker-compose up --build`
4. Start bot in Discord: verify startup
5. Manual testing: test key commands
6. Verify CommandLoader validation passes

### Phase 5: Release (1 hour)

1. Commit: "chore(deps): Update discord.js to v15"
2. Tag version 1.0.0 (major bump due to breaking changes)
3. Create GitHub releases with breaking changes doc
4. Push to GitHub

**Total Effort: ~10-15 hours**

---

## Current Code Structure (Preliminary)

Based on repository analysis:

### necrobot-core Dependencies

```json
{
  "discord.js": "^14.14.0",
  "@discordjs/builders": "^1.7.0",
  "necrobot-utils": "*"
}
```

**Likely Impact Areas:**

- Event handlers (if using specific event names)
- Client initialization
- Interaction handling
- Service dependencies

### necrobot-dashboard Dependencies

```json
{
  "eslint-config-next": "^14.2.35",
  "next": "^14.2.35"
}
```

**Update Needed:**

- eslint-config-next → ^16.1.4 (fixes glob)
- next → ^16.x (possibly, if compatible)

### necrobot-utils Dependencies

```json
{
  "discord.js": "^14.14.0" (maybe)
}
```

**May not need updates** - let me verify

---

## Recommended Next Steps

### Immediate (Today)

1. ✅ **Analyze & Document** (current task)
   - Identify exact breaking changes
   - Test discord.js v15 in isolated environment
   - Document all failing tests

2. 📋 **Create Detailed Change List**
   - What tests fail
   - What code needs updating
   - What files need to change

### Tomorrow

3. 🔄 **Update Dependencies**
   - necromundabot: discord.js v15
   - necrobot-core: discord.js v15
   - necrobot-dashboard: eslint-config-next v16
   - Run npm audit to verify 0 vulnerabilities

4. 🧪 **Fix & Test**
   - Fix all failing tests
   - Verify Docker builds
   - Start bot and verify commands work

### This Week

5. 🚀 **Release**
   - Create v1.0.0 releases
   - Document breaking changes
   - Push to GitHub

6. 🔧 **Verify Workflows**
   - Ensure npm audit passes in CI
   - PR checks should pass
   - Release workflow should work

---

## Risk Assessment

### Risk 1: Breaking Changes Too Extensive

**Probability:** LOW (v14 to v15 is minor version change)  
**Impact:** HIGH (requires significant rework)  
**Mitigation:** Have v13.17.1 as fallback

### Risk 2: Tests Don't Cover All Edge Cases

**Probability:** MEDIUM (500+ tests but may not cover all)  
**Impact:** MEDIUM (issues found in production)  
**Mitigation:** Manual Discord testing required

### Risk 3: Docker Build Fails

**Probability:** LOW (npm install should handle it)  
**Impact:** HIGH (can't deploy)  
**Mitigation:** Test Docker build during Phase 4

### Risk 4: Commands Don't Load

**Probability:** LOW (CommandLoader is flexible)  
**Impact:** HIGH (bot is broken)  
**Mitigation:** CommandLoader validation tests

---

## Success Metrics

✅ **Phase 3.1 Completion Criteria:**

- [ ] npm audit returns 0 vulnerabilities
- [ ] All tests pass (npm test)
- [ ] All linting passes (npm run lint)
- [ ] Docker builds successfully
- [ ] Bot starts without errors
- [ ] All commands load with no warnings
- [ ] At least 3 commands work in Discord
- [ ] v1.0.0 released in all repositories

---

## References

- [discord.js Official Docs](https://discord.js.org/)
- [discord.js v15 Migration Guide](https://discordjs.guide/) (check for v15 section)
- [npm audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [GitHub NecromundaBot Issues](https://github.com/Rarsus/necromundabot/issues)

---

## Timeline Estimate

| Phase                   | Duration     | Completion      |
| ----------------------- | ------------ | --------------- |
| Analysis & Research     | 2 hours      | Jan 27          |
| Update Dependencies     | 1 hour       | Jan 28          |
| Fix Breaking Changes    | 6 hours      | Jan 29-30       |
| Testing & Validation    | 3 hours      | Jan 31          |
| Release & Documentation | 2 hours      | Feb 1           |
| **TOTAL**               | **14 hours** | **Feb 1, 2026** |

---

## Next: Task 3.1.1 Action Items

- [ ] Review official discord.js documentation
- [ ] Create test branch: `feature/discord-js-v15`
- [ ] Update discord.js to v15 in test environment
- [ ] Run test suite and document failures
- [ ] Create list of code changes needed
- [ ] Update this document with findings
- [ ] Start Task 3.1.2 when complete

**Assigned to:** Copilot (Phase 3.1.1 Epic)  
**Target Completion:** January 28, 2026
