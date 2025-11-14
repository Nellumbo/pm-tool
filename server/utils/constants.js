// Константы для статусов проектов
const PROJECT_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused'
};

// Константы для статусов задач
const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
};

// Константы для приоритетов задач
const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// Константы для ролей пользователей
const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  DEVELOPER: 'developer'
};

// Константы для категорий шаблонов
const TEMPLATE_CATEGORIES = {
  DEVELOPMENT: 'development',
  BUGFIX: 'bugfix',
  TESTING: 'testing',
  DOCUMENTATION: 'documentation',
  MEETING: 'meeting'
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// Лимиты для валидации
const VALIDATION_LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  TITLE_MIN: 3,
  TITLE_MAX: 200,
  DESCRIPTION_MAX: 2000,
  COMMENT_MAX: 1000,
  PASSWORD_MIN: 6
};

module.exports = {
  PROJECT_STATUSES,
  TASK_STATUSES,
  TASK_PRIORITIES,
  USER_ROLES,
  TEMPLATE_CATEGORIES,
  HTTP_STATUS,
  VALIDATION_LIMITS
};
