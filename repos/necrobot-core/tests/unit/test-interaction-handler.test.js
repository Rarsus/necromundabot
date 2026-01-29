/**
 * InteractionHandler Unit Tests
 * Tests for Discord interaction routing and handling
 */

const assert = require('assert');

const InteractionHandler = require('../../src/core/InteractionHandler');

describe('InteractionHandler', () => {
  let mockClient;
  let mockCommandLoader;
  let handler;

  beforeEach(() => {
    mockCommandLoader = {
      executeCommand: async (name, interaction) => {
        // Mock implementation
        await interaction.editReply(`Executed ${name}`);
      },
    };

    mockClient = {
      on: () => {},
      once: () => {},
    };

    handler = new InteractionHandler(mockClient, mockCommandLoader);
  });

  describe('constructor', () => {
    it('should initialize with client and command loader', () => {
      assert.strictEqual(handler.client, mockClient);
      assert.strictEqual(handler.commandLoader, mockCommandLoader);
    });
  });

  describe('registerHandlers()', () => {
    it('should register event listeners', () => {
      let eventRegistered = false;
      mockClient.on = (eventName) => {
        if (eventName === 'interactionCreate') {
          eventRegistered = true;
        }
      };

      handler.registerHandlers();
      assert.strictEqual(eventRegistered, true);
    });

    it('should not throw errors during registration', () => {
      assert.doesNotThrow(() => {
        handler.registerHandlers();
      });
    });
  });

  describe('handleInteraction()', () => {
    it('should ignore non-command interactions', async () => {
      const mockInteraction = {
        isCommand: () => false,
        isButton: () => true,
      };

      const result = await handler.handleInteraction(mockInteraction);
      assert.strictEqual(result, undefined);
    });

    it('should defer reply for command interactions', async () => {
      let deferCalled = false;
      const mockInteraction = {
        isCommand: () => true,
        commandName: 'test',
        user: { tag: 'User#1234' },
        guild: { name: 'Test Guild' },
        deferred: false,
        replied: false,
        deferReply: async () => {
          deferCalled = true;
        },
        editReply: async () => {},
      };

      mockCommandLoader.executeCommand = async () => {};

      await handler.handleInteraction(mockInteraction);
      assert.strictEqual(deferCalled, true);
    });

    it('should execute command after defer', async () => {
      let commandExecuted = false;
      mockCommandLoader.executeCommand = async (name) => {
        if (name === 'test-cmd') {
          commandExecuted = true;
        }
      };

      const mockInteraction = {
        isCommand: () => true,
        commandName: 'test-cmd',
        user: { tag: 'User#1234' },
        guild: { name: 'Test Guild' },
        deferred: false,
        replied: false,
        deferReply: async () => {},
        editReply: async () => {},
      };

      await handler.handleInteraction(mockInteraction);
      assert.strictEqual(commandExecuted, true);
    });

    it('should pass correct command name to loader', async () => {
      let passedCommandName = null;
      mockCommandLoader.executeCommand = async (name) => {
        passedCommandName = name;
      };

      const mockInteraction = {
        isCommand: () => true,
        commandName: 'my-special-command',
        user: { tag: 'User#1234' },
        guild: { name: 'Test Guild' },
        deferred: false,
        replied: false,
        deferReply: async () => {},
        editReply: async () => {},
      };

      await handler.handleInteraction(mockInteraction);
      assert.strictEqual(passedCommandName, 'my-special-command');
    });

    it('should pass interaction to command loader', async () => {
      let receivedInteraction = null;
      mockCommandLoader.executeCommand = async (name, interaction) => {
        receivedInteraction = interaction;
      };

      const mockInteraction = {
        isCommand: () => true,
        commandName: 'test',
        user: { tag: 'User#1234' },
        guild: { name: 'Test Guild' },
        deferred: false,
        replied: false,
        deferReply: async () => {},
        editReply: async () => {},
      };

      await handler.handleInteraction(mockInteraction);
      assert.strictEqual(receivedInteraction, mockInteraction);
    });

    it('should skip defer if already deferred', async () => {
      let deferCalled = false;
      const mockInteraction = {
        isCommand: () => true,
        commandName: 'test',
        user: { tag: 'User#1234' },
        guild: { name: 'Test Guild' },
        deferred: true,
        replied: false,
        deferReply: async () => {
          deferCalled = true;
        },
        editReply: async () => {},
      };

      mockCommandLoader.executeCommand = async () => {};

      await handler.handleInteraction(mockInteraction);
      assert.strictEqual(deferCalled, false);
    });

    it('should skip defer if already replied', async () => {
      let deferCalled = false;
      const mockInteraction = {
        isCommand: () => true,
        commandName: 'test',
        user: { tag: 'User#1234' },
        guild: { name: 'Test Guild' },
        deferred: false,
        replied: true,
        deferReply: async () => {
          deferCalled = true;
        },
        editReply: async () => {},
      };

      mockCommandLoader.executeCommand = async () => {};

      await handler.handleInteraction(mockInteraction);
      assert.strictEqual(deferCalled, false);
    });

    it('should handle DM interactions correctly', async () => {
      const mockInteraction = {
        isCommand: () => true,
        commandName: 'test',
        user: { tag: 'User#1234' },
        guild: null, // DM has no guild
        deferred: false,
        replied: false,
        deferReply: async () => {},
        editReply: async () => {},
      };

      mockCommandLoader.executeCommand = async () => {};

      assert.doesNotThrow(async () => {
        await handler.handleInteraction(mockInteraction);
      });
    });
  });

  describe('error handling', () => {
    it('should catch and log command execution errors', async () => {
      let errorCaught = false;
      const originalError = console.error;
      console.error = () => {
        errorCaught = true;
      };

      mockCommandLoader.executeCommand = async () => {
        throw new Error('Command failed');
      };

      const mockInteraction = {
        isCommand: () => true,
        commandName: 'failing-command',
        user: { tag: 'User#1234' },
        guild: { name: 'Test Guild' },
        deferred: false,
        replied: false,
        deferReply: async () => {},
        editReply: async () => {},
      };

      try {
        await handler.handleInteraction(mockInteraction);
        assert.strictEqual(errorCaught, true);
      } finally {
        console.error = originalError;
      }
    });

    it('should handle defer failures gracefully', async () => {
      mockCommandLoader.executeCommand = async () => {};

      const mockInteraction = {
        isCommand: () => true,
        commandName: 'test',
        user: { tag: 'User#1234' },
        guild: { name: 'Test Guild' },
        deferred: false,
        replied: false,
        deferReply: async () => {
          throw new Error('Defer failed');
        },
        editReply: async () => {},
      };

      let errorCaught = false;
      const originalError = console.error;
      console.error = () => {
        errorCaught = true;
      };

      try {
        await handler.handleInteraction(mockInteraction);
        assert.strictEqual(errorCaught, true);
      } finally {
        console.error = originalError;
      }
    });

    it('should provide command name in error logs', async () => {
      let errorMessage = '';
      const originalError = console.error;
      console.error = (msg) => {
        errorMessage += msg;
      };

      mockCommandLoader.executeCommand = async () => {
        throw new Error('Test error');
      };

      const mockInteraction = {
        isCommand: () => true,
        commandName: 'error-command',
        user: { tag: 'User#1234' },
        guild: { name: 'Test Guild' },
        deferred: false,
        replied: false,
        deferReply: async () => {},
        editReply: async () => {},
      };

      try {
        await handler.handleInteraction(mockInteraction);
        assert(errorMessage.length > 0);
      } finally {
        console.error = originalError;
      }
    });
  });

  describe('interaction routing', () => {
    it('should route commands by exact name', async () => {
      const routedCommands = [];
      mockCommandLoader.executeCommand = async (name) => {
        routedCommands.push(name);
      };

      const interactions = [
        {
          isCommand: () => true,
          commandName: 'ping',
          user: { tag: 'User#1' },
          guild: { name: 'Guild' },
          deferred: false,
          replied: false,
          deferReply: async () => {},
          editReply: async () => {},
        },
        {
          isCommand: () => true,
          commandName: 'help',
          user: { tag: 'User#1' },
          guild: { name: 'Guild' },
          deferred: false,
          replied: false,
          deferReply: async () => {},
          editReply: async () => {},
        },
      ];

      for (const interaction of interactions) {
        await handler.handleInteraction(interaction);
      }

      assert.strictEqual(routedCommands.length, 2);
      assert.strictEqual(routedCommands[0], 'ping');
      assert.strictEqual(routedCommands[1], 'help');
    });

    it('should handle case-sensitive command names', async () => {
      let commandName = null;
      mockCommandLoader.executeCommand = async (name) => {
        commandName = name;
      };

      const mockInteraction = {
        isCommand: () => true,
        commandName: 'MyCommand',
        user: { tag: 'User#1234' },
        guild: { name: 'Test Guild' },
        deferred: false,
        replied: false,
        deferReply: async () => {},
        editReply: async () => {},
      };

      await handler.handleInteraction(mockInteraction);
      assert.strictEqual(commandName, 'MyCommand');
    });
  });

  describe('logging', () => {
    it('should log command execution', async () => {
      let logOutput = '';
      const originalLog = console.log;
      console.log = (msg) => {
        logOutput += msg;
      };

      mockCommandLoader.executeCommand = async () => {};

      const mockInteraction = {
        isCommand: () => true,
        commandName: 'test',
        user: { tag: 'TestUser#1234' },
        guild: { name: 'Test Guild' },
        deferred: false,
        replied: false,
        deferReply: async () => {},
        editReply: async () => {},
      };

      try {
        await handler.handleInteraction(mockInteraction);
        assert(logOutput.length > 0);
      } finally {
        console.log = originalLog;
      }
    });

    it('should include user info in logs', async () => {
      let logOutput = '';
      const originalLog = console.log;
      console.log = (msg) => {
        logOutput += msg;
      };

      mockCommandLoader.executeCommand = async () => {};

      const mockInteraction = {
        isCommand: () => true,
        commandName: 'test',
        user: { tag: 'SpecificUser#9999' },
        guild: { name: 'Test Guild' },
        deferred: false,
        replied: false,
        deferReply: async () => {},
        editReply: async () => {},
      };

      try {
        await handler.handleInteraction(mockInteraction);
        assert(logOutput.includes('SpecificUser#9999'));
      } finally {
        console.log = originalLog;
      }
    });

    it('should include guild info in logs', async () => {
      let logOutput = '';
      const originalLog = console.log;
      console.log = (msg) => {
        logOutput += msg;
      };

      mockCommandLoader.executeCommand = async () => {};

      const mockInteraction = {
        isCommand: () => true,
        commandName: 'test',
        user: { tag: 'User#1234' },
        guild: { name: 'My Special Guild' },
        deferred: false,
        replied: false,
        deferReply: async () => {},
        editReply: async () => {},
      };

      try {
        await handler.handleInteraction(mockInteraction);
        assert(logOutput.includes('My Special Guild'));
      } finally {
        console.log = originalLog;
      }
    });
  });

  describe('state management', () => {
    it('should preserve client reference across interactions', async () => {
      mockCommandLoader.executeCommand = async () => {};

      const interaction1 = {
        isCommand: () => true,
        commandName: 'cmd1',
        user: { tag: 'User#1' },
        guild: { name: 'Guild' },
        deferred: false,
        replied: false,
        deferReply: async () => {},
        editReply: async () => {},
      };

      const interaction2 = {
        isCommand: () => true,
        commandName: 'cmd2',
        user: { tag: 'User#2' },
        guild: { name: 'Guild' },
        deferred: false,
        replied: false,
        deferReply: async () => {},
        editReply: async () => {},
      };

      await handler.handleInteraction(interaction1);
      assert.strictEqual(handler.client, mockClient);

      await handler.handleInteraction(interaction2);
      assert.strictEqual(handler.client, mockClient);
    });

    it('should preserve command loader reference across interactions', async () => {
      mockCommandLoader.executeCommand = async () => {};

      const interaction = {
        isCommand: () => true,
        commandName: 'test',
        user: { tag: 'User#1' },
        guild: { name: 'Guild' },
        deferred: false,
        replied: false,
        deferReply: async () => {},
        editReply: async () => {},
      };

      await handler.handleInteraction(interaction);
      assert.strictEqual(handler.commandLoader, mockCommandLoader);
    });
  });
});
