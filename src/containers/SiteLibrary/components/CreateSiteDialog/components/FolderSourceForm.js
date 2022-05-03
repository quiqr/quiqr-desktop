import * as React from 'react';
import FolderPicker from './../../../../../components/FolderPicker';

export default class FolderSourceForm extends React.Component{

  validateModel(model: FolderSourceFormModel){
    let isValid = true;
    if(model.folderPath==null||model.folderPath.trim().length===0){
      isValid = false;
    }
    return isValid;
  }

  updateModel(modelUpdate: {}){
    let data = Object.assign({}, this.props.model, modelUpdate);
    let valid = this.validateModel(data);
    this.props.onFormChange(data, valid);
  }

  handleFolderSelected = (folderPath: ?string) => {
    this.updateModel({folderPath})
  }

  render(){

    let { model={} } = this.props;

    return (<React.Fragment>
      <div>
        <FolderPicker
          label={"Site Folder"}
          selectedFolder={model.folderPath}
          onFolderSelected={this.handleFolderSelected} />
      </div>
    </React.Fragment>)
  }
}
