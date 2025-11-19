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
  private _messageHandlers: { [key: string]: any[] };
  private ipcRenderer: any;
  public pendingCallbacks: any[];

  constructor(){
    this._messageHandlers = {};
    this.ipcRenderer = null;
    this.pendingCallbacks = [];
  }
  constructor_old(){

    this._messageHandlers = {};
    this.ipcRenderer = window.require('electron').ipcRenderer;
    this.pendingCallbacks = [];

    this.ipcRenderer.on('messageAsyncResponse', (event, arg) => {

      const { token, response } = arg;
      let callback = this._getCallback(token);
      if(callback){
        callback(response);
      }
    });

    this.ipcRenderer.on('message', (sender, message) => {
      if(message.type){
        let handlers = this._messageHandlers[message.type];
        if(handlers){
          for(let i = 0; i < handlers.length; i++){
            handlers[i](message.data);
          }
        }
      }
      else{
        console.log('Received message without a type.');
      }
    });
  }

  addMessageHandler(type /* : string */, handler/* : MessageHandler */){
    let handlers = this._messageHandlers[type];
    if(handlers===undefined){
      handlers = [];
      this._messageHandlers[type] = handlers;
    }
    handlers.push(handler);
  }

  removeMessageHandler(type /* : string */, handler/* : MessageHandler */){
    let handlers = this._messageHandlers[type];
    if(handlers===undefined){
      return;
    }
    handlers.splice(handlers.indexOf(handler),1);
  }

  _createToken() /*: string */ {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  _getCallback(token /* : string */) /*: ?MessageHandler */ {
    for(let i = 0; i < this.pendingCallbacks.length;i ++){
      let callback = this.pendingCallbacks[i];
      if(callback.token===token)
        return callback.handler;
    }
    return undefined;
  }

  _eraseCallback(token /* : string */){
    for(let i = 0; i < this.pendingCallbacks.length;i ++){
      let callback = this.pendingCallbacks[i];
      if(callback.token===token){
        this.pendingCallbacks.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  _emptyFunction(){

  }

  request<M extends string>(method: M, data?: any, opts = {timeout:90000}): Promise<ApiResponse<M>> {
    //console.log(method);
    let promise = new Promise<ApiResponse<M>>((resolve, reject)=>{
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

        //this.ipcRenderer.send('message', {data, token, handler:method});
        //resolve({data:1});

    });

    return promise;
  }

  requestOLD( method, data, opts = {timeout:10000}
  ){
    let _reject;
    let token = this._createToken();
    let promise = new Promise(function(resolve, reject){
      _reject = reject;
      this.ipcRenderer.send('message', {data, token, handler:method});
      let timeoutId = setTimeout(function(){
        if(this._eraseCallback(token)){
          reject('timeout:'+method);
        }
      }.bind(this), opts.timeout);
      this.pendingCallbacks.push({
        token,
        handler: function(response){
          clearTimeout(timeoutId);
          if(response && response.error){
            reject(response.error);
          }
          resolve(response);
        }
      });
    }.bind(this));

    return promise;
  }

  requestVoid(method /* : string */, data /* : any */){
    this.ipcRenderer.send('message', {data, handler:method});
  }
}

export default new MainProcessBridge();
