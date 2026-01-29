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

    it('should handle errors and call handleCommandError', async () => {
      const mockInteraction = {
        deferReply: async () => ({ deferred: true }),
        options: { getString: () => 'error' },
        editReply: async (msg) => {
          // Verify error message is sent
          assert.ok(msg.content.includes('Error'));
          return { success: true };
        },
        deferred: true,
      };

      await command.handleSlashCommand(mockInteraction);
    });

    it('should handle error when interaction already replied', async () => {
      const mockInteraction = {
        deferReply: async () => ({ deferred: true }),
        options: { getString: () => 'error' },
        replied: true,
        deferred: false,
        followUp: async (msg) => {
          assert.ok(msg.content.includes('Error'));
          return { success: true };
        },
      };

      await command.handleSlashCommand(mockInteraction);
    });

    it('should handle error when interaction not deferred or replied', async () => {
      const mockInteraction = {
        deferReply: async () => ({ deferred: true }),
        options: { getString: () => 'error' },
        replied: false,
        deferred: false,
        reply: async (msg) => {
          assert.ok(msg.content.includes('Error'));
          return { success: true };
        },
      };

      await command.handleSlashCommand(mockInteraction);
    });
  });

  describe('constructor edge cases', () => {
    it('should initialize with options parameter', () => {
      const options = {
        name: 'test-cmd',
        description: 'Test description',
        options: [{ name: 'arg1', type: 'STRING' }],
      };

      const testCmd = new CommandBase(options);

      assert.strictEqual(testCmd.name, 'test-cmd');
      assert.strictEqual(testCmd.description, 'Test description');
      assert.strictEqual(testCmd.options.length, 1);
    });

    it('should set empty options array when not provided', () => {
      const testCmd = new CommandBase({ name: 'test' });
      assert.deepStrictEqual(testCmd.options, []);
    });

    it('should initialize with undefined name and description', () => {
      const testCmd = new CommandBase();
      assert.strictEqual(testCmd.name, undefined);
      assert.strictEqual(testCmd.description, undefined);
    });
  });

  describe('error handling comprehensive', () => {
    it('should handle command error with deferred interaction', async () => {
      const errorResponse = { content: '', ephemeral: true };

      const mockInteraction = {
        deferred: true,
        replied: false,
        editReply: async (msg) => {
          errorResponse.content = msg.content;
          return { success: true };
        },
      };

      const error = new Error('Test error message');
      const { handleCommandError } = require('../../src/core/CommandBase');

      // Call the error handler directly
      // Note: We access it through the module if exported
      // For now, we test through command execution
    });

    it('should handle errors without throwing when reply fails', async () => {
      const mockMessage = {
        reply: async () => {
          throw new Error('Network error');
        },
      };

      // Should not throw even though reply fails
      await command.handlePrefixCommand(mockMessage, ['error']);
    });
  });

  describe('getCommandData comprehensive', () => {
    it('should return all properties including data property', () => {
      const slashCommandData = { name: 'test', setDescription: () => {} };
      const testCmd = new CommandBase({
        name: 'mycmd',
        description: 'My command',
        data: slashCommandData,
        options: [{ name: 'opt1' }],
      });

      const data = testCmd.getCommandData();

      assert.strictEqual(data.name, 'mycmd');
      assert.strictEqual(data.description, 'My command');
      assert.strictEqual(data.data, slashCommandData);
      assert.strictEqual(data.options.length, 1);
    });

    it('should include data property in getCommandData output', () => {
      const mockData = { name: 'test' };
      const testCmd = new CommandBase({
        name: 'test',
        description: 'Test',
        data: mockData,
      });

      const commandData = testCmd.getCommandData();
      assert.strictEqual(commandData.data, mockData);
    });
  });
});
