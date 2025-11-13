/**
 * Frontend Validation Utilities
 *
 * Client-side validation helpers to improve UX and reduce server load
 */

import { VALIDATION } from '../constants';

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email обязателен' };
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0) {
    return { valid: false, error: 'Email не может быть пустым' };
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: 'Неверный формат email' };
  }

  return { valid: true, value: trimmedEmail };
};

/**
 * Validate password
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Пароль обязателен' };
  }

  if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: `Пароль должен содержать минимум ${VALIDATION.MIN_PASSWORD_LENGTH} символов`
    };
  }

  if (password.length > 72) {
    return { valid: false, error: 'Пароль слишком длинный (максимум 72 символа)' };
  }

  return { valid: true, value: password };
};

/**
 * Validate required text field
 */
export const validateRequired = (value, fieldName = 'Поле') => {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: `${fieldName} обязательно для заполнения` };
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return { valid: false, error: `${fieldName} не может быть пустым` };
  }

  return { valid: true, value: trimmedValue };
};

/**
 * Validate text length
 */
export const validateLength = (value, minLength, maxLength, fieldName = 'Поле') => {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: `${fieldName} обязательно для заполнения` };
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length < minLength) {
    return {
      valid: false,
      error: `${fieldName} должно содержать минимум ${minLength} символов`
    };
  }

  if (trimmedValue.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} должно содержать максимум ${maxLength} символов`
    };
  }

  return { valid: true, value: trimmedValue };
};

/**
 * Validate date
 */
export const validateDate = (dateString, fieldName = 'Дата') => {
  if (!dateString) {
    return { valid: true, value: null }; // Optional field
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return { valid: false, error: `${fieldName} имеет неверный формат` };
  }

  return { valid: true, value: dateString };
};

/**
 * Validate date range (endDate must be after startDate)
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { valid: true }; // Optional fields
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Неверный формат даты' };
  }

  if (end < start) {
    return { valid: false, error: 'Дата окончания должна быть после даты начала' };
  }

  return { valid: true };
};

/**
 * Validate task form
 */
export const validateTaskForm = (formData) => {
  const errors = {};

  // Title validation
  const titleValidation = validateLength(formData.title, 2, VALIDATION.MAX_TITLE_LENGTH, 'Название');
  if (!titleValidation.valid) {
    errors.title = titleValidation.error;
  }

  // Description validation (optional, but if provided must be valid)
  if (formData.description && formData.description.trim().length > VALIDATION.MAX_TEXT_LENGTH) {
    errors.description = `Описание должно содержать максимум ${VALIDATION.MAX_TEXT_LENGTH} символов`;
  }

  // Due date validation
  const dueDateValidation = validateDate(formData.dueDate, 'Срок выполнения');
  if (!dueDateValidation.valid) {
    errors.dueDate = dueDateValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate project form
 */
export const validateProjectForm = (formData) => {
  const errors = {};

  // Name validation
  const nameValidation = validateLength(formData.name, 2, VALIDATION.MAX_TITLE_LENGTH, 'Название');
  if (!nameValidation.valid) {
    errors.name = nameValidation.error;
  }

  // Description validation (optional)
  if (formData.description && formData.description.trim().length > VALIDATION.MAX_TEXT_LENGTH) {
    errors.description = `Описание должно содержать максимум ${VALIDATION.MAX_TEXT_LENGTH} символов`;
  }

  // Date range validation
  const dateRangeValidation = validateDateRange(formData.startDate, formData.endDate);
  if (!dateRangeValidation.valid) {
    errors.dateRange = dateRangeValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate user form
 */
export const validateUserForm = (formData, isEdit = false) => {
  const errors = {};

  // Name validation
  const nameValidation = validateLength(formData.name, 2, 100, 'Имя');
  if (!nameValidation.valid) {
    errors.name = nameValidation.error;
  }

  // Email validation
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
  }

  // Password validation (required for new users, optional for edits)
  if (!isEdit || formData.password) {
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitize input (basic XSS prevention)
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export default {
  validateEmail,
  validatePassword,
  validateRequired,
  validateLength,
  validateDate,
  validateDateRange,
  validateTaskForm,
  validateProjectForm,
  validateUserForm,
  sanitizeInput
};
