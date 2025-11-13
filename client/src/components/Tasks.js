import React, { useState, useEffect } from 'react';
import { Plus, Calendar, User, Edit, Trash2, CheckCircle, Circle, Clock, FileText, Square, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import TaskTemplates from './TaskTemplates';
import BulkActions from './BulkActions';
import useApi from '../hooks/useApi';

const Tasks = () => {
  const { get, post, put, delete: deleteApi } = useApi();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    projectId: '',
    assigneeId: '',
    dueDate: '',
    parentTaskId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksData, projectsData] = await Promise.all([
        get('/api/tasks'),
        get('/api/projects')
      ]);
      
      setTasks(tasksData);
      setProjects(projectsData);
      
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTask) {
        await put(`/api/tasks/${editingTask.id}`, formData);
      } else {
        await post('/api/tasks', formData);
      }
      
      await fetchData();
      setShowModal(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        projectId: '',
        assigneeId: '',
        dueDate: '',
        parentTaskId: ''
      });
    } catch (error) {
      console.error('Ошибка сохранения задачи:', error);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      try {
        await deleteApi(`/api/tasks/${taskId}`);
        await fetchData();
      } catch (error) {
        console.error('Ошибка удаления задачи:', error);
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
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

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      projectId: task.projectId,
      assigneeId: task.assigneeId,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      parentTaskId: task.parentTaskId
    });
    setShowModal(true);
  };

  const handleTemplateSelect = (template) => {
    setFormData({
      ...formData,
      title: template.name,
      description: template.description,
      priority: template.priority,
      status: 'todo'
    });
    setShowModal(true);
  };

  // Bulk Actions Handlers
  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id));
    }
  };

  const clearSelection = () => {
    setSelectedTasks([]);
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedTasks.map(taskId => deleteApi(`/api/tasks/${taskId}`))
      );
      await fetchData();
      setSelectedTasks([]);
    } catch (error) {
      console.error('Ошибка массового удаления:', error);
      alert('Произошла ошибка при удалении задач');
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    try {
      await Promise.all(
        selectedTasks.map(taskId =>
          put(`/api/tasks/${taskId}`, { status: newStatus })
        )
      );
      await fetchData();
      setSelectedTasks([]);
    } catch (error) {
      console.error('Ошибка массового изменения статуса:', error);
      alert('Произошла ошибка при изменении статуса задач');
    }
  };

  const handleBulkPriorityChange = async (newPriority) => {
    try {
      await Promise.all(
        selectedTasks.map(taskId =>
          put(`/api/tasks/${taskId}`, { priority: newPriority })
        )
      );
      await fetchData();
      setSelectedTasks([]);
    } catch (error) {
      console.error('Ошибка массового изменения приоритета:', error);
      alert('Произошла ошибка при изменении приоритета задач');
    }
  };

  const handleBulkAssignUser = async (userId) => {
    try {
      await Promise.all(
        selectedTasks.map(taskId =>
          put(`/api/tasks/${taskId}`, { assigneeId: userId || null })
        )
      );
      await fetchData();
      setSelectedTasks([]);
    } catch (error) {
      console.error('Ошибка массового назначения:', error);
      alert('Произошла ошибка при назначении исполнителя');
    }
  };

  const handleBulkAddLabel = async (label) => {
    try {
      // Note: This is a placeholder. If your API supports labels, update accordingly
      await Promise.all(
        selectedTasks.map(taskId => {
          const task = tasks.find(t => t.id === taskId);
          const currentDescription = task?.description || '';
          const newDescription = currentDescription
            ? `${currentDescription}\n\nМетка: ${label}`
            : `Метка: ${label}`;
          return put(`/api/tasks/${taskId}`, { description: newDescription });
        })
      );
      await fetchData();
      setSelectedTasks([]);
    } catch (error) {
      console.error('Ошибка добавления метки:', error);
      alert('Произошла ошибка при добавлении метки');
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

  const getProjectName = (projectId) => {
    if (!Array.isArray(projects)) return 'Без проекта';
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Без проекта';
  };

  const getUserName = (userId) => {
    if (!Array.isArray(users)) return 'Не назначен';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Не назначен';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-success" />;
      case 'in-progress':
        return <Clock size={16} className="text-info" />;
      default:
        return <Circle size={16} className="text-muted" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const projectMatch = filterProject === 'all' || task.projectId === filterProject;
    return statusMatch && projectMatch;
  });

  if (loading) {
    return <div className="loading">Загрузка задач...</div>;
  }

  return (
    <div className="container">
      <div className="flex flex-between flex-center mb-3">
        <h2>Задачи</h2>
        <div className="flex flex-gap">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowTemplates(true)}
          >
            <FileText size={16} />
            Шаблоны
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            Создать задачу
          </button>
        </div>
      </div>

      {/* Фильтры и выбор всех */}
      <div className="card mb-3">
        <div className="grid grid-3">
          <div className="form-group">
            <label>Статус</label>
            <select
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Все статусы</option>
              <option value="todo">К выполнению</option>
              <option value="in-progress">В работе</option>
              <option value="completed">Завершено</option>
            </select>
          </div>

          <div className="form-group">
            <label>Проект</label>
            <select
              className="form-control"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
            >
              <option value="all">Все проекты</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>&nbsp;</label>
            <div className="flex flex-gap">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setFilterStatus('all');
                  setFilterProject('all');
                }}
              >
                Сбросить фильтры
              </button>
            </div>
          </div>
        </div>

        {filteredTasks.length > 0 && (
          <div className="select-all-section">
            <button
              className="select-all-btn"
              onClick={toggleSelectAll}
            >
              {selectedTasks.length === filteredTasks.length ? (
                <CheckSquare size={18} className="text-primary" />
              ) : (
                <Square size={18} />
              )}
              <span>
                {selectedTasks.length === filteredTasks.length
                  ? 'Снять выделение со всех'
                  : `Выбрать все (${filteredTasks.length})`
                }
              </span>
            </button>
            {selectedTasks.length > 0 && (
              <span className="selection-info">
                Выбрано: {selectedTasks.length} из {filteredTasks.length}
              </span>
            )}
          </div>
        )}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="card text-center">
          <h3>Нет задач</h3>
          <p className="text-muted">
            {tasks.length === 0 
              ? 'Создайте первую задачу для начала работы'
              : 'Нет задач, соответствующих выбранным фильтрам'
            }
          </p>
          {tasks.length === 0 && (
            <button 
              className="btn btn-primary mt-2"
              onClick={() => setShowModal(true)}
            >
              Создать задачу
            </button>
          )}
        </div>
      ) : (
        <div className="task-list">
          {filteredTasks.map(task => {
            const isSelected = selectedTasks.includes(task.id);
            return (
              <div
                key={task.id}
                className={`card task-card ${isSelected ? 'task-selected' : ''}`}
              >
                <div className="flex flex-between flex-center mb-2">
                  <div className="flex flex-center flex-gap">
                    <button
                      className="task-checkbox"
                      onClick={() => toggleTaskSelection(task.id)}
                      title={isSelected ? 'Снять выделение' : 'Выбрать задачу'}
                    >
                      {isSelected ? (
                        <CheckSquare size={20} className="text-primary" />
                      ) : (
                        <Square size={20} className="text-muted" />
                      )}
                    </button>
                    <button
                      className="status-toggle"
                      onClick={() => {
                        const newStatus = task.status === 'completed' ? 'todo' : 'completed';
                        handleStatusChange(task.id, newStatus);
                      }}
                    >
                      {getStatusIcon(task.status)}
                    </button>
                    <h3 className={task.status === 'completed' ? 'completed' : ''}>{task.title}</h3>
                  </div>

                  <div className="flex flex-gap">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => openEditModal(task)}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(task.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              {task.description && (
                <p className="text-muted mb-2">{task.description}</p>
              )}

              <div className="task-meta">
                <div className="flex flex-gap mb-2">
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

                <div className="task-details">
                  {task.assigneeId && (
                    <div className="flex flex-center mb-1">
                      <User size={16} className="text-muted" />
                      <span className="text-muted ml-1">{getUserName(task.assigneeId)}</span>
                    </div>
                  )}

                  {task.dueDate && (
                    <div className="flex flex-center">
                      <Calendar size={16} className="text-muted" />
                      <span className="text-muted ml-1">
                        до {format(new Date(task.dueDate), 'dd.MM.yyyy', { locale: ru })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Bulk Actions Bar */}
      <BulkActions
        selectedTasks={selectedTasks}
        onClearSelection={clearSelection}
        onBulkDelete={handleBulkDelete}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkPriorityChange={handleBulkPriorityChange}
        onBulkAssignUser={handleBulkAssignUser}
        onBulkAddLabel={handleBulkAddLabel}
        users={users}
        projects={projects}
      />

      {/* Шаблоны задач */}
      {showTemplates && (
        <TaskTemplates 
          onClose={() => setShowTemplates(false)}
          onSelectTemplate={handleTemplateSelect}
        />
      )}

      {/* Модальное окно создания/редактирования */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingTask ? 'Редактировать задачу' : 'Создать задачу'}</h3>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setEditingTask(null);
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
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
                  <label>Проект</label>
                  <select
                    className="form-control"
                    value={formData.projectId}
                    onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                  >
                    <option value="">Выберите проект</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                
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
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTask(null);
                  }}
                >
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Сохранить' : 'Создать'}
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

        .select-all-section {
          border-top: 1px solid #e1e8ed;
          padding: 16px 0 0 0;
          margin-top: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .select-all-btn {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          color: #333;
        }

        .select-all-btn:hover {
          background: #f0f0f0;
        }

        .selection-info {
          font-size: 14px;
          color: #6c757d;
          font-weight: 500;
        }

        .task-card {
          border-left: 4px solid #007bff;
          transition: all 0.2s ease;
        }

        .task-card.task-selected {
          background: linear-gradient(to right, rgba(0, 123, 255, 0.05), transparent);
          border-left-color: #007bff;
          box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
        }

        .task-card.completed {
          border-left-color: #28a745;
        }

        .task-checkbox {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }

        .task-checkbox:hover {
          transform: scale(1.1);
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

        .task-meta {
          border-top: 1px solid #f0f0f0;
          padding-top: 15px;
        }

        .task-details {
          margin-top: 10px;
        }

        .ml-1 {
          margin-left: 8px;
        }

        .text-primary {
          color: #007bff;
        }

        .text-muted {
          color: #6c757d;
        }

        @media (max-width: 768px) {
          .select-all-section {
            flex-direction: column;
            align-items: stretch;
          }

          .select-all-btn {
            justify-content: center;
          }

          .selection-info {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Tasks;
