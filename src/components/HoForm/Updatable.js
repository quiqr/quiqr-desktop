import * as React from 'react';

export class Updatable extends React.Component{

    shouldComponentUpdate(nextProps, nextState){
        return nextProps.update;
    }

    render(){
        return this.props.children;
    }
}
