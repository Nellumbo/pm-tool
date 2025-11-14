const express = require('express');
const router = express.Router();
const utilsController = require('../controllers/utilsController');

module.exports = (projects, tasks, users, templates) => {
  // Поиск
  router.get('/search', (req, res) => {
    utilsController.search(req, res, projects, tasks);
  });

  // Просроченные задачи
  router.get('/overdue-tasks', (req, res) => {
    utilsController.getOverdueTasks(req, res, tasks);
  });

  // Задачи на сегодня
  router.get('/today-tasks', (req, res) => {
    utilsController.getTodayTasks(req, res, tasks);
  });

  // Общая статистика
  router.get('/stats', (req, res) => {
    utilsController.getStats(req, res, projects, tasks, users);
  });

  // Экспорт проектов
  router.get('/export/projects', (req, res) => {
    utilsController.exportProjects(req, res, projects, users);
  });

  // Экспорт задач
  router.get('/export/tasks', (req, res) => {
    utilsController.exportTasks(req, res, projects, tasks, users);
  });

  // Экспорт всех данных
  router.get('/export/all', (req, res) => {
    utilsController.exportAll(req, res, projects, tasks, users);
  });

  // Шаблоны задач
  router.get('/templates', (req, res) => {
    utilsController.getTemplates(req, res, templates);
  });

  router.post('/templates', (req, res) => {
    utilsController.createTemplate(req, res, templates);
  });

  router.put('/templates/:id', (req, res) => {
    utilsController.updateTemplate(req, res, templates);
  });

  router.delete('/templates/:id', (req, res) => {
    utilsController.deleteTemplate(req, res, templates);
  });

  return router;
};
