import * as React              from 'react';
import { withStyles }          from '@material-ui/core/styles';
import Box                     from '@material-ui/core/Box';
import Divider                 from '@material-ui/core/Divider';
import Paper                   from '@material-ui/core/Paper';
import Tooltip                 from '@material-ui/core/Tooltip';
import Button                  from '@material-ui/core/Button';
import ArrowUpwardIcon         from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon       from '@material-ui/icons/ArrowDownward';
import Typography              from '@material-ui/core/Typography';
import Timeline                from '@material-ui/lab/Timeline';
import TimelineItem            from '@material-ui/lab/TimelineItem';
import TimelineSeparator       from '@material-ui/lab/TimelineSeparator';
import TimelineConnector       from '@material-ui/lab/TimelineConnector';
import TimelineContent         from '@material-ui/lab/TimelineContent';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import TimelineDot             from '@material-ui/lab/TimelineDot';
import NewReleasesIcon         from '@material-ui/icons/NewReleases';
import GitHubIcon              from '@material-ui/icons/GitHub';
import CloudUploadIcon         from '@material-ui/icons/CloudUpload';
import SaveAltIcon             from '@material-ui/icons/SaveAlt';
import RefreshIcon             from '@material-ui/icons/Refresh';
import BlockIcon               from '@material-ui/icons/Block';
import Link                    from '@material-ui/core/Link';
import SettingsIcon            from '@material-ui/icons/Settings';
import Meta                    from './Meta'
import {snackMessageService}   from '../../../../../services/ui-service';
import service                 from '../../../../../services/service';

const useStyles = theme => ({
});

class Dashboard extends React.Component{

  moreAmount = 4;

  constructor(props){
    super(props);
    this.state = {
      siteconf : {},
      source : {},
      historyArr: [],
      lastRefresh: '',
      resultsShowing: 0,
    };
  }

  componentDidMount(){
    this.checkSiteInProps();
    this.softRefreshRemoteStatus();
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


  softRefreshRemoteStatus(){

    this.props.onSyncDialogControl(
      true,
      'Read cached commit history',
      Meta.icon()
    );

    service.api.publisherDispatchAction(this.props.siteKey, this.props.publishConf, 'readRemote',{},90000).then((results)=>{
      this.setState({
        historyArr: results.commitList,
        lastRefresh: results.lastRefresh.toString(),
        resultsShowing: this.moreAmount
      });
      this.props.onSyncDialogControl(
        false,
        Meta.syncingText,
        Meta.icon()
      );
    }).catch(()=>{

      snackMessageService.addSnackMessage('Sync: read cached remote status failed.', {severity: 'warning'});

      this.props.onSyncDialogControl(
        false,
        Meta.syncingText,
        Meta.icon()
      );

    });
  }

  refreshRemoteStatus(showSnack){
    this.props.onSyncDialogControl(
      true,
      'Refreshing commit history',
      Meta.icon()
    );

    service.api.publisherDispatchAction(this.props.siteKey, this.props.publishConf, 'refreshRemote',{},90000).then((results)=>{
      this.setState({
        historyArr: results.commitList,
        lastRefresh: results.lastRefresh.toString(),
        resultsShowing: this.moreAmount
      });
      this.props.onSyncDialogControl(
        false,
        Meta.syncingText,
        Meta.icon()
      );

      if(showSnack){
        snackMessageService.addSnackMessage('Sync: Refreshing remote status finished.', {severity: 'success'});
      }

    }).catch(()=>{

      snackMessageService.addSnackMessage('Sync: Refreshing remote status failed.', {severity: 'warning'});

      this.props.onSyncDialogControl(
        false,
        Meta.syncingText,
        Meta.icon()
      );

    });
  }

  checkoutRef(refHash){
    this.props.onSyncDialogControl(
      true,
      'Refreshing commit history',
      Meta.icon()
    );

    service.api.publisherDispatchAction(this.props.siteKey, this.props.publishConf, 'checkoutRef',{ref: refHash},90000).then((results)=>{

      this.props.onSyncDialogControl(
        false,
        Meta.syncingText,
        Meta.icon()
      );
      this.refreshRemoteStatus(false);

      snackMessageService.addSnackMessage(`Sync: commit with ref ${refHash} has been checked out succesfully.`, {severity: 'success'});
    }).catch(()=>{

      snackMessageService.addSnackMessage(`Sync: Failed checking out ref: ${refHash}.`, {severity: 'warning'});

      this.props.onSyncDialogControl(
        false,
        Meta.syncingText,
        Meta.icon()
      );

    });
  }

  showMore(){
    this.setState({
      resultsShowing: (this.state.resultsShowing + this.moreAmount)
    });
  }

  pullFromRemote(mode='pull'){

    let dispatchCommand = 'checkoutLatest';
    if(mode==='pull')
    {
      dispatchCommand = 'pullFromRemote';
    }

    this.props.onSyncDialogControl(
      true,
      Meta.syncingText, Meta.icon());

    service.api.publisherDispatchAction(this.props.siteKey, this.props.publishConf, dispatchCommand, {}, 180000).then(()=>{

      this.props.onSyncDialogControl(
        false,
        Meta.syncingText, Meta.icon());

      this.refreshRemoteStatus(false);

      snackMessageService.addSnackMessage(`Sync: ${mode} from remote finished.`,'success');

    }).catch((e)=>{
      snackMessageService.addSnackMessage(`Sync: ${mode} from remote failed.`, {severity: 'warning'});
      this.props.onSyncDialogControl(
        false,
        Meta.syncingText, Meta.icon());
    });
  }

  pushToRemote(mode='soft'){
    let dispatchCommand = 'hardPush';
    if(mode==='soft')
    {
      dispatchCommand = 'pullFromRemote';
    }

    this.props.onSyncDialogControl(
      true,
      Meta.syncingText, Meta.icon());

    service.api.buildWorkspace(this.props.siteKey, this.props.workspaceKey, null, this.props.publishConf).then(()=>{

      service.api.publisherDispatchAction(this.props.siteKey, this.props.publishConf, dispatchCommand, {}, 180000).then(()=>{

        this.props.onSyncDialogControl(
          false,
          Meta.syncingText, Meta.icon());

        //this.refreshRemoteStatus(false);

        snackMessageService.addSnackMessage('Sync: Push to remote finished.', {severity: 'success'});
      }).catch(()=>{

        this.props.onSyncDialogControl(
          false,
          Meta.syncingText, Meta.icon());

        snackMessageService.addSnackMessage('Sync: Push to remote failed.', {severity: 'warning'});
      });
    });
  }

  render(){
    let lastStatusCheck = this.state.lastRefresh;
    let unpushedChanges = false;
    let remoteDiffers = true;
    let historyArr = this.state.historyArr;

    return (
      <React.Fragment>

        <Box component="div" style={{
          display:'flex',
          alignItems: 'flex-start'
          }} m={2}>

          <Box component="span">
            <GitHubIcon fontSize="large"  style={{margin:'6px'}} />
          </Box>

          <Box component="span" style={{flexGrow:1}}>
            <Typography>{Meta.sidebarLabel(this.props.publishConf)}</Typography>

            <Link component="button" variant="body2"
              onClick={()=>{
                window.require('electron').shell.openExternal(Meta.repoAdminUrl(this.props.publishConf));
              }}
            >
            {Meta.repoAdminUrl(this.props.publishConf)}
            </Link>
          </Box>

          <Box component="span">
            <Button
              onClick={()=>{this.props.onConfigure()}}
              style={{marginRight:'5px'}}
              size="small"
              variant="contained"
              color="default"
              startIcon={<SettingsIcon />}
            >
              Configure
            </Button>
            <Button
              onClick={()=>{
                let filename = this.state.source.path + "/quiqr/sync_ignore.txt"
                service.api.openFileInEditor(filename, true);
              }}
              size="small"
              variant="contained"
              color="default"
              startIcon={<BlockIcon />}
            >
              Edit ignore list
            </Button>
          </Box>
        </Box>

        <Box component="div" style={{
          display:'flex',
          alignItems: 'flex-start'
        }} m={2}>

          { this.props.enableSyncTo ?
            <React.Fragment>
              {/*
              <Tooltip title="tries to merge files with remote version">
                <Button
                  onClick={()=>{this.pushToRemote('soft')}}
                  style={{marginRight:'5px'}}
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<ArrowUpwardIcon />}
                >
                  Soft Push
                </Button>
              </Tooltip>
              */}
              <Tooltip title="overwrites remote version">
                <Button
                  onClick={()=>{this.pushToRemote('hard')}}
                  style={{marginRight:'5px'}}
                  size="small"
                  variant="contained"
                  color="secondary"
                  startIcon={<ArrowUpwardIcon />}
                >
                  Push
                </Button>
              </Tooltip>
            </React.Fragment>
            :null
          }

          { this.props.enableSyncFrom ?
            <React.Fragment>
              {/*
              <Tooltip title="tries to merge remote files with local version">
                <Button
                  style={{marginLeft:'10px',marginRight:'5px'}}
                  onClick={()=>{this.pullFromRemote('pull')}}
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<ArrowDownwardIcon />}
                >
                  Pull latest
                </Button>
              </Tooltip>
              */}
              <Tooltip title="overwrites local version">
                <Button
                  style={{marginRight:'5px'}}
                  onClick={()=>{this.pullFromRemote('checkoutLatest')}}
                  size="small"
                  variant="contained"
                  color="secondary"
                  startIcon={<ArrowDownwardIcon />}
                >
                  Checkout latest
                </Button>
              </Tooltip>
            </React.Fragment>
            :null
          }
        </Box>

        <Divider/>


        <Box component="div"
          m={1}
          style={{
            display:'flex',
            justifyContent: 'flex-end',
          }}>
          <Box component="div" p={1}>
            <Typography variant="body2" color="textSecondary">
              Last history refresh: {lastStatusCheck}
            </Typography>
          </Box>

          <Button
            onClick={()=>{
              this.refreshRemoteStatus(true)
            }}
            size="small"
            variant="contained"
            color="default"
            startIcon={<RefreshIcon />}
          >
            Refresh History
          </Button>
        </Box>

        <Timeline xalign="alternate">

          {unpushedChanges ?
            <TimelineItem>
              <TimelineOppositeContent>
                <Paper elevation={3}>
                  <Box sx={{p:1}}>
                    <Typography variant="h6" component="h1">
                      There are unpublished local changes.
                    </Typography>

                    { this.props.enableSyncTo ?
                      <Box py={1}>

                        <Button
                          onClick={()=>{

                          }}
                          style={{marginRight:'5px'}}
                          size="small"
                          variant="contained"
                          color={remoteDiffers ? "secondary" : "primary"}
                          startIcon={<ArrowUpwardIcon />}
                        >
                          Push to Remote
                        </Button>

                        <Button
                          onClick={()=>{

                          }}
                          style={{marginRight:'5px'}}
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<SaveAltIcon />}
                        >
                          Local Commit
                        </Button>

                      </Box>:null}

                  </Box>
                </Paper>

              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot color="secondary">
                  <NewReleasesIcon />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
              </TimelineContent>
            </TimelineItem>
            :null}

          {historyArr.slice(0,this.state.resultsShowing).map((item, index)=>{

            let content = (
              <Paper elevation={3} key={"commit-"+index}>
                <Box p={2}>
                  <Typography variant="h6" component="h1">
                    {item.message.split("+")[0]}
                  </Typography>
                  <Typography>Author: {item.author}</Typography>
                  <Typography>Date: {item.date}</Typography>
                  <Typography>Ref: {item.ref.substr(0,7)}</Typography>
                    <Box py={1}>
                      {/*
                        item.local ? null :
                          <Button
                            onClick={()=>{

                            }}
                            style={{marginRight:'5px'}}
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<ArrowDownwardIcon />}
                          >
                            Try merge
                          </Button>

*/
                      }
                      <Button
                        onClick={()=>{
                          this.checkoutRef(item.ref);
                        }}
                        style={{marginRight:'5px'}}
                        size="small"
                        variant="contained"
                        color="secondary"
                        startIcon={<ArrowDownwardIcon />}
                      >
                        Checkout this Version
                      </Button>

                    </Box>
                </Box>
              </Paper>

            )

            return (
              <TimelineItem key={"timeline"+index}>
                <TimelineOppositeContent>
                  {item.local ? content : null}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot
                    color={item.local ? "primary" : "secondary"}
                  >
                    {/*item.local ? <LaptopMacIcon /> : <CloudIcon/>*/}
                    <CloudUploadIcon />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  {item.local ? null : content}
                </TimelineContent>
              </TimelineItem>
            )
          })}


        </Timeline>
        { this.state.historyArr.length > this.state.resultsShowing ?
          <Box py={1} variant="div"
            style={{
              display:'flex',
              justifyContent: 'center',
            }}>

            <Button
              onClick={()=>{
                this.showMore();
              }}
              style={{marginRight:'5px'}}
              size="small"
              variant="contained"
              color="default"
              startIcon={<RefreshIcon />}
            >
              Load More
            </Button>

          </Box>:null}

      </React.Fragment>
    )
  }

}

export default withStyles(useStyles)(Dashboard);


