const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

module.exports = (users) => {
  // Логин
  router.post('/login', (req, res) => authController.login(req, res, users));

  // Регистрация
  router.post('/register', (req, res) => authController.register(req, res, users));

  // Проверка токена
  router.post('/verify', authenticateToken, authController.verify);

  return router;
};
