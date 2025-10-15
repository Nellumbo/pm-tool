import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, User, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import useApi from '../hooks/useApi';

const Projects = () => {
  const { get, post, put, delete: deleteApi } = useApi();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'active',
    managerId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const projectsData = await get('/api/projects');
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
      if (editingProject) {
        await put(`/api/projects/${editingProject.id}`, formData);
      } else {
        await post('/api/projects', formData);
      }
      
      await fetchData();
      setShowModal(false);
      setEditingProject(null);
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'active',
        managerId: ''
      });
    } catch (error) {
      console.error('Ошибка сохранения проекта:', error);
    }
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот проект?')) {
      try {
        await deleteApi(`/api/projects/${projectId}`);
        await fetchData();
      } catch (error) {
        console.error('Ошибка удаления проекта:', error);
      }
    }
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
      status: project.status,
      managerId: project.managerId
    });
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': 'badge-success',
      'completed': 'badge-primary',
      'paused': 'badge-warning'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'active': 'Активный',
      'completed': 'Завершен',
      'paused': 'Приостановлен'
    };
    return statusMap[status] || status;
  };

  const getUserName = (userId) => {
    if (!Array.isArray(users)) return 'Не назначен';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Не назначен';
  };

  if (loading) {
    return <div className="loading">Загрузка проектов...</div>;
  }

  return (
    <div className="container">
      <div className="flex flex-between flex-center mb-3">
        <h2>Проекты</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} />
          Создать проект
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="card text-center">
          <h3>Нет проектов</h3>
          <p className="text-muted">Создайте первый проект для начала работы</p>
          <button 
            className="btn btn-primary mt-2"
            onClick={() => setShowModal(true)}
          >
            Создать проект
          </button>
        </div>
      ) : (
        <div className="grid grid-3">
          {projects.map(project => (
            <div key={project.id} className="card">
              <div className="flex flex-between flex-center mb-2">
                <h3>{project.name}</h3>
                <div className="flex flex-gap">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => openEditModal(project)}
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <p className="text-muted mb-2">{project.description}</p>
              
              <div className="mb-2">
                <span className={`badge ${getStatusBadge(project.status)}`}>
                  {getStatusText(project.status)}
                </span>
              </div>
              
              <div className="project-info">
                <div className="flex flex-center mb-1">
                  <User size={16} className="text-muted" />
                  <span className="text-muted ml-1">{getUserName(project.managerId)}</span>
                </div>
                
                {project.startDate && (
                  <div className="flex flex-center mb-1">
                    <Calendar size={16} className="text-muted" />
                    <span className="text-muted ml-1">
                      {format(new Date(project.startDate), 'dd.MM.yyyy', { locale: ru })}
                    </span>
                  </div>
                )}
                
                {project.endDate && (
                  <div className="flex flex-center">
                    <Calendar size={16} className="text-muted" />
                    <span className="text-muted ml-1">
                      до {format(new Date(project.endDate), 'dd.MM.yyyy', { locale: ru })}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-3">
                <Link 
                  to={`/projects/${project.id}`}
                  className="btn btn-primary btn-sm"
                >
                  Подробнее
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно создания/редактирования */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingProject ? 'Редактировать проект' : 'Создать проект'}</h3>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setEditingProject(null);
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Название проекта</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                  <label>Дата начала</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Дата окончания</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Статус</label>
                  <select
                    className="form-control"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
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
                    value={formData.managerId}
                    onChange={(e) => setFormData({...formData, managerId: e.target.value})}
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
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
                  }}
                >
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProject ? 'Сохранить' : 'Создать'}
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
          border-top: 1px solid #f0f0f0;
          padding-top: 15px;
        }
        
        .text-sm {
          font-size: 12px;
        }
        
        .ml-1 {
          margin-left: 8px;
        }
      `}</style>
    </div>
  );
};

export default Projects;
