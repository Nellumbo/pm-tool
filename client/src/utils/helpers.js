import { format, parseISO, isAfter, isBefore, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  STATUS_COLORS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  PROJECT_STATUS_LABELS,
  USER_ROLE_LABELS
} from './constants';

/**
 * Форматирование даты
 */
export const formatDate = (date, formatStr = 'dd.MM.yyyy') => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: ru });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Форматирование даты и времени
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'dd.MM.yyyy HH:mm');
};

/**
 * Проверка просроченной задачи
 */
export const isTaskOverdue = (dueDate, status) => {
  if (!dueDate || status === 'completed') return false;
  try {
    const dueDateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
    return isBefore(dueDateObj, new Date());
  } catch (error) {
    return false;
  }
};

/**
 * Проверка задачи на сегодня
 */
export const isTaskToday = (dueDate) => {
  if (!dueDate) return false;
  try {
    const dueDateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
    return isToday(dueDateObj);
  } catch (error) {
    return false;
  }
};

/**
 * Получить цвет для статуса/приоритета
 */
export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || '#6c757d';
};

/**
 * Получить label для статуса задачи
 */
export const getTaskStatusLabel = (status) => {
  return TASK_STATUS_LABELS[status] || status;
};

/**
 * Получить label для приоритета задачи
 */
export const getTaskPriorityLabel = (priority) => {
  return TASK_PRIORITY_LABELS[priority] || priority;
};

/**
 * Получить label для статуса проекта
 */
export const getProjectStatusLabel = (status) => {
  return PROJECT_STATUS_LABELS[status] || status;
};

/**
 * Получить label для роли пользователя
 */
export const getUserRoleLabel = (role) => {
  return USER_ROLE_LABELS[role] || role;
};

/**
 * Создать бейдж для статуса
 */
export const getStatusBadge = (status, type = 'task') => {
  const color = getStatusColor(status);
  let label;

  if (type === 'task') {
    label = getTaskStatusLabel(status);
  } else if (type === 'project') {
    label = getProjectStatusLabel(status);
  } else if (type === 'priority') {
    label = getTaskPriorityLabel(status);
  } else {
    label = status;
  }

  return {
    label,
    color,
    style: {
      backgroundColor: color,
      color: '#fff',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500'
    }
  };
};

/**
 * Вычислить прогресс проекта
 */
export const calculateProjectProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  return Math.round((completedTasks / tasks.length) * 100);
};

/**
 * Получить инициалы пользователя
 */
export const getUserInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Сохранить токен в localStorage
 */
export const saveToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Получить токен из localStorage
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Удалить токен из localStorage
 */
export const removeToken = () => {
  localStorage.removeItem('token');
};

/**
 * Сохранить пользователя в localStorage
 */
export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Получить пользователя из localStorage
 */
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Удалить пользователя из localStorage
 */
export const removeUser = () => {
  localStorage.removeItem('user');
};

/**
 * Очистить все данные аутентификации
 */
export const clearAuth = () => {
  removeToken();
  removeUser();
};

/**
 * Проверка прав доступа
 */
export const hasPermission = (userRole, requiredRoles) => {
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }
  return requiredRoles.includes(userRole);
};

/**
 * Обработка ошибок API
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Сервер вернул ошибку
    return error.response.data?.message || 'Ошибка сервера';
  } else if (error.request) {
    // Запрос отправлен, но ответа нет
    return 'Сервер не отвечает';
  } else {
    // Ошибка при настройке запроса
    return error.message || 'Произошла ошибка';
  }
};

/**
 * Сокращение текста
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Сортировка задач по приоритету
 */
export const sortTasksByPriority = (tasks) => {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...tasks].sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};

/**
 * Сортировка задач по дате
 */
export const sortTasksByDate = (tasks, ascending = true) => {
  return [...tasks].sort((a, b) => {
    const dateA = a.dueDate ? new Date(a.dueDate) : new Date(9999, 0, 1);
    const dateB = b.dueDate ? new Date(b.dueDate) : new Date(9999, 0, 1);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Фильтрация задач по статусу
 */
export const filterTasksByStatus = (tasks, status) => {
  if (!status) return tasks;
  return tasks.filter(task => task.status === status);
};

/**
 * Фильтрация задач по проекту
 */
export const filterTasksByProject = (tasks, projectId) => {
  if (!projectId) return tasks;
  return tasks.filter(task => task.projectId === projectId);
};

/**
 * Экспорт в CSV
 */
export const exportToCSV = (data, filename) => {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Дебаунс функции
 */
export const debounce = (func, wait) => {
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

/**
 * Проверка валидности email
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Генерация случайного цвета
 */
export const generateRandomColor = () => {
  const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6c757d'];
  return colors[Math.floor(Math.random() * colors.length)];
};
