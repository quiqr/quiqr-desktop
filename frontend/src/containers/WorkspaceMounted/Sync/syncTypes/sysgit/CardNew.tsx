import * as React          from 'react';
import Box                 from '@mui/material/Box';
import Paper               from '@mui/material/Paper';
import Typography          from '@mui/material/Typography';
import GitHubIcon          from '@mui/icons-material/GitHub';

interface CardNewProps {
  handleClick: () => void;
  classes?: {
    paper?: string;
    [key: string]: unknown;
  };
}

class CardNew extends React.Component<CardNewProps> {

  render(){
    return (
      <Paper
        onClick={()=>{
          this.props.handleClick();
        }}
        className={this.props.classes?.paper}
        sx={{ cursor: 'pointer', padding: 2 }}
        elevation={5}
      >
        <Box display="flex" alignItems="center" justifyContent="center" height={63}>
          <GitHubIcon fontSize="large" />
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center" >
          <Typography variant="h5">Git Target</Typography>
        </Box>
        <Box display="flex" textAlign="center">
          <Typography variant="body2">Sync with git server using system git binary</Typography>
        </Box>


      </Paper>
    )
  }

}

export default CardNew;


