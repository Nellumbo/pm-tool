const rateLimit = require('express-rate-limit');

// Общий лимитер для всех API запросов
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // Максимум 100 запросов с одного IP
  message: {
    message: 'Слишком много запросов с этого IP, попробуйте позже',
    retryAfter: '15 минут'
  },
  standardHeaders: true, // Возвращает rate limit info в headers `RateLimit-*`
  legacyHeaders: false, // Отключает `X-RateLimit-*` headers
});

// Строгий лимитер для аутентификации (защита от brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // Максимум 5 попыток входа
  skipSuccessfulRequests: true, // Не считаем успешные запросы
  message: {
    message: 'Слишком много попыток входа, аккаунт временно заблокирован',
    retryAfter: '15 минут'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Лимитер для создания ресурсов (защита от спама)
const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 10, // Максимум 10 созданий в минуту
  message: {
    message: 'Слишком много операций создания, подождите немного',
    retryAfter: '1 минута'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Лимитер для экспорта данных
const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 20, // Максимум 20 экспортов в час
  message: {
    message: 'Слишком много операций экспорта, попробуйте позже',
    retryAfter: '1 час'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  createLimiter,
  exportLimiter
};
