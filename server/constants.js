/**
 * Application Constants
 *
 * Centralized constants for the backend to avoid magic strings
 * and ensure consistency across the application.
 */

// User Roles
const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  DEVELOPER: 'developer'
};

// Task Statuses
const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
};

// Task Priorities
const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// Project Statuses
const PROJECT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused'
};

// HTTP Status Codes (commonly used)
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
};

// JWT Configuration
const JWT_CONFIG = {
  EXPIRES_IN: '24h',
  COOKIE_MAX_AGE: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
};

// Cookie Options
const COOKIE_OPTIONS = {
  HTTP_ONLY: true,
  SAME_SITE: 'strict',
  SECURE_PRODUCTION_ONLY: true
};

// Rate Limiting
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100
};

// Validation Messages
const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'Это поле обязательно для заполнения',
  INVALID_EMAIL: 'Неверный формат email',
  INVALID_UUID: 'Неверный формат UUID',
  INVALID_STATUS: 'Недопустимый статус',
  INVALID_PRIORITY: 'Недопустимый приоритет',
  INVALID_ROLE: 'Недопустимая роль',
  PASSWORD_TOO_SHORT: 'Пароль должен содержать минимум 6 символов'
};

// Error Messages
const ERROR_MESSAGES = {
  // Authentication
  TOKEN_MISSING: 'Токен доступа отсутствует',
  TOKEN_INVALID: 'Недействительный токен',
  INVALID_CREDENTIALS: 'Неверный email или пароль',
  USER_NOT_FOUND: 'Пользователь не найден',
  EMAIL_ALREADY_EXISTS: 'Пользователь с таким email уже существует',

  // Authorization
  ACCESS_DENIED: 'Доступ запрещен',
  INSUFFICIENT_PERMISSIONS: 'Недостаточно прав для выполнения этой операции',

  // Resources
  TASK_NOT_FOUND: 'Задача не найдена',
  PROJECT_NOT_FOUND: 'Проект не найден',
  COMMENT_NOT_FOUND: 'Комментарий не найден',
  LABEL_NOT_FOUND: 'Метка не найдена',

  // Server
  INTERNAL_ERROR: 'Внутренняя ошибка сервера',
  DATABASE_ERROR: 'Ошибка базы данных',
  VALIDATION_ERROR: 'Ошибка валидации данных'
};

// Success Messages
const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Успешный вход в систему',
  LOGOUT_SUCCESS: 'Выход выполнен успешно',
  REGISTRATION_SUCCESS: 'Регистрация успешна',

  // CRUD Operations
  CREATED: 'Создано успешно',
  UPDATED: 'Обновлено успешно',
  DELETED: 'Удалено успешно',

  // Specific Resources
  TASK_CREATED: 'Задача создана',
  TASK_UPDATED: 'Задача обновлена',
  TASK_DELETED: 'Задача удалена',
  PROJECT_CREATED: 'Проект создан',
  PROJECT_UPDATED: 'Проект обновлен',
  PROJECT_DELETED: 'Проект удален',
  COMMENT_ADDED: 'Комментарий добавлен',
  COMMENT_DELETED: 'Комментарий удален'
};

// Database Table Names
const TABLES = {
  USERS: 'users',
  PROJECTS: 'projects',
  TASKS: 'tasks',
  COMMENTS: 'comments',
  LABELS: 'labels',
  TASK_LABELS: 'task_labels',
  TASK_TEMPLATES: 'task_templates'
};

// Export all constants
module.exports = {
  USER_ROLES,
  TASK_STATUS,
  TASK_PRIORITY,
  PROJECT_STATUS,
  HTTP_STATUS,
  PAGINATION,
  JWT_CONFIG,
  COOKIE_OPTIONS,
  RATE_LIMIT,
  VALIDATION_MESSAGES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TABLES
};
