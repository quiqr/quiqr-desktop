import React from 'react';
import Snackbar from 'material-ui/Snackbar';
import { consoleService, snackMessageService } from '../services/ui-service';
//import ConsoleIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right'

const consoleStyle ={
  pre: {
    position:'fixed',
    right:'0',
    padding:'10px 10px 100px 10px',
    overflow:'auto',
    margin:'0',
    width:'100%',
    lineHeight:'1.4',
    height:'calc(100% - 0px)',
    fontFamily:'monospace',
    fontWeight:'bold',
    background:'#1E1729',
    color:'#d4d4d4',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    zIndex:3
  }
}

class ConsoleOutput extends React.Component{
  constructor(props){
    super(props);
    this.closeTimeout = undefined;

  }
  componentWillMount(){
    consoleService.registerListener(this);
  }

  componentWillUnmount(){
    consoleService.unregisterListener(this);
  }

  handleMouseEnter(e){
    return;
   // if(this.closeTimeout) {
   //   clearTimeout(this.closeTimeout);
   //
   // if(consoleService.getConsoleIsHidden()){
   //    consoleService.toggleConsoleVisibility();
   //  }
  }

  handleMouseLeave(e){
    return;
    // if(this.closeTimeout)
    //   clearTimeout(this.closeTimeout);
    //
    //   this.closeTimeout = setTimeout(()=>{
    //     if(!consoleService.getConsoleIsHidden()){
    //       consoleService.toggleConsoleVisibility();
    //     }
    //   }, 10);
  }

  render(){

    let preStyle = Object.assign({}, consoleStyle.pre);

    if(this.preElement){
      this.preElement.scrollTop = 5000;
    }

    return <React.Fragment>
        <pre
          style={preStyle}
          ref={ (pre) => this.preElement = pre }
        >
        { consoleService.getConsoleMessages().map(({key, line}) => line).join('\n') }
      </pre>
    </React.Fragment>;
  }
}

class SnackbarManager extends React.Component{

  componentWillMount(){
    snackMessageService.registerListener(this);
  }

  componentWillUnmount(){
    snackMessageService.unregisterListener(this);
  }

  render(){
    let snackMessage = snackMessageService.getCurrentSnackMessage();
    let previousSnackMessage = snackMessageService.getPreviousSnackMessage();
    let snackbar = undefined;
    if(snackMessage){
      snackbar = <Snackbar
        key="snack-message"
        open={ true }
        action={ snackMessage.action }
        onActionClick={ snackMessage.onActionClick }
        message={ snackMessage.message }
        autoHideDuration={ snackMessage.autoHideDuration }
        onRequestClose={ function(){
          snackMessageService.reportSnackDismiss()
        }}
      />;
    }
    else{
      snackbar = <Snackbar
        key="snack-message"
        open={ false }
        action={ previousSnackMessage?previousSnackMessage.action:'' }
        message={ previousSnackMessage?previousSnackMessage.message:'' }
      />;
    }

    return <React.Fragment>
      {snackbar}
    </React.Fragment>;
  }
}

class Console extends React.Component{

  render(){
      return (<React.Fragment>
        <SnackbarManager />
        <ConsoleOutput />
      </React.Fragment>);
    }
  }

export default Console;
