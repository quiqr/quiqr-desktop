import React                from 'react';
import { Route }            from 'react-router-dom';
import { withStyles }       from '@material-ui/core/styles';
import Button               from '@material-ui/core/Button';
import Box               from '@material-ui/core/Box';
import service              from '../../services/service';

const useStyles = theme => ({
});


class Welcome extends React.Component {

  constructor(props){
    super(props);
    this.state = {};
  }

  handleLinkPoppyWebsite = ()=>{
    window.require('electron').shell.openExternal("https://book.quiqr.org/");
  }

  handleImportClick = ()=>{
    service.api.importSite();
  }

  handleNewSiteClick = ()=>{
    this.history.push('/sites/last');
  }

  handleCloseClick = ()=>{
    this.history.push('/sites/last');
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
    const classes = this.props.classes;
    return(
      <Route render={({history})=>{

        this.history = history;

        return (
          <Box p={5}>
          <div className={ classes.container }>
            <div style={{ border: 'solid 0px green', marginLeft: 'auto', marginTop: 13 }}>
              <Button  variant="contained" color="primary" onClick={this.handleCloseClick}>
                Close and continue
              </Button>
            </div>
            <h1>Congratulations: You installed Quiqr, The app for Hugo</h1>
            <h3>You now have a publishing platform and CMS for your websites</h3>
            <p>
              <ul>
                <li>Manage your content</li>
                <li>Preview your updates</li>
                <li>Publish with a single click</li>
                <li>All without setup</li>
              </ul>
              <button className="reglink" onClick={this.handleLinkPoppyWebsite} >Quiqr Docs</button>
            </p>
            <br/>

            <br/>
            <strong><p>Are you developing a Hugo site on your local machine?</p></strong>
            <p>
              Then open your existing site folder in Quiqr to start content management and publishing right away.
            </p>
            <p>
              <Button variant="contained" color="primary" onClick={this.handleNewSiteClick}>
                Open site
              </Button>
            </p>
            <br/>
          </div>
          </Box>
        );
      }}/>
    );
  }
}

export default withStyles(useStyles)(Welcome);
