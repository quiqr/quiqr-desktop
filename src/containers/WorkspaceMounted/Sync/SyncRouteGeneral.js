import React            from 'react';
import service          from './../../../services/service';
import Typography       from '@material-ui/core/Typography';
import { withStyles }   from '@material-ui/core/styles';
import TextField        from '@material-ui/core/TextField';
import MainPublishCard  from './components/MainPublishCard';
import SyncServerDialog from './components/SyncServerDialog';
import LogoQuiqrCloud   from './components/LogoQuiqrCloud';
import IconButton       from '@material-ui/core/IconButton';
import MoreVertIcon     from '@material-ui/icons/MoreVert';
import Menu             from '@material-ui/core/Menu';
import MenuItem         from '@material-ui/core/MenuItem';
import Button           from '@material-ui/core/Button';


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

class SyncRouteGeneral extends React.Component {

  history: any;

  constructor(props){
    super(props);
    this.state = {
      site : {
        publish: []
      },
      serverDialog: {},

    };
  }

  componentDidUpdate(preProps){

    if(this.state.addRefresh !== this.props.addRefresh) {

      this.setState({
        addRefresh: this.props.addRefresh,
        serverDialog: {
          open:true,
          modAction: "Add",
          serverTitle: "Sync Server",
          closeText: "Close"
        }
      })
    }

    if(preProps.site !== this.props.site) {
      this.initState();
    }
  }

  componentDidMount(){
    this.initState();
  }

  initState(){

    if(this.props.site){
      this.setState({
        site: this.props.site
      });
    }
  }
  closeServerDialog(){
  }

  renderMainCard(publishConf){

    return <MainPublishCard
    publishPath={publishConf.config.path}
    liveURL={"https://"+publishConf.config.defaultDomain}
    serviceLogo={<LogoQuiqrCloud />}
    onPublish={()=>{
      service.api.logToConsole(publishConf, "pupConf");
    }}
    itemMenu={
      <div>
      <IconButton
      onClick={(event)=>{
        this.setState({anchorEl:event.currentTarget, menuOpen:publishConf.key})
      }}
      aria-label="more"
      aria-controls="long-menu"
      aria-haspopup="true"
      >
        <MoreVertIcon />
      </IconButton>

      <Menu
        anchorEl={this.state.anchorEl}
        open={(this.state.menuOpen===publishConf.key?true:false)}
        keepMounted
        onClose={()=>{
          this.setState({menuOpen:null});

        }}
      >
        <MenuItem key="edit"
          onClick={
            ()=>{
              this.setState({
                menuOpen:null,
                serverDialog: {
                  open:true,
                  modAction: "Edit",
                  serverTitle: "Quiqr Cloud Server",
                  closeText: "Close"
                }
              })
            }
          }
        >
          Edit
        </MenuItem>

        <MenuItem key="delete"
          onClick={
            ()=>{
              this.setState({
                menuOpen:null,
              })
            }
          }>
          Delete
        </MenuItem>
      </Menu>
      </div>
    }

      />
  }

  render(){
    const { classes } = this.props;
    const { site, serverDialog } = this.state;
    let content = null;

    if(site.publish.length < 1){
      //no target setup yet
      content = (

        <div><p>No sync server is configured. Add one first.</p>
        <Button color="primary" variant="contained">add sync server</Button>
        </div>
    )
    }
    else if(site.publish.length === 1){
      //show first target
      content = this.renderMainCard(site.publish[0])
    }
    else{
      //get last used target of syncConfKey
    }

    return (
      <React.Fragment>
        <div className={ this.props.classes.container }>
          <Typography variant="h5">Sync Website - {this.state.site.name}</Typography>
          <span>{this.props.syncConfKey}</span>

          {content}

        </div>

        <SyncServerDialog
          {...serverDialog}
          onClose={()=>{
            this.setState({serverDialog: {
              open:false
            }})
          }}

        />

      </React.Fragment>
    );
  }
}

export default withStyles(useStyles)(SyncRouteGeneral);
