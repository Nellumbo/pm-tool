// Централизованный обработчик ошибок
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Логируем полную информацию об ошибке
  console.error('Error stack:', err.stack);
  console.error('Request path:', req.path);
  console.error('Request method:', req.method);
  console.error('Request body:', req.body);

  // Определяем статус код
  const statusCode = err.statusCode || err.status || 500;

  // Формируем ответ
  const response = {
    message: err.message || 'Внутренняя ошибка сервера',
    status: statusCode
  };

  // В режиме разработки добавляем stack trace
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = err;
  }

  res.status(statusCode).json(response);
};

// Обработчик для несуществующих роутов (404)
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Маршрут не найден: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Обработчик для неперехваченных ошибок Promise
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Обработчик для неперехваченных исключений
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // В production лучше gracefully shutdown
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

module.exports = {
  errorHandler,
  notFoundHandler
};
