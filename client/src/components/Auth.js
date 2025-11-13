import React, { useState } from 'react';
import { LogIn, UserPlus, Eye, EyeOff, Shield, UserCheck, Code } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Auth = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'developer',
    department: '',
    position: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include', // Важно: получаем cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        // JWT токен уже установлен в httpOnly cookie сервером
        // Сохраняем только данные пользователя
        login(data.user);
      } else {
        setError(data.message || 'Произошла ошибка');
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield size={16} color="#dc3545" />;
      case 'manager':
        return <UserCheck size={16} color="#007bff" />;
      case 'developer':
        return <Code size={16} color="#28a745" />;
      default:
        return <UserCheck size={16} color="#6c757d" />;
    }
  };

  const getRoleText = (role) => {
    const roleMap = {
      'admin': 'Администратор',
      'manager': 'Менеджер',
      'developer': 'Разработчик'
    };
    return roleMap[role] || role;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <h1>PM Tool</h1>
            <p>Система управления проектами</p>
          </div>
        </div>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            <LogIn size={16} />
            Вход
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            <UserPlus size={16} />
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Имя</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required={!isLogin}
                className="form-control"
                placeholder="Введите ваше имя"
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="form-control"
              placeholder="Введите email"
            />
          </div>

          <div className="form-group">
            <label>Пароль</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder="Введите пароль"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>Роль</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="developer">Разработчик</option>
                  <option value="manager">Менеджер</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>

              <div className="form-group">
                <label>Отдел</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Введите отдел"
                />
              </div>

              <div className="form-group">
                <label>Должность</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Введите должность"
                />
              </div>
            </>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        {/* Демо-аккаунты */}
        <div className="demo-accounts">
          <h4>Демо-аккаунты для тестирования:</h4>
          <div className="demo-list">
            <div className="demo-item" onClick={() => setFormData({...formData, email: 'admin@example.com', password: 'admin123'})}>
              {getRoleIcon('admin')}
              <div>
                <strong>Администратор</strong>
                <p>admin@example.com / admin123</p>
              </div>
            </div>
            <div className="demo-item" onClick={() => setFormData({...formData, email: 'manager@example.com', password: 'manager123'})}>
              {getRoleIcon('manager')}
              <div>
                <strong>Менеджер</strong>
                <p>manager@example.com / manager123</p>
              </div>
            </div>
            <div className="demo-item" onClick={() => setFormData({...formData, email: 'developer@example.com', password: 'dev123'})}>
              {getRoleIcon('developer')}
              <div>
                <strong>Разработчик</strong>
                <p>developer@example.com / dev123</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        
        .auth-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 450px;
          overflow: hidden;
        }
        
        .auth-header {
          background: #007bff;
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        
        .auth-logo h1 {
          margin: 0 0 5px 0;
          font-size: 28px;
          font-weight: bold;
        }
        
        .auth-logo p {
          margin: 0;
          opacity: 0.9;
        }
        
        .auth-tabs {
          display: flex;
          border-bottom: 1px solid #e1e8ed;
        }
        
        .auth-tab {
          flex: 1;
          padding: 15px;
          border: none;
          background: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #6c757d;
          transition: all 0.2s ease;
        }
        
        .auth-tab:hover {
          background: #f8f9fa;
        }
        
        .auth-tab.active {
          color: #007bff;
          border-bottom: 2px solid #007bff;
          background: #f8f9fa;
        }
        
        .auth-form {
          padding: 30px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #2c3e50;
        }
        
        .form-control {
          width: 100%;
          padding: 12px;
          border: 1px solid #e1e8ed;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }
        
        .form-control:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        
        .password-input {
          position: relative;
        }
        
        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: none;
          cursor: pointer;
          color: #6c757d;
          padding: 4px;
        }
        
        .btn {
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .btn-primary {
          background: #007bff;
          color: white;
        }
        
        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
        }
        
        .btn-primary:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        
        .btn-full {
          width: 100%;
        }
        
        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
          border: 1px solid #f5c6cb;
        }
        
        .demo-accounts {
          padding: 20px 30px 30px;
          border-top: 1px solid #e1e8ed;
          background: #f8f9fa;
        }
        
        .demo-accounts h4 {
          margin: 0 0 15px 0;
          font-size: 14px;
          color: #6c757d;
        }
        
        .demo-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .demo-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e1e8ed;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .demo-item:hover {
          border-color: #007bff;
          background: #f8f9fa;
        }
        
        .demo-item strong {
          display: block;
          font-size: 13px;
          color: #2c3e50;
        }
        
        .demo-item p {
          margin: 2px 0 0 0;
          font-size: 11px;
          color: #6c757d;
        }
        
        /* Responsive */
        @media (max-width: 480px) {
          .auth-container {
            padding: 10px;
          }
          
          .auth-form {
            padding: 20px;
          }
          
          .demo-accounts {
            padding: 15px 20px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Auth;
