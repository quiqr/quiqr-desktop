import React from 'react';
import AiIcon   from '@material-ui/icons/Memory';
import IconButton from '@material-ui/core/IconButton';
import Button            from '@material-ui/core/Button';
import service           from '../services/service';
import TextField            from '@material-ui/core/TextField';
import Box                  from '@material-ui/core/Box';
import Dialog               from '@material-ui/core/Dialog';
import DialogActions        from '@material-ui/core/DialogActions';
import DialogContent        from '@material-ui/core/DialogContent';
import DialogTitle          from '@material-ui/core/DialogTitle';
import FormControl         from '@material-ui/core/FormControl';
import MenuItem            from '@material-ui/core/MenuItem';
import Select              from '@material-ui/core/Select';
import InputLabel          from '@material-ui/core/InputLabel';
import { withStyles }      from '@material-ui/core/styles';

import OpenAI from 'openai';


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
      result:"",
      runOn:"",
      commandPrompt:"",
      webpage:"",
      assistendNotReady: true,
      formNotReady: true,
    }
  }
  checkAssistentReady(){
    if(this.state.commandPrompt!==""){
      if(this.state.runOn==="previewpage" && this.state.webpage!==""){
        this.setState({assistendNotReady:false});
      }
      else if(this.state.runOn!=="previewpage"){
        this.setState({assistendNotReady:false});
      }
      else{
        this.setState({assistendNotReady:true});
      }
    }
    else{
      this.setState({assistendNotReady:true});
    }
  }

  genPrompt(){
    if(this.state.commandPrompt===""){
      return "";

    }
    if(this.state.runOn === "none"){
      return this.state.commandPrompt;
    }
    else if(this.state.runOn === "infield"){
      return this.state.commandPrompt + "\nApply this on the following text...\n " + this.props.inValue;
    }
    else if(this.state.runOn === "previewpage"){
      //service.api.logToConsole(this.props.pageUrl);


      return this.state.commandPrompt + "\nApply this on the following text extracted from a webpage...\n " + this.props.inValue;

    }
    return ""
  }

  sendToAssistent() {

    service.api.readConfKey('prefs').then(async (value)=>{

      if(value.openAiApiKey){
        const AIclient = new OpenAI({
          apiKey: value.openAiApiKey,
          dangerouslyAllowBrowser: true
        });

        const content = this.genPrompt();
        //service.api.logToConsole(content);
        if(content!==""){
          const stream = AIclient.beta.chat.completions.stream({
            model: 'gpt-4',
            messages: [{ role: 'user', content: content }],
            stream: true,
          });

          const chatCompletion = await stream.finalChatCompletion();
          if(chatCompletion && chatCompletion.choices.length > 0){
            this.setState({result: chatCompletion.choices[0].message.content});
          }
          else{
            service.api.logToConsole("error");
          }
        }

      }

    });


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
            disabled={this.props.inValue===""}
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
                this.checkAssistentReady();
                this.setState({
                  runOn: e.target.value,
                });

                if(e.target.value === "previewpage"){
                  fetch(this.props.pageUrl)
                    .then( (response) => {
                      switch (response.status) {
                        case 200:
                          return response.text();
                        case 404:
                          throw response;
                        default:
                          throw response;
                      }
                    })
                    .then( (template)=> {
                        this.setState({
                          webpage: template
                        });
                        //service.api.logToConsole(template);
                    })
                    .catch( (response)=> {
                        this.setState({ webpage: "" });
                        //console.log(response);
                      });
                  }


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
                this.checkAssistentReady();
              }}
          />
        </Box>

        <Box my={0} sx={{display:'flex'}}>
            <Button className={classes.keyButton} onClick={()=>{this.sendToAssistent()}} disabled={this.state.assistendNotReady} color="primary" variant="contained">Send prompt to AI assistent</Button>
        </Box>

        <Box my={3} sx={{display:'flex'}}>
          <TextField
            fullWidth
            className={classes.textfield}
            multiline
            id="standard-full-width"
            label="Result Text"
            placeholder="result text"
            //value={(this.state.result !=="" ? this.state.result : "empty")}
            value={this.state.result}
            onChange={(e)=>{
              this.setState({result: e.target.value});
            }}

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
          <Button
            disabled={this.state.result===""}
            onClick={()=>{
              this.props.handleSetAiText(this.props.inValue + " \n" + this.state.result)
              this.setState({dialogOpen: false});
          }}>
           Append text
          </Button>
          <Button
            disabled={this.state.result===""}
            onClick={()=>{
              this.props.handleSetAiText(this.state.result);
              this.setState({dialogOpen: false});
          }}>
           Replace text
          </Button>
        </DialogActions>
      </Dialog>
    )
  };


  handleClick(){
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
          <AiIcon />
        </IconButton>
      </span>
    );
  }
}

export default withStyles(useStyles)(AiAssist);
