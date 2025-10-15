import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, CheckSquare, User, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import TaskComments from './TaskComments';
import useApi from '../hooks/useApi';

const ProjectDetail = () => {
  const { id } = useParams();
  const { get, post, put, delete: deleteApi } = useApi();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assigneeId: '',
    dueDate: ''
  });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [projectData, tasksData] = await Promise.all([
        get(`/api/projects/${id}`),
        get(`/api/tasks?projectId=${id}`)
      ]);
      
      setProject(projectData);
      setTasks(tasksData);
      
      let usersData = [];
      try {
        usersData = await get('/api/users');
      } catch (error) {
        console.warn('Не удалось загрузить пользователей:', error.message);
        usersData = [];
      }
      
      setUsers(usersData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          projectId: id
        }),
      });

      if (response.ok) {
        await fetchData();
        setShowTaskModal(false);
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          status: 'todo',
          assigneeId: '',
          dueDate: ''
        });
      }
    } catch (error) {
      console.error('Ошибка создания задачи:', error);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchData();
        }
      } catch (error) {
        console.error('Ошибка удаления задачи:', error);
      }
    }
  };

  const handleProjectEdit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      });

      if (response.ok) {
        setShowEditModal(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Ошибка обновления проекта:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'todo': 'badge-secondary',
      'in-progress': 'badge-info',
      'completed': 'badge-success',
      'active': 'badge-success',
      'paused': 'badge-warning'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'todo': 'К выполнению',
      'in-progress': 'В работе',
      'completed': 'Завершено',
      'active': 'Активный',
      'paused': 'Приостановлен'
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

  const getUserName = (userId) => {
    if (!Array.isArray(users)) return 'Не назначен';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Не назначен';
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    
    return { total, completed, inProgress, todo };
  };

  if (loading) {
    return <div className="loading">Загрузка проекта...</div>;
  }

  if (!project) {
    return (
      <div className="container">
        <div className="error">
          <h3>Проект не найден</h3>
          <Link to="/projects" className="btn btn-primary">
            <ArrowLeft size={16} />
            Вернуться к проектам
          </Link>
        </div>
      </div>
    );
  }

  const stats = getTaskStats();

  return (
    <div className="container">
      {/* Заголовок */}
      <div className="flex flex-between flex-center mb-3">
        <div className="flex flex-center flex-gap">
          <Link to="/projects" className="btn btn-secondary">
            <ArrowLeft size={16} />
            Назад
          </Link>
          <h2>{project.name}</h2>
        </div>
        <div className="flex flex-gap">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowEditModal(true)}
          >
            <Edit size={16} />
            Редактировать
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowTaskModal(true)}
          >
            <Plus size={16} />
            Добавить задачу
          </button>
        </div>
      </div>

      <div className="grid grid-3">
        {/* Информация о проекте */}
        <div className="card">
          <h3>Информация о проекте</h3>
          <div className="project-info">
            <div className="info-item">
              <strong>Статус:</strong>
              <span className={`badge ${getStatusBadge(project.status)}`}>
                {getStatusText(project.status)}
              </span>
            </div>
            
            {project.startDate && (
              <div className="info-item">
                <strong>Дата начала:</strong>
                <span>{format(new Date(project.startDate), 'dd.MM.yyyy', { locale: ru })}</span>
              </div>
            )}
            
            {project.endDate && (
              <div className="info-item">
                <strong>Дата окончания:</strong>
                <span>{format(new Date(project.endDate), 'dd.MM.yyyy', { locale: ru })}</span>
              </div>
            )}
            
            <div className="info-item">
              <strong>Менеджер:</strong>
              <span>{getUserName(project.managerId)}</span>
            </div>
            
            <div className="info-item">
              <strong>Создан:</strong>
              <span>{format(new Date(project.createdAt), 'dd.MM.yyyy', { locale: ru })}</span>
            </div>
          </div>
          
          {project.description && (
            <div className="project-description">
              <strong>Описание:</strong>
              <p>{project.description}</p>
            </div>
          )}
        </div>

        {/* Статистика задач */}
        <div className="card">
          <h3>Статистика задач</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <CheckSquare size={24} color="#007bff" />
              <div>
                <h4>{stats.total}</h4>
                <p>Всего задач</p>
              </div>
            </div>
            
            <div className="stat-item">
              <Clock size={24} color="#ffc107" />
              <div>
                <h4>{stats.inProgress}</h4>
                <p>В работе</p>
              </div>
            </div>
            
            <div className="stat-item">
              <CheckSquare size={24} color="#28a745" />
              <div>
                <h4>{stats.completed}</h4>
                <p>Завершено</p>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="progress-circle">
                {Math.round((stats.completed / stats.total) * 100) || 0}%
              </div>
              <div>
                <h4>Прогресс</h4>
                <p>Выполнения</p>
              </div>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="card">
          <h3>Быстрые действия</h3>
          <div className="quick-actions">
            <button 
              className="btn btn-primary btn-block"
              onClick={() => setShowTaskModal(true)}
            >
              <Plus size={16} />
              Добавить задачу
            </button>
            
            <button 
              className="btn btn-secondary btn-block"
              onClick={() => setShowEditModal(true)}
            >
              <Edit size={16} />
              Редактировать проект
            </button>
            
            <Link 
              to="/calendar" 
              className="btn btn-secondary btn-block"
            >
              <Calendar size={16} />
              Открыть календарь
            </Link>
          </div>
        </div>
      </div>

      {/* Список задач */}
      <div className="card">
        <div className="flex flex-between flex-center mb-3">
          <h3>Задачи проекта</h3>
          <div className="flex flex-gap">
            <span className="badge badge-info">{stats.todo} к выполнению</span>
            <span className="badge badge-warning">{stats.inProgress} в работе</span>
            <span className="badge badge-success">{stats.completed} завершено</span>
          </div>
        </div>
        
        {tasks.length === 0 ? (
          <div className="text-center">
            <p className="text-muted">В этом проекте пока нет задач</p>
            <button 
              className="btn btn-primary mt-2"
              onClick={() => setShowTaskModal(true)}
            >
              Создать первую задачу
            </button>
          </div>
        ) : (
          <div className="task-list">
            {tasks.map(task => (
              <div key={task.id} className="task-item">
                <div className="flex flex-between flex-center">
                  <div className="flex flex-center flex-gap">
                    <button
                      className="status-toggle"
                      onClick={() => {
                        const newStatus = task.status === 'completed' ? 'todo' : 'completed';
                        handleTaskStatusChange(task.id, newStatus);
                      }}
                    >
                      {task.status === 'completed' ? (
                        <CheckSquare size={20} className="text-success" />
                      ) : (
                        <CheckSquare size={20} className="text-muted" />
                      )}
                    </button>
                    <div>
                      <h4 className={task.status === 'completed' ? 'completed' : ''}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-muted">{task.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-gap">
                    <span className={`badge ${getStatusBadge(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                    <span className={`badge ${getPriorityClass(task.priority)}`}>
                      {getPriorityText(task.priority)}
                    </span>
                    {task.assigneeId && (
                      <span className="badge badge-info">
                        <User size={12} />
                        {getUserName(task.assigneeId)}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="badge badge-secondary">
                        <Calendar size={12} />
                        {format(new Date(task.dueDate), 'dd.MM.yyyy', { locale: ru })}
                      </span>
                    )}
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => setSelectedTaskForComments(task.id)}
                      title="Комментарии"
                    >
                      💬
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleTaskDelete(task.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Комментарии к задаче */}
      {selectedTaskForComments && (
        <TaskComments 
          taskId={selectedTaskForComments}
          users={users}
        />
      )}

      {/* Модальное окно создания задачи */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Создать задачу</h3>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => setShowTaskModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label>Название задачи</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  className="form-control textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Приоритет</label>
                  <select
                    className="form-control"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Статус</label>
                  <select
                    className="form-control"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="todo">К выполнению</option>
                    <option value="in-progress">В работе</option>
                    <option value="completed">Завершено</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Исполнитель</label>
                  <select
                    className="form-control"
                    value={formData.assigneeId}
                    onChange={(e) => setFormData({...formData, assigneeId: e.target.value})}
                  >
                    <option value="">Выберите исполнителя</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Срок выполнения</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowTaskModal(false)}
                >
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования проекта */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Редактировать проект</h3>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleProjectEdit}>
              <div className="form-group">
                <label>Название проекта</label>
                <input
                  type="text"
                  className="form-control"
                  value={project.name}
                  onChange={(e) => setProject({...project, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  className="form-control textarea"
                  value={project.description}
                  onChange={(e) => setProject({...project, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Дата начала</label>
                  <input
                    type="date"
                    className="form-control"
                    value={project.startDate ? project.startDate.split('T')[0] : ''}
                    onChange={(e) => setProject({...project, startDate: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Дата окончания</label>
                  <input
                    type="date"
                    className="form-control"
                    value={project.endDate ? project.endDate.split('T')[0] : ''}
                    onChange={(e) => setProject({...project, endDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Статус</label>
                  <select
                    className="form-control"
                    value={project.status}
                    onChange={(e) => setProject({...project, status: e.target.value})}
                  >
                    <option value="active">Активный</option>
                    <option value="completed">Завершен</option>
                    <option value="paused">Приостановлен</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Менеджер проекта</label>
                  <select
                    className="form-control"
                    value={project.managerId}
                    onChange={(e) => setProject({...project, managerId: e.target.value})}
                  >
                    <option value="">Выберите менеджера</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  Сохранить
                </button>
              </div>
            </form>
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
        
        .project-info {
          margin-bottom: 20px;
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
        
        .project-description {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .stat-item h4 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }
        
        .stat-item p {
          margin: 0;
          font-size: 12px;
          color: #6c757d;
        }
        
        .progress-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
        
        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .btn-block {
          width: 100%;
          justify-content: center;
        }
        
        .task-item {
          padding: 15px;
          border: 1px solid #e1e8ed;
          border-radius: 6px;
          margin-bottom: 10px;
        }
        
        .status-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        
        .completed {
          text-decoration: line-through;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

export default ProjectDetail;
