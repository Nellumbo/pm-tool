import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Edit, Trash2, User } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const TaskComments = ({ taskId, users }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        credentials: 'include'
      });
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          authorId: users[0]?.id || '1' // Используем первого пользователя как автора
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments(prev => [...prev, comment]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent
        }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(prev => 
          prev.map(comment => 
            comment.id === commentId ? updatedComment : comment
          )
        );
        setEditingComment(null);
        setEditContent('');
      }
    } catch (error) {
      console.error('Ошибка редактирования комментария:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      }
    } catch (error) {
      console.error('Ошибка удаления комментария:', error);
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Неизвестный пользователь';
  };

  const startEdit = (comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  if (loading) {
    return (
      <div className="comments-loading">
        <div className="loading-spinner"></div>
        <span>Загрузка комментариев...</span>
      </div>
    );
  }

  return (
    <div className="task-comments">
      <div className="comments-header">
        <MessageCircle size={20} />
        <h3>Комментарии ({comments.length})</h3>
      </div>

      {/* Форма добавления комментария */}
      <form onSubmit={handleAddComment} className="comment-form">
        <div className="comment-input-container">
          <textarea
            className="comment-input"
            placeholder="Добавить комментарий..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows="3"
          />
          <button 
            type="submit" 
            className="btn btn-primary btn-sm"
            disabled={!newComment.trim()}
          >
            <Send size={16} />
            Отправить
          </button>
        </div>
      </form>

      {/* Список комментариев */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="comments-empty">
            <MessageCircle size={48} color="#6c757d" />
            <p>Пока нет комментариев</p>
            <span>Добавьте первый комментарий к задаче</span>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-author">
                  <div className="author-avatar">
                    <User size={16} />
                  </div>
                  <div className="author-info">
                    <span className="author-name">{getUserName(comment.authorId)}</span>
                    <span className="comment-date">
                      {format(new Date(comment.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                      {comment.updatedAt !== comment.createdAt && (
                        <span className="edited"> (изменено)</span>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="comment-actions">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => startEdit(comment)}
                    title="Редактировать"
                  >
                    <Edit size={12} />
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteComment(comment.id)}
                    title="Удалить"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              
              <div className="comment-content">
                {editingComment === comment.id ? (
                  <div className="comment-edit-form">
                    <textarea
                      className="comment-edit-input"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows="3"
                    />
                    <div className="comment-edit-actions">
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEditComment(comment.id)}
                      >
                        Сохранить
                      </button>
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={cancelEdit}
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <p>{comment.content}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .task-comments {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .comments-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e1e8ed;
        }
        
        .comments-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .comment-form {
          margin-bottom: 20px;
        }
        
        .comment-input-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .comment-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #e1e8ed;
          border-radius: 6px;
          font-size: 14px;
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
        }
        
        .comment-input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
        }
        
        .comments-list {
          max-height: 400px;
          overflow-y: auto;
        }
        
        .comments-empty {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
        }
        
        .comments-empty p {
          margin: 10px 0 5px 0;
          font-weight: 600;
        }
        
        .comments-empty span {
          font-size: 12px;
        }
        
        .comment-item {
          padding: 15px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .comment-item:last-child {
          border-bottom: none;
        }
        
        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        
        .comment-author {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .author-avatar {
          width: 32px;
          height: 32px;
          background: #007bff;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .author-info {
          display: flex;
          flex-direction: column;
        }
        
        .author-name {
          font-weight: 600;
          font-size: 14px;
          color: #2c3e50;
        }
        
        .comment-date {
          font-size: 12px;
          color: #6c757d;
        }
        
        .edited {
          font-style: italic;
        }
        
        .comment-actions {
          display: flex;
          gap: 5px;
        }
        
        .comment-content {
          margin-left: 42px;
        }
        
        .comment-content p {
          margin: 0;
          line-height: 1.5;
          color: #2c3e50;
        }
        
        .comment-edit-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .comment-edit-input {
          width: 100%;
          padding: 8px;
          border: 1px solid #e1e8ed;
          border-radius: 4px;
          font-size: 14px;
          resize: vertical;
          font-family: inherit;
        }
        
        .comment-edit-actions {
          display: flex;
          gap: 8px;
        }
        
        .comments-loading {
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
        
        /* Responsive */
        @media (max-width: 768px) {
          .comment-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .comment-content {
            margin-left: 0;
          }
          
          .comment-author {
            align-self: flex-start;
          }
          
          .comment-actions {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskComments;
