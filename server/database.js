const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const { v4: uuid } = require('uuid');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, 'pm-tool.db');
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Ошибка подключения к базе данных:', err);
          reject(err);
        } else {
          console.log('Подключение к SQLite базе данных установлено');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    const queries = [
      // Таблица пользователей
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'developer',
        department TEXT,
        position TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Таблица проектов
      `CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        startDate DATE,
        endDate DATE,
        status TEXT DEFAULT 'active',
        managerId TEXT,
        progress INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (managerId) REFERENCES users (id)
      )`,

      // Таблица задач
      `CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'todo',
        projectId TEXT,
        assigneeId TEXT,
        dueDate DATE,
        parentTaskId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id),
        FOREIGN KEY (assigneeId) REFERENCES users (id),
        FOREIGN KEY (parentTaskId) REFERENCES tasks (id)
      )`,

      // Таблица комментариев
      `CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        taskId TEXT NOT NULL,
        userId TEXT NOT NULL,
        text TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (taskId) REFERENCES tasks (id),
        FOREIGN KEY (userId) REFERENCES users (id)
      )`,

      // Таблица шаблонов задач
      `CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'medium',
        estimatedHours INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Таблица меток (labels/tags)
      `CREATE TABLE IF NOT EXISTS labels (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        color TEXT NOT NULL,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Таблица связей задач и меток (многие-ко-многим)
      `CREATE TABLE IF NOT EXISTS task_labels (
        taskId TEXT NOT NULL,
        labelId TEXT NOT NULL,
        PRIMARY KEY (taskId, labelId),
        FOREIGN KEY (taskId) REFERENCES tasks (id) ON DELETE CASCADE,
        FOREIGN KEY (labelId) REFERENCES labels (id) ON DELETE CASCADE
      )`
    ];

    for (const query of queries) {
      await this.run(query);
    }

    // Создаем демо-данные
    await this.createDemoData();
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async createDemoData() {
    // Проверяем, есть ли уже данные
    const userCount = await this.get('SELECT COUNT(*) as count FROM users');
    if (userCount.count > 0) return;

    console.log('Создание демо-данных...');

    // Создаем демо-пользователей
    const demoUsers = [
      {
        id: '1',
        name: 'Администратор',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        department: 'Управление',
        position: 'Администратор системы'
      },
      {
        id: '2',
        name: 'Менеджер проектов',
        email: 'manager@example.com',
        password: await bcrypt.hash('manager123', 10),
        role: 'manager',
        department: 'Управление проектами',
        position: 'Менеджер проектов'
      },
      {
        id: '3',
        name: 'Разработчик',
        email: 'developer@example.com',
        password: await bcrypt.hash('dev123', 10),
        role: 'developer',
        department: 'Разработка',
        position: 'Frontend разработчик'
      },
      {
        id: '4',
        name: 'Тестировщик',
        email: 'tester@example.com',
        password: await bcrypt.hash('test123', 10),
        role: 'developer',
        department: 'QA',
        position: 'QA инженер'
      }
    ];

    for (const user of demoUsers) {
      await this.run(
        'INSERT INTO users (id, name, email, password, role, department, position) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user.id, user.name, user.email, user.password, user.role, user.department, user.position]
      );
    }

    // Создаем демо-метки (labels)
    const labels = [
      { id: uuid(), name: 'bug', color: '#ef4444', description: 'Ошибка в коде или функционале' },
      { id: uuid(), name: 'feature', color: '#3b82f6', description: 'Новая функциональность' },
      { id: uuid(), name: 'urgent', color: '#f97316', description: 'Требует немедленного внимания' },
      { id: uuid(), name: 'documentation', color: '#8b5cf6', description: 'Документация и описания' },
      { id: uuid(), name: 'enhancement', color: '#10b981', description: 'Улучшение существующего функционала' },
      { id: uuid(), name: 'testing', color: '#f59e0b', description: 'Тестирование и QA' },
      { id: uuid(), name: 'design', color: '#ec4899', description: 'Дизайн и UI/UX' }
    ];

    for (const label of labels) {
      await this.run(
        'INSERT OR IGNORE INTO labels (id, name, color, description) VALUES (?, ?, ?, ?)',
        [label.id, label.name, label.color, label.description]
      );
    }

    // Создаем демо-проекты
    const demoProjects = [
      {
        id: '1',
        name: 'Разработка мобильного приложения',
        description: 'Создание кроссплатформенного мобильного приложения для iOS и Android',
        startDate: '2024-01-15',
        endDate: '2024-06-30',
        status: 'active',
        managerId: '2',
        progress: 65
      },
      {
        id: '2',
        name: 'Веб-платформа для клиентов',
        description: 'Разработка веб-интерфейса для управления заказами и клиентской базой',
        startDate: '2024-02-01',
        endDate: '2024-05-15',
        status: 'completed',
        managerId: '2',
        progress: 100
      },
      {
        id: '3',
        name: 'Система аналитики',
        description: 'Внедрение системы сбора и анализа данных для принятия бизнес-решений',
        startDate: '2024-03-01',
        endDate: '2024-08-31',
        status: 'paused',
        managerId: '1',
        progress: 30
      }
    ];

    for (const project of demoProjects) {
      await this.run(
        'INSERT INTO projects (id, name, description, startDate, endDate, status, managerId, progress) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [project.id, project.name, project.description, project.startDate, project.endDate, project.status, project.managerId, project.progress]
      );
    }

    // Создаем демо-задачи
    const demoTasks = [
      {
        id: '1',
        title: 'Дизайн пользовательского интерфейса',
        description: 'Создание макетов основных экранов приложения с учетом UX принципов',
        priority: 'high',
        status: 'in-progress',
        projectId: '1',
        assigneeId: '3',
        dueDate: '2024-04-15'
      },
      {
        id: '2',
        title: 'Настройка базы данных',
        description: 'Создание схемы базы данных и миграций для мобильного приложения',
        priority: 'medium',
        status: 'completed',
        projectId: '1',
        assigneeId: '4',
        dueDate: '2024-03-01'
      },
      {
        id: '3',
        title: 'Тестирование API',
        description: 'Проведение unit и integration тестов для всех endpoints',
        priority: 'high',
        status: 'todo',
        projectId: '2',
        assigneeId: '4',
        dueDate: '2024-05-10'
      },
      {
        id: '4',
        title: 'Документация API',
        description: 'Создание подробной документации для разработчиков',
        priority: 'low',
        status: 'todo',
        projectId: '2',
        assigneeId: '3',
        dueDate: '2024-05-20'
      }
    ];

    for (const task of demoTasks) {
      await this.run(
        'INSERT INTO tasks (id, title, description, priority, status, projectId, assigneeId, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [task.id, task.title, task.description, task.priority, task.status, task.projectId, task.assigneeId, task.dueDate]
      );
    }

    // Создаем демо-комментарии
    const demoComments = [
      {
        id: '1',
        taskId: '1',
        userId: '3',
        text: 'Начал работу над дизайном главного экрана. Первые наброски готовы.'
      },
      {
        id: '2',
        taskId: '1',
        userId: '2',
        text: 'Отличная работа! Учти замечания по UX из фидбека пользователей.'
      },
      {
        id: '3',
        taskId: '2',
        userId: '4',
        text: 'База данных настроена, все миграции применены успешно.'
      }
    ];

    for (const comment of demoComments) {
      await this.run(
        'INSERT INTO comments (id, taskId, userId, text) VALUES (?, ?, ?, ?)',
        [comment.id, comment.taskId, comment.userId, comment.text]
      );
    }

    // Добавляем метки к демо-задачам
    const taskLabels = [
      { taskId: '1', labelId: labels[4].id }, // Дизайн UI - enhancement
      { taskId: '1', labelId: labels[6].id }, // Дизайн UI - design
      { taskId: '1', labelId: labels[2].id }, // Дизайн UI - urgent
      { taskId: '2', labelId: labels[1].id }, // Настройка БД - feature
      { taskId: '3', labelId: labels[5].id }, // Тестирование API - testing
      { taskId: '3', labelId: labels[2].id }, // Тестирование API - urgent
      { taskId: '4', labelId: labels[3].id }  // Документация API - documentation
    ];

    for (const taskLabel of taskLabels) {
      await this.run(
        'INSERT OR IGNORE INTO task_labels (taskId, labelId) VALUES (?, ?)',
        [taskLabel.taskId, taskLabel.labelId]
      );
    }

    console.log('Демо-данные созданы успешно!');
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Ошибка закрытия базы данных:', err);
        } else {
          console.log('Соединение с базой данных закрыто');
        }
      });
    }
  }
}

module.exports = Database;
