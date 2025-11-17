const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

/**
 * Seed данные для демонстрации приложения
 */

const projects = [
  {
    id: '1',
    name: 'Разработка веб-приложения',
    description: 'Создание современного веб-приложения для управления проектами с использованием React и Node.js',
    startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
    endDate: moment().add(60, 'days').format('YYYY-MM-DD'),
    status: 'active',
    managerId: '2',
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
    managerId: '2',
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
    managerId: '1',
    createdAt: moment().subtract(45, 'days').format(),
    updatedAt: moment().subtract(5, 'days').format()
  }
];

const tasks = [
  {
    id: '1',
    title: 'Настройка инфраструктуры',
    description: 'Настройка сервера разработки, установка зависимостей и настройка CI/CD',
    priority: 'high',
    status: 'completed',
    projectId: '1',
    assigneeId: '1',
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
    assigneeId: '3',
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
    assigneeId: '3',
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
    assigneeId: '3',
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
    assigneeId: '4',
    dueDate: moment().add(20, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(15, 'days').format(),
    updatedAt: moment().subtract(15, 'days').format()
  },
  {
    id: '6',
    title: 'UI/UX прототип',
    description: 'Создание интерактивного прототипа в Figma',
    priority: 'high',
    status: 'completed',
    projectId: '2',
    assigneeId: '3',
    dueDate: moment().subtract(10, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(15, 'days').format(),
    updatedAt: moment().subtract(10, 'days').format()
  },
  {
    id: '7',
    title: 'Разработка iOS приложения',
    description: 'Разработка нативного приложения для iOS на Swift',
    priority: 'high',
    status: 'in-progress',
    projectId: '2',
    assigneeId: '3',
    dueDate: moment().add(30, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(12, 'days').format(),
    updatedAt: moment().subtract(1, 'days').format()
  },
  {
    id: '8',
    title: 'Разработка Android приложения',
    description: 'Разработка нативного приложения для Android на Kotlin',
    priority: 'high',
    status: 'in-progress',
    projectId: '2',
    assigneeId: '3',
    dueDate: moment().add(30, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(12, 'days').format(),
    updatedAt: moment().subtract(1, 'days').format()
  },
  {
    id: '9',
    title: 'Backend API',
    description: 'Разработка REST API для мобильного приложения',
    priority: 'high',
    status: 'in-progress',
    projectId: '2',
    assigneeId: '1',
    dueDate: moment().add(25, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(10, 'days').format(),
    updatedAt: moment().subtract(2, 'days').format()
  },
  {
    id: '10',
    title: 'Тестирование приложения',
    description: 'Проведение функционального и регрессионного тестирования',
    priority: 'medium',
    status: 'todo',
    projectId: '2',
    assigneeId: '4',
    dueDate: moment().add(40, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(8, 'days').format(),
    updatedAt: moment().subtract(8, 'days').format()
  },
  {
    id: '11',
    title: 'Интеграция аналитики',
    description: 'Настройка Google Analytics и внутренней системы метрик',
    priority: 'high',
    status: 'completed',
    projectId: '3',
    assigneeId: '1',
    dueDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(45, 'days').format(),
    updatedAt: moment().subtract(30, 'days').format()
  },
  {
    id: '12',
    title: 'Дашборды и отчеты',
    description: 'Создание интерактивных дашбордов для визуализации данных',
    priority: 'high',
    status: 'completed',
    projectId: '3',
    assigneeId: '3',
    dueDate: moment().subtract(10, 'days').format('YYYY-MM-DD'),
    createdAt: moment().subtract(40, 'days').format(),
    updatedAt: moment().subtract(10, 'days').format()
  }
];

const comments = [
  {
    id: '1',
    taskId: '2',
    content: 'Завершил первую итерацию дизайна. Жду фидбека от команды.',
    authorId: '3',
    createdAt: moment().subtract(5, 'days').format(),
    updatedAt: moment().subtract(5, 'days').format()
  },
  {
    id: '2',
    taskId: '2',
    content: 'Дизайн выглядит отлично! Несколько замечаний по UX.',
    authorId: '2',
    createdAt: moment().subtract(4, 'days').format(),
    updatedAt: moment().subtract(4, 'days').format()
  },
  {
    id: '3',
    taskId: '4',
    content: 'Создал базовые компоненты Button, Input, Modal.',
    authorId: '3',
    createdAt: moment().subtract(3, 'days').format(),
    updatedAt: moment().subtract(3, 'days').format()
  },
  {
    id: '4',
    taskId: '7',
    content: 'Реализовал экраны авторизации и главной страницы.',
    authorId: '3',
    createdAt: moment().subtract(2, 'days').format(),
    updatedAt: moment().subtract(2, 'days').format()
  },
  {
    id: '5',
    taskId: '5',
    content: 'Начну писать тесты на следующей неделе.',
    authorId: '4',
    createdAt: moment().subtract(1, 'days').format(),
    updatedAt: moment().subtract(1, 'days').format()
  }
];

const users = [
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

const templates = [
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

// Инвайт-коды для регистрации
const invites = [
  {
    id: uuidv4(),
    code: 'ADMIN-2024-DEMO',
    role: 'admin',
    createdBy: '1', // Создан администратором
    createdAt: moment().subtract(7, 'days').format(),
    expiresAt: moment().add(30, 'days').format(),
    usedBy: null,
    usedAt: null,
    isActive: true
  },
  {
    id: uuidv4(),
    code: 'MANAGER-INVITE-001',
    role: 'manager',
    createdBy: '1',
    createdAt: moment().subtract(5, 'days').format(),
    expiresAt: moment().add(60, 'days').format(),
    usedBy: null,
    usedAt: null,
    isActive: true
  },
  {
    id: uuidv4(),
    code: 'DEV-TEAM-2024',
    role: 'developer',
    createdBy: '2', // Создан менеджером
    createdAt: moment().subtract(3, 'days').format(),
    expiresAt: moment().add(90, 'days').format(),
    usedBy: null,
    usedAt: null,
    isActive: true
  },
  {
    id: uuidv4(),
    code: 'USED-CODE-EXAMPLE',
    role: 'developer',
    createdBy: '1',
    createdAt: moment().subtract(10, 'days').format(),
    expiresAt: moment().add(20, 'days').format(),
    usedBy: '3', // Использован разработчиком
    usedAt: moment().subtract(8, 'days').format(),
    isActive: false
  }
];

module.exports = {
  projects,
  tasks,
  comments,
  users,
  templates,
  invites
};
