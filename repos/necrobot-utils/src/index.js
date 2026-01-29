/**
 * NecroBot Utils - Main entry point
 * Exports all shared utilities, services, and helpers
 */

const DatabaseService = require('./services/DatabaseService');
const { sendSuccess, sendError, sendInfo, sendDM, sendDataEmbed } = require('./utils/helpers/response-helpers');
const { logError, handleCommandError, wrapCommandHandler } = require('./middleware/errorHandler');

module.exports = {
  // Services
  DatabaseService,

  // Response Helpers
  sendSuccess,
  sendError,
  sendInfo,
  sendDM,
  sendDataEmbed,

  // Error Handling
  logError,
  handleCommandError,
  wrapCommandHandler,
};
