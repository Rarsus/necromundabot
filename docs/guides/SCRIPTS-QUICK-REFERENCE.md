# Scripts Quick Reference Card

**Print-friendly one-page reference for all scripts in the repository**

---

## Working Scripts ✅ (Can Use Now)

```bash
npm run validate:node           # Check Node.js/npm versions
npm run validate:workspaces     # Validate monorepo structure
npm run validate:links          # Check documentation links
npm run workspaces:status       # Show workspace status
npm run version:sync            # Sync all package versions
npm run sync-package-versions   # Same as above
```

---

## Scripts Needing npm Mapping ❌ (Use Direct Execution)

### JavaScript Scripts

```bash
# Analyze commits for version bump
node scripts/analyze-version-impact.js
node scripts/analyze-version-impact.js v0.2.0    # From specific tag

# Verify published packages
node scripts/verify-package-versions.js
node scripts/verify-package-versions.js --strict  # Fail if mismatched

# Sync vulnerability baseline
node scripts/sync-vulnerability-baseline.js
```

### Bash Scripts

```bash
# Compare vulnerabilities vs baseline
./scripts/compare-audit-against-baseline.sh
./scripts/compare-audit-against-baseline.sh --fail-on-new  # For CI/CD
./scripts/compare-audit-against-baseline.sh --json         # JSON output

# Create releases
./scripts/create-release.sh 0.3.0
./scripts/create-release.sh                  # Auto-detect version
```

---

## Issues Summary

| Issue                    | Severity    | Impact                 | Fix Time |
| ------------------------ | ----------- | ---------------------- | -------- |
| 3 files incomplete       | 🔴 CRITICAL | Cannot execute         | 15 min   |
| Missing npm mappings     | 🔴 CRITICAL | Not discoverable       | 5 min    |
| Platform incompatibility | 🟡 HIGH     | Fails on macOS         | 10 min   |
| No jq dependency check   | 🟡 HIGH     | Audit fails silently   | 5 min    |
| Hardcoded main branch    | 🟡 HIGH     | Non-standard workflows | 10 min   |

---

## Scripts by Category

### Testing & Quality (All Working ✅)

```bash
npm run test
npm run test:watch
npm run test:coverage
npm run test:quick
npm run lint
npm run lint:fix
npm run format
```

### Validation (Partial ⚠️)

```bash
npm run validate:node           ✅ Works
npm run validate:workspaces     ✅ Works
npm run validate:links          ✅ Works
npm run validate:docs           ✅ Works
npm run audit:compare           ❌ Missing npm mapping
```

### Version Management (Partial ⚠️)

```bash
npm run version:sync            ✅ Works
npm run analyze:version         ❌ Missing npm mapping
npm run verify:packages         ❌ Missing npm mapping
```

### Workspace (All Working ✅)

```bash
npm run workspaces:list
npm run workspaces:status
npm run workspaces:validate
```

### Build & Release (Missing ❌)

```bash
npm run build                   ✅ Works
npm run coverage:report         ✅ Works
npm run release                 ❌ Missing npm mapping
```

---

## One-Minute Checklist

- [ ] Node.js >= 22: `node --version`
- [ ] npm >= 10: `npm --version`
- [ ] Bash available: `which bash`
- [ ] jq installed: `which jq` (or `brew install jq`)
- [ ] Working directory clean: `git status`
- [ ] Scripts executable: `ls -la scripts/*.sh`

---

## Common Tasks

### Before Committing

```bash
npm run lint:fix
npm run format
npm run test
npm run validate:workspaces
```

### Before Releasing

```bash
npm run test:coverage
npm run validate:docs:strict
node scripts/analyze-version-impact.js
# Then: ./scripts/create-release.sh 0.3.0
```

### Check System Health

```bash
npm run validate:node
npm run validate:workspaces
npm run workspaces:status
npm run audit:compare
```

### Check Published Versions

```bash
node scripts/verify-package-versions.js
node scripts/verify-package-versions.js --strict
```

---

## Recommended npm Script Additions

Add these to package.json:

```json
"analyze:version": "node scripts/analyze-version-impact.js",
"verify:packages": "node scripts/verify-package-versions.js",
"sync:vulnerabilities": "node scripts/sync-vulnerability-baseline.js",
"audit:compare": "bash scripts/compare-audit-against-baseline.sh",
"audit:compare:strict": "bash scripts/compare-audit-against-baseline.sh --fail-on-new",
"release": "bash scripts/create-release.sh"
```

---

## File Status

| File                              | Lines | Status            | Issues        |
| --------------------------------- | ----- | ----------------- | ------------- |
| analyze-version-impact.js         | 297   | ⚠️ Incomplete?    | Check git     |
| compare-audit-against-baseline.sh | 150   | ✅ Complete       | Needs npm map |
| create-release.sh                 | 150   | ⚠️ Platform issue | Fix sed -i    |
| sync-package-versions.js          | 60    | ✅ Complete       | Works great   |
| sync-vulnerability-baseline.js    | 244   | ⚠️ Incomplete?    | Check git     |
| validate-links.js                 | 80    | ✅ Complete       | Works great   |
| validate-node-version.js          | 98    | ✅ Complete       | Works great   |
| validate-workspaces.js            | 225   | ✅ Complete       | Works great   |
| verify-package-versions.js        | 156   | ⚠️ Incomplete?    | Check git     |
| workspaces-status.js              | 115   | ✅ Complete       | Works great   |

---

## Troubleshooting

### "Script not found"

```bash
npm run              # List all available scripts
grep "\"script\"" package.json  # Check package.json
```

### "Permission denied"

```bash
chmod +x scripts/*.sh
ls -la scripts/*.sh  # Verify: -rwxr-xr-x
```

### "Command not found: jq"

```bash
# Install:
apt-get install jq        # Linux
brew install jq           # macOS
# Or use Windows Subsystem for Linux
```

### "Bash: command not found"

```bash
# Use bash explicitly:
bash scripts/create-release.sh 0.3.0
# Or install bash (usually already installed)
```

### "sed: invalid command"

```bash
# This is a macOS issue with sed -i
# Workaround: Use perl instead in scripts
# Fix: Contact maintainer for sed -i correction
```

---

## Quick Decision Tree

```
Need to...

├─ Test code?
│  └─ npm run test:watch          (continuous)
│     └─ npm run test             (once)
│
├─ Fix code quality?
│  └─ npm run lint:fix
│     └─ npm run format
│
├─ Validate setup?
│  └─ npm run validate:workspaces
│     └─ npm run workspaces:status
│
├─ Check vulnerabilities?
│  └─ npm run audit:compare
│
├─ Manage versions?
│  └─ npm run version:sync        (sync to root)
│     └─ node scripts/analyze-version-impact.js  (analyze)
│
├─ Create release?
│  └─ node scripts/analyze-version-impact.js     (determine version)
│     └─ ./scripts/create-release.sh 0.3.0       (create release)
│     └─ npm run verify:packages                 (verify published)
│
└─ Verify everything works?
   └─ npm run validate:node
      └─ npm run validate:workspaces
      └─ npm run test
      └─ npm run lint
```

---

## Commands Cheat Sheet

```bash
# Daily Use
npm run test                       # Quick test
npm run lint:fix                   # Fix linting
npm run format                     # Format code

# Before Commit
npm run test
npm run lint
npm run validate:workspaces

# Status Checks
npm run workspaces:status
npm run audit:compare
npm run validate:node

# Version Management
npm run version:sync               # Sync versions
node scripts/analyze-version-impact.js  # Check commits

# Release Process
node scripts/analyze-version-impact.js  # Analyze
./scripts/create-release.sh 0.3.0  # Create release
npm run verify:packages            # Verify published

# Emergency
git status                         # Check state
git diff                          # See changes
git log -1                        # Last commit
git tag | tail -5                 # Recent versions
```

---

## Critical Next Steps

1. **TODAY:** Make bash executable

   ```bash
   chmod +x scripts/*.sh
   ```

2. **THIS WEEK:** Add npm scripts to package.json

   ```bash
   # See "Recommended npm Script Additions" above
   ```

3. **THIS MONTH:** Fix platform compatibility
   - Update create-release.sh sed command
   - Add jq dependency check
   - Complete incomplete files

---

## Full Documentation

For detailed information, see:

- **SCRIPTS-ANALYSIS-REPORT.md** - Complete technical analysis
- **SCRIPTS-EXECUTION-VALIDATION-GUIDE.md** - How to run & test
- **NPM-SCRIPTS-MAPPING.md** - npm script reference
- **SCRIPTS-ANALYSIS-SUMMARY.md** - Executive overview

---

**Last Updated:** January 29, 2026  
**Keep this card handy for quick reference!**
