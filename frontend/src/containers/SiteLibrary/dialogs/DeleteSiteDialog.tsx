import * as React           from 'react';
import Button               from '@mui/material/Button';
import Box                  from '@mui/material/Box';
import Dialog               from '@mui/material/Dialog';
import DialogActions        from '@mui/material/DialogActions';
import DialogContent        from '@mui/material/DialogContent';
import DialogContentText    from '@mui/material/DialogContentText';
import DialogTitle          from '@mui/material/DialogTitle';
import { SiteConfig } from '../../../../types';

interface DeleteSiteDialogProps {
  open: boolean;
  siteconf: SiteConfig;
  onCancelClick: () => void;
  onDelete: (key: string) => void;
}

class DeleteSiteDialog extends React.Component<DeleteSiteDialogProps>{

  render(){

    let { open, siteconf } = this.props;

    return (
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={true}
        maxWidth={"sm"} >

        <DialogTitle id="alert-dialog-title">{"Edit site name: "+siteconf.name}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Box>
              <p>Are you sure you want to delete {siteconf.name} ?</p>

              <p>This cannot be undone.</p>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{ this.props.onCancelClick(); }}>
            Cancel
          </Button>
          <Button onClick={()=>this.props.onDelete(siteconf.key)} >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
export default DeleteSiteDialog;
