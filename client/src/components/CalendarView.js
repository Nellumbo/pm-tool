import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/projects')
      ]);
      
      const tasksData = await tasksRes.json();
      const projectsData = await projectsRes.json();
      
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    });
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Без проекта';
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

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const tasksForDate = getTasksForDate(date);
      if (tasksForDate.length > 0) {
        return (
          <div className="calendar-tasks">
            {tasksForDate.slice(0, 3).map(task => (
              <div
                key={task.id}
                className={`calendar-task ${task.priority}`}
                onClick={() => handleTaskClick(task)}
                title={task.title}
              >
                {task.title}
              </div>
            ))}
            {tasksForDate.length > 3 && (
              <div className="calendar-task-more">
                +{tasksForDate.length - 3} еще
              </div>
            )}
          </div>
        );
      }
    }
    return null;
  };

  if (loading) {
    return <div className="loading">Загрузка календаря...</div>;
  }

  const tasksForSelectedDate = getTasksForDate(selectedDate);

  return (
    <div className="container">
      <div className="flex flex-between flex-center mb-3">
        <h2>Календарь</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowTaskModal(true)}
        >
          <Plus size={16} />
          Добавить задачу
        </button>
      </div>

      <div className="grid grid-2 gap-4">
        {/* Календарь */}
        <div className="card">
          <h3>Календарь задач</h3>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileContent={tileContent}
            locale="ru"
            formatShortWeekday={(locale, date) => {
              return format(date, 'EEE', { locale: ru }).toUpperCase();
            }}
            navigationLabel={({ date, label }) => {
              return format(date, 'MMMM yyyy', { locale: ru });
            }}
          />
          
          <div className="calendar-legend mt-3">
            <h4>Легенда приоритетов:</h4>
            <div className="flex flex-gap">
              <div className="legend-item">
                <div className="legend-color high"></div>
                <span>Высокий</span>
              </div>
              <div className="legend-item">
                <div className="legend-color medium"></div>
                <span>Средний</span>
              </div>
              <div className="legend-item">
                <div className="legend-color low"></div>
                <span>Низкий</span>
              </div>
            </div>
          </div>
        </div>

        {/* Задачи на выбранную дату */}
        <div className="card">
          <h3>
            Задачи на {format(selectedDate, 'dd MMMM yyyy', { locale: ru })}
          </h3>
          
          {tasksForSelectedDate.length === 0 ? (
            <p className="text-muted">На эту дату нет задач</p>
          ) : (
            <div className="task-list">
              {tasksForSelectedDate.map(task => (
                <div key={task.id} className="task-item" onClick={() => handleTaskClick(task)}>
                  <h4>{task.title}</h4>
                  {task.description && (
                    <p className="text-muted">{task.description}</p>
                  )}
                  <div className="flex flex-gap">
                    <span className={`badge ${getStatusBadge(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                    <span className={`badge ${getPriorityClass(task.priority)}`}>
                      {getPriorityText(task.priority)}
                    </span>
                    <span className="badge badge-info">
                      {getProjectName(task.projectId)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно задачи */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{selectedTask ? 'Детали задачи' : 'Новая задача'}</h3>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setShowTaskModal(false);
                  setSelectedTask(null);
                }}
              >
                ×
              </button>
            </div>
            
            {selectedTask ? (
              <div className="task-details">
                <h4>{selectedTask.title}</h4>
                {selectedTask.description && (
                  <p className="text-muted">{selectedTask.description}</p>
                )}
                
                <div className="task-info">
                  <div className="info-item">
                    <strong>Статус:</strong>
                    <span className={`badge ${getStatusBadge(selectedTask.status)}`}>
                      {getStatusText(selectedTask.status)}
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <strong>Приоритет:</strong>
                    <span className={`badge ${getPriorityClass(selectedTask.priority)}`}>
                      {getPriorityText(selectedTask.priority)}
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <strong>Проект:</strong>
                    <span>{getProjectName(selectedTask.projectId)}</span>
                  </div>
                  
                  {selectedTask.dueDate && (
                    <div className="info-item">
                      <strong>Срок выполнения:</strong>
                      <span>{format(new Date(selectedTask.dueDate), 'dd.MM.yyyy', { locale: ru })}</span>
                    </div>
                  )}
                  
                  <div className="info-item">
                    <strong>Создано:</strong>
                    <span>{format(new Date(selectedTask.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p>Для создания новой задачи перейдите в раздел "Задачи"</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowTaskModal(false);
                    // Здесь можно добавить переход на страницу задач
                  }}
                >
                  Перейти к задачам
                </button>
              </div>
            )}
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowTaskModal(false);
                  setSelectedTask(null);
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e1e8ed;
        }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 20px;
          border-top: 1px solid #e1e8ed;
        }
        
        .calendar-tasks {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 1;
        }
        
        .calendar-task {
          font-size: 10px;
          padding: 1px 3px;
          margin: 1px 0;
          border-radius: 2px;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .calendar-task.high {
          background-color: #dc3545;
          color: white;
        }
        
        .calendar-task.medium {
          background-color: #ffc107;
          color: #212529;
        }
        
        .calendar-task.low {
          background-color: #28a745;
          color: white;
        }
        
        .calendar-task-more {
          font-size: 10px;
          color: #6c757d;
          text-align: center;
          margin: 1px 0;
        }
        
        .calendar-legend h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
        }
        
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }
        
        .legend-color.high {
          background-color: #dc3545;
        }
        
        .legend-color.medium {
          background-color: #ffc107;
        }
        
        .legend-color.low {
          background-color: #28a745;
        }
        
        .task-item {
          padding: 15px;
          border: 1px solid #e1e8ed;
          border-radius: 6px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .task-item:hover {
          background-color: #f8f9fa;
          border-color: #007bff;
        }
        
        .task-details h4 {
          margin: 0 0 15px 0;
        }
        
        .task-info {
          margin-top: 20px;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .info-item:last-child {
          border-bottom: none;
        }
        
        .gap-4 {
          gap: 20px;
        }
        
        /* Стили для react-calendar */
        :global(.react-calendar) {
          width: 100%;
          border: none;
          font-family: inherit;
        }
        
        :global(.react-calendar__tile) {
          position: relative;
          height: 60px;
          padding: 5px;
        }
        
        :global(.react-calendar__tile--active) {
          background-color: #007bff;
          color: white;
        }
        
        :global(.react-calendar__tile--now) {
          background-color: #fff3cd;
        }
        
        :global(.react-calendar__navigation) {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        :global(.react-calendar__navigation button) {
          background: none;
          border: none;
          font-size: 16px;
          padding: 10px;
          cursor: pointer;
        }
        
        :global(.react-calendar__navigation button:hover) {
          background-color: #f8f9fa;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default CalendarView;
