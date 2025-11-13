import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Code, Bug, TestTube, Book, Users } from 'lucide-react';

const TaskTemplates = ({ onClose, onSelectTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    category: 'development'
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Ошибка загрузки шаблонов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingTemplate ? `/api/templates/${editingTemplate.id}` : '/api/templates';
      const method = editingTemplate ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchTemplates();
        setShowCreateModal(false);
        setEditingTemplate(null);
        setFormData({
          name: '',
          description: '',
          priority: 'medium',
          category: 'development'
        });
      }
    } catch (error) {
      console.error('Ошибка сохранения шаблона:', error);
    }
  };

  const handleDelete = async (templateId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот шаблон?')) {
      try {
        const response = await fetch(`/api/templates/${templateId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          await fetchTemplates();
        }
      } catch (error) {
        console.error('Ошибка удаления шаблона:', error);
      }
    }
  };

  const handleSelectTemplate = (template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
    onClose();
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      priority: template.priority,
      category: template.category
    });
    setShowCreateModal(true);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'development': Code,
      'bugfix': Bug,
      'testing': TestTube,
      'documentation': Book,
      'meeting': Users
    };
    const Icon = icons[category] || FileText;
    return <Icon size={20} />;
  };

  const getCategoryName = (category) => {
    const names = {
      'development': 'Разработка',
      'bugfix': 'Исправления',
      'testing': 'Тестирование',
      'documentation': 'Документация',
      'meeting': 'Встречи'
    };
    return names[category] || category;
  };

  const getPriorityClass = (priority) => {
    const priorityMap = {
      'high': 'priority-high',
      'medium': 'priority-medium',
      'low': 'priority-low'
    };
    return priorityMap[priority] || '';
  };

  const getPriorityText = (priority) => {
    const priorityMap = {
      'high': 'Высокий',
      'medium': 'Средний',
      'low': 'Низкий'
    };
    return priorityMap[priority] || priority;
  };

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <div className="templates-overlay">
      <div className="templates-modal">
        <div className="templates-header">
          <h3>Шаблоны задач</h3>
          <div className="templates-header-actions">
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} />
              Создать шаблон
            </button>
            <button 
              className="templates-close"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        <div className="templates-content">
          {loading ? (
            <div className="templates-loading">
              <div className="loading-spinner"></div>
              <span>Загрузка шаблонов...</span>
            </div>
          ) : templates.length === 0 ? (
            <div className="templates-empty">
              <FileText size={48} color="#6c757d" />
              <h4>Нет шаблонов</h4>
              <p>Создайте первый шаблон для быстрого создания задач</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                Создать шаблон
              </button>
            </div>
          ) : (
            <div className="templates-grid">
              {categories.map(category => (
                <div key={category} className="template-category">
                  <div className="template-category-header">
                    {getCategoryIcon(category)}
                    <h4>{getCategoryName(category)}</h4>
                    <span className="template-count">
                      ({templates.filter(t => t.category === category).length})
                    </span>
                  </div>
                  
                  <div className="template-list">
                    {templates
                      .filter(t => t.category === category)
                      .map(template => (
                        <div key={template.id} className="template-item">
                          <div className="template-item-content">
                            <h5>{template.name}</h5>
                            <p className="template-description">{template.description}</p>
                            <div className="template-meta">
                              <span className={`badge ${getPriorityClass(template.priority)}`}>
                                {getPriorityText(template.priority)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="template-item-actions">
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleSelectTemplate(template)}
                              title="Использовать шаблон"
                            >
                              Использовать
                            </button>
                            <div className="template-item-controls">
                              <button 
                                className="btn btn-sm btn-secondary"
                                onClick={() => openEditModal(template)}
                                title="Редактировать"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(template.id)}
                                title="Удалить"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>{editingTemplate ? 'Редактировать шаблон' : 'Создать шаблон'}</h3>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTemplate(null);
                  }}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Название шаблона</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Описание</label>
                  <textarea
                    className="form-control textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                  />
                </div>
                
                <div className="grid grid-2">
                  <div className="form-group">
                    <label>Приоритет</label>
                    <select
                      className="form-control"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    >
                      <option value="low">Низкий</option>
                      <option value="medium">Средний</option>
                      <option value="high">Высокий</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Категория</label>
                    <select
                      className="form-control"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="development">Разработка</option>
                      <option value="bugfix">Исправления</option>
                      <option value="testing">Тестирование</option>
                      <option value="documentation">Документация</option>
                      <option value="meeting">Встречи</option>
                    </select>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingTemplate(null);
                    }}
                  >
                    Отмена
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingTemplate ? 'Сохранить' : 'Создать'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .templates-overlay {
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
        
        .templates-modal {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .templates-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e1e8ed;
        }
        
        .templates-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .templates-header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        
        .templates-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #6c757d;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .templates-close:hover {
          background: #e9ecef;
          color: #495057;
        }
        
        .templates-content {
          padding: 20px;
          max-height: 60vh;
          overflow-y: auto;
        }
        
        .templates-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #6c757d;
        }
        
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e1e8ed;
          border-top: 2px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 10px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .templates-empty {
          text-align: center;
          padding: 40px;
          color: #6c757d;
        }
        
        .templates-empty h4 {
          margin: 15px 0 10px 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .templates-empty p {
          margin: 0 0 20px 0;
          font-size: 14px;
        }
        
        .templates-grid {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }
        
        .template-category {
          border: 1px solid #e1e8ed;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .template-category-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #e1e8ed;
        }
        
        .template-category-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .template-count {
          margin-left: auto;
          font-size: 12px;
          color: #6c757d;
          background: #e9ecef;
          padding: 2px 8px;
          border-radius: 12px;
        }
        
        .template-list {
          padding: 15px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }
        
        .template-item {
          border: 1px solid #e1e8ed;
          border-radius: 6px;
          padding: 15px;
          transition: all 0.2s ease;
        }
        
        .template-item:hover {
          border-color: #007bff;
          box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
        }
        
        .template-item-content h5 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .template-description {
          margin: 0 0 10px 0;
          font-size: 12px;
          color: #6c757d;
          line-height: 1.4;
        }
        
        .template-meta {
          margin-bottom: 15px;
        }
        
        .template-item-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .template-item-controls {
          display: flex;
          gap: 5px;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
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
      `}</style>
    </div>
  );
};

export default TaskTemplates;
