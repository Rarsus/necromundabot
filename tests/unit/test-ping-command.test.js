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
});
