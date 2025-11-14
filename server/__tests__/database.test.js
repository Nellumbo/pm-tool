const Database = require('../database');
const bcrypt = require('bcryptjs');

process.env.NODE_ENV = 'test';

describe('Database', () => {
  let db;

  beforeAll(async () => {
    db = new Database();
    await db.init();
  });

  afterAll(() => {
    if (db && db.db) {
      db.close();
    }
  });

  describe('Database Initialization', () => {
    test('Database instance is created', () => {
      expect(db).toBeDefined();
      expect(db.db).toBeDefined();
    });

    test('Tables are created', async () => {
      const tables = await db.all(
        "SELECT name FROM sqlite_master WHERE type='table'"
      );

      const tableNames = tables.map(t => t.name);
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('projects');
      expect(tableNames).toContain('tasks');
      expect(tableNames).toContain('comments');
      expect(tableNames).toContain('templates');
    });
  });

  describe('CRUD Operations - Users', () => {
    const testUserId = 'test-user-db-' + Date.now();

    test('INSERT user', async () => {
      const hashedPassword = await bcrypt.hash('test123', 10);
      const result = await db.run(
        'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [testUserId, 'Test User', `test-${testUserId}@example.com`, hashedPassword, 'developer']
      );

      expect(result).toBeDefined();
    });

    test('SELECT user', async () => {
      const user = await db.get('SELECT * FROM users WHERE id = ?', [testUserId]);

      expect(user).toBeDefined();
      expect(user.name).toBe('Test User');
      expect(user.role).toBe('developer');
    });

    test('UPDATE user', async () => {
      await db.run(
        'UPDATE users SET name = ? WHERE id = ?',
        ['Updated Name', testUserId]
      );

      const user = await db.get('SELECT * FROM users WHERE id = ?', [testUserId]);
      expect(user.name).toBe('Updated Name');
    });

    test('DELETE user', async () => {
      await db.run('DELETE FROM users WHERE id = ?', [testUserId]);

      const user = await db.get('SELECT * FROM users WHERE id = ?', [testUserId]);
      expect(user).toBeUndefined();
    });
  });

  describe('Demo Data', () => {
    test('Demo users exist', async () => {
      const users = await db.all('SELECT * FROM users');
      expect(users.length).toBeGreaterThan(0);
    });

    test('Demo projects exist', async () => {
      const projects = await db.all('SELECT * FROM projects');
      expect(projects.length).toBeGreaterThan(0);
    });

    test('Demo tasks exist', async () => {
      const tasks = await db.all('SELECT * FROM tasks');
      expect(tasks.length).toBeGreaterThan(0);
    });
  });
});
