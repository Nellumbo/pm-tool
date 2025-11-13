import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Loading Component
 *
 * Reusable loading indicator with multiple variants
 *
 * Props:
 * - size: String ('small' | 'medium' | 'large')
 *   Size of the loader (default: 'medium')
 * - text: String
 *   Optional loading text to display (default: 'Загрузка...')
 * - fullscreen: Boolean
 *   Display as fullscreen overlay (default: false)
 * - inline: Boolean
 *   Display inline without centering (default: false)
 * - color: String
 *   Color of the spinner (default: '#007bff')
 */
const Loading = ({
  size = 'medium',
  text = 'Загрузка...',
  fullscreen = false,
  inline = false,
  color = '#007bff'
}) => {
  const sizeMap = {
    small: 20,
    medium: 40,
    large: 64
  };

  const iconSize = sizeMap[size] || sizeMap.medium;

  const content = (
    <div className={`loading-content ${inline ? 'loading-inline' : ''}`}>
      <Loader2
        size={iconSize}
        className="loading-spinner"
        style={{ color }}
      />
      {text && <p className="loading-text">{text}</p>}

      <style jsx>{`
        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 24px;
        }

        .loading-inline {
          display: inline-flex;
          flex-direction: row;
          padding: 0;
          gap: 8px;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .loading-text {
          margin: 0;
          color: #6c757d;
          font-size: ${size === 'small' ? '12px' : size === 'large' ? '18px' : '14px'};
          font-weight: 500;
        }

        .loading-inline .loading-text {
          font-size: ${size === 'small' ? '12px' : '14px'};
        }
      `}</style>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="loading-fullscreen">
        {content}

        <style jsx>{`
          .loading-fullscreen {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(4px);
          }
        `}</style>
      </div>
    );
  }

  if (inline) {
    return content;
  }

  return (
    <div className="loading-container">
      {content}

      <style jsx>{`
        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

/**
 * Skeleton Loader Component
 *
 * Placeholder for content that is loading
 */
export const Skeleton = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  count = 1,
  className = ''
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`skeleton ${className}`}
          style={{ width, height, borderRadius }}
        />
      ))}

      <style jsx>{`
        .skeleton {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s ease-in-out infinite;
          margin-bottom: 8px;
        }

        .skeleton:last-child {
          margin-bottom: 0;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </>
  );
};

/**
 * Button Loading State
 */
export const ButtonLoading = ({ text = 'Загрузка...' }) => {
  return (
    <span className="button-loading">
      <Loader2 size={16} className="button-loading-spinner" />
      {text}

      <style jsx>{`
        .button-loading {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .button-loading-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </span>
  );
};

export default Loading;
