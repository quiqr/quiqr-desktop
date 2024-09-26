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
import FormControlLabel    from '@material-ui/core/FormControlLabel';
import FormControl         from '@material-ui/core/FormControl';
import MenuItem            from '@material-ui/core/MenuItem';
import Select              from '@material-ui/core/Select';
import InputLabel          from '@material-ui/core/InputLabel';
import { withStyles }      from '@material-ui/core/styles';

const useStyles = theme => ({

  keyButton: {
    marginLeft: "auto",
    margin: theme.spacing(1),
    //marginTop: theme.spacing(2),
  },

  textfield: {
    margin: theme.spacing(1),
  },

  formControl: {
    margin: theme.spacing(1),
    minWidth: 300,
  },

  selectEmpty: {
    marginTop: theme.spacing(2),
  },
});


class AiAssist extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      dialogOpen: false,
    }
  }

  renderDialog(){
    let { classes } = this.props;

    return (

      <Dialog
        open={this.state.dialogOpen}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-descriptio"
        fullWidth={true}
        maxWidth={"md"} >

        <DialogTitle id="alert-dialog-title">{"AI Assist on: " + this.props.inField.title }</DialogTitle>
        <DialogContent>

        <Box my={3} sx={{display:'flex'}}>
          <TextField
            fullWidth
            className={classes.textfield}
            readOnly
            id="standard-full-width"
            label="Current Text"
            value={(this.props.inValue!=="" ? this.props.inValue : "empty")}
            variant="outlined"
          />
        </Box>

        <Box my={0} sx={{display:'flex'}}>

          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel id="demo-simple-select-outlined-label">Run AI Assist with text</InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="runOn"
              value={this.state.runOn}
              onChange={(e)=>{
                this.setState({
                  runOn: e.target.value,
                });
              }}
              label="Run AI Assist with text"
            >
                {(this.props.inValue!=="" ? <MenuItem value="infield">from input field</MenuItem> : null)}
              <MenuItem value="previewpage">from preview page</MenuItem>
              <MenuItem value="none">command prompt only</MenuItem>
            </Select>
          </FormControl>

          <TextField
              className={classes.textfield}
            fullWidth
            id="standard-full-width"
            label="Command Prompt"
            value={this.state.commandPrompt}
              multiline
            variant="outlined"
              onChange={(e)=>{
                this.setState({commandPrompt: e.target.value});
              }}
          />
        </Box>

        <Box my={0} sx={{display:'flex'}}>
            <Button className={classes.keyButton} onClick={()=>{this.sendToAssistent()}} disabled={this.state.assistendReady} color="primary" variant="contained">Send prompt to AI assistent</Button>
        </Box>

        <Box my={3} sx={{display:'flex'}}>
          <TextField
            fullWidth
            className={classes.textfield}
            readOnly
            id="standard-full-width"
            label="Result Text"
            value={(this.state.result !=="" ? this.state.result : "empty")}
            variant="outlined"
          />
        </Box>

        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{
            this.setState({dialogOpen: false})
          }}>
            Cancel
          </Button>
          <Button onClick={()=>{
            this.setState({dialogOpen: false})
          }}>
           Replace text
          </Button>
          <Button onClick={()=>{
            this.setState({dialogOpen: false})
          }}>
           Append text
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

export default withStyles(useStyles)(AiAssist);
