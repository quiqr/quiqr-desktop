import React          from 'react';
import service        from './../../../services/service';
import Typography     from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import TextField      from '@material-ui/core/TextField';
import IconButton     from '@material-ui/core/IconButton';
import Grid           from '@material-ui/core/Grid';
import FolderIcon     from '@material-ui/icons/Folder';
import LaunchIcon   from '@material-ui/icons/Launch';

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

  iconButton: {
    padding: 10,
  },


});

class SiteConfRouteGeneral extends React.Component {

  history;

  constructor(props){
    super(props);
    this.state = {
      siteconf : {},
      source : {},
      parseInfo : {},
    };
  }

  componentDidUpdate(preProps){
    if(this._ismounted && preProps.siteKey !== this.props.siteKey){
      this.checkSiteInProps();
    }
  }

  componentDidMount(){
    this.checkSiteInProps();
    this._ismounted = true;
  }
  componentWillUnmount(){
    this._ismounted = false;
    service.unregisterListener(this);
  }

  checkSiteInProps(){

    var { siteKey, workspaceKey } = this.props;

    this.setState({
      siteKey: this.props.siteKey
    })

    service.api.readConfKey('prefs').then((value)=>{
      this.setState({prefs: value });

      if(value.customOpenInCommand){
        this.setState({customOpenInCommand: value.customOpenInCommand });
      }
      else{
        this.setState({customOpenInCommand: "" });
      }

    });

    service.getSiteAndWorkspaceData(siteKey, workspaceKey).then((bundle)=>{
      var stateUpdate  = {};
      stateUpdate.siteconf = bundle.site;

      if(bundle.site.source){
        this.setState({source: bundle.site.source});
      }

      this.setState(stateUpdate);
    })
  }

  render(){
    const { classes } = this.props;
    let sitekey='';

    if(this.state.siteconf.key){
      sitekey=this.state.siteconf.key;
    }


    return (
      <div className={ this.props.classes.container }>
        <Typography variant="h4">Site: {this.state.siteconf.name}</Typography>
        <Typography variant="h5">General Configuration</Typography>

        <Grid container  spacing={1} alignItems="flex-end">
          <Grid item xs={12}>
            <TextField
              id="standard-full-width"
              label="Site key"
              style={{ margin: 8 }}
              value={sitekey}
              fullWidth
              disabled
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }} />

          </Grid>
          <Grid item xs={12}>
          <TextField
            id="standard-full-width"
            label="Site Name"
            style={{ margin: 8 }}
            value={sitekey}
            fullWidth
            disabled
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }} />

          </Grid>

          <Grid item xs={10}>

          <TextField
            id="standard-full-width"
            label="Source Directory"
            style={{ margin: 8 }}
            value={this.state.source.path}
            fullWidth
            disabled
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }} />

          </Grid>

          <Grid item xs={2}>
            <IconButton color="primary" className={classes.iconButton} aria-label="directions"
              onClick={()=>{
                service.api.openFileInEditor(this.state.source.path);
              }}>
              <FolderIcon />
            </IconButton>
            { this.state.customOpenInCommand && this.state.customOpenInCommand !== "" && this.state.customOpenInCommand.trim() &&

            <IconButton color="primary" className={classes.iconButton} aria-label="directions"
              onClick={()=>{
                service.api.openCustomCommand(this.state.customOpenInCommand.replace('%site_path', this.state.source.path).replace('%site_name', this.state.siteconf.name))
              }}>
              <LaunchIcon />
            </IconButton>
            }
          </Grid>

        </Grid>


      </div>
    );
  }
}

export default withStyles(useStyles)(SiteConfRouteGeneral);
