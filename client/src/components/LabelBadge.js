import React from 'react';
import { X } from 'lucide-react';
import { sanitizeLabelName, sanitizeLabelDescription, sanitizeColor } from '../utils/security';

/**
 * LabelBadge Component
 *
 * Small badge component to display a label with color coding
 *
 * Props:
 * - label: Object { id: string|number, name: string, color: string, description?: string }
 *   The label to display (REQUIRED)
 * - size: String ('small' | 'medium' | 'large')
 *   Size of the badge (default: 'medium')
 * - removable: Boolean
 *   Show remove button (default: false)
 * - onRemove: Function(labelId)
 *   Callback when remove button is clicked (optional)
 * - className: String
 *   Additional CSS classes (optional)
 */
const LabelBadge = ({
  label,
  size = 'medium',
  removable = false,
  onRemove = null,
  className = ''
}) => {
  if (!label) return null;

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(label.id);
    }
  };

  // Функция для определения контрастности текста
  const getTextColor = (hexColor) => {
    if (!hexColor) return '#000';

    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Формула относительной яркости
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155 ? '#000' : '#fff';
  };

  const sizeClasses = {
    small: 'label-badge-small',
    medium: 'label-badge-medium',
    large: 'label-badge-large'
  };

  // Sanitize inputs to prevent XSS
  const safeName = sanitizeLabelName(label.name);
  const safeDescription = label.description ? sanitizeLabelDescription(label.description) : '';
  const safeColor = sanitizeColor(label.color) || '#6c757d';

  return (
    <span
      className={`label-badge ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: safeColor,
        color: getTextColor(safeColor)
      }}
      title={safeDescription || safeName}
    >
      <span className="label-badge-name">{safeName}</span>
      {removable && onRemove && (
        <button
          className="label-badge-remove"
          onClick={handleRemove}
          type="button"
          aria-label="Удалить метку"
        >
          <X size={size === 'small' ? 10 : size === 'large' ? 14 : 12} />
        </button>
      )}

      <style jsx>{`
        .label-badge {
          display: inline-flex;
          align-items: center;
          border-radius: 4px;
          font-weight: 500;
          white-space: nowrap;
          gap: 4px;
          transition: all 0.2s ease;
        }

        .label-badge-small {
          padding: 2px 6px;
          font-size: 10px;
        }

        .label-badge-medium {
          padding: 4px 8px;
          font-size: 12px;
        }

        .label-badge-large {
          padding: 6px 12px;
          font-size: 14px;
        }

        .label-badge-name {
          line-height: 1;
        }

        .label-badge-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.2);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          padding: 2px;
          color: inherit;
          transition: background-color 0.2s ease;
          margin-left: 2px;
        }

        .label-badge-remove:hover {
          background: rgba(0, 0, 0, 0.4);
        }

        .label-badge:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </span>
  );
};

export default LabelBadge;
