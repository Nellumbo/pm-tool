const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

/**
 * Получить всех пользователей (без паролей)
 */
const getAllUsers = (req, res, users) => {
  const usersWithoutPasswords = users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  res.json(usersWithoutPasswords);
};

/**
 * Создать нового пользователя
 */
const createUser = (req, res, users) => {
  const { name, email, role = 'developer', department, position } = req.body;
  const newUser = {
    id: uuidv4(),
    name,
    email,
    role,
    department,
    position,
    createdAt: moment().format()
  };
  users.push(newUser);
  res.json(newUser);
};

/**
 * Обновить пользователя
 */
const updateUser = (req, res, users) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  const updatedUser = {
    ...users[userIndex],
    ...req.body,
    updatedAt: moment().format()
  };
  users[userIndex] = updatedUser;
  res.json(updatedUser);
};

/**
 * Удалить пользователя
 */
const deleteUser = (req, res, users) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  users.splice(userIndex, 1);
  res.json({ message: 'Пользователь удален' });
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};
