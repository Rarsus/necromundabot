/**
 * Command Registration Handler
 * Manages registration of slash commands with Discord API
 */

class CommandRegistrationHandler {
  constructor(client) {
    this.client = client;
  }

  /**
   * Register slash commands with Discord
   * @param {Array} commandData - Array of slash command data
   * @param {string} guildId - Optional guild ID for faster registration during development
   * @returns {Promise<void>}
   */
  async registerCommands(commandData, guildId = null) {
    if (!commandData || commandData.length === 0) {
      console.log('⚠️  No commands to register');
      return;
    }

    try {
      if (guildId) {
        // Register to specific guild (instant registration, useful for testing)
        console.log(`📤 Registering ${commandData.length} command(s) to guild ${guildId}...`);
        const guild = await this.client.guilds.fetch(guildId);
        await guild.commands.set(commandData);
        console.log(`✅ Commands registered to guild (${guildId})\n`);
      } else {
        // Register globally (takes up to 1 hour to propagate)
        console.log(`📤 Registering ${commandData.length} command(s) globally...`);
        await this.client.application.commands.set(commandData);
        console.log('✅ Commands registered globally (may take up to 1 hour to appear)\n');
      }
    } catch (error) {
      console.error('❌ Error registering commands:', error);
      throw error;
    }
  }

  /**
   * Get currently registered commands from Discord
   * @param {string} guildId - Optional guild ID
   * @returns {Promise<Collection>} Registered commands
   */
  async getRegisteredCommands(guildId = null) {
    try {
      if (guildId) {
        const guild = await this.client.guilds.fetch(guildId);
        return guild.commands.fetch();
      } else {
        return this.client.application.commands.fetch();
      }
    } catch (error) {
      console.error('❌ Error fetching registered commands:', error);
      return null;
    }
  }

  /**
   * Clear all registered commands
   * @param {string} guildId - Optional guild ID
   * @returns {Promise<void>}
   */
  async clearCommands(guildId = null) {
    try {
      if (guildId) {
        console.log(`🗑️  Clearing commands from guild ${guildId}...`);
        const guild = await this.client.guilds.fetch(guildId);
        await guild.commands.set([]);
        console.log('✅ Commands cleared from guild\n');
      } else {
        console.log('🗑️  Clearing global commands...');
        await this.client.application.commands.set([]);
        console.log('✅ Global commands cleared\n');
      }
    } catch (error) {
      console.error('❌ Error clearing commands:', error);
      throw error;
    }
  }

  /**
   * Log registered commands info
   * @param {string} guildId - Optional guild ID
   * @returns {Promise<void>}
   */
  async logRegisteredCommands(guildId = null) {
    try {
      const commands = await this.getRegisteredCommands(guildId);

      if (!commands || commands.size === 0) {
        console.log('ℹ️  No commands registered');
        return;
      }

      console.log(`\n📋 Registered Commands (${commands.size} total):`);
      commands.forEach(command => {
        console.log(`   - /${command.name}: ${command.description}`);
      });
      console.log();
    } catch (error) {
      console.error('❌ Error logging commands:', error);
    }
  }
}

module.exports = CommandRegistrationHandler;
