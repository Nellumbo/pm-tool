import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Pagination Component
 *
 * Reusable pagination controls for navigating through paginated data
 *
 * Props:
 * - pagination: Object { page, limit, total, totalPages, hasNext, hasPrev }
 *   Pagination metadata from API (REQUIRED)
 * - onPageChange: Function(newPage: number)
 *   Callback when page changes (REQUIRED)
 * - onLimitChange: Function(newLimit: number)
 *   Callback when items per page changes (optional)
 * - showLimitSelector: Boolean
 *   Show items per page selector (default: true)
 * - limitOptions: Array<number>
 *   Available items per page options (default: [10, 20, 50, 100])
 */
const Pagination = ({
  pagination,
  onPageChange,
  onLimitChange = null,
  showLimitSelector = true,
  limitOptions = [10, 20, 50, 100]
}) => {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, limit, total, totalPages, hasNext, hasPrev } = pagination;

  const handleFirstPage = () => {
    if (page !== 1) {
      onPageChange(1);
    }
  };

  const handlePrevPage = () => {
    if (hasPrev) {
      onPageChange(page - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      onPageChange(page + 1);
    }
  };

  const handleLastPage = () => {
    if (page !== totalPages) {
      onPageChange(totalPages);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    if (onLimitChange) {
      onLimitChange(newLimit);
    }
  };

  // Calculate displayed items range
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span className="pagination-text">
          Показано {startItem}-{endItem} из {total}
        </span>

        {showLimitSelector && onLimitChange && (
          <div className="pagination-limit">
            <label htmlFor="pagination-limit">На странице:</label>
            <select
              id="pagination-limit"
              value={limit}
              onChange={handleLimitChange}
              className="pagination-select"
            >
              {limitOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={handleFirstPage}
          disabled={!hasPrev}
          title="Первая страница"
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          className="pagination-btn"
          onClick={handlePrevPage}
          disabled={!hasPrev}
          title="Предыдущая страница"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="pagination-pages">
          Страница {page} из {totalPages}
        </span>

        <button
          className="pagination-btn"
          onClick={handleNextPage}
          disabled={!hasNext}
          title="Следующая страница"
        >
          <ChevronRight size={16} />
        </button>

        <button
          className="pagination-btn"
          onClick={handleLastPage}
          disabled={!hasNext}
          title="Последняя страница"
        >
          <ChevronsRight size={16} />
        </button>
      </div>

      <style jsx>{`
        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          margin-top: 20px;
          border-top: 1px solid #e1e8ed;
          flex-wrap: wrap;
          gap: 16px;
        }

        .pagination-info {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .pagination-text {
          color: #6c757d;
          font-size: 14px;
          font-weight: 500;
        }

        .pagination-limit {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pagination-limit label {
          color: #6c757d;
          font-size: 14px;
          margin: 0;
        }

        .pagination-select {
          padding: 6px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        .pagination-select:hover {
          border-color: #007bff;
        }

        .pagination-select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #333;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f8f9fa;
          border-color: #007bff;
          color: #007bff;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-pages {
          padding: 8px 16px;
          color: #333;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .pagination-container {
            flex-direction: column;
            align-items: stretch;
          }

          .pagination-info {
            flex-direction: column;
            align-items: flex-start;
          }

          .pagination-controls {
            justify-content: center;
          }

          .pagination-pages {
            font-size: 13px;
            padding: 8px 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default Pagination;
