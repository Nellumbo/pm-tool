const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Загружаем переменные окружения
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
    // Если используется JWT аутентификация
    if (req.user) {
      if (allowedRoles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({ message: 'Недостаточно прав для выполнения операции' });
      }
    } else {
      // Fallback для демонстрации (заголовок)
      const userRole = req.headers['x-user-role'] || 'developer';
      if (allowedRoles.includes(userRole)) {
        req.userRole = userRole;
        next();
      } else {
        res.status(403).json({ message: 'Недостаточно прав для выполнения операции' });
      }
    }
  };
};

// Middleware для логирования действий
const logAction = (action) => {
  return (req, res, next) => {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const userRole = req.headers['x-user-role'] || 'developer';
    console.log(`[${timestamp}] ${userRole}: ${action} - ${req.method} ${req.path}`);
    next();
  };
};

// In-memory storage (в реальном приложении используйте базу данных)
let projects = [];
let tasks = [];
let comments = [];

// Добавляем тестовые данные
projects = [
  {
    id: '1',
    name: 'Разработка веб-приложения',
    description: 'Создание современного веб-приложения для управления проектами с использованием React и Node.js',
    startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
    endDate: moment().add(60, 'days').format('YYYY-MM-DD'),
    status: 'active',
    managerId: '2', // Менеджер проектов
    createdAt: moment().subtract(30, 'days').format(),
    updatedAt: moment().format()
  },
  {
    id: '2',
    name: 'Мобильное приложение',
    description: 'Разработка мобильного приложения для iOS и Android с синхронизацией данных',
    startDate: moment().subtract(15, 'days').format('YYYY-MM-DD'),
    endDate: moment().add(90, 'days').format('YYYY-MM-DD'),
    status: 'active',
    managerId: '2', // Менеджер проектов
    createdAt: moment().subtract(15, 'days').format(),
    updatedAt: moment().format()
  },
  {
    id: '3',
    name: 'Система аналитики',
    description: 'Внедрение системы аналитики и отчетности для отслеживания KPI',
    startDate: moment().subtract(45, 'days').format('YYYY-MM-DD'),
    endDate: moment().subtract(5, 'days').format('YYYY-MM-DD'),
    status: 'completed',
    managerId: '1', // Администратор
    createdAt: moment().subtract(45, 'days').format(),
    updatedAt: moment().subtract(5, 'days').format()
  }
];

tasks = [
  // Задачи для проекта "Разработка веб-приложения"
  {
    id: '1',
    title: 'Настройка инфраструктуры',
    description: 'Настройка сервера разработки, установка зависимостей и настройка CI/CD',
    priority: 'high',
    status: 'completed',
    projectId: '1',
    assigneeId: '1', // Администратор
    dueDate: moment().subtract(25, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(30, 'days').format(),
    updatedAt: moment().subtract(25, 'days').format()
  },
  {
    id: '2',
    title: 'Создание дизайн-системы',
    description: 'Разработка UI/UX дизайна, создание компонентной библиотеки',
    priority: 'high',
    status: 'in-progress',
    projectId: '1',
    assigneeId: '3', // Разработчик
    dueDate: moment().add(10, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(28, 'days').format(),
    updatedAt: moment().subtract(2, 'days').format()
  },
  {
    id: '3',
    title: 'API для аутентификации',
    description: 'Реализация JWT аутентификации, регистрация и авторизация пользователей',
    priority: 'high',
    status: 'completed',
    projectId: '1',
    assigneeId: '3', // Разработчик
    dueDate: moment().subtract(20, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(25, 'days').format(),
    updatedAt: moment().subtract(20, 'days').format()
  },
  {
    id: '4',
    title: 'Frontend компоненты',
    description: 'Создание основных React компонентов для интерфейса',
    priority: 'medium',
    status: 'in-progress',
    projectId: '1',
    assigneeId: '3', // Разработчик
    dueDate: moment().add(15, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(20, 'days').format(),
    updatedAt: moment().subtract(1, 'days').format()
  },
  {
    id: '5',
    title: 'Интеграционные тесты',
    description: 'Написание и запуск интеграционных тестов для API',
    priority: 'medium',
    status: 'todo',
    projectId: '1',
    assigneeId: '4', // Тестировщик
    dueDate: moment().add(20, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(15, 'days').format(),
    updatedAt: moment().subtract(15, 'days').format()
  },
  
  // Задачи для проекта "Мобильное приложение"
  {
    id: '6',
    title: 'Архитектура приложения',
    description: 'Проектирование архитектуры мобильного приложения, выбор технологий',
    priority: 'high',
    status: 'completed',
    projectId: '2',
    assigneeId: '3', // Разработчик
    dueDate: moment().subtract(10, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(15, 'days').format(),
    updatedAt: moment().subtract(10, 'days').format()
  },
  {
    id: '7',
    title: 'UI/UX дизайн мобильного приложения',
    description: 'Создание дизайна экранов и пользовательских сценариев',
    priority: 'medium',
    status: 'in-progress',
    projectId: '2',
    assigneeId: '3', // Разработчик
    dueDate: moment().add(25, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(12, 'days').format(),
    updatedAt: moment().subtract(1, 'days').format()
  },
  {
    id: '8',
    title: 'Настройка синхронизации данных',
    description: 'Реализация синхронизации между мобильным приложением и сервером',
    priority: 'high',
    status: 'todo',
    projectId: '2',
    assigneeId: '3', // Разработчик
    dueDate: moment().add(40, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(8, 'days').format(),
    updatedAt: moment().subtract(8, 'days').format()
  },
  
  // Задачи для завершенного проекта "Система аналитики"
  {
    id: '9',
    title: 'Исследование требований',
    description: 'Анализ бизнес-требований и выбор инструментов аналитики',
    priority: 'high',
    status: 'completed',
    projectId: '3',
    assigneeId: '2', // Менеджер проектов
    dueDate: moment().subtract(40, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(45, 'days').format(),
    updatedAt: moment().subtract(40, 'days').format()
  },
  {
    id: '10',
    title: 'Внедрение Google Analytics',
    description: 'Настройка и интеграция Google Analytics для отслеживания метрик',
    priority: 'medium',
    status: 'completed',
    projectId: '3',
    assigneeId: '3', // Разработчик
    dueDate: moment().subtract(20, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(35, 'days').format(),
    updatedAt: moment().subtract(20, 'days').format()
  },
  {
    id: '11',
    title: 'Создание дашборда отчетов',
    description: 'Разработка дашборда для визуализации аналитических данных',
    priority: 'high',
    status: 'completed',
    projectId: '3',
    assigneeId: '3', // Разработчик
    dueDate: moment().subtract(10, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(25, 'days').format(),
    updatedAt: moment().subtract(10, 'days').format()
  },
  {
    id: '12',
    title: 'Тестирование системы аналитики',
    description: 'Комплексное тестирование всех компонентов системы аналитики',
    priority: 'medium',
    status: 'completed',
    projectId: '3',
    assigneeId: '4', // Тестировщик
    dueDate: moment().subtract(5, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(15, 'days').format(),
    updatedAt: moment().subtract(5, 'days').format()
  }
];

// Добавляем тестовые комментарии
comments = [
  {
    id: '1',
    taskId: '2',
    content: 'Начал работу над дизайн-системой. Создал базовые компоненты кнопок и форм.',
    authorId: '3', // Разработчик
    createdAt: moment().subtract(5, 'days').format(),
    updatedAt: moment().subtract(5, 'days').format()
  },
  {
    id: '2',
    taskId: '2',
    content: 'Нужно добавить поддержку темной темы в дизайн-систему.',
    authorId: '1', // Администратор
    createdAt: moment().subtract(3, 'days').format(),
    updatedAt: moment().subtract(3, 'days').format()
  },
  {
    id: '3',
    taskId: '4',
    content: 'Создал основные компоненты: Header, Sidebar, Modal. Осталось доделать таблицы.',
    authorId: '3', // Разработчик
    createdAt: moment().subtract(1, 'days').format(),
    updatedAt: moment().subtract(1, 'days').format()
  },
  {
    id: '4',
    taskId: '7',
    content: 'Дизайн экранов готов. Жду фидбека от заказчика.',
    authorId: '3', // Разработчик
    createdAt: moment().subtract(2, 'days').format(),
    updatedAt: moment().subtract(2, 'days').format()
  },
  {
    id: '5',
    taskId: '5',
    content: 'Начну писать тесты на следующей неделе.',
    authorId: '4', // Тестировщик
    createdAt: moment().subtract(1, 'days').format(),
    updatedAt: moment().subtract(1, 'days').format()
  }
];

// Хешируем пароли для демонстрации (в реальном приложении это делается при регистрации)
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Создаем пользователей с хешированными паролями
let users = [
  {
    id: '1',
    name: 'Администратор',
    email: 'admin@example.com',
    password: '$2b$10$FNd6iKn/Yxq7UtatAgTaZuHg3QIfnt1u6b/JL9KfNyVIWV3/nrywC', // admin123
    role: 'admin',
    department: 'Управление',
    position: 'Администратор системы'
  },
  {
    id: '2',
    name: 'Менеджер проектов',
    email: 'manager@example.com',
    password: '$2b$10$KXP9dDOxT6CHhsMq6phOvuSSDTFMR7zN3jYv3XD3S6Pexgdmew6Dm', // manager123
    role: 'manager',
    department: 'Управление проектами',
    position: 'Менеджер проектов'
  },
  {
    id: '3',
    name: 'Разработчик',
    email: 'developer@example.com',
    password: '$2b$10$XRXiMM8Zbdyl2D2cNQA9N.RSw9oDnXeGM9Rm6VTB1IgNO8GLSM3Oe', // dev123
    role: 'developer',
    department: 'Разработка',
    position: 'Разработчик'
  },
  {
    id: '4',
    name: 'Тестировщик',
    email: 'tester@example.com',
    password: '$2b$10$RlGL.6MIvap1eRQJPesfbOYv4fgSIlUUJyLqVWKeY9lwychCTmf.q', // test123
    role: 'developer',
    department: 'QA',
    position: 'Тестировщик'
  }
];
let templates = [
  {
    id: '1',
    name: 'Разработка функционала',
    description: 'Создание новой функциональности',
    priority: 'high',
    category: 'development'
  },
  {
    id: '2',
    name: 'Исправление ошибки',
    description: 'Исправление бага в системе',
    priority: 'high',
    category: 'bugfix'
  },
  {
    id: '3',
    name: 'Тестирование',
    description: 'Проведение тестирования функционала',
    priority: 'medium',
    category: 'testing'
  },
  {
    id: '4',
    name: 'Документация',
    description: 'Создание или обновление документации',
    priority: 'low',
    category: 'documentation'
  },
  {
    id: '5',
    name: 'Встреча с клиентом',
    description: 'Проведение встречи с заказчиком',
    priority: 'medium',
    category: 'meeting'
  }
];

// Аутентификация
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Находим пользователя
    const user = users.find(u => u.email === email);
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

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'developer', department, position } = req.body;
    
    // Проверяем, существует ли пользователь
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }
    
    // Хешируем пароль
    const hashedPassword = await hashPassword(password);
    
    // Создаем пользователя
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role,
      department,
      position,
      createdAt: moment().format()
    };
    
    users.push(newUser);
    
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
app.get('/api/users', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  // Возвращаем пользователей без паролей
  const usersWithoutPasswords = users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  res.json(usersWithoutPasswords);
});

app.post('/api/users', checkRole(['admin']), logAction('Создание пользователя'), (req, res) => {
  const { name, email, role = 'developer', department, position } = req.body;
  const newUser = {
    id: uuidv4(),
    name,
    email,
    role,
    department,
    position,
    createdAt: moment().format()
  };
  users.push(newUser);
  res.json(newUser);
});

app.put('/api/users/:id', checkRole(['admin']), logAction('Обновление пользователя'), (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }
  
  const updatedUser = {
    ...users[userIndex],
    ...req.body,
    updatedAt: moment().format()
  };
  users[userIndex] = updatedUser;
  res.json(updatedUser);
});

app.delete('/api/users/:id', checkRole(['admin']), logAction('Удаление пользователя'), (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }
  
  users.splice(userIndex, 1);
  res.json({ message: 'Пользователь удален' });
});

// Шаблоны задач
app.get('/api/templates', (req, res) => {
  const { category } = req.query;
  
  if (category) {
    const filteredTemplates = templates.filter(t => t.category === category);
    res.json(filteredTemplates);
  } else {
    res.json(templates);
  }
});

app.post('/api/templates', (req, res) => {
  const { name, description, priority = 'medium', category } = req.body;
  const newTemplate = {
    id: uuidv4(),
    name,
    description,
    priority,
    category,
    createdAt: moment().format()
  };
  templates.push(newTemplate);
  res.json(newTemplate);
});

app.put('/api/templates/:id', (req, res) => {
  const templateIndex = templates.findIndex(t => t.id === req.params.id);
  if (templateIndex === -1) {
    return res.status(404).json({ message: 'Шаблон не найден' });
  }
  
  const updatedTemplate = {
    ...templates[templateIndex],
    ...req.body,
    updatedAt: moment().format()
  };
  templates[templateIndex] = updatedTemplate;
  res.json(updatedTemplate);
});

app.delete('/api/templates/:id', (req, res) => {
  const templateIndex = templates.findIndex(t => t.id === req.params.id);
  if (templateIndex === -1) {
    return res.status(404).json({ message: 'Шаблон не найден' });
  }
  
  templates.splice(templateIndex, 1);
  res.json({ message: 'Шаблон удален' });
});

// Комментарии к задачам
app.get('/api/tasks/:taskId/comments', (req, res) => {
  const taskComments = comments.filter(c => c.taskId === req.params.taskId);
  res.json(taskComments);
});

app.post('/api/tasks/:taskId/comments', (req, res) => {
  const { content, authorId } = req.body;
  const newComment = {
    id: uuidv4(),
    taskId: req.params.taskId,
    content,
    authorId,
    createdAt: moment().format(),
    updatedAt: moment().format()
  };
  comments.push(newComment);
  res.json(newComment);
});

app.put('/api/comments/:id', (req, res) => {
  const commentIndex = comments.findIndex(c => c.id === req.params.id);
  if (commentIndex === -1) {
    return res.status(404).json({ message: 'Комментарий не найден' });
  }
  
  const updatedComment = {
    ...comments[commentIndex],
    content: req.body.content,
    updatedAt: moment().format()
  };
  comments[commentIndex] = updatedComment;
  res.json(updatedComment);
});

app.delete('/api/comments/:id', (req, res) => {
  const commentIndex = comments.findIndex(c => c.id === req.params.id);
  if (commentIndex === -1) {
    return res.status(404).json({ message: 'Комментарий не найден' });
  }
  
  comments.splice(commentIndex, 1);
  res.json({ message: 'Комментарий удален' });
});

// Routes для проектов
app.get('/api/projects', checkRole(['admin', 'manager', 'developer']), (req, res) => {
  res.json(projects);
});

app.get('/api/projects/:id', checkRole(['admin', 'manager', 'developer']), (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ message: 'Проект не найден' });
  }
  res.json(project);
});

app.post('/api/projects', checkRole(['admin', 'manager']), logAction('Создание проекта'), (req, res) => {
  const { name, description, startDate, endDate, status = 'active', managerId } = req.body;
  const newProject = {
    id: uuidv4(),
    name,
    description,
    startDate,
    endDate,
    status,
    managerId,
    createdAt: moment().format(),
    updatedAt: moment().format()
  };
  projects.push(newProject);
  res.json(newProject);
});

app.put('/api/projects/:id', checkRole(['admin', 'manager']), logAction('Обновление проекта'), (req, res) => {
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  if (projectIndex === -1) {
    return res.status(404).json({ message: 'Проект не найден' });
  }
  
  const updatedProject = {
    ...projects[projectIndex],
    ...req.body,
    updatedAt: moment().format()
  };
  projects[projectIndex] = updatedProject;
  res.json(updatedProject);
});

app.delete('/api/projects/:id', checkRole(['admin']), logAction('Удаление проекта'), (req, res) => {
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  if (projectIndex === -1) {
    return res.status(404).json({ message: 'Проект не найден' });
  }
  
  // Удаляем все задачи проекта
  tasks = tasks.filter(task => task.projectId !== req.params.id);
  projects.splice(projectIndex, 1);
  res.json({ message: 'Проект удален' });
});

// Routes для задач
app.get('/api/tasks', (req, res) => {
  const { projectId } = req.query;
  let filteredTasks = tasks;
  
  if (projectId) {
    filteredTasks = tasks.filter(task => task.projectId === projectId);
  }
  
  res.json(filteredTasks);
});

app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Задача не найдена' });
  }
  res.json(task);
});

app.post('/api/tasks', (req, res) => {
  const { title, description, priority = 'medium', status = 'todo', projectId, assigneeId, dueDate, parentTaskId } = req.body;
  const newTask = {
    id: uuidv4(),
    title,
    description,
    priority,
    status,
    projectId,
    assigneeId,
    dueDate,
    parentTaskId,
    createdAt: moment().format(),
    updatedAt: moment().format()
  };
  tasks.push(newTask);
  res.json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Задача не найдена' });
  }
  
  const updatedTask = {
    ...tasks[taskIndex],
    ...req.body,
    updatedAt: moment().format()
  };
  tasks[taskIndex] = updatedTask;
  res.json(updatedTask);
});

// Обновление статуса задачи (для Kanban)
app.patch('/api/tasks/:id/status', (req, res) => {
  const { status } = req.body;
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Задача не найдена' });
  }
  
  if (!['todo', 'in-progress', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Неверный статус' });
  }
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    status,
    updatedAt: moment().format()
  };
  
  res.json(tasks[taskIndex]);
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Задача не найдена' });
  }
  
  // Удаляем все подзадачи
  tasks = tasks.filter(task => task.parentTaskId !== req.params.id);
  tasks.splice(taskIndex, 1);
  res.json({ message: 'Задача удалена' });
});

// Поиск
app.get('/api/search', (req, res) => {
  const { q: query, type } = req.query;
  
  if (!query || query.trim().length < 2) {
    return res.json({ projects: [], tasks: [] });
  }
  
  const searchTerm = query.toLowerCase().trim();
  
  // Поиск проектов
  const matchingProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm) ||
    project.description.toLowerCase().includes(searchTerm)
  );
  
  // Поиск задач
  const matchingTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm) ||
    task.description.toLowerCase().includes(searchTerm)
  );
  
  // Если указан тип, фильтруем результат
  if (type === 'projects') {
    res.json({ projects: matchingProjects, tasks: [] });
  } else if (type === 'tasks') {
    res.json({ projects: [], tasks: matchingTasks });
  } else {
    res.json({ projects: matchingProjects, tasks: matchingTasks });
  }
});

// Просроченные задачи
app.get('/api/overdue-tasks', (req, res) => {
  const now = new Date();
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'completed') return false;
    return new Date(task.dueDate) < now;
  });
  
  res.json(overdueTasks);
});

// Задачи, истекающие сегодня
app.get('/api/today-tasks', (req, res) => {
  const today = moment().format('YYYY-MM-DD');
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'completed') return false;
    return task.dueDate.startsWith(today);
  });
  
  res.json(todayTasks);
});

// Экспорт данных
app.get('/api/export/projects', (req, res) => {
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
});

app.get('/api/export/tasks', (req, res) => {
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
});

app.get('/api/export/all', (req, res) => {
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
});

// Статистика
app.get('/api/stats', (req, res) => {
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
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
