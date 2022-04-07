import * as React       from 'react';
import { RaisedButton } from 'material-ui-02';
import TextField2       from '@material-ui/core/TextField';
//import service          from '../services/service';

type FolderPickerProps = {
    onFolderSelected: (folder: ?string)=> void,
    selectedFolder: ?string,
    label: string
}

type FolderPickerState = {

}

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
        let { selectedFolder, label } = this.props;

        return (
            <div style={{display:'flex' }}>
                <TextField2
                    readOnly fullWidth
                    value={selectedFolder||''}
                    floatingLabelText={label}
                    floatingLabelFixed
                    onClick={this.handleTextFieldClick.bind(this)}
                    style={{flex:'1 0 500px',  flexDirection: 'row'}} />
                <RaisedButton
                    onClick={this.handlePickFileClick.bind(this) }
                    style={{flex:'140px 0 0', alignSelf: 'flex-end', marginLeft: '8px', marginBottom:'8px'}}
                    label="Pick Folder" />
            </div>
        )
    }
}
