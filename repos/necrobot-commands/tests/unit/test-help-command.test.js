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
      assert.strictEqual(
        typeof helpCommand.name,
        'string',
        'Command should have name property as string'
      );
      assert.strictEqual(helpCommand.name, 'help', 'Name should be "help"');
    });

    it('should have required description property (CommandLoader requirement)', () => {
      assert.strictEqual(
        typeof helpCommand.description,
        'string',
        'Command should have description property as string'
      );
      assert.ok(
        helpCommand.description.length > 0,
        'Description should not be empty'
      );
    });

    it('should have required data property (CommandLoader requirement)', () => {
      assert(helpCommand.data, 'Command should have SlashCommandBuilder data');
      assert(
        typeof helpCommand.data.name === 'string',
        'Data should have name'
      );
      assert.strictEqual(
        helpCommand.data.name,
        'help',
        'Data name should be help'
      );
    });

    it('should have required executeInteraction method (CommandLoader requirement)', () => {
      assert(
        typeof helpCommand.executeInteraction === 'function',
        'Command should have executeInteraction method'
      );
    });
  });

  describe('discord.js integration', () => {
    it('should have valid SlashCommandBuilder data', () => {
      assert(helpCommand.data, 'Command should have data');
      assert(
        typeof helpCommand.data.name === 'string',
        'Data should have name'
      );
      assert.strictEqual(
        helpCommand.data.name,
        'help',
        'Data name should be help'
      );
      assert(
        typeof helpCommand.data.description === 'string',
        'Data should have description'
      );
    });
  });

  describe('methods', () => {
    it('should have executeInteraction method', () => {
      assert(
        typeof helpCommand.executeInteraction === 'function',
        'Command should have executeInteraction method'
      );
    });

    it('executeInteraction should be an async function', () => {
      const method = helpCommand.executeInteraction;
      assert.strictEqual(
        method.constructor.name,
        'AsyncFunction',
        'executeInteraction should be async'
      );
    });

    it('executeInteraction should accept interaction parameter', () => {
      const method = helpCommand.executeInteraction;
      assert.strictEqual(
        method.length,
        1,
        'executeInteraction should accept 1 parameter'
      );
    });
  });
});
