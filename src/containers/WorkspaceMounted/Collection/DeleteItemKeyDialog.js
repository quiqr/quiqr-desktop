import * as React from 'react';
import Spinner from './../../../components/Spinner'
import { Dialog } from 'material-ui-02';
import Button from '@material-ui/core/Button';

class DeleteItemKeyDialog extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      value:'',
      valid: null
    }
  }

  handleClose(){
    if(this.props.handleClose && !this.props.busy)
      this.props.handleClose();
  }

  handleConfirm(){
    if(this.props.handleConfirm)
      this.props.handleConfirm(this.state.value);
  }

  render(){
    let { busy, itemLabel } = this.props;

    return (
      <Dialog
        title={"Delete Item"}
        modal={true}
        open={true}
        onRequestClose={this.handleClose}
        actions={[
          <Button disabled={busy} onClick={this.handleClose.bind(this)} color="primary">Cancel</Button>,
          <Button disabled={busy} onClick={this.handleConfirm.bind(this)} color="primary">Delete</Button>

        ]}
      >
        {this.state.valid? undefined :
        <p>Do you really want to delete <b>"{itemLabel}"</b>?</p>}

        { busy ? <Spinner /> : undefined }

      </Dialog>
    );
  }
}

export default DeleteItemKeyDialog
