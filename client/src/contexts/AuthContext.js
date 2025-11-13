import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем, есть ли сохраненный пользователь при загрузке приложения
    // JWT токен теперь в httpOnly cookie, недоступен для JS
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      // Проверяем валидность токена из cookie
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        credentials: 'include', // Важно: отправляет cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Токен недействителен, очищаем данные
        logout();
      }
    } catch (error) {
      console.error('Ошибка проверки токена:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (newUser) => {
    // JWT токен уже установлен в httpOnly cookie сервером
    // Сохраняем только данные пользователя для UX
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      // Вызываем endpoint для очистки cookie на сервере
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      // Очищаем локальное состояние
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const getAuthHeaders = () => {
    // JWT токен автоматически отправляется в cookie
    // Просто возвращаем базовые headers
    return {
      'Content-Type': 'application/json'
    };
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const hasAnyRole = (roles) => {
    return user && roles.includes(user.role);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    getAuthHeaders,
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
