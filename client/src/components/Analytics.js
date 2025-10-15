import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Clock, CheckCircle, Calendar, Target } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import useApi from '../hooks/useApi';

const Analytics = () => {
  const { get } = useApi();
  const [stats, setStats] = useState({
    projects: { total: 0, active: 0, completed: 0 },
    tasks: { total: 0, completed: 0, inProgress: 0, todo: 0 }
  });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, projectsData, tasksData] = await Promise.all([
        get('/api/stats'),
        get('/api/projects'),
        get('/api/tasks')
      ]);

      let usersData = [];
      try {
        usersData = await get('/api/users');
      } catch (error) {
        console.warn('Не удалось загрузить пользователей:', error.message);
        // Используем пустой массив если нет доступа к пользователям
        usersData = [];
      }

      setStats(statsData);
      setProjects(projectsData);
      setTasks(tasksData);
      setUsers(usersData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  // Данные для графиков
  const getProjectProgressData = () => {
    if (!Array.isArray(projects) || !Array.isArray(tasks)) {
      return [];
    }
    
    return projects.map(project => {
      const projectTasks = tasks.filter(task => task.projectId === project.id);
      const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
      const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
      
      return {
        name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
        progress,
        completed: completedTasks,
        total: projectTasks.length
      };
    }).filter(item => item.total > 0);
  };

  const getTasksByPriorityData = () => {
    if (!Array.isArray(tasks)) {
      return [];
    }
    
    const priorityData = [
      { name: 'Высокий', value: tasks.filter(t => t.priority === 'high').length, color: '#dc3545' },
      { name: 'Средний', value: tasks.filter(t => t.priority === 'medium').length, color: '#ffc107' },
      { name: 'Низкий', value: tasks.filter(t => t.priority === 'low').length, color: '#28a745' }
    ];
    return priorityData.filter(item => item.value > 0);
  };

  const getTasksByStatusData = () => {
    return [
      { name: 'К выполнению', value: stats.tasks.todo, color: '#6c757d' },
      { name: 'В работе', value: stats.tasks.inProgress, color: '#007bff' },
      { name: 'Завершено', value: stats.tasks.completed, color: '#28a745' }
    ].filter(item => item.value > 0);
  };

  const getWeeklyProgressData = () => {
    if (!Array.isArray(tasks)) {
      return [];
    }
    
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      
      // Считаем задачи, завершенные в этот день
      const completedToday = tasks.filter(task => {
        if (task.status !== 'completed' || !task.updatedAt) return false;
        const taskDate = startOfDay(new Date(task.updatedAt));
        return taskDate.getTime() === dayStart.getTime();
      }).length;

      last7Days.push({
        date: format(date, 'dd.MM', { locale: ru }),
        completed: completedToday,
        created: tasks.filter(task => {
          if (!task.createdAt) return false;
          const taskDate = startOfDay(new Date(task.createdAt));
          return taskDate.getTime() === dayStart.getTime();
        }).length
      });
    }
    return last7Days;
  };

  const getTeamWorkloadData = () => {
    // Проверяем, что users является массивом
    if (!Array.isArray(users) || users.length === 0) {
      return [];
    }
    
    const userStats = users.map(user => {
      const userTasks = tasks.filter(task => task.assigneeId === user.id);
      const completed = userTasks.filter(task => task.status === 'completed').length;
      const inProgress = userTasks.filter(task => task.status === 'in-progress').length;
      const todo = userTasks.filter(task => task.status === 'todo').length;
      
      return {
        name: user.name,
        completed,
        inProgress,
        todo,
        total: userTasks.length
      };
    }).filter(user => user.total > 0);

    return userStats;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-item" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="loading">Загрузка аналитики...</div>;
  }

  const projectProgressData = getProjectProgressData();
  const priorityData = getTasksByPriorityData();
  const statusData = getTasksByStatusData();
  const weeklyData = getWeeklyProgressData();
  const teamData = getTeamWorkloadData();

  return (
    <div className="container">
      <div className="analytics-header">
        <h2>Аналитика и отчеты</h2>
        <p className="text-muted">Детальная статистика по проектам и задачам</p>
      </div>

      {/* Общая статистика */}
      <div className="analytics-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.projects.total}</h3>
            <p>Всего проектов</p>
            <span className="stat-detail">
              {stats.projects.active} активных
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.tasks.total}</h3>
            <p>Всего задач</p>
            <span className="stat-detail">
              {stats.tasks.completed} завершено
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{users.length}</h3>
            <p>Участников</p>
            <span className="stat-detail">
              В команде
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>
              {stats.tasks.total > 0 
                ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) 
                : 0}%
            </h3>
            <p>Прогресс</p>
            <span className="stat-detail">
              Выполнения
            </span>
          </div>
        </div>
      </div>

      {/* Графики */}
      <div className="analytics-charts">
        <div className="chart-grid">
          {/* Прогресс проектов */}
          <div className="chart-card">
            <h3>Прогресс проектов</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="progress" fill="#007bff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Задачи по приоритетам */}
          <div className="chart-card">
            <h3>Задачи по приоритетам</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Задачи по статусам */}
          <div className="chart-card">
            <h3>Задачи по статусам</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Еженедельный прогресс */}
          <div className="chart-card">
            <h3>Прогресс за неделю</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="completed" stackId="1" stroke="#28a745" fill="#28a745" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="created" stackId="2" stroke="#007bff" fill="#007bff" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Загруженность команды */}
          {teamData.length > 0 && (
            <div className="chart-card">
              <h3>Загруженность команды</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="completed" stackId="a" fill="#28a745" />
                    <Bar dataKey="inProgress" stackId="a" fill="#007bff" />
                    <Bar dataKey="todo" stackId="a" fill="#6c757d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Тренд выполнения */}
          <div className="chart-card">
            <h3>Тренд выполнения</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="completed" stroke="#28a745" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .container {
          padding: 20px;
          background: #f5f7fa;
          min-height: 100vh;
        }
        
        .analytics-header {
          margin-bottom: 30px;
        }
        
        .analytics-header h2 {
          margin: 0 0 5px 0;
          color: #2c3e50;
        }
        
        .analytics-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 15px;
          transition: transform 0.2s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .stat-icon {
          width: 50px;
          height: 50px;
          background: #007bff;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .stat-content h3 {
          margin: 0 0 5px 0;
          font-size: 24px;
          font-weight: bold;
          color: #2c3e50;
        }
        
        .stat-content p {
          margin: 0 0 5px 0;
          font-size: 14px;
          color: #6c757d;
        }
        
        .stat-detail {
          font-size: 12px;
          color: #007bff;
          font-weight: 500;
        }
        
        .analytics-charts {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .chart-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }
        
        .chart-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e1e8ed;
        }
        
        .chart-card h3 {
          margin: 0 0 15px 0;
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .chart-container {
          width: 100%;
          height: 300px;
        }
        
        .custom-tooltip {
          background: white;
          border: 1px solid #e1e8ed;
          border-radius: 6px;
          padding: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        .tooltip-label {
          margin: 0 0 5px 0;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .tooltip-item {
          margin: 2px 0;
          font-size: 12px;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .chart-grid {
            grid-template-columns: 1fr;
          }
          
          .analytics-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .stat-card {
            padding: 15px;
          }
          
          .stat-icon {
            width: 40px;
            height: 40px;
          }
          
          .stat-content h3 {
            font-size: 20px;
          }
        }
        
        @media (max-width: 480px) {
          .analytics-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Analytics;
