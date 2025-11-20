import {BaseService} from './base-service';
import mainProcessBridge from '../utils/main-process-bridge';
import { SnackMessage, ConsoleMessage, uiServiceSchemas } from '../../types';

class SnackMessageService extends BaseService<typeof uiServiceSchemas> {

    _snackMessageQueue: SnackMessage[]
    _currentSnackMessage: SnackMessage | undefined;
    _previousSnackMessage: SnackMessage | undefined;

    constructor(){

        super();
        this._snackMessageQueue = [];
        this._currentSnackMessage = undefined;
        this._previousSnackMessage = undefined;
    }

    protected _getSchemas() {
        return uiServiceSchemas;
    }

    _tryAssingCurrentSnack(){
        if(this._currentSnackMessage!==undefined) //well have to wait until someone clear the _currentSnackMessage
            return false;

        let snackMessage = this._snackMessageQueue.shift();
        if(snackMessage){
            this._currentSnackMessage = snackMessage;
            return true;
        }
        return false;
    }

    addSnackMessage(message: string, { severity, action, onActionClick, autoHideDuration = 3000 }: Omit<SnackMessage, 'message'> ){
        this._snackMessageQueue.push({message, severity, action, onActionClick, autoHideDuration});
        if(this._tryAssingCurrentSnack())
            this._notifyChanges();
    }

    reportSnackDismiss(){
        this._previousSnackMessage = this._currentSnackMessage;
        this._currentSnackMessage = undefined;
        this._tryAssingCurrentSnack();
        this._notifyChanges();
    }

    getCurrentSnackMessage(): SnackMessage | undefined {
        // Validate the response - type is automatically inferred!
        return this._validateResponse('getCurrentSnackMessage', this._currentSnackMessage);
    }

    getPreviousSnackMessage(): SnackMessage | undefined {
        // Validate the response - type is automatically inferred!
        return this._validateResponse('getPreviousSnackMessage', this._previousSnackMessage);
    }
}


class ConsoleService extends BaseService<typeof uiServiceSchemas> {

    _consoleIsHiddden: boolean
    _consoleTimeout: any
    _consoleMessages: ConsoleMessage[]
    _consoleBuffer: ConsoleMessage[]
    consoleMessageLastId: number

    constructor(){
        super();
        this._consoleIsHiddden = true;
        this._consoleMessages = [
            { id:-2, line: 'This is the application output console. Here you can learn about what is happening behind the scenes.' },
            { id:-1, line: '' }
        ];
        this._consoleBuffer = [];
        this._consoleTimeout = undefined;
        this.consoleMessageLastId = 0;

        //PORTQUIQR
        mainProcessBridge.addMessageHandler('console', this._onConsole.bind(this));
    }

    protected _getSchemas() {
        return uiServiceSchemas;
    }

    _onConsole({line}){

        // This removes console escape codes.
        // eslint-disable-next-line
        line = line.replace(/\u001b[^m]*?m/g,"")

        this._consoleBuffer.push({id:this.consoleMessageLastId++, line});
        if(this._consoleTimeout)
            clearTimeout(this._consoleTimeout);

        this._consoleTimeout = setTimeout(()=>{
            let max = 100;
            this._consoleMessages = this._consoleMessages.concat(this._consoleBuffer);
            this._consoleBuffer = [];
            if(this._consoleMessages.length>max){
                this._consoleMessages = this._consoleMessages.slice(this._consoleMessages.length-max,max);
            }
            this._notifyChanges();
        }, 50);
    }

    getConsoleMessages(): ConsoleMessage[] {
        // Validate the response - type is automatically inferred!
        return this._validateResponse('getConsoleMessages', this._consoleMessages);
    }

    /*
    getConsoleIsHidden(){
        return this._consoleIsHiddden;
    }

    toggleConsoleVisibility(){
        this._consoleIsHiddden = !this._consoleIsHiddden;
        this._notifyChanges();
    }
    */
}

let consoleService = new ConsoleService();
let snackMessageService = new SnackMessageService();

export {
    consoleService,
    snackMessageService
};
