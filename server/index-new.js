const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Database = require('./database');

// Загружаем переменные окружения
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key-change-in-production';

// Инициализация базы данных
const db = new Database();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5000']
    : true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Раздача статических файлов React приложения
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Токен доступа отсутствует' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Middleware для проверки ролей
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (req.user && allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Недостаточно прав доступа' });
    }
  };
};

// Middleware для логирования действий
const logAction = (action) => {
  return (req, res, next) => {
    const userRole = req.user ? req.user.role : 'anonymous';
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${userRole}: ${action} - ${req.method} ${req.path}`);
    next();
  };
};

// API Routes

// Аутентификация
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Успешный вход в систему',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'developer', department, position } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Имя, email и пароль обязательны' });
    }

    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await db.run(
      'INSERT INTO users (id, name, email, password, role, department, position) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, name, email, hashedPassword, role, department, position]
    );

    const token = jwt.sign(
      { userId, email, role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const newUser = await db.get('SELECT id, name, email, role, department, position FROM users WHERE id = ?', [userId]);
    res.status(201).json({
      message: 'Пользователь создан успешно',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Пользователи
app.get('/api/users', authenticateToken, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const users = await db.all('SELECT id, name, email, role, department, position, createdAt FROM users ORDER BY name');
    res.json(users);
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Проекты
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await db.all('SELECT * FROM projects ORDER BY createdAt DESC');
    res.json(projects);
  } catch (error) {
    console.error('Ошибка получения проектов:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }
    res.json(project);
  } catch (error) {
    console.error('Ошибка получения проекта:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Задачи
app.get('/api/tasks', async (req, res) => {
  try {
    let query = 'SELECT * FROM tasks ORDER BY createdAt DESC';
    let params = [];

    if (req.query.projectId) {
      query = 'SELECT * FROM tasks WHERE projectId = ? ORDER BY createdAt DESC';
      params = [req.query.projectId];
    }

    const tasks = await db.all(query, params);
    res.json(tasks);
  } catch (error) {
    console.error('Ошибка получения задач:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Комментарии
app.get('/api/tasks/:taskId/comments', async (req, res) => {
  try {
    const comments = await db.all(
      'SELECT c.*, u.name as userName FROM comments c JOIN users u ON c.userId = u.id WHERE c.taskId = ? ORDER BY c.createdAt ASC',
      [req.params.taskId]
    );
    res.json(comments);
  } catch (error) {
    console.error('Ошибка получения комментариев:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Статистика
app.get('/api/stats', async (req, res) => {
  try {
    const totalProjects = await db.get('SELECT COUNT(*) as count FROM projects');
    const activeProjects = await db.get("SELECT COUNT(*) as count FROM projects WHERE status = 'active'");
    const completedProjects = await db.get("SELECT COUNT(*) as count FROM projects WHERE status = 'completed'");
    
    const totalTasks = await db.get('SELECT COUNT(*) as count FROM tasks');
    const completedTasks = await db.get("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'");
    const inProgressTasks = await db.get("SELECT COUNT(*) as count FROM tasks WHERE status = 'in-progress'");
    const todoTasks = await db.get("SELECT COUNT(*) as count FROM tasks WHERE status = 'todo'");

    res.json({
      projects: {
        total: totalProjects.count,
        active: activeProjects.count,
        completed: completedProjects.count
      },
      tasks: {
        total: totalTasks.count,
        completed: completedTasks.count,
        inProgress: inProgressTasks.count,
        todo: todoTasks.count
      }
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Маршрут для React приложения (должен быть последним)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Инициализация и запуск сервера
async function startServer() {
  try {
    await db.init();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`📊 База данных: ${db.dbPath}`);
      console.log(`🌐 Доступ: http://localhost:${PORT}`);
      console.log(`🔐 Демо-аккаунты:`);
      console.log(`   Админ: admin@example.com / admin123`);
      console.log(`   Менеджер: manager@example.com / manager123`);
      console.log(`   Разработчик: developer@example.com / dev123`);
    });
  } catch (error) {
    console.error('Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

startServer();

// Обработка завершения процесса
process.on('SIGINT', () => {
  console.log('\n🛑 Завершение работы сервера...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Завершение работы сервера...');
  db.close();
  process.exit(0);
});
