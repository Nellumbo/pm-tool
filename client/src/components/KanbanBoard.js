import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { useDrag } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { CheckSquare, Clock, Circle, User, Calendar, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Компонент карточки задачи
const TaskCard = ({ task, onEdit, onDelete }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

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

  return (
    <div
      ref={drag}
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div className="task-card-header">
        <h4>{task.title}</h4>
        <div className="task-card-actions">
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => onEdit(task)}
            title="Редактировать"
          >
            <Edit size={12} />
          </button>
          <button 
            className="btn btn-sm btn-danger"
            onClick={() => onDelete(task.id)}
            title="Удалить"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      
      <div className="task-meta">
        <div className="task-priority">
          <span className={`badge ${getPriorityClass(task.priority)}`}>
            {getPriorityText(task.priority)}
          </span>
        </div>
        
        {task.assigneeId && (
          <div className="task-assignee">
            <User size={12} />
            <span>Исполнитель</span>
          </div>
        )}
        
        {task.dueDate && (
          <div className="task-due-date">
            <Calendar size={12} />
            <span>{format(new Date(task.dueDate), 'dd.MM', { locale: ru })}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Компонент колонки Kanban
const KanbanColumn = ({ status, title, icon: Icon, tasks, onTaskMove, onEdit, onDelete }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'task',
    drop: (item) => {
      if (item.status !== status) {
        onTaskMove(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const getStatusTasks = () => {
    return tasks.filter(task => task.status === status);
  };

  const isOverClass = isOver && canDrop ? 'drag-over' : '';
  const canDropClass = canDrop ? 'can-drop' : '';

  return (
    <div 
      ref={drop} 
      className={`kanban-column ${isOverClass} ${canDropClass}`}
    >
      <div className="column-header">
        <div className="column-title">
          <Icon size={16} />
          <span>{title}</span>
          <span className="task-count">({getStatusTasks().length})</span>
        </div>
      </div>
      
      <div className="column-content">
        {getStatusTasks().map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        
        {getStatusTasks().length === 0 && (
          <div className="empty-column">
            <p>Нет задач</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Основной компонент Kanban доски
const KanbanBoard = ({ tasks, onTaskMove, onEdit, onDelete }) => {
  const columns = [
    {
      id: 'todo',
      title: 'К выполнению',
      icon: Circle,
      color: '#6c757d'
    },
    {
      id: 'in-progress',
      title: 'В работе',
      icon: Clock,
      color: '#007bff'
    },
    {
      id: 'completed',
      title: 'Завершено',
      icon: CheckSquare,
      color: '#28a745'
    }
  ];

  return (
    <div className="kanban-board">
      <div className="kanban-columns">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            status={column.id}
            title={column.title}
            icon={column.icon}
            tasks={tasks}
            onTaskMove={onTaskMove}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

// Обертка с DndProvider
const KanbanBoardWrapper = (props) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <KanbanBoard {...props} />
      <style jsx>{`
        .kanban-board {
          padding: 20px;
          background: #f8f9fa;
          min-height: 70vh;
        }
        
        .kanban-columns {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          height: 100%;
        }
        
        .kanban-column {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          min-height: 500px;
          transition: all 0.2s ease;
        }
        
        .kanban-column.can-drop {
          border: 2px dashed #007bff;
        }
        
        .kanban-column.drag-over {
          background: #e3f2fd;
          border-color: #1976d2;
        }
        
        .column-header {
          padding: 15px 20px;
          border-bottom: 1px solid #e1e8ed;
          background: #f8f9fa;
          border-radius: 8px 8px 0 0;
        }
        
        .column-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .task-count {
          background: #e9ecef;
          color: #6c757d;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          margin-left: auto;
        }
        
        .column-content {
          padding: 15px;
          min-height: 400px;
        }
        
        .task-card {
          background: white;
          border: 1px solid #e1e8ed;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 10px;
          cursor: move;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .task-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transform: translateY(-1px);
        }
        
        .task-card.dragging {
          opacity: 0.5;
          transform: rotate(5deg);
        }
        
        .task-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        
        .task-card-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #2c3e50;
          line-height: 1.3;
          flex: 1;
          margin-right: 8px;
        }
        
        .task-card-actions {
          display: flex;
          gap: 4px;
        }
        
        .task-description {
          margin: 0 0 10px 0;
          font-size: 12px;
          color: #6c757d;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .task-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .task-priority .badge {
          font-size: 10px;
          padding: 2px 6px;
        }
        
        .task-assignee,
        .task-due-date {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #6c757d;
        }
        
        .empty-column {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
        }
        
        .empty-column p {
          margin: 0;
          font-style: italic;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .kanban-columns {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .kanban-board {
            padding: 10px;
          }
          
          .column-content {
            padding: 10px;
          }
        }
      `}</style>
    </DndProvider>
  );
};

export default KanbanBoardWrapper;
