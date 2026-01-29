/**
 * NecroBot Core - Discord Bot Entry Point
 * Initializes and runs the Discord bot with proper event handling and command registration
 */

require('dotenv').config();
const path = require('path');

const { Client, IntentsBitField } = require('discord.js');

const CommandLoader = require('./core/CommandLoader');
const CommandRegistrationHandler = require('./core/CommandRegistrationHandler');
const InteractionHandler = require('./core/InteractionHandler');

// Load environment variables
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// Validate required environment variables
if (!TOKEN) {
  console.error('❌ Missing DISCORD_TOKEN environment variable');
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error('❌ Missing CLIENT_ID environment variable');
  process.exit(1);
}

// Initialize Discord Client with required intents
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.DirectMessages,
  ],
});

// Initialize command management
const commandLoader = new CommandLoader(client);
const commandRegistrationHandler = new CommandRegistrationHandler(client);
const interactionHandler = new InteractionHandler(client, commandLoader);

// Expose command loader to client for use in commands
client.commandLoader = commandLoader;

// Bot ready event
client.once('clientReady', async () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  console.log(`📊 Serving ${client.guilds.cache.size} guild(s)\n`);

  // Load commands from necrobot-commands module
  const commandsPath = path.join(__dirname, '../../necrobot-commands/src/commands');
  const commands = commandLoader.loadCommands(commandsPath);

  // Register commands with Discord
  if (commands.size > 0) {
    const commandData = commandLoader.getSlashCommandData();
    try {
      await commandRegistrationHandler.registerCommands(commandData, GUILD_ID || undefined);
      await commandRegistrationHandler.logRegisteredCommands(GUILD_ID || undefined);
    } catch (error) {
      console.error('❌ Failed to register commands:', error);
    }
  }

  // Register interaction handlers
  interactionHandler.registerHandlers();
});

// Error handling
client.on('error', error => {
  console.error('❌ Discord Client Error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Login to Discord
client.login(TOKEN).catch(error => {
  console.error('❌ Failed to login:', error);
  process.exit(1);
});

// Export client for use in other modules
module.exports = client;
