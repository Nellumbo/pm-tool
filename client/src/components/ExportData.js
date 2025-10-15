import React, { useState } from 'react';
import { Download, FileText, Database, CheckCircle } from 'lucide-react';

const ExportData = ({ onClose }) => {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = async (type) => {
    setExporting(true);
    try {
      let url = '';
      let filename = '';
      
      switch (type) {
        case 'projects':
          url = '/api/export/projects';
          filename = `projects_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'tasks':
          url = '/api/export/tasks';
          filename = `tasks_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'all':
          url = '/api/export/all';
          filename = `all_data_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        default:
          return;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Ошибка экспорта');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      setExported(true);
      setTimeout(() => {
        setExported(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      alert('Ошибка при экспорте данных');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-overlay">
      <div className="export-modal">
        <div className="export-header">
          <h3>Экспорт данных</h3>
          <button 
            className="export-close"
            onClick={onClose}
            disabled={exporting}
          >
            ×
          </button>
        </div>

        <div className="export-content">
          {exported ? (
            <div className="export-success">
              <CheckCircle size={48} color="#28a745" />
              <h4>Экспорт завершен!</h4>
              <p>Файл успешно скачан</p>
            </div>
          ) : (
            <>
              <p className="export-description">
                Выберите тип данных для экспорта в CSV формате:
              </p>

              <div className="export-options">
                <div className="export-option" onClick={() => handleExport('projects')}>
                  <div className="export-option-icon">
                    <FileText size={24} color="#007bff" />
                  </div>
                  <div className="export-option-content">
                    <h4>Проекты</h4>
                    <p>Экспорт всех проектов с детальной информацией</p>
                    <div className="export-option-details">
                      • Название и описание проекта<br/>
                      • Статус и временные рамки<br/>
                      • Менеджер проекта<br/>
                      • Даты создания и обновления
                    </div>
                  </div>
                  <div className="export-option-action">
                    <button 
                      className="btn btn-primary"
                      disabled={exporting}
                    >
                      {exporting ? 'Экспорт...' : 'Экспорт'}
                    </button>
                  </div>
                </div>

                <div className="export-option" onClick={() => handleExport('tasks')}>
                  <div className="export-option-icon">
                    <CheckCircle size={24} color="#28a745" />
                  </div>
                  <div className="export-option-content">
                    <h4>Задачи</h4>
                    <p>Экспорт всех задач с полной информацией</p>
                    <div className="export-option-details">
                      • Название и описание задачи<br/>
                      • Приоритет и статус<br/>
                      • Проект и исполнитель<br/>
                      • Сроки выполнения
                    </div>
                  </div>
                  <div className="export-option-action">
                    <button 
                      className="btn btn-primary"
                      disabled={exporting}
                    >
                      {exporting ? 'Экспорт...' : 'Экспорт'}
                    </button>
                  </div>
                </div>

                <div className="export-option" onClick={() => handleExport('all')}>
                  <div className="export-option-icon">
                    <Database size={24} color="#6c757d" />
                  </div>
                  <div className="export-option-content">
                    <h4>Все данные</h4>
                    <p>Полный экспорт проектов и задач в одном файле</p>
                    <div className="export-option-details">
                      • Все проекты и задачи<br/>
                      • Полная информация о связях<br/>
                      • Удобно для анализа и резервного копирования
                    </div>
                  </div>
                  <div className="export-option-action">
                    <button 
                      className="btn btn-primary"
                      disabled={exporting}
                    >
                      {exporting ? 'Экспорт...' : 'Экспорт'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="export-info">
                <h4>Информация о экспорте:</h4>
                <ul>
                  <li>Данные экспортируются в формате CSV с кодировкой UTF-8</li>
                  <li>Файлы совместимы с Excel и Google Sheets</li>
                  <li>Русские символы отображаются корректно</li>
                  <li>Файлы автоматически именуются с текущей датой</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {!exported && (
          <div className="export-footer">
            <button 
              className="btn btn-secondary"
              onClick={onClose}
              disabled={exporting}
            >
              Отмена
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .export-overlay {
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
        
        .export-modal {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .export-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e1e8ed;
        }
        
        .export-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .export-close {
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
        
        .export-close:hover:not(:disabled) {
          background: #e9ecef;
          color: #495057;
        }
        
        .export-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .export-content {
          padding: 20px;
        }
        
        .export-description {
          margin: 0 0 20px 0;
          color: #6c757d;
          font-size: 14px;
        }
        
        .export-options {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .export-option {
          display: flex;
          align-items: flex-start;
          padding: 20px;
          border: 2px solid #e1e8ed;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .export-option:hover {
          border-color: #007bff;
          background-color: #f8f9fa;
        }
        
        .export-option-icon {
          margin-right: 15px;
          margin-top: 2px;
        }
        
        .export-option-content {
          flex: 1;
          margin-right: 15px;
        }
        
        .export-option-content h4 {
          margin: 0 0 5px 0;
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .export-option-content p {
          margin: 0 0 10px 0;
          color: #6c757d;
          font-size: 14px;
        }
        
        .export-option-details {
          font-size: 12px;
          color: #6c757d;
          line-height: 1.4;
        }
        
        .export-option-action {
          display: flex;
          align-items: center;
        }
        
        .export-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #007bff;
        }
        
        .export-info h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .export-info ul {
          margin: 0;
          padding-left: 20px;
          font-size: 13px;
          color: #6c757d;
          line-height: 1.5;
        }
        
        .export-info li {
          margin-bottom: 5px;
        }
        
        .export-success {
          text-align: center;
          padding: 40px 20px;
        }
        
        .export-success h4 {
          margin: 15px 0 10px 0;
          font-size: 18px;
          font-weight: 600;
          color: #28a745;
        }
        
        .export-success p {
          margin: 0;
          color: #6c757d;
          font-size: 14px;
        }
        
        .export-footer {
          padding: 20px;
          border-top: 1px solid #e1e8ed;
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
};

export default ExportData;
