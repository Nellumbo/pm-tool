import React, { useEffect } from 'react';
import './Modal.css';

/**
 * Переиспользуемый компонент модального окна
 * @param {boolean} isOpen - Открыто ли модальное окно
 * @param {function} onClose - Функция закрытия
 * @param {string} title - Заголовок модального окна
 * @param {ReactNode} children - Содержимое модального окна
 * @param {string} size - Размер модального окна ('small', 'medium', 'large')
 */
const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  // Обработка клавиши Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Блокировка скролла body при открытом модальном окне
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
