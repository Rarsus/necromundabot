#!/usr/bin/env node
/**
 * Database MCP Server
 * Provides safe SQLite database access for Copilot
 * - Query guild and root databases
 * - Inspect schemas
 * - Get statistics
 * - List databases
 * Guild isolation aware
 * Uses better-sqlite3 for synchronous, performant access
 */
/* eslint-disable security/detect-non-literal-fs-filename, no-unused-vars */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_ROOT = process.env.MCP_DB_ROOT || path.join(process.cwd(), 'data/db');

class DatabaseMCPServer {
  constructor() {
    this.databases = new Map();
  }

  /**
   * Get a database connection (cached)
   * Uses better-sqlite3 for synchronous access
   */
  getDatabase(guildId = 'root') {
    if (this.databases.has(guildId)) {
      return this.databases.get(guildId);
    }

    const dbPath =
      guildId === 'root' ? path.join(DB_ROOT, 'quotes.db') : path.join(DB_ROOT, 'guilds', guildId, 'quotes.db');

    try {
      // Check if file exists first for better error messages
      if (!fs.existsSync(dbPath)) {
        throw new Error(`Database file not found at ${dbPath}`);
      }

      const db = new Database(dbPath, { readonly: true });
      this.databases.set(guildId, db);
      return db;
    } catch (err) {
      throw new Error(`Failed to open database at ${dbPath}: ${err.message}`);
    }
  }

  /**
   * Execute a query safely
   * Synchronous using better-sqlite3
   */
  query(sql, params = [], guildId = 'root') {
    // Prevent dangerous operations
    if (/DELETE|DROP|UPDATE|INSERT/i.test(sql) && !sql.includes('SELECT')) {
      throw new Error('Write operations not allowed via MCP (read-only)');
    }

    const db = this.getDatabase(guildId);

    try {
      const stmt = db.prepare(sql);
      const rows = stmt.all(...params);
      return rows || [];
    } catch (err) {
      throw new Error(`Query failed: ${err.message}`);
    }
  }

  /**
   * Get database schema
   */
  getSchema(guildId = 'root') {
    try {
      const tables = this.query("SELECT name FROM sqlite_master WHERE type='table'", [], guildId);

      const schema = {};
      for (const table of tables) {
        const columns = this.query(`PRAGMA table_info(${table.name})`, [], guildId);
        schema[table.name] = columns;
      }

      return schema;
    } catch (error) {
      throw new Error(`Failed to get schema: ${error.message}`);
    }
  }

  /**
   * Get quote count for a guild
   */
  getQuoteCount(guildId = 'root') {
    try {
      const result = this.query('SELECT COUNT(*) as count FROM quotes', [], guildId);
      return result[0]?.count || 0;
    } catch (error) {
      throw new Error(`Failed to get quote count: ${error.message}`);
    }
  }

  /**
   * Get reminder count for a guild
   */
  getReminderCount(guildId = 'root') {
    try {
      const result = this.query('SELECT COUNT(*) as count FROM reminders', [], guildId);
      return result[0]?.count || 0;
    } catch (_error) {
      return 0; // Table might not exist
    }
  }

  /**
   * List all guild databases
   */
  async getGuildDatabases() {
    try {
      const guildsDir = path.join(DB_ROOT, 'guilds');
      if (!fs.existsSync(guildsDir)) {
        return [];
      }

      const guildDirs = fs.readdirSync(guildsDir);
      return guildDirs.filter((dir) => !dir.startsWith('.')).sort();
    } catch (err) {
      throw new Error(`Failed to list guild databases: ${err.message}`);
    }
  }

  /**
   * List all guild databases
   */
  getGuildDatabases() {
    try {
      const guildsDir = path.join(DB_ROOT, 'guilds');
      if (!fs.existsSync(guildsDir)) {
        return [];
      }

      const guildDirs = fs.readdirSync(guildsDir);
      return guildDirs.filter((dir) => !dir.startsWith('.')).sort();
    } catch (err) {
      throw new Error(`Failed to list guild databases: ${err.message}`);
    }
  }

  /**
   * Get root database statistics
   */
  getRootDatabaseStats() {
    try {
      const tables = this.getSchema('root');
      const stats = {
        database: 'root',
        tables: Object.keys(tables),
        tableCount: Object.keys(tables).length,
        purpose: 'Bot infrastructure (proxy_config, schema_versions)',
        path: path.join(DB_ROOT, 'quotes.db'),
      };

      return stats;
    } catch (error) {
      throw new Error(`Failed to get root database stats: ${error.message}`);
    }
  }

  /**
   * Get guild database statistics
   */
  getGuildDatabaseStats(guildId) {
    try {
      const dbPath = path.join(DB_ROOT, 'guilds', guildId, 'quotes.db');

      if (!fs.existsSync(dbPath)) {
        return {
          guildId,
          exists: false,
          error: 'Database not found',
        };
      }

      const tables = this.getSchema(guildId);
      const quoteCount = this.getQuoteCount(guildId);
      const reminderCount = this.getReminderCount(guildId);

      return {
        guildId,
        exists: true,
        tables: Object.keys(tables),
        tableCount: Object.keys(tables).length,
        quoteCount,
        reminderCount,
        path: dbPath,
      };
    } catch (error) {
      return {
        guildId,
        exists: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all guild database statistics
   */
  getAllGuildStats() {
    const guilds = this.getGuildDatabases();
    const stats = [];

    for (const guildId of guilds) {
      const stat = this.getGuildDatabaseStats(guildId);
      stats.push(stat);
    }

    return {
      totalGuilds: guilds.length,
      guilds: stats,
    };
  }

  /**
   * Get recent quotes
   */
  getRecentQuotes(guildId = 'root', limit = 10) {
    try {
      return this.query(
        'SELECT id, text, author, createdAt FROM quotes ORDER BY createdAt DESC LIMIT ?',
        [limit],
        guildId
      );
    } catch (error) {
      throw new Error(`Failed to get recent quotes: ${error.message}`);
    }
  }

  /**
   * Search quotes by text or author
   */
  searchQuotes(guildId, keyword, limit = 20) {
    try {
      return this.query(
        `SELECT id, text, author FROM quotes 
         WHERE text LIKE ? OR author LIKE ? 
         ORDER BY id DESC LIMIT ?`,
        [`%${keyword}%`, `%${keyword}%`, limit],
        guildId
      );
    } catch (error) {
      throw new Error(`Failed to search quotes: ${error.message}`);
    }
  }

  /**
   * Get database summary for all guilds
   */
  getSummary() {
    try {
      const root = this.getRootDatabaseStats();
      const guilds = this.getAllGuildStats();
      const totalQuotes = guilds.guilds.reduce((sum, g) => sum + (g.quoteCount || 0), 0);
      const totalReminders = guilds.guilds.reduce((sum, g) => sum + (g.reminderCount || 0), 0);

      return {
        root,
        guilds: guilds.totalGuilds,
        totalQuotes,
        totalReminders,
        databases: {
          root: 1,
          guild: guilds.totalGuilds,
          total: 1 + guilds.totalGuilds,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get summary: ${error.message}`);
    }
  }

  /**
   * Close all database connections
   */
  closeAll() {
    this.databases.forEach((db) => {
      db.close();
    });
    this.databases.clear();
  }
}

// Create singleton instance
const instance = new DatabaseMCPServer();

// Export for MCP integration
module.exports = instance;

// CLI interface for testing
if (require.main === module) {
  try {
    console.log('🗄️  Database MCP Server - CLI Mode (better-sqlite3)\n');

    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'summary') {
      console.log(JSON.stringify(instance.getSummary(), null, 2));
    } else if (command === 'root') {
      console.log(JSON.stringify(instance.getRootDatabaseStats(), null, 2));
    } else if (command === 'guilds') {
      console.log(JSON.stringify(instance.getAllGuildStats(), null, 2));
    } else if (command === 'guild') {
      const guildId = args[1];
      if (!guildId) {
        console.error('Usage: node database-server.js guild <guildId>');
        process.exit(1);
      }
      console.log(JSON.stringify(instance.getGuildDatabaseStats(guildId), null, 2));
    } else if (command === 'quotes') {
      const guildId = args[1] || 'root';
      const limit = parseInt(args[2]) || 10;
      const quotes = instance.getRecentQuotes(guildId, limit);
      console.log(`Recent ${limit} quotes from guild "${guildId}":\n`);
      console.log(JSON.stringify(quotes, null, 2));
    } else if (command === 'search') {
      const guildId = args[1] || 'root';
      const keyword = args[2];
      if (!keyword) {
        console.error('Usage: node database-server.js search <guildId> <keyword>');
        process.exit(1);
      }
      const results = instance.searchQuotes(guildId, keyword);
      console.log(`Search results for "${keyword}" in guild "${guildId}":\n`);
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.log('Usage:');
      console.log('  node database-server.js summary        - Show database summary');
      console.log('  node database-server.js root           - Show root database stats');
      console.log('  node database-server.js guilds         - List all guild databases');
      console.log('  node database-server.js guild <id>     - Show guild stats');
      console.log('  node database-server.js quotes [guild] - Show recent quotes');
      console.log('  node database-server.js search <guild> <keyword> - Search quotes');
    }

    instance.closeAll();
  } catch (error) {
    console.error('Error:', error.message);
    instance.closeAll();
    process.exit(1);
  }
}
