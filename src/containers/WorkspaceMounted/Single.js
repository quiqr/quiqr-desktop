import React from 'react';
import service from './../../services/service'
import { snackMessageService } from './../../services/ui-service'
import { SukohForm } from './../../components/SukohForm';
import Spinner from './../../components/Spinner';

class Single extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      selectedWorkspaceDetails: null,
      single: null,
      singleValues: null
    };
  }

  componentDidMount(){
    window.require('electron').ipcRenderer.on('frontEndBusy', ()=>{
      this.setState({showSpinner: true});
    });
    service.registerListener(this);

    var stateUpdate  = {};
    var { siteKey, workspaceKey, singleKey } = this.props;

    Promise.all([
      service.api.getSingle(siteKey, workspaceKey, singleKey).then((single)=>{
        stateUpdate.singleValues = single;
      }),
      service.api.getWorkspaceDetails(siteKey, workspaceKey).then((workspaceDetails)=>{
        stateUpdate.selectedWorkspaceDetails = workspaceDetails;
      })
    ]).then(()=>{
      this.setState(stateUpdate);
    }).catch((e)=>{

    });
  }

  componentWillUnmount(){
    service.unregisterListener(this);
  }

  handleOpenInEditor(context){
    var { siteKey, workspaceKey, singleKey } = this.props;

    let promise = service.api.openSingleInEditor(siteKey, workspaceKey, singleKey);
    promise.then(function(updatedValues){
    }, function(){
      context.reject('Something went wrong.');
    })
  }

  handleSave(context){

    var { siteKey, workspaceKey, singleKey } = this.props;

    let promise = service.api.updateSingle(siteKey, workspaceKey, singleKey, context.data);
    promise.then(function(updatedValues){
      snackMessageService.addSnackMessage("Document saved successfully.")
      context.accept(updatedValues);
    }, function(){
      context.reject('Something went wrong.');
    });
  }

  render(){
    if(this.state.showSpinner || this.state.singleValues===undefined || this.state.selectedWorkspaceDetails==null){
      return <Spinner />;
    }
    let single = this.state.selectedWorkspaceDetails.singles.find(x => x.key === this.props.singleKey);
    if(single==null) return null;

    let previewUrl = null;
    if(single.previewUrl){
      previewUrl = 'http://localhost:13131'+single.previewUrl;
      service.api.updateMobilePreviewUrl(previewUrl)
    }
    else{
      previewUrl = 'http://localhost:13131';
      service.api.updateMobilePreviewUrl(previewUrl)
    }

    var { siteKey, workspaceKey, singleKey } = this.props;

    return(<SukohForm
    debug={false}
    rootName={single.title}
    refreshed={this.props.refreshed}
    fields={single.fields}
    values={this.state.singleValues}
    pageUrl={previewUrl}
    onSave={this.handleSave.bind(this)}
    onOpenInEditor={this.handleOpenInEditor.bind(this)}
    plugins={{

      openBundleFileDialog: function({title, extensions, targetPath, forceFileName}, onFilesReady){
        return service.api.openFileDialogForSingleAndCollectionItem(siteKey,workspaceKey,"",singleKey, targetPath, {title, extensions}, forceFileName);
      },

      getFilesInBundle: function(extensions, targetPath, forceFileName){
        return service.api.getFilesInBundle(siteKey, workspaceKey, "", singleKey, targetPath, extensions, forceFileName);
      },

      getBundleThumbnailSrc: function(targetPath){
        return service.api.getThumbnailForCollectionOrSingleItemImage(siteKey,workspaceKey,"",singleKey, targetPath);
      }
    }}
  />
    );
  }
}

export default Single;
