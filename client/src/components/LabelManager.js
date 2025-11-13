import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, X, Palette } from 'lucide-react';
import useApi from '../hooks/useApi';
import LabelBadge from './LabelBadge';

/**
 * LabelManager Component
 *
 * Управление метками задач (создание, редактирование, удаление)
 * Отображает список всех меток с их цветами, описаниями и количеством использований
 */
const LabelManager = () => {
  const { get, post, put, delete: deleteApi } = useApi();
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#007bff',
    description: ''
  });
  const [error, setError] = useState('');

  // Предопределенные цвета для быстрого выбора
  const PRESET_COLORS = [
    '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
    '#6c757d', '#343a40', '#f8f9fa', '#e83e8c', '#fd7e14',
    '#20c997', '#6610f2', '#e74c3c', '#3498db', '#2ecc71',
    '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#95a5a6'
  ];

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      const data = await get('/api/labels');
      setLabels(data);
    } catch (error) {
      console.error('Ошибка загрузки меток:', error);
      setError('Не удалось загрузить метки');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Название метки обязательно');
      return;
    }

    try {
      if (editingLabel) {
        await put(`/api/labels/${editingLabel.id}`, formData);
      } else {
        await post('/api/labels', formData);
      }

      await fetchLabels();
      handleCloseModal();
    } catch (error) {
      console.error('Ошибка сохранения метки:', error);
      setError(error.message || 'Не удалось сохранить метку');
    }
  };

  const handleDelete = async (labelId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту метку? Она будет удалена из всех задач.')) {
      try {
        await deleteApi(`/api/labels/${labelId}`);
        await fetchLabels();
      } catch (error) {
        console.error('Ошибка удаления метки:', error);
        setError('Не удалось удалить метку');
      }
    }
  };

  const openEditModal = (label) => {
    setEditingLabel(label);
    setFormData({
      name: label.name,
      color: label.color,
      description: label.description || ''
    });
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLabel(null);
    setFormData({
      name: '',
      color: '#007bff',
      description: ''
    });
    setError('');
  };

  if (loading) {
    return <div className="loading">Загрузка меток...</div>;
  }

  return (
    <div className="container">
      <div className="flex flex-between flex-center mb-3">
        <h2>Управление метками</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} />
          Создать метку
        </button>
      </div>

      {error && !showModal && (
        <div className="error">
          {error}
        </div>
      )}

      {labels.length === 0 ? (
        <div className="card text-center">
          <Tag size={48} color="#6c757d" />
          <h3>Нет меток</h3>
          <p className="text-muted">
            Создайте первую метку для организации задач
          </p>
          <button
            className="btn btn-primary mt-2"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            Создать метку
          </button>
        </div>
      ) : (
        <div className="labels-grid">
          {labels.map(label => (
            <div key={label.id} className="label-card card">
              <div className="label-card-header">
                <LabelBadge label={label} size="large" />
                <div className="label-card-actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => openEditModal(label)}
                    title="Редактировать"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(label.id)}
                    title="Удалить"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {label.description && (
                <p className="label-card-description text-muted">
                  {label.description}
                </p>
              )}

              <div className="label-card-stats">
                <span className="badge badge-info">
                  Использований: {label.usageCount || 0}
                </span>
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
              <h3>{editingLabel ? 'Редактировать метку' : 'Создать метку'}</h3>
              <button
                className="btn btn-sm btn-secondary"
                onClick={handleCloseModal}
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Название метки *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Например: Срочно, Bug, Feature"
                  required
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <label>Описание (необязательно)</label>
                <textarea
                  className="form-control textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Краткое описание метки"
                  maxLength={200}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>
                  <Palette size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  Цвет метки
                </label>
                <div className="color-picker">
                  <input
                    type="color"
                    className="color-input"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                  />
                  <input
                    type="text"
                    className="form-control color-hex"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    placeholder="#000000"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>

                <div className="color-presets">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-preset ${formData.color === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({...formData, color})}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Предпросмотр</label>
                <div className="label-preview">
                  <LabelBadge
                    label={{
                      id: 'preview',
                      name: formData.name || 'Название метки',
                      color: formData.color
                    }}
                    size="small"
                  />
                  <LabelBadge
                    label={{
                      id: 'preview',
                      name: formData.name || 'Название метки',
                      color: formData.color
                    }}
                    size="medium"
                  />
                  <LabelBadge
                    label={{
                      id: 'preview',
                      name: formData.name || 'Название метки',
                      color: formData.color
                    }}
                    size="large"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingLabel ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .labels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .label-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .label-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .label-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .label-card-actions {
          display: flex;
          gap: 8px;
        }

        .label-card-description {
          margin-bottom: 12px;
          font-size: 14px;
          line-height: 1.5;
        }

        .label-card-stats {
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;
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
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 550px;
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

        .modal-header h3 {
          margin: 0;
        }

        .modal form {
          padding: 20px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 20px;
          border-top: 1px solid #e1e8ed;
        }

        .color-picker {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .color-input {
          width: 60px;
          height: 40px;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        }

        .color-hex {
          flex: 1;
          font-family: monospace;
        }

        .color-presets {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 8px;
          margin-top: 10px;
        }

        .color-preset {
          width: 100%;
          height: 32px;
          border: 2px solid transparent;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .color-preset:hover {
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .color-preset.active {
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .label-preview {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: #f5f7fa;
          border-radius: 4px;
        }

        .error {
          margin: 0 20px 15px 20px;
        }

        @media (max-width: 768px) {
          .labels-grid {
            grid-template-columns: 1fr;
          }

          .color-presets {
            grid-template-columns: repeat(5, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default LabelManager;
