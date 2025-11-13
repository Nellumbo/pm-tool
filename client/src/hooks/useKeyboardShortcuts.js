import { useEffect } from 'react';

/**
 * Хук для регистрации глобальных горячих клавиш
 * @param {Object} shortcuts - Объект с комбинациями клавиш и обработчиками
 * @param {boolean} enabled - Включены ли горячие клавиши
 *
 * @example
 * useKeyboardShortcuts({
 *   'ctrl+k': () => openSearch(),
 *   'ctrl+n': () => createNewTask(),
 *   'esc': () => closeModal()
 * });
 */
export const useKeyboardShortcuts = (shortcuts, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      // Игнорируем если фокус в input/textarea
      const target = event.target;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Разрешаем только Escape в полях ввода
        if (event.key !== 'Escape') {
          return;
        }
      }

      // Создаем строку комбинации
      const keys = [];
      if (event.ctrlKey || event.metaKey) keys.push('ctrl');
      if (event.shiftKey) keys.push('shift');
      if (event.altKey) keys.push('alt');

      const key = event.key.toLowerCase();
      if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
        keys.push(key);
      }

      const combination = keys.join('+');

      // Проверяем есть ли обработчик для этой комбинации
      if (shortcuts[combination]) {
        event.preventDefault();
        shortcuts[combination](event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
};

/**
 * Компонент для отображения подсказок по горячим клавишам
 */
export const KeyboardShortcutsHelp = ({ shortcuts }) => {
  return (
    <div className="keyboard-shortcuts-help">
      <h3>Горячие клавиши</h3>
      <div className="shortcuts-list">
        {Object.entries(shortcuts).map(([key, description]) => (
          <div key={key} className="shortcut-item">
            <kbd className="shortcut-key">{key.replace('ctrl', '⌘/Ctrl').replace('+', ' + ')}</kbd>
            <span className="shortcut-description">{description}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .keyboard-shortcuts-help {
          padding: 20px;
        }

        h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .shortcuts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .shortcut-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .shortcut-key {
          background: #f0f0f0;
          padding: 6px 12px;
          border-radius: 4px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 13px;
          border: 1px solid #ddd;
          box-shadow: 0 2px 0 #ddd;
          min-width: 120px;
          text-align: center;
        }

        .shortcut-description {
          color: #666;
          font-size: 14px;
        }

        [data-theme="dark"] .shortcut-key {
          background: #2d3748;
          border-color: #4a5568;
          box-shadow: 0 2px 0 #4a5568;
          color: #e2e8f0;
        }

        [data-theme="dark"] .shortcut-description {
          color: #a0aec0;
        }
      `}</style>
    </div>
  );
};
