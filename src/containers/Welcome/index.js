import React from 'react';
import { Route } from 'react-router-dom';
import service from './../../services/service'

//import Checkbox from 'material-ui/Checkbox';
import { RaisedButton } from 'material-ui/';

const styles = {
    container:{
        padding: '20px',
        //        display:'flex',
        height: '100%'
    },
}

class Welcome extends React.Component {
    constructor(props){
        super(props);
        this.state = {};
    }
    componentWillMount(){
    }

    handleLinkThemeGallery = ()=>{
        window.require('electron').shell.openExternal("https://router.poppygo.app/theme-gallery");
    }
    handleLinkPoppyWebsite = ()=>{
        window.require('electron').shell.openExternal("https://poppygo.io");
    }
    handleImportClick = ()=>{
        service.api.importSite();
    }
    handleCloseClick = ()=>{
        this.history.push('/');
    }
    handleShowWelcomeCheck = ()=>{
        if(this.state.showWelcome){
            this.setState({showWelcome: false});
        }
        else{
            this.setState({showWelcome: true});
        }

    }
    render(){
        return(
            <Route render={({history})=>{

                this.history = history;
                return (
                    <div style={ styles.container }>
                        <h1>Congratulations: You installed PoppyGo.</h1>
                        <p>
                            <strong>
                                PoppgyGo is a publishing platform for static websites.
                            </strong>
                            <br/>
                            Everybody can easily manage the content and settings in your website.
                            With PoppyGo Publisher you get your site live in seconds.
                        </p>
                        <p>
                            <RaisedButton primary={true} label="Check our example templates " disabled={false} onClick={this.handleLinkThemeGallery} />
                        </p>

                        <h2>Useful links</h2>
                        <ul>
                            <li>
                                <button className="reglink" onClick={this.handleLinkPoppyWebsite} >PoppyGo Website</button>
                            </li>
                        </ul>
                        <h2>Start right-away</h2>
                        <p>
                            Import the site that your developer has created for you.
                            Your developer didn’t send you a site yet? Check the example template to start playing around.
                        </p>

                        <p>
                            <RaisedButton primary={true} label="Import your site right now" disabled={false} onClick={this.handleImportClick} />
                        </p>
                        <p>
                            <RaisedButton primary={true} label="Close and continue" disabled={false} onClick={this.handleCloseClick} />
                        </p>



                    </div>
                );
            }}/>
        );
    }
}

export default Welcome;

