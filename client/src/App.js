import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Calendar, Plus, Folder, CheckSquare, Users, BarChart3, Search, Download, Kanban, TrendingUp, Settings, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Tasks from './components/Tasks';
import CalendarView from './components/CalendarView';
import KanbanView from './components/KanbanView';
import Analytics from './components/Analytics';
import UserManagement from './components/UserManagement';
import ProjectDetail from './components/ProjectDetail';
import SearchBar from './components/SearchBar';
import NotificationCenter from './components/NotificationCenter';
import ExportData from './components/ExportData';
import Auth from './components/Auth';
import './App.css';

const AppContent = () => {
  const { user, logout, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showSearch, setShowSearch] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // Горячие клавиши - всегда вызываем useEffect перед условными возвратами
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowExport(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  const navigation = [
    { id: 'dashboard', label: 'Панель управления', icon: BarChart3, path: '/' },
    { id: 'projects', label: 'Проекты', icon: Folder, path: '/projects' },
    { id: 'tasks', label: 'Задачи', icon: CheckSquare, path: '/tasks' },
    { id: 'kanban', label: 'Kanban', icon: Kanban, path: '/kanban' },
    { id: 'analytics', label: 'Аналитика', icon: TrendingUp, path: '/analytics' },
    { id: 'users', label: 'Пользователи', icon: Settings, path: '/users' },
    { id: 'calendar', label: 'Календарь', icon: Calendar, path: '/calendar' }
  ].filter(item => {
    // Фильтруем навигацию по ролям
    if (item.id === 'users') {
      return user.role === 'admin' || user.role === 'manager';
    }
    return true;
  });

  return (
    <Router>
      <div className="app">
        <nav className="sidebar">
          <div className="sidebar-header">
            <h2>PM Tool</h2>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
          <ul className="nav-menu">
            {navigation.map((item) => (
              <li key={item.id} className="nav-item">
                <Link 
                  to={item.path} 
                  className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                  onClick={() => setCurrentPage(item.id)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="main-content">
          <header className="header">
            <div className="header-content">
              <h1>{navigation.find(n => n.id === currentPage)?.label || 'Панель управления'}</h1>
            <div className="header-actions">
              <NotificationCenter />
              <button 
                className="btn btn-secondary"
                onClick={() => setShowSearch(true)}
                title="Поиск (Ctrl+K)"
              >
                <Search size={16} />
                Поиск
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowExport(true)}
                title="Экспорт данных"
              >
                <Download size={16} />
                Экспорт
              </button>
              <button className="btn btn-primary">
                <Plus size={16} />
                Создать
              </button>
              <button 
                className="btn btn-danger"
                onClick={logout}
                title="Выйти"
              >
                <LogOut size={16} />
                Выйти
              </button>
            </div>
            </div>
          </header>

          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/kanban" element={<KanbanView />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/calendar" element={<CalendarView />} />
            </Routes>
          </div>
        </main>
      </div>
      
      {showSearch && (
        <SearchBar onClose={() => setShowSearch(false)} />
      )}
      
      {showExport && (
        <ExportData onClose={() => setShowExport(false)} />
      )}
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
