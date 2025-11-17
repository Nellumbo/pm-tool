const express = require('express');
const router = express.Router();
const invitesController = require('../controllers/invitesController');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { logAction } = require('../middleware/logger');

module.exports = (invites, users) => {
  // Получить все инвайты (только админы и менеджеры)
  router.get(
    '/',
    authenticateToken,
    checkRole(['admin', 'manager']),
    (req, res) => {
      invitesController.getAllInvites(req, res, invites, users);
    }
  );

  // Создать новый инвайт (админы и менеджеры)
  router.post(
    '/',
    authenticateToken,
    checkRole(['admin', 'manager']),
    logAction('Создание инвайт-кода'),
    (req, res) => {
      invitesController.createInvite(req, res, invites);
    }
  );

  // Валидировать инвайт-код (публичный endpoint)
  router.get('/validate/:code', (req, res) => {
    invitesController.validateInvite(req, res, invites);
  });

  // Деактивировать инвайт (только админы)
  router.patch(
    '/:id/deactivate',
    authenticateToken,
    checkRole(['admin']),
    logAction('Деактивация инвайт-кода'),
    (req, res) => {
      invitesController.deactivateInvite(req, res, invites);
    }
  );

  // Удалить инвайт (только админы)
  router.delete(
    '/:id',
    authenticateToken,
    checkRole(['admin']),
    logAction('Удаление инвайт-кода'),
    (req, res) => {
      invitesController.deleteInvite(req, res, invites);
    }
  );

  return router;
};
