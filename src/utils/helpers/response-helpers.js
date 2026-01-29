/**
 * Response Helpers - Standardized Discord message and embed formatting
 * Provides consistent patterns for sending success, error, and data messages
 */

/**
 * Send a success message
 * @param {Object} interaction - Discord interaction
 * @param {string} message - Success message text
 * @param {boolean} ephemeral - Whether message is ephemeral (default: false)
 * @returns {Promise<Message>}
 */
async function sendSuccess(interaction, message, ephemeral = false) {
  const embed = {
    color: 0x00ff00,
    description: message,
    timestamp: new Date(),
  };

  return interaction.reply({
    embeds: [embed],
    ephemeral,
  });
}

/**
 * Send an error message
 * @param {Object} interaction - Discord interaction
 * @param {string} message - Error message text
 * @param {boolean} ephemeral - Whether message is ephemeral (default: true)
 * @returns {Promise<Message>}
 */
async function sendError(interaction, message, ephemeral = true) {
  const embed = {
    color: 0xff0000,
    description: message,
    timestamp: new Date(),
  };

  return interaction.reply({
    embeds: [embed],
    ephemeral,
  });
}

/**
 * Send an info message
 * @param {Object} interaction - Discord interaction
 * @param {string} title - Info title
 * @param {string} description - Info description
 * @param {boolean} ephemeral - Whether message is ephemeral (default: false)
 * @returns {Promise<Message>}
 */
async function sendInfo(interaction, title, description, ephemeral = false) {
  const embed = {
    color: 0x0099ff,
    title,
    description,
    timestamp: new Date(),
  };

  return interaction.reply({
    embeds: [embed],
    ephemeral,
  });
}

/**
 * Send a direct message to a user
 * @param {User} user - Discord user
 * @param {string} message - Message text
 * @returns {Promise<Message>}
 */
async function sendDM(user, message) {
  try {
    return await user.send(message);
  } catch (error) {
    throw new Error(`Failed to send DM to ${user.username}: ${error.message}`);
  }
}

/**
 * Send a data embed (generic embed for displaying data)
 * @param {Object} interaction - Discord interaction
 * @param {string} title - Embed title
 * @param {Array<Object>} fields - Array of { name, value, inline } objects
 * @param {number} color - Embed color (default: 0x0099ff)
 * @param {boolean} ephemeral - Whether message is ephemeral (default: false)
 * @returns {Promise<Message>}
 */
async function sendDataEmbed(interaction, title, fields, color = 0x0099ff, ephemeral = false) {
  const embed = {
    color,
    title,
    fields: fields || [],
    timestamp: new Date(),
  };

  return interaction.reply({
    embeds: [embed],
    ephemeral,
  });
}

module.exports = {
  sendSuccess,
  sendError,
  sendInfo,
  sendDM,
  sendDataEmbed,
};
