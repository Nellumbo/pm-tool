const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

/**
 * Получить все задачи (с фильтрацией по проекту)
 */
const getAllTasks = (req, res, tasks) => {
  const { projectId } = req.query;
  let filteredTasks = tasks;

  if (projectId) {
    filteredTasks = tasks.filter(task => task.projectId === projectId);
  }

  res.json(filteredTasks);
};

/**
 * Получить задачу по ID
 */
const getTaskById = (req, res, tasks) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Задача не найдена' });
  }
  res.json(task);
};

/**
 * Создать новую задачу
 */
const createTask = (req, res, tasks) => {
  const { title, description, priority = 'medium', status = 'todo', projectId, assigneeId, dueDate, parentTaskId } = req.body;
  const newTask = {
    id: uuidv4(),
    title,
    description,
    priority,
    status,
    projectId,
    assigneeId,
    dueDate,
    parentTaskId,
    createdAt: moment().format(),
    updatedAt: moment().format()
  };
  tasks.push(newTask);
  res.json(newTask);
};

/**
 * Обновить задачу
 */
const updateTask = (req, res, tasks) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Задача не найдена' });
  }

  const updatedTask = {
    ...tasks[taskIndex],
    ...req.body,
    updatedAt: moment().format()
  };
  tasks[taskIndex] = updatedTask;
  res.json(updatedTask);
};

/**
 * Обновить статус задачи (для Kanban)
 */
const updateTaskStatus = (req, res, tasks) => {
  const { status } = req.body;
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);

  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Задача не найдена' });
  }

  if (!['todo', 'in-progress', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Неверный статус' });
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    status,
    updatedAt: moment().format()
  };

  res.json(tasks[taskIndex]);
};

/**
 * Удалить задачу
 */
const deleteTask = (req, res, tasks) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Задача не найдена' });
  }

  // Удаляем все подзадачи
  const filteredTasks = tasks.filter(task => task.parentTaskId !== req.params.id);
  tasks.length = 0;
  tasks.push(...filteredTasks);

  tasks.splice(taskIndex, 1);
  res.json({ message: 'Задача удалена' });
};

/**
 * Получить комментарии к задаче
 */
const getTaskComments = (req, res, comments) => {
  const taskComments = comments.filter(c => c.taskId === req.params.taskId);
  res.json(taskComments);
};

/**
 * Добавить комментарий к задаче
 */
const createTaskComment = (req, res, comments) => {
  const { content } = req.body;
  const newComment = {
    id: uuidv4(),
    taskId: req.params.taskId,
    content,
    authorId: req.user?.id || req.headers['x-user-id'] || '1',
    createdAt: moment().format(),
    updatedAt: moment().format()
  };
  comments.push(newComment);
  res.json(newComment);
};

/**
 * Обновить комментарий
 */
const updateComment = (req, res, comments) => {
  const commentIndex = comments.findIndex(c => c.id === req.params.id);
  if (commentIndex === -1) {
    return res.status(404).json({ message: 'Комментарий не найден' });
  }

  const updatedComment = {
    ...comments[commentIndex],
    content: req.body.content,
    updatedAt: moment().format()
  };
  comments[commentIndex] = updatedComment;
  res.json(updatedComment);
};

/**
 * Удалить комментарий
 */
const deleteComment = (req, res, comments) => {
  const commentIndex = comments.findIndex(c => c.id === req.params.id);
  if (commentIndex === -1) {
    return res.status(404).json({ message: 'Комментарий не найден' });
  }

  comments.splice(commentIndex, 1);
  res.json({ message: 'Комментарий удален' });
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskComments,
  createTaskComment,
  updateComment,
  deleteComment
};
