import React from 'react';
import { consoleService } from '../../services/ui-service';

const consoleStyle ={
  pre: {
    position:'fixed' as const,
    right:'0',
    padding:'10px 10px 100px 10px',
    overflow:'auto' as const,
    margin:'0',
    width:'100%',
    lineHeight:'1.4',
    height:'calc(100% - 0px)',
    fontFamily:'monospace',
    fontWeight:'bold' as const,
    background:'#1E1729',
    color:'#d4d4d4',
    whiteSpace: 'pre-wrap' as const,
    wordWrap: 'break-word' as const,
    zIndex:3
  }
}

type ConsoleOutputState = {
  autoscroll: boolean;
};

class ConsoleOutput extends React.Component<{}, ConsoleOutputState>{
  closeTimeout: any;
  preElement: HTMLPreElement | null = null;
  scrollRef: React.RefObject<HTMLDivElement>;

  constructor(props: {}){
    super(props);
    this.closeTimeout = undefined;
    this.scrollRef = React.createRef();
    this.state = {
      autoscroll: true
    }
  }

  componentDidMount(){
    consoleService.registerListener(this);
  }

  componentWillUnmount(){
    consoleService.unregisterListener(this);
  }

  componentDidUpdate(preProps: {}){
    if (this.scrollRef.current) {
      this.scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  render(){

    let preStyle = Object.assign({}, consoleStyle.pre);

    if(this.preElement){
      //this.preElement.scrollTop = 5000;
    }

    return <React.Fragment>
      <pre
        style={preStyle}
        ref={ (pre) => { this.preElement = pre; } }
      >
        { consoleService.getConsoleMessages().map((msg) => msg.line).join('\n') }
        <div ref={this.scrollRef} />
      </pre>
    </React.Fragment>;
  }
}

class Console extends React.Component<{}, {}>{

  render(){
    return (<React.Fragment>
      <ConsoleOutput />
    </React.Fragment>);
  }
}

export default Console;
