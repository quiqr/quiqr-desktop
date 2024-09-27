import * as React        from 'react';
import Spinner           from './../../../components/Spinner'
import TextField         from '@material-ui/core/TextField';
import Button            from '@material-ui/core/Button';
import DialogTitle       from '@material-ui/core/DialogTitle';
import Dialog            from '@material-ui/core/Dialog';
import DialogActions     from '@material-ui/core/DialogActions';
import DialogContent     from '@material-ui/core/DialogContent';
import Select            from '@material-ui/core/Select';
import MenuItem          from '@material-ui/core/MenuItem';
import Box               from '@material-ui/core/Box';

class CopyItemToLanguageDialog extends React.Component{

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
      destLang: '',
      valid: null
    };
  }

  handleClose(){
    if(this.props.handleClose && !this.props.busy)
      this.props.handleClose();
  }

  handleConfirm(){
    if(this.validate() && this.props.handleConfirm) {
      this.props.handleConfirm(this.state.value, this.state.initialValue, this.state.destLang);
    }
  }

  validate(){
    let value = this.state.value||'';

    if(this.props.viewKey === 'createItem'){
      return value.length>0;
    }
    else{
      return /^[a-zA-Z0-9_-]+([/][a-zA-Z0-9_-]+)*$/.test(value) && value.length>0;
    }
  }

  handleChange(e){
    let key  = e.target.value.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    this.setState({
      value: e.target.value,
      titleToKey: key
    });
  }

  render(){
    let { busy, confirmLabel } = this.props;
    let valid = this.validate();
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
        <Box my={3} sx={{display:'flex'}}>

            <Select
              labelId="demo-simple-select-outlined-label"
              id="destLang"
              value={this.state.destLang}
              onChange={(e)=>{

                this.setState({destLang: e.target.value})

              }}
              label="Destination Language"
            >
              {
                this.props.languages.map((lang)=>{
                  return (<MenuItem key={"key"+lang.lang} value={lang.lang}>{lang.lang}</MenuItem>)
                })
              }
            </Select>
        { busy? <Spinner /> : undefined }

        </Box>


        <Box my={3} sx={{display:'flex'}}>
        <TextField
          label={this.props.textfieldlabel}
          value={this.state.value}
          error={valid ? false : true}
          helperText={valid? undefined : errorText}
          disabled={busy}
          fullWidth={true}
        />
        </Box>



        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={this.handleClose.bind(this)} color="primary">Cancel</Button>
          <Button disabled={busy||!valid} onClick={this.handleConfirm.bind(this)} color="primary">{confirmLabel}</Button>
        </DialogActions>

      </Dialog>

    );
  }
}
export default CopyItemToLanguageDialog
