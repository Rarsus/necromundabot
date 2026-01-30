/**
 * Info Command - Bot Information Display
 * Displays generic information about NecromundaBot including uptime, command count, guilds, etc.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  // Command metadata (required for CommandLoader validation)
  name: 'info',
  description: 'Displays information about NecromundaBot',

  // Command data (for slash command registration)
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Displays information about NecromundaBot including uptime, commands, and purpose'),

  /**
   * Execute the slash command interaction
   * @param {CommandInteraction} interaction - Discord interaction
   * @returns {Promise<void>}
   */
  async executeInteraction(interaction) {
    try {
      const client = interaction.client;
      const botUser = client.user;

      // Calculate uptime
      const uptime = client.uptime || 0;
      const uptimeHours = Math.floor(uptime / 3600000);
      const uptimeMinutes = Math.floor((uptime % 3600000) / 60000);
      const uptimeSeconds = Math.floor((uptime % 60000) / 1000);
      const uptimeString = `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`;

      // Get guild count
      const guildCount = client.guilds.cache.size;

      // Get command count and categories
      const commandsByCategory = client.commandLoader?.getCommandsByCategory?.() || {};
      const totalCommands = Object.values(commandsByCategory).reduce((acc, cmds) => acc + cmds.length, 0);
      const commandCategories = Object.keys(commandsByCategory).length;

      // Create embed with bot information
      const embed = new EmbedBuilder()
        .setTitle('🤖 NecromundaBot Information')
        .setColor(0x2f3136)
        .setThumbnail(botUser.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          {
            name: '📋 About',
            value:
              'NecromundaBot is a Discord bot for managing Necromunda campaigns, ' +
              'battles, and gang administration with community features.',
            inline: false,
          },
          {
            name: '⏱️ Uptime',
            value: uptimeString,
            inline: true,
          },
          {
            name: '🏢 Servers',
            value: `${guildCount} guild${guildCount !== 1 ? 's' : ''}`,
            inline: true,
          },
          {
            name: '⚡ Commands',
            value: `${totalCommands} commands across ${commandCategories} categor${commandCategories !== 1 ? 'ies' : 'y'}`,
            inline: true,
          },
          {
            name: '🎯 Bot ID',
            value: botUser.id,
            inline: true,
          },
          {
            name: '📡 API Latency',
            value: `${client.ws.ping}ms`,
            inline: true,
          },
          {
            name: '🔗 Links',
            value:
              '[GitHub](https://github.com/Rarsus/necromundabot) • ' +
              '[Documentation](https://github.com/Rarsus/necromundabot#readme)',
            inline: false,
          }
        )
        .setFooter({
          text: `${botUser.username} • Made with ❤️`,
          iconURL: botUser.displayAvatarURL({ dynamic: true, size: 256 }),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Error in info command:', error);
      await interaction.editReply({
        content: '❌ An error occurred while retrieving bot information.',
        ephemeral: true,
      });
    }
  },
};
