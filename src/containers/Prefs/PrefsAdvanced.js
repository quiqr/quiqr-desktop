import React          from 'react';
import service        from './../../services/service';
import Typography     from '@material-ui/core/Typography';
import TextField      from '@material-ui/core/TextField';

import { withStyles } from '@material-ui/core/styles';

const useStyles = theme => ({

  container:{
    padding: '20px',
    height: '100%'
  },

  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textfield: {
    margin: theme.spacing(1),
  },


});

class PrefsAdvanced extends React.Component {

  history: any;

  constructor(props){
    super(props);
    this.state = {
      prefs : {}
    };
  }

  setStringPrefToState(prefKey, value){
    if(value[prefKey]){
      this.setState({[prefKey]: value[prefKey] });
    }
    else{
      this.setState({[prefKey]: "" });
    }
  }

  componentDidMount(){

    //service.registerListener(this);
    service.api.readConfKey('prefs').then((value)=>{
      this.setState({prefs: value });

      this.setStringPrefToState('systemGitBinPath',value)
      this.setStringPrefToState('openAiApiKey',value)
      this.setStringPrefToState('customOpenInCommand',value)

      /*
      if(value.customOpenInCommand){
        this.setState({customOpenInCommand: value.customOpenInCommand });
      }
      else{
        this.setState({customOpenInCommand: "" });
      }
      */

    });
  }

  componentWillUnmount(){
    //service.unregisterListener(this);
  }

  render(){
    const { classes } = this.props;
    return (
      <div className={ this.props.classes.container }>
        <Typography variant="h4">Advanced Preferences</Typography>

        <div className={classes.root}>
          <TextField
            id="openInCommand"
            label="Custom open-in-command"
            helperText='Command to open directory in. E.g. alacritty --title "%site_name" --working-directory "%site_path"'
            variant="outlined"
            className={classes.textfield}
            value={this.state.customOpenInCommand}
            onChange={(e)=>{
              this.setState({customOpenInCommand: e.target.value });
              service.api.saveConfPrefKey("customOpenInCommand",e.target.value);
            }}
          />

        </div>

        <div className={classes.root}>
          <TextField
            id="openAiApiKey"
            label="openAiApikey"
            helperText='Enter API key to enable AI services. Translate texts, create meta summaries, etc..'
            variant="outlined"
            className={classes.textfield}
            value={this.state.openAiApiKey}
            onChange={(e)=>{
              this.setState({openAiApiKey: e.target.value });
              service.api.saveConfPrefKey("openAiApiKey",e.target.value);
            }}
          />

        </div>


        <div className={classes.root}>
          <TextField
            id="gitBinary"
            label="Path to git binary"
            helperText='providing a path to a installed version of git enables the real git sync target'
            variant="outlined"
            className={classes.textfield}
            value={this.state.systemGitBinPath}
            onChange={(e)=>{
              this.setState({systemGitBinPath: e.target.value });
              service.api.saveConfPrefKey("systemGitBinPath",e.target.value);
            }}
          />

        </div>

      </div>
    );
  }

}

export default withStyles(useStyles)(PrefsAdvanced);
