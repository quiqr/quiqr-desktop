/**
 * Express Server Factory
 *
 * Creates an Express app with all API routes and middleware.
 * Uses dependency injection via AppContainer.
 */

import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import type { AppContainer } from '../config/container.js';
import { createApiHandlers, getHandler } from './router.js';
import { errorHandler, asyncHandler } from './middleware/error-handler.js';

/**
 * Server configuration options
 */
export interface ServerOptions {
  /**
   * Port to listen on (default: 5150)
   */
  port?: number;

  /**
   * Enable CORS (default: true)
   */
  cors?: boolean;
}

/**
 * Create an Express server with all API routes
 */
export function createServer(
  container: AppContainer,
  options: ServerOptions = {}
): Express {
  const app = express();
  const { cors: enableCors = true } = options;

  // Middleware
  if (enableCors) {
    app.use(cors());
  }

  // We need to raise this limit because we import theme screenshots.
  // The screenshots are base64 encoded images and can get quite large. 
  app.use(express.json({ limit: '5mb' }));

  /**
   * Create handler registry
   * The handlers are platform specific and implemented in adapters
   * 
   * For example: the electron adapter defines handlers to open a file in an editor
   * The standalone adapter does not, and just console.log a no-op.
   */
  const apiHandlers = createApiHandlers(container);

  // API route - handles all POST /api/:method requests
  app.post(
    '/api/:method',
    asyncHandler(async (req: Request, res: Response) => {
      const { method } = req.params;
      const { data } = req.body;

      // Get the handler for this method
      const handler = getHandler(apiHandlers, method);

      if (!handler) {
        res.status(404).json({
          error: `API method '${method}' not found`,
        });
        return;
      }

      // Execute handler
      const result = await handler(data);
      res.json(result);
    })
  );

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Start the server on the specified port
 */
export function startServer(
  container: AppContainer,
  options: ServerOptions = {}
): void {
  const { port = 5150 } = options;

  const app = createServer(container, options);

  app.listen(port, () => {
    console.log(`API Server running on http://localhost:${port}`);
  });
}
