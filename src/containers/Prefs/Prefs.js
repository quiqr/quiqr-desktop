import React from 'react';
import service from './../../services/service';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';
import FolderPicker from '../../components/FolderPicker';

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

class Prefs extends React.Component {

  history: any;

  constructor(props){
    super(props);
    this.state = {
      prefs : {}
    };
  }

  componentDidMount(){

    service.registerListener(this);
    service.api.readConfKey('prefs').then((value)=>{
      this.setState({prefs: value });

      if(value.dataFolder){
        this.setState({prefsDataFolder: value.dataFolder });
      }
      else{
        this.setState({prefsDataFolder: "~/Quiqr Data" });
      }

    });
  }

  componentWillUnmount(){
    service.unregisterListener(this);
  }

  handleFolderSelected(folder){
    service.api.saveConfPrefKey("dataFolder",folder);
    this.setState({prefsDataFolder: folder });
  }

  render(){
    const { classes } = this.props;
    /*
    const model = {
      folderPath: "~/QuiqrData",
      theme: ""
    };
    */
    return (
      <div className={ this.props.classes.container }>
        <Typography variant="h4">General Preferences</Typography>

        <div className={classes.root}>

          <div style={{marginTop:"20px"}}>
            <FolderPicker
            label="Quiqr Data Folder"
            selectedFolder={this.state.prefsDataFolder}
            onFolderSelected={(e)=>{this.handleFolderSelected(e)}} />
          </div>

        </div>
      </div>
    );
  }

}

export default withStyles(useStyles)(Prefs);
