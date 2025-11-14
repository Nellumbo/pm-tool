const moment = require('moment');

/**
 * Middleware для логирования действий
 */
const logAction = (action) => {
  return (req, res, next) => {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const userRole = req.user?.role || req.headers['x-user-role'] || 'developer';
    console.log(`[${timestamp}] ${userRole}: ${action} - ${req.method} ${req.path}`);
    next();
  };
};

module.exports = { logAction };
