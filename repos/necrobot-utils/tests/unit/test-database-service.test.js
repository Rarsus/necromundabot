/**
 * Test suite for DatabaseService
 * Tests database initialization, queries, and transactions
 */

const assert = require('assert');
const DatabaseService = require('../../src/services/DatabaseService');

describe('DatabaseService', () => {
  let db;

  beforeEach(async () => {
    db = new DatabaseService(':memory:');
    await db.initialize();
  });

  afterEach(() => {
    db.close();
  });

  describe('initialization', () => {
    it('should initialize database connection', async () => {
      assert.ok(db.getInstance());
    });

    it('should create database instance with in-memory storage', async () => {
      const newDb = new DatabaseService(':memory:');
      await newDb.initialize();
      assert.ok(newDb.getInstance());
      newDb.close();
    });

    it('should throw error if querying before initialization', async () => {
      const uninitializedDb = new DatabaseService(':memory:');
      assert.throws(() => {
        uninitializedDb.executeQuery('SELECT 1');
      }, /Database not initialized/);
    });
  });

  describe('executeQuery', () => {
    beforeEach(() => {
      // Create test table
      db.executeQuery('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
    });

    it('should execute SELECT query and return results', () => {
      db.executeQuery('INSERT INTO test (name) VALUES (?)', ['Alice']);
      const results = db.executeQuery('SELECT * FROM test WHERE name = ?', ['Alice']);

      assert.strictEqual(Array.isArray(results), true);
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].name, 'Alice');
    });

    it('should insert data and return lastID', () => {
      const result = db.executeQuery('INSERT INTO test (name) VALUES (?)', ['Bob']);

      assert.ok(result.lastID);
      assert.strictEqual(result.changes, 1);
    });

    it('should update data and return changes count', () => {
      db.executeQuery('INSERT INTO test (name) VALUES (?)', ['Charlie']);
      const result = db.executeQuery('UPDATE test SET name = ? WHERE name = ?', ['Charles', 'Charlie']);

      assert.strictEqual(result.changes, 1);
    });

    it('should delete data and return changes count', () => {
      db.executeQuery('INSERT INTO test (name) VALUES (?)', ['ToDelete']);
      const result = db.executeQuery('DELETE FROM test WHERE name = ?', ['ToDelete']);

      assert.strictEqual(result.changes, 1);
    });

    it('should throw error on invalid SQL', () => {
      assert.throws(() => {
        db.executeQuery('INVALID SQL SYNTAX');
      }, /Query execution failed/);
    });
  });

  describe('transactions', () => {
    beforeEach(() => {
      db.executeQuery('CREATE TABLE trans_test (id INTEGER PRIMARY KEY, value TEXT)');
    });

    it('should commit transaction successfully', () => {
      db.beginTransaction();
      db.executeQuery('INSERT INTO trans_test (value) VALUES (?)', ['test1']);
      db.commit();

      const results = db.executeQuery('SELECT * FROM trans_test');
      assert.strictEqual(results.length, 1);
    });

    it('should rollback transaction on error', () => {
      db.beginTransaction();
      db.executeQuery('INSERT INTO trans_test (value) VALUES (?)', ['test2']);
      db.rollback();

      const results = db.executeQuery('SELECT * FROM trans_test');
      assert.strictEqual(results.length, 0);
    });
  });

  describe('close', () => {
    it('should close database connection', () => {
      db.close();
      assert.strictEqual(db.getInstance(), null);
    });

    it('should throw error on query after close', () => {
      db.close();
      assert.throws(() => {
        db.executeQuery('SELECT 1');
      }, /Database not initialized/);
    });
  });
});
