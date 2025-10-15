import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Clock, CheckSquare } from 'lucide-react';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Обновляем уведомления каждые 5 минут
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const [overdueRes, todayRes] = await Promise.all([
        fetch('/api/overdue-tasks'),
        fetch('/api/today-tasks')
      ]);
      
      const overdueData = await overdueRes.json();
      const todayData = await todayRes.json();
      
      setOverdueTasks(overdueData);
      setTodayTasks(todayData);
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProjectName = async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const project = await response.json();
      return project.name;
    } catch (error) {
      return 'Неизвестный проект';
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'todo': 'badge-secondary',
      'in-progress': 'badge-info',
      'completed': 'badge-success'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'todo': 'К выполнению',
      'in-progress': 'В работе',
      'completed': 'Завершено'
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

  const totalNotifications = overdueTasks.length + todayTasks.length;

  return (
    <div className="notification-center">
      <button 
        className="notification-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title={`Уведомления ${totalNotifications > 0 ? `(${totalNotifications})` : ''}`}
      >
        <Bell size={20} />
        {totalNotifications > 0 && (
          <span className="notification-badge">{totalNotifications}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Уведомления</h3>
            <button 
              className="notification-close"
              onClick={() => setIsOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="notification-content">
            {loading ? (
              <div className="notification-loading">
                <div className="loading-spinner"></div>
                <span>Загрузка...</span>
              </div>
            ) : (
              <>
                {totalNotifications === 0 ? (
                  <div className="notification-empty">
                    <CheckSquare size={48} color="#28a745" />
                    <p>Все задачи в порядке!</p>
                    <span>Нет просроченных задач или задач на сегодня</span>
                  </div>
                ) : (
                  <>
                    {overdueTasks.length > 0 && (
                      <div className="notification-section">
                        <div className="notification-section-header">
                          <AlertTriangle size={16} color="#dc3545" />
                          <span>Просроченные задачи ({overdueTasks.length})</span>
                        </div>
                        <div className="notification-list">
                          {overdueTasks.map(task => (
                            <div key={task.id} className="notification-item overdue">
                              <div className="notification-item-header">
                                <CheckSquare size={14} />
                                <span className="notification-title">{task.title}</span>
                              </div>
                              <div className="notification-meta">
                                <span className={`badge ${getStatusBadge(task.status)}`}>
                                  {getStatusText(task.status)}
                                </span>
                                <span className={`badge ${getPriorityClass(task.priority)}`}>
                                  {getPriorityText(task.priority)}
                                </span>
                                <span className="notification-date overdue">
                                  Просрочено на {format(parseISO(task.dueDate), 'dd.MM.yyyy', { locale: ru })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {todayTasks.length > 0 && (
                      <div className="notification-section">
                        <div className="notification-section-header">
                          <Clock size={16} color="#ffc107" />
                          <span>Задачи на сегодня ({todayTasks.length})</span>
                        </div>
                        <div className="notification-list">
                          {todayTasks.map(task => (
                            <div key={task.id} className="notification-item today">
                              <div className="notification-item-header">
                                <CheckSquare size={14} />
                                <span className="notification-title">{task.title}</span>
                              </div>
                              <div className="notification-meta">
                                <span className={`badge ${getStatusBadge(task.status)}`}>
                                  {getStatusText(task.status)}
                                </span>
                                <span className={`badge ${getPriorityClass(task.priority)}`}>
                                  {getPriorityText(task.priority)}
                                </span>
                                <span className="notification-date today">
                                  Срок: сегодня
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {totalNotifications > 0 && (
            <div className="notification-footer">
              <button 
                className="btn btn-sm btn-primary"
                onClick={fetchNotifications}
              >
                Обновить
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .notification-center {
          position: relative;
          display: inline-block;
        }
        
        .notification-toggle {
          position: relative;
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        
        .notification-toggle:hover {
          background-color: #f8f9fa;
          color: #495057;
        }
        
        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: #dc3545;
          color: white;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
          line-height: 1;
        }
        
        .notification-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 350px;
          max-height: 500px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          border: 1px solid #e1e8ed;
          z-index: 1000;
          overflow: hidden;
        }
        
        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid #e1e8ed;
          background: #f8f9fa;
        }
        
        .notification-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .notification-close {
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .notification-close:hover {
          background: #e9ecef;
          color: #495057;
        }
        
        .notification-content {
          max-height: 350px;
          overflow-y: auto;
        }
        
        .notification-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #6c757d;
        }
        
        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e1e8ed;
          border-top: 2px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .notification-empty {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
        }
        
        .notification-empty p {
          margin: 10px 0 5px 0;
          font-weight: 600;
          color: #28a745;
        }
        
        .notification-empty span {
          font-size: 12px;
        }
        
        .notification-section {
          border-bottom: 1px solid #f0f0f0;
        }
        
        .notification-section:last-child {
          border-bottom: none;
        }
        
        .notification-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #f8f9fa;
          font-size: 14px;
          font-weight: 600;
          color: #495057;
        }
        
        .notification-list {
          max-height: 200px;
          overflow-y: auto;
        }
        
        .notification-item {
          padding: 12px 20px;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s ease;
        }
        
        .notification-item:hover {
          background-color: #f8f9fa;
        }
        
        .notification-item:last-child {
          border-bottom: none;
        }
        
        .notification-item.overdue {
          border-left: 3px solid #dc3545;
        }
        
        .notification-item.today {
          border-left: 3px solid #ffc107;
        }
        
        .notification-item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .notification-title {
          font-weight: 600;
          color: #2c3e50;
          font-size: 14px;
        }
        
        .notification-meta {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          align-items: center;
        }
        
        .notification-meta .badge {
          font-size: 10px;
          padding: 2px 6px;
        }
        
        .notification-date {
          font-size: 11px;
          font-weight: 500;
        }
        
        .notification-date.overdue {
          color: #dc3545;
        }
        
        .notification-date.today {
          color: #ffc107;
        }
        
        .notification-footer {
          padding: 15px 20px;
          border-top: 1px solid #e1e8ed;
          background: #f8f9fa;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default NotificationCenter;
