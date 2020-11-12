import * as React from 'react';
import Spinner from './../../components/Spinner'
import { Dialog, FlatButton } from 'material-ui';

type DeleteItemKeyDialogProps = {
  busy: bool,
  itemLabel: string,
  handleClose: ()=> void,
  handleConfirm: (string)=> void
}

type DeleteItemKeyDialogState = {
  value:string,
  valid: ?bool
}

class DeleteItemKeyDialog extends React.Component<DeleteItemKeyDialogProps,DeleteItemKeyDialogState>{
  constructor(props : DeleteItemKeyDialogProps){
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
        <FlatButton
        disabled={busy}
        primary={true}
        label="Cancel"
        onClick={this.handleClose.bind(this)} />,
        <FlatButton
        disabled={busy}
        primary={true}
        label="Delete"
        onClick={this.handleConfirm.bind(this)}  />
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
