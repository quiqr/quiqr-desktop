import * as React from 'react';
import Spinner from './../../../components/Spinner'
import service from './../../../services/service';
import { Dialog, FlatButton, MenuItem, SelectField, TextField } from 'material-ui';
import type { SiteConfig, WorkspaceHeader, WorkspaceConfig } from './../../../types';
import { Accordion, AccordionItem } from './../../../components/Accordion';
import IconNavigationCheck from 'material-ui/svg-icons/navigation/check';
//import FormData, {getHeaders} from 'form-data';
//import FormData from 'form-data';
let net = window.require('electron').remote.net;

export default class RegisterDialog extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            username: "",
            email: "",
            username_err: "",
            email_err: "",
            failure: false,
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

        let promise = service.api.createKeyPair();

        promise.then((pubkey)=>{
            service.api.logToConsole("frontend:pubkeyok");

            this.registerUserPost(this.state.username, this.state.email, pubkey);

        }, (e)=>{
            service.api.logToConsole("frontend:" + e);
            this.setState({
                busy: false
            });
        })

    }

    registerUserPost(username, email, pubkey){
        var postData = JSON.stringify({username : username, email: email, pubkey: ""+pubkey });

        let data='';
        const request = net.request({
            method: 'POST',
            protocol: 'http:',
            hostname: 'localhost',
            port: 9999,
            path: '/user/new',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        })

        request.on('response', (response) => {

            response.on('end', () => {
                //service.api.logToConsole(""+data);
                let obj = JSON.parse(data);
                service.api.logToConsole(obj);
                if(obj.hasOwnProperty('username')){

                    let promise = service.api.createPogoProfile(obj);
                    promise.then(()=>{
                        this.props.onRegisterClick({
                            username: this.state.username,
                            email: this.state.email
                        });
                    });


                }
                else{
                    this.setState({
                        failure: true
                    });
                }
                //service.api.logToConsole(""+response.code);

                this.setState({
                    busy: false
                });
            });

            response.on("data", chunk => {
                data += chunk;
            });

        })
        request.write(postData)
        request.end()

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

    handleTryAgain(){
        this.setState({
            username: "",
            email: "",
            busy: false,
            failure: false,
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
        return !this.state.busy &&
            !this.state.failure &&
            this.state.username_err === '' &&
            this.state.email_err === '' &&
            this.state.username !== '' &&
            this.state.email !== '';
    }
    renderForm(){
        let valid = this.validate();
        let busy = this.state.busy;
        return (
            <div>
                <TextField disabled={busy} errorText={this.state.username_err} floatingLabelText={'username'} value={this.state.username} onChange={(e)=>{this.handleUserNameChange(e)}} fullWidth />
                <TextField disabled={busy} floatingLabelText={'email address'} value={this.state.email} onChange={(e)=>{this.handleEmailChange(e)}} fullWidth />
            </div>
        )

    }

    renderFailure(){
        return (
                <div>
                    Something went wrong. Please <a href="#" onClick={()=>this.handleTryAgain()}>try again.</a>
                </div>
        )
    }

    render(){
        let { open } = this.props;
        let valid = this.validate();
        let busy = this.state.busy;
        let failure = this.state.failure;

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

        return (
            <Dialog
                title="Sign up for free website publishing with PoppyGo Live"
                open={open}
                actions={actions}>

                { failure? this.renderFailure() : this.renderForm() }
                { busy? <Spinner /> : undefined }
            </Dialog>
        );
    }

}
