import React             from 'react';
import Divider           from '@material-ui/core/Divider';
import Box               from '@material-ui/core/Box';
import Typography        from '@material-ui/core/Typography';
import Button            from '@material-ui/core/Button';
import Link              from '@material-ui/core/Link';
import { withStyles }    from '@material-ui/core/styles';
import SettingsIcon      from '@material-ui/icons/Settings';
import ArrowUpwardIcon   from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';

import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import TimelineDot from '@material-ui/lab/TimelineDot';

import FastfoodIcon from '@material-ui/icons/Fastfood';
import LaptopMacIcon from '@material-ui/icons/LaptopMac';
import HotelIcon from '@material-ui/icons/Hotel';
import RepeatIcon from '@material-ui/icons/Repeat';

import Paper from '@material-ui/core/Paper';

import RefreshIcon from '@material-ui/icons/Refresh';

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
  paper: {
    padding: '6px 16px',
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

    let steps = ['Select campaign settings', 'Create an ad group', 'Create an ad']
    let activeStep = 0;

    const classes = useStyles();
    return (
      <React.Fragment>
        <Box component="div" style={{
          position:'absolute',
          top: '0px',
          left: '280px',
          right: '0px',
          backgroundColor: 'white',
          zIndex: 2,
        }}>

          <Box component="div" style={{
            display:'flex',
          }} m={2}>

            <Box component="span">
              {this.props.serviceLogo}
            </Box>
            <Box component="span" style={{flexGrow:1}}>
              <Typography>{this.props.title}</Typography>
              <Link component="button" variant="body2"
                onClick={()=>{
                  window.require('electron').shell.openExternal(this.props.repoAdminUrl);
                }}
              >
                {this.props.repoAdminUrl}
              </Link>

            </Box>
            <Box component="span" >
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
        </Box>

        {/*
        <Box component="div"
          m={1}
          style={{
            display:'flex',
            justifyContent: 'flex-end',
            marginTop:'135px'
          }}>
          <Button
            onClick={()=>{this.props.onConfigure()}}
            size="small"
            variant="contained"
            color="default"
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>

        <Timeline align="alternate">
          <TimelineItem>
            <TimelineOppositeContent>
              <Typography variant="body2" color="textSecondary">
                9:30 am
              </Typography>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot>
                <FastfoodIcon />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Paper elevation={3}>
                <Typography variant="h6" component="h1">
                  Eat
                </Typography>
                <Typography>Because you need strength</Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineOppositeContent>
              <Typography variant="body2" color="textSecondary">
                10:00 am
              </Typography>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="primary">
                <LaptopMacIcon />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Paper elevation={3}>
                <Typography variant="h6" component="h1">
                  Code
                </Typography>
                <Typography>Because it&apos;s awesome!</Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color="primary" variant="outlined">
                <HotelIcon />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Paper elevation={3}>
                <Typography variant="h6" component="h1">
                  Sleep
                </Typography>
                <Typography>Because you need rest</Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color="secondary">
                <RepeatIcon />
              </TimelineDot>
            </TimelineSeparator>
            <TimelineContent>
              <Paper elevation={3}>
                <Typography variant="h6" component="h1">
                  Repeat
                </Typography>
                <Typography>Because this is the life you love!</Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem>
            <TimelineOppositeContent>
              <Typography variant="body2" color="textSecondary">
                9:30 am
              </Typography>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot>
                <FastfoodIcon />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Paper elevation={3}>
                <Typography variant="h6" component="h1">
                  Eat
                </Typography>
                <Typography>Because you need strength</Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineOppositeContent>
              <Typography variant="body2" color="textSecondary">
                10:00 am
              </Typography>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="primary">
                <LaptopMacIcon />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Paper elevation={3}>
                <Typography variant="h6" component="h1">
                  Code
                </Typography>
                <Typography>Because it&apos;s awesome!</Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color="primary" variant="outlined">
                <HotelIcon />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Paper elevation={3}>
                <Typography variant="h6" component="h1">
                  Sleep
                </Typography>
                <Typography>Because you need rest</Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color="secondary">
                <RepeatIcon />
              </TimelineDot>
            </TimelineSeparator>
            <TimelineContent>
              <Paper elevation={3}>
                <Typography variant="h6" component="h1">
                  Repeat
                </Typography>
                <Typography>Because this is the life you love!</Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
       */}

      </React.Fragment>
    );
  }
}

export default withStyles(useStyles)(MainPublishPage);

