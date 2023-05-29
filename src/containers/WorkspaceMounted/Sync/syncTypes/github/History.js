import * as React              from 'react';
import { withStyles }          from '@material-ui/core/styles';
import Box                     from '@material-ui/core/Box';
import Paper                   from '@material-ui/core/Paper';
import Button                  from '@material-ui/core/Button';
import ArrowUpwardIcon         from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon       from '@material-ui/icons/ArrowDownward';
import Typography              from '@material-ui/core/Typography';
import Timeline                from '@material-ui/lab/Timeline';
import TimelineItem            from '@material-ui/lab/TimelineItem';
import TimelineSeparator       from '@material-ui/lab/TimelineSeparator';
import TimelineConnector       from '@material-ui/lab/TimelineConnector';
import TimelineContent         from '@material-ui/lab/TimelineContent';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import TimelineDot             from '@material-ui/lab/TimelineDot';
import LaptopMacIcon           from '@material-ui/icons/LaptopMac';
import NewReleasesIcon         from '@material-ui/icons/NewReleases';
import CloudIcon               from '@material-ui/icons/Cloud';
import CloudUploadIcon         from '@material-ui/icons/CloudUpload';
import CloudDownloadIcon       from '@material-ui/icons/CloudDownload';
import SaveAltIcon             from '@material-ui/icons/SaveAlt';
import RefreshIcon             from '@material-ui/icons/Refresh';

const useStyles = theme => ({
});

class History extends React.Component{

  refreshRemoteStatus(){

  }

  render(){

    let lastStatusCheck = "10 minutes ago";
    let unpushedChanges = true;
    let remoteDiffers = true;

    let historyArr = [
      {
        author: "pim <post@pimsnel.com>",
        date: "thu dec 15 18:31:02 2022 +0100",
        client: "quiqr-desktop v14.5",
        os: "linux",
        ref: "072ae8b6fd2cc36b1554e9ef663e83f498f7b826",
        local: false,
        message: "publication by pim@ojs+linux+5.15.82+quiqr-desktop-app-0.14.5",
      },
      {
        author: "laura <l.van.dijk@waardenburg.eco>",
        date: "thu dec 15 18:31:02 2022 +0100",
        client: "quiqr-desktop v14.5",
        os: "macos",
        ref: "887c1b20ff9c544b91491cc98b4597d3ffcc58ad",
        remote: false,
        local: true,
        message: "publication by laura@laura-van-dijk-macbook-pro+darwin+21.6.0+quiqr-desktop-app-0.14.5",
      },
      {
        author: "pim <post@pimsnel.com>",
        date: "thu dec 15 18:31:02 2022 +0100",
        client: "quiqr-desktop v14.5",
        os: "linux",
        ref: "072ae8b6fd2cc36b1554e9ef663e83f498f7b826",
        local: true,
        message: "publication by pim@ojs+linux+5.15.82+quiqr-desktop-app-0.14.5",
      },
      {
        author: "laura <l.van.dijk@waardenburg.eco>",
        date: "thu dec 15 18:31:02 2022 +0100",
        client: "quiqr-desktop v14.5",
        os: "macos",
        ref: "887c1b20ff9c544b91491cc98b4597d3ffcc58ad",
        remote: false,
        local: true,
        message: "publication by laura@laura-van-dijk-macbook-pro+darwin+21.6.0+quiqr-desktop-app-0.14.5",
      },
    ]

    return (
      <React.Fragment>

        <Box component="div"
          m={1}
          style={{
            display:'flex',
            justifyContent: 'flex-end',
          }}>
          <Box component="div" p={1}>
            <Typography variant="body2" color="textSecondary">
              Last history refresh: {lastStatusCheck}
            </Typography>
          </Box>

          <Button
            onClick={()=>{
              this.refreshRemoteStatus()
            }}
            size="small"
            variant="contained"
            color="default"
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>

        <Timeline xalign="alternate">

          <TimelineItem>
            <TimelineOppositeContent>
              <Paper elevation={3}>
                <Box sx={{p:1}}>
                  <Typography variant="h6" component="h1">
                    There are unpublished local changes.
                  </Typography>

                  { this.props.enableSyncTo ?
                    <Box py={1}>

                      <Button
                        onClick={()=>{

                        }}
                        style={{marginRight:'5px'}}
                        size="small"
                        variant="contained"
                        color={remoteDiffers ? "secondary" : "primary"}
                        startIcon={<ArrowUpwardIcon />}
                      >
                        Push to Remote
                      </Button>

                      <Button
                        onClick={()=>{

                        }}
                        style={{marginRight:'5px'}}
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<SaveAltIcon />}
                      >
                        Local Commit
                      </Button>

                    </Box>:null}

                </Box>
              </Paper>

            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot color="secondary">
                <NewReleasesIcon />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
            </TimelineContent>
          </TimelineItem>

          {historyArr.map((item, index)=>{

            let content = (
              <Paper elevation={3}>
                <Box p={2}>
                  <Typography variant="h6" component="h1">
                    {item.message.split("+")[0]}
                  </Typography>
                  <Typography>Author: {item.author}</Typography>
                  <Typography>Date: {item.date}</Typography>
                  <Typography>Ref: {item.ref.substr(0,7)}</Typography>
                  { this.props.enableSyncFrom ?
                  <Box py={1}>
                    {
                      item.local ? null :
                        <Button
                          onClick={()=>{

                          }}
                          style={{marginRight:'5px'}}
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<ArrowDownwardIcon />}
                        >
                          Try merge
                        </Button>

                    }
                    <Button
                      onClick={()=>{

                      }}
                      style={{marginRight:'5px'}}
                      size="small"
                      variant="contained"
                      color="secondary"
                      startIcon={<ArrowDownwardIcon />}
                    >
                      Checkout this version
                    </Button>

                  </Box>
                  :null}
                </Box>
              </Paper>

            )

            return (
              <TimelineItem key={"timeline"+index}>
                <TimelineOppositeContent>
                  {item.local ? content : null}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot
                    color={item.local ? "primary" : "secondary"}
                  >
                    {/*item.local ? <LaptopMacIcon /> : <CloudIcon/>*/}
                    <CloudUploadIcon />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  {item.local ? null : content}
                </TimelineContent>
              </TimelineItem>
            )
          })}


        </Timeline>
        <Box py={1} variant="div"
          style={{
            display:'flex',
            justifyContent: 'center',
          }}>

          <Button
            onClick={()=>{

            }}
            style={{marginRight:'5px'}}
            size="small"
            variant="contained"
            color="default"
            startIcon={<RefreshIcon />}
          >
            Load More
          </Button>

        </Box>

      </React.Fragment>
    )
  }

}

export default withStyles(useStyles)(History);


