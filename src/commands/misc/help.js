/**
 * Help Command - Shows all available commands
 * Dynamically displays loaded commands
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  // Command metadata (required for validation)
  name: 'help',
  description: 'Shows all available commands',

  // Command data (for slash command registration)
  data: new SlashCommandBuilder().setName('help').setDescription('Shows all available commands'),

  /**
   * Execute the slash command interaction
   * @param {CommandInteraction} interaction - Discord interaction
   * @returns {Promise<void>}
   */
  async executeInteraction(interaction) {
    const commandsByCategory = interaction.client.commandLoader.getCommandsByCategory();

    if (Object.keys(commandsByCategory).length === 0) {
      await interaction.editReply('❌ No commands available');
      return;
    }

    // Create embed with all commands organized by category
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📋 Available Commands')
      .setDescription('Here are all available slash commands')
      .setTimestamp()
      .setFooter({ text: 'NecromundaBot' });

    // Add commands organized by category
    for (const [category, commands] of Object.entries(commandsByCategory)) {
      const commandList = commands.join(', ');
      const formattedCommands = '`/' + commandList.replace(/,/g, '` `/') + '`';
      embed.addFields({
        name: `**${category}**`,
        value: formattedCommands,
        inline: false,
      });
    }

    await interaction.editReply({ embeds: [embed] });
  },
};
