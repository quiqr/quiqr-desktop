import React from 'react';
import service from './../../services/service';
import Typography from '@material-ui/core/Typography';
import TextField           from '@material-ui/core/TextField';

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

  componentDidMount(){

    //service.registerListener(this);
    service.api.readConfKey('prefs').then((value)=>{
      this.setState({prefs: value });

      if(value.customOpenInCommand){
        this.setState({customOpenInCommand: value.customOpenInCommand });
      }
      else{
        this.setState({customOpenInCommand: "" });
      }

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
            helperText="Command to open directory in. E.g. /usr/bin/terminal -o %s"
            variant="outlined"
            className={classes.textfield}
            value={this.state.customOpenInCommand}
            onChange={(e)=>{
              this.setState({customOpenInCommand: e.target.value });
              service.api.saveConfPrefKey("customOpenInCommand",e.target.value);
            }}
          />

        </div>
      </div>
    );
  }

}

export default withStyles(useStyles)(PrefsAdvanced);
