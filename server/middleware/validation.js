const { body, validationResult } = require('express-validator');

// Middleware для обработки ошибок валидации
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Ошибка валидации',
      errors: errors.array()
    });
  }
  next();
};

// Валидаторы для аутентификации
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Введите корректный email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен содержать минимум 6 символов'),
  handleValidationErrors
];

const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Имя должно содержать от 2 до 100 символов')
    .matches(/^[а-яА-ЯёЁa-zA-Z\s-]+$/)
    .withMessage('Имя может содержать только буквы, пробелы и дефисы'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Введите корректный email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен содержать минимум 6 символов'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'developer'])
    .withMessage('Некорректная роль пользователя'),
  handleValidationErrors
];

// Валидаторы для проектов
const projectValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Название проекта должно содержать от 3 до 200 символов')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Описание не должно превышать 1000 символов')
    .escape(),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Некорректная дата начала'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Некорректная дата окончания'),
  body('status')
    .optional()
    .isIn(['active', 'completed', 'paused'])
    .withMessage('Некорректный статус проекта'),
  body('managerId')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('ID менеджера не может быть пустым'),
  handleValidationErrors
];

// Валидаторы для задач
const taskValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Название задачи должно содержать от 3 до 200 символов')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Описание не должно превышать 2000 символов')
    .escape(),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Некорректный приоритет задачи'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed'])
    .withMessage('Некорректный статус задачи'),
  body('projectId')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('ID проекта не может быть пустым'),
  body('assigneeId')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('ID исполнителя не может быть пустым'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Некорректная дата выполнения'),
  handleValidationErrors
];

// Валидатор для обновления статуса задачи
const taskStatusValidation = [
  body('status')
    .isIn(['todo', 'in-progress', 'completed'])
    .withMessage('Некорректный статус задачи'),
  handleValidationErrors
];

// Валидаторы для комментариев
const commentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Комментарий должен содержать от 1 до 1000 символов')
    .escape(),
  body('authorId')
    .trim()
    .isLength({ min: 1 })
    .withMessage('ID автора не может быть пустым'),
  handleValidationErrors
];

// Валидаторы для пользователей
const userValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Имя должно содержать от 2 до 100 символов')
    .matches(/^[а-яА-ЯёЁa-zA-Z\s-]+$/)
    .withMessage('Имя может содержать только буквы, пробелы и дефисы'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Введите корректный email'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'developer'])
    .withMessage('Некорректная роль пользователя'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Название отдела не должно превышать 100 символов')
    .escape(),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Должность не должна превышать 100 символов')
    .escape(),
  handleValidationErrors
];

// Валидаторы для шаблонов
const templateValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Название шаблона должно содержать от 3 до 200 символов')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Описание не должно превышать 1000 символов')
    .escape(),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Некорректный приоритет'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Категория не должна превышать 50 символов')
    .escape(),
  body('estimatedHours')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Оценка времени должна быть числом от 0 до 1000'),
  handleValidationErrors
];

module.exports = {
  loginValidation,
  registerValidation,
  projectValidation,
  taskValidation,
  taskStatusValidation,
  commentValidation,
  userValidation,
  templateValidation,
  handleValidationErrors
};
