/**
 * Application Constants
 *
 * Centralized constants for the frontend to avoid magic strings
 * and ensure consistency across the application.
 */

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  DEVELOPER: 'developer'
};

// Task Statuses
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
};

// Task Status Display Names
export const TASK_STATUS_LABELS = {
  [TASK_STATUS.TODO]: 'К выполнению',
  [TASK_STATUS.IN_PROGRESS]: 'В работе',
  [TASK_STATUS.COMPLETED]: 'Завершено'
};

// Task Status Badge Classes
export const TASK_STATUS_BADGES = {
  [TASK_STATUS.TODO]: 'badge-secondary',
  [TASK_STATUS.IN_PROGRESS]: 'badge-info',
  [TASK_STATUS.COMPLETED]: 'badge-success'
};

// Task Priorities
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// Task Priority Display Names
export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]: 'Низкий',
  [TASK_PRIORITY.MEDIUM]: 'Средний',
  [TASK_PRIORITY.HIGH]: 'Высокий'
};

// Task Priority Classes
export const TASK_PRIORITY_CLASSES = {
  [TASK_PRIORITY.HIGH]: 'priority-high',
  [TASK_PRIORITY.MEDIUM]: 'priority-medium',
  [TASK_PRIORITY.LOW]: 'priority-low'
};

// Project Statuses
export const PROJECT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused'
};

// Project Status Display Names
export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUS.ACTIVE]: 'Активный',
  [PROJECT_STATUS.COMPLETED]: 'Завершен',
  [PROJECT_STATUS.PAUSED]: 'Приостановлен'
};

// Project Status Badge Classes
export const PROJECT_STATUS_BADGES = {
  [PROJECT_STATUS.ACTIVE]: 'badge-success',
  [PROJECT_STATUS.COMPLETED]: 'badge-primary',
  [PROJECT_STATUS.PAUSED]: 'badge-warning'
};

// API Routes
export const API_ROUTES = {
  // Auth
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_VERIFY: '/api/auth/verify',

  // Users
  USERS: '/api/users',
  USER_BY_ID: (id) => `/api/users/${id}`,

  // Projects
  PROJECTS: '/api/projects',
  PROJECT_BY_ID: (id) => `/api/projects/${id}`,

  // Tasks
  TASKS: '/api/tasks',
  TASK_BY_ID: (id) => `/api/tasks/${id}`,

  // Comments
  COMMENTS: '/api/comments',
  COMMENT_BY_ID: (id) => `/api/comments/${id}`,
  TASK_COMMENTS: (taskId) => `/api/tasks/${taskId}/comments`,

  // Labels
  LABELS: '/api/labels',
  LABEL_BY_ID: (id) => `/api/labels/${id}`,
  TASK_LABELS: (taskId) => `/api/tasks/${taskId}/labels`,

  // Task Templates
  TASK_TEMPLATES: '/api/task-templates',
  TASK_TEMPLATE_BY_ID: (id) => `/api/task-templates/${id}`
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  LIMIT_OPTIONS: [10, 20, 50, 100]
};

// Form Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_TEXT_LENGTH: 1000,
  MAX_TITLE_LENGTH: 200
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd.MM.yyyy',
  DISPLAY_WITH_TIME: 'dd.MM.yyyy HH:mm',
  ISO: 'yyyy-MM-dd'
};

// LocalStorage Keys
export const STORAGE_KEYS = {
  USER: 'user',
  THEME: 'theme'
};

// Theme Options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Произошла ошибка',
  NETWORK: 'Ошибка сети. Проверьте подключение к интернету',
  SERVER: 'Ошибка сервера',
  UNAUTHORIZED: 'Необходима авторизация',
  FORBIDDEN: 'Доступ запрещен',
  NOT_FOUND: 'Ресурс не найден',
  VALIDATION: 'Ошибка валидации данных'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Сохранено успешно',
  DELETED: 'Удалено успешно',
  CREATED: 'Создано успешно',
  UPDATED: 'Обновлено успешно'
};

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  NEW_TASK: 'n',
  NEW_PROJECT: 'p',
  SEARCH: '/',
  SAVE: 'ctrl+s',
  CANCEL: 'esc'
};

// Default Values
export const DEFAULTS = {
  TASK_PRIORITY: TASK_PRIORITY.MEDIUM,
  TASK_STATUS: TASK_STATUS.TODO,
  PROJECT_STATUS: PROJECT_STATUS.ACTIVE,
  ASSIGNEE: '',
  PROJECT: ''
};

// Export all as default for convenience
export default {
  USER_ROLES,
  TASK_STATUS,
  TASK_STATUS_LABELS,
  TASK_STATUS_BADGES,
  TASK_PRIORITY,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_CLASSES,
  PROJECT_STATUS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_BADGES,
  API_ROUTES,
  PAGINATION,
  VALIDATION,
  DATE_FORMATS,
  STORAGE_KEYS,
  THEMES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  KEYBOARD_SHORTCUTS,
  DEFAULTS
};
