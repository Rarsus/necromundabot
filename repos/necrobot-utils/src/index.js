/**
 * NecroBot Utils - Main entry point
 * Exports all shared utilities, services, and helpers
 */

const DatabaseService = require('./services/DatabaseService');
const DashboardAuthService = require('./services/DashboardAuthService');
const { sendSuccess, sendError, sendInfo, sendDM, sendDataEmbed } = require('./utils/helpers/response-helpers');
const { logError, handleCommandError, wrapCommandHandler } = require('./middleware/errorHandler');

module.exports = {
  // Services
  DatabaseService,
  DashboardAuthService,

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
