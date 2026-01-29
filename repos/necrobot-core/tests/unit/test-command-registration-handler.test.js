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
              return new Map([['cmd-1', { name: 'gang', description: 'Gang command' }]]);
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

  describe('guild-specific command registration', () => {
    it('should register commands to specific guild', async () => {
      const commandData = [
        {
          name: 'guild-command',
          description: 'Guild-specific command',
        },
      ];

      await handler.registerCommands(commandData, 'guild-123', null);

      assert.ok(capturedData.guild, 'Should capture guild registration data');
      assert.strictEqual(capturedData.guild.length, 1, 'Should register command to guild');
    });

    it('should not register globally when guild ID specified', async () => {
      const commandData = [
        {
          name: 'guild-command',
          description: 'Guild-specific command',
        },
      ];

      await handler.registerCommands(commandData, 'guild-123', null);

      assert.strictEqual(capturedData.global, null, 'Should not register globally when guild specified');
    });

    it('should handle guild fetch failure gracefully', async () => {
      const failingClient = {
        guilds: {
          fetch: async () => {
            throw new Error('Guild not found');
          },
        },
        application: {
          commands: {
            set: async () => {},
          },
        },
      };

      const failingHandler = new CommandRegistrationHandler(failingClient);
      const commandData = [
        {
          name: 'test-command',
          description: 'Test',
        },
      ];

      try {
        await failingHandler.registerCommands(commandData, 'invalid-guild', null);
        assert.fail('Should throw error on guild fetch failure');
      } catch (error) {
        assert.ok(error.message.includes('Guild not found'), 'Should throw appropriate error');
      }
    });

    it('should register multiple commands to guild', async () => {
      const commandData = [
        {
          name: 'guild-command-1',
          description: 'First guild command',
        },
        {
          name: 'guild-command-2',
          description: 'Second guild command',
        },
        {
          name: 'guild-command-3',
          description: 'Third guild command',
        },
      ];

      await handler.registerCommands(commandData, 'guild-123', null);

      assert.strictEqual(capturedData.guild.length, 3, 'Should register all 3 commands');
    });

    it('should handle empty command array for guild', async () => {
      const commandData = [];

      await handler.registerCommands(commandData, 'guild-123', null);

      // When empty array is passed, guild fetch might not be called
      // or if called, capturedData.guild would be an empty array
      assert.ok(
        capturedData.guild === null || Array.isArray(capturedData.guild),
        'Should handle empty command array gracefully'
      );
    });
  });

  describe('guild vs global registration', () => {
    it('should register to guild when guildId provided', async () => {
      const commandData = [{ name: 'test', description: 'test' }];

      await handler.registerCommands(commandData, 'guild-123', null);

      assert.ok(capturedData.guild, 'Should register to guild');
      assert.strictEqual(capturedData.global, null, 'Should not register globally');
    });

    it('should register globally when no guildId provided', async () => {
      const commandData = [{ name: 'test', description: 'test' }];

      await handler.registerCommands(commandData, null, null);

      assert.ok(capturedData.global, 'Should register globally');
    });

    it('should register to guild first, then globally', async () => {
      const commandData = [{ name: 'test', description: 'test' }];

      await handler.registerCommands(commandData, 'guild-123', null);
      await handler.registerCommands(commandData, null, null);

      assert.ok(capturedData.guild, 'Should have guild registration');
      assert.ok(capturedData.global, 'Should also have global registration');
    });
  });

  describe('error scenarios', () => {
    it('should handle API error during global registration', async () => {
      const failingClient = {
        guilds: {
          cache: { size: 0 },
          fetch: async () => {},
        },
        application: {
          commands: {
            set: async () => {
              throw new Error('API Error: Invalid Request');
            },
          },
        },
      };

      const failingHandler = new CommandRegistrationHandler(failingClient);
      const commandData = [{ name: 'test', description: 'test' }];

      try {
        await failingHandler.registerCommands(commandData);
        assert.fail('Should throw error on API failure');
      } catch (error) {
        assert.ok(error.message.includes('API Error'), 'Should throw API error');
      }
    });

    it('should handle network timeout during registration', async () => {
      const timeoutClient = {
        guilds: {
          cache: { size: 0 },
          fetch: async () => {},
        },
        application: {
          commands: {
            set: async () => {
              throw new Error('ECONNREFUSED');
            },
          },
        },
      };

      const timeoutHandler = new CommandRegistrationHandler(timeoutClient);
      const commandData = [{ name: 'test', description: 'test' }];

      try {
        await timeoutHandler.registerCommands(commandData);
        assert.fail('Should throw error on timeout');
      } catch (error) {
        assert.ok(error.message.includes('ECONNREFUSED'), 'Should throw connection error');
      }
    });

    it('should handle missing access permission', async () => {
      const noAccessClient = {
        guilds: {
          cache: { size: 0 },
          fetch: async () => {},
        },
        application: {
          commands: {
            set: async () => {
              throw new Error('Missing Access');
            },
          },
        },
      };

      const noAccessHandler = new CommandRegistrationHandler(noAccessClient);
      const commandData = [{ name: 'test', description: 'test' }];

      try {
        await noAccessHandler.registerCommands(commandData);
        assert.fail('Should throw error on missing access');
      } catch (error) {
        assert.ok(error.message.includes('Missing Access'), 'Should throw access error');
      }
    });

    it('should handle invalid form body', async () => {
      const invalidClient = {
        guilds: {
          cache: { size: 0 },
          fetch: async () => {},
        },
        application: {
          commands: {
            set: async () => {
              throw new Error('Invalid Form Body');
            },
          },
        },
      };

      const invalidHandler = new CommandRegistrationHandler(invalidClient);
      const commandData = [{ name: 'test', description: 'test' }];

      try {
        await invalidHandler.registerCommands(commandData);
        assert.fail('Should throw error on invalid data');
      } catch (error) {
        assert.ok(error.message.includes('Invalid Form Body'), 'Should throw form error');
      }
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

  describe('guild-specific registration (uncovered lines 56-80)', () => {
    it('should register commands to specific guild', async () => {
      const guildId = 'guild-12345';
      const commandData = [{ name: 'guild-cmd', description: 'Guild specific' }];

      await handler.registerCommands(commandData, guildId);

      // Verify guild fetch was triggered
      assert.strictEqual(capturedData.guild, commandData);
    });

    it('should NOT register commands globally when guild specified', async () => {
      const guildId = 'guild-specific';
      const commandData = [{ name: 'guild-only', description: 'Only for this guild' }];

      await handler.registerCommands(commandData, guildId);

      // Global commands should be null (not set)
      assert.strictEqual(capturedData.global, null);
      // Guild commands should be set
      assert.strictEqual(capturedData.guild, commandData);
    });

    it('should register multiple commands to guild', async () => {
      const guildId = 'multi-guild';
      const commandData = [
        { name: 'cmd1', description: 'First' },
        { name: 'cmd2', description: 'Second' },
        { name: 'cmd3', description: 'Third' },
      ];

      await handler.registerCommands(commandData, guildId);

      assert.strictEqual(capturedData.guild.length, 3);
    });

    it('should handle guild fetch API errors', async () => {
      mockClient.guilds.fetch = async (guildId) => {
        const error = new Error('Could not resolve to a User');
        error.code = 10013;
        throw error;
      };

      const commandData = [{ name: 'test', description: 'test' }];

      try {
        await handler.registerCommands(commandData, 'bad-guild');
        assert.fail('Should throw guild not found error');
      } catch (error) {
        assert.ok(error.message.includes('Could not resolve'));
      }
    });

    it('should handle missing guild permissions', async () => {
      mockClient.guilds.fetch = async (guildId) => {
        const error = new Error('Missing Permissions');
        error.code = 50013;
        throw error;
      };

      const commandData = [{ name: 'test', description: 'test' }];

      try {
        await handler.registerCommands(commandData, 'no-perms-guild');
        assert.fail('Should throw permissions error');
      } catch (error) {
        assert.ok(error.message.includes('Missing Permissions'));
      }
    });

    it('should handle guild command API errors', async () => {
      mockClient.guilds.fetch = async (guildId) => {
        return {
          id: guildId,
          commands: {
            set: async () => {
              throw new Error('Invalid Form Body');
            },
          },
        };
      };

      const commandData = [{ name: 'test', description: 'test' }];

      try {
        await handler.registerCommands(commandData, 'error-guild');
        assert.fail('Should throw API error');
      } catch (error) {
        assert.ok(error.message.includes('Invalid Form Body'));
      }
    });
  });

  describe('global vs guild registration comparison', () => {
    it('should register globally when guildId is null', async () => {
      const commandData = [{ name: 'global-cmd', description: 'Global' }];

      await handler.registerCommands(commandData, null);

      assert.strictEqual(capturedData.global, commandData);
      assert.strictEqual(capturedData.guild, null);
    });

    it('should register globally when guildId is undefined', async () => {
      const commandData = [{ name: 'global-cmd', description: 'Global' }];

      await handler.registerCommands(commandData, undefined);

      assert.strictEqual(capturedData.global, commandData);
      assert.strictEqual(capturedData.guild, null);
    });

    it('should register globally when guildId is empty string', async () => {
      const commandData = [{ name: 'global-cmd', description: 'Global' }];

      await handler.registerCommands(commandData, '');

      // Empty string is falsy, so should register globally
      assert.strictEqual(capturedData.global, commandData);
    });

    it('should not mix guild and global registrations', async () => {
      const guildData = [{ name: 'guild-cmd', description: 'Guild' }];

      const globalData = [{ name: 'global-cmd', description: 'Global' }];

      // Register to guild first
      await handler.registerCommands(guildData, 'guild-123');
      assert.strictEqual(capturedData.guild, guildData);
      assert.strictEqual(capturedData.global, null);

      // Reset for next test
      capturedData.guild = null;
      capturedData.global = null;

      // Then register globally
      await handler.registerCommands(globalData);
      assert.strictEqual(capturedData.global, globalData);
      assert.strictEqual(capturedData.guild, null);
    });
  });

  describe('edge cases for guild registration', () => {
    it('should handle guild with no permissions to register commands', async () => {
      mockClient.guilds.fetch = async (guildId) => {
        return {
          id: guildId,
          commands: {
            set: async () => {
              const error = new Error('Missing Access');
              error.code = 50001;
              throw error;
            },
          },
        };
      };

      const commandData = [{ name: 'test', description: 'test' }];

      try {
        await handler.registerCommands(commandData, 'restricted-guild');
        assert.fail('Should throw access error');
      } catch (error) {
        assert.ok(error.message.includes('Missing Access'));
      }
    });

    it('should handle very large number of commands to guild', async () => {
      const largeCommandData = [];
      for (let i = 0; i < 100; i++) {
        largeCommandData.push({
          name: `cmd-${i}`,
          description: `Command ${i}`,
        });
      }

      await handler.registerCommands(largeCommandData, 'large-guild');
      assert.strictEqual(capturedData.guild.length, 100);
    });

    it('should preserve command order during guild registration', async () => {
      const orderedCommands = [
        { name: 'alpha', description: 'First' },
        { name: 'beta', description: 'Second' },
        { name: 'gamma', description: 'Third' },
      ];

      await handler.registerCommands(orderedCommands, 'ordered-guild');

      assert.strictEqual(capturedData.guild[0].name, 'alpha');
      assert.strictEqual(capturedData.guild[1].name, 'beta');
      assert.strictEqual(capturedData.guild[2].name, 'gamma');
    });
  });
});
