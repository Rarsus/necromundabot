/**
 * CommandRegistrationHandler Unit Tests
 * Tests for Discord API command registration
 */

const assert = require('assert');
const CommandRegistrationHandler = require('../../src/core/CommandRegistrationHandler');

describe('CommandRegistrationHandler', () => {
  let mockClient;
  let handler;
  let capturedData;

  beforeEach(() => {
    capturedData = {
      guild: null,
      global: null,
    };

    mockClient = {
      guilds: {
        cache: {
          size: 2,
        },
        fetch: async (guildId) => {
          return {
            id: guildId,
            commands: {
              set: async (commands) => {
                capturedData.guild = commands;
              },
            },
          };
        },
      },
      application: {
        commands: {
          set: async (commands) => {
            capturedData.global = commands;
          },
        },
      },
      user: {
        tag: 'TestBot#0001',
      },
    };

    handler = new CommandRegistrationHandler(mockClient);
  });

  describe('constructor', () => {
    it('should initialize with client reference', () => {
      assert.strictEqual(handler.client, mockClient);
    });
  });

  describe('registerCommands()', () => {
    it('should handle empty command data gracefully', async () => {
      const result = await handler.registerCommands([]);
      assert.strictEqual(result, undefined);
    });

    it('should handle null command data gracefully', async () => {
      const result = await handler.registerCommands(null);
      assert.strictEqual(result, undefined);
    });

    it('should register commands to specific guild', async () => {
      const commandData = [
        {
          name: 'test-ping',
          description: 'Test ping command',
        },
      ];

      const guildId = 'test-guild-123';
      await handler.registerCommands(commandData, guildId);

      // Verify guild.commands.set was called
      assert.strictEqual(capturedData.guild, commandData);
    });

    it('should register commands globally when no guild specified', async () => {
      const commandData = [
        {
          name: 'test-global',
          description: 'Test global command',
        },
      ];

      await handler.registerCommands(commandData);

      // Verify application.commands.set was called
      assert.strictEqual(capturedData.global, commandData);
    });

    it('should throw error when guild fetch fails', async () => {
      mockClient.guilds.fetch = async () => {
        throw new Error('Guild not found');
      };

      const commandData = [{ name: 'test', description: 'test' }];

      try {
        await handler.registerCommands(commandData, 'invalid-guild');
        assert.fail('Should have thrown error');
      } catch (error) {
        assert(error.message.includes('not found'));
      }
    });

    it('should throw error when API call fails', async () => {
      mockClient.application.commands.set = async () => {
        throw new Error('API Error: Invalid Request');
      };

      const commandData = [{ name: 'test', description: 'test' }];

      try {
        await handler.registerCommands(commandData);
        assert.fail('Should have thrown error');
      } catch (error) {
        assert(error.message.includes('API Error'));
      }
    });

    it('should include multiple commands in registration', async () => {
      const commandData = [
        { name: 'ping', description: 'Ping command' },
        { name: 'help', description: 'Help command' },
        { name: 'info', description: 'Info command' },
      ];

      await handler.registerCommands(commandData);

      assert.strictEqual(capturedData.global.length, 3);
    });
  });

  describe('getRegisteredCommands()', () => {
    it('should fetch guild commands when guild ID provided', async () => {
      // Mock guild commands
      mockClient.guilds.fetch = async () => {
        return {
          commands: {
            fetch: async () => {
              return new Map([
                ['cmd-1', { name: 'test1', id: 'cmd-1' }],
                ['cmd-2', { name: 'test2', id: 'cmd-2' }],
              ]);
            },
          },
        };
      };

      const commands = await handler.getRegisteredCommands('guild-123');
      assert(commands instanceof Map || Array.isArray(commands));
    });

    it('should fetch global commands when no guild ID provided', async () => {
      mockClient.application.commands.fetch = async () => {
        return new Map([
          ['cmd-1', { name: 'global1', id: 'cmd-1' }],
          ['cmd-2', { name: 'global2', id: 'cmd-2' }],
        ]);
      };

      const commands = await handler.getRegisteredCommands();
      assert(commands instanceof Map || Array.isArray(commands));
    });

    it('should throw error on fetch failure', async () => {
      mockClient.application.commands.fetch = async () => {
        throw new Error('Fetch failed');
      };

      try {
        await handler.getRegisteredCommands();
        assert.fail('Should have thrown error');
      } catch (error) {
        assert(error.message.includes('Fetch failed'));
      }
    });
  });

  describe('logRegisteredCommands()', () => {
    it('should log commands with formatting', async () => {
      mockClient.application.commands.fetch = async () => {
        return new Map([
          ['cmd-1', { name: 'ping', description: 'Ping command' }],
          ['cmd-2', { name: 'help', description: 'Help command' }],
        ]);
      };

      let logOutput = '';
      const originalLog = console.log;
      console.log = (msg) => {
        logOutput += msg;
      };

      try {
        await handler.logRegisteredCommands();
        assert(logOutput.length > 0);
      } finally {
        console.log = originalLog;
      }
    });

    it('should log guild commands when guild ID provided', async () => {
      mockClient.guilds.fetch = async () => {
        return {
          commands: {
            fetch: async () => {
              return new Map([
                ['cmd-1', { name: 'gang', description: 'Gang command' }],
              ]);
            },
          },
        };
      };

      let logOutput = '';
      const originalLog = console.log;
      console.log = (msg) => {
        logOutput += msg;
      };

      try {
        await handler.logRegisteredCommands('guild-123');
        assert(logOutput.length > 0);
      } finally {
        console.log = originalLog;
      }
    });

    it('should handle empty command list', async () => {
      mockClient.application.commands.fetch = async () => {
        return new Map();
      };

      let logOutput = '';
      const originalLog = console.log;
      console.log = (msg) => {
        logOutput += msg;
      };

      try {
        await handler.logRegisteredCommands();
        assert(logOutput.length > 0);
      } finally {
        console.log = originalLog;
      }
    });

    it('should handle fetch errors gracefully', async () => {
      mockClient.application.commands.fetch = async () => {
        throw new Error('Cannot fetch');
      };

      let errorLogged = false;
      const originalError = console.error;
      console.error = () => {
        errorLogged = true;
      };

      try {
        await handler.logRegisteredCommands();
        assert.strictEqual(errorLogged, true);
      } finally {
        console.error = originalError;
      }
    });
  });

  describe('error handling', () => {
    it('should handle network errors during registration', async () => {
      mockClient.application.commands.set = async () => {
        throw new Error('ECONNREFUSED');
      };

      const commandData = [{ name: 'test', description: 'test' }];

      try {
        await handler.registerCommands(commandData);
        assert.fail('Should have thrown error');
      } catch (error) {
        assert(error instanceof Error);
      }
    });

    it('should handle permission errors during registration', async () => {
      mockClient.application.commands.set = async () => {
        throw new Error('Missing Access');
      };

      const commandData = [{ name: 'test', description: 'test' }];

      try {
        await handler.registerCommands(commandData);
        assert.fail('Should have thrown error');
      } catch (error) {
        assert(error.message.includes('Missing Access'));
      }
    });

    it('should provide meaningful error messages', async () => {
      mockClient.application.commands.set = async () => {
        throw new Error('Invalid Form Body');
      };

      const commandData = [{ name: 'invalid name!', description: 'test' }];

      try {
        await handler.registerCommands(commandData);
        assert.fail('Should have thrown error');
      } catch (error) {
        assert(error.message.length > 0);
      }
    });
  });

  describe('registration scope', () => {
    it('should use guild scope when GUILD_ID provided', async () => {
      let guildApiCalled = false;
      mockClient.guilds.fetch = async () => {
        guildApiCalled = true;
        return {
          commands: {
            set: async () => {},
          },
        };
      };

      const commandData = [{ name: 'test', description: 'test' }];
      await handler.registerCommands(commandData, 'guild-123');

      assert.strictEqual(guildApiCalled, true);
    });

    it('should use global scope when GUILD_ID not provided', async () => {
      let globalApiCalled = false;
      mockClient.application.commands.set = async () => {
        globalApiCalled = true;
      };

      const commandData = [{ name: 'test', description: 'test' }];
      await handler.registerCommands(commandData);

      assert.strictEqual(globalApiCalled, true);
    });
  });

  describe('command data validation', () => {
    it('should accept valid command data structure', async () => {
      const commandData = [
        {
          name: 'valid-command',
          description: 'Valid command description',
          options: [],
        },
      ];

      await handler.registerCommands(commandData);
      assert.strictEqual(capturedData.global.length, 1);
    });

    it('should handle commands with options', async () => {
      const commandData = [
        {
          name: 'command-with-options',
          description: 'Command with options',
          options: [
            {
              name: 'parameter',
              type: 3,
              description: 'A parameter',
              required: true,
            },
          ],
        },
      ];

      await handler.registerCommands(commandData);
      assert.strictEqual(capturedData.global.length, 1);
    });
  });
});
