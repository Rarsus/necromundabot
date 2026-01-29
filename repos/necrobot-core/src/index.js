/**
 * NecroBot Core - Main entry point
 * Exports command base classes, core functionality, and bot components
 */

const CommandBase = require('./core/CommandBase');
const buildCommandOptions = require('./core/CommandOptions');
const CommandLoader = require('./core/CommandLoader');
const CommandRegistrationHandler = require('./core/CommandRegistrationHandler');
const InteractionHandler = require('./core/InteractionHandler');

module.exports = {
  // Command Classes & Utilities
  CommandBase,
  buildCommandOptions,

  // Command Management
  CommandLoader,
  CommandRegistrationHandler,
  InteractionHandler,
};
