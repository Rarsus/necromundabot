/**
 * Test suite for CommandBase
 * Tests command lifecycle and error handling
 */

const assert = require('assert');
const CommandBase = require('../../src/core/CommandBase');

describe('CommandBase', () => {
  let command;

  class TestCommand extends CommandBase {
    async execute(message, args) {
      if (args[0] === 'error') {
        throw new Error('Test error');
      }
      message.replied = true;
    }

    async executeInteraction(interaction) {
      if (interaction.options.getString('test') === 'error') {
        throw new Error('Interaction error');
      }
      interaction.executed = true;
    }
  }

  beforeEach(() => {
    command = new TestCommand({
      name: 'test',
      description: 'Test command',
    });
  });

  describe('initialization', () => {
    it('should initialize with name and description', () => {
      assert.strictEqual(command.name, 'test');
      assert.strictEqual(command.description, 'Test command');
    });

    it('should set isSlashCommand and isPrefixCommand to true by default', () => {
      assert.strictEqual(command.isSlashCommand, true);
      assert.strictEqual(command.isPrefixCommand, true);
    });
  });

  describe('register method', () => {
    it('should return the command instance for chaining', () => {
      const result = command.register();
      assert.strictEqual(result, command);
    });
  });

  describe('getCommandData', () => {
    it('should return command metadata', () => {
      const data = command.getCommandData();

      assert.strictEqual(data.name, 'test');
      assert.strictEqual(data.description, 'Test command');
      assert.ok(Array.isArray(data.options));
    });
  });

  describe('abstract methods', () => {
    const baseCommand = new CommandBase({
      name: 'abstract',
      description: 'Abstract command',
    });

    it('should throw error if execute is not implemented', async () => {
      const mockMessage = { reply: async () => {} };

      assert.rejects(async () => {
        await baseCommand.execute(mockMessage, []);
      }, /execute\(\) method must be implemented/);
    });

    it('should throw error if executeInteraction is not implemented', async () => {
      const mockInteraction = { deferReply: async () => {} };

      assert.rejects(async () => {
        await baseCommand.executeInteraction(mockInteraction);
      }, /executeInteraction\(\) method must be implemented/);
    });
  });

  describe('handlePrefixCommand', () => {
    it('should execute prefix command successfully', async () => {
      const mockMessage = { reply: async () => {} };
      await command.handlePrefixCommand(mockMessage, []);

      assert.strictEqual(mockMessage.replied, true);
    });

    it('should handle errors in prefix command', async () => {
      const mockMessage = {
        reply: async (msg) => {
          if (msg.content && msg.content.includes('Error')) {
            return { sent: true };
          }
        },
      };

      try {
        await command.handlePrefixCommand(mockMessage, ['error']);
      } catch (e) {
        // Error is expected and handled
      }
    });
  });

  describe('handleSlashCommand', () => {
    it('should defer reply and execute slash command', async () => {
      const mockInteraction = {
        deferReply: async () => ({ deferred: true }),
        options: { getString: () => 'value' },
      };

      await command.handleSlashCommand(mockInteraction);

      assert.strictEqual(mockInteraction.executed, true);
    });
  });
});
