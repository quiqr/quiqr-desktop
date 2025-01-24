import React                         from 'react';
import service                       from './../../../services/service'
import {snackMessageService}         from './../../../services/ui-service';
import { SukohForm }                 from './../../../components/SukohForm';
import Spinner                       from './../../../components/Spinner'
import IconButton              from '@material-ui/core/IconButton';
import Button              from '@material-ui/core/Button';
import CloseIcon    from '@material-ui/icons/Close';

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
      }),
      service.api.getCurrentBaseUrl().then((currentBaseUrlPath)=>{
        stateUpdate.currentBaseUrlPath = currentBaseUrlPath;
      })

    ]).then(()=>{
      this.setState(stateUpdate);
    });
  }

  handleDocBuild(buildAction){
    let { siteKey, workspaceKey, collectionKey, collectionItemKey } = this.props;

    let promise = service.api.buildCollectionItem(siteKey, workspaceKey, collectionKey, collectionItemKey, buildAction);
    promise.then(function(buildResult){

      if(buildResult.stdoutType == "message"){
        snackMessageService.addSnackMessage(<div>Build ${buildAction} was succesful<br/>{buildResult.stdoutContent}</div>,{severity: 'success'});
      }
      else if(buildResult.stdoutType == "ascii_message"){
        snackMessageService.addSnackMessage(<pre>Build ${buildAction} was succesful<br/>{buildResult.stdoutContent}</pre>,{severity: 'success'});
      }
      else if(buildResult.stdoutType == "file_path"){
        let action = (          <React.Fragment>
          <Button color="secondary" size="small" onClick={()=>{
            service.api.openFileInEditor(buildResult.stdoutContent.replace("\n",""));
          }}>
            Open
          </Button>
          <IconButton
            aria-label="close"
            color="inherit"
            onClick={()=>{
              snackMessageService.reportSnackDismiss()
            }}
          >
            <CloseIcon />
          </IconButton>
        </React.Fragment>
        )

        snackMessageService.addSnackMessage(`Build ${buildAction} was succesful`,{severity: 'success', action: action});
      }
      else{
        snackMessageService.addSnackMessage(`Build ${buildAction} was succesful`,{severity: 'success'});

      }

      service.api.logToConsole(buildResult)

    }, function(){

      snackMessageService.addSnackMessage(`Build failed`,{severity: 'warning'});
    })
  }

  handleOpenInEditor(){
    let { siteKey, workspaceKey, collectionKey, collectionItemKey } = this.props;
    service.api.openCollectionItemInEditor(siteKey, workspaceKey, collectionKey, collectionItemKey);
  }

  handleSave(context: any){
    let { siteKey, workspaceKey, collectionKey, collectionItemKey } = this.props;
    let promise = service.api.updateCollectionItem(siteKey, workspaceKey, collectionKey, collectionItemKey, context.data);
    promise.then(function(updatedValues){
      context.accept(updatedValues);
    }, function(){
      context.reject('Something went wrong.');
    })
  }

  generatePageUrl(collection){

    if(collection.hidePreviewIcon){
      return '';
    }

    let ItemPathElements = this.props.collectionItemKey.split("/");
    let pageItem = ItemPathElements.pop();
    let path;
    if(pageItem !=='index.md'){
      ItemPathElements.push(pageItem.split('.').slice(0, -1).join('.'));
    }

    if(collection.previewUrlBase){
      path = collection.previewUrlBase + "/" + ItemPathElements.join("/");
    }
    else{
      let CollectionPath = collection.folder.split("/")
      CollectionPath.shift();
      path = CollectionPath.join("/") + "/" + ItemPathElements.join("/");
    }

    let finalpath = this.state.currentBaseUrlPath+path.toLowerCase();
    finalpath = finalpath.replace("//","/").replace("//","/");
    if(Array.from(finalpath)[0]!=="/"){
      finalpath = "/"+finalpath;
    }
    let url = 'http://localhost:13131'+finalpath;

    return url;
  }


  render(){
    if(this.state.showSpinner || this.state.collectionItemValues===undefined||this.state.selectedWorkspaceDetails==null){
      return <Spinner />;
    }

    let { selectedWorkspaceDetails} = this.state;
    let { siteKey, workspaceKey, collectionKey, collectionItemKey } = this.props;

    let collection = selectedWorkspaceDetails.collections.find(x => x.key === collectionKey);
    if(collection==null)return null;

    let fields = collection.fields.slice(0);
    let buildActions = collection.build_actions.slice(0);
    let values =  Object.assign(this.state.collectionItemValues)

    let pageUrl = this.generatePageUrl(collection);

    return(<SukohForm
    debug={false}
    rootName={collection.title}
    pageUrl={pageUrl}
    hideExternalEditIcon={collection.hideExternalEditIcon}
    fields={fields}
    siteKey={siteKey}
    workspaceKey={workspaceKey}
    collectionKey={collectionKey}
    collectionItemKey={collectionItemKey}
    values={values}
    trim={false}
    buildActions={buildActions}
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
    onDocBuild={(build_action)=>this.handleDocBuild(build_action)}

  />);
  }
}

export default CollectionItem;
