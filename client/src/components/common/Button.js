import React from 'react';
import './Button.css';

/**
 * Переиспользуемый компонент кнопки
 * @param {string} variant - Вариант кнопки ('primary', 'secondary', 'danger', 'success')
 * @param {string} size - Размер кнопки ('small', 'medium', 'large')
 * @param {boolean} disabled - Отключена ли кнопка
 * @param {boolean} loading - Загрузка
 * @param {ReactNode} children - Содержимое кнопки
 * @param {ReactNode} icon - Иконка (компонент)
 * @param {string} type - Тип кнопки ('button', 'submit', 'reset')
 * @param {function} onClick - Обработчик клика
 */
const Button = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  children,
  icon,
  type = 'button',
  onClick,
  ...props
}) => {
  const classNames = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    disabled && 'btn-disabled',
    loading && 'btn-loading'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      {icon && !loading && <span className="btn-icon">{icon}</span>}
      <span className="btn-text">{children}</span>
    </button>
  );
};

export default Button;
