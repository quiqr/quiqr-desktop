import React          from 'react';
import service        from './../../../services/service';
import Typography     from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import FolderPicker from '../../../components/FolderPicker';

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

class SiteConfRouteDanger extends React.Component {

  history: any;

  constructor(props){
    super(props);
    this.state = {
      siteconf : {},
      source : {},
      publish : {},
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
    service.api.logToConsole(folder);
  }

  componentWillUnmount(){
    service.unregisterListener(this);
  }
  render(){
    const { classes } = this.props;
    return (
      <div className={ this.props.classes.container }>
        <Typography variant="h4">Dangerous Actions: {this.props.siteKey}</Typography>

        <div className={classes.root}>

          <div style={{marginTop:"20px"}}>
            Site Source Folder
            <FolderPicker
            label="Site Folder"
            selectedFolder={this.state.source.path}
            onFolderSelected={(e)=>{this.handleFolderSelected(e)}} />
          </div>

        </div>



      </div>
    );
  }

}

export default withStyles(useStyles)(SiteConfRouteDanger);
