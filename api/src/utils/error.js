/**
 * Custom application error class for consistent error handling.
 *
 * Extends the native `Error` object to include an HTTP status code,
 * allowing services and controllers to throw meaningful errors that
 * can be handled uniformly by middleware (e.g., `errorHandler`).
 *
 * @class AppError
 * @extends Error
 * @example
 * throw new AppError("User not found", 404);
 */
export class AppError extends Error {
  /**
   * Creates a new AppError instance.
   * @param {string} message - Error message to describe what went wrong.
   * @param {number} [status=400] - HTTP status code (default: 400 Bad Request).
   */
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
