const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Database = require('./database');
const validation = require('./middleware/validation');

// Загружаем переменные окружения
require('dotenv').config();

// Валидация обязательных переменных окружения
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`ОШИБКА: Отсутствуют обязательные переменные окружения: ${missingEnvVars.join(', ')}`);
  console.error('Создайте файл .env на основе env.example и задайте все необходимые значения');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Раздача статических файлов React приложения
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

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
    // Проверяем наличие аутентифицированного пользователя
    if (!req.user) {
      return res.status(401).json({ message: 'Требуется аутентификация' });
    }

    // Проверяем роль пользователя
    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Недостаточно прав для выполнения операции' });
    }
  };
};

// Middleware для логирования действий
const logAction = (action) => {
  return (req, res, next) => {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const userName = req.user ? `${req.user.name} (${req.user.role})` : 'Неавторизован';
    console.log(`[${timestamp}] ${userName}: ${action} - ${req.method} ${req.path}`);
    next();
  };
};

// Инициализация базы данных
const db = new Database();

// Инициализируем БД при старте
(async () => {
  try {
    await db.init();
    console.log('База данных инициализирована успешно');
  } catch (error) {
    console.error('Ошибка инициализации базы данных:', error);
    process.exit(1);
  }
})();

// УДАЛЕНО: Старые in-memory массивы заменены на SQLite БД
// Все данные теперь хранятся в базе данных SQLite

// Хешируем пароли для демонстрации (в реальном приложении это делается при регистрации)
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Аутентификация
app.post('/api/auth/login', validation.loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Находим пользователя в БД
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Проверяем пароль
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Создаем JWT токен
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Возвращаем пользователя без пароля
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.post('/api/auth/register', validation.registerValidation, async (req, res) => {
  try {
    const { name, email, password, role = 'developer', department, position } = req.body;

    // Проверяем, существует ли пользователь в БД
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя в БД
    const newUserId = uuidv4();
    await db.run(
      'INSERT INTO users (id, name, email, password, role, department, position) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [newUserId, name, email, hashedPassword, role, department, position]
    );

    // Получаем созданного пользователя
    const newUser = await db.get('SELECT * FROM users WHERE id = ?', [newUserId]);

    // Создаем JWT токен
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Возвращаем пользователя без пароля
    const { password: _, ...userWithoutPassword } = newUser;
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.post('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Routes для пользователей
app.get('/api/users', authenticateToken, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    // Получаем пользователей из БД
    const users = await db.all('SELECT id, name, email, role, department, position, createdAt, updatedAt FROM users');
    res.json(users);
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.post('/api/users', authenticateToken, checkRole(['admin']), logAction('Создание пользователя'), validation.userValidation, async (req, res) => {
  try {
    const { name, email, password = 'password123', role = 'developer', department, position } = req.body;

    // Проверяем, существует ли пользователь
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя в БД
    const newUserId = uuidv4();
    await db.run(
      'INSERT INTO users (id, name, email, password, role, department, position) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [newUserId, name, email, hashedPassword, role, department, position]
    );

    // Получаем созданного пользователя
    const newUser = await db.get(
      'SELECT id, name, email, role, department, position, createdAt, updatedAt FROM users WHERE id = ?',
      [newUserId]
    );
    res.json(newUser);
  } catch (error) {
    console.error('Ошибка создания пользователя:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.put('/api/users/:id', authenticateToken, checkRole(['admin']), logAction('Обновление пользователя'), validation.userValidation, async (req, res) => {
  try {
    const { name, email, role, department, position } = req.body;

    // Проверяем существование пользователя
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Обновляем пользователя
    await db.run(
      'UPDATE users SET name = ?, email = ?, role = ?, department = ?, position = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [name || user.name, email || user.email, role || user.role, department || user.department, position || user.position, req.params.id]
    );

    // Получаем обновленного пользователя
    const updatedUser = await db.get(
      'SELECT id, name, email, role, department, position, createdAt, updatedAt FROM users WHERE id = ?',
      [req.params.id]
    );
    res.json(updatedUser);
  } catch (error) {
    console.error('Ошибка обновления пользователя:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.delete('/api/users/:id', authenticateToken, checkRole(['admin']), logAction('Удаление пользователя'), async (req, res) => {
  try {
    // Проверяем существование пользователя
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Удаляем пользователя
    await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Пользователь удален' });
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Шаблоны задач
app.get('/api/templates', authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;

    let query = 'SELECT * FROM templates';
    let params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    const templates = await db.all(query, params);
    res.json(templates);
  } catch (error) {
    console.error('Ошибка получения шаблонов:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.post('/api/templates', authenticateToken, validation.templateValidation, async (req, res) => {
  try {
    const { name, description, priority = 'medium', category, estimatedHours } = req.body;
    const newTemplateId = uuidv4();

    await db.run(
      'INSERT INTO templates (id, name, description, priority, category, estimatedHours) VALUES (?, ?, ?, ?, ?, ?)',
      [newTemplateId, name, description, priority, category, estimatedHours]
    );

    const newTemplate = await db.get('SELECT * FROM templates WHERE id = ?', [newTemplateId]);
    res.json(newTemplate);
  } catch (error) {
    console.error('Ошибка создания шаблона:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.put('/api/templates/:id', authenticateToken, validation.templateValidation, async (req, res) => {
  try {
    const template = await db.get('SELECT * FROM templates WHERE id = ?', [req.params.id]);
    if (!template) {
      return res.status(404).json({ message: 'Шаблон не найден' });
    }

    const { name, description, priority, category, estimatedHours } = req.body;

    await db.run(
      'UPDATE templates SET name = ?, description = ?, priority = ?, category = ?, estimatedHours = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [
        name || template.name,
        description !== undefined ? description : template.description,
        priority || template.priority,
        category || template.category,
        estimatedHours !== undefined ? estimatedHours : template.estimatedHours,
        req.params.id
      ]
    );

    const updatedTemplate = await db.get('SELECT * FROM templates WHERE id = ?', [req.params.id]);
    res.json(updatedTemplate);
  } catch (error) {
    console.error('Ошибка обновления шаблона:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.delete('/api/templates/:id', authenticateToken, async (req, res) => {
  try {
    const template = await db.get('SELECT * FROM templates WHERE id = ?', [req.params.id]);
    if (!template) {
      return res.status(404).json({ message: 'Шаблон не найден' });
    }

    await db.run('DELETE FROM templates WHERE id = ?', [req.params.id]);
    res.json({ message: 'Шаблон удален' });
  } catch (error) {
    console.error('Ошибка удаления шаблона:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Комментарии к задачам
app.get('/api/tasks/:taskId/comments', authenticateToken, async (req, res) => {
  try {
    const taskComments = await db.all('SELECT * FROM comments WHERE taskId = ?', [req.params.taskId]);
    res.json(taskComments);
  } catch (error) {
    console.error('Ошибка получения комментариев:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.post('/api/tasks/:taskId/comments', authenticateToken, validation.commentValidation, async (req, res) => {
  try {
    const { content, authorId } = req.body;
    const newCommentId = uuidv4();

    await db.run(
      'INSERT INTO comments (id, taskId, content, authorId) VALUES (?, ?, ?, ?)',
      [newCommentId, req.params.taskId, content, authorId]
    );

    const newComment = await db.get('SELECT * FROM comments WHERE id = ?', [newCommentId]);
    res.json(newComment);
  } catch (error) {
    console.error('Ошибка создания комментария:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.put('/api/comments/:id', authenticateToken, validation.commentValidation, async (req, res) => {
  try {
    const comment = await db.get('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }

    await db.run(
      'UPDATE comments SET content = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [req.body.content, req.params.id]
    );

    const updatedComment = await db.get('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    res.json(updatedComment);
  } catch (error) {
    console.error('Ошибка обновления комментария:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
  try {
    const comment = await db.get('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }

    await db.run('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Комментарий удален' });
  } catch (error) {
    console.error('Ошибка удаления комментария:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Routes для проектов
app.get('/api/projects', authenticateToken, checkRole(['admin', 'manager', 'developer']), async (req, res) => {
  try {
    const projects = await db.all('SELECT * FROM projects');
    res.json(projects);
  } catch (error) {
    console.error('Ошибка получения проектов:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/projects/:id', authenticateToken, checkRole(['admin', 'manager', 'developer']), async (req, res) => {
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

app.post('/api/projects', authenticateToken, checkRole(['admin', 'manager']), logAction('Создание проекта'), validation.projectValidation, async (req, res) => {
  try {
    const { name, description, startDate, endDate, status = 'active', managerId } = req.body;
    const newProjectId = uuidv4();

    await db.run(
      'INSERT INTO projects (id, name, description, startDate, endDate, status, managerId, progress) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [newProjectId, name, description, startDate, endDate, status, managerId, 0]
    );

    const newProject = await db.get('SELECT * FROM projects WHERE id = ?', [newProjectId]);
    res.json(newProject);
  } catch (error) {
    console.error('Ошибка создания проекта:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.put('/api/projects/:id', authenticateToken, checkRole(['admin', 'manager']), logAction('Обновление проекта'), validation.projectValidation, async (req, res) => {
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
        managerId || project.managerId,
        progress !== undefined ? progress : project.progress,
        req.params.id
      ]
    );

    const updatedProject = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    res.json(updatedProject);
  } catch (error) {
    console.error('Ошибка обновления проекта:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.delete('/api/projects/:id', authenticateToken, checkRole(['admin']), logAction('Удаление проекта'), async (req, res) => {
  try {
    const project = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    // Удаляем все задачи проекта
    await db.run('DELETE FROM tasks WHERE projectId = ?', [req.params.id]);

    // Удаляем проект
    await db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Проект удален' });
  } catch (error) {
    console.error('Ошибка удаления проекта:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Routes для задач
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.query;

    let query = 'SELECT * FROM tasks';
    let params = [];

    if (projectId) {
      query += ' WHERE projectId = ?';
      params.push(projectId);
    }

    const tasks = await db.all(query, params);
    res.json(tasks);
  } catch (error) {
    console.error('Ошибка получения задач:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }
    res.json(task);
  } catch (error) {
    console.error('Ошибка получения задачи:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.post('/api/tasks', authenticateToken, validation.taskValidation, async (req, res) => {
  try {
    const { title, description, priority = 'medium', status = 'todo', projectId, assigneeId, dueDate, parentTaskId } = req.body;
    const newTaskId = uuidv4();

    await db.run(
      'INSERT INTO tasks (id, title, description, priority, status, projectId, assigneeId, dueDate, parentTaskId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newTaskId, title, description, priority, status, projectId, assigneeId, dueDate, parentTaskId]
    );

    const newTask = await db.get('SELECT * FROM tasks WHERE id = ?', [newTaskId]);
    res.json(newTask);
  } catch (error) {
    console.error('Ошибка создания задачи:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.put('/api/tasks/:id', authenticateToken, validation.taskValidation, async (req, res) => {
  try {
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    const { title, description, priority, status, projectId, assigneeId, dueDate, parentTaskId } = req.body;

    await db.run(
      'UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, projectId = ?, assigneeId = ?, dueDate = ?, parentTaskId = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [
        title || task.title,
        description !== undefined ? description : task.description,
        priority || task.priority,
        status || task.status,
        projectId !== undefined ? projectId : task.projectId,
        assigneeId !== undefined ? assigneeId : task.assigneeId,
        dueDate !== undefined ? dueDate : task.dueDate,
        parentTaskId !== undefined ? parentTaskId : task.parentTaskId,
        req.params.id
      ]
    );

    const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(updatedTask);
  } catch (error) {
    console.error('Ошибка обновления задачи:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Обновление статуса задачи (для Kanban)
app.patch('/api/tasks/:id/status', authenticateToken, validation.taskStatusValidation, async (req, res) => {
  try {
    const { status } = req.body;

    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    if (!['todo', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Неверный статус' });
    }

    await db.run(
      'UPDATE tasks SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [status, req.params.id]
    );

    const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(updatedTask);
  } catch (error) {
    console.error('Ошибка обновления статуса задачи:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    // Удаляем все комментарии к задаче
    await db.run('DELETE FROM comments WHERE taskId = ?', [req.params.id]);

    // Удаляем все подзадачи
    await db.run('DELETE FROM tasks WHERE parentTaskId = ?', [req.params.id]);

    // Удаляем саму задачу
    await db.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);

    res.json({ message: 'Задача удалена' });
  } catch (error) {
    console.error('Ошибка удаления задачи:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Поиск
app.get('/api/search', authenticateToken, async (req, res) => {
  try {
    const { q: query, type } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({ projects: [], tasks: [] });
    }

    const searchTerm = `%${query.toLowerCase().trim()}%`;

    let matchingProjects = [];
    let matchingTasks = [];

    // Поиск проектов
    if (!type || type === 'projects') {
      matchingProjects = await db.all(
        'SELECT * FROM projects WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ?',
        [searchTerm, searchTerm]
      );
    }

    // Поиск задач
    if (!type || type === 'tasks') {
      matchingTasks = await db.all(
        'SELECT * FROM tasks WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ?',
        [searchTerm, searchTerm]
      );
    }

    res.json({ projects: matchingProjects, tasks: matchingTasks });
  } catch (error) {
    console.error('Ошибка поиска:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Просроченные задачи
app.get('/api/overdue-tasks', authenticateToken, async (req, res) => {
  try {
    const now = moment().format('YYYY-MM-DD');
    const overdueTasks = await db.all(
      "SELECT * FROM tasks WHERE dueDate IS NOT NULL AND dueDate < ? AND status != 'completed'",
      [now]
    );
    res.json(overdueTasks);
  } catch (error) {
    console.error('Ошибка получения просроченных задач:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Задачи, истекающие сегодня
app.get('/api/today-tasks', authenticateToken, async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const todayTasks = await db.all(
      "SELECT * FROM tasks WHERE dueDate = ? AND status != 'completed'",
      [today]
    );
    res.json(todayTasks);
  } catch (error) {
    console.error('Ошибка получения задач на сегодня:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Экспорт данных
app.get('/api/export/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await db.all('SELECT * FROM projects');
    const users = await db.all('SELECT * FROM users');

    const csvHeader = 'ID,Название,Описание,Статус,Дата начала,Дата окончания,Менеджер,Создан,Обновлен\n';
    const csvData = projects.map(project => {
      const manager = users.find(u => u.id === project.managerId);
      return [
        project.id,
        `"${project.name}"`,
        `"${project.description || ''}"`,
        project.status,
        project.startDate ? moment(project.startDate).format('DD.MM.YYYY') : '',
        project.endDate ? moment(project.endDate).format('DD.MM.YYYY') : '',
        manager ? `"${manager.name}"` : '',
        moment(project.createdAt).format('DD.MM.YYYY HH:mm'),
        moment(project.updatedAt).format('DD.MM.YYYY HH:mm')
      ].join(',');
    }).join('\n');

    const csv = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=projects_${moment().format('YYYY-MM-DD')}.csv`);
    res.send('\ufeff' + csv); // BOM для правильного отображения кириллицы в Excel
  } catch (error) {
    console.error('Ошибка экспорта проектов:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/export/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await db.all('SELECT * FROM tasks');
    const projects = await db.all('SELECT * FROM projects');
    const users = await db.all('SELECT * FROM users');

    const csvHeader = 'ID,Название,Описание,Приоритет,Статус,Проект,Исполнитель,Срок,Создан,Обновлен\n';
    const csvData = tasks.map(task => {
      const project = projects.find(p => p.id === task.projectId);
      const assignee = users.find(u => u.id === task.assigneeId);
      return [
        task.id,
        `"${task.title}"`,
        `"${task.description || ''}"`,
        task.priority,
        task.status,
        project ? `"${project.name}"` : '',
        assignee ? `"${assignee.name}"` : '',
        task.dueDate ? moment(task.dueDate).format('DD.MM.YYYY') : '',
        moment(task.createdAt).format('DD.MM.YYYY HH:mm'),
        moment(task.updatedAt).format('DD.MM.YYYY HH:mm')
      ].join(',');
    }).join('\n');

    const csv = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=tasks_${moment().format('YYYY-MM-DD')}.csv`);
    res.send('\ufeff' + csv); // BOM для правильного отображения кириллицы в Excel
  } catch (error) {
    console.error('Ошибка экспорта задач:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/export/all', authenticateToken, async (req, res) => {
  try {
    const projects = await db.all('SELECT * FROM projects');
    const tasks = await db.all('SELECT * FROM tasks');
    const users = await db.all('SELECT * FROM users');

    const csvHeader = 'Тип,ID,Название,Описание,Статус,Приоритет,Проект,Исполнитель,Срок,Создан,Обновлен\n';

    // Добавляем проекты
    const projectsData = projects.map(project => {
      const manager = users.find(u => u.id === project.managerId);
      return [
        'Проект',
        project.id,
        `"${project.name}"`,
        `"${project.description || ''}"`,
        project.status,
        '',
        '',
        manager ? `"${manager.name}"` : '',
        project.endDate ? moment(project.endDate).format('DD.MM.YYYY') : '',
        moment(project.createdAt).format('DD.MM.YYYY HH:mm'),
        moment(project.updatedAt).format('DD.MM.YYYY HH:mm')
      ].join(',');
    });

    // Добавляем задачи
    const tasksData = tasks.map(task => {
      const project = projects.find(p => p.id === task.projectId);
      const assignee = users.find(u => u.id === task.assigneeId);
      return [
        'Задача',
        task.id,
        `"${task.title}"`,
        `"${task.description || ''}"`,
        task.status,
        task.priority,
        project ? `"${project.name}"` : '',
        assignee ? `"${assignee.name}"` : '',
        task.dueDate ? moment(task.dueDate).format('DD.MM.YYYY') : '',
        moment(task.createdAt).format('DD.MM.YYYY HH:mm'),
        moment(task.updatedAt).format('DD.MM.YYYY HH:mm')
      ].join(',');
    });

    const csv = csvHeader + projectsData.join('\n') + '\n' + tasksData.join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=all_data_${moment().format('YYYY-MM-DD')}.csv`);
    res.send('\ufeff' + csv); // BOM для правильного отображения кириллицы в Excel
  } catch (error) {
    console.error('Ошибка экспорта всех данных:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Статистика
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const projects = await db.all('SELECT * FROM projects');
    const tasks = await db.all('SELECT * FROM tasks');

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const todoTasks = tasks.filter(t => t.status === 'todo').length;

    res.json({
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        todo: todoTasks
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

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
