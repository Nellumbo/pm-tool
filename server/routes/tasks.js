const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');

module.exports = (tasks, comments) => {
  // Получить все задачи
  router.get('/', (req, res) => {
    tasksController.getAllTasks(req, res, tasks);
  });

  // Получить задачу по ID
  router.get('/:id', (req, res) => {
    tasksController.getTaskById(req, res, tasks);
  });

  // Создать новую задачу
  router.post('/', (req, res) => {
    tasksController.createTask(req, res, tasks);
  });

  // Обновить задачу
  router.put('/:id', (req, res) => {
    tasksController.updateTask(req, res, tasks);
  });

  // Обновить статус задачи (для Kanban)
  router.patch('/:id/status', (req, res) => {
    tasksController.updateTaskStatus(req, res, tasks);
  });

  // Удалить задачу
  router.delete('/:id', (req, res) => {
    tasksController.deleteTask(req, res, tasks);
  });

  // Получить комментарии задачи
  router.get('/:taskId/comments', (req, res) => {
    tasksController.getTaskComments(req, res, comments);
  });

  // Добавить комментарий к задаче
  router.post('/:taskId/comments', (req, res) => {
    tasksController.createTaskComment(req, res, comments);
  });

  return router;
};
