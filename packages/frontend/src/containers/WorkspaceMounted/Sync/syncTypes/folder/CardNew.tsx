import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';

interface CardNewProps {
  handleClick: () => void;
  classes?: {
    paper?: string;
    [key: string]: unknown;
  };
}

function CardNew({ handleClick, classes }: CardNewProps) {
  return (
    <Paper
      onClick={handleClick}
      className={classes?.paper}
      sx={{ cursor: 'pointer', padding: 2 }}
      elevation={5}
    >
      <Box display="flex" alignItems="center" justifyContent="center" height={63}>
        <FolderIcon fontSize="large" />
      </Box>
      <Box display="flex" alignItems="center" justifyContent="center">
        <Typography variant="h5">Folder Target</Typography>
      </Box>
      <Box display="flex" textAlign="center">
        <Typography variant="body2">Sync to folder on local filesystem</Typography>
      </Box>
    </Paper>
  );
}

export default CardNew;


