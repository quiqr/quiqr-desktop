import * as React from 'react';
import { Dialog, FlatButton, MenuItem, SelectField, TextField } from 'material-ui';
import type { SiteConfig, WorkspaceHeader, WorkspaceConfig } from './../../../types';
import { Accordion, AccordionItem } from './../../../components/Accordion';
import IconNavigationCheck from 'material-ui/svg-icons/navigation/check';

export default class PublishSiteDialog extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            username: "",
            email: ""
         }
    }

    handleCancelClick = () => {
        this.props.onCancelClick();
    }

    handleRegisterClick = () => {
        this.props.onRegisterClick({
            username: this.state.username,
            email: this.state.email
        });
    }

    handleUserNameChange(e){
        this.setState({
            username: e.target.value,
        });
    }
    handleEmailChange(e){
        this.setState({
            email: e.target.value,
        });
    }

    validate(){
        return this.state.build!==''&&this.state.publish!=='';
    }

    render(){
        let { open } = this.props;
        let valid = this.validate();

        const actions = [
            <FlatButton
                label="Cancel"
                primary={false}
                onClick={this.handleCancelClick.bind(this)}
            />,
            <FlatButton
                disabled={!valid}
                label="Sign up"
                primary={true}
                onClick={this.handleRegisterClick}
            />,
        ];

        let active=true;

        return (
            <Dialog
                title="Sign up for free website publishing with PoppyGo Live"
                open={open}
                actions={actions}>
                <div>
                    <TextField floatingLabelText={'username'} value={this.state.username} onChange={(e)=>{this.handleUserNameChange(e)}} fullWidth />
                    <TextField floatingLabelText={'email address'} value={this.state.email} onChange={(e)=>{this.handleEmailChange(e)}} fullWidth />
                </div>
            </Dialog>
        );
    }

}
