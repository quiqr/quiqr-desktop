import * as React from 'react';
import Spinner from './../../../components/Spinner'
import service from './../../../services/service';
import { Dialog, FlatButton, TextField } from 'material-ui';
//import type { SiteConfig, WorkspaceHeader, WorkspaceConfig } from './../../../types';
//import { Accordion, AccordionItem } from './../../../components/Accordion';
//import IconNavigationCheck from 'material-ui/svg-icons/navigation/check';
import IconHttps from 'material-ui/svg-icons/action/https';
import Paper from 'material-ui/Paper';
//import FormData, {getHeaders} from 'form-data';
//import FormData from 'form-data';
let net = window.require('electron').remote.net;

export default class ClaimDomainDialog extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            pogourl: "",
            pogourl_err: "",
            email_err: "",
            failure: false,
            busy: false,
            username: this.props.username
         }
    }

    handleCancelClick = () => {
        this.props.onCancelClick();
    }

    handleDomainClaimClick = async (context) => {

        this.setState({
            busy: true
        });


        this.registerDomain(this.state.pogourl, this.props.username);
    }

    registerDomain(pogourl, username){
        if(username===""){
            this.setState({
                failure: true
            });

            this.setState({ busy: false });
            return
        }
        var postData = JSON.stringify({sitename : pogourl, username: username});

        let data='';
        let localBoard=false;
        let request=null;
        if(localBoard){
            request = net.request({
                method: 'POST',
                protocol: 'http:',
                hostname: 'localhost',
                port: 9999,
                path: '/site/new',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': postData.length
                }
            })
        }
        else{
            request = net.request({
                method: 'POST',
                protocol: 'https:',
                hostname: 'board.poppygo.io',
                port: 443,
                path: '/site/new',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': postData.length
                }
            })
        }

        request.on('response', (response) => {

            response.on('end', () => {
                let obj = JSON.parse(data);
                if(obj.hasOwnProperty('path')){

                    let promise = service.api.createPogoDomainConf(obj.path, obj.path+".pogosite.com");
                    promise.then((path)=>{
                        this.props.onClaimDomainClick({ pogourl: path });
                    });
                }
                else{
                    this.setState({
                        failure: true
                    });
                }

                this.setState({ busy: false });
            });

            response.on("data", chunk => {
                data += chunk;
            });

        })
        request.write(postData)
        request.end()

    }

    handlepogourlChange(e){

        let value = e.target.value;

        if(value!==''){

            let url = "https://board.poppygo.io/stat/site/"+value;
            let data='';

            const request = net.request(url);
            request.on('response', (response) => {

                response.on('end', () => {
                    let obj = JSON.parse(data);

                    if(obj.status !== "free"){
                        this.setState({
                            pogourl_err: "pogourl is "+obj.status
                        });
                    }
                    else{
                        this.setState({
                            pogourl_err: ""
                        });
                    }

                });
                response.on("data", chunk => {
                    data += chunk;
                });
            })
            request.end()
        }

        this.setState({
            pogourl: value,
        });

    }

    handleTryAgain(){
        this.setState({
            pogourl: "",
            busy: false,
            failure: false,
        });

    }

    validate(){
        return !this.state.busy &&
            !this.state.failure &&
            this.state.pogourl_err === '' &&
            this.state.pogourl !== ''
    }

    renderForm(){
        //let valid = this.validate();
        let busy = this.state.busy;
        let previewUrl = this.state.pogourl.replace(/\./g,"-");
        return (
            <div>
                <TextField disabled={busy} errorText={this.state.pogourl_err} floatingLabelText={'PoppyGo Domain'} value={this.state.pogourl} onChange={(e)=>{this.handlepogourlChange(e)}} fullWidth />
                <Paper style={{margin:10,padding:"0 7px 7px 7px"}}>
                    <IconHttps viewBox="-5 0 35 10" color="#666" /><span>https://</span><span style={{color:"green"}}>{previewUrl}</span><span>.pogosite.com</span>
                </Paper>
            </div>
        )

    }

    renderFailure(){
        return (
                <div>
                    Something went wrong. Please <button className="reglink" onClick={()=>this.handleTryAgain()}>try again.</button>
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
                label="Claim domain"
                primary={true}
                onClick={this.handleDomainClaimClick}
            />,
        ];

        return (
            <Dialog
                title="Claim your PoppyGo domain for easy publishing to the web"
                open={open}
                actions={actions}>

                { failure? this.renderFailure() : this.renderForm() }
                { busy? <Spinner /> : undefined }
            </Dialog>
        );
    }

}
