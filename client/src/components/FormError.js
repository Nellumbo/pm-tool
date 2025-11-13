import React from 'react';
import { AlertCircle, X } from 'lucide-react';

/**
 * FormError Component
 *
 * Displays validation or server errors in forms
 *
 * Props:
 * - error: String | Object
 *   Error message or error object
 * - errors: Object
 *   Multiple field errors { fieldName: errorMessage }
 * - onDismiss: Function
 *   Callback to dismiss the error (optional)
 * - className: String
 *   Additional CSS classes
 */
const FormError = ({ error, errors, onDismiss, className = '' }) => {
  // No errors to display
  if (!error && (!errors || Object.keys(errors).length === 0)) {
    return null;
  }

  // Single error message
  if (error && typeof error === 'string') {
    return (
      <div className={`form-error ${className}`}>
        <div className="form-error-content">
          <AlertCircle size={16} className="form-error-icon" />
          <span className="form-error-message">{error}</span>
        </div>
        {onDismiss && (
          <button
            type="button"
            className="form-error-dismiss"
            onClick={onDismiss}
            aria-label="Закрыть"
          >
            <X size={16} />
          </button>
        )}

        <style jsx>{`
          .form-error {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 12px 16px;
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 6px;
            margin-bottom: 16px;
          }

          .form-error-content {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
          }

          .form-error-icon {
            color: #856404;
            flex-shrink: 0;
          }

          .form-error-message {
            color: #856404;
            font-size: 14px;
            line-height: 1.5;
          }

          .form-error-dismiss {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            color: #856404;
            transition: color 0.2s ease;
            flex-shrink: 0;
          }

          .form-error-dismiss:hover {
            color: #533f03;
          }
        `}</style>
      </div>
    );
  }

  // Multiple field errors
  if (errors && Object.keys(errors).length > 0) {
    return (
      <div className={`form-errors ${className}`}>
        <div className="form-errors-header">
          <AlertCircle size={16} className="form-errors-icon" />
          <span className="form-errors-title">Исправьте следующие ошибки:</span>
        </div>

        <ul className="form-errors-list">
          {Object.entries(errors).map(([field, errorMessage]) => (
            <li key={field} className="form-errors-item">
              <strong>{field}:</strong> {errorMessage}
            </li>
          ))}
        </ul>

        {onDismiss && (
          <button
            type="button"
            className="form-errors-dismiss"
            onClick={onDismiss}
            aria-label="Закрыть"
          >
            <X size={16} />
          </button>
        )}

        <style jsx>{`
          .form-errors {
            position: relative;
            padding: 16px;
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 6px;
            margin-bottom: 16px;
          }

          .form-errors-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
          }

          .form-errors-icon {
            color: #721c24;
          }

          .form-errors-title {
            color: #721c24;
            font-size: 14px;
            font-weight: 600;
          }

          .form-errors-list {
            margin: 0;
            padding-left: 24px;
            color: #721c24;
          }

          .form-errors-item {
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 4px;
          }

          .form-errors-item:last-child {
            margin-bottom: 0;
          }

          .form-errors-item strong {
            font-weight: 600;
          }

          .form-errors-dismiss {
            position: absolute;
            top: 16px;
            right: 16px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            color: #721c24;
            transition: color 0.2s ease;
          }

          .form-errors-dismiss:hover {
            color: #491217;
          }
        `}</style>
      </div>
    );
  }

  return null;
};

/**
 * FieldError Component
 *
 * Displays error for a specific form field
 */
export const FieldError = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`field-error ${className}`}>
      <AlertCircle size={14} />
      <span>{error}</span>

      <style jsx>{`
        .field-error {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #dc3545;
          font-size: 13px;
          margin-top: 4px;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

/**
 * SuccessMessage Component
 *
 * Displays success message in forms
 */
export const SuccessMessage = ({ message, onDismiss, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`success-message ${className}`}>
      <div className="success-message-content">
        <span className="success-message-text">{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="success-message-dismiss"
          onClick={onDismiss}
          aria-label="Закрыть"
        >
          <X size={16} />
        </button>
      )}

      <style jsx>{`
        .success-message {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 12px 16px;
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .success-message-content {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .success-message-text {
          color: #155724;
          font-size: 14px;
          line-height: 1.5;
        }

        .success-message-dismiss {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          color: #155724;
          transition: color 0.2s ease;
          flex-shrink: 0;
        }

        .success-message-dismiss:hover {
          color: #0b2e13;
        }
      `}</style>
    </div>
  );
};

export default FormError;
