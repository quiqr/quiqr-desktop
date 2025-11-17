import React           from 'react';
import { Route }            from 'react-router-dom';
import service         from './../../../services/service';
import Typography      from '@mui/material/Typography';
import TextField       from '@mui/material/TextField';
import IconButton      from '@mui/material/IconButton';
import DescriptionIcon from '@mui/icons-material/Description';
import Grid            from '@mui/material/Grid';
import Box             from '@mui/material/Box';
import FolderIcon from '@mui/icons-material/Folder';
import BallotIcon from '@mui/icons-material/Ballot';

class SiteConfRouteModel extends React.Component {

  history;

  constructor(props){
    super(props);
    this.state = {
      siteconf : {},
      source : {},
      publish : {},
      parseInfo : {},
      quiqrCloud : {}
    };
    this._ismounted = false;
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

    service.api.getWorkspaceModelParseInfo(siteKey, workspaceKey).then((parseInfo)=>{
      this.setState({parseInfo: parseInfo});
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

  renderDogFoodIcon(item, history){
    let encodedSiteKey = this.props.siteKey;
    let encodedWorkspaceKey = this.props.workspaceKey;
    let basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}/siteconf`;

    if(item.filename && item.filename.includes("/quiqr/model/includes/menu.yaml")){
      return (
        <IconButton
          color="primary"
          sx={{ padding: '10px' }}
          aria-label="directions"
          onClick={()=>{
            let fileBaseName = item.filename.split('/').reverse()[0];
            history.push(`${basePath}/dogfoodIncludesMenu/${fileBaseName}`)

          }}
          size="large">
          {(item.icon ? item.icon : <BallotIcon />)}
        </IconButton>
      );
    }
    return null

  }

  renderSection(title, files, history){
//    let encodedSiteKey = this.props.siteKey;
//    let encodedWorkspaceKey = this.props.workspaceKey;
//    let basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}/siteconf`;


    if(files.length === 0) return null;

    return (
      <Box m={2}>
        <Typography variant="h6">{title}</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>

          {files.map((item, index)=>{

            return (
              <Grid container key={"grid"+index} spacing={1} alignItems="flex-end">
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

                  <IconButton
                    color="primary"
                    sx={{ padding: '10px' }}
                    aria-label="directions"
                    onClick={()=>{
                      service.api.openFileInEditor(item.filename);

                    }}
                    size="large">
                    {(item.icon ? item.icon : <DescriptionIcon />)}
                  </IconButton>
                  {this.renderDogFoodIcon(item,history)}
                </Grid>
              </Grid>
            );
          })}
        </Box>
      </Box>
    );
  }

  render(){
    return <Route render={({history})=>{ return this.renderWithRoute(history) }} />
  }

  renderWithRoute(history){


    let includeFiles = [];
    let includeFilesSub = [];
    let partialFiles = [];
    if(this.state.parseInfo && this.state.parseInfo.includeFiles && this.state.parseInfo.partialFiles){
      includeFiles = this.state.parseInfo.includeFiles;
      includeFilesSub = this.state.parseInfo.includeFilesSub;
      partialFiles = this.state.parseInfo.partialFiles;
    }

    return (
      <Box sx={{ padding: '20px', height: '100%' }}>

        <Typography variant="h4">Site: {this.state.siteconf.name}</Typography>
        <Typography variant="h5">Model Configuration</Typography>

        {this.renderSection("Model Directory", [{key:'directory',filename:this.state.source.path + "/quiqr/model", icon: <FolderIcon />}],history)}
        {this.renderSection("Base", [{key:'baseFile',filename:this.state.parseInfo.baseFile }], history)}
        {this.renderSection("Include Files", includeFiles, history)}
        {this.renderSection("Include Files Subs", includeFilesSub, history)}
        {this.renderSection("Partial Files", partialFiles, history)}

      </Box>
    );
  }
}

export default SiteConfRouteModel;
