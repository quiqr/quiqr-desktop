import { useState } from 'react';
import Spinner from './../../../components/Spinner';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

interface EditItemKeyDialogProps {
  value: string;
  viewKey?: string;
  busy?: boolean;
  confirmLabel: string;
  title: string;
  textfieldlabel: string;
  handleClose?: () => void;
  handleConfirm?: (titleToKey?: string, value?: string) => void;
}

function getInitialValue(propValue: string) {
  if (propValue.indexOf('.') > -1) {
    return propValue.slice(0, propValue.lastIndexOf('.'));
  }
  return propValue || '';
}

function EditItemKeyDialog({
  value: propValue,
  viewKey,
  busy,
  confirmLabel,
  title,
  textfieldlabel,
  handleClose,
  handleConfirm,
}: EditItemKeyDialogProps) {
  const initialValue = propValue || '';
  const [value, setValue] = useState(getInitialValue(propValue));
  const [titleToKey, setTitleToKey] = useState<string>('');

  const validate = () => {
    const v = value || '';
    if (viewKey === 'createItem') {
      return v.length > 0;
    }
    return /^[a-zA-Z0-9_-]+([/][a-zA-Z0-9_-]+)*$/.test(v) && v.length > 0;
  };

  const valid = validate();
  const isCreateItem = viewKey === 'createItem';
  const errorText = isCreateItem ? '' : 'Allowed characters: alphanumeric, dash, underline and slash.';

  const onClose = () => {
    if (handleClose && !busy) {
      handleClose();
    }
  };

  const onConfirm = () => {
    if (!valid || !handleConfirm) return;

    if (isCreateItem) {
      handleConfirm(titleToKey, value);
    } else {
      handleConfirm(value, initialValue);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    setValue(e.target.value);
    setTitleToKey(key);
  };

  return (
    <Dialog fullWidth={true} maxWidth="sm" open={true} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          <TextField
            label={textfieldlabel}
            value={value}
            error={!valid}
            helperText={valid ? undefined : errorText}
            disabled={busy}
            onChange={onChange}
            fullWidth={true}
          />
          <br />
          <br />
          {isCreateItem && (
            <TextField helperText="item key" value={titleToKey} fullWidth={true} disabled={true} />
          )}
          {busy && <Spinner />}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button disabled={busy || !valid} onClick={onConfirm} color="primary">
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditItemKeyDialog;
