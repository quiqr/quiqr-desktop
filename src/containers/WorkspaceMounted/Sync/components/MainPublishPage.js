import React from 'react';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import { withStyles } from '@material-ui/core/styles';
import SettingsIcon from '@material-ui/icons/Settings';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

const useStyles = theme => ({
  root: {
    margin: 20,
    maxWidth: 545,
  },
  logo:{
    alignItems: 'center',
    width: "100%",
    backgroundColor: '#ccc',
    justifyContent: 'center',
    height: 100,
    padding: 30,
    '&> svg': {
    }
  },
  media: {
  },
});

class MainPublishPage extends React.Component {

  constructor(props){
    super(props);
    this.state = {
    };
  }

  render(){

    return (
      <React.Fragment>
        <Box component="div" style={{
          display:'flex',
          alignItems: 'flex-start'
          }} m={2}>

          <Box component="span">
            {this.props.serviceLogo}
          </Box>
          <Box component="span" style={{flexGrow:1}}>
            <Typography>{this.props.title}</Typography>
            {this.props.repoAdminUrl?
            <Link component="button" variant="body2"
              onClick={()=>{
                window.require('electron').shell.openExternal(this.props.repoAdminUrl);
              }}
            >
              {this.props.repoAdminUrl}
            </Link>:null}

          </Box>
          <Box component="span" xstyle={{padding:'6px'}}>
            <Button
              onClick={()=>{this.props.onConfigure()}}
              size="small"
              variant="contained"
              color="default"
              startIcon={<SettingsIcon />}
            >
              Configure
            </Button>
          </Box>

        </Box>

        <Box component="div" style={{
          display:'flex',
          alignItems: 'flex-start'
          }} m={2}>

          { this.props.enableSyncTo ?
            <Button
              onClick={()=>{this.props.onPublish()}}
              style={{marginRight:'5px'}}
              size="small"
              variant="contained"
              color="primary"
              startIcon={<ArrowUpwardIcon />}
            >
              {this.props.syncToText}
            </Button>
            :null
          }

          { this.props.enableSyncFrom ?
            <Button
              onClick={()=>{this.props.onMerge()}}
              size="small"
              variant="contained"
              color="primary"
              startIcon={<ArrowDownwardIcon />}
            >
              {this.props.syncFromText}
            </Button>
            :null
          }
        </Box>

        <Divider/>

        {this.props.history}

      </React.Fragment>
    );
  }
}

export default withStyles(useStyles)(MainPublishPage);

