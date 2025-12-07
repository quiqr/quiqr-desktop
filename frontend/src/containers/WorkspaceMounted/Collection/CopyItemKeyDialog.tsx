import * as React from 'react';
import Spinner from './../../../components/Spinner'
import TextField  from '@mui/material/TextField';
import Button from '@mui/material/Button';
import DialogTitle       from '@mui/material/DialogTitle';
import Dialog            from '@mui/material/Dialog';
import DialogActions     from '@mui/material/DialogActions';
import DialogContent     from '@mui/material/DialogContent';

interface CopyItemKeyDialogProps {
  value: string;
  viewKey?: string;
  busy?: boolean;
  confirmLabel: string;
  title: string;
  textfieldlabel: string;
  handleClose?: () => void;
  handleConfirm?: (titleToKey?: string, value?: string) => void;
}

interface CopyItemKeyDialogState {
  value: string;
  initialValue: string;
  valid: boolean | null;
  titleToKey?: string;
}

class CopyItemKeyDialog extends React.Component<CopyItemKeyDialogProps, CopyItemKeyDialogState>{

  constructor(props ){
    super(props);

    let valueBase = props.value
    if (valueBase.indexOf('.') > -1)
    {
      valueBase = props.value.slice(0,(props.value.lastIndexOf(".") ));
    }
    this.state = {
      value:valueBase||'',
      initialValue:props.value||'',
      valid: null
    };
  }

  handleClose(){
    if(this.props.handleClose && !this.props.busy)
      this.props.handleClose();
  }

  handleConfirm(){

    if(this.props.viewKey === 'createItem'){
      if(this.validate() && this.props.handleConfirm) {
        this.props.handleConfirm(this.state.titleToKey, this.state.value);
      }
    }
    else{
      if(this.validate() && this.props.handleConfirm) {
        this.props.handleConfirm(this.state.value, this.state.initialValue);
      }

    }
  }

  validate(){
    const value = this.state.value||'';

    if(this.props.viewKey === 'createItem'){
      return value.length>0;
    }
    else{
      return /^[a-zA-Z0-9_-]+([/][a-zA-Z0-9_-]+)*$/.test(value) && value.length>0;
    }
  }

  handleChange(e){
    const key  = e.target.value.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    this.setState({
      value: e.target.value,
      titleToKey: key
    });
  }

  render(){
    const { busy, confirmLabel } = this.props;
    const valid = this.validate();
    let errorText;
    errorText = 'Allowed characters: alphanumeric, dash, underline and slash.';
    return (

      <Dialog
        fullWidth={true}
        maxWidth="sm"
        open={true}
        onClose={this.handleClose}
      >
        <DialogTitle>{this.props.title}</DialogTitle>
        <DialogContent>

        <TextField
          label={this.props.textfieldlabel}
          value={this.state.value}
          error={valid ? false : true}
          helperText={valid? undefined : errorText}
          disabled={busy}
          onChange={this.handleChange.bind(this)}
          fullWidth={true}
        />
        <br/>
        <br/>

        { busy? <Spinner /> : undefined }

        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={this.handleClose.bind(this)} color="primary">Cancel</Button>
          <Button disabled={busy||!valid} onClick={this.handleConfirm.bind(this)} color="primary">{confirmLabel}</Button>
        </DialogActions>

      </Dialog>

    );
  }
}
export default CopyItemKeyDialog
