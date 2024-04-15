import * as React          from 'react';
import { withStyles }      from '@material-ui/core/styles';
import Box                 from '@material-ui/core/Box';
import Paper               from '@material-ui/core/Paper';
import Typography          from '@material-ui/core/Typography';
import GitHubIcon          from '@material-ui/icons/GitHub';

const useStyles = theme => ({
});

class CardNew extends React.Component{

  render(){
    return (
      <Paper
        onClick={()=>{
          this.props.handleClick();
        }}
        className={this.props.classes.paper}
        elevation={5}
      >
        <Box display="flex" alignItems="center" justifyContent="center" height={63}>
          <GitHubIcon fontSize="large" />
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center" >
          <Typography variant="h5">Git Target</Typography>
        </Box>
        <Box display="flex" textAlign="center">
          <Typography variant="p">Sync with git server using system git binary</Typography>
        </Box>


      </Paper>
    )
  }

}

export default withStyles(useStyles)(CardNew);


