import React           from 'react';
import service         from './../../../services/service';
import Typography      from '@material-ui/core/Typography';
import { withStyles }  from '@material-ui/core/styles';
import TextField       from '@material-ui/core/TextField';
import IconButton      from '@material-ui/core/IconButton';
import DescriptionIcon from '@material-ui/icons/Description';
import Grid            from '@material-ui/core/Grid';
import Box             from '@material-ui/core/Box';

const useStyles = theme => ({

  container:{
    padding: '20px',
    height: '100%'
  },

  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },

  iconButton: {
    padding: 10,
  },

  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '50ch',
  },

});

class SyncRouteModel extends React.Component {

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

    service.api.getWorkspaceModelParseInfo(siteKey, workspaceKey).then((parseInfo)=>{
      this.setState({parseInfo: parseInfo});
    });
  }

  handleFolderSelected(folder){
  }

  componentWillUnmount(){
    service.unregisterListener(this);
  }
  renderSection(title, files){
    const { classes } = this.props;

    if(files.length === 0) return null;

    return (
        <Box m={2}>
        <Typography variant="h6">{title}</Typography>

        <div className={classes.root}>
          {files.map((item, index)=>{
            return (
          <Grid container  spacing={1} alignItems="flex-end">
            <Grid item xs={11}>
              <TextField
                id="standard-full-width"
                label={item.key}
                style={{ margin: 8 }}
                value={item.filename}
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }} />
            </Grid>
            <Grid item xs={1}>
              <IconButton color="primary" className={classes.iconButton} aria-label="directions"
                onClick={()=>{
                  service.api.openFileInEditor(item.filename);
                }}>
                <DescriptionIcon
                  style={{ color: '#000' }}
                />
              </IconButton>
            </Grid>
          </Grid>
            )
          })}
        </div>

      </Box>
    )
  }

  render(){

    let includeFiles = [];
    let partialFiles = [];
    if(this.state.parseInfo && this.state.parseInfo.includeFiles && this.state.parseInfo.partialFiles){
      includeFiles = this.state.parseInfo.includeFiles;
      partialFiles = this.state.parseInfo.partialFiles;
    }

    return (
      <div className={ this.props.classes.container }>

        <Typography variant="h4">Site: {this.state.siteconf.name}</Typography>
        <Typography variant="h5">Model Configuration</Typography>

        {this.renderSection("Base", [{key:'baseFile',filename:this.state.parseInfo.baseFile}])}
        {this.renderSection("Include Files", includeFiles)}
        {this.renderSection("Partial Files", partialFiles)}

      </div>
    );
  }
}

export default withStyles(useStyles)(SyncRouteModel);
