import axios from "axios";
import { z } from 'zod'
import { apiSchemas, ApiResponse } from '../../types'

axios.defaults.timeout = 30000
axios.defaults.timeoutErrorMessage='timeout'

function validateApiResponse(method: string, response: any): any {

  // Check if we have a schema for this method
  const schema = apiSchemas[method as keyof typeof apiSchemas];

  // This means we need to create a new zod schema in types.ts
  if (!schema) {
    console.warn(`[API Validation] No schema found for method: ${method}`);
    return response;
  }

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

class MainProcessBridge{
  // Message handlers for push notifications (future WebSocket integration)
  private _messageHandlers: { [key: string]: any[] };

  constructor(){
    this._messageHandlers = {};
  }

  /**
   * Register a handler for push notifications from the backend.
   * Currently a no-op until WebSocket integration is implemented.
   * See NEXTSTEPS.md for the planned WebSocket push notification system.
   */
  addMessageHandler(type: string, handler: (data: any) => void){
    let handlers = this._messageHandlers[type];
    if(handlers === undefined){
      handlers = [];
      this._messageHandlers[type] = handlers;
    }
    handlers.push(handler);
  }

  removeMessageHandler(type: string, handler: (data: any) => void){
    const handlers = this._messageHandlers[type];
    if(handlers === undefined){
      return;
    }
    handlers.splice(handlers.indexOf(handler), 1);
  }

  /**
   * Dispatch a message to registered handlers.
   * This will be called by the future WebSocket client.
   */
  dispatchMessage(type: string, data: any) {
    const handlers = this._messageHandlers[type];
    if (handlers) {
      for (const handler of handlers) {
        handler(data);
      }
    }
  }

  request<M extends string>(method: M, data?: any, opts = {timeout:90000}): Promise<ApiResponse<M>> {
    const promise = new Promise<ApiResponse<M>>((resolve, reject)=>{
      axios
        .post("http://localhost:5150/api/"+method, {
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
}

export default new MainProcessBridge();
