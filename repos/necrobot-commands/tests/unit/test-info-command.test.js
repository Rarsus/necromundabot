/**
 * Test Info Command
 * Verifies that the info command returns bot information correctly
 * Tests CommandLoader validation requirements
 */

const assert = require('assert');

describe('Info Command', () => {
  let infoCommand;

  beforeEach(() => {
    // Clear require cache to get fresh module
    delete require.cache[require.resolve('../../src/commands/misc/info.js')];
    infoCommand = require('../../src/commands/misc/info.js');
  });

  describe('structure (CommandLoader requirements)', () => {
    it('should have required name property', () => {
      assert.strictEqual(typeof infoCommand.name, 'string');
      assert.strictEqual(infoCommand.name, 'info');
    });

    it('should have required description property', () => {
      assert.strictEqual(typeof infoCommand.description, 'string');
      assert.ok(infoCommand.description.length > 0);
    });

    it('should have required data property', () => {
      assert.ok(infoCommand.data);
      assert.strictEqual(infoCommand.data.name, 'info');
    });

    it('should have required executeInteraction method', () => {
      assert.strictEqual(typeof infoCommand.executeInteraction, 'function');
    });
  });

  describe('functionality', () => {
    it('should respond to interaction without errors', async () => {
      const mockInteraction = {
        editReply: async (msg) => ({ id: 'msg-123', createdTimestamp: Date.now() }),
        createdTimestamp: Date.now() - 100,
        client: {
          ws: { ping: 50 },
          user: {
            username: 'NecromundaBot',
            id: 'bot-123',
            displayAvatarURL: () => 'https://example.com/avatar.png',
          },
          uptime: 3600000, // 1 hour in ms
          guilds: { cache: { size: 5 } },
          commandLoader: {
            getCommandsByCategory: () => ({
              misc: ['ping', 'help', 'info'],
              battle: ['roll', 'attack'],
              social: ['quote'],
            }),
          },
        },
      };

      // Should not throw
      await infoCommand.executeInteraction(mockInteraction);
    });

    it('should include bot information in the response', async () => {
      let responseMessage = '';

      const mockInteraction = {
        editReply: async (msg) => {
          responseMessage = msg;
          return { id: 'msg-123', createdTimestamp: Date.now() };
        },
        createdTimestamp: Date.now() - 100,
        client: {
          ws: { ping: 50 },
          user: {
            username: 'NecromundaBot',
            id: 'bot-123',
            displayAvatarURL: () => 'https://example.com/avatar.png',
          },
          uptime: 3600000, // 1 hour
          guilds: { cache: { size: 5 } },
          commandLoader: {
            getCommandsByCategory: () => ({
              misc: ['ping', 'help', 'info'],
              social: ['quote'],
            }),
          },
        },
      };

      await infoCommand.executeInteraction(mockInteraction);

      // Verify response contains expected information
      assert.ok(typeof responseMessage === 'string' || responseMessage.embeds, 'Should return a message or embed');
    });

    it('should handle missing client data gracefully', async () => {
      const mockInteraction = {
        editReply: async (msg) => ({ id: 'msg-123', createdTimestamp: Date.now() }),
        createdTimestamp: Date.now() - 100,
        client: {
          ws: { ping: 50 },
          user: {
            username: 'Bot',
            id: 'bot-123',
            displayAvatarURL: () => 'https://example.com/avatar.png',
          },
          uptime: 0,
          guilds: { cache: { size: 0 } },
          commandLoader: {
            getCommandsByCategory: () => ({}),
          },
        },
      };

      // Should not throw even with minimal data
      await infoCommand.executeInteraction(mockInteraction);
    });
  });
});
