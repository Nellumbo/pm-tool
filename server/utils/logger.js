const winston = require('winston');
const path = require('path');

// Определяем формат логов
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Формат для консоли (более читаемый)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Создаем директорию для логов, если её нет
const logsDir = path.join(__dirname, '../logs');
const fs = require('fs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Создаем транспорты (куда писать логи)
const transports = [
  // Логи всех уровней в файл
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),

  // Только ошибки в отдельный файл
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
];

// В режиме разработки добавляем вывод в консоль
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat
    })
  );
}

// Создаем logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exitOnError: false
});

// Создаем stream для Morgan (HTTP logger)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Вспомогательные методы
logger.logRequest = (req, message = 'Request received') => {
  const user = req.user ? `${req.user.name} (${req.user.role})` : 'Anonymous';
  logger.info(message, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    user,
    body: req.method !== 'GET' ? req.body : undefined
  });
};

logger.logError = (error, req = null) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    code: error.code || error.statusCode
  };

  if (req) {
    errorInfo.method = req.method;
    errorInfo.path = req.path;
    errorInfo.ip = req.ip;
    errorInfo.user = req.user ? `${req.user.name} (${req.user.role})` : 'Anonymous';
  }

  logger.error('Application error', errorInfo);
};

logger.logAuth = (success, email, ip, reason = null) => {
  const message = success ? 'Authentication successful' : 'Authentication failed';
  logger.info(message, {
    email,
    ip,
    success,
    reason: reason || undefined
  });
};

logger.logDbOperation = (operation, table, success, details = {}) => {
  logger.debug(`Database ${operation}`, {
    table,
    success,
    ...details
  });
};

module.exports = logger;
