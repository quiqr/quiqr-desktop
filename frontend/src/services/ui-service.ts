import {BaseService} from './base-service';
import mainProcessBridge from '../utils/main-process-bridge';

type SnackSeverity = 'success' | 'warning'


type SnackArgs = {
    severity: SnackSeverity; 
    action?: any, onActionClick?: unknown; 
    autoHideDuration?: number
}

type SnackQueueItem = { message: string } & SnackArgs;
class SnackMessageService extends BaseService {

    _snackMessageQueue: SnackQueueItem[]
    _currentSnackMessage: SnackQueueItem | undefined;
    _previousSnackMessage: SnackQueueItem | undefined;

    constructor(){

        super();
        this._snackMessageQueue = [];
        this._currentSnackMessage = undefined;
        this._previousSnackMessage = undefined;
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

    addSnackMessage(message: string, { severity, action, onActionClick, autoHideDuration = 3000 }: SnackArgs ){
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

    getCurrentSnackMessage(){
        return this._currentSnackMessage;
    }

    getPreviousSnackMessage(){
        return this._previousSnackMessage;
    }
}


class ConsoleService extends BaseService {

    _consoleIsHiddden: boolean
    _consoleTimeout: any
    _consoleMessages: { id: number, line: string }[]
    _consoleBuffer: { id: number, line: string }[]
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

    getConsoleMessages(){
        return this._consoleMessages;
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
