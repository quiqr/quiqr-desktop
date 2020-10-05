import * as React from 'react';
import Spinner from './../../../components/Spinner'
import service from './../../../services/service';
import { Dialog, FlatButton, MenuItem, SelectField, TextField } from 'material-ui';
import type { SiteConfig, WorkspaceHeader, WorkspaceConfig } from './../../../types';
import { Accordion, AccordionItem } from './../../../components/Accordion';
import IconNavigationCheck from 'material-ui/svg-icons/navigation/check';

let net = window.require('electron').remote.net;

export default class RegisterDialog extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            username: "test3334",
            email: "test@lkjflsdk.nl",
            username_err: "",
            email_err: "",
            busy: false,
         }
    }

    handleCancelClick = () => {
        this.props.onCancelClick();
    }

    handleRegisterClick = async (context) => {

        this.setState({
            busy: true
        });

        //let pubkey = await service.api.createKeyPair();

        let promise = service.api.createKeyPair();

        promise.then((pubkey)=>{
            service.api.logToConsole("frontend:" + pubkey);

            this.registerUserPost(this.state.username, this.state.email, pubkey);

            this.setState({
                busy: false
            });
        }, (e)=>{
            service.api.logToConsole("frontend:" + e);
            this.setState({
                busy: false
            });
        })

        //createkey
        //post register request
        //create profile.json

        /*this.props.onRegisterClick({
            username: this.state.username,
            email: this.state.email
        });
        */
    }

    registerUserPost(username, email, pubkey){

    }

    handleUserNameChange(e){

        let value = e.target.value;

        if(value!==''){

            let url = "https://board.poppygo.io/stat/uname/"+value;
            let data='';

            const request = net.request(url);
            request.on('response', (response) => {

                response.on('end', () => {
                    service.api.logToConsole(data);
                    let obj = JSON.parse(data);

                    if(obj.status !== "free"){
                        this.setState({
                            username_err: "username is "+obj.status
                        });
                    }
                    else{
                        this.setState({
                            username_err: ""
                        });
                    }

                    service.api.logToConsole(obj);
                });
                response.on("data", chunk => {
                    data += chunk;
                });
            })
            request.end()
        }

        this.setState({
            username: value,
        });

    }
    handleEmailChange(e){
        let value = e.target.value;
        this.setState({
            email: value,
        });

        /*
        if(value!==''){
            let url = "https://board.poppygo.io/stat/email/"+value;
            let data='';

            const request = net.request(url);
            request.on('response', (response) => {

                response.on('end', () => {
                    service.api.logToConsole(data);
                    let obj = JSON.parse(data);

                    if(obj.status !== "free"){
                        this.setState({
                            username_err: "username is "+obj.status
                        });
                    }
                    else{
                        this.setState({
                            username_err: ""
                        });
                    }

                    service.api.logToConsole(obj);
                });
                response.on("data", chunk => {
                    data += chunk;
                });
            })
            request.end()
        }
        */

    }

    validate(){
        return  this.state.username_err === '' &&
            this.state.email_err === '' &&
            this.state.username !== '' &&
            this.state.email !== '';
    }

    render(){
        let { open } = this.props;
        let valid = this.validate();
        let busy = this.state.busy;

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
                    <TextField disabled={busy} errorText={this.state.username_err} floatingLabelText={'username'} value={this.state.username} onChange={(e)=>{this.handleUserNameChange(e)}} fullWidth />
                    <TextField disabled={busy} floatingLabelText={'email address'} value={this.state.email} onChange={(e)=>{this.handleEmailChange(e)}} fullWidth />
                </div>

                { busy? <Spinner /> : undefined }
            </Dialog>
        );
    }

}
