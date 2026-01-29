/**
 * DatabaseService - Core database abstraction layer for NecroBot
 * Manages SQLite database connections and operations
 */

const Database = require('better-sqlite3');

class DatabaseService {
  constructor(dbPath = ':memory:') {
    this.dbPath = dbPath;
    this.db = null;
  }

  /**
   * Initialize database connection
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');
    } catch (error) {
      throw new Error(`Failed to initialize database: ${error.message}`);
    }
  }

  /**
   * Close database connection
   * @returns {void}
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Execute a raw SQL query
   * @param {string} sql - SQL query string
   * @param {Array} params - Query parameters
   * @returns {any} Query result
   */
  executeQuery(sql, params = []) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = this.db.prepare(sql);
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        return stmt.all(...params);
      }
      if (sql.trim().toUpperCase().startsWith('INSERT')) {
        const result = stmt.run(...params);
        return { lastID: result.lastInsertRowid, changes: result.changes };
      }
      if (sql.trim().toUpperCase().startsWith('UPDATE') || sql.trim().toUpperCase().startsWith('DELETE')) {
        const result = stmt.run(...params);
        return { changes: result.changes };
      }
      return stmt.run(...params);
    } catch (error) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  /**
   * Begin transaction
   * @returns {void}
   */
  beginTransaction() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    this.db.exec('BEGIN TRANSACTION');
  }

  /**
   * Commit transaction
   * @returns {void}
   */
  commit() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    this.db.exec('COMMIT');
  }

  /**
   * Rollback transaction
   * @returns {void}
   */
  rollback() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    this.db.exec('ROLLBACK');
  }

  /**
   * Get database instance (for advanced operations)
   * @returns {Database|null} Database instance
   */
  getInstance() {
    return this.db;
  }
}

module.exports = DatabaseService;
