const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.name || 'Error'}: ${err.message}`, { stack: err.stack });

  // Handle Joi Validation Errors
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: err.details[0].message
    });
  }

  // Handle Prisma Specific errors if needed
  if (err.code && err.code.startsWith('P')) {
    return res.status(500).json({
      success: false,
      message: 'Database operation failed.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Generic Error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
