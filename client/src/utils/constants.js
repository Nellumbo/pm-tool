/**
 * Константы приложения
 */

// Статусы проектов
export const PROJECT_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused'
};

// Статусы задач
export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
};

// Приоритеты задач
export const TASK_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Роли пользователей
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  DEVELOPER: 'developer'
};

// Маппинг статусов для отображения
export const STATUS_LABELS = {
  [TASK_STATUSES.TODO]: 'Новая',
  [TASK_STATUSES.IN_PROGRESS]: 'В работе',
  [TASK_STATUSES.COMPLETED]: 'Завершено',
  [PROJECT_STATUSES.ACTIVE]: 'Активный',
  [PROJECT_STATUSES.COMPLETED]: 'Завершен',
  [PROJECT_STATUSES.PAUSED]: 'Приостановлен'
};

// Маппинг приоритетов для отображения
export const PRIORITY_LABELS = {
  [TASK_PRIORITIES.HIGH]: 'Высокий',
  [TASK_PRIORITIES.MEDIUM]: 'Средний',
  [TASK_PRIORITIES.LOW]: 'Низкий'
};

// Маппинг ролей для отображения
export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Администратор',
  [USER_ROLES.MANAGER]: 'Менеджер',
  [USER_ROLES.DEVELOPER]: 'Разработчик'
};

// Цвета статусов
export const STATUS_COLORS = {
  [TASK_STATUSES.TODO]: '#6b7280',
  [TASK_STATUSES.IN_PROGRESS]: '#3b82f6',
  [TASK_STATUSES.COMPLETED]: '#10b981',
  [PROJECT_STATUSES.ACTIVE]: '#10b981',
  [PROJECT_STATUSES.COMPLETED]: '#6b7280',
  [PROJECT_STATUSES.PAUSED]: '#f59e0b'
};

// Цвета приоритетов
export const PRIORITY_COLORS = {
  [TASK_PRIORITIES.HIGH]: '#ef4444',
  [TASK_PRIORITIES.MEDIUM]: '#f59e0b',
  [TASK_PRIORITIES.LOW]: '#3b82f6'
};
