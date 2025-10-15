import React, { useState, useEffect } from 'react';
import { Search, X, Folder, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const SearchBar = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ projects: [], tasks: [] });
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (query.length >= 2) {
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setResults({ projects: [], tasks: [] });
      setShowResults(false);
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Ошибка поиска:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': 'badge-success',
      'completed': 'badge-primary',
      'paused': 'badge-warning',
      'todo': 'badge-secondary',
      'in-progress': 'badge-info'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'active': 'Активный',
      'completed': 'Завершен',
      'paused': 'Приостановлен',
      'todo': 'К выполнению',
      'in-progress': 'В работе'
    };
    return statusMap[status] || status;
  };

  const getPriorityClass = (priority) => {
    const priorityMap = {
      'high': 'priority-high',
      'medium': 'priority-medium',
      'low': 'priority-low'
    };
    return priorityMap[priority] || '';
  };

  const getPriorityText = (priority) => {
    const priorityMap = {
      'high': 'Высокий',
      'medium': 'Средний',
      'low': 'Низкий'
    };
    return priorityMap[priority] || priority;
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  return (
    <div className="search-overlay">
      <div className="search-container">
        <div className="search-header">
          <div className="search-input-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Поиск по проектам и задачам..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button 
              className="search-close"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="search-results">
          {loading && (
            <div className="search-loading">
              <div className="loading-spinner"></div>
              <span>Поиск...</span>
            </div>
          )}

          {!loading && query.length >= 2 && showResults && (
            <>
              {results.projects.length === 0 && results.tasks.length === 0 && (
                <div className="search-no-results">
                  <p>Ничего не найдено по запросу "{query}"</p>
                </div>
              )}

              {results.projects.length > 0 && (
                <div className="search-section">
                  <h3 className="search-section-title">
                    <Folder size={16} />
                    Проекты ({results.projects.length})
                  </h3>
                  {results.projects.map(project => (
                    <div key={project.id} className="search-result-item project">
                      <div className="result-icon">
                        <Folder size={20} />
                      </div>
                      <div className="result-content">
                        <h4 
                          dangerouslySetInnerHTML={{ 
                            __html: highlightText(project.name, query) 
                          }}
                        />
                        <p 
                          className="text-muted"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightText(project.description || '', query) 
                          }}
                        />
                        <div className="result-meta">
                          <span className={`badge ${getStatusBadge(project.status)}`}>
                            {getStatusText(project.status)}
                          </span>
                          {project.startDate && (
                            <span className="text-muted">
                              {format(new Date(project.startDate), 'dd.MM.yyyy', { locale: ru })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.tasks.length > 0 && (
                <div className="search-section">
                  <h3 className="search-section-title">
                    <CheckSquare size={16} />
                    Задачи ({results.tasks.length})
                  </h3>
                  {results.tasks.map(task => (
                    <div key={task.id} className="search-result-item task">
                      <div className="result-icon">
                        <CheckSquare size={20} />
                      </div>
                      <div className="result-content">
                        <h4 
                          dangerouslySetInnerHTML={{ 
                            __html: highlightText(task.title, query) 
                          }}
                        />
                        <p 
                          className="text-muted"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightText(task.description || '', query) 
                          }}
                        />
                        <div className="result-meta">
                          <span className={`badge ${getStatusBadge(task.status)}`}>
                            {getStatusText(task.status)}
                          </span>
                          <span className={`badge ${getPriorityClass(task.priority)}`}>
                            {getPriorityText(task.priority)}
                          </span>
                          {task.dueDate && (
                            <span className="text-muted">
                              до {format(new Date(task.dueDate), 'dd.MM.yyyy', { locale: ru })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {query.length > 0 && query.length < 2 && (
            <div className="search-hint">
              <p>Введите минимум 2 символа для поиска</p>
            </div>
          )}
        </div>

        <div className="search-footer">
          <div className="search-shortcuts">
            <span className="shortcut">Enter</span> - открыть первый результат
            <span className="shortcut">Esc</span> - закрыть поиск
          </div>
        </div>
      </div>

      <style jsx>{`
        .search-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          z-index: 2000;
          padding-top: 100px;
        }
        
        .search-container {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 700px;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .search-header {
          padding: 20px;
          border-bottom: 1px solid #e1e8ed;
        }
        
        .search-input-container {
          display: flex;
          align-items: center;
          background: #f8f9fa;
          border-radius: 8px;
          padding: 12px 16px;
          border: 2px solid transparent;
          transition: all 0.2s ease;
        }
        
        .search-input-container:focus-within {
          border-color: #007bff;
          background: white;
        }
        
        .search-icon {
          color: #6c757d;
          margin-right: 12px;
        }
        
        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 16px;
          outline: none;
        }
        
        .search-close {
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .search-close:hover {
          background: #e9ecef;
          color: #495057;
        }
        
        .search-results {
          max-height: 400px;
          overflow-y: auto;
          padding: 10px 0;
        }
        
        .search-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #6c757d;
        }
        
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e1e8ed;
          border-top: 2px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 10px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .search-no-results,
        .search-hint {
          padding: 40px;
          text-align: center;
          color: #6c757d;
        }
        
        .search-section {
          margin-bottom: 20px;
        }
        
        .search-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 20px 10px;
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #495057;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .search-result-item {
          display: flex;
          align-items: flex-start;
          padding: 12px 20px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .search-result-item:hover {
          background-color: #f8f9fa;
        }
        
        .result-icon {
          margin-right: 12px;
          margin-top: 2px;
          color: #6c757d;
        }
        
        .result-content {
          flex: 1;
        }
        
        .result-content h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .result-content p {
          margin: 0 0 8px 0;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .result-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .result-meta .badge {
          font-size: 11px;
          padding: 2px 6px;
        }
        
        .search-footer {
          padding: 15px 20px;
          border-top: 1px solid #e1e8ed;
          background: #f8f9fa;
        }
        
        .search-shortcuts {
          display: flex;
          gap: 20px;
          font-size: 12px;
          color: #6c757d;
        }
        
        .shortcut {
          background: #e9ecef;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
          font-weight: bold;
        }
        
        mark {
          background-color: #fff3cd;
          padding: 1px 2px;
          border-radius: 2px;
        }
        
        .project .result-icon {
          color: #007bff;
        }
        
        .task .result-icon {
          color: #28a745;
        }
      `}</style>
    </div>
  );
};

export default SearchBar;
