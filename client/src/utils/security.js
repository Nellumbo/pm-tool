/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize text to prevent XSS attacks
 * @param {string} text - Text to sanitize
 * @param {number} maxLength - Maximum allowed length (default: 200)
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (text, maxLength = 200) => {
  if (typeof text !== 'string') {
    return '';
  }

  // Remove any HTML tags and limit length
  const sanitized = text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove any remaining angle brackets
    .substring(0, maxLength)
    .trim();

  return sanitized;
};

/**
 * Sanitize and validate hex color
 * @param {string} color - Hex color to validate
 * @returns {string} - Valid hex color or default #000000
 */
export const sanitizeColor = (color) => {
  if (typeof color !== 'string') {
    return '#000000';
  }

  const hexPattern = /^#[0-9A-F]{6}$/i;
  if (!hexPattern.test(color)) {
    return '#000000';
  }

  return color;
};

/**
 * Validate theme value
 * @param {string} theme - Theme value to validate
 * @returns {string} - Valid theme ('light' or 'dark')
 */
export const validateTheme = (theme) => {
  if (theme === 'light' || theme === 'dark') {
    return theme;
  }
  return 'light';
};

/**
 * Sanitize label name (stricter validation)
 * @param {string} name - Label name
 * @returns {string} - Sanitized label name
 */
export const sanitizeLabelName = (name) => {
  return sanitizeText(name, 50);
};

/**
 * Sanitize label description
 * @param {string} description - Label description
 * @returns {string} - Sanitized description
 */
export const sanitizeLabelDescription = (description) => {
  return sanitizeText(description, 500);
};
