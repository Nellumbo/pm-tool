const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * Логин пользователя
 */
const login = async (req, res, users) => {
  try {
    const { email, password } = req.body;

    // Находим пользователя
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Проверяем пароль
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Создаем JWT токен
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Возвращаем пользователя без пароля
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

/**
 * Регистрация нового пользователя (требуется инвайт-код)
 */
const register = async (req, res, users, invites) => {
  try {
    const { name, email, password, inviteCode, department, position } = req.body;
    const moment = require('moment');

    // ОБЯЗАТЕЛЬНАЯ проверка инвайт-кода
    if (!inviteCode) {
      return res.status(400).json({
        message: 'Для регистрации требуется инвайт-код. Обратитесь к администратору.'
      });
    }

    // Находим инвайт-код
    const invite = invites.find(i => i.code === inviteCode);

    if (!invite) {
      return res.status(404).json({
        message: 'Инвайт-код не найден. Проверьте правильность кода.'
      });
    }

    // Проверка: инвайт уже использован
    if (!invite.isActive || invite.usedBy) {
      return res.status(400).json({
        message: 'Этот инвайт-код уже использован'
      });
    }

    // Проверка: истек срок действия
    if (moment().isAfter(moment(invite.expiresAt))) {
      return res.status(400).json({
        message: 'Срок действия инвайт-кода истек'
      });
    }

    // Проверяем, существует ли пользователь
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем нового пользователя с ролью из инвайта
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role: invite.role, // ← РОЛЬ БЕРЕТСЯ ИЗ ИНВАЙТА!
      department: department || '',
      position: position || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);

    // Помечаем инвайт как использованный
    invite.usedBy = newUser.id;
    invite.usedAt = new Date().toISOString();
    invite.isActive = false;

    // Создаем JWT токен
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Возвращаем пользователя без пароля
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

/**
 * Проверка токена
 */
const verify = (req, res) => {
  res.json({ user: req.user });
};

module.exports = {
  login,
  register,
  verify
};
