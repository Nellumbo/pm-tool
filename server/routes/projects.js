const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectsController');
const { checkRole } = require('../middleware/auth');
const { logAction } = require('../middleware/logger');

module.exports = (projects, tasks) => {
  // Получить все проекты
  router.get('/', checkRole(['admin', 'manager', 'developer']), (req, res) => {
    projectsController.getAllProjects(req, res, projects);
  });

  // Получить проект по ID
  router.get('/:id', checkRole(['admin', 'manager', 'developer']), (req, res) => {
    projectsController.getProjectById(req, res, projects);
  });

  // Создать новый проект
  router.post('/', checkRole(['admin', 'manager']), logAction('Создание проекта'), (req, res) => {
    projectsController.createProject(req, res, projects);
  });

  // Обновить проект
  router.put('/:id', checkRole(['admin', 'manager']), logAction('Обновление проекта'), (req, res) => {
    projectsController.updateProject(req, res, projects);
  });

  // Удалить проект
  router.delete('/:id', checkRole(['admin']), logAction('Удаление проекта'), (req, res) => {
    projectsController.deleteProject(req, res, projects, tasks);
  });

  return router;
};
