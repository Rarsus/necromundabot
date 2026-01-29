<!-- markdownlint-disable MD013 MD031 MD032 MD040 -->

# MCP Server Setup Guide for NecromundaBot

## Overview

This guide covers the Model Context Protocol (MCP) server configuration for NecromundaBot.
These servers enable GitHub Copilot and other AI tools to safely interact with your project.

## What is MCP?

**Model Context Protocol** is a standardized interface that allows AI assistants to:

- Read and analyze your codebase
- View git history and status
- Execute tests and build scripts
- Query databases
- Access project metadata

## Architecture

NecromundaBot includes 5 MCP servers:

```txt
┌─────────────────────────────────────────┐
│      GitHub Copilot / AI Tools          │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
    ┌───▼───┐  ┌──▼──┐  ┌────▼────┐
    │  MCP  │  │ MCP │  │   MCP   │
    │Servers│  │HTTP │  │Registry │
    └───┬───┘  └─────┘  └─────────┘
        │
    ┌───┴───────────────────────────────────┐
    │                                       │
 ┌──▼─────┐  ┌──────────┐  ┌─────────┐  ┌──▼──┐  ┌──────┐
 │FileSystem│ │   Git    │  │ Shell   │  │ DB  │  │ NPM  │
 │  Server  │ │ Server   │  │ Server  │  │Server  │Server│
 └────┬─────┘  └──────────┘  └──┬──────┘  └──────┘  └──────┘
      │                          │
   src/,         .git/,          npm scripts,
  tests/,        commits,        tests,
  docs/          branches        build tools
```

## Server Details

### 1. Filesystem Server (`mcp-servers/filesystem-server.js`)

**Purpose:** Provide safe read-only access to project files

**Capabilities:**

- Read files with metadata (size, lines)
- List directories safely
- Find files matching patterns
- Search within files
- Get project structure overview

**Usage Example:**

```bash
# Get project structure
node mcp-servers/filesystem-server.js structure

# List directory contents
node mcp-servers/filesystem-server.js list src/commands

# Search for files
node mcp-servers/filesystem-server.js find "*.js"

# Read file content
node mcp-servers/filesystem-server.js read src/index.js

# Search within file
node mcp-servers/filesystem-server.js search src/commands/misc/ping.js "execute"
```

**Security Features:**

- Path traversal prevention
- Whitelist of searchable directories
- No write operations allowed
- Symbolic link traversal blocked

### 2. Git Server (`mcp-servers/git-server.js`)

**Purpose:** Provide version control insights

**Capabilities:**

- View commit history
- Check repository status
- See changed files
- Inspect diffs
- List branches and tags
- View staged changes

**Usage Example:**

```bash
# Get repository status
node mcp-servers/git-server.js status

# View recent commits
node mcp-servers/git-server.js log 10

# See file changes
node mcp-servers/git-server.js diff src/commands/quote-management/add-quote.js

# List all branches
node mcp-servers/git-server.js branches

# Get commit details
node mcp-servers/git-server.js commit d42b753

# View staged changes
node mcp-servers/git-server.js staged
```

**Use Cases:**

- Understanding code evolution
- Reviewing recent changes
- Analyzing git history for context
- Tracking which files changed recently

### 3. Shell Server (`mcp-servers/shell-server.js`)

**Purpose:** Execute npm scripts and build commands safely

**Whitelisted Commands:**

- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting errors
- `npm run register-commands` - Register Discord commands
- `npm run test:quotes` - Run quote system tests
- `npm run test:utils:base` - Test command base
- `npm run test:utils:options` - Test options builder
- `npm run test:utils:helpers` - Test response helpers
- `npm run test:all` - Run all tests
- Plus more...

**Usage Example:**

```bash
# Run tests
node mcp-servers/shell-server.js exec "npm test"

# Get available scripts
node mcp-servers/shell-server.js available

# Check project info
node mcp-servers/shell-server.js info

# Run specific test suite
node mcp-servers/shell-server.js exec "npm run test:quotes"
```

**Security Model:**

- Only whitelisted commands can execute
- Output limited to 10MB
- Error handling for failed commands
- Timeout protection (30 seconds default)

### 4. Database Server (`mcp-servers/database-server.js`)

**Purpose:** Query SQLite databases safely (read-only)

**Capabilities:**

- List all guild databases
- Get database statistics
- View schema information
- Query quotes
- Search across quotes
- Get database summary

**Database Structure:**

```txt
data/
├── db/
│   ├── quotes.db              # Root database (proxy config, schema)
│   └── guilds/
│       ├── 123456789/         # Guild-specific database
│       │   └── quotes.db      # Guild 1 quotes and reminders
│       ├── 987654321/
│       │   └── quotes.db      # Guild 2 quotes and reminders
│       └── ...
```

**Usage Example:**

```bash
# Get database summary
node mcp-servers/database-server.js summary

# Get root database stats
node mcp-servers/database-server.js root

# List all guild databases
node mcp-servers/database-server.js guilds

# Get specific guild stats
node mcp-servers/database-server.js guild 123456789

# Get recent quotes
node mcp-servers/database-server.js quotes root 10

# Search quotes
node mcp-servers/database-server.js search root "meme"
```

**Guild Isolation:**

- Each guild has isolated database
- No cross-guild data access
- Per-guild quote and reminder storage
- Safe parameterized queries

### 5. NPM Server (`mcp-servers/npm-server.js`)

**Purpose:** Access package metadata and scripts

**Capabilities:**

- List all npm scripts
- Filter test scripts
- Filter dev scripts
- Get version information
- List dependencies
- Get specific dependency versions

**Usage Example:**

```bash
# Get package version
node mcp-servers/npm-server.js version

# List all scripts
node mcp-servers/npm-server.js scripts

# Get test scripts
node mcp-servers/npm-server.js test-scripts

# Get dev scripts
node mcp-servers/npm-server.js dev-scripts

# List dependencies
node mcp-servers/npm-server.js dependencies

# Get specific dependency
node mcp-servers/npm-server.js dependency discord.js

# Get metadata
node mcp-servers/npm-server.js metadata
```

## Configuration

### Main Configuration File (`.mcp/servers.json`)

```json
{
  "version": "1.0.0",
  "workspace": "${PROJECT_ROOT}",
  "debug": false,
  "servers": [
    {
      "name": "filesystem",
      "path": "mcp-servers/filesystem-server.js",
      "description": "Safe file system access",
      "environment": { "MCP_FS_ROOT": "${PROJECT_ROOT}" }
    },
    {
      "name": "git",
      "path": "mcp-servers/git-server.js",
      "description": "Git repository operations"
    },
    {
      "name": "shell",
      "path": "mcp-servers/shell-server.js",
      "description": "Whitelisted command execution"
    },
    {
      "name": "database",
      "path": "mcp-servers/database-server.js",
      "description": "SQLite database access (read-only)",
      "environment": { "MCP_DB_ROOT": "${PROJECT_ROOT}/data/db" }
    },
    {
      "name": "npm",
      "path": "mcp-servers/npm-server.js",
      "description": "NPM package metadata"
    }
  ],
  "autoAllowCommands": [
    "npm test",
    "npm run lint:fix",
    "npm run register-commands",
    "npm run test:quotes",
    "npm run test:quotes-advanced",
    "npm run test:utils:base",
    "npm run test:utils:options",
    "npm run test:utils:helpers",
    "npm run test:integration",
    "npm run test:all"
  ]
}
```

### Environment Variables

Create a `.mcp/.env` file if you need custom paths:

```bash
# Filesystem root (default: project root)
MCP_FS_ROOT=~/repo/necromundaBot

# Database root (default: data/db)
MCP_DB_ROOT=~/repo/necromundaBot/data/db

# Enable debug logging
MCP_DEBUG=false

# Shell command timeout (seconds)
MCP_SHELL_TIMEOUT=30
```

## Testing MCP Servers

### Test Individual Servers

```bash
# Test filesystem server
node mcp-servers/filesystem-server.js structure

# Test git server
node mcp-servers/git-server.js status

# Test shell server
node mcp-servers/shell-server.js info

# Test database server
node mcp-servers/database-server.js summary

# Test npm server
node mcp-servers/npm-server.js version
```

### Verify MCP Setup

```bash
# Run verification script
node scripts/verify-mcp-setup.js
```

Expected output:

```
✅ Filesystem server: READY
✅ Git server: READY
✅ Shell server: READY
✅ Database server: READY
✅ NPM server: READY
✅ MCP configuration: VALID
```

## GitHub Copilot Integration

### Enable in VS Code

1. **Install GitHub Copilot**
   - Open VS Code Extensions Marketplace
   - Search for "GitHub Copilot"
   - Click Install

2. **Authenticate**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P`)
   - Type "GitHub Copilot: Sign In"
   - Complete authentication

3. **Configure MCP Servers**
   - VS Code reads `.mcp/servers.json` automatically
   - Copilot will be able to access all 5 servers

### Using Copilot with MCP

Once configured, you can:

```txt
Ask Copilot:
- "Show me the structure of src/commands"
- "What changed in the last commit?"
- "Run the test suite and show me results"
- "Query how many quotes we have in guild 123456789"
- "List all npm scripts starting with 'test'"
- "Find all files containing 'QuoteService'"
- "Show me the git diff for src/services/QuoteService.js"
```

## Security Considerations

### Read-Only Operations

- **Filesystem:** Read-only file access
- **Database:** SELECT queries only (no INSERT, UPDATE, DELETE)
- **Git:** Read-only repository operations
- **NPM:** Metadata reading only

### Whitelisted Execution

- **Shell:** Only pre-approved npm scripts
- Commands added to whitelist must be reviewed
- Timeouts prevent hanging processes
- Output limited to 10MB

### Path Validation

- Filesystem paths validated against root
- Symbolic links prevented
- No `../../` traversal allowed
- All paths canonicalized

### SQL Injection Protection

- All database queries use parameterized statements
- No string concatenation in SQL
- Guild context always enforced
- Schema validation before queries

## Troubleshooting

### MCP Servers Not Found

**Error:** `Cannot find module 'mcp-servers/filesystem-server.js'`

**Solution:**

```bash
# Verify files exist
ls -la mcp-servers/

# Re-create if missing
npm run setup:mcp
```

### Database Connection Failed

**Error:** `Failed to open database at data/db/quotes.db`

**Solution:**

```bash
# Initialize database
npm run db:init

# Check database exists
ls -la data/db/
```

### Git Commands Failing

**Error:** `fatal: not a git repository`

**Solution:**

```bash
# Initialize git if needed
git init

# Verify .git exists
ls -la .git/
```

### Tests Not Running

**Error:** `ENOENT: no such file or directory, open 'node_modules/mocha'`

**Solution:**

```bash
# Install dependencies
npm install

# Verify test command works
npm test
```

## Advanced Configuration

### Custom Whitelisted Commands

Edit `.mcp/servers.json`:

```json
{
  "autoAllowCommands": [
    "npm test",
    "npm run lint:fix",
    "npm run my-custom-command" // Add your command here
  ]
}
```

### Disable Specific Servers

Comment out servers in `.mcp/servers.json`:

```json
{
  "servers": [
    { "name": "filesystem", ... },
    // { "name": "database", ... },  // Disabled
    { "name": "npm", ... }
  ]
}
```

### Custom Database Queries

Extend `database-server.js`:

```javascript
async getQuotesByAuthor(guildId, author) {
  return await this.query(
    'SELECT * FROM quotes WHERE author = ?',
    [author],
    guildId
  );
}
```

Then test:

```bash
node mcp-servers/database-server.js
```

## Performance Tips

1. **Limit File Search Results**
   - Use specific patterns in find operations
   - Avoid wildcard-only searches

2. **Cache Database Connections**
   - Connections are cached in memory
   - Close when done: `instance.closeAll()`

3. **Batch Git Operations**
   - Get status once instead of multiple calls
   - Use `getDiff()` instead of separate file reads

4. **Lazy Load Package Data**
   - NPM server caches package.json
   - First call initializes, subsequent calls use cache

## Best Practices

### For Developers

1. **Always use whitelisted commands** in shell server
2. **Test MCP changes** before committing
3. **Document new whitelisted commands**
4. **Review security implications** of changes

### For Copilot Prompting

1. **Be specific** about what you're looking for
2. **Use server capabilities** mentioned in docs
3. **Ask for file contents** via filesystem server
4. **Verify results** with actual commands

### For Project Maintenance

1. **Keep servers.json updated** when adding npm scripts
2. **Test server connectivity** regularly
3. **Monitor MCP performance** for slow queries
4. **Document custom extensions** to servers

## Related Documentation

- [Guild Isolation Architecture](../docs/reference/GUILD-ISOLATION-ARCHITECTURE.md)
- [Database Design](../docs/reference/DATABASE-DESIGN.md)
- [Command Architecture](../docs/reference/ARCHITECTURE.md)
- [Testing Guide](../docs/guides/02-TESTING-GUIDE.md)

## Support & Questions

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review server implementation code
3. Test server individually with CLI commands
4. Check `.mcp/.env` configuration
5. Review MCP logs (if `MCP_DEBUG=true`)

## Version History

- **v1.0.0** (Current) - Initial MCP server implementation with 5 servers
  - Filesystem server with safe path validation
  - Git server for repository access
  - Shell server with command whitelisting
  - Database server with guild isolation
  - NPM server for package metadata

---

**Last Updated:** January 2026  
**NecromundaBot Version:** v0.0.1+MCP  
**Node.js Requirement:** 22+
