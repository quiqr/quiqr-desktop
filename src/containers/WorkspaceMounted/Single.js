import React         from 'react';
import service       from './../../services/service'
import { SukohForm } from './../../components/SukohForm';
import Spinner       from './../../components/Spinner';

class Single extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      selectedWorkspaceDetails: null,
      single: null,
      previewUrl: null,
      singleValues: null
    };
  }

  componentDidMount(){
    window.require('electron').ipcRenderer.on('frontEndBusy', ()=>{
      this.setState({showSpinner: true});
    });
    service.registerListener(this);

    var stateUpdate  = {};

    //fileOverride is used for some dynamic dogFood editors
    var { siteKey, workspaceKey, singleKey, fileOverride } = this.props;

    Promise.all([
      service.api.getSingle(siteKey, workspaceKey, singleKey, fileOverride).then((single)=>{
        stateUpdate.singleValues = single;
      }),
      service.api.getWorkspaceDetails(siteKey, workspaceKey).then((workspaceDetails)=>{
        stateUpdate.selectedWorkspaceDetails = workspaceDetails;
      }),
      service.api.getCurrentBaseUrl().then((currentBaseUrlPath)=>{
        stateUpdate.currentBaseUrlPath = currentBaseUrlPath;
      })

    ]).then(()=>{
      this.setState(stateUpdate);
    }).catch((e)=>{
        service.api.logToConsole(e, 'error')
    });

  }

  componentWillUnmount(){
    service.unregisterListener(this);
  }

  handleOpenInEditor(context){
    var { siteKey, workspaceKey, singleKey } = this.props;

    let promise = service.api.openSingleInEditor(siteKey, workspaceKey, singleKey);
    promise.then(function(){
      // TODO should watch file for changes and if so reload
    }, function(){
      context.reject('Something went wrong.');
    })
  }

  handleSave(context){

    var { siteKey, workspaceKey, singleKey } = this.props;

    let promise = service.api.updateSingle(siteKey, workspaceKey, singleKey, context.data);
    promise.then(function(updatedValues){
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
    if(single.hidePreviewIcon){
      previewUrl = '';
    }
    else{
      let finalpath = this.state.currentBaseUrlPath;

      if(single.previewUrl){
        finalpath = this.state.currentBaseUrlPath + single.previewUrl
      }
      finalpath = finalpath.replace("//","/").replace("//","/");

      if(Array.from(finalpath)[0]!=="/"){
        finalpath = "/"+finalpath;
      }

      previewUrl = 'http://localhost:13131'+finalpath;
    }

    var { siteKey, workspaceKey, singleKey } = this.props;

    return(<SukohForm
    debug={false}
    rootName={single.title}
    refreshed={this.props.refreshed}
    fields={single.fields}
    values={this.state.singleValues}
    siteKey={siteKey}
    workspaceKey={workspaceKey}
    pageUrl={previewUrl}
    onSave={this.handleSave.bind(this)}
    onOpenInEditor={this.handleOpenInEditor.bind(this)}
    hideExternalEditIcon={single.hideExternalEditIcon}
    hideSaveButton={single.hideSaveButton}
    plugins={{

      openBundleFileDialog: function({title, extensions, targetPath, forceFileName}, onFilesReady){
        return service.api.openFileDialogForSingleAndCollectionItem(siteKey, workspaceKey, "", singleKey, targetPath, {title, extensions}, forceFileName);
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
