# Pattern: Command Structure Validation

**All commands MUST export exactly these 4 properties. CommandLoader validates and rejects invalid commands.**

## Required Properties

```javascript
module.exports = {
  name: 'cmdname',                              // string - unique identifier
  description: 'Description here',              // string - user-facing text
  data: new SlashCommandBuilder()...,           // SlashCommandBuilder object
  async executeInteraction(interaction) { ... } // async function - handler
};
```

Each property is MANDATORY. Missing any one = ⚠️ Invalid command structure (won't load).

## Validation in Practice

**CommandLoader validates all 4 properties during bot startup:**

```
✅ Loaded: ping (ping.js)
✅ Loaded: help (help.js)
⚠️  Invalid command structure: broken.js  ← Missing property, won't load
```

## Real Examples

### ✅ VALID: ping.js

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Replies with Pong! and bot latency',
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong! and bot latency'),
  async executeInteraction(interaction) {
    const reply = await interaction.editReply('🏓 Pong!');
    const latency = reply.createdTimestamp - interaction.createdTimestamp;
    const wsLatency = interaction.client.ws.ping;
    await interaction.editReply(
      `🏓 Pong!\n📊 Message latency: ${latency}ms\n🌐 WebSocket latency: ${wsLatency}ms`
    );
  }
};
```

### ❌ INVALID: broken.js

```javascript
module.exports = {
  data: new SlashCommandBuilder()...
  execute(interaction) { ... }  // ❌ Wrong method name (should be executeInteraction)
  // ❌ MISSING: name property
  // ❌ MISSING: description property
};
// Result: ⚠️ Invalid command structure: broken.js
```

## Test Validation

**Tests MUST verify all 4 properties explicitly:**

```javascript
describe('MyCommand', () => {
  it('should have required name property (CommandLoader requirement)', () => {
    assert.strictEqual(typeof myCommand.name, 'string');
    assert.strictEqual(myCommand.name, 'mycommand');
  });

  it('should have required description property (CommandLoader requirement)', () => {
    assert.strictEqual(typeof myCommand.description, 'string');
    assert.ok(myCommand.description.length > 0);
  });

  it('should have required data property (CommandLoader requirement)', () => {
    assert.ok(myCommand.data);
    assert.strictEqual(myCommand.data.name, 'mycommand');
  });

  it('should have required executeInteraction method (CommandLoader requirement)', () => {
    assert.strictEqual(typeof myCommand.executeInteraction, 'function');
  });
});
```

## File Organization

**Commands live in:**
```
repos/necrobot-commands/src/commands/
├── misc/              # General utilities (ping, help, info)
├── battle/            # Battle management
├── campaign/          # Campaign operations
├── gang/              # Gang management
└── social/            # Social features
```

**Tests live alongside:**
```
repos/necrobot-commands/tests/unit/
├── test-ping-command.test.js
├── test-help-command.test.js
└── test-command-structure.test.js  # Validates all commands
```

## Property Details

### `name` (string)
- Must be lowercase with no spaces
- Used as command identifier in Discord
- Must match `data.setName('name')`
- Example: `'ping'`, `'create-gang'`

### `description` (string)
- User-facing help text
- Required by Discord slash command API
- Should be concise (50-100 chars)
- Example: `'Replies with Pong! and bot latency'`

### `data` (SlashCommandBuilder)
- Discord.js SlashCommandBuilder instance
- Must have `.setName()` matching the `name` property
- Must have `.setDescription()` matching the `description` property
- Can include `.addOption()` for command parameters

### `executeInteraction` (async function)
- Handler function for slash command execution
- Receives Discord interaction object
- Must be async (returns Promise)
- Should use `interaction.editReply()` for responses
- Must handle errors gracefully (use response helpers)

## Common Mistakes

❌ Method named `execute()` instead of `executeInteraction()`  
✅ Correct: `async executeInteraction(interaction) { ... }`

❌ `name` doesn't match `data.setName()`  
✅ Correct: Both set to same value

❌ `description` missing or empty string  
✅ Correct: Non-empty string describing what command does

❌ Synchronous handler function  
✅ Correct: `async executeInteraction(...)` (returns Promise)
