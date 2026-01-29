/**
 * Test Ping Command
 * Verifies that the ping command works correctly
 * Tests CommandLoader validation requirements
 */

const assert = require('assert');

describe('Ping Command', () => {
  let pingCommand;

  beforeEach(() => {
    // Clear require cache to get fresh module
    delete require.cache[require.resolve('../../src/commands/misc/ping.js')];
    pingCommand = require('../../src/commands/misc/ping.js');
  });

  describe('structure', () => {
    it('should be a valid command object', () => {
      assert(pingCommand, 'Ping command should exist');
      assert(typeof pingCommand === 'object', 'Ping command should be an object');
    });

    it('should have required name property (CommandLoader requirement)', () => {
      assert.strictEqual(typeof pingCommand.name, 'string', 'Command should have name property as string');
      assert.strictEqual(pingCommand.name, 'ping', 'Name should be "ping"');
    });

    it('should have required description property (CommandLoader requirement)', () => {
      assert.strictEqual(
        typeof pingCommand.description,
        'string',
        'Command should have description property as string'
      );
      assert.ok(pingCommand.description.length > 0, 'Description should not be empty');
    });

    it('should have required data property (CommandLoader requirement)', () => {
      assert(pingCommand.data, 'Command should have SlashCommandBuilder data');
      assert(typeof pingCommand.data.name === 'string', 'Data should have name');
      assert.strictEqual(pingCommand.data.name, 'ping', 'Data name should be ping');
    });

    it('should have required executeInteraction method (CommandLoader requirement)', () => {
      assert(typeof pingCommand.executeInteraction === 'function', 'Command should have executeInteraction method');
    });
  });

  describe('discord.js integration', () => {
    it('should have valid SlashCommandBuilder data', () => {
      assert(pingCommand.data, 'Command should have data');
      assert(typeof pingCommand.data.name === 'string', 'Data should have name');
      assert.strictEqual(pingCommand.data.name, 'ping', 'Data name should be ping');
      assert(typeof pingCommand.data.description === 'string', 'Data should have description');
    });
  });

  describe('methods', () => {
    it('should have executeInteraction method', () => {
      assert(typeof pingCommand.executeInteraction === 'function', 'Command should have executeInteraction method');
    });

    it('executeInteraction should be an async function', () => {
      const method = pingCommand.executeInteraction;
      assert.strictEqual(method.constructor.name, 'AsyncFunction', 'executeInteraction should be async');
    });

    it('executeInteraction should accept interaction parameter', () => {
      const method = pingCommand.executeInteraction;
      assert.strictEqual(method.length, 1, 'executeInteraction should accept 1 parameter');
    });
  });

  describe('implementation - executeInteraction', () => {
    it('should send pong reply to interaction', async () => {
      let repliedWith = null;
      const mockInteraction = {
        editReply: async (msg) => {
          repliedWith = msg;
          return {
            createdTimestamp: Date.now(),
          };
        },
        createdTimestamp: Date.now() - 100,
        client: {
          ws: {
            ping: 50,
          },
        },
      };

      await pingCommand.executeInteraction(mockInteraction);

      assert.ok(repliedWith.includes('Pong'), 'Reply should contain "Pong"');
    });

    it('should include message latency in response', async () => {
      let finalReply = null;
      const mockInteraction = {
        editReply: async (msg) => {
          finalReply = msg;
          return {
            createdTimestamp: Date.now(),
          };
        },
        createdTimestamp: Date.now() - 50,
        client: {
          ws: {
            ping: 75,
          },
        },
      };

      await pingCommand.executeInteraction(mockInteraction);

      assert.ok(finalReply.includes('Message Latency'), 'Response should include message latency');
      assert.ok(finalReply.includes('ms'), 'Response should include milliseconds unit');
    });

    it('should include websocket latency in response', async () => {
      let finalReply = null;
      const mockInteraction = {
        editReply: async (msg) => {
          finalReply = msg;
          return {
            createdTimestamp: Date.now(),
          };
        },
        createdTimestamp: Date.now() - 100,
        client: {
          ws: {
            ping: 120,
          },
        },
      };

      await pingCommand.executeInteraction(mockInteraction);

      assert.ok(finalReply.includes('WebSocket Latency'), 'Response should include WebSocket latency');
      assert.ok(finalReply.includes('120'), 'Response should include actual ping value');
    });

    it('should call editReply twice (initial and final)', async () => {
      let callCount = 0;
      const mockInteraction = {
        editReply: async (msg) => {
          callCount++;
          return {
            createdTimestamp: Date.now(),
          };
        },
        createdTimestamp: Date.now() - 100,
        client: {
          ws: {
            ping: 50,
          },
        },
      };

      await pingCommand.executeInteraction(mockInteraction);

      assert.strictEqual(callCount, 2, 'executeInteraction should call editReply twice');
    });

    it('should handle zero latency gracefully', async () => {
      let finalReply = null;
      const mockInteraction = {
        editReply: async (msg) => {
          finalReply = msg;
          return {
            createdTimestamp: Date.now(),
          };
        },
        createdTimestamp: Date.now(),
        client: {
          ws: {
            ping: 0,
          },
        },
      };

      await pingCommand.executeInteraction(mockInteraction);

      assert.ok(finalReply, 'Should complete without error');
      assert.ok(finalReply.includes('0ms'), 'Should show 0ms latency');
    });

    it('should handle high latency gracefully', async () => {
      let finalReply = null;
      const mockInteraction = {
        editReply: async (msg) => {
          finalReply = msg;
          return {
            createdTimestamp: Date.now() + 1000,
          };
        },
        createdTimestamp: Date.now(),
        client: {
          ws: {
            ping: 5000,
          },
        },
      };

      await pingCommand.executeInteraction(mockInteraction);

      assert.ok(finalReply, 'Should complete without error');
      assert.ok(finalReply.includes('1000'), 'Should show actual latency values');
    });
  });
});
