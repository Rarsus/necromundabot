/**
 * CommandBase - Base class for all NecroBot commands
 * Provides automatic error handling, lifecycle methods, and consistency
 * All commands should extend this class
 */

// Error handling (inline for now, can be imported from utils later)
async function handleCommandError(interaction, error, commandName) {
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
    console.error('handleCommandError - Reply Failed:', replyError.message);
  }
}

class CommandBase {
  constructor(options = {}) {
    this.name = options.name;
    this.description = options.description;
    this.data = options.data;
    this.options = options.options || [];
    this.isSlashCommand = true;
    this.isPrefixCommand = true;
  }

  /**
   * Execute command (implement in subclass)
   * @param {Message} _message - Discord message
   * @param {Array} _args - Command arguments
   * @returns {Promise<void>}
   */
  async execute(_message, _args) {
    throw new Error('execute() method must be implemented in subclass');
  }

  /**
   * Execute slash command interaction (implement in subclass)
   * @param {CommandInteraction} _interaction - Discord interaction
   * @returns {Promise<void>}
   */
  async executeInteraction(_interaction) {
    throw new Error('executeInteraction() method must be implemented in subclass');
  }

  /**
   * Handle prefix command with error wrapping
   * @param {Message} message - Discord message
   * @param {Array} args - Command arguments
   * @returns {Promise<void>}
   */
  async handlePrefixCommand(message, args) {
    try {
      await this.execute(message, args);
    } catch (error) {
      handleCommandError(
        { reply: (msg) => message.reply(msg) },
        error,
        this.name
      );
    }
  }

  /**
   * Handle slash command with error wrapping
   * @param {CommandInteraction} interaction - Discord interaction
   * @returns {Promise<void>}
   */
  async handleSlashCommand(interaction) {
    try {
      await interaction.deferReply({ ephemeral: false });
      await this.executeInteraction(interaction);
    } catch (error) {
      await handleCommandError(interaction, error, this.name);
    }
  }

  /**
   * Register command (for chaining)
   * @returns {CommandBase} This instance
   */
  register() {
    return this;
  }

  /**
   * Get command data for registration
   * @returns {Object} Command data
   */
  getCommandData() {
    return {
      name: this.name,
      description: this.description,
      data: this.data,
      options: this.options,
    };
  }
}

module.exports = CommandBase;
