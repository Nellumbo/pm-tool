/**
 * EXAMPLE: Integration of Label Components with Tasks
 *
 * This file demonstrates how to integrate the label components
 * into the existing Tasks component.
 */

import React, { useState, useEffect } from 'react';
import LabelManager from './LabelManager';
import LabelPicker from './LabelPicker';
import LabelBadge from './LabelBadge';
import useApi from '../hooks/useApi';

// ====================
// Example 1: Using LabelBadge in Task List
// ====================
const TaskListWithLabels = () => {
  const { get } = useApi();
  const [tasks, setTasks] = useState([]);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [tasksData, labelsData] = await Promise.all([
      get('/api/tasks'),
      get('/api/labels')
    ]);
    setTasks(tasksData);
    setLabels(labelsData);
  };

  const getTaskLabels = (taskLabelIds) => {
    return labels.filter(label => taskLabelIds.includes(label.id));
  };

  return (
    <div className="task-list">
      {tasks.map(task => (
        <div key={task.id} className="card task-card">
          <h3>{task.title}</h3>
          <p>{task.description}</p>

          {/* Display task labels */}
          {task.labelIds && task.labelIds.length > 0 && (
            <div className="task-labels" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {getTaskLabels(task.labelIds).map(label => (
                <LabelBadge
                  key={label.id}
                  label={label}
                  size="small"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ====================
// Example 2: Using LabelPicker in Task Form
// ====================
const TaskFormWithLabels = ({ task = null, onSave }) => {
  const { get, post, put } = useApi();
  const [labels, setLabels] = useState([]);
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    labelIds: task?.labelIds || [],
    // ... other fields
  });

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    const labelsData = await get('/api/labels');
    setLabels(labelsData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (task) {
      await put(`/api/tasks/${task.id}`, formData);
    } else {
      await post('/api/tasks', formData);
    }

    onSave();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Название задачи</label>
        <input
          type="text"
          className="form-control"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>Описание</label>
        <textarea
          className="form-control textarea"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>

      {/* Label Picker */}
      <div className="form-group">
        <label>Метки</label>
        <LabelPicker
          labels={labels}
          selectedLabels={formData.labelIds}
          onChange={(newLabelIds) => setFormData({...formData, labelIds: newLabelIds})}
          placeholder="Выберите метки задачи"
        />
      </div>

      <button type="submit" className="btn btn-primary">
        {task ? 'Обновить' : 'Создать'} задачу
      </button>
    </form>
  );
};

// ====================
// Example 3: Using LabelBadge with Remove functionality
// ====================
const TaskDetailWithRemovableLabels = ({ task }) => {
  const { get, put } = useApi();
  const [labels, setLabels] = useState([]);
  const [taskLabels, setTaskLabels] = useState(task.labelIds || []);

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    const labelsData = await get('/api/labels');
    setLabels(labelsData);
  };

  const handleRemoveLabel = async (labelId) => {
    const newLabelIds = taskLabels.filter(id => id !== labelId);
    setTaskLabels(newLabelIds);

    // Update task on server
    await put(`/api/tasks/${task.id}`, {
      ...task,
      labelIds: newLabelIds
    });
  };

  const getLabel = (labelId) => {
    return labels.find(label => label.id === labelId);
  };

  return (
    <div className="task-detail">
      <h2>{task.title}</h2>
      <p>{task.description}</p>

      <div className="task-labels-section">
        <h4>Метки:</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {taskLabels.map(labelId => {
            const label = getLabel(labelId);
            return label ? (
              <LabelBadge
                key={labelId}
                label={label}
                size="medium"
                removable={true}
                onRemove={handleRemoveLabel}
              />
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
};

// ====================
// Example 4: Standalone Label Management Page
// ====================
const LabelsPage = () => {
  return (
    <div className="container">
      <LabelManager />
    </div>
  );
};

// ====================
// Example 5: Filter Tasks by Labels
// ====================
const TasksWithLabelFilter = () => {
  const { get } = useApi();
  const [tasks, setTasks] = useState([]);
  const [labels, setLabels] = useState([]);
  const [selectedLabelFilter, setSelectedLabelFilter] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [tasksData, labelsData] = await Promise.all([
      get('/api/tasks'),
      get('/api/labels')
    ]);
    setTasks(tasksData);
    setLabels(labelsData);
  };

  const filteredTasks = tasks.filter(task => {
    if (selectedLabelFilter.length === 0) return true;

    // Show tasks that have at least one of the selected labels
    return task.labelIds?.some(labelId => selectedLabelFilter.includes(labelId));
  });

  const getTaskLabels = (taskLabelIds) => {
    return labels.filter(label => taskLabelIds?.includes(label.id));
  };

  return (
    <div className="container">
      <h2>Задачи</h2>

      {/* Label Filter */}
      <div className="card mb-3">
        <div className="form-group">
          <label>Фильтр по меткам</label>
          <LabelPicker
            labels={labels}
            selectedLabels={selectedLabelFilter}
            onChange={setSelectedLabelFilter}
            placeholder="Фильтровать по меткам"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="task-list">
        {filteredTasks.map(task => (
          <div key={task.id} className="card">
            <h3>{task.title}</h3>
            <p>{task.description}</p>

            {task.labelIds && task.labelIds.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                {getTaskLabels(task.labelIds).map(label => (
                  <LabelBadge
                    key={label.id}
                    label={label}
                    size="small"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ====================
// Example 6: Quick Label Creation in Task Form
// ====================
const TaskFormWithQuickLabelCreate = () => {
  const { get, post } = useApi();
  const [labels, setLabels] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickLabelName, setQuickLabelName] = useState('');
  const [quickLabelColor, setQuickLabelColor] = useState('#007bff');

  const fetchLabels = async () => {
    const labelsData = await get('/api/labels');
    setLabels(labelsData);
  };

  const handleQuickCreate = async (e) => {
    e.preventDefault();

    const newLabel = await post('/api/labels', {
      name: quickLabelName,
      color: quickLabelColor
    });

    setLabels([...labels, newLabel]);
    setSelectedLabels([...selectedLabels, newLabel.id]);
    setQuickLabelName('');
    setShowQuickCreate(false);
  };

  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label>Метки</label>
        <button
          type="button"
          className="btn btn-sm btn-secondary"
          onClick={() => setShowQuickCreate(!showQuickCreate)}
        >
          + Быстрое создание
        </button>
      </div>

      {showQuickCreate && (
        <div className="card mb-2" style={{ padding: '10px' }}>
          <form onSubmit={handleQuickCreate} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Название метки"
              value={quickLabelName}
              onChange={(e) => setQuickLabelName(e.target.value)}
              style={{ flex: 1 }}
              required
            />
            <input
              type="color"
              value={quickLabelColor}
              onChange={(e) => setQuickLabelColor(e.target.value)}
              style={{ width: '50px' }}
            />
            <button type="submit" className="btn btn-sm btn-primary">
              Создать
            </button>
          </form>
        </div>
      )}

      <LabelPicker
        labels={labels}
        selectedLabels={selectedLabels}
        onChange={setSelectedLabels}
      />
    </div>
  );
};

export {
  TaskListWithLabels,
  TaskFormWithLabels,
  TaskDetailWithRemovableLabels,
  LabelsPage,
  TasksWithLabelFilter,
  TaskFormWithQuickLabelCreate
};
