const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Импорт данных
const seedData = require('./seeds/testData');

// Инициализация данных (в реальном приложении это будет база данных)
let { projects, tasks, comments, users, templates } = seedData;

// Создание Express приложения
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Раздача статических файлов React приложения
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Импорт и подключение routes
const authRoutes = require('./routes/auth')(users);
const projectsRoutes = require('./routes/projects')(projects, tasks);
const tasksRoutes = require('./routes/tasks')(tasks, comments);
const commentsRoutes = require('./routes/comments')(comments);
const usersRoutes = require('./routes/users')(users);
const utilsRoutes = require('./routes/utils')(projects, tasks, users, templates);

// Подключение routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api', utilsRoutes);

// Обработка React routing в production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err.stack);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  console.log(`🌐 API доступен по адресу: http://localhost:${PORT}/api`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`📦 Раздача статических файлов включена`);
  }
});

module.exports = app;
