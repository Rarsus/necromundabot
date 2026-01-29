/**
 * Error Handler Middleware - Centralized error handling and logging
 * Provides consistent error catching, logging, and user feedback
 */

/**
 * Log error with context
 * @param {Error} error - Error object
 * @param {string} context - Error context/location
 * @param {Object} metadata - Additional metadata
 * @returns {void}
 */
function logError(error, context, metadata = {}) {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    message: error.message,
    stack: error.stack,
    metadata,
  };

  console.error('ERROR:', JSON.stringify(errorInfo, null, 2));
}

/**
 * Handle command error with user feedback
 * @param {Object} interaction - Discord interaction
 * @param {Error} error - Error object
 * @param {string} commandName - Command name
 * @returns {Promise<void>}
 */
async function handleCommandError(interaction, error, commandName) {
  logError(error, `Command: ${commandName}`);

  const errorMessage = error.message || 'An unexpected error occurred';
  const response = {
    content: `❌ Error in \`${commandName}\`: ${errorMessage}`,
    ephemeral: true,
  };

  try {
    if (interaction.deferred) {
      await interaction.editReply(response);
    } else if (interaction.replied) {
      await interaction.followUp(response);
    } else {
      await interaction.reply(response);
    }
  } catch (replyError) {
    logError(replyError, 'handleCommandError - Reply Failed');
  }
}

/**
 * Wrap async command handler with error handling
 * @param {Function} handler - Async handler function
 * @returns {Function} Wrapped handler
 */
function wrapCommandHandler(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      const [interaction, commandName] = args;
      await handleCommandError(interaction, error, commandName);
      throw error;
    }
  };
}

module.exports = {
  logError,
  handleCommandError,
  wrapCommandHandler,
};
