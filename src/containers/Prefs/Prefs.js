import React from 'react';
import service from './../../services/service';
import muiThemeable from 'material-ui-02/styles/muiThemeable';

const styles = {
    container:{
        display:'flex',
        height: '100%'
    },
}

type PrefsProps = {
    muiTheme : any,
}

type PrefsState = {
}

class Prefs extends React.Component<PrefsProps, PrefsState>{

    history: any;

    constructor(props){
        super(props);
        this.state = {
        };
    }

    componentDidUpdate(preProps: PrefsProps){
    }

    componentWillMount(){
        service.registerListener(this);
    }

    componentDidMount(){
        console.log('PREFS MOUNTED');
    }

    componentWillUnmount(){
        service.unregisterListener(this);
    }

    render(){
        return (
            <div style={ styles.container }>
                Future Preferences Window
            </div>
        );
    }

}

export default muiThemeable()(Prefs);

