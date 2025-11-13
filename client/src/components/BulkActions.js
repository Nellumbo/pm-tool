import React, { useState } from 'react';
import { Trash2, CheckCircle, AlertCircle, User, Tag, X } from 'lucide-react';

const BulkActions = ({
  selectedTasks,
  onClearSelection,
  onBulkDelete,
  onBulkStatusChange,
  onBulkPriorityChange,
  onBulkAssignUser,
  onBulkAddLabel,
  users = [],
  projects = []
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    try {
      await onBulkDelete();
      setShowDeleteConfirm(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkStatusChange = async () => {
    if (!selectedStatus) return;
    setIsProcessing(true);
    try {
      await onBulkStatusChange(selectedStatus);
      setShowStatusModal(false);
      setSelectedStatus('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkPriorityChange = async () => {
    if (!selectedPriority) return;
    setIsProcessing(true);
    try {
      await onBulkPriorityChange(selectedPriority);
      setShowPriorityModal(false);
      setSelectedPriority('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAssignUser = async () => {
    setIsProcessing(true);
    try {
      await onBulkAssignUser(selectedUser);
      setShowAssignModal(false);
      setSelectedUser('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAddLabel = async () => {
    if (!labelInput.trim()) return;
    setIsProcessing(true);
    try {
      await onBulkAddLabel(labelInput.trim());
      setShowLabelModal(false);
      setLabelInput('');
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedTasks.length === 0) return null;

  return (
    <>
      <div className="bulk-actions-bar">
        <div className="bulk-actions-content">
          <div className="bulk-actions-info">
            <span className="selected-count">
              Выбрано: <strong>{selectedTasks.length}</strong>
            </span>
            <button
              className="btn-clear"
              onClick={onClearSelection}
              title="Снять выделение"
            >
              <X size={16} />
              Снять выделение
            </button>
          </div>

          <div className="bulk-actions-buttons">
            <button
              className="bulk-btn bulk-btn-status"
              onClick={() => setShowStatusModal(true)}
              title="Изменить статус"
            >
              <CheckCircle size={16} />
              Статус
            </button>

            <button
              className="bulk-btn bulk-btn-priority"
              onClick={() => setShowPriorityModal(true)}
              title="Изменить приоритет"
            >
              <AlertCircle size={16} />
              Приоритет
            </button>

            <button
              className="bulk-btn bulk-btn-assign"
              onClick={() => setShowAssignModal(true)}
              title="Назначить исполнителя"
            >
              <User size={16} />
              Исполнитель
            </button>

            <button
              className="bulk-btn bulk-btn-label"
              onClick={() => setShowLabelModal(true)}
              title="Добавить метку"
            >
              <Tag size={16} />
              Метка
            </button>

            <button
              className="bulk-btn bulk-btn-delete"
              onClick={() => setShowDeleteConfirm(true)}
              title="Удалить выбранные"
            >
              <Trash2 size={16} />
              Удалить
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => !isProcessing && setShowDeleteConfirm(false)}>
          <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Подтверждение удаления</h3>
            </div>

            <div className="modal-body">
              <p>
                Вы уверены, что хотите удалить <strong>{selectedTasks.length}</strong> {
                  selectedTasks.length === 1 ? 'задачу' :
                  selectedTasks.length < 5 ? 'задачи' : 'задач'
                }?
              </p>
              <p className="text-danger">Это действие нельзя отменить.</p>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isProcessing}
              >
                Отмена
              </button>
              <button
                className="btn btn-danger"
                onClick={handleBulkDelete}
                disabled={isProcessing}
              >
                {isProcessing ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => !isProcessing && setShowStatusModal(false)}>
          <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Изменить статус</h3>
            </div>

            <div className="modal-body">
              <p>Изменить статус для {selectedTasks.length} {
                selectedTasks.length === 1 ? 'задачи' :
                selectedTasks.length < 5 ? 'задач' : 'задач'
              }:</p>

              <div className="form-group">
                <label>Новый статус</label>
                <select
                  className="form-control"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  autoFocus
                >
                  <option value="">Выберите статус</option>
                  <option value="todo">К выполнению</option>
                  <option value="in-progress">В работе</option>
                  <option value="completed">Завершено</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowStatusModal(false)}
                disabled={isProcessing}
              >
                Отмена
              </button>
              <button
                className="btn btn-primary"
                onClick={handleBulkStatusChange}
                disabled={!selectedStatus || isProcessing}
              >
                {isProcessing ? 'Применение...' : 'Применить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Priority Change Modal */}
      {showPriorityModal && (
        <div className="modal-overlay" onClick={() => !isProcessing && setShowPriorityModal(false)}>
          <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Изменить приоритет</h3>
            </div>

            <div className="modal-body">
              <p>Изменить приоритет для {selectedTasks.length} {
                selectedTasks.length === 1 ? 'задачи' :
                selectedTasks.length < 5 ? 'задач' : 'задач'
              }:</p>

              <div className="form-group">
                <label>Новый приоритет</label>
                <select
                  className="form-control"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  autoFocus
                >
                  <option value="">Выберите приоритет</option>
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowPriorityModal(false)}
                disabled={isProcessing}
              >
                Отмена
              </button>
              <button
                className="btn btn-primary"
                onClick={handleBulkPriorityChange}
                disabled={!selectedPriority || isProcessing}
              >
                {isProcessing ? 'Применение...' : 'Применить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => !isProcessing && setShowAssignModal(false)}>
          <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Назначить исполнителя</h3>
            </div>

            <div className="modal-body">
              <p>Назначить исполнителя для {selectedTasks.length} {
                selectedTasks.length === 1 ? 'задачи' :
                selectedTasks.length < 5 ? 'задач' : 'задач'
              }:</p>

              <div className="form-group">
                <label>Исполнитель</label>
                <select
                  className="form-control"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  autoFocus
                >
                  <option value="">Снять назначение</option>
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
                className="btn btn-secondary"
                onClick={() => setShowAssignModal(false)}
                disabled={isProcessing}
              >
                Отмена
              </button>
              <button
                className="btn btn-primary"
                onClick={handleBulkAssignUser}
                disabled={isProcessing}
              >
                {isProcessing ? 'Применение...' : 'Применить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Label Modal */}
      {showLabelModal && (
        <div className="modal-overlay" onClick={() => !isProcessing && setShowLabelModal(false)}>
          <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Добавить метку</h3>
            </div>

            <div className="modal-body">
              <p>Добавить метку к {selectedTasks.length} {
                selectedTasks.length === 1 ? 'задаче' :
                selectedTasks.length < 5 ? 'задачам' : 'задачам'
              }:</p>

              <div className="form-group">
                <label>Метка</label>
                <input
                  type="text"
                  className="form-control"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  placeholder="Введите название метки"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && labelInput.trim() && !isProcessing) {
                      handleBulkAddLabel();
                    }
                  }}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowLabelModal(false)}
                disabled={isProcessing}
              >
                Отмена
              </button>
              <button
                className="btn btn-primary"
                onClick={handleBulkAddLabel}
                disabled={!labelInput.trim() || isProcessing}
              >
                {isProcessing ? 'Добавление...' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .bulk-actions-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
          z-index: 999;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .bulk-actions-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .bulk-actions-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .selected-count {
          color: white;
          font-size: 15px;
        }

        .selected-count strong {
          font-weight: 600;
          font-size: 18px;
        }

        .btn-clear {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .btn-clear:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .bulk-actions-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .bulk-btn {
          background: white;
          border: none;
          padding: 10px 18px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .bulk-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .bulk-btn:active {
          transform: translateY(0);
        }

        .bulk-btn-status {
          color: #007bff;
        }

        .bulk-btn-priority {
          color: #fd7e14;
        }

        .bulk-btn-assign {
          color: #6f42c1;
        }

        .bulk-btn-label {
          color: #20c997;
        }

        .bulk-btn-delete {
          color: #dc3545;
        }

        .bulk-btn-delete:hover {
          background: #dc3545;
          color: white;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          animation: scaleIn 0.2s ease-out;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-small {
          max-width: 500px;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .modal-header {
          padding: 24px;
          border-bottom: 1px solid #e1e8ed;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #333;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-body p {
          margin: 0 0 16px 0;
          color: #555;
          line-height: 1.6;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid #e1e8ed;
          background: #f8f9fa;
          border-radius: 0 0 12px 12px;
        }

        .form-group {
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .form-control {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .form-control:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          min-width: 100px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background-color: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #0056b3;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #5a6268;
        }

        .btn-danger {
          background-color: #dc3545;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background-color: #c82333;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
        }

        .text-danger {
          color: #dc3545;
          font-size: 13px;
        }

        @media (max-width: 768px) {
          .bulk-actions-content {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .bulk-actions-info {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .selected-count {
            text-align: center;
          }

          .btn-clear {
            justify-content: center;
          }

          .bulk-actions-buttons {
            justify-content: center;
          }

          .bulk-btn {
            flex: 1;
            justify-content: center;
            min-width: 0;
          }
        }
      `}</style>
    </>
  );
};

export default BulkActions;
