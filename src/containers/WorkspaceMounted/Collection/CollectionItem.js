import React from 'react';
import service from './../../../services/service'
import { snackMessageService } from './../../../services/ui-service'
import { SukohForm } from './../../../components/SukohForm';
import Spinner from './../../../components/Spinner'

class CollectionItem extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      selectedWorkspaceDetails: null,
      collectionItemValues: null
    };
  }

  componentWillUnmount(){
    service.unregisterListener(this);
  }

  componentDidMount(){
    window.require('electron').ipcRenderer.on('frontEndBusy', ()=>{
      this.setState({showSpinner: true});
    });
    service.registerListener(this);

    var stateUpdate  = {};
    var { siteKey, workspaceKey, collectionKey, collectionItemKey } = this.props;

    Promise.all([
      service.api.getWorkspaceDetails(siteKey, workspaceKey).then((workspaceDetails)=>{
        stateUpdate.selectedWorkspaceDetails = workspaceDetails;
      }),
      service.api.getCollectionItem(siteKey, workspaceKey, collectionKey, collectionItemKey).then((collectionItemValues)=>{
        stateUpdate.collectionItemValues = collectionItemValues;
      })
    ]).then(()=>{
      this.setState(stateUpdate);

    });

  }


  handleOpenInEditor(context: any){
    let { siteKey, workspaceKey, collectionKey, collectionItemKey } = this.props;

    let promise = service.api.openCollectionItemInEditor(siteKey, workspaceKey, collectionKey, collectionItemKey);
    promise.then(function(updatedValues){
      //context.accept(updatedValues);
    }, function(){
      context.reject('Something went wrong.');
    })
  }

  handleSave(context: any){
    let { siteKey, workspaceKey, collectionKey, collectionItemKey } = this.props;

    let promise = service.api.updateCollectionItem(siteKey, workspaceKey, collectionKey, collectionItemKey, context.data);
    promise.then(function(updatedValues){
      snackMessageService.addSnackMessage("Document saved successfully.")
      context.accept(updatedValues);
    }, function(){
      context.reject('Something went wrong.');
    })
  }

  generatePageUrl(collection){

    let ItemPathElements = this.props.collectionItemKey.split("/");
    let pageItem = ItemPathElements.pop();
    if(pageItem !=='index.md'){
      ItemPathElements.push(pageItem.split('.').slice(0, -1).join('.'));
    }

    let CollectionPath = collection.folder.split("/")
    CollectionPath.shift();

    let path = CollectionPath.join("/") + "/" + ItemPathElements.join("/");
    let url = 'http://localhost:13131/'+path.toLowerCase();

    return url;
  }


  render(){
    if(this.state.showSpinner || this.state.collectionItemValues===undefined||this.state.selectedWorkspaceDetails==null){
      return <Spinner />;
    }

    // let { selectedWorkspaceDetails, collectionItemValues } = this.state;
    let { selectedWorkspaceDetails} = this.state;
    let { siteKey, workspaceKey, collectionKey, collectionItemKey } = this.props;

    let collection = selectedWorkspaceDetails.collections.find(x => x.key === collectionKey);
    if(collection==null)return null;

    let fields = collection.fields.slice(0);
    //fields.unshift({key:'__item', type:'readonly', title:'Item'});
    //let values =  Object.assign({__item: collectionItemKey}, this.state.collectionItemValues)
    let values =  Object.assign(this.state.collectionItemValues)

    let pageUrl = this.generatePageUrl(collection);
    service.api.updateMobilePreviewUrl(pageUrl)

    return(<SukohForm
    debug={false}
    rootName={collection.title}
    pageUrl={pageUrl}
    fields={fields}
    siteKey={siteKey}
    workspaceKey={workspaceKey}
    collectionKey={collectionKey}
    collectionItemKey={collectionItemKey}
    values={values}
    trim={false}
    plugins={{

      openBundleFileDialog: function({title, extensions, targetPath}, onFilesReady){
        return service.api.openFileDialogForSingleAndCollectionItem(siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath, {title, extensions});
      },
      getFilesInBundle: function(extensions, targetPath, forceFileName){
        return service.api.getFilesInBundle(siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath, extensions, forceFileName);
      },
      getBundleThumbnailSrc: function(targetPath){
        return service.api.getThumbnailForCollectionOrSingleItemImage(siteKey,workspaceKey,collectionKey,collectionItemKey, targetPath);
      }
    }}
    onSave={this.handleSave.bind(this)}
    onOpenInEditor={this.handleOpenInEditor.bind(this)}
  />);
  }
}

export default CollectionItem;
