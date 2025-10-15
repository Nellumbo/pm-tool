import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Shield, UserCheck, Code, Settings } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentRole, setCurrentRole] = useState('developer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'developer',
    department: '',
    position: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Получаем токен из localStorage
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Для демонстрации также добавляем заголовок роли
      headers['X-User-Role'] = currentRole;
      
      const response = await fetch('/api/users', { headers });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Ошибка загрузки пользователей:', response.statusText);
        // Показываем предупреждение о недостатке прав
        setUsers([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'X-User-Role': 'admin' // Для создания/редактирования нужны права админа
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchUsers();
        setShowModal(false);
        setEditingUser(null);
        setFormData({
          name: '',
          email: '',
          role: 'developer',
          department: '',
          position: ''
        });
      } else {
        const error = await response.json();
        alert(error.message || 'Ошибка сохранения пользователя');
      }
    } catch (error) {
      console.error('Ошибка сохранения пользователя:', error);
      alert('Ошибка сохранения пользователя');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'X-User-Role': 'admin'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          headers
        });

        if (response.ok) {
          await fetchUsers();
        } else {
          const error = await response.json();
          alert(error.message || 'Ошибка удаления пользователя');
        }
      } catch (error) {
        console.error('Ошибка удаления пользователя:', error);
        alert('Ошибка удаления пользователя');
      }
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || '',
      position: user.position || ''
    });
    setShowModal(true);
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
        return <Users size={16} color="#6c757d" />;
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

  const getRoleBadge = (role) => {
    const badgeMap = {
      'admin': 'badge-danger',
      'manager': 'badge-info',
      'developer': 'badge-success'
    };
    return badgeMap[role] || 'badge-secondary';
  };

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    fetchUsers();
  };

  if (loading) {
    return <div className="loading">Загрузка пользователей...</div>;
  }

  return (
    <div className="container">
      <div className="user-management-header">
        <h2>Управление пользователями</h2>
        <p className="text-muted">Управление ролями и разрешениями пользователей</p>
      </div>

      {/* Переключатель ролей для демонстрации */}
      <div className="role-switcher">
        <h3>Демонстрация ролей</h3>
        <div className="role-buttons">
          <button 
            className={`btn ${currentRole === 'developer' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleRoleChange('developer')}
          >
            <Code size={16} />
            Разработчик
          </button>
          <button 
            className={`btn ${currentRole === 'manager' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleRoleChange('manager')}
          >
            <UserCheck size={16} />
            Менеджер
          </button>
          <button 
            className={`btn ${currentRole === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleRoleChange('admin')}
          >
            <Shield size={16} />
            Администратор
          </button>
        </div>
        <p className="text-muted">
          Текущая роль: <strong>{getRoleText(currentRole)}</strong>
        </p>
      </div>

      <div className="user-actions">
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          disabled={currentRole !== 'admin'}
        >
          <Plus size={16} />
          Добавить пользователя
        </button>
        {currentRole !== 'admin' && (
          <span className="text-muted">Только администраторы могут добавлять пользователей</span>
        )}
      </div>

      <div className="users-grid">
        {users.length === 0 ? (
          <div className="no-users">
            <Users size={48} color="#6c757d" />
            <h3>Нет пользователей</h3>
            <p>Пользователи не найдены или у вас нет прав для их просмотра</p>
          </div>
        ) : (
          users.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-header">
                <div className="user-avatar">
                  <Users size={24} />
                </div>
                <div className="user-info">
                  <h4>{user.name}</h4>
                  <p className="user-email">{user.email}</p>
                </div>
                <div className="user-role">
                  <span className={`badge ${getRoleBadge(user.role)}`}>
                    {getRoleIcon(user.role)}
                    {getRoleText(user.role)}
                  </span>
                </div>
              </div>
              
              <div className="user-details">
                {user.department && (
                  <div className="user-detail">
                    <strong>Отдел:</strong> {user.department}
                  </div>
                )}
                {user.position && (
                  <div className="user-detail">
                    <strong>Должность:</strong> {user.position}
                  </div>
                )}
                <div className="user-detail">
                  <strong>ID:</strong> {user.id}
                </div>
              </div>
              
              <div className="user-actions">
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => openEditModal(user)}
                  disabled={currentRole !== 'admin'}
                  title={currentRole !== 'admin' ? 'Только для администраторов' : 'Редактировать'}
                >
                  <Edit size={14} />
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(user.id)}
                  disabled={currentRole !== 'admin'}
                  title={currentRole !== 'admin' ? 'Только для администраторов' : 'Удалить'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Модальное окно создания/редактирования */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingUser ? 'Редактировать пользователя' : 'Создать пользователя'}</h3>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setEditingUser(null);
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Имя</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Роль</label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
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
                  className="form-control"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Должность</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                />
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                  }}
                >
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .container {
          padding: 20px;
          background: #f5f7fa;
          min-height: 100vh;
        }
        
        .user-management-header {
          margin-bottom: 30px;
        }
        
        .user-management-header h2 {
          margin: 0 0 5px 0;
          color: #2c3e50;
        }
        
        .role-switcher {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .role-switcher h3 {
          margin: 0 0 15px 0;
          color: #2c3e50;
        }
        
        .role-buttons {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }
        
        .user-actions {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .no-users {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .no-users h3 {
          margin: 15px 0 10px 0;
          color: #6c757d;
        }
        
        .user-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
        }
        
        .user-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .user-header {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .user-avatar {
          width: 50px;
          height: 50px;
          background: #007bff;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .user-info {
          flex: 1;
        }
        
        .user-info h4 {
          margin: 0 0 5px 0;
          color: #2c3e50;
        }
        
        .user-email {
          margin: 0;
          color: #6c757d;
          font-size: 14px;
        }
        
        .user-role .badge {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .user-details {
          margin-bottom: 15px;
        }
        
        .user-detail {
          margin-bottom: 5px;
          font-size: 14px;
          color: #6c757d;
        }
        
        .user-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        
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
          z-index: 2000;
        }
        
        .modal {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
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
        
        /* Responsive */
        @media (max-width: 768px) {
          .users-grid {
            grid-template-columns: 1fr;
          }
          
          .role-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
