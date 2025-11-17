const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { logAction } = require('../middleware/logger');

module.exports = (users) => {
  // Получить всех пользователей
  router.get('/', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    usersController.getAllUsers(req, res, users);
  });

  // Создать нового пользователя
  router.post('/', checkRole(['admin']), logAction('Создание пользователя'), (req, res) => {
    usersController.createUser(req, res, users);
  });

  // Обновить пользователя
  router.put('/:id', checkRole(['admin']), logAction('Обновление пользователя'), (req, res) => {
    usersController.updateUser(req, res, users);
  });

  // Удалить пользователя
  router.delete('/:id', checkRole(['admin']), logAction('Удаление пользователя'), (req, res) => {
    usersController.deleteUser(req, res, users);
  });

  return router;
};
