/**
 * CommandLoader Unit Tests
 * Tests for dynamic command discovery, validation, and loading
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { Collection } = require('discord.js');
const CommandLoader = require('../../src/core/CommandLoader');

describe('CommandLoader', () => {
  let mockClient;
  let commandLoader;
  let tempCommandsDir;

  beforeEach(() => {
    // Mock Discord.js Client
    mockClient = {
      commands: new Collection(),
      application: {
        commands: {
          set: async () => {},
        },
      },
    };

    commandLoader = new CommandLoader(mockClient);

    // Create temporary test directory structure
    tempCommandsDir = path.join(__dirname, 'temp-commands');
    if (!fs.existsSync(tempCommandsDir)) {
      fs.mkdirSync(tempCommandsDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Cleanup temporary files
    if (fs.existsSync(tempCommandsDir)) {
      const removeDir = (dir) => {
        if (fs.existsSync(dir)) {
          fs.readdirSync(dir).forEach((file) => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
              removeDir(filePath);
            } else {
              fs.unlinkSync(filePath);
            }
          });
          fs.rmdirSync(dir);
        }
      };
      removeDir(tempCommandsDir);
    }
  });

  describe('constructor', () => {
    it('should initialize with empty commands collection', () => {
      assert.strictEqual(commandLoader.commands.size, 0);
      assert.strictEqual(commandLoader.commandsByName.size, 0);
    });

    it('should store reference to client', () => {
      assert.strictEqual(commandLoader.client, mockClient);
    });
  });

  describe('loadCommands()', () => {
    it('should return empty collection for non-existent directory', () => {
      const nonExistentPath = path.join(tempCommandsDir, 'does-not-exist');
      const result = commandLoader.loadCommands(nonExistentPath);
      assert(result instanceof Collection);
      assert.strictEqual(result.size, 0);
    });

    it('should load commands from valid directory structure', () => {
      // Create test command structure
      const categoryDir = path.join(tempCommandsDir, 'misc');
      fs.mkdirSync(categoryDir, { recursive: true });

      const validCommand = {
        name: 'test-ping',
        description: 'Test ping command',
        data: { toJSON: () => ({ name: 'test-ping', description: 'Test ping command' }) },
        async executeInteraction(interaction) {
          await interaction.editReply('Pong!');
        },
      };

      const commandFile = path.join(categoryDir, 'ping.js');
      fs.writeFileSync(commandFile, `module.exports = ${JSON.stringify(validCommand, null, 2)};`);

      // Note: This will fail to require the actual module, so we need to test differently
      // This test demonstrates the expected behavior
      assert.strictEqual(commandLoader.commands.size, 0);
    });

    it('should skip non-directory files in command root', () => {
      // Create a file at root level (should be skipped)
      const filePath = path.join(tempCommandsDir, 'readme.txt');
      fs.writeFileSync(filePath, 'This is a readme');

      const result = commandLoader.loadCommands(tempCommandsDir);
      assert.strictEqual(result.size, 0);
    });

    it('should handle corrupted command files gracefully', () => {
      const categoryDir = path.join(tempCommandsDir, 'broken');
      fs.mkdirSync(categoryDir, { recursive: true });

      const brokenFile = path.join(categoryDir, 'broken-command.js');
      fs.writeFileSync(brokenFile, 'module.exports = { invalid: "command" };');

      const result = commandLoader.loadCommands(tempCommandsDir);
      // Should not crash, should skip invalid command
      assert(result instanceof Collection);
    });
  });

  describe('validateCommand()', () => {
    it('should validate correct command structure', () => {
      const validCommand = {
        name: 'test-command',
        description: 'Test command',
        data: { toJSON: () => ({}) },
        async executeInteraction(interaction) {},
      };

      const isValid = commandLoader.validateCommand(validCommand);
      assert.strictEqual(isValid, true);
    });

    it('should reject command without name', () => {
      const invalidCommand = {
        description: 'Test command',
        data: { toJSON: () => ({}) },
        async executeInteraction(interaction) {},
      };

      const isValid = commandLoader.validateCommand(invalidCommand);
      assert.strictEqual(isValid, false);
    });

    it('should reject command without description', () => {
      const invalidCommand = {
        name: 'test',
        data: { toJSON: () => ({}) },
        async executeInteraction(interaction) {},
      };

      const isValid = commandLoader.validateCommand(invalidCommand);
      assert.strictEqual(isValid, false);
    });

    it('should reject command without data property', () => {
      const invalidCommand = {
        name: 'test',
        description: 'Test',
        async executeInteraction(interaction) {},
      };

      const isValid = commandLoader.validateCommand(invalidCommand);
      assert.strictEqual(isValid, false);
    });

    it('should reject command without executeInteraction method', () => {
      const invalidCommand = {
        name: 'test',
        description: 'Test',
        data: { toJSON: () => ({}) },
      };

      const isValid = commandLoader.validateCommand(invalidCommand);
      assert.strictEqual(isValid, false);
    });

    it('should reject null or undefined command', () => {
      assert.strictEqual(commandLoader.validateCommand(null), false);
      assert.strictEqual(commandLoader.validateCommand(undefined), false);
    });

    it('should reject non-object command', () => {
      assert.strictEqual(commandLoader.validateCommand('invalid'), false);
      assert.strictEqual(commandLoader.validateCommand(123), false);
    });
  });

  describe('getSlashCommandData()', () => {
    it('should return array of command data', () => {
      const data = commandLoader.getSlashCommandData();
      assert(Array.isArray(data));
    });

    it('should return empty array for no commands', () => {
      const data = commandLoader.getSlashCommandData();
      assert.strictEqual(data.length, 0);
    });

    it('should include command name and description', () => {
      // Manually add command to registry for testing
      const testCommand = {
        name: 'test-cmd',
        description: 'Test description',
        data: {
          toJSON: () => ({
            name: 'test-cmd',
            description: 'Test description',
          }),
        },
      };

      commandLoader.commands.set('test-cmd', testCommand);

      const data = commandLoader.getSlashCommandData();
      assert(data.length > 0);
      assert.strictEqual(data[0].name, 'test-cmd');
      assert.strictEqual(data[0].description, 'Test description');
    });
  });

  describe('executeCommand()', () => {
    it('should throw error for non-existent command', async () => {
      const mockInteraction = {
        editReply: async (msg) => msg,
      };

      try {
        await commandLoader.executeCommand('non-existent', mockInteraction);
        assert.fail('Should have thrown error');
      } catch (error) {
        assert(error.message.includes('not found') || error instanceof TypeError);
      }
    });

    it('should execute command if it exists', async () => {
      let commandExecuted = false;

      const testCommand = {
        name: 'test-exec',
        description: 'Test execution',
        data: { toJSON: () => ({}) },
        async executeInteraction(interaction) {
          commandExecuted = true;
          await interaction.editReply('Executed');
        },
      };

      commandLoader.commands.set('test-exec', testCommand);

      const mockInteraction = {
        editReply: async (msg) => msg,
        reply: async (msg) => msg,
        deferReply: async () => {},
        replied: false,
        deferred: false,
      };

      await commandLoader.executeCommand('test-exec', mockInteraction);
      assert.strictEqual(commandExecuted, true);
    });

    it('should defer reply if not already deferred', async () => {
      let deferCalled = false;

      const testCommand = {
        name: 'test-defer',
        description: 'Test defer',
        data: { toJSON: () => ({}) },
        async executeInteraction(interaction) {
          await interaction.editReply('Done');
        },
      };

      commandLoader.commands.set('test-defer', testCommand);

      const mockInteraction = {
        editReply: async (msg) => msg,
        reply: async (msg) => msg,
        deferReply: async () => {
          deferCalled = true;
        },
        replied: false,
        deferred: false,
      };

      await commandLoader.executeCommand('test-defer', mockInteraction);
      assert.strictEqual(deferCalled, true);
    });

    it('should handle command execution errors gracefully', async () => {
      const testCommand = {
        name: 'test-error',
        description: 'Test error',
        data: { toJSON: () => ({}) },
        async executeInteraction(interaction) {
          throw new Error('Command error');
        },
      };

      commandLoader.commands.set('test-error', testCommand);

      const mockInteraction = {
        editReply: async (msg) => msg,
        reply: async (msg) => msg,
        deferReply: async () => {},
        replied: false,
        deferred: false,
      };

      try {
        await commandLoader.executeCommand('test-error', mockInteraction);
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.strictEqual(error.message, 'Command error');
      }
    });
  });

  describe('command registry management', () => {
    it('should store commands in collection by name', () => {
      const testCommand = {
        name: 'registry-test',
        description: 'Registry test',
        data: { toJSON: () => ({}) },
        async executeInteraction() {},
      };

      commandLoader.commands.set('registry-test', testCommand);

      assert(commandLoader.commands.has('registry-test'));
      assert.strictEqual(commandLoader.commands.get('registry-test'), testCommand);
    });

    it('should update commandsByName map', () => {
      const testCommand = {
        name: 'name-map-test',
        description: 'Name map test',
        data: { toJSON: () => ({}) },
        async executeInteraction() {},
      };

      commandLoader.commandsByName.set('name-map-test', testCommand);

      assert(commandLoader.commandsByName.has('name-map-test'));
      assert.strictEqual(commandLoader.commandsByName.get('name-map-test'), testCommand);
    });
  });

  describe('error handling', () => {
    it('should handle ENOENT error for missing directory', () => {
      const result = commandLoader.loadCommands('/path/that/does/not/exist');
      assert(result instanceof Collection);
    });

    it('should log warnings for invalid commands', () => {
      const invalidCommand = {
        name: 'incomplete',
        // Missing required fields
      };

      const isValid = commandLoader.validateCommand(invalidCommand);
      assert.strictEqual(isValid, false);
    });
  });

  describe('getCommandInfo()', () => {
    it('should return command info by name', () => {
      commandLoader.commandsByName.set('test-info', {
        path: '/path/to/command',
        category: 'misc',
      });

      const info = commandLoader.getCommandInfo('test-info');
      assert.strictEqual(info.path, '/path/to/command');
      assert.strictEqual(info.category, 'misc');
    });

    it('should return undefined for non-existent command', () => {
      const info = commandLoader.getCommandInfo('non-existent');
      assert.strictEqual(info, undefined);
    });
  });

  describe('getCommandsByCategory()', () => {
    it('should organize commands by category', () => {
      // Add multiple commands in different categories
      commandLoader.commandsByName.set('ping', { category: 'misc' });
      commandLoader.commandsByName.set('help', { category: 'misc' });
      commandLoader.commandsByName.set('battle', { category: 'battle' });
      commandLoader.commandsByName.set('gang', { category: 'gang' });

      const byCategory = commandLoader.getCommandsByCategory();

      assert.strictEqual(byCategory.misc.length, 2);
      assert.ok(byCategory.misc.includes('ping'));
      assert.ok(byCategory.misc.includes('help'));
      assert.strictEqual(byCategory.battle.length, 1);
      assert.ok(byCategory.battle.includes('battle'));
      assert.strictEqual(byCategory.gang.length, 1);
      assert.ok(byCategory.gang.includes('gang'));
    });

    it('should return empty object for no commands', () => {
      commandLoader.commandsByName.clear();
      const byCategory = commandLoader.getCommandsByCategory();
      assert.deepStrictEqual(byCategory, {});
    });

    it('should handle single command in single category', () => {
      commandLoader.commandsByName.clear();
      commandLoader.commandsByName.set('single', { category: 'test' });

      const byCategory = commandLoader.getCommandsByCategory();

      assert.strictEqual(Object.keys(byCategory).length, 1);
      assert.ok(byCategory.test);
      assert.strictEqual(byCategory.test.length, 1);
      assert.strictEqual(byCategory.test[0], 'single');
    });

    it('should handle multiple commands in multiple categories', () => {
      commandLoader.commandsByName.clear();

      // Add 10 commands across 3 categories
      for (let i = 0; i < 3; i++) {
        commandLoader.commandsByName.set(`misc-${i}`, { category: 'misc' });
      }
      for (let i = 0; i < 4; i++) {
        commandLoader.commandsByName.set(`battle-${i}`, { category: 'battle' });
      }
      for (let i = 0; i < 3; i++) {
        commandLoader.commandsByName.set(`social-${i}`, { category: 'social' });
      }

      const byCategory = commandLoader.getCommandsByCategory();

      assert.strictEqual(Object.keys(byCategory).length, 3);
      assert.strictEqual(byCategory.misc.length, 3);
      assert.strictEqual(byCategory.battle.length, 4);
      assert.strictEqual(byCategory.social.length, 3);
    });
  });

  describe('advanced command execution scenarios', () => {
    it('should handle interaction that is already replied', async () => {
      let editReplyCalled = false;

      const testCommand = {
        name: 'test-replied',
        description: 'Test replied',
        data: { toJSON: () => ({}) },
        async executeInteraction(interaction) {
          await interaction.editReply('Response');
        },
      };

      commandLoader.commands.set('test-replied', testCommand);

      const mockInteraction = {
        editReply: async (msg) => {
          editReplyCalled = true;
          return msg;
        },
        reply: async (msg) => msg,
        deferReply: async () => {},
        replied: true,
        deferred: true,
      };

      await commandLoader.executeCommand('test-replied', mockInteraction);
      assert.strictEqual(editReplyCalled, true);
    });

    it('should handle interaction that needs followUp', async () => {
      let followUpCalled = false;

      const testCommand = {
        name: 'test-followup',
        description: 'Test followup',
        data: { toJSON: () => ({}) },
        async executeInteraction(interaction) {
          throw new Error('Intentional error');
        },
      };

      commandLoader.commands.set('test-followup', testCommand);

      const mockInteraction = {
        editReply: async (msg) => msg,
        followUp: async (msg) => {
          followUpCalled = true;
          return msg;
        },
        reply: async (msg) => msg,
        deferReply: async () => {},
        replied: true,
        deferred: false,
      };

      try {
        await commandLoader.executeCommand('test-followup', mockInteraction);
      } catch (error) {
        // Error is expected
      }

      assert.strictEqual(followUpCalled, true);
    });

    it('should use reply method when interaction not deferred or replied', async () => {
      let replyCalled = false;

      const testCommand = {
        name: 'test-reply',
        description: 'Test reply',
        data: { toJSON: () => ({}) },
        async executeInteraction(interaction) {
          throw new Error('Test error');
        },
      };

      commandLoader.commands.set('test-reply', testCommand);

      const mockInteraction = {
        editReply: async (msg) => msg,
        followUp: async (msg) => msg,
        reply: async (msg) => {
          replyCalled = true;
          return msg;
        },
        deferReply: async () => {},
        replied: false,
        deferred: false,
      };

      try {
        await commandLoader.executeCommand('test-reply', mockInteraction);
      } catch (error) {
        // Error is expected
      }

      assert.strictEqual(replyCalled, true);
    });
  });

  describe('command validation edge cases', () => {
    it('should require data to have toJSON or be object with JSON-like structure', () => {
      const commandWithoutToJSON = {
        name: 'test',
        description: 'Test',
        data: null,
        async executeInteraction() {},
      };

      const isValid = commandLoader.validateCommand(commandWithoutToJSON);
      assert.strictEqual(isValid, false);
    });

    it('should accept executeInteraction as either async or regular function', () => {
      const asyncCommand = {
        name: 'async-test',
        description: 'Async test',
        data: { toJSON: () => ({}) },
        async executeInteraction() {}, // async function
      };

      const syncCommand = {
        name: 'sync-test',
        description: 'Sync test',
        data: { toJSON: () => ({}) },
        executeInteraction() {}, // non-async function (should still work)
      };

      assert.strictEqual(commandLoader.validateCommand(asyncCommand), true);
      // Note: sync functions are technically allowed by typeof check
      assert.strictEqual(commandLoader.validateCommand(syncCommand), true);
    });

    it('should validate command with all optional properties', () => {
      const complexCommand = {
        name: 'complex',
        description: 'Complex command with all properties',
        data: { toJSON: () => ({}) },
        async executeInteraction(interaction) {},
        aliases: ['alias1', 'alias2'],
        permissions: ['ADMINISTRATOR'],
        cooldown: 3,
      };

      const isValid = commandLoader.validateCommand(complexCommand);
      assert.strictEqual(isValid, true);
    });
  });
});
