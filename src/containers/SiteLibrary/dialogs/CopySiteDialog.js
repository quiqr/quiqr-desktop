import * as React           from 'react';
import service              from '../../../services/service';
import TextField            from '@material-ui/core/TextField';
import { withStyles }       from '@material-ui/core/styles';
import Button               from '@material-ui/core/Button';
import Box                  from '@material-ui/core/Box';
import Dialog               from '@material-ui/core/Dialog';
import DialogActions        from '@material-ui/core/DialogActions';
import DialogContent        from '@material-ui/core/DialogContent';
import DialogContentText    from '@material-ui/core/DialogContentText';
import DialogTitle          from '@material-ui/core/DialogTitle';

const useStyles = theme => ({

});


class CopyDialog extends React.Component{

  constructor(props){
    super(props);

    this.state = {
      execButtonsDisabled: false,
      errorTextSiteName: "",
      busy: false,
      cancelText: "cancel",
      siteconf: {}
    }
  }
  componentWillUpdate(nextProps, nextState) {
    if(this.props.siteconf.key !== nextProps.siteconf.key){
      let siteconf = Object.assign({}, nextProps.siteconf);
      siteconf.name = siteconf.name + " (copy)";
      this.setState({siteconf: siteconf, execButtonsDisabled: false});
    }
  }

  renderFailure(){
    return (
      <div>
        Something went wrong.
      </div>
    )
  }
  validateSiteName(newName){
    let errorTextSiteName = "";
    let execButtonsDisabled = false;

    if(this.props.localsites && this.props.localsites.includes(newName)){
      errorTextSiteName = "Name is already used."
      execButtonsDisabled = true;
    }
    this.setState({
      execButtonsDisabled: execButtonsDisabled,
      errorTextSiteName: errorTextSiteName
    });
  }

  handleNameChange(e){
    this.validateSiteName(e.target.value);

    let siteconf = this.state.siteconf;

    siteconf.name = e.target.value
    this.setState({ siteconf: siteconf });
  }

  saveSiteConf(){
    service.api.copySite(this.state.siteconf.key, this.state.siteconf).then(()=>{
      this.props.onSavedClick();
    });
  }

  renderBody(){
    return (
      <Box>
        <TextField
          id="standard-full-width"
          label="Site Name"
          fullWidth
          value={this.state.siteconf.name}
          onChange={(e)=>{this.handleNameChange(e)}}
          error={(this.state.errorTextSiteName===""?false:true)}
          helperText={this.state.errorTextSiteName}
          />

      </Box>
    )
  }

  render(){

    let { open, siteconf } = this.props;
    let failure = this.state.failure;

    const actions = [
      <Button
        key={"menuAction1"+siteconf.name}
        onClick={()=>{
        this.setState({
          open: false
        },()=>{
          this.props.onCancelClick();
        });
      }}>
        {this.state.cancelText}
      </Button>,

      <Button
        key={"menuAction2"+siteconf.name}
        disabled={this.state.execButtonsDisabled} onClick={()=>this.saveSiteConf()} >
        SAVE
      </Button>,
    ];

    return (
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={true}
        maxWidth={"sm"} >

        <DialogTitle id="alert-dialog-title">{"New site name: "+siteconf.name}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            { failure? this.renderFailure() : this.renderBody() }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {actions}
        </DialogActions>
      </Dialog>
    );
  }
}
export default withStyles(useStyles)(CopyDialog)
