/**
 * Ping Command - Simple ping/pong command for testing
 * Example command demonstrating proper structure
 */

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  // Command metadata (required for validation)
  name: 'ping',
  description: 'Replies with Pong! and bot latency',

  // Command data (for slash command registration)
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong! and bot latency'),

  /**
   * Execute the slash command interaction
   * @param {CommandInteraction} interaction - Discord interaction
   * @returns {Promise<void>}
   */
  async executeInteraction(interaction) {
    const reply = await interaction.editReply('🏓 Pong!');

    const latency = reply.createdTimestamp - interaction.createdTimestamp;
    const wsLatency = interaction.client.ws.ping;

    await interaction.editReply('🏓 Pong!\n' + `Message Latency: ${latency}ms\n` + `WebSocket Latency: ${wsLatency}ms`);
  },
};
