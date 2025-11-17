import React, { useState, useEffect } from 'react';
import { Folder, CheckSquare, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: { total: 0, active: 0, completed: 0 },
    tasks: { total: 0, completed: 0, inProgress: 0, todo: 0 }
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, projectsRes, tasksRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/projects'),
        fetch('/api/tasks')
      ]);

      // Проверяем статус ответов
      if (!statsRes.ok) {
        const text = await statsRes.text();
        console.error('Ошибка /api/stats:', statsRes.status, text.substring(0, 200));
        throw new Error(`HTTP error! status: ${statsRes.status}`);
      }
      if (!projectsRes.ok) {
        const text = await projectsRes.text();
        console.error('Ошибка /api/projects:', projectsRes.status, text.substring(0, 200));
        throw new Error(`HTTP error! status: ${projectsRes.status}`);
      }
      if (!tasksRes.ok) {
        const text = await tasksRes.text();
        console.error('Ошибка /api/tasks:', tasksRes.status, text.substring(0, 200));
        throw new Error(`HTTP error! status: ${tasksRes.status}`);
      }

      const statsData = await statsRes.json();
      const projectsData = await projectsRes.json();
      const tasksData = await tasksRes.json();

      console.log('Получены данные stats:', statsData);
      console.log('JSON stats:', JSON.stringify(statsData, null, 2));
      console.log('Получены данные projects:', projectsData);
      console.log('Получены данные tasks:', tasksData);

      // Проверка структуры и преобразование если нужно
      if (statsData && !statsData.projects) {
        // Если пришла старая структура - преобразуем
        console.warn('Получена старая структура stats, преобразую...');
        const normalizedStats = {
          projects: {
            total: statsData.totalProjects || 0,
            active: statsData.activeProjects || 0,
            completed: statsData.completedProjects || 0
          },
          tasks: {
            total: statsData.totalTasks || 0,
            todo: statsData.todoTasks || 0,
            inProgress: statsData.inProgressTasks || 0,
            completed: statsData.completedTasks || 0
          }
        };
        console.log('Нормализованная структура:', normalizedStats);
        setStats(normalizedStats);
      } else {
        setStats(statsData);
      }

      setRecentProjects(projectsData.slice(0, 5));
      setRecentTasks(tasksData.slice(0, 10));
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка данных...</div>;
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': 'badge-success',
      'completed': 'badge-primary',
      'paused': 'badge-warning',
      'todo': 'badge-secondary',
      'in-progress': 'badge-info',
      'completed': 'badge-success'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const getPriorityClass = (priority) => {
    const priorityMap = {
      'high': 'priority-high',
      'medium': 'priority-medium',
      'low': 'priority-low'
    };
    return priorityMap[priority] || '';
  };

  return (
    <div className="container">
      <h2 className="mb-3">Обзор</h2>
      
      {/* Статистика */}
      <div className="grid grid-4 mb-3">
        <div className="card text-center">
          <Folder size={40} color="#3498db" />
          <h3>{stats.projects.total}</h3>
          <p className="text-muted">Всего проектов</p>
          <div className="flex flex-center flex-gap">
            <span className="badge badge-success">{stats.projects.active} активных</span>
            <span className="badge badge-primary">{stats.projects.completed} завершено</span>
          </div>
        </div>
        
        <div className="card text-center">
          <CheckSquare size={40} color="#27ae60" />
          <h3>{stats.tasks.total}</h3>
          <p className="text-muted">Всего задач</p>
          <div className="flex flex-center flex-gap">
            <span className="badge badge-info">{stats.tasks.inProgress} в работе</span>
            <span className="badge badge-success">{stats.tasks.completed} завершено</span>
          </div>
        </div>
        
        <div className="card text-center">
          <Clock size={40} color="#f39c12" />
          <h3>{stats.tasks.todo}</h3>
          <p className="text-muted">Задач в очереди</p>
          <div className="text-muted">
            Требуют внимания
          </div>
        </div>
        
        <div className="card text-center">
          <TrendingUp size={40} color="#e74c3c" />
          <h3>
            {stats.tasks.total > 0 
              ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) 
              : 0}%
          </h3>
          <p className="text-muted">Прогресс</p>
          <div className="text-success">
            Завершено задач
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Недавние проекты */}
        <div className="card">
          <h3>Недавние проекты</h3>
          {recentProjects.length === 0 ? (
            <p className="text-muted">Нет проектов</p>
          ) : (
            <div className="project-list">
              {recentProjects.map(project => (
                <div key={project.id} className="project-item">
                  <div className="flex flex-between flex-center">
                    <div>
                      <h4>{project.name}</h4>
                      <p className="text-muted text-sm">{project.description}</p>
                      <div className="flex flex-gap">
                        <span className={`badge ${getStatusBadge(project.status)}`}>
                          {project.status}
                        </span>
                        {project.startDate && (
                          <span className="text-muted text-sm">
                            {format(new Date(project.startDate), 'dd.MM.yyyy', { locale: ru })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Недавние задачи */}
        <div className="card">
          <h3>Недавние задачи</h3>
          {recentTasks.length === 0 ? (
            <p className="text-muted">Нет задач</p>
          ) : (
            <div className="task-list">
              {recentTasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="flex flex-between flex-center">
                    <div>
                      <h4>{task.title}</h4>
                      <p className="text-muted text-sm">{task.description}</p>
                      <div className="flex flex-gap">
                        <span className={`badge ${getStatusBadge(task.status)}`}>
                          {task.status}
                        </span>
                        <span className={`text-sm ${getPriorityClass(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className="text-muted text-sm">
                            до {format(new Date(task.dueDate), 'dd.MM.yyyy', { locale: ru })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
