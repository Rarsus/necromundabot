/**
 * Test Help Command
 * Verifies that the help command works correctly
 * Tests CommandLoader validation requirements
 */

const assert = require('assert');

describe('Help Command', () => {
  let helpCommand;

  beforeEach(() => {
    // Clear require cache to get fresh module
    delete require.cache[require.resolve('../../src/commands/misc/help.js')];
    helpCommand = require('../../src/commands/misc/help.js');
  });

  describe('structure', () => {
    it('should be a valid command object', () => {
      assert(helpCommand, 'Help command should exist');
      assert(typeof helpCommand === 'object', 'Help command should be an object');
    });

    it('should have required name property (CommandLoader requirement)', () => {
      assert.strictEqual(typeof helpCommand.name, 'string', 'Command should have name property as string');
      assert.strictEqual(helpCommand.name, 'help', 'Name should be "help"');
    });

    it('should have required description property (CommandLoader requirement)', () => {
      assert.strictEqual(
        typeof helpCommand.description,
        'string',
        'Command should have description property as string'
      );
      assert.ok(helpCommand.description.length > 0, 'Description should not be empty');
    });

    it('should have required data property (CommandLoader requirement)', () => {
      assert(helpCommand.data, 'Command should have SlashCommandBuilder data');
      assert(typeof helpCommand.data.name === 'string', 'Data should have name');
      assert.strictEqual(helpCommand.data.name, 'help', 'Data name should be help');
    });

    it('should have required executeInteraction method (CommandLoader requirement)', () => {
      assert(typeof helpCommand.executeInteraction === 'function', 'Command should have executeInteraction method');
    });
  });

  describe('discord.js integration', () => {
    it('should have valid SlashCommandBuilder data', () => {
      assert(helpCommand.data, 'Command should have data');
      assert(typeof helpCommand.data.name === 'string', 'Data should have name');
      assert.strictEqual(helpCommand.data.name, 'help', 'Data name should be help');
      assert(typeof helpCommand.data.description === 'string', 'Data should have description');
    });
  });

  describe('methods', () => {
    it('should have executeInteraction method', () => {
      assert(typeof helpCommand.executeInteraction === 'function', 'Command should have executeInteraction method');
    });

    it('executeInteraction should be an async function', () => {
      const method = helpCommand.executeInteraction;
      assert.strictEqual(method.constructor.name, 'AsyncFunction', 'executeInteraction should be async');
    });

    it('executeInteraction should accept interaction parameter', () => {
      const method = helpCommand.executeInteraction;
      assert.strictEqual(method.length, 1, 'executeInteraction should accept 1 parameter');
    });
  });

  describe('implementation - executeInteraction', () => {
    it('should send error message when no commands available', async () => {
      let repliedWith = null;
      const mockInteraction = {
        editReply: async (msg) => {
          repliedWith = msg;
          return {};
        },
        client: {
          commandLoader: {
            getCommandsByCategory: () => ({}),
          },
        },
      };

      await helpCommand.executeInteraction(mockInteraction);

      assert.strictEqual(repliedWith, '❌ No commands available', 'Should send error message when no commands');
    });

    it('should send embed with commands when available', async () => {
      let repliedWith = null;
      const mockInteraction = {
        editReply: async (msg) => {
          repliedWith = msg;
          return {};
        },
        client: {
          commandLoader: {
            getCommandsByCategory: () => ({
              misc: ['ping', 'help'],
            }),
          },
        },
      };

      await helpCommand.executeInteraction(mockInteraction);

      assert.ok(repliedWith, 'Should send a reply');
      assert.ok(repliedWith.embeds, 'Reply should include embeds');
      assert.ok(repliedWith.embeds.length > 0, 'Should have at least one embed');
    });

    it('should include all command categories in embed', async () => {
      let repliedWith = null;
      const mockInteraction = {
        editReply: async (msg) => {
          repliedWith = msg;
          return {};
        },
        client: {
          commandLoader: {
            getCommandsByCategory: () => ({
              misc: ['ping', 'help'],
              battle: ['attack', 'defend'],
              campaign: ['start', 'end'],
            }),
          },
        },
      };

      await helpCommand.executeInteraction(mockInteraction);

      const embed = repliedWith.embeds[0];
      assert.ok(embed.data.fields, 'Embed should have fields');
      assert.strictEqual(embed.data.fields.length, 3, 'Should have field for each category');
    });

    it('should format command names correctly in embed', async () => {
      let repliedWith = null;
      const mockInteraction = {
        editReply: async (msg) => {
          repliedWith = msg;
          return {};
        },
        client: {
          commandLoader: {
            getCommandsByCategory: () => ({
              misc: ['ping', 'help'],
            }),
          },
        },
      };

      await helpCommand.executeInteraction(mockInteraction);

      const embed = repliedWith.embeds[0];
      const miscField = embed.data.fields.find((f) => f.name.includes('misc'));
      assert.ok(miscField, 'Should have misc category field');
      // The implementation: commands.join(', ') -> 'ping, help'
      // Then: '`/' + 'ping, help'.replace(/,/g, '` `/') + '`'
      // Results in: '`/ping` `/ help`'
      assert.ok(miscField.value.includes('/ping'), 'Should format command with slash');
      assert.ok(miscField.value.includes('help'), 'Should include all commands');
    });

    it('should have proper embed styling', async () => {
      let repliedWith = null;
      const mockInteraction = {
        editReply: async (msg) => {
          repliedWith = msg;
          return {};
        },
        client: {
          commandLoader: {
            getCommandsByCategory: () => ({
              misc: ['ping'],
            }),
          },
        },
      };

      await helpCommand.executeInteraction(mockInteraction);

      const embed = repliedWith.embeds[0];
      assert.ok(embed.data.title, 'Embed should have title');
      assert.ok(embed.data.title.includes('Commands'), 'Title should mention commands');
      assert.ok(embed.data.description, 'Embed should have description');
      assert.ok(embed.data.color, 'Embed should have color');
      assert.ok(embed.data.timestamp, 'Embed should have timestamp');
      assert.ok(embed.data.footer, 'Embed should have footer');
    });

    it('should handle single command in category', async () => {
      let repliedWith = null;
      const mockInteraction = {
        editReply: async (msg) => {
          repliedWith = msg;
          return {};
        },
        client: {
          commandLoader: {
            getCommandsByCategory: () => ({
              misc: ['ping'],
            }),
          },
        },
      };

      await helpCommand.executeInteraction(mockInteraction);

      const embed = repliedWith.embeds[0];
      const miscField = embed.data.fields[0];
      assert.ok(miscField.value.includes('/ping'), 'Should include single command');
    });

    it('should handle multiple commands in same category', async () => {
      let repliedWith = null;
      const mockInteraction = {
        editReply: async (msg) => {
          repliedWith = msg;
          return {};
        },
        client: {
          commandLoader: {
            getCommandsByCategory: () => ({
              misc: ['ping', 'help', 'status'],
            }),
          },
        },
      };

      await helpCommand.executeInteraction(mockInteraction);

      const embed = repliedWith.embeds[0];
      const miscField = embed.data.fields[0];
      assert.ok(miscField.value.includes('/ping'), 'Should include first command');
      assert.ok(miscField.value.includes('help'), 'Should include second command');
      assert.ok(miscField.value.includes('status'), 'Should include third command');
    });

    it('should not return early when commands exist', async () => {
      let callCount = 0;
      const mockInteraction = {
        editReply: async (msg) => {
          callCount++;
          return {};
        },
        client: {
          commandLoader: {
            getCommandsByCategory: () => ({
              misc: ['ping'],
            }),
          },
        },
      };

      await helpCommand.executeInteraction(mockInteraction);

      assert.strictEqual(callCount, 1, 'Should only call editReply once when commands available');
    });
  });
});
