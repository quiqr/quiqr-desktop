import * as React        from 'react';
import FolderIcon from '@material-ui/icons/Folder';
export default class Meta {

  static configDialogTitle = "Folder Export Target";
  static syncingText = "Syncing to folder";

  static sidebarLabel(config){
    return config.path;
  }

  static publishCardObj(config){

    let publishCardObj = {};
    publishCardObj.serviceLogo = <FolderIcon fontSize="medium" style={{marginRight:'6px'}} />
    publishCardObj.title = config.path;
    publishCardObj.liveUrl= '';
    publishCardObj.syncToText = 'Publish to folder';
    publishCardObj.syncFromText = 'Download from folder';

    return publishCardObj;
  }
  static icon(){
    return <FolderIcon />;
  }
}
