import React                         from 'react';
import service                       from './../../../services/service'
import { SukohForm }                 from './../../../components/SukohForm';
import Spinner                       from './../../../components/Spinner'

interface WorkspaceCollection {
  key: string;
  title: string;
  folder: string;
  fields: unknown[];
  build_actions?: unknown[];
  hidePreviewIcon?: boolean;
  hideExternalEditIcon?: boolean;
  previewUrlBase?: string;
  [key: string]: unknown;
}

interface WorkspaceDetails {
  collections: WorkspaceCollection[];
  [key: string]: unknown;
}

interface CollectionItemProps {
  siteKey: string;
  workspaceKey: string;
  collectionKey: string;
  collectionItemKey: string;
}

interface CollectionItemState {
  selectedWorkspaceDetails: WorkspaceDetails | null;
  collectionItemValues: unknown;
  currentBaseUrlPath?: string;
  showSpinner?: boolean;
}

class CollectionItem extends React.Component<CollectionItemProps, CollectionItemState>{
  constructor(props: CollectionItemProps){
    super(props);
    this.state = {
      selectedWorkspaceDetails: null,
      collectionItemValues: null,
    };
  }

  componentWillUnmount(){
    service.unregisterListener(this);
  }

  componentDidMount(){

    service.registerListener(this);

    var { siteKey, workspaceKey, collectionKey, collectionItemKey } = this.props;

    Promise.all([
      service.api.getWorkspaceDetails(siteKey, workspaceKey),
      service.api.getCollectionItem(siteKey, workspaceKey, collectionKey, collectionItemKey),
      service.api.getCurrentBaseUrl()
    ]).then(([workspaceDetails, collectionItemValues, currentBaseUrlPath])=>{
      this.setState({
        selectedWorkspaceDetails: workspaceDetails as WorkspaceDetails,
        collectionItemValues: collectionItemValues,
        currentBaseUrlPath: typeof currentBaseUrlPath === 'string' ? currentBaseUrlPath : undefined
      });
    });
  }

  handleOpenInEditor(){
    let { siteKey, workspaceKey, collectionKey, collectionItemKey } = this.props;
    service.api.openCollectionItemInEditor(siteKey, workspaceKey, collectionKey, collectionItemKey);
  }

  handleSave(context: { data: unknown; accept: (values: unknown) => void; reject: (message: string) => void }){
    let { siteKey, workspaceKey, collectionKey, collectionItemKey } = this.props;
    let promise = service.api.updateCollectionItem(siteKey, workspaceKey, collectionKey, collectionItemKey, context.data);
    promise.then(function(updatedValues){
      context.accept(updatedValues);
    }, function(){
      context.reject('Something went wrong.');
    })
  }

  generatePageUrl(collection: WorkspaceCollection){

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
    if(!collection.build_actions) collection.build_actions = [];
    let buildActions = collection.build_actions.slice(0);
    let values =  Object.assign({}, this.state.collectionItemValues)

    let pageUrl = this.generatePageUrl(collection);

    return(<SukohForm
      useNewFormSystem={true}  // Enable new system

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

  />);
  }
}

export default CollectionItem;
