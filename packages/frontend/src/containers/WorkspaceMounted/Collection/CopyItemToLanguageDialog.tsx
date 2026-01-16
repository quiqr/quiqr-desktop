import { useState } from 'react';
import Spinner from './../../../components/Spinner';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';

interface Language {
  lang: string;
  [key: string]: unknown;
}

interface CopyItemToLanguageDialogProps {
  value: string;
  viewKey: string;
  handleClose?: () => void;
  handleConfirm?: (value: string, initialValue: string, destLang: string) => void;
  busy?: boolean;
  confirmLabel?: string;
  title?: string;
  textfieldlabel?: string;
  languages: Language[];
}

function getInitialValue(propValue: string) {
  if (propValue.indexOf('.') > -1) {
    return propValue.slice(0, propValue.lastIndexOf('.'));
  }
  return propValue || '';
}

function CopyItemToLanguageDialog({
  value: propValue,
  viewKey,
  handleClose,
  handleConfirm,
  busy,
  confirmLabel,
  title,
  textfieldlabel,
  languages,
}: CopyItemToLanguageDialogProps) {
  const initialValue = propValue || '';
  const [value] = useState(getInitialValue(propValue));
  const [destLang, setDestLang] = useState('');

  const validate = () => {
    const v = value || '';
    if (viewKey === 'createItem') {
      return v.length > 0;
    }
    return /^[a-zA-Z0-9_-]+([/][a-zA-Z0-9_-]+)*$/.test(v) && v.length > 0;
  };

  const valid = validate();
  const errorText = 'Allowed characters: alphanumeric, dash, underline and slash.';

  const onClose = () => {
    if (handleClose && !busy) {
      handleClose();
    }
  };

  const onConfirm = () => {
    if (valid && handleConfirm) {
      handleConfirm(value, initialValue, destLang);
    }
  };

  return (
    <Dialog fullWidth={true} maxWidth="sm" open={true} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box my={3} sx={{ display: 'flex' }}>
          <Select
            labelId="demo-simple-select-outlined-label"
            id="destLang"
            value={destLang}
            onChange={(e) => setDestLang(e.target.value)}
            label="Destination Language"
          >
            {languages.map((lang) => (
              <MenuItem key={'key' + lang.lang} value={lang.lang}>
                {lang.lang}
              </MenuItem>
            ))}
          </Select>
          {busy && <Spinner />}
        </Box>

        <Box my={3} sx={{ display: 'flex' }}>
          <TextField
            label={textfieldlabel}
            value={value}
            error={!valid}
            helperText={valid ? undefined : errorText}
            disabled={busy}
            fullWidth={true}
          />
        </Box>
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

export default CopyItemToLanguageDialog;
