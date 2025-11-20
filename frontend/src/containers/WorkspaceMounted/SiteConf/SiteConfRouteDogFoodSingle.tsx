import React          from 'react';
import Typography     from '@mui/material/Typography';
import Box            from '@mui/material/Box';
import Single         from '../Single';
import service        from './../../../services/service';
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

interface SiteConfRouteEtalageProps {
  siteKey: string;
  workspaceKey: string;
  singleKey: string;
  fileOverride?: string;
  title?: string;
}

interface SiteConfRouteEtalageState {
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

class SiteConfRouteEtalage extends React.Component<SiteConfRouteEtalageProps, SiteConfRouteEtalageState> {

  _ismounted: boolean = false;

  constructor(props: SiteConfRouteEtalageProps){
    super(props);
    this.state = {
      siteconf : {},
      source : {},
      parseInfo : {},
    };
  }

  componentDidUpdate(preProps: SiteConfRouteEtalageProps){
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

      const customOpenInCommand = value.customOpenInCommand || '';
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

    let fileOverride = null;
    if(typeof this.props.fileOverride === "string"){
      fileOverride = this.props.fileOverride;
    }

    let single = <Single
        key={ this.props.singleKey }
        siteKey={ this.props.siteKey }
        refreshed={ false }
        workspaceKey={ this.props.workspaceKey }
        singleKey={ this.props.singleKey }
        fileOverride={ fileOverride }
        /> ;

    let complete = (
      <Box sx={{ padding: '20px', height: '100%' }}>
        <Typography variant="h4">Site: {this.state.siteconf.name}</Typography>
        <Typography variant="h5">{this.props.title}</Typography>
        { single }
      </Box>);

    return complete;
  }
}

export default SiteConfRouteEtalage;
