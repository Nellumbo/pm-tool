import React, { useState, useEffect } from 'react';
import { Plus, Copy, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import useApi from '../hooks/useApi';
import { Modal, Button, Badge } from './common';
import { formatDateTime } from '../utils';

const InviteManager = () => {
  const { get, post, delete: deleteApi } = useApi();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInvite, setNewInvite] = useState({
    role: 'developer',
    expiresInDays: 30
  });
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const data = await get('/api/invites');
      setInvites(data);
    } catch (error) {
      console.error('Ошибка загрузки инвайтов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvite = async (e) => {
    e.preventDefault();
    try {
      await post('/api/invites', newInvite);
      await fetchInvites();
      setShowCreateModal(false);
      setNewInvite({ role: 'developer', expiresInDays: 30 });
    } catch (error) {
      console.error('Ошибка создания инвайта:', error);
      alert('Ошибка создания инвайт-кода: ' + (error.message || 'Попробуйте снова'));
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDeleteInvite = async (id) => {
    if (!window.confirm('Удалить этот инвайт-код?')) return;

    try {
      await deleteApi(`/api/invites/${id}`);
      await fetchInvites();
    } catch (error) {
      console.error('Ошибка удаления инвайта:', error);
      alert('Ошибка: ' + (error.message || 'Нельзя удалить использованный инвайт'));
    }
  };

  const getStatusIcon = (invite) => {
    if (invite.usedBy) {
      return <CheckCircle size={20} className="text-success" />;
    }
    if (!invite.isActive) {
      return <XCircle size={20} className="text-danger" />;
    }
    const now = new Date();
    const expires = new Date(invite.expiresAt);
    if (now > expires) {
      return <Clock size={20} className="text-warning" />;
    }
    return <CheckCircle size={20} className="text-primary" />;
  };

  const getStatusText = (invite) => {
    if (invite.usedBy) return 'Использован';
    if (!invite.isActive) return 'Неактивен';
    const now = new Date();
    const expires = new Date(invite.expiresAt);
    if (now > expires) return 'Истек';
    return 'Активен';
  };

  if (loading) {
    return <div className="loading">Загрузка инвайтов...</div>;
  }

  return (
    <div className="invite-manager">
      <div className="page-header">
        <h1>Управление инвайт-кодами</h1>
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => setShowCreateModal(true)}
        >
          Создать инвайт-код
        </Button>
      </div>

      <div className="info-box">
        <h3>ℹ️ Как работают инвайт-коды</h3>
        <ul>
          <li>Только пользователи с инвайт-кодом могут зарегистрироваться</li>
          <li>Каждый код одноразовый - после использования становится неактивным</li>
          <li>Роль пользователя определяется ролью из инвайт-кода</li>
          <li>Коды имеют срок действия (по умолчанию 30 дней)</li>
        </ul>
      </div>

      <div className="invites-stats">
        <div className="stat-card">
          <div className="stat-value">{invites.length}</div>
          <div className="stat-label">Всего кодов</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {invites.filter(i => i.isActive && !i.usedBy).length}
          </div>
          <div className="stat-label">Активных</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {invites.filter(i => i.usedBy).length}
          </div>
          <div className="stat-label">Использовано</div>
        </div>
      </div>

      <div className="invites-table-wrapper">
        <table className="invites-table">
          <thead>
            <tr>
              <th>Статус</th>
              <th>Код</th>
              <th>Роль</th>
              <th>Создан</th>
              <th>Истекает</th>
              <th>Использован</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {invites.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  Нет инвайт-кодов. Создайте первый!
                </td>
              </tr>
            ) : (
              invites.map(invite => (
                <tr key={invite.id} className={!invite.isActive ? 'inactive-invite' : ''}>
                  <td>
                    <div className="status-cell">
                      {getStatusIcon(invite)}
                      <span>{getStatusText(invite)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="code-cell">
                      <code className="invite-code">{invite.code}</code>
                      <button
                        className="copy-btn"
                        onClick={() => handleCopyCode(invite.code)}
                        title="Скопировать код"
                      >
                        {copiedCode === invite.code ? (
                          <CheckCircle size={16} className="text-success" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td>
                    <Badge type="role" value={invite.role} size="small" />
                  </td>
                  <td>
                    <div className="date-cell">
                      <div>{formatDateTime(invite.createdAt)}</div>
                      <small className="text-muted">
                        от {invite.creatorName}
                      </small>
                    </div>
                  </td>
                  <td>{formatDateTime(invite.expiresAt)}</td>
                  <td>
                    {invite.usedBy ? (
                      <div className="date-cell">
                        <div>{formatDateTime(invite.usedAt)}</div>
                        <small className="text-muted">
                          {invite.usedByName}
                        </small>
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    {!invite.usedBy && (
                      <Button
                        variant="danger"
                        size="small"
                        icon={<Trash2 size={14} />}
                        onClick={() => handleDeleteInvite(invite.id)}
                      >
                        Удалить
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Модальное окно создания инвайта */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Создать инвайт-код"
        size="small"
      >
        <form onSubmit={handleCreateInvite} className="invite-form">
          <div className="form-group">
            <label>Роль пользователя</label>
            <select
              value={newInvite.role}
              onChange={(e) => setNewInvite({...newInvite, role: e.target.value})}
              required
            >
              <option value="developer">Разработчик</option>
              <option value="manager">Менеджер</option>
              <option value="admin">Администратор</option>
            </select>
            <small className="form-hint">
              Пользователь получит эту роль при регистрации
            </small>
          </div>

          <div className="form-group">
            <label>Срок действия (дней)</label>
            <input
              type="number"
              min="1"
              max="365"
              value={newInvite.expiresInDays}
              onChange={(e) => setNewInvite({...newInvite, expiresInDays: parseInt(e.target.value)})}
              required
            />
            <small className="form-hint">
              После истечения срока код станет недействительным
            </small>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Отмена
            </Button>
            <Button type="submit" variant="primary">
              Создать код
            </Button>
          </div>
        </form>
      </Modal>

      <style jsx>{`
        .invite-manager {
          padding: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .info-box {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border-radius: 4px;
        }

        .info-box h3 {
          margin: 0 0 1rem 0;
          color: #1976d2;
        }

        .info-box ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .info-box li {
          margin: 0.5rem 0;
          color: #555;
        }

        .invites-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          text-align: center;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: bold;
          color: #2196f3;
        }

        .stat-label {
          color: #666;
          margin-top: 0.5rem;
        }

        .invites-table-wrapper {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow-x: auto;
        }

        .invites-table {
          width: 100%;
          border-collapse: collapse;
        }

        .invites-table th {
          background: #f5f5f5;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #e0e0e0;
        }

        .invites-table td {
          padding: 1rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .invites-table tr.inactive-invite {
          opacity: 0.6;
          background: #fafafa;
        }

        .status-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .code-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .invite-code {
          font-family: 'Courier New', monospace;
          background: #f5f5f5;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: bold;
        }

        .copy-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          color: #666;
          transition: color 0.2s;
        }

        .copy-btn:hover {
          color: #2196f3;
        }

        .date-cell {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .text-muted {
          color: #999;
          font-size: 0.875rem;
        }

        .text-center {
          text-align: center;
          padding: 2rem;
          color: #999;
        }

        .text-success {
          color: #4caf50;
        }

        .text-danger {
          color: #f44336;
        }

        .text-warning {
          color: #ff9800;
        }

        .text-primary {
          color: #2196f3;
        }

        .invite-form {
          padding: 1rem 0;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .form-hint {
          display: block;
          margin-top: 0.25rem;
          font-size: 0.875rem;
          color: #666;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
};

export default InviteManager;
