import React          from 'react';
import service        from './../../services/service';
import Typography     from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import TextField      from '@material-ui/core/TextField';
//import Button         from '@material-ui/core/Button';

const useStyles = theme => ({

  container:{
    padding: '20px',
    height: '100%'
  },

  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },

  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '50ch',
  },

});

class SiteConfGeneral extends React.Component {

  history: any;

  constructor(props){
    super(props);
    this.state = {
      siteconf : {},
      source : {},
      publish : {},
      parseInfo : {},
      quiqrCloud : {}
    };
  }

  componentDidUpdate(preProps: HomeProps){
    if(this._ismounted && preProps.siteKey !== this.props.siteKey){
      this.checkSiteInProps();
    }
  }

  componentDidMount(){
    this.checkSiteInProps();
    this._ismounted = true;
  }

  checkSiteInProps(){

    var { siteKey, workspaceKey } = this.props;

    this.setState({
      siteKey: this.props.siteKey
    })

    service.getSiteAndWorkspaceData(siteKey, workspaceKey).then((bundle)=>{
      var stateUpdate  = {};
      stateUpdate.siteconf = bundle.site;


      if(bundle.site.source){
        this.setState({source: bundle.site.source});
      }
      if(bundle.site.publish){
        this.setState({publish: bundle.site.publish});

        if(bundle.site.publish[0]
          && bundle.site.publish[0].config
          && bundle.site.publish[0].config.type === "quiqr"){
          this.setState({quiqrCloud: bundle.site.publish[0].config});
        }
      }

      this.setState(stateUpdate);
    })
  }

  handleFolderSelected(folder){
  }

  componentWillUnmount(){
    service.unregisterListener(this);
  }

  render(){
    const { classes } = this.props;
    return (
      <div className={ this.props.classes.container }>
        <Typography variant="h4">Site: {this.props.siteKey}</Typography>
        <Typography variant="h5">General Configuration</Typography>

        <div className={classes.root}>

          <TextField
            id="standard-full-width"
            label="Site key"
            style={{ margin: 8 }}
            value={this.state.siteconf.key}
            fullWidth
            disabled
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }} />

          <TextField
            id="standard-full-width"
            label="Site Name"
            style={{ margin: 8 }}
            onChange={ this.handleChangeSiteKey }
            value={this.state.siteconf.name}
            fullWidth
            disabled
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }} />

          <TextField
            id="standard-full-width"
            label="Source Directory"
            style={{ margin: 8 }}
            onChange={ this.handleChangeSiteKey }
            value={this.state.source.path}
            fullWidth
            disabled
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }} />

          <TextField
            id="standard-full-width"
            label="Quiqr Cloud Path"
            style={{ margin: 8 }}
            onChange={ this.handleChangeSiteKey }
            value={this.state.quiqrCloud.path}
            fullWidth
            disabled
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }} />

          <TextField
            id="standard-full-width"
            label="Quiqr Cloud Path"
            style={{ margin: 8 }}
            onChange={ this.handleChangeSiteKey }
            value={this.state.quiqrCloud.defaultDomain}
            fullWidth
            disabled
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }} />

        </div>

        {/*
        <Button className={classes.primaryButton} variant="contained" color="primary" onClick={this.handleNewSiteClick}>
          Save Configuration
        </Button>
        */}



      </div>
    );
  }
}

export default withStyles(useStyles)(SiteConfGeneral);
