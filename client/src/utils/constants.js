// Статусы проектов
export const PROJECT_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused'
};

export const PROJECT_STATUS_LABELS = {
  active: 'Активный',
  completed: 'Завершенный',
  paused: 'Приостановлен'
};

// Статусы задач
export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
};

export const TASK_STATUS_LABELS = {
  'todo': 'К выполнению',
  'in-progress': 'В работе',
  'completed': 'Завершено'
};

// Приоритеты задач
export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const TASK_PRIORITY_LABELS = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий'
};

// Роли пользователей
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  DEVELOPER: 'developer'
};

export const USER_ROLE_LABELS = {
  admin: 'Администратор',
  manager: 'Менеджер',
  developer: 'Разработчик'
};

// Категории шаблонов
export const TEMPLATE_CATEGORIES = {
  DEVELOPMENT: 'development',
  BUGFIX: 'bugfix',
  TESTING: 'testing',
  DOCUMENTATION: 'documentation',
  MEETING: 'meeting'
};

export const TEMPLATE_CATEGORY_LABELS = {
  development: 'Разработка',
  bugfix: 'Исправление ошибки',
  testing: 'Тестирование',
  documentation: 'Документация',
  meeting: 'Встреча'
};

// Цвета для статусов
export const STATUS_COLORS = {
  // Проекты
  active: '#28a745',
  completed: '#6c757d',
  paused: '#ffc107',

  // Задачи
  'todo': '#6c757d',
  'in-progress': '#007bff',

  // Приоритеты
  low: '#28a745',
  medium: '#ffc107',
  high: '#dc3545'
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  VERIFY: '/api/auth/verify',

  // Users
  USERS: '/api/users',
  USER: (id) => `/api/users/${id}`,

  // Projects
  PROJECTS: '/api/projects',
  PROJECT: (id) => `/api/projects/${id}`,

  // Tasks
  TASKS: '/api/tasks',
  TASK: (id) => `/api/tasks/${id}`,
  TASK_STATUS: (id) => `/api/tasks/${id}/status`,

  // Comments
  TASK_COMMENTS: (taskId) => `/api/tasks/${taskId}/comments`,
  COMMENT: (id) => `/api/comments/${id}`,

  // Templates
  TEMPLATES: '/api/templates',
  TEMPLATE: (id) => `/api/templates/${id}`,

  // Stats & Export
  STATS: '/api/stats',
  OVERDUE_TASKS: '/api/overdue-tasks',
  TODAY_TASKS: '/api/today-tasks',
  SEARCH: '/api/search',
  EXPORT_PROJECTS: '/api/export/projects',
  EXPORT_TASKS: '/api/export/tasks',
  EXPORT_ALL: '/api/export/all'
};

// Форматы дат
export const DATE_FORMATS = {
  DISPLAY: 'DD.MM.YYYY',
  DISPLAY_WITH_TIME: 'DD.MM.YYYY HH:mm',
  API: 'YYYY-MM-DD',
  ISO: 'YYYY-MM-DDTHH:mm:ss'
};

// Лимиты для валидации
export const VALIDATION_LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  TITLE_MIN: 3,
  TITLE_MAX: 200,
  DESCRIPTION_MAX: 2000,
  COMMENT_MAX: 1000,
  PASSWORD_MIN: 6
};
