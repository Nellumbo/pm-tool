const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key-change-in-production';

/**
 * Middleware для проверки JWT токена
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Токен доступа отсутствует' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

/**
 * Middleware для проверки ролей
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Если используется JWT аутентификация
    if (req.user) {
      if (allowedRoles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({ message: 'Недостаточно прав для выполнения операции' });
      }
    } else {
      // Fallback для демонстрации (заголовок)
      const userRole = req.headers['x-user-role'] || 'developer';
      if (allowedRoles.includes(userRole)) {
        req.userRole = userRole;
        next();
      } else {
        res.status(403).json({ message: 'Недостаточно прав для выполнения операции' });
      }
    }
  };
};

module.exports = {
  authenticateToken,
  checkRole,
  JWT_SECRET
};
