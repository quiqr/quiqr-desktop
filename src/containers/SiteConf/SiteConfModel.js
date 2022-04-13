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

class SiteConfModel extends React.Component {

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

  render(){
    const { classes } = this.props;

    let includeFiles = [];
    let partialFiles = [];
    if(this.state.parseInfo && this.state.parseInfo.includeFiles && this.state.parseInfo.partialFiles){
      includeFiles = this.state.parseInfo.includeFiles;
      partialFiles = this.state.parseInfo.partialFiles;
    }

    return (
      <div className={ this.props.classes.container }>
        <Typography variant="h4">Site: {this.props.siteKey}</Typography>
        <Typography variant="h5">Model Configuration</Typography>

        <div className={classes.root}>

          <Typography variant="h6">Base</Typography>

          <TextField
            id="standard-full-width"
            label="Base File"
            style={{ margin: 8 }}
            value={this.state.parseInfo.baseFile}
            fullWidth
            disabled
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }} />

          <Typography variant="h6">Include Files</Typography>

          {includeFiles.map((item, index)=>{

            return (
                <TextField
                  key={'include-item-'+index}
                  id="standard-full-width"
                  label={item.key}
                  style={{ margin: 8 }}
                  fullWidth
                  disabled
                  value={item.filename}
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }} />
            );
          })}

          <Typography variant="h6">Partial Files</Typography>

          {partialFiles.map((item, index)=>{

            return (
                <TextField
                  key={'partial-item-'+index}
                  id="standard-full-width"
                  label={item.key}
                  style={{ margin: 8 }}
                  fullWidth
                  disabled
                  value={item.filename}
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }} />
            );
          })}


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

export default withStyles(useStyles)(SiteConfModel);
