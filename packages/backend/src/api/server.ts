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

  // We need to raise this limit because we import theme screenshots and bundle files.
  // The files are base64 encoded and can get quite large (base64 adds ~33% overhead).
  // For a local Electron app, 100mb is a reasonable limit.
  app.use(express.json({ limit: '100mb' }));

  /**
   * Create handler registry
   * The handlers are platform specific and implemented in adapters
   *
   * For example: the electron adapter defines handlers to open a file in an editor
   * The standalone adapter does not, and just console.log a no-op.
   */
  const apiHandlers = createApiHandlers(container);

  // this does not work well when express also serves frontend
  /*
  app.get("/", (req, res) => {
    res.send("Hello from Quiqr API Server!");
  });
  */

  // API route - handles all POST /api/:method requests
  app.post(
    '/api/:method',
    asyncHandler(async (req: Request, res: Response) => {
      const { method } = req.params;
      const { data } = req.body;

      if (typeof method !== 'string') {
        res.status(400).json({ error: 'Invalid parameters' });
        return;
      }

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

  // SSE route for SSG binary download progress streaming
  app.get(
    '/api/ssg/download/:ssgType/:version',
    async (req: Request, res: Response) => {
      const { ssgType, version } = req.params;

      if (typeof ssgType !== 'string' || typeof version !== 'string') {
        res.status(400).json({ error: 'Invalid parameters' });
        return;
      }

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Track if connection was closed by client
      let connectionClosed = false;

      try {
        // Get the provider's binary manager
        const provider = await container.providerFactory.getProvider(ssgType);
        const binaryManager = provider.getBinaryManager();

        if (!binaryManager) {
          res.write(`data: ${JSON.stringify({ percent: 0, message: `${ssgType} does not require binary downloads`, complete: false, error: 'No binary manager available' })}\n\n`);
          res.end();
          return;
        }

        // Handle client disconnect - cancel the download and clean up
        req.on('close', () => {
          connectionClosed = true;
          // Cancel the download if client disconnects (e.g., user closes dialog)
          binaryManager.cancel();
        });

        // Stream progress updates from the async generator
        // the for..of syntax is basically a nice way to do something like
        // const generator = container.hugoDownloader.download(version);
        // generator.next(); (repeat untill the SSE stream closes)
        for await (const progress of binaryManager.download(version)) {
          // Stop if client disconnected
          if (connectionClosed) {
            break;
          }

          // the data: prefix is required
          // the \n\n is the way the browser knows it's the end of the message
          res.write(`data: ${JSON.stringify(progress)}\n\n`);

          // End stream on completion or error
          if (progress.complete || progress.error) {
            break;
          }
        }
      } catch (error) {
        if (!connectionClosed) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          res.write(`data: ${JSON.stringify({ percent: 0, message: errorMessage, complete: false, error: errorMessage })}\n\n`);
        }
      }

      if (!connectionClosed) {
        res.end();
      }
    }
  );

  // Backward compatibility: redirect old Hugo endpoint to new SSG endpoint
  app.get('/api/hugo/download/:version', (req: Request, res: Response) => {
    const { version } = req.params;
    res.redirect(307, `/api/ssg/download/hugo/${version}`);
  });

  // SSE route for model change events (workspace config invalidation)
  app.get(
    '/api/workspace/:siteKey/:workspaceKey/model-events',
    (req: Request, res: Response) => {
      const { siteKey, workspaceKey } = req.params;

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      let connectionClosed = false;

      // Subscribe to model change events for this workspace
      const unsubscribe = container.modelChangeEventBroadcaster.subscribe((event) => {
        if (!connectionClosed && event.siteKey === siteKey && event.workspaceKey === workspaceKey) {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        }
      });

      // Handle client disconnect
      req.on('close', () => {
        connectionClosed = true;
        unsubscribe();
      });

      // Send initial connection confirmation
      res.write(`data: ${JSON.stringify({ type: 'connected', siteKey, workspaceKey })}\n\n`);
    }
  );


  // SSE route for sync publish progress streaming
  app.post(
    '/api/sync/publish/stream',
    async (req: Request, res: Response) => {
      const { siteKey, publishConf } = req.body;

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      try {
        // Create progress callback that writes to SSE stream
        const progressCallback = (message: string, progress: number) => {
          res.write(`data: ${JSON.stringify({ message, progress, complete: false })}\n\n`);
        };

        // Get publisher with progress callback
        const action = publishConf.type === 'folder' ? 'pushToRemote' : 'pushWithSoftMerge';
        const publisher = container.syncFactory.getPublisher(publishConf, siteKey, "main", progressCallback);

        // Execute sync operation
        const result = await publisher.actionDispatcher(action);

        // Send completion
        res.write(`data: ${JSON.stringify({ message: 'Sync complete', progress: 100, complete: true, result })}\n\n`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.write(`data: ${JSON.stringify({ message: errorMessage, progress: 0, complete: false, error: errorMessage })}\n\n`);
      }

      res.end();
    }
  );

  // SSE route for sync merge/pull progress streaming
  app.post(
    '/api/sync/merge/stream',
    async (req: Request, res: Response) => {
      const { siteKey, publishConf } = req.body;

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      try {
        // Create progress callback that writes to SSE stream
        const progressCallback = (message: string, progress: number) => {
          res.write(`data: ${JSON.stringify({ message, progress, complete: false })}\n\n`);
        };

        // Get publisher with progress callback
        const publisher = container.syncFactory.getPublisher(publishConf, siteKey, "main", progressCallback);

        // Execute sync operation
        const result = await publisher.actionDispatcher('pullFromRemote');

        // Send completion
        res.write(`data: ${JSON.stringify({ message: 'Merge complete', progress: 100, complete: true, result })}\n\n`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.write(`data: ${JSON.stringify({ message: errorMessage, progress: 0, complete: false, error: errorMessage })}\n\n`);
      }

      res.end();
    }
  );

  // SSE route for generic sync action progress streaming
  app.post(
    '/api/sync/action/stream',
    async (req: Request, res: Response) => {
      const { siteKey, publishConf, action, actionParameters } = req.body;

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      try {
        // Create progress callback that writes to SSE stream
        const progressCallback = (message: string, progress: number) => {
          res.write(`data: ${JSON.stringify({ message, progress, complete: false })}\n\n`);
        };

        // Get publisher with progress callback
        const publisher = container.syncFactory.getPublisher(publishConf, siteKey, "main", progressCallback);

        // Execute sync operation
        const result = await publisher.actionDispatcher(action, actionParameters);

        // Send completion
        res.write(`data: ${JSON.stringify({ message: 'Action complete', progress: 100, complete: true, result })}\n\n`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.write(`data: ${JSON.stringify({ message: errorMessage, progress: 0, complete: false, error: errorMessage })}\n\n`);
      }

      res.end();
    }
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
    container.logger.info('backend-server', 'API Server started', {
      port,
      url: `http://localhost:${port}`
    });
    console.log(`API Server running on http://localhost:${port}`);
  });
}
