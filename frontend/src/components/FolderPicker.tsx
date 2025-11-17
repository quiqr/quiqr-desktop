import * as React       from 'react';
import Button       from '@mui/material/Button';
import TextField       from '@mui/material/TextField';

interface FolderPickerProps {
  selectedFolder?: string | null;
  label?: string;
  outlined?: boolean;
  onFolderSelected: (folder: string | null) => void;
}

interface FolderPickerState {}

export default class FolderPicker extends React.Component<FolderPickerProps, FolderPickerState>{

  handlePickFileClick(){
    this.openPicker();
  }

  handleTextFieldClick(){
    this.openPicker();
  }

  openPicker(){
    let { remote } = window.require('electron');

    remote.dialog.showOpenDialog(
      remote.getCurrentWindow(),
      { properties: ['openDirectory']}
    ).then( (result)=> {
      let selectedFolder = (result.filePaths||[])[0];
      this.props.onFolderSelected(selectedFolder||null);
    }).catch( (err) => {

    });


  }

  render(){
    let { selectedFolder, label, outlined } = this.props;

    if(outlined){

    }
    else{

    }

    return (
      <div style={{display:'flex' }}>
        <TextField
          fullWidth
          variant="outlined"
          value={selectedFolder||''}
          label={label}
          onClick={this.handleTextFieldClick.bind(this)}
          InputProps={{ readOnly: true }}
          style={{flex:'1 0 500px',  flexDirection: 'row'}} />
        <Button
          variant="contained"
          onClick={this.handlePickFileClick.bind(this) }
          style={{flex:'140px 0 0', alignSelf: 'flex-end', marginLeft: '8px', marginBottom:'8px'}}
        >
          Pick Folder
        </Button>
      </div>
    )
  }
}
