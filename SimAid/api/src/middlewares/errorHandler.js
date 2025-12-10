import { AppError } from '../utils/error.js';

export function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.error('Error:', err);

  // Handle custom AppError
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: true,
      message: err.message,
    });
  }

  // Handle validation errors (e.g., from Joi or custom logic)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: true,
      message: 'Validation Error',
      details: err.message,
    });
  }

  // Handle MySQL connection errors
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

  // Handle MySQL constraint violations
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

  // Default fallback
  res.status(500).json({
    error: true,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  });
}
