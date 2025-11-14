const jwt = require('jsonwebtoken');

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Токен доступа отсутствует' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Middleware для проверки ролей
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Проверяем наличие аутентифицированного пользователя
    if (!req.user) {
      return res.status(401).json({ message: 'Требуется аутентификация' });
    }

    // Проверяем роль пользователя
    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Недостаточно прав для выполнения операции' });
    }
  };
};

// Middleware для логирования действий
const logAction = (action) => {
  return (req, res, next) => {
    const moment = require('moment');
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const userName = req.user ? `${req.user.name} (${req.user.role})` : 'Неавторизован';
    console.log(`[${timestamp}] ${userName}: ${action} - ${req.method} ${req.path}`);
    next();
  };
};

module.exports = {
  authenticateToken,
  checkRole,
  logAction
};
