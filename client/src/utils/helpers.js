import { format, parseISO, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  ROLE_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS
} from './constants';

/**
 * Форматирует дату для отображения
 * @param {string|Date} date - Дата
 * @param {string} formatStr - Формат (по умолчанию 'dd.MM.yyyy')
 * @returns {string} Отформатированная дата
 */
export const formatDate = (date, formatStr = 'dd.MM.yyyy') => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: ru });
  } catch (error) {
    console.error('Ошибка форматирования даты:', error);
    return '';
  }
};

/**
 * Форматирует дату и время для отображения
 * @param {string|Date} date - Дата
 * @returns {string} Отформатированная дата и время
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'dd.MM.yyyy HH:mm');
};

/**
 * Получает количество дней до/после срока
 * @param {string|Date} dueDate - Срок выполнения
 * @returns {number} Количество дней (отрицательное = просрочено)
 */
export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  try {
    const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
    return differenceInDays(due, new Date());
  } catch (error) {
    console.error('Ошибка расчета дней:', error);
    return null;
  }
};

/**
 * Проверяет, просрочена ли задача
 * @param {object} task - Задача
 * @returns {boolean} true, если просрочена
 */
export const isTaskOverdue = (task) => {
  if (!task.dueDate || task.status === 'completed') return false;
  const days = getDaysUntilDue(task.dueDate);
  return days !== null && days < 0;
};

/**
 * Получает текстовое представление статуса
 * @param {string} status - Статус
 * @returns {string} Текстовое представление
 */
export const getStatusLabel = (status) => {
  return STATUS_LABELS[status] || status;
};

/**
 * Получает текстовое представление приоритета
 * @param {string} priority - Приоритет
 * @returns {string} Текстовое представление
 */
export const getPriorityLabel = (priority) => {
  return PRIORITY_LABELS[priority] || priority;
};

/**
 * Получает текстовое представление роли
 * @param {string} role - Роль
 * @returns {string} Текстовое представление
 */
export const getRoleLabel = (role) => {
  return ROLE_LABELS[role] || role;
};

/**
 * Получает цвет для статуса
 * @param {string} status - Статус
 * @returns {string} Цвет в формате HEX
 */
export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || '#6b7280';
};

/**
 * Получает цвет для приоритета
 * @param {string} priority - Приоритет
 * @returns {string} Цвет в формате HEX
 */
export const getPriorityColor = (priority) => {
  return PRIORITY_COLORS[priority] || '#6b7280';
};

/**
 * Проверяет права доступа пользователя
 * @param {object} user - Пользователь
 * @param {string[]} allowedRoles - Разрешенные роли
 * @returns {boolean} true, если доступ разрешен
 */
export const hasAccess = (user, allowedRoles) => {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
};

/**
 * Вычисляет прогресс выполнения проекта
 * @param {array} tasks - Задачи проекта
 * @returns {number} Процент выполнения (0-100)
 */
export const calculateProjectProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
};

/**
 * Обрезает текст до указанной длины
 * @param {string} text - Текст
 * @param {number} maxLength - Максимальная длина
 * @returns {string} Обрезанный текст
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Дебаунс функции
 * @param {function} func - Функция
 * @param {number} wait - Задержка в мс
 * @returns {function} Debounced функция
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
