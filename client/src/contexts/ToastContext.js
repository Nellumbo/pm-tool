import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { sanitizeText } from '../utils/security';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    // Sanitize message to prevent XSS
    const sanitizedMessage = sanitizeText(message, 200);

    if (!sanitizedMessage) {
      console.warn('Toast message was empty or invalid');
      return null;
    }

    const id = Date.now() + Math.random();
    const toast = { id, message: sanitizedMessage, type, duration };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      case 'warning':
        return <AlertCircle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-icon">
            {getIcon(toast.type)}
          </div>
          <div className="toast-message">{toast.message}</div>
          <button
            className="toast-close"
            onClick={() => removeToast(toast.id)}
            aria-label="Закрыть"
          >
            <X size={16} />
          </button>
        </div>
      ))}

      <style jsx>{`
        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 400px;
        }

        .toast {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.3s ease-out;
          border-left: 4px solid;
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .toast-success {
          border-left-color: #28a745;
        }

        .toast-success .toast-icon {
          color: #28a745;
        }

        .toast-error {
          border-left-color: #dc3545;
        }

        .toast-error .toast-icon {
          color: #dc3545;
        }

        .toast-warning {
          border-left-color: #ffc107;
        }

        .toast-warning .toast-icon {
          color: #ffc107;
        }

        .toast-info {
          border-left-color: #17a2b8;
        }

        .toast-info .toast-icon {
          color: #17a2b8;
        }

        .toast-icon {
          flex-shrink: 0;
        }

        .toast-message {
          flex: 1;
          font-size: 14px;
          color: #333;
        }

        .toast-close {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .toast-close:hover {
          background: #f0f0f0;
          color: #333;
        }

        [data-theme="dark"] .toast {
          background: #2d3748;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }

        [data-theme="dark"] .toast-message {
          color: #e2e8f0;
        }

        [data-theme="dark"] .toast-close {
          color: #a0aec0;
        }

        [data-theme="dark"] .toast-close:hover {
          background: #4a5568;
          color: #e2e8f0;
        }

        @media (max-width: 768px) {
          .toast-container {
            left: 20px;
            right: 20px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};
