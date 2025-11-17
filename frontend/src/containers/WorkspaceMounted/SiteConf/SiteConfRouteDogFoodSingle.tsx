import React          from 'react';
import Typography     from '@mui/material/Typography';
import Box            from '@mui/material/Box';
import Single         from '../Single';
import service        from './../../../services/service';

class SiteConfRouteEtalage extends React.Component {

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
