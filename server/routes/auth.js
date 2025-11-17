const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

module.exports = (users, invites) => {
  // Логин
  router.post('/login', (req, res) => authController.login(req, res, users));

  // Регистрация (требуется инвайт-код)
  router.post('/register', (req, res) => authController.register(req, res, users, invites));

  // Проверка токена
  router.post('/verify', authenticateToken, authController.verify);

  return router;
};
