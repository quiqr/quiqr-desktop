import React          from 'react';
import service        from './../../../services/service';
import Typography     from '@mui/material/Typography';
import TextField      from '@mui/material/TextField';
import IconButton     from '@mui/material/IconButton';
import Grid           from '@mui/material/Grid';
import Box            from '@mui/material/Box';
import FolderIcon     from '@mui/icons-material/Folder';
import LaunchIcon   from '@mui/icons-material/Launch';
import { UserPreferences } from '../../../../types';

interface SiteConfig {
  key?: string;
  name?: string;
  source?: {
    path?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface SiteConfRouteGeneralProps {
  siteKey: string;
  workspaceKey: string;
  classes?: unknown;
}

interface SiteConfRouteGeneralState {
  siteconf: SiteConfig;
  source: {
    path?: string;
    [key: string]: unknown;
  };
  parseInfo: Record<string, unknown>;
  siteKey?: string;
  prefs?: unknown;
  customOpenInCommand?: string;
}

class SiteConfRouteGeneral extends React.Component<SiteConfRouteGeneralProps, SiteConfRouteGeneralState> {

  _ismounted: boolean = false;

  constructor(props: SiteConfRouteGeneralProps){
    super(props);
    this.state = {
      siteconf : {},
      source : {},
      parseInfo : {},
      customOpenInCommand: ""
    };
  }

  componentDidUpdate(preProps: SiteConfRouteGeneralProps){
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

    service.api.readConfKey('prefs').then((value: UserPreferences)=>{
      this.setState({prefs: value });

      const customOpenInCommand = value.customOpenInCommand || ""
      this.setState({ customOpenInCommand });

    });

    service.getSiteAndWorkspaceData(siteKey, workspaceKey).then((bundle)=>{
      this.setState({
        siteconf: bundle.site as SiteConfig
      });

      if(bundle.site.source){
        this.setState({source: bundle.site.source as { path?: string; [key: string]: unknown }});
      }
    })
  }

  render(){
    const { classes } = this.props;
    let sitekey='';

    if(this.state.siteconf.key){
      sitekey=this.state.siteconf.key;
    }


    return (
      <Box sx={{ padding: '20px', height: '100%' }}>
        <Typography variant="h4">Site: {this.state.siteconf.name}</Typography>
        <Typography variant="h5">General Configuration</Typography>
        <Grid container  spacing={1} alignItems="flex-end">
          <Grid size={12}>
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
          <Grid size={12}>
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

          <Grid size={10}>

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

          <Grid size={2}>
            <IconButton
              color="primary"
              sx={{ padding: '10px' }}
              aria-label="directions"
              onClick={()=>{
                service.api.openFileInEditor(this.state.source.path);
              }}
              size="large">
              <FolderIcon />
            </IconButton>
            { this.state.customOpenInCommand && this.state.customOpenInCommand !== "" && this.state.customOpenInCommand.trim() &&

            <IconButton
              color="primary"
              sx={{ padding: '10px' }}
              aria-label="directions"
              onClick={()=>{
                service.api.openCustomCommand(this.state.customOpenInCommand.replace('%site_path', this.state.source.path).replace('%site_name', this.state.siteconf.name))
              }}
              size="large">
              <LaunchIcon />
            </IconButton>
            }
          </Grid>

        </Grid>
      </Box>
    );
  }
}

export default SiteConfRouteGeneral;
