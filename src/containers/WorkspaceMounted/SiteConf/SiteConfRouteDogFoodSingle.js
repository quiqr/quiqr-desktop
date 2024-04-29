import React          from 'react';
import Typography     from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Single         from '../Single';
import service        from './../../../services/service';


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
      <div className={ this.props.classes.container }>
        <Typography variant="h4">Site: {this.state.siteconf.name}</Typography>
        <Typography variant="h5">{this.props.title}</Typography>
        { single }
      </div>);

    return complete;
  }
}

export default withStyles(useStyles)(SiteConfRouteEtalage);
