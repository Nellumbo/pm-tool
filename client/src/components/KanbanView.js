import React, { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import useApi from '../hooks/useApi';

const KanbanView = () => {
  const { get } = useApi();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState('all');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

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

  const handleTaskMove = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Обновляем локальное состояние
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
              : task
          )
        );
      } else {
        console.error('Ошибка обновления статуса задачи');
        // Перезагружаем данные в случае ошибки
        fetchData();
      }
    } catch (error) {
      console.error('Ошибка обновления статуса задачи:', error);
      fetchData();
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        }
      } catch (error) {
        console.error('Ошибка удаления задачи:', error);
      }
    }
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Без проекта';
  };

  const filteredTasks = tasks.filter(task => {
    if (filterProject === 'all') return true;
    return task.projectId === filterProject;
  });

  if (loading) {
    return <div className="loading">Загрузка Kanban доски...</div>;
  }

  return (
    <div className="container">
      <div className="kanban-header">
        <div className="kanban-title">
          <h2>Kanban доска</h2>
          <p className="text-muted">Перетаскивайте задачи между колонками для изменения статуса</p>
        </div>
        
        <div className="kanban-actions">
          <div className="kanban-filters">
            <Filter size={16} />
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
          
          <button 
            className="btn btn-primary"
            onClick={() => setShowTaskModal(true)}
          >
            <Plus size={16} />
            Создать задачу
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="kanban-stats">
        <div className="stat-card">
          <div className="stat-number">{tasks.filter(t => t.status === 'todo').length}</div>
          <div className="stat-label">К выполнению</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{tasks.filter(t => t.status === 'in-progress').length}</div>
          <div className="stat-label">В работе</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{tasks.filter(t => t.status === 'completed').length}</div>
          <div className="stat-label">Завершено</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {tasks.length > 0 
              ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
              : 0}%
          </div>
          <div className="stat-label">Прогресс</div>
        </div>
      </div>

      {/* Kanban доска */}
      <div className="kanban-container">
        <KanbanBoard
          tasks={filteredTasks}
          onTaskMove={handleTaskMove}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <style jsx>{`
        .container {
          padding: 20px;
          background: #f5f7fa;
          min-height: 100vh;
        }
        
        .kanban-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .kanban-title h2 {
          margin: 0 0 5px 0;
          color: #2c3e50;
        }
        
        .kanban-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .kanban-filters {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .kanban-filters select {
          min-width: 150px;
        }
        
        .kanban-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .stat-number {
          font-size: 32px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .kanban-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .kanban-header {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }
          
          .kanban-actions {
            justify-content: space-between;
          }
          
          .kanban-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default KanbanView;
