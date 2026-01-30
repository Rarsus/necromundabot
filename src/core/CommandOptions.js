/**
 * CommandOptions - Unified command options builder for slash and prefix commands
 * Provides single source of truth for command options
 */

const { SlashCommandBuilder } = require('discord.js');

/**
 * Build command options for both slash and prefix commands
 * @param {string} commandName - Command name (e.g., 'gang-create')
 * @param {string} description - Command description
 * @param {Array<Object>} optionDefinitions - Array of option definitions
 * @returns {Object} { data: SlashCommandBuilder, options: optionDefinitions }
 */
function buildCommandOptions(commandName, description, optionDefinitions = []) {
  // Create SlashCommandBuilder for Discord slash commands
  const data = new SlashCommandBuilder().setName(commandName).setDescription(description);

  // Add options to SlashCommandBuilder
  optionDefinitions.forEach((opt) => {
    if (opt.type === 'string') {
      data.addStringOption((option) =>
        option
          .setName(opt.name)
          .setDescription(opt.description)
          .setRequired(opt.required || false)
      );
    } else if (opt.type === 'number') {
      data.addNumberOption((option) =>
        option
          .setName(opt.name)
          .setDescription(opt.description)
          .setRequired(opt.required || false)
      );
    } else if (opt.type === 'boolean') {
      data.addBooleanOption((option) =>
        option
          .setName(opt.name)
          .setDescription(opt.description)
          .setRequired(opt.required || false)
      );
    } else if (opt.type === 'user') {
      data.addUserOption((option) =>
        option
          .setName(opt.name)
          .setDescription(opt.description)
          .setRequired(opt.required || false)
      );
    } else if (opt.type === 'channel') {
      data.addChannelOption((option) =>
        option
          .setName(opt.name)
          .setDescription(opt.description)
          .setRequired(opt.required || false)
      );
    } else if (opt.type === 'role') {
      data.addRoleOption((option) =>
        option
          .setName(opt.name)
          .setDescription(opt.description)
          .setRequired(opt.required || false)
      );
    }
  });

  // Return builder and option definitions for prefix command usage
  return {
    data,
    options: optionDefinitions,
  };
}

/**
 * Extract option values from interaction
 * @param {CommandInteraction} interaction - Discord interaction
 * @param {Array<Object>} optionDefinitions - Array of option definitions
 * @returns {Object} Object with extracted option values
 */
function extractOptions(interaction, optionDefinitions) {
  const extracted = {};

  optionDefinitions.forEach((opt) => {
    if (opt.type === 'string') {
      extracted[opt.name] = interaction.options.getString(opt.name);
    } else if (opt.type === 'number') {
      extracted[opt.name] = interaction.options.getNumber(opt.name);
    } else if (opt.type === 'boolean') {
      extracted[opt.name] = interaction.options.getBoolean(opt.name);
    } else if (opt.type === 'user') {
      extracted[opt.name] = interaction.options.getUser(opt.name);
    } else if (opt.type === 'channel') {
      extracted[opt.name] = interaction.options.getChannel(opt.name);
    } else if (opt.type === 'role') {
      extracted[opt.name] = interaction.options.getRole(opt.name);
    }
  });

  return extracted;
}

module.exports = buildCommandOptions;
module.exports.extractOptions = extractOptions;
