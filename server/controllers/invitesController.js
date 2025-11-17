const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

/**
 * Генерирует случайный инвайт-код
 */
const generateInviteCode = (role) => {
  const prefix = role.toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${prefix}-${random}-${timestamp}`;
};

/**
 * Получить все инвайты (только для админов и менеджеров)
 */
const getAllInvites = (req, res, invites, users) => {
  const invitesWithCreators = invites.map(invite => {
    const creator = users.find(u => u.id === invite.createdBy);
    const usedByUser = invite.usedBy ? users.find(u => u.id === invite.usedBy) : null;

    return {
      ...invite,
      creatorName: creator ? creator.name : 'Unknown',
      usedByName: usedByUser ? usedByUser.name : null
    };
  });

  res.json(invitesWithCreators);
};

/**
 * Создать новый инвайт-код
 */
const createInvite = (req, res, invites) => {
  const { role, expiresInDays = 30 } = req.body;
  const userId = req.user?.id || req.headers['x-user-id'];

  // Валидация роли
  if (!['admin', 'manager', 'developer'].includes(role)) {
    return res.status(400).json({ message: 'Недопустимая роль' });
  }

  // Проверка: только админы могут создавать инвайты для админов
  if (role === 'admin' && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Только администраторы могут создавать инвайты для админов' });
  }

  const newInvite = {
    id: uuidv4(),
    code: generateInviteCode(role),
    role,
    createdBy: userId,
    createdAt: moment().format(),
    expiresAt: moment().add(expiresInDays, 'days').format(),
    usedBy: null,
    usedAt: null,
    isActive: true
  };

  invites.push(newInvite);
  res.status(201).json(newInvite);
};

/**
 * Валидировать инвайт-код
 */
const validateInvite = (req, res, invites) => {
  const { code } = req.params;

  const invite = invites.find(i => i.code === code);

  if (!invite) {
    return res.status(404).json({
      valid: false,
      message: 'Инвайт-код не найден'
    });
  }

  // Проверка: уже использован
  if (!invite.isActive || invite.usedBy) {
    return res.status(400).json({
      valid: false,
      message: 'Этот инвайт-код уже использован'
    });
  }

  // Проверка: истек срок
  if (moment().isAfter(moment(invite.expiresAt))) {
    return res.status(400).json({
      valid: false,
      message: 'Срок действия инвайт-кода истек'
    });
  }

  res.json({
    valid: true,
    role: invite.role,
    expiresAt: invite.expiresAt
  });
};

/**
 * Деактивировать инвайт-код
 */
const deactivateInvite = (req, res, invites) => {
  const { id } = req.params;

  const inviteIndex = invites.findIndex(i => i.id === id);

  if (inviteIndex === -1) {
    return res.status(404).json({ message: 'Инвайт не найден' });
  }

  invites[inviteIndex].isActive = false;
  res.json({ message: 'Инвайт-код деактивирован', invite: invites[inviteIndex] });
};

/**
 * Удалить инвайт-код
 */
const deleteInvite = (req, res, invites) => {
  const { id } = req.params;

  const inviteIndex = invites.findIndex(i => i.id === id);

  if (inviteIndex === -1) {
    return res.status(404).json({ message: 'Инвайт не найден' });
  }

  // Нельзя удалить использованный инвайт (для истории)
  if (invites[inviteIndex].usedBy) {
    return res.status(400).json({ message: 'Нельзя удалить использованный инвайт-код' });
  }

  invites.splice(inviteIndex, 1);
  res.json({ message: 'Инвайт-код удален' });
};

module.exports = {
  getAllInvites,
  createInvite,
  validateInvite,
  deactivateInvite,
  deleteInvite,
  generateInviteCode
};
