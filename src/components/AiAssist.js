import React from 'react';
import GrainIcon   from '@material-ui/icons/Memory';
import IconButton from '@material-ui/core/IconButton';
import Button            from '@material-ui/core/Button';
import service           from '../services/service';
import TextField            from '@material-ui/core/TextField';
import Box                  from '@material-ui/core/Box';
import Dialog               from '@material-ui/core/Dialog';
import DialogActions        from '@material-ui/core/DialogActions';
import DialogContent        from '@material-ui/core/DialogContent';
import DialogContentText    from '@material-ui/core/DialogContentText';
import DialogTitle          from '@material-ui/core/DialogTitle';

class AiAssist extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      dialogOpen: false,
    }
  }

  renderFailure(){
    return (
      <div>
        Something went wrong.
      </div>
    )
  }

  renderBody(){
    return (
      <Box>
        <TextField
          id="standard-full-width"
          label="Assist Command"
          fullWidth
          value={this.state.assistText}
          onChange={(e)=>{this.handleNameChange(e)}}
          error={(this.state.errorTextSiteName===""?false:true)}
          helperText={this.state.errorTextSiteName}
          />
      </Box>
    )
  }

  renderDialog(){

    let failure = this.state.failure;
    return (

      <Dialog
        open={this.state.dialogOpen}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-descriptio"
        fullWidth={true}
        maxWidth={"sm"} >

        <DialogTitle id="alert-dialog-title">{"AI Assist on: " + this.props.inField }</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            { failure? this.renderFailure() : this.renderBody() }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{
            this.setState({dialogOpen: false})
          }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>


    )
  };


  handleClick(){
    service.api.logToConsole("Robot");
    this.setState({dialogOpen:true})
  }

  render(){
    return (
      <span style={{display:'inline-block', position:'relative', cursor: 'default'}}>
        {this.renderDialog()}
        <IconButton aria-label="AI-assist" onClick={
          ()=>{
          this.handleClick();
          }}>
          <GrainIcon />
        </IconButton>
      </span>
    );
  }
}

export default AiAssist;
