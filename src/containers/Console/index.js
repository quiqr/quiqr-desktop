import React from 'react';
import { consoleService } from '../../services/ui-service';

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

  componentDidMount(){
    consoleService.registerListener(this);
  }

  componentWillUnmount(){
    consoleService.unregisterListener(this);
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

class Console extends React.Component{

  render(){
      return (<React.Fragment>
        <ConsoleOutput />
      </React.Fragment>);
    }
  }

export default Console;
