import React, { useState, useEffect, useRef } from 'react';
import { Tag, Search, X, ChevronDown } from 'lucide-react';
import LabelBadge from './LabelBadge';
import { sanitizeLabelDescription } from '../utils/security';

/**
 * LabelPicker Component
 *
 * Multi-select dropdown for selecting task labels
 *
 * Props:
 * - labels: Array<{ id: string|number, name: string, color: string, description?: string }>
 *   All available labels from the system (REQUIRED)
 * - selectedLabels: Array<string|number>
 *   Currently selected label IDs (default: [])
 * - onChange: Function(labelIds: Array<string|number>)
 *   Callback when selection changes, receives array of label IDs (REQUIRED)
 * - placeholder: String
 *   Placeholder text (default: 'Выберите метки')
 * - maxHeight: Number
 *   Max height of dropdown in pixels (default: 300)
 * - disabled: Boolean
 *   Disable the picker (default: false)
 */
const LabelPicker = ({
  labels = [],
  selectedLabels = [],
  onChange,
  placeholder = 'Выберите метки',
  maxHeight = 300,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Фокус на поиске при открытии
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleLabelToggle = (labelId) => {
    const newSelection = selectedLabels.includes(labelId)
      ? selectedLabels.filter(id => id !== labelId)
      : [...selectedLabels, labelId];

    onChange(newSelection);
  };

  const handleRemoveLabel = (labelId) => {
    onChange(selectedLabels.filter(id => id !== labelId));
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  // Фильтрация меток по поиску
  const filteredLabels = labels.filter(label =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Получение выбранных меток
  const selectedLabelObjects = labels.filter(label =>
    selectedLabels.includes(label.id)
  );

  return (
    <div className="label-picker" ref={dropdownRef}>
      <div
        className={`label-picker-control ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleToggle}
      >
        <div className="label-picker-selected">
          {selectedLabelObjects.length === 0 ? (
            <span className="label-picker-placeholder">
              <Tag size={14} />
              {placeholder}
            </span>
          ) : (
            <div className="label-picker-badges">
              {selectedLabelObjects.map(label => (
                <LabelBadge
                  key={label.id}
                  label={label}
                  size="small"
                  removable={!disabled}
                  onRemove={handleRemoveLabel}
                />
              ))}
            </div>
          )}
        </div>

        <div className="label-picker-actions">
          {selectedLabelObjects.length > 0 && !disabled && (
            <button
              className="label-picker-clear"
              onClick={handleClearAll}
              type="button"
              title="Очистить все"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`label-picker-arrow ${isOpen ? 'open' : ''}`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="label-picker-dropdown" style={{ maxHeight }}>
          <div className="label-picker-search">
            <Search size={14} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Поиск меток..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="label-picker-list">
            {filteredLabels.length === 0 ? (
              <div className="label-picker-empty">
                {searchTerm ? 'Метки не найдены' : 'Нет доступных меток'}
              </div>
            ) : (
              filteredLabels.map(label => {
                const isSelected = selectedLabels.includes(label.id);
                return (
                  <div
                    key={label.id}
                    className={`label-picker-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleLabelToggle(label.id)}
                  >
                    <div className="label-picker-checkbox">
                      {isSelected && <span className="checkmark">✓</span>}
                    </div>
                    <LabelBadge label={label} size="small" />
                    {label.description && (
                      <span className="label-picker-description">
                        {sanitizeLabelDescription(label.description)}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .label-picker {
          position: relative;
          width: 100%;
        }

        .label-picker-control {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 40px;
        }

        .label-picker-control:hover:not(.disabled) {
          border-color: #007bff;
        }

        .label-picker-control.active {
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .label-picker-control.disabled {
          background-color: #f5f7fa;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .label-picker-selected {
          flex: 1;
          display: flex;
          align-items: center;
          min-width: 0;
        }

        .label-picker-placeholder {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6c757d;
          font-size: 14px;
        }

        .label-picker-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          flex: 1;
        }

        .label-picker-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: 8px;
        }

        .label-picker-clear {
          display: flex;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          color: #6c757d;
          padding: 2px;
          transition: color 0.2s ease;
        }

        .label-picker-clear:hover {
          color: #dc3545;
        }

        .label-picker-arrow {
          color: #6c757d;
          transition: transform 0.2s ease;
        }

        .label-picker-arrow.open {
          transform: rotate(180deg);
        }

        .label-picker-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          overflow: hidden;
        }

        .label-picker-search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-bottom: 1px solid #e1e8ed;
          background: #f5f7fa;
        }

        .label-picker-search input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 14px;
          color: #333;
        }

        .label-picker-search input::placeholder {
          color: #6c757d;
        }

        .label-picker-list {
          max-height: 250px;
          overflow-y: auto;
        }

        .label-picker-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          border-bottom: 1px solid #f0f0f0;
        }

        .label-picker-item:last-child {
          border-bottom: none;
        }

        .label-picker-item:hover {
          background-color: #f5f7fa;
        }

        .label-picker-item.selected {
          background-color: #e7f3ff;
        }

        .label-picker-checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid #ddd;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .label-picker-item.selected .label-picker-checkbox {
          background-color: #007bff;
          border-color: #007bff;
        }

        .checkmark {
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .label-picker-description {
          flex: 1;
          color: #6c757d;
          font-size: 12px;
          margin-left: auto;
          text-align: right;
        }

        .label-picker-empty {
          padding: 20px;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default LabelPicker;
