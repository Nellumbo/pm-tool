const request = require('supertest');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock окружение для тестов
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.NODE_ENV = 'test';

const validation = require('../middleware/validation');
const Database = require('../database');

// Создаем тестовое приложение
const app = express();
app.use(cors());
app.use(bodyParser.json());

let db;
let testUser;
let testToken;

// Инициализация БД перед всеми тестами
beforeAll(async () => {
  db = new Database();
  await db.init();

  // Создаем тестового пользователя
  const hashedPassword = await bcrypt.hash('testpass123', 10);
  await db.run(
    'INSERT INTO users (id, name, email, password, role, department, position) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['test-user-1', 'Test User', 'test@example.com', hashedPassword, 'admin', 'IT', 'Tester']
  );

  testUser = await db.get('SELECT * FROM users WHERE id = ?', ['test-user-1']);

  // Создаем токен для тестов
  testToken = jwt.sign(
    {
      id: testUser.id,
      email: testUser.email,
      role: testUser.role,
      name: testUser.name
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
});

// Очистка после всех тестов
afterAll(async () => {
  if (db && db.db) {
    await db.run('DELETE FROM users WHERE id = ?', ['test-user-1']);
    db.close();
  }
});

describe('Authentication API', () => {
  // Тест логина с валидными данными
  test('POST /api/auth/login - successful login', async () => {
    app.post('/api/auth/login', validation.loginValidation, async (req, res) => {
      try {
        const { email, password } = req.body;
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
          return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role, name: user.name },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        const { password: _, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
      } catch (error) {
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
      }
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpass123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body.user).not.toHaveProperty('password');
  });

  // Тест логина с неверным паролем
  test('POST /api/auth/login - invalid password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Неверный email или пароль');
  });

  // Тест логина с невалидным email
  test('POST /api/auth/login - invalid email format', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid-email',
        password: 'testpass123'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Ошибка валидации');
  });

  // Тест логина с коротким паролем
  test('POST /api/auth/login - password too short', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: '123'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Ошибка валидации');
  });
});

describe('JWT Token Validation', () => {
  test('Valid JWT token is accepted', () => {
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    expect(decoded.email).toBe('test@example.com');
    expect(decoded.role).toBe('admin');
  });

  test('Invalid JWT token is rejected', () => {
    expect(() => {
      jwt.verify('invalid-token', process.env.JWT_SECRET);
    }).toThrow();
  });

  test('Expired JWT token is rejected', () => {
    const expiredToken = jwt.sign(
      { id: 'test', email: 'test@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '0s' }
    );

    expect(() => {
      jwt.verify(expiredToken, process.env.JWT_SECRET);
    }).toThrow();
  });
});

describe('Password Hashing', () => {
  test('Password is hashed correctly', async () => {
    const password = 'testpassword123';
    const hashed = await bcrypt.hash(password, 10);

    expect(hashed).not.toBe(password);
    expect(hashed.length).toBeGreaterThan(20);
  });

  test('Password comparison works', async () => {
    const password = 'testpassword123';
    const hashed = await bcrypt.hash(password, 10);

    const isValid = await bcrypt.compare(password, hashed);
    expect(isValid).toBe(true);

    const isInvalid = await bcrypt.compare('wrongpassword', hashed);
    expect(isInvalid).toBe(false);
  });
});
