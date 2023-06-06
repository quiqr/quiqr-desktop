import * as React       from 'react';
import Button       from '@material-ui/core/Button';
import TextField       from '@material-ui/core/TextField';

export default class FolderPicker extends React.Component{

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
          readOnly fullWidth
          variant="outlined"
          value={selectedFolder||''}
          label={label}
          onClick={this.handleTextFieldClick.bind(this)}
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
