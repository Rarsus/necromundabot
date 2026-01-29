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

  describe('edge cases - error handling', () => {
    it('should handle null parameter gracefully', () => {
      db.executeQuery('CREATE TABLE null_test (id INTEGER, value TEXT)');
      const result = db.executeQuery('INSERT INTO null_test (id, value) VALUES (?, ?)', [1, null]);

      assert.ok(result.lastID);
      const row = db.executeQuery('SELECT * FROM null_test WHERE id = 1');
      assert.strictEqual(row[0].value, null);
    });

    it('should handle empty query results', () => {
      db.executeQuery('CREATE TABLE empty_test (id INTEGER)');
      const results = db.executeQuery('SELECT * FROM empty_test');

      assert.ok(Array.isArray(results));
      assert.strictEqual(results.length, 0);
    });

    it('should handle special characters in data', () => {
      db.executeQuery('CREATE TABLE special_test (id INTEGER PRIMARY KEY, text TEXT)');
      const specialString = 'O\'Reilly & Co. "Quoted" <tag>';
      db.executeQuery('INSERT INTO special_test (text) VALUES (?)', [specialString]);

      const result = db.executeQuery('SELECT * FROM special_test');
      assert.strictEqual(result[0].text, specialString);
    });

    it('should handle large numeric values', () => {
      db.executeQuery('CREATE TABLE large_num_test (id INTEGER PRIMARY KEY, big_num REAL)');
      const largeValue = 999999999999.999;
      db.executeQuery('INSERT INTO large_num_test (big_num) VALUES (?)', [largeValue]);

      const result = db.executeQuery('SELECT * FROM large_num_test');
      assert.strictEqual(result[0].big_num, largeValue);
    });

    it('should handle empty string values', () => {
      db.executeQuery('CREATE TABLE empty_str_test (id INTEGER PRIMARY KEY, str TEXT)');
      db.executeQuery('INSERT INTO empty_str_test (str) VALUES (?)', ['']);

      const result = db.executeQuery('SELECT * FROM empty_str_test WHERE str = ?', ['']);
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].str, '');
    });

    it('should handle multiple transactions sequentially', () => {
      db.executeQuery('CREATE TABLE multi_trans (id INTEGER PRIMARY KEY, val TEXT)');

      db.beginTransaction();
      db.executeQuery('INSERT INTO multi_trans (val) VALUES (?)', ['first']);
      db.commit();

      db.beginTransaction();
      db.executeQuery('INSERT INTO multi_trans (val) VALUES (?)', ['second']);
      db.commit();

      const results = db.executeQuery('SELECT * FROM multi_trans');
      assert.strictEqual(results.length, 2);
    });

    it('should handle concurrent parameter substitution', () => {
      db.executeQuery('CREATE TABLE param_test (id INTEGER PRIMARY KEY, a TEXT, b TEXT, c TEXT)');
      db.executeQuery('INSERT INTO param_test (a, b, c) VALUES (?, ?, ?)', ['x', 'y', 'z']);

      const result = db.executeQuery('SELECT * FROM param_test WHERE a = ? AND b = ? AND c = ?', ['x', 'y', 'z']);
      assert.strictEqual(result.length, 1);
    });

    it('should handle repeated column names', () => {
      db.executeQuery('CREATE TABLE repeat_test (id INTEGER PRIMARY KEY, value TEXT)');
      db.executeQuery('INSERT INTO repeat_test (value) VALUES (?)', ['data']);

      const result = db.executeQuery('SELECT value, value, value FROM repeat_test');
      assert.ok(result[0]);
    });

    it('should handle transaction rollback with constraint violation', () => {
      db.executeQuery('CREATE TABLE unique_test (id INTEGER PRIMARY KEY UNIQUE, val TEXT)');
      db.executeQuery("INSERT INTO unique_test (id, val) VALUES (1, 'first')");

      db.beginTransaction();
      try {
        db.executeQuery("INSERT INTO unique_test (id, val) VALUES (1, 'second')");
      } catch (e) {
        // Expected to fail
      }
      db.rollback();

      const results = db.executeQuery('SELECT * FROM unique_test');
      assert.strictEqual(results.length, 1);
    });
  });

  describe('performance - large datasets', () => {
    it('should handle bulk insert operations', () => {
      db.executeQuery('CREATE TABLE bulk_test (id INTEGER PRIMARY KEY, value TEXT)');

      db.beginTransaction();
      for (let i = 0; i < 100; i++) {
        db.executeQuery('INSERT INTO bulk_test (value) VALUES (?)', [`value_${i}`]);
      }
      db.commit();

      const results = db.executeQuery('SELECT COUNT(*) as count FROM bulk_test');
      assert.strictEqual(results[0].count, 100);
    });

    it('should efficiently query large result sets', () => {
      db.executeQuery('CREATE TABLE large_result (id INTEGER PRIMARY KEY, value TEXT)');

      db.beginTransaction();
      for (let i = 0; i < 50; i++) {
        db.executeQuery('INSERT INTO large_result (value) VALUES (?)', [`value_${i}`]);
      }
      db.commit();

      const results = db.executeQuery('SELECT * FROM large_result');
      assert.strictEqual(results.length, 50);
    });

    it('should handle complex WHERE clauses', () => {
      db.executeQuery('CREATE TABLE complex_where (id INTEGER PRIMARY KEY, status TEXT, priority INTEGER)');

      db.executeQuery('INSERT INTO complex_where (status, priority) VALUES (?, ?)', ['active', 1]);
      db.executeQuery('INSERT INTO complex_where (status, priority) VALUES (?, ?)', ['inactive', 2]);
      db.executeQuery('INSERT INTO complex_where (status, priority) VALUES (?, ?)', ['active', 3]);

      const results = db.executeQuery('SELECT * FROM complex_where WHERE status = ? AND priority > ?', ['active', 1]);
      assert.strictEqual(results.length, 1);
    });
  });

  describe('data type handling', () => {
    it('should handle TEXT type', () => {
      db.executeQuery('CREATE TABLE text_test (id INTEGER, text_col TEXT)');
      db.executeQuery('INSERT INTO text_test VALUES (1, ?)', ['Hello World']);

      const result = db.executeQuery('SELECT * FROM text_test');
      assert.strictEqual(typeof result[0].text_col, 'string');
    });

    it('should handle INTEGER type', () => {
      db.executeQuery('CREATE TABLE int_test (id INTEGER, int_col INTEGER)');
      db.executeQuery('INSERT INTO int_test VALUES (1, ?)', [42]);

      const result = db.executeQuery('SELECT * FROM int_test');
      assert.strictEqual(typeof result[0].int_col, 'number');
      assert.strictEqual(result[0].int_col, 42);
    });

    it('should handle REAL/FLOAT type', () => {
      db.executeQuery('CREATE TABLE real_test (id INTEGER, real_col REAL)');
      db.executeQuery('INSERT INTO real_test VALUES (1, ?)', [3.14159]);

      const result = db.executeQuery('SELECT * FROM real_test');
      assert.strictEqual(typeof result[0].real_col, 'number');
      assert.ok(Math.abs(result[0].real_col - 3.14159) < 0.00001);
    });

    it('should handle NULL type', () => {
      db.executeQuery('CREATE TABLE null_test (id INTEGER, nullable TEXT)');
      db.executeQuery('INSERT INTO null_test VALUES (1, ?)', [null]);

      const result = db.executeQuery('SELECT * FROM null_test');
      assert.strictEqual(result[0].nullable, null);
    });
  });
});
