import axios from "axios";
import { z } from 'zod'
import { apiSchemas, ApiResponse, ApiMethod } from '../../types'

axios.defaults.timeout = 30000
axios.defaults.timeoutErrorMessage='timeout'

// Module-level state for message handlers (private to this module)
const messageHandlers: { [key: string]: Array<(data: unknown) => void> } = {};

interface RequestOptions {
  timeout: number
}

function validateApiResponse(method: ApiMethod, response: unknown): unknown {

  const schema = apiSchemas[method];

  try {
    const validated = schema.parse(response);
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`[API Validation] Schema validation failed for ${method}:`, error.errors);
      console.error('Response data:', JSON.stringify(response, null, 2));

      throw new Error(`API response validation failed for ${method}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Register a handler for push notifications from the backend.
 * Currently a no-op until WebSocket integration is implemented.
 * See NEXTSTEPS.md for the planned WebSocket push notification system.
 */
export function addMessageHandler(type: string, handler: (data: unknown) => void) {
  let handlers = messageHandlers[type];
  if (handlers === undefined) {
    handlers = [];
    messageHandlers[type] = handlers;
  }
  handlers.push(handler);
}

export function removeMessageHandler(type: string, handler: (data: unknown) => void) {
  const handlers = messageHandlers[type];
  if (handlers === undefined) {
    return;
  }
  handlers.splice(handlers.indexOf(handler), 1);
}

/**
 * Dispatch a message to registered handlers.
 * This will be called by the future WebSocket client.
 */
export function dispatchMessage(type: string, data: unknown) {
  const handlers = messageHandlers[type];
  if (handlers) {
    for (const handler of handlers) {
      handler(data);
    }
  }
}

export function request<M extends ApiMethod>(method: M, data?: unknown, opts: RequestOptions = {timeout:90000}): Promise<ApiResponse<M>> {

  const host = window.location.hostname;

  const promise = new Promise<ApiResponse<M>>((resolve, reject)=>{
    axios
      .post("http://"+host+":5150/api/"+method, {
        data: data,
      }, {
        timeout: opts.timeout
      })
      .then((response) => {
        // Validate response with Zod schema
        try {
          const validatedData = validateApiResponse(method, response.data);

          // this typecast is safe, because we just validated the data using zod
          resolve(validatedData as ApiResponse<M>);
        } catch (validationError) {
          // Validation failed - reject the promise
          reject(validationError);
        }
      })
      .catch((error) => {
        console.error("Error sending data:", error);
        reject(error);
      });
  });

  return promise;
}
