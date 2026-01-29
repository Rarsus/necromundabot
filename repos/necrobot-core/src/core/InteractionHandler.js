/**
 * Interaction Handler - Processes Discord interactions (slash commands, buttons, etc.)
 */

class InteractionHandler {
  constructor(client, commandLoader) {
    this.client = client;
    this.commandLoader = commandLoader;
  }

  /**
   * Register interaction handlers with Discord client
   * @returns {void}
   */
  registerHandlers() {
    // Handle slash command interactions
    this.client.on('interactionCreate', interaction => this.handleInteraction(interaction));

    console.log('✅ Interaction handlers registered\n');
  }

  /**
   * Handle incoming interactions
   * @param {Interaction} interaction - Discord interaction
   * @returns {Promise<void>}
   */
  async handleInteraction(interaction) {
    // Only handle slash commands for now
    if (!interaction.isCommand()) {
      return;
    }

    const { commandName } = interaction;

    console.log(`\n🔄 Slash command executed: /${commandName}`);
    console.log(`   User: ${interaction.user.tag}`);
    console.log(`   Guild: ${interaction.guild?.name || 'DM'}`);

    try {
      // Defer reply to give bot time to respond
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply();
      }

      // Execute command
      await this.commandLoader.executeCommand(commandName, interaction);

      console.log('✅ Command executed successfully\n');
    } catch (error) {
      console.error('❌ Error handling interaction:', error);

      const errorReply = {
        content: '❌ An error occurred while processing your command.',
        ephemeral: true,
      };

      try {
        if (interaction.replied) {
          await interaction.followUp(errorReply);
        } else if (interaction.deferred) {
          await interaction.editReply(errorReply);
        } else {
          await interaction.reply(errorReply);
        }
      } catch (replyError) {
        console.error('❌ Failed to send error reply:', replyError);
      }
    }
  }
}

module.exports = InteractionHandler;
