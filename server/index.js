const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, param, query, validationResult } = require('express-validator');
const Database = require('./database');

// Загружаем переменные окружения
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// SECURITY: Проверка критических переменных окружения
// ============================================================================
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is required!');
  console.error('   Please set JWT_SECRET in your .env file');
  console.error('   Example: JWT_SECRET=your-super-secret-key-here-min-32-chars');
  process.exit(1);
}

if (JWT_SECRET.length < 32) {
  console.error('❌ FATAL: JWT_SECRET must be at least 32 characters long for security!');
  process.exit(1);
}

// Инициализация базы данных
const db = new Database();

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

// Helmet - устанавливает различные HTTP заголовки для безопасности
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting для защиты от brute force атак
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток
  message: { message: 'Слишком много попыток входа. Попробуйте через 15 минут.' },
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов
  message: { message: 'Слишком много запросов. Попробуйте позже.' },
  standardHeaders: true,
  legacyHeaders: false
});

// CORS конфигурация из переменных окружения
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5000'];

app.use(cors({
  origin: (origin, callback) => {
    // Разрешаем запросы без origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parser с лимитами размера для защиты от DoS
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser для работы с cookies
app.use(cookieParser());

// Раздача статических файлов React приложения
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// ============================================================================
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ============================================================================

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  // Приоритет: cookie -> Authorization header (для обратной совместимости)
  let token = req.cookies.token;

  // Fallback на Authorization header если cookie отсутствует
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }

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

// Middleware для проверки ролей (ВСЕГДА требует authenticateToken перед собой!)
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Аутентификация обязательна' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Недостаточно прав доступа' });
    }

    next();
  };
};

// Middleware для логирования действий
const logAction = (action) => {
  return (req, res, next) => {
    const userRole = req.user ? req.user.role : 'anonymous';
    const userId = req.user ? req.user.userId : 'unknown';
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${userRole}(${userId}): ${action} - ${req.method} ${req.path}`);
    next();
  };
};

// Middleware для валидации
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Ошибка валидации',
      errors: errors.array()
    });
  }
  next();
};

// ============================================================================
// HEALTH CHECK ENDPOINTS
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/health/ready', async (req, res) => {
  try {
    await db.get('SELECT 1');
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

// ============================================================================
// API ROUTES - AUTHENTICATION
// ============================================================================

// Логин с валидацией и rate limiting
app.post('/api/auth/login',
  authLimiter,
  [
    body('email').trim().isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 6, max: 72 }).withMessage('Пароль должен быть от 6 до 72 символов')
  ],
  validate,
  async (req, res) => {
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
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Устанавливаем JWT в httpOnly cookie для защиты от XSS
      res.cookie('token', token, {
        httpOnly: true, // Недоступен для JavaScript
        secure: process.env.NODE_ENV === 'production', // HTTPS только в production
        sameSite: 'strict', // CSRF защита
        maxAge: 24 * 60 * 60 * 1000 // 24 часа
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json({
        message: 'Успешный вход в систему',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Ошибка входа:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

// Регистрация с валидацией
app.post('/api/auth/register',
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Имя должно быть от 2 до 100 символов'),
    body('email').trim().isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 8, max: 72 }).withMessage('Пароль должен быть от 8 до 72 символов'),
    body('role').optional().isIn(['admin', 'manager', 'developer']).withMessage('Некорректная роль'),
    body('department').optional().trim().isLength({ max: 100 }).withMessage('Отдел не более 100 символов'),
    body('position').optional().trim().isLength({ max: 100 }).withMessage('Должность не более 100 символов')
  ],
  validate,
  async (req, res) => {
    try {
      const { name, email, password, role = 'developer', department, position } = req.body;

      const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUser) {
        return res.status(400).json({ message: 'Не удалось создать аккаунт' });
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

      // Устанавливаем JWT в httpOnly cookie для защиты от XSS
      res.cookie('token', token, {
        httpOnly: true, // Недоступен для JavaScript
        secure: process.env.NODE_ENV === 'production', // HTTPS только в production
        sameSite: 'strict', // CSRF защита
        maxAge: 24 * 60 * 60 * 1000 // 24 часа
      });

      const newUser = await db.get('SELECT id, name, email, role, department, position FROM users WHERE id = ?', [userId]);
      res.status(201).json({
        message: 'Пользователь создан успешно',
        user: newUser
      });
    } catch (error) {
      console.error('Ошибка регистрации:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

// Проверка токена
app.post('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Выход из системы (очистка cookie)
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: 'Выход выполнен успешно' });
});

// ============================================================================
// API ROUTES - USERS (Protected)
// ============================================================================

app.get('/api/users',
  authenticateToken,
  checkRole(['admin', 'manager']),
  async (req, res) => {
    try {
      const users = await db.all('SELECT id, name, email, role, department, position, createdAt FROM users ORDER BY name');
      res.json(users);
    } catch (error) {
      console.error('Ошибка получения пользователей:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.post('/api/users',
  authenticateToken,
  checkRole(['admin']),
  [
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('email').trim().isEmail().normalizeEmail(),
    body('password').isLength({ min: 8, max: 72 }),
    body('role').isIn(['admin', 'manager', 'developer'])
  ],
  validate,
  async (req, res) => {
    try {
      const { name, email, password, role, department, position } = req.body;

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

      const newUser = await db.get('SELECT id, name, email, role, department, position FROM users WHERE id = ?', [userId]);
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Ошибка создания пользователя:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.put('/api/users/:id',
  authenticateToken,
  checkRole(['admin']),
  [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('email').optional().trim().isEmail().normalizeEmail(),
    body('role').optional().isIn(['admin', 'manager', 'developer'])
  ],
  validate,
  async (req, res) => {
    try {
      const { name, email, role, department, position } = req.body;

      const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      await db.run(
        'UPDATE users SET name = ?, email = ?, role = ?, department = ?, position = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [name || user.name, email || user.email, role || user.role, department, position, req.params.id]
      );

      const updatedUser = await db.get('SELECT id, name, email, role, department, position FROM users WHERE id = ?', [req.params.id]);
      res.json(updatedUser);
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.delete('/api/users/:id',
  authenticateToken,
  checkRole(['admin']),
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    try {
      const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
      res.json({ message: 'Пользователь удален' });
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

// ============================================================================
// API ROUTES - PROJECTS (Protected)
// ============================================================================

app.get('/api/projects',
  authenticateToken,
  apiLimiter,
  async (req, res) => {
    try {
      const projects = await db.all('SELECT * FROM projects ORDER BY createdAt DESC');
      res.json(projects);
    } catch (error) {
      console.error('Ошибка получения проектов:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.get('/api/projects/:id',
  authenticateToken,
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    try {
      const project = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
      if (!project) {
        return res.status(404).json({ message: 'Проект не найден' });
      }
      res.json(project);
    } catch (error) {
      console.error('Ошибка получения проекта:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.post('/api/projects',
  authenticateToken,
  checkRole(['admin', 'manager']),
  [
    body('name').trim().isLength({ min: 2, max: 200 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('startDate').optional().isISO8601().toDate(),
    body('endDate').optional().isISO8601().toDate(),
    body('status').optional().isIn(['active', 'completed', 'paused']),
    body('managerId').optional().isUUID()
  ],
  validate,
  async (req, res) => {
    try {
      const { name, description, startDate, endDate, status = 'active', managerId } = req.body;
      const projectId = uuidv4();

      await db.run(
        'INSERT INTO projects (id, name, description, startDate, endDate, status, managerId, progress) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [projectId, name, description, startDate, endDate, status, managerId, 0]
      );

      const newProject = await db.get('SELECT * FROM projects WHERE id = ?', [projectId]);
      res.status(201).json(newProject);
    } catch (error) {
      console.error('Ошибка создания проекта:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.put('/api/projects/:id',
  authenticateToken,
  checkRole(['admin', 'manager']),
  [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 2, max: 200 }),
    body('status').optional().isIn(['active', 'completed', 'paused'])
  ],
  validate,
  async (req, res) => {
    try {
      const project = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
      if (!project) {
        return res.status(404).json({ message: 'Проект не найден' });
      }

      const { name, description, startDate, endDate, status, managerId, progress } = req.body;

      await db.run(
        'UPDATE projects SET name = ?, description = ?, startDate = ?, endDate = ?, status = ?, managerId = ?, progress = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [
          name || project.name,
          description !== undefined ? description : project.description,
          startDate || project.startDate,
          endDate || project.endDate,
          status || project.status,
          managerId !== undefined ? managerId : project.managerId,
          progress !== undefined ? progress : project.progress,
          req.params.id
        ]
      );

      const updatedProject = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
      res.json(updatedProject);
    } catch (error) {
      console.error('Ошибка обновления проекта:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.delete('/api/projects/:id',
  authenticateToken,
  checkRole(['admin']),
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    try {
      const project = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
      if (!project) {
        return res.status(404).json({ message: 'Проект не найден' });
      }

      // Удаляем проект и все связанные задачи в транзакции
      // Это гарантирует атомарность: либо все удалится, либо ничего
      await db.runInTransaction(async () => {
        await db.run('DELETE FROM tasks WHERE projectId = ?', [req.params.id]);
        await db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
      });

      res.json({ message: 'Проект удален' });
    } catch (error) {
      console.error('Ошибка удаления проекта:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

// ============================================================================
// API ROUTES - TASKS (Protected)
// ============================================================================

app.get('/api/tasks',
  authenticateToken,
  apiLimiter,
  [query('projectId').optional().isUUID()],
  validate,
  async (req, res) => {
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
      console.error('Ошибка получения задач:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.get('/api/tasks/:id',
  authenticateToken,
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    try {
      const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
      if (!task) {
        return res.status(404).json({ message: 'Задача не найдена' });
      }
      res.json(task);
    } catch (error) {
      console.error('Ошибка получения задачи:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.post('/api/tasks',
  authenticateToken,
  [
    body('title').trim().isLength({ min: 2, max: 200 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('status').optional().isIn(['todo', 'in-progress', 'completed']),
    body('projectId').isUUID(),
    body('assigneeId').optional().isUUID(),
    body('dueDate').optional().isISO8601().toDate()
  ],
  validate,
  async (req, res) => {
    try {
      const { title, description, priority = 'medium', status = 'todo', projectId, assigneeId, dueDate, parentTaskId } = req.body;
      const taskId = uuidv4();

      await db.run(
        'INSERT INTO tasks (id, title, description, priority, status, projectId, assigneeId, dueDate, parentTaskId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [taskId, title, description, priority, status, projectId, assigneeId, dueDate, parentTaskId]
      );

      const newTask = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
      res.status(201).json(newTask);
    } catch (error) {
      console.error('Ошибка создания задачи:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.put('/api/tasks/:id',
  authenticateToken,
  [
    param('id').isUUID(),
    body('title').optional().trim().isLength({ min: 2, max: 200 }),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('status').optional().isIn(['todo', 'in-progress', 'completed'])
  ],
  validate,
  async (req, res) => {
    try {
      const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
      if (!task) {
        return res.status(404).json({ message: 'Задача не найдена' });
      }

      const { title, description, priority, status, assigneeId, dueDate } = req.body;

      await db.run(
        'UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, assigneeId = ?, dueDate = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [
          title || task.title,
          description !== undefined ? description : task.description,
          priority || task.priority,
          status || task.status,
          assigneeId !== undefined ? assigneeId : task.assigneeId,
          dueDate !== undefined ? dueDate : task.dueDate,
          req.params.id
        ]
      );

      const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
      res.json(updatedTask);
    } catch (error) {
      console.error('Ошибка обновления задачи:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.patch('/api/tasks/:id/status',
  authenticateToken,
  [
    param('id').isUUID(),
    body('status').isIn(['todo', 'in-progress', 'completed'])
  ],
  validate,
  async (req, res) => {
    try {
      const { status } = req.body;

      const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
      if (!task) {
        return res.status(404).json({ message: 'Задача не найдена' });
      }

      await db.run(
        'UPDATE tasks SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [status, req.params.id]
      );

      const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
      res.json(updatedTask);
    } catch (error) {
      console.error('Ошибка обновления статуса задачи:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.delete('/api/tasks/:id',
  authenticateToken,
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    try {
      const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
      if (!task) {
        return res.status(404).json({ message: 'Задача не найдена' });
      }

      // Удаляем задачу и все связанные данные в транзакции
      // Это гарантирует: либо все удалится атомарно, либо ничего
      await db.runInTransaction(async () => {
        await db.run('DELETE FROM comments WHERE taskId = ?', [req.params.id]);
        await db.run('DELETE FROM task_labels WHERE taskId = ?', [req.params.id]);
        await db.run('DELETE FROM tasks WHERE parentTaskId = ?', [req.params.id]);
        await db.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
      });

      res.json({ message: 'Задача удалена' });
    } catch (error) {
      console.error('Ошибка удаления задачи:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

// ============================================================================
// API ROUTES - COMMENTS (Protected)
// ============================================================================

app.get('/api/tasks/:taskId/comments',
  authenticateToken,
  [param('taskId').isUUID()],
  validate,
  async (req, res) => {
    try {
      const comments = await db.all(
        'SELECT c.*, u.name as userName FROM comments c JOIN users u ON c.userId = u.id WHERE c.taskId = ? ORDER BY c.createdAt ASC',
        [req.params.taskId]
      );
      res.json(comments);
    } catch (error) {
      console.error('Ошибка получения комментариев:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.post('/api/tasks/:taskId/comments',
  authenticateToken,
  [
    param('taskId').isUUID(),
    body('text').trim().isLength({ min: 1, max: 2000 })
  ],
  validate,
  async (req, res) => {
    try {
      const { text } = req.body;
      const commentId = uuidv4();
      const userId = req.user.userId;

      await db.run(
        'INSERT INTO comments (id, taskId, userId, text) VALUES (?, ?, ?, ?)',
        [commentId, req.params.taskId, userId, text]
      );

      const newComment = await db.get(
        'SELECT c.*, u.name as userName FROM comments c JOIN users u ON c.userId = u.id WHERE c.id = ?',
        [commentId]
      );
      res.status(201).json(newComment);
    } catch (error) {
      console.error('Ошибка создания комментария:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.put('/api/comments/:id',
  authenticateToken,
  [
    param('id').isUUID(),
    body('text').trim().isLength({ min: 1, max: 2000 })
  ],
  validate,
  async (req, res) => {
    try {
      const comment = await db.get('SELECT * FROM comments WHERE id = ?', [req.params.id]);
      if (!comment) {
        return res.status(404).json({ message: 'Комментарий не найден' });
      }

      // Проверка прав: только автор или admin могут редактировать
      if (comment.userId !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Нет прав для редактирования этого комментария' });
      }

      const { text } = req.body;
      await db.run('UPDATE comments SET text = ? WHERE id = ?', [text, req.params.id]);

      const updatedComment = await db.get(
        'SELECT c.*, u.name as userName FROM comments c JOIN users u ON c.userId = u.id WHERE c.id = ?',
        [req.params.id]
      );
      res.json(updatedComment);
    } catch (error) {
      console.error('Ошибка обновления комментария:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.delete('/api/comments/:id',
  authenticateToken,
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    try {
      const comment = await db.get('SELECT * FROM comments WHERE id = ?', [req.params.id]);
      if (!comment) {
        return res.status(404).json({ message: 'Комментарий не найден' });
      }

      // Проверка прав: только автор или admin могут удалять
      if (comment.userId !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Нет прав для удаления этого комментария' });
      }

      await db.run('DELETE FROM comments WHERE id = ?', [req.params.id]);
      res.json({ message: 'Комментарий удален' });
    } catch (error) {
      console.error('Ошибка удаления комментария:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

// ============================================================================
// API ROUTES - TEMPLATES (Protected)
// ============================================================================

app.get('/api/templates',
  authenticateToken,
  async (req, res) => {
    try {
      const templates = await db.all('SELECT * FROM templates ORDER BY name');
      res.json(templates);
    } catch (error) {
      console.error('Ошибка получения шаблонов:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.post('/api/templates',
  authenticateToken,
  checkRole(['admin', 'manager']),
  [
    body('name').trim().isLength({ min: 2, max: 200 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('estimatedHours').optional().isInt({ min: 0 })
  ],
  validate,
  async (req, res) => {
    try {
      const { name, description, priority = 'medium', estimatedHours } = req.body;
      const templateId = uuidv4();

      await db.run(
        'INSERT INTO templates (id, name, description, priority, estimatedHours) VALUES (?, ?, ?, ?, ?)',
        [templateId, name, description, priority, estimatedHours]
      );

      const newTemplate = await db.get('SELECT * FROM templates WHERE id = ?', [templateId]);
      res.status(201).json(newTemplate);
    } catch (error) {
      console.error('Ошибка создания шаблона:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.put('/api/templates/:id',
  authenticateToken,
  checkRole(['admin', 'manager']),
  [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 2, max: 200 }),
    body('priority').optional().isIn(['low', 'medium', 'high'])
  ],
  validate,
  async (req, res) => {
    try {
      const template = await db.get('SELECT * FROM templates WHERE id = ?', [req.params.id]);
      if (!template) {
        return res.status(404).json({ message: 'Шаблон не найден' });
      }

      const { name, description, priority, estimatedHours } = req.body;

      await db.run(
        'UPDATE templates SET name = ?, description = ?, priority = ?, estimatedHours = ? WHERE id = ?',
        [
          name || template.name,
          description !== undefined ? description : template.description,
          priority || template.priority,
          estimatedHours !== undefined ? estimatedHours : template.estimatedHours,
          req.params.id
        ]
      );

      const updatedTemplate = await db.get('SELECT * FROM templates WHERE id = ?', [req.params.id]);
      res.json(updatedTemplate);
    } catch (error) {
      console.error('Ошибка обновления шаблона:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.delete('/api/templates/:id',
  authenticateToken,
  checkRole(['admin', 'manager']),
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    try {
      const template = await db.get('SELECT * FROM templates WHERE id = ?', [req.params.id]);
      if (!template) {
        return res.status(404).json({ message: 'Шаблон не найден' });
      }

      await db.run('DELETE FROM templates WHERE id = ?', [req.params.id]);
      res.json({ message: 'Шаблон удален' });
    } catch (error) {
      console.error('Ошибка удаления шаблона:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

// ============================================================================
// API ROUTES - LABELS (Protected)
// ============================================================================

// Вспомогательная функция для валидации hex color
const isValidHexColor = (color) => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

// GET /api/labels - получить все метки
app.get('/api/labels',
  authenticateToken,
  async (req, res) => {
    try {
      const labels = await db.all('SELECT * FROM labels ORDER BY name');
      res.json(labels);
    } catch (error) {
      console.error('Ошибка получения меток:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

// POST /api/labels - создать новую метку
app.post('/api/labels',
  authenticateToken,
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Название метки должно быть от 2 до 50 символов'),
    body('color').custom((value) => {
      if (!isValidHexColor(value)) {
        throw new Error('Цвет должен быть в формате #RRGGBB');
      }
      return true;
    }),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Описание метки не должно превышать 500 символов')
  ],
  validate,
  async (req, res) => {
    try {
      const { name, color, description } = req.body;

      // Проверяем уникальность имени метки
      const existingLabel = await db.get('SELECT * FROM labels WHERE name = ?', [name]);
      if (existingLabel) {
        return res.status(400).json({ message: 'Метка с таким именем уже существует' });
      }

      const labelId = uuidv4();

      await db.run(
        'INSERT INTO labels (id, name, color, description) VALUES (?, ?, ?, ?)',
        [labelId, name, color, description || null]
      );

      const newLabel = await db.get('SELECT * FROM labels WHERE id = ?', [labelId]);
      res.status(201).json(newLabel);
    } catch (error) {
      console.error('Ошибка создания метки:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

// PUT /api/labels/:id - обновить метку
app.put('/api/labels/:id',
  authenticateToken,
  checkRole(['admin', 'manager']),
  [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('color').optional().custom((value) => {
      if (value && !isValidHexColor(value)) {
        throw new Error('Цвет должен быть в формате #RRGGBB');
      }
      return true;
    }),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Описание метки не должно превышать 500 символов')
  ],
  validate,
  async (req, res) => {
    try {
      const label = await db.get('SELECT * FROM labels WHERE id = ?', [req.params.id]);
      if (!label) {
        return res.status(404).json({ message: 'Метка не найдена' });
      }

      const { name, color, description } = req.body;

      // Проверяем уникальность имени, если оно изменяется
      if (name && name !== label.name) {
        const existingLabel = await db.get('SELECT * FROM labels WHERE name = ?', [name]);
        if (existingLabel) {
          return res.status(400).json({ message: 'Метка с таким именем уже существует' });
        }
      }

      await db.run(
        'UPDATE labels SET name = ?, color = ?, description = ? WHERE id = ?',
        [
          name || label.name,
          color || label.color,
          description !== undefined ? description : label.description,
          req.params.id
        ]
      );

      const updatedLabel = await db.get('SELECT * FROM labels WHERE id = ?', [req.params.id]);
      res.json(updatedLabel);
    } catch (error) {
      console.error('Ошибка обновления метки:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

// DELETE /api/labels/:id - удалить метку
app.delete('/api/labels/:id',
  authenticateToken,
  checkRole(['admin']),
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    try {
      const label = await db.get('SELECT * FROM labels WHERE id = ?', [req.params.id]);
      if (!label) {
        return res.status(404).json({ message: 'Метка не найдена' });
      }

      // Сначала удаляем все связи с задачами
      await db.run('DELETE FROM task_labels WHERE labelId = ?', [req.params.id]);

      // Затем удаляем саму метку
      await db.run('DELETE FROM labels WHERE id = ?', [req.params.id]);

      res.json({ message: 'Метка удалена' });
    } catch (error) {
      console.error('Ошибка удаления метки:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

// GET /api/tasks/:taskId/labels - получить метки задачи
app.get('/api/tasks/:taskId/labels',
  authenticateToken,
  [param('taskId').isUUID()],
  validate,
  async (req, res) => {
    try {
      // Проверяем существование задачи
      const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.taskId]);
      if (!task) {
        return res.status(404).json({ message: 'Задача не найдена' });
      }

      const labels = await db.all(
        `SELECT l.* FROM labels l
         INNER JOIN task_labels tl ON l.id = tl.labelId
         WHERE tl.taskId = ?
         ORDER BY l.name`,
        [req.params.taskId]
      );

      res.json(labels);
    } catch (error) {
      console.error('Ошибка получения меток задачи:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

// POST /api/tasks/:taskId/labels/:labelId - добавить метку к задаче
app.post('/api/tasks/:taskId/labels/:labelId',
  authenticateToken,
  [
    param('taskId').isUUID(),
    param('labelId').isUUID()
  ],
  validate,
  async (req, res) => {
    try {
      // Проверяем существование задачи
      const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.taskId]);
      if (!task) {
        return res.status(404).json({ message: 'Задача не найдена' });
      }

      // Проверяем существование метки
      const label = await db.get('SELECT * FROM labels WHERE id = ?', [req.params.labelId]);
      if (!label) {
        return res.status(404).json({ message: 'Метка не найдена' });
      }

      // Проверяем, не добавлена ли уже метка к задаче
      const existingRelation = await db.get(
        'SELECT * FROM task_labels WHERE taskId = ? AND labelId = ?',
        [req.params.taskId, req.params.labelId]
      );

      if (existingRelation) {
        return res.status(400).json({ message: 'Метка уже добавлена к этой задаче' });
      }

      await db.run(
        'INSERT INTO task_labels (taskId, labelId) VALUES (?, ?)',
        [req.params.taskId, req.params.labelId]
      );

      res.status(201).json({ message: 'Метка добавлена к задаче', label });
    } catch (error) {
      console.error('Ошибка добавления метки к задаче:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

// DELETE /api/tasks/:taskId/labels/:labelId - удалить метку из задачи
app.delete('/api/tasks/:taskId/labels/:labelId',
  authenticateToken,
  [
    param('taskId').isUUID(),
    param('labelId').isUUID()
  ],
  validate,
  async (req, res) => {
    try {
      // Проверяем существование связи
      const relation = await db.get(
        'SELECT * FROM task_labels WHERE taskId = ? AND labelId = ?',
        [req.params.taskId, req.params.labelId]
      );

      if (!relation) {
        return res.status(404).json({ message: 'Метка не найдена у этой задачи' });
      }

      await db.run(
        'DELETE FROM task_labels WHERE taskId = ? AND labelId = ?',
        [req.params.taskId, req.params.labelId]
      );

      res.json({ message: 'Метка удалена из задачи' });
    } catch (error) {
      console.error('Ошибка удаления метки из задачи:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

// ============================================================================
// API ROUTES - STATISTICS & ANALYTICS (Protected)
// ============================================================================

app.get('/api/stats',
  authenticateToken,
  async (req, res) => {
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
      console.error('Ошибка получения статистики:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.get('/api/search',
  authenticateToken,
  [
    query('q').trim().isLength({ min: 2, max: 100 }),
    query('type').optional().isIn(['projects', 'tasks'])
  ],
  validate,
  async (req, res) => {
    try {
      const { q: searchQuery, type } = req.query;
      const searchTerm = `%${searchQuery}%`;

      let projects = [];
      let tasks = [];

      if (!type || type === 'projects') {
        projects = await db.all(
          'SELECT * FROM projects WHERE name LIKE ? OR description LIKE ? LIMIT 50',
          [searchTerm, searchTerm]
        );
      }

      if (!type || type === 'tasks') {
        tasks = await db.all(
          'SELECT * FROM tasks WHERE title LIKE ? OR description LIKE ? LIMIT 50',
          [searchTerm, searchTerm]
        );
      }

      res.json({ projects, tasks });
    } catch (error) {
      console.error('Ошибка поиска:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.get('/api/overdue-tasks',
  authenticateToken,
  async (req, res) => {
    try {
      const now = new Date().toISOString();
      const overdueTasks = await db.all(
        "SELECT * FROM tasks WHERE dueDate < ? AND status != 'completed' ORDER BY dueDate ASC",
        [now]
      );
      res.json(overdueTasks);
    } catch (error) {
      console.error('Ошибка получения просроченных задач:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.get('/api/today-tasks',
  authenticateToken,
  async (req, res) => {
    try {
      const today = moment().format('YYYY-MM-DD');
      const todayTasks = await db.all(
        "SELECT * FROM tasks WHERE date(dueDate) = ? AND status != 'completed' ORDER BY priority DESC",
        [today]
      );
      res.json(todayTasks);
    } catch (error) {
      console.error('Ошибка получения задач на сегодня:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

// ============================================================================
// API ROUTES - EXPORT (Protected)
// ============================================================================

app.get('/api/export/projects',
  authenticateToken,
  async (req, res) => {
    try {
      const projects = await db.all('SELECT * FROM projects');

      // CSV с BOM для корректного отображения кириллицы в Excel
      const header = 'ID,Name,Description,Start Date,End Date,Status,Manager ID,Progress,Created At,Updated At\n';
      const rows = projects.map(p =>
        `"${p.id}","${p.name}","${p.description || ''}","${p.startDate || ''}","${p.endDate || ''}","${p.status}","${p.managerId || ''}","${p.progress || 0}","${p.createdAt}","${p.updatedAt}"`
      ).join('\n');

      const csv = '\ufeff' + header + rows; // BOM для Excel

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=projects.csv');
      res.send(csv);
    } catch (error) {
      console.error('Ошибка экспорта проектов:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

app.get('/api/export/tasks',
  authenticateToken,
  async (req, res) => {
    try {
      const tasks = await db.all('SELECT * FROM tasks');

      const header = 'ID,Title,Description,Priority,Status,Project ID,Assignee ID,Due Date,Parent Task ID,Created At,Updated At\n';
      const rows = tasks.map(t =>
        `"${t.id}","${t.title}","${t.description || ''}","${t.priority}","${t.status}","${t.projectId}","${t.assigneeId || ''}","${t.dueDate || ''}","${t.parentTaskId || ''}","${t.createdAt}","${t.updatedAt}"`
      ).join('\n');

      const csv = '\ufeff' + header + rows;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
      res.send(csv);
    } catch (error) {
      console.error('Ошибка экспорта задач:', error.message);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
);

// ============================================================================
// ERROR HANDLING MIDDLEWARE (должен быть последним)
// ============================================================================

app.use((err, req, res, next) => {
  const errorId = uuidv4();
  console.error(`[ERROR ${errorId}]`, err);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      errorId,
      message: 'CORS policy error'
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      errorId,
      message: 'Validation error',
      details: err.details
    });
  }

  res.status(err.status || 500).json({
    errorId,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// ============================================================================
// REACT APP ROUTE (должен быть последним)
// ============================================================================

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

async function startServer() {
  try {
    await db.init();
    app.listen(PORT, '0.0.0.0', () => {
      console.log('='.repeat(60));
      console.log('🚀 PM Tool Server - Production Ready');
      console.log('='.repeat(60));
      console.log(`📡 Server running on port: ${PORT}`);
      console.log(`📊 Database: ${db.dbPath}`);
      console.log(`🌐 Access: http://localhost:${PORT}`);
      console.log(`🔒 Security: Enabled (Helmet, CORS, Rate Limiting)`);
      console.log(`🔐 Demo accounts:`);
      console.log(`   Admin: admin@example.com / admin123`);
      console.log(`   Manager: manager@example.com / manager123`);
      console.log(`   Developer: developer@example.com / dev123`);
      console.log('='.repeat(60));
      console.log(`⚠️  Make sure JWT_SECRET is set in .env file!`);
      console.log('='.repeat(60));
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  db.close();
  process.exit(0);
});

// Обработка необработанных ошибок
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});
