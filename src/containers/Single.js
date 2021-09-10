//@flow

import React from 'react';
import service from './../services/service'
import { snackMessageService } from './../services/ui-service'
//import { Redirect } from 'react-router-dom'
import { SukohForm } from './../components/SukohForm';
import Spinner from './../components/Spinner';
//import { FormBreadcumb } from './../components/Breadcumb'

//import type { Configurations, SiteConfig, WorkspaceHeader, WorkspaceConfig, SingleConfig } from './../types';
import type { WorkspaceConfig, SingleConfig } from './../types';

type SingleProps = {
  siteKey : string,
  workspaceKey: string,
  singleKey: string
}

type SingleState = {
  selectedWorkspaceDetails : ?WorkspaceConfig,
  single : ?SingleConfig,
  singleValues: any
}


class Single extends React.Component<SingleProps,SingleState>{
  constructor(props : SingleProps){
    super(props);
    this.state = {
      selectedWorkspaceDetails: null,
      single: null,
      singleValues: null
    };
  }
  componentWillMount(){
    window.require('electron').ipcRenderer.on('frontEndBusy', ()=>{
      this.setState({showSpinner: true});
    });
    service.registerListener(this);
  }

  componentDidMount(){
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

  handleOpenInEditor(context: any){
    var { siteKey, workspaceKey, singleKey } = this.props;

    let promise = service.api.openSingleInEditor(siteKey, workspaceKey, singleKey);
    promise.then(function(updatedValues){
    }, function(){
      context.reject('Something went wrong.');
    })
  }

  handleSave(context : any){
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
    fields={single.fields}
    values={this.state.singleValues}
    pageUrl={previewUrl}
    onSave={this.handleSave.bind(this)}
    onOpenInEditor={this.handleOpenInEditor.bind(this)}
    plugins={{
      openBundleFileDialog: function({title, extensions, targetPath}, onFilesReady){
        return service.api.openFileDialogForCollectionItem(siteKey,workspaceKey,"",singleKey, targetPath, {title, extensions});
      },
      getBundleThumbnailSrc: function(targetPath){
        return service.api.getThumbnailForCollectionItemImage(siteKey,workspaceKey,"",singleKey, targetPath);
      }
    }}
  />
    );
  }
}

export default Single;
