import React from 'react';
import service from './../../services/service'

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

    handleLinkThemeGallery = ()=>{
        window.require('electron').shell.openExternal("https://router.poppygo.app/theme-gallery");
    }
    handleLinkPoppyWebsite = ()=>{
        window.require('electron').shell.openExternal("https://poppygo.io");
    }
    handleImportClick = ()=>{

        service.api.importSite();
    }
    render(){
        return(
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
                        <a href="#" onClick={this.handleLinkPoppyWebsite} >PoppyGo Website</a>
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



            </div>
        );
    }
}

export default Welcome;

