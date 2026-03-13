import { AppError } from '../utils/error.js';

/**
 * Global Express error-handling middleware.
 *
 * Centralizes application error responses, ensuring consistent structure and logging.
 * Handles known custom, validation, and MySQL errors gracefully, while providing
 * meaningful feedback to clients and controlled error visibility in development mode.
 *
 * @function errorHandler
 * @param {Error} err - The error object thrown during route or middleware execution.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {void}
 *
 * @example
 * // Usage in Express app
 * import express from 'express';
 * import { errorHandler } from './middlewares/errorHandler.js';
 *
 * const app = express();
 * app.use('/api', routes);
 * app.use(errorHandler); // Always added last
 */
export function errorHandler(err, req, res, next) {
  // Log error details with timestamp and request context
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.error('Error:', err);

  /**
   * Handle custom application errors thrown using AppError.
   * Example: throw new AppError('Unauthorized access', 401);
   */
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: true,
      message: err.message,
    });
  }

  /**
   * Handle validation-related errors (e.g., from Joi or express-validator).
   */
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: true,
      message: 'Validation Error',
      details: err.message,
    });
  }

  /**
   * Handle MySQL connection-related errors.
   * Maps specific MySQL error codes to descriptive messages.
   */
  const mysqlConnectionErrors = {
    ECONNREFUSED: 'Database connection was refused',
    PROTOCOL_CONNECTION_LOST: 'Database connection was lost',
    ER_ACCESS_DENIED_ERROR: 'Database access denied',
    ER_BAD_DB_ERROR: 'Database not found',
  };

  if (mysqlConnectionErrors[err.code]) {
    return res.status(503).json({
      error: true,
      message: mysqlConnectionErrors[err.code],
    });
  }

  /**
   * Handle MySQL constraint violations such as duplicate or foreign key errors.
   */
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      error: true,
      message: 'Duplicate entry',
      details: err.sqlMessage,
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      error: true,
      message: 'Foreign key constraint fails',
      details: err.sqlMessage,
    });
  }

  /**
   * Default fallback for unhandled errors.
   * Returns a generic 500 error with optional detailed information in development mode.
   */
  res.status(500).json({
    error: true,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  });
}
