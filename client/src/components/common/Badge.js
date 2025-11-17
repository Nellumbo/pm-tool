import React from 'react';
import './Badge.css';

/**
 * Переиспользуемый компонент Badge для статусов и приоритетов
 * @param {string} type - Тип badge ('status', 'priority', 'role')
 * @param {string} value - Значение (например, 'high', 'todo', 'admin')
 * @param {string} size - Размер ('small', 'medium', 'large')
 */
const Badge = ({ type = 'status', value, size = 'medium' }) => {
  const getVariant = () => {
    if (type === 'priority') {
      switch (value) {
        case 'high':
          return 'danger';
        case 'medium':
          return 'warning';
        case 'low':
          return 'info';
        default:
          return 'default';
      }
    }

    if (type === 'status') {
      switch (value) {
        case 'completed':
          return 'success';
        case 'in-progress':
          return 'primary';
        case 'todo':
          return 'info';
        case 'active':
          return 'success';
        default:
          return 'default';
      }
    }

    if (type === 'role') {
      switch (value) {
        case 'admin':
          return 'danger';
        case 'manager':
          return 'primary';
        case 'developer':
          return 'success';
        default:
          return 'default';
      }
    }

    return 'default';
  };

  const getLabel = () => {
    if (type === 'priority') {
      switch (value) {
        case 'high':
          return 'Высокий';
        case 'medium':
          return 'Средний';
        case 'low':
          return 'Низкий';
        default:
          return value;
      }
    }

    if (type === 'status') {
      switch (value) {
        case 'completed':
          return 'Завершено';
        case 'in-progress':
          return 'В работе';
        case 'todo':
          return 'Новая';
        case 'active':
          return 'Активный';
        case 'paused':
          return 'Приостановлен';
        default:
          return value;
      }
    }

    if (type === 'role') {
      switch (value) {
        case 'admin':
          return 'Администратор';
        case 'manager':
          return 'Менеджер';
        case 'developer':
          return 'Разработчик';
        default:
          return value;
      }
    }

    return value;
  };

  const variant = getVariant();
  const label = getLabel();

  return (
    <span className={`badge badge-${variant} badge-${size}`}>
      {label}
    </span>
  );
};

export default Badge;
