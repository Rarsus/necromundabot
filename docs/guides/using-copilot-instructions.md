# Using Copilot Instructions in NecromundaBot

## How It Works

VS Code Copilot automatically discovers and loads the `copilot.md` file from the repository root. You don't need to do anything special—just open a Copilot chat window and it will have access to all instructions.

### **Auto-Discovery Process**
1. **Open VS Code** in the NecromundaBot workspace
2. **Open Copilot Chat** (Ctrl+Shift+I or Cmd+Shift+I on Mac)
3. **Automatically loaded:** The `copilot.md` file provides context to all Copilot responses

---

## What Gets Loaded

When Copilot Chat opens, it has access to:

| Resource | Location | Auto-Loaded |
|----------|----------|-------------|
| **Main Instructions** | `/copilot.md` (root) | ✅ Yes |
| **Patterns** | `/.github/copilot-patterns/` | ✅ Linked from copilot.md |
| **Scenarios** | `/.github/copilot-scenarios/` | ✅ Linked from copilot.md |
| **Full Details** | `/.github/copilot-instructions.md` | ✅ Linked from copilot.md |

---

## Quick Reference from Copilot Chat

You can ask Copilot any of these and it will reference the instructions:

### **For New Commands**
```
"I'm creating a new Discord command. What do I need to do?"
→ Copilot references: copilot-scenarios/01-creating-new-command.md
→ Key pattern: TDD workflow, 4 required properties
```

### **For Bug Fixes**
```
"How do I fix a bug in the codebase?"
→ Copilot references: copilot-scenarios/02-fixing-bugs.md
→ Key pattern: Write failing test first, then fix
```

### **For Database Work**
```
"I need to work with the database. What's the process?"
→ Copilot references: copilot-scenarios/03-database-operations.md
→ Key pattern: TDD, use DatabaseService from necrobot-utils
```

### **For Documentation**
```
"How should I name and store documentation?"
→ Copilot references: copilot-patterns/DOCUMENTATION.md
→ Key rules: Root=UPPERCASE, docs/=lowercase, project-docs/=PHASE-X
```

### **For Service Imports**
```
"How do I import services across workspaces?"
→ Copilot references: copilot-patterns/SERVICE-LAYER.md
→ Key rule: Use "*" version, never "file:../"
```

---

## Testing That It Works

### **Check 1: Copilot sees the repo context**

Open Copilot Chat and ask:
```
"What are the 4 critical enforced requirements for this project?"
```

**Expected response:** Copilot should reference the copilot.md and mention:
1. Documentation naming
2. TDD workflow
3. Command structure
4. Workspace-aware imports

### **Check 2: Copilot follows patterns in responses**

Ask Copilot to create a new command:
```
"Create a ping command following the TDD workflow"
```

**Expected response:** 
- Copilot should create a test file first (RED phase)
- Then implement the command
- Reference the COMMAND-STRUCTURE pattern
- Mention all 4 required properties

### **Check 3: Validate structure validation**

Ask:
```
"What 4 properties must every Discord command export?"
```

**Expected response:** Copilot should list:
1. `name` (string)
2. `description` (string)
3. `data` (SlashCommandBuilder)
4. `executeInteraction` (async function)

---

## Keeping Instructions Updated

The copilot instructions system has 3 levels:

### **Level 1: Root-Level Overview** (`/copilot.md`)
- **Purpose:** Quick reference auto-loaded by Copilot
- **Update:** When adding new scenarios or major patterns
- **Frequency:** Monthly or as-needed

### **Level 2: Detailed Patterns** (`/.github/copilot-patterns/`)
- **Purpose:** Deep dives into specific development patterns
- **Contents:** TDD, Command Structure, Service Layer, etc.
- **Update:** When pattern changes or new best practices emerge
- **Frequency:** As-needed (when you discover improvements)

### **Level 3: Scenario Workflows** (`/.github/copilot-scenarios/`)
- **Purpose:** Step-by-step guides for common tasks
- **Contents:** Creating commands, fixing bugs, database ops, etc.
- **Update:** When workflows change significantly
- **Frequency:** As-needed

---

## Enforcing Instructions in Code Reviews

### **PR Review Checklist**

Use the 4 critical requirements as your PR checklist:

```
PRs should verify:
☑ Documentation follows naming conventions (/copilot-patterns/DOCUMENTATION.md)
☑ All code has tests written first (TDD - /copilot-patterns/TDD-WORKFLOW.md)
☑ Commands have all 4 required properties (/copilot-patterns/COMMAND-STRUCTURE.md)
☑ Imports use workspace "*" versions not file:// (/copilot-patterns/SERVICE-LAYER.md)
```

### **Reference in PR Comments**

When reviewing, reference the instructions:

```markdown
❌ Missing test for this function
→ See [TDD-WORKFLOW.md](/.github/copilot-patterns/TDD-WORKFLOW.md)

❌ Using file:../ path for imports
→ See [SERVICE-LAYER.md](/.github/copilot-patterns/SERVICE-LAYER.md)

❌ Documentation in wrong location
→ See [DOCUMENTATION.md](/.github/copilot-patterns/DOCUMENTATION.md)
```

---

## Accessing Instructions Without Copilot Chat

**Direct file access:**
- `./copilot.md` - Quick overview
- `./.github/copilot-instructions.md` - Full instructions
- `./.github/copilot-patterns/` - Detailed patterns
- `./.github/copilot-scenarios/` - Workflow guides

**In VS Code:**
1. Open file explorer (Ctrl+Shift+E)
2. Navigate to the file you want to read
3. Open in editor (standard VS Code workflow)

---

## Troubleshooting

### **"Copilot is not following the patterns"**
→ Make sure `copilot.md` exists in repo root
→ Restart VS Code Copilot
→ Ask Copilot to reference the specific pattern file

### **"The links in copilot.md don't work"**
→ Ensure you're in the correct workspace
→ Verify all linked files exist in `/.github/`
→ Try opening files directly: Ctrl+P and type filename

### **"I want Copilot to enforce a new pattern"**
→ Add pattern to appropriate file in `/.github/copilot-patterns/`
→ Link it from `/copilot.md`
→ Update this guide if it's a major pattern

---

## Summary

✅ **Automatic:** VS Code loads `copilot.md` on startup  
✅ **Comprehensive:** Links to all patterns and scenarios  
✅ **Enforced:** Use in code reviews via checklists  
✅ **Discoverable:** Ask Copilot any question about the workflow  
✅ **Maintainable:** Update patterns as you learn better approaches  

The instructions are now part of your development workflow! 🚀
