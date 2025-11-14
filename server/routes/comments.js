const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');

module.exports = (comments) => {
  // Обновить комментарий
  router.put('/:id', (req, res) => {
    tasksController.updateComment(req, res, comments);
  });

  // Удалить комментарий
  router.delete('/:id', (req, res) => {
    tasksController.deleteComment(req, res, comments);
  });

  return router;
};
