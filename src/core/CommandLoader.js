/**
 * Command Loader - Dynamically loads and registers commands
 * Watches for command files and automatically registers them with Discord
 */

const fs = require('fs');
const path = require('path');

const { Collection } = require('discord.js');

class CommandLoader {
  constructor(client) {
    this.client = client;
    this.commands = new Collection();
    this.commandsByName = new Map();
  }

  /**
   * Load all commands from the commands directory
   * @param {string} commandsPath - Path to commands directory
   * @returns {Collection} Loaded commands
   */
  loadCommands(commandsPath) {
    console.log(`📁 Loading commands from ${commandsPath}...`);

    if (!fs.existsSync(commandsPath)) {
      console.warn(`⚠️  Commands directory not found: ${commandsPath}`);
      return this.commands;
    }

    const categories = fs.readdirSync(commandsPath);

    for (const category of categories) {
      const categoryPath = path.join(commandsPath, category);

      // Skip files, only process directories
      if (!fs.statSync(categoryPath).isDirectory()) {
        continue;
      }

      console.log(`  📂 Category: ${category}`);
      const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

      for (const file of files) {
        const filePath = path.join(categoryPath, file);

        try {
          const command = require(filePath);

          // Validate command structure
          if (!this.validateCommand(command)) {
            console.warn(`    ⚠️  Invalid command structure: ${file}`);
            continue;
          }

          const commandName = command.data.name;
          this.commands.set(commandName, command);
          this.commandsByName.set(commandName, {
            path: filePath,
            category,
          });

          console.log(`    ✅ Loaded: ${commandName} (${file})`);
        } catch (error) {
          console.error(`    ❌ Error loading command ${file}:`, error.message);
        }
      }
    }

    console.log(
      `\n✅ Loaded ${this.commands.size} command(s) from ${categories.length} categor(y/ies)\n`
    );
    return this.commands;
  }

  /**
   * Validate command structure
   * @param {object} command - Command object to validate
   * @returns {boolean} True if command is valid
   */
  validateCommand(command) {
    // Command must export an object with data property
    if (!command || typeof command !== 'object') {
      return false;
    }

    // Must have name property
    if (typeof command.name !== 'string') {
      return false;
    }

    // Must have description property
    if (typeof command.description !== 'string') {
      return false;
    }

    // Must have data property (SlashCommandBuilder)
    if (!command.data) {
      return false;
    }

    // Must have executeInteraction method
    if (typeof command.executeInteraction !== 'function') {
      return false;
    }

    return true;
  }

  /**
   * Get all slash command data for Discord registration
   * @returns {Array} Array of SlashCommandBuilder data
   */
  getSlashCommandData() {
    return this.commands.map(command => command.data.toJSON?.() || command.data);
  }

  /**
   * Execute a command by name
   * @param {string} commandName - Command name
   * @param {CommandInteraction} interaction - Discord interaction
   * @returns {Promise<void>}
   */
  async executeCommand(commandName, interaction) {
    const command = this.commands.get(commandName);

    if (!command) {
      const error = new Error(`Command not found: ${commandName}`);
      console.error(`❌ ${error.message}`);
      throw error;
    }

    // Defer reply if not already deferred or replied
    if (!interaction.deferred && !interaction.replied && interaction.deferReply) {
      await interaction.deferReply();
    }

    try {
      await command.executeInteraction(interaction);
    } catch (error) {
      console.error(`❌ Error executing command ${commandName}:`, error);
      const errorReply = {
        content: `❌ Error executing command \`${commandName}\`: ${error.message}`,
        ephemeral: true,
      };

      // Handle mock interactions and real interactions
      if (interaction.replied && typeof interaction.followUp === 'function') {
        await interaction.followUp(errorReply);
      } else if (interaction.deferred && typeof interaction.editReply === 'function') {
        await interaction.editReply(errorReply);
      } else if (interaction.reply && typeof interaction.reply === 'function') {
        await interaction.reply(errorReply);
      }

      throw error;
    }
  }

  /**
   * Get command info
   * @param {string} commandName - Command name
   * @returns {object} Command info
   */
  getCommandInfo(commandName) {
    return this.commandsByName.get(commandName);
  }

  /**
   * Get all commands by category
   * @returns {object} Commands organized by category
   */
  getCommandsByCategory() {
    const categories = {};

    for (const [commandName, info] of this.commandsByName) {
      if (!categories[info.category]) {
        categories[info.category] = [];
      }
      categories[info.category].push(commandName);
    }

    return categories;
  }
}

module.exports = CommandLoader;
