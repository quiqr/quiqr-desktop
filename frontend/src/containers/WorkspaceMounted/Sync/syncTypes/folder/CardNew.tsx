import * as React          from 'react';
import Box                 from '@mui/material/Box';
import Paper               from '@mui/material/Paper';
import Typography          from '@mui/material/Typography';
import FolderIcon          from '@mui/icons-material/Folder';

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
        <Box display="flex" alignItems="center"  justifyContent="center" height={63}>
          <FolderIcon fontSize="large" />
        </Box>
        <Box display="flex" alignItems="center"  justifyContent="center" >
          <Typography variant="h5">Folder Target</Typography>
        </Box>
        <Box display="flex" textAlign="center">
          <Typography variant="p">Sync to folder on local filesystem</Typography>
        </Box>
      </Paper>
    )
  }

}

export default CardNew;


