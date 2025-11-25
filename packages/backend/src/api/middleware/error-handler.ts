/**
 * Error Handler Middleware
 *
 * Centralized error handling for API requests.
 */

import type { Request, Response, NextFunction } from 'express';

/**
 * Error response format
 */
export interface ErrorResponse {
  error: string;
  stack?: string;
}

/**
 * Wrap an async handler to catch errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('API Error:', error);

  const response: ErrorResponse = {
    error: error.message || 'Something went wrong.',
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(500).json(response);
}
