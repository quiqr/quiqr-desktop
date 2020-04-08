//import invariant from 'assert';
import { Route } from 'react-router-dom';
import React from 'react';
import service from './../../services/service';
//import { snackMessageService } from './../../services/ui-service';
//import FlatButton from 'material-ui/FlatButton';
////import RaisedButton from 'material-ui/RaisedButton';
////import Paper from 'material-ui/Paper';
//import {List, ListItem} from 'material-ui/List';
//import Subheader from 'material-ui/Subheader';
//import IconNavigationCheck from 'material-ui/svg-icons/navigation/check';
//import IconAdd from 'material-ui/svg-icons/content/add';
//import IconFileFolder from 'material-ui/svg-icons/file/folder';
////import {Accordion,AccordionItem} from './../../components/Accordion';
////import DangerButton from './../../components/DangerButton';
//import TextField from 'material-ui/TextField';
import muiThemeable from 'material-ui/styles/muiThemeable';
//import { Wrapper, InfoLine, InfoBlock, MessageBlock } from './components/shared';
//import { Workspaces } from './components/Workspaces';
//import CreateSiteDialog from './components/CreateSiteDialog';
//import PublishSiteDialog from './components/PublishSiteDialog';
//import BlockDialog from './components/BlockDialog';
//import Spinner from './../../components/Spinner';

//import type {  } from './../../types';

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

