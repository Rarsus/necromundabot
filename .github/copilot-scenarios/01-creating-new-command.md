# Scenario: Creating a New Discord Command

**When to use:** Adding a new slash command to the bot

## Prerequisites

- ✅ Read [COMMAND-STRUCTURE.md](../copilot-patterns/COMMAND-STRUCTURE.md) - Know the 4 required properties
- ✅ Read [TDD-WORKFLOW.md](../copilot-patterns/TDD-WORKFLOW.md) - Tests before code
- ✅ Reviewed [TESTING-PATTERNS.md](../copilot-patterns/TESTING-PATTERNS.md#testing-commands) - How to test commands
- ✅ Looked at existing commands: `repos/necrobot-commands/src/commands/misc/ping.js`

## Step 1: Choose Category

Commands are organized by purpose. Pick one:

```
src/commands/
├── misc/            # General utilities (ping, help, info)
├── battle/          # Battle management
├── campaign/        # Campaign operations
├── gang/            # Gang management
└── social/          # Social features
```

## Step 2: Create Test File (RED Phase)

Create test file first - this is MANDATORY.

```bash
# Create test in correct workspace
mkdir -p repos/necrobot-commands/tests/unit

cat > repos/necrobot-commands/tests/unit/test-mycommand.test.js << 'EOF'
/**
 * Test MyCommand
 * Verifies that the mycommand command works correctly
 * Tests CommandLoader validation requirements
 */

const assert = require('assert');

describe('MyCommand', () => {
  let myCommand;

  beforeEach(() => {
    // Clear require cache to get fresh module
    delete require.cache[require.resolve('../../src/commands/misc/mycommand.js')];
    myCommand = require('../../src/commands/misc/mycommand.js');
  });

  describe('structure (CommandLoader requirements)', () => {
    it('should have required name property', () => {
      assert.strictEqual(typeof myCommand.name, 'string');
      assert.strictEqual(myCommand.name, 'mycommand');
    });

    it('should have required description property', () => {
      assert.strictEqual(typeof myCommand.description, 'string');
      assert.ok(myCommand.description.length > 0);
    });

    it('should have required data property', () => {
      assert.ok(myCommand.data);
      assert.strictEqual(myCommand.data.name, 'mycommand');
    });

    it('should have required executeInteraction method', () => {
      assert.strictEqual(typeof myCommand.executeInteraction, 'function');
    });
  });

  describe('functionality', () => {
    it('should respond to interaction', async () => {
      const mockInteraction = {
        editReply: async (msg) => ({ id: 'msg-123', createdTimestamp: Date.now() }),
        createdTimestamp: Date.now() - 100,
        client: { ws: { ping: 50 } }
      };

      // Should not throw
      await myCommand.executeInteraction(mockInteraction);
    });
  });
});
EOF
```

## Step 3: Run Tests (Verify RED Phase)

```bash
cd /home/olav/repo/necromundabot
npm test --workspace=repos/necrobot-commands -- test-mycommand.test.js

# Expected output: Tests FAIL ✅ (RED phase)
# Module not found: ../../src/commands/misc/mycommand.js
```

## Step 4: Implement Command (GREEN Phase)

Create the command file to make tests pass:

```bash
cat > repos/necrobot-commands/src/commands/misc/mycommand.js << 'EOF'
/**
 * MyCommand - Does something awesome
 * Example command demonstrating proper structure
 */

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  // Command metadata (required for CommandLoader validation)
  name: 'mycommand',
  description: 'Does something awesome',

  // Command data (for slash command registration)
  data: new SlashCommandBuilder()
    .setName('mycommand')
    .setDescription('Does something awesome'),

  /**
   * Execute the slash command interaction
   * @param {CommandInteraction} interaction - Discord interaction
   * @returns {Promise<void>}
   */
  async executeInteraction(interaction) {
    await interaction.editReply('Hello! This is mycommand.');
  }
};
EOF
```

## Step 5: Run Tests Again (Verify GREEN Phase)

```bash
npm test --workspace=repos/necrobot-commands -- test-mycommand.test.js

# Expected output: All tests PASS ✅ (GREEN phase)
```

## Step 6: Lint Code

```bash
npm run lint --workspace=repos/necrobot-commands

# Expected output: No errors ✅
```

## Step 7: Test in Discord

Build and start the bot:

```bash
docker-compose down && docker system prune -f
docker-compose up --build -d

# Wait for startup
sleep 5

# Check logs
docker logs necromundabot | grep "mycommand\|Loaded"

# Expected: ✅ Loaded: mycommand (mycommand.js)
```

Test in Discord:
- In any Discord server where the bot is, type: `/mycommand`
- Bot should reply: "Hello! This is mycommand."

## Step 8: Commit

```bash
cd /home/olav/repo/necromundabot

git add repos/necrobot-commands/
git commit -m "feat(commands): Add mycommand

- Created test-mycommand.test.js (RED phase - tests initially failing)
- Implemented mycommand.js (GREEN phase - all tests pass)
- Validates CommandLoader structure requirements
- Tests in Discord successful"
```

## Enhancement: Add Options

If your command needs parameters:

### Update Test

```javascript
it('should accept optional name parameter', () => {
  assert.ok(myCommand.data.options);
  const nameOption = myCommand.data.options.find(o => o.name === 'name');
  assert.ok(nameOption);
  assert.strictEqual(nameOption.required, false);
});
```

### Update Command

```javascript
module.exports = {
  name: 'mycommand',
  description: 'Does something awesome',
  data: new SlashCommandBuilder()
    .setName('mycommand')
    .setDescription('Does something awesome')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('Your name')
        .setRequired(false)
    ),
  async executeInteraction(interaction) {
    const name = interaction.options.getString('name') || 'Friend';
    await interaction.editReply(`Hello, ${name}!`);
  }
};
```

## Checklist

Before committing:
- [ ] Test file created first (RED phase)
- [ ] Tests initially fail (RED)
- [ ] Command file created
- [ ] All tests pass (GREEN)
- [ ] Command has all 4 required properties
- [ ] No ESLint errors
- [ ] Works in Discord
- [ ] Commit message explains RED→GREEN phases

## Common Mistakes

❌ **Mistake:** Creating command file before tests  
✅ **Fix:** Always tests first (RED phase)

❌ **Mistake:** Missing one of 4 required properties  
✅ **Fix:** name, description, data, executeInteraction (all required)

❌ **Mistake:** Using synchronous method (not async)  
✅ **Fix:** `async executeInteraction(interaction) { ... }`

❌ **Mistake:** Method named `execute()` instead of `executeInteraction()`  
✅ **Fix:** Must be exactly `executeInteraction`

## PR Title Format Reminder

When creating a pull request for a new command, use the format:

```
feat: <concise description of the new command>
```

Examples:
- ✅ `feat: add /roll command for dice rolling`
- ✅ `feat: implement gang creation command`
- ✅ `feat: add quote search functionality`
- ❌ `Add roll command` (missing prefix)
- ❌ `feat add command` (missing colon)

See [PR-TITLE-FORMAT.md](../copilot-patterns/PR-TITLE-FORMAT.md) for complete details.

## Need Help?

- See [COMMAND-STRUCTURE.md](../copilot-patterns/COMMAND-STRUCTURE.md) for validation details
- See [TDD-WORKFLOW.md](../copilot-patterns/TDD-WORKFLOW.md) for testing patterns
- See [TESTING-PATTERNS.md](../copilot-patterns/TESTING-PATTERNS.md) for advanced testing
- See [PR-TITLE-FORMAT.md](../copilot-patterns/PR-TITLE-FORMAT.md) for PR title requirements
- Check existing commands: `repos/necrobot-commands/src/commands/misc/`
