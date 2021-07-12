import * as React from 'react';
import { Breadcumb, BreadcumbItem } from './../../components/Breadcumb';
import { Route } from 'react-router-dom';
import service from './../../services/service'
import DeleteItemKeyDialog from './DeleteItemKeyDialog'
import EditItemKeyDialog from './EditItemKeyDialog'
import Spinner from './../../components/Spinner'
import MoreVertIcon from 'material-ui-02/svg-icons/navigation/more-vert';
import { Toggle, Chip, Divider, Dialog, FlatButton, IconButton, IconMenu, List, ListItem, MenuItem, Paper, RaisedButton, TextField } from 'material-ui-02';
import { Debounce } from './../../utils/debounce';

const Fragment = React.Fragment;

const MAX_RECORDS = 200;

type MakePageBundleItemKeyDialogProps = {
  busy: bool,
  itemLabel: string,
  handleClose: ()=> void,
  handleConfirm: (string)=> void
}

type MakePageBundleItemKeyDialogState = {
  value:string,
  valid: ?bool
}

class MakePageBundleItemKeyDialog extends React.Component<MakePageBundleItemKeyDialogProps,MakePageBundleItemKeyDialogState>{
  constructor(props : MakePageBundleItemKeyDialogProps){
    super(props);
    this.state = {
      value:'',
      valid: null
    }
  }

  handleClose(){
    if(this.props.handleClose && !this.props.busy)
      this.props.handleClose();
  }

  handleConfirm(){
    if(this.props.handleConfirm)
      this.props.handleConfirm(this.state.value);
  }


  render(){
    let { busy, itemLabel } = this.props;

    return (
      <Dialog
      title={"MakePageBundle Item"}
      modal={true}
      open={true}
      onRequestClose={this.handleClose}
      actions={[
        <FlatButton disabled={busy} primary={true} label="Cancel" onClick={this.handleClose.bind(this)} />,
        <FlatButton disabled={busy} primary={true} label="MakePageBundle" onClick={this.handleConfirm.bind(this)}  />
      ]}
      >
          {this.state.valid? undefined : <p>Do you really want to make a page bundle from the item <b>"{itemLabel}"</b>?</p>}

          { busy? <Spinner /> : undefined }

        </Dialog>
    );
  }
}

type CollectionProps = {
  siteKey : string,
  workspaceKey : string,
  collectionKey : string
}

type CollectionState = {
  selectedWorkspaceDetails: null,
  filter: string,
  items: ?Array<{label:string, key:string }>,
  filteredItems: Array<{key:string, label:string}>,
  trunked: bool,
  view: ?{ key: ?string, item: any },
  modalBusy: bool,
  dirs: Array<string>
}

class CollectionListItems extends React.PureComponent<{
  filteredItems: Array<any>,
  onItemClick: (item: any)=>void,
  onRenameItemClick: (item: any)=>void,
  onDeleteItemClick: (item: any)=>void,
  onMakePageBundleItemClick: (item: any)=>void,
}> {
  render(){
    let { filteredItems, onItemClick, onRenameItemClick, onDeleteItemClick, onMakePageBundleItemClick, sortDescending } = this.props;

    filteredItems.sort(function(a, b){
      let keyA = a.sortval;
      let keyB = b.sortval;

      if(sortDescending){
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
      }
      else{
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
      }
      return 0;
    });

    return (<React.Fragment>
      { filteredItems.map((item, index) => {

        let iconButtonElement = (
          <IconButton touch={true}>
            <MoreVertIcon/>
          </IconButton>
        );

        let rightIconMenu = (
          <IconMenu iconButtonElement={iconButtonElement}
          anchorOrigin={{horizontal: 'right', vertical: 'top'}}
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
        >

          <MenuItem onClick={()=> onRenameItemClick(item) }>Rename</MenuItem>
          <MenuItem onClick={()=> onDeleteItemClick(item) }>Delete</MenuItem>
          <MenuItem onClick={()=> onMakePageBundleItemClick(item) }>Make Page Bundle</MenuItem>
        </IconMenu>
        );

        let text = item.label||item.key;
        if(this.props.showSortValue){
          text = text + " ("+item.sortval+ ")"
        }

        return (<Fragment key={item.key}>
          {index!==0?<Divider />:undefined}
          <ListItem
          primaryText={text}
          onClick={ ()=>{ onItemClick(item) }}
          rightIconButton={rightIconMenu}
        />
            </Fragment>)
      }) }
          </React.Fragment>
    )
  }
}

class Collection extends React.Component<CollectionProps,CollectionState>{

  filterDebounce = new Debounce(200);
  history: any;

  constructor(props : CollectionProps){
    super(props);
    this.state = {
      selectedWorkspaceDetails: null,
      items: null,
      filter: '',
      filteredItems: [],
      view: null,
      trunked: false,
      modalBusy: false,
      dirs: []
    };
  }

  setCreateItemView(){
    service.api.parentTempHideMobilePreview();
    this.setState({view:{key:'createItem', item: null}, modalBusy:false});
  }

  setRenameItemView(item: any){
    service.api.parentTempHideMobilePreview();
    this.setState({view:{key:'renameItem', item}, modalBusy:false});
  }

  setMakePageBundleItemView(item: any){
    service.api.parentTempHideMobilePreview();
    this.setState({view:{key:'makePageBundleItem', item}, modalBusy:false});
  }

  setDeleteItemView(item: any){
    service.api.parentTempHideMobilePreview();
    this.setState({view:{key:'deleteItem', item }, modalBusy:false});
  }

  setRootView(){
    service.api.parentTempUnHideMobilePreview();
    this.setState({view:undefined, modalBusy:false});
  }

  componentWillMount(){
    service.registerListener(this);
  }

  componentDidMount(){
    this.refreshItems();
  }

  refreshItems(){
    var stateUpdate: any  = {};
    var { siteKey, workspaceKey, collectionKey } = this.props;
    if(siteKey && workspaceKey && collectionKey){
      Promise.all([
        service.api.listCollectionItems(siteKey, workspaceKey, collectionKey).then((items)=>{
          stateUpdate.items = items;
          stateUpdate = { ...stateUpdate, ...(this.resolveFilteredItems(items)) };

        }),
        service.api.getWorkspaceDetails(siteKey, workspaceKey).then((workspaceDetails)=>{
          stateUpdate.selectedWorkspaceDetails = workspaceDetails;
        })
      ]).then(()=>{
        this.setState(stateUpdate);
      }).catch((e)=>{

      });
    }
  }

  componentWillUnmount(){
    service.unregisterListener(this);
  }

  makePageBundleCollectionItem(){
    let { siteKey, workspaceKey, collectionKey } = this.props;
    let view = this.state.view;
    if(view==null) return;
    service.api.makePageBundleCollectionItem(siteKey, workspaceKey, collectionKey, view.item.key)
      .then(()=>{
        let itemsCopy : Array<any> = (this.state.items||[]).slice(0);
        let itemIndex = itemsCopy.findIndex(x=>x.key === view.item.key);
        itemsCopy.splice(itemIndex,1);
        this.setState({items:itemsCopy, modalBusy:false, view: undefined, ...(this.resolveFilteredItems(itemsCopy)) });
      },()=>{
        this.setState({modalBusy:false, view: undefined});
      });

    service.api.parentTempUnHideMobilePreview();
  }


  deleteCollectionItem(){
    let { siteKey, workspaceKey, collectionKey } = this.props;
    let view = this.state.view;
    if(view==null) return;

    service.api.deleteCollectionItem(siteKey, workspaceKey, collectionKey, view.item.key)
      .then(()=>{
        let itemsCopy : Array<any> = (this.state.items||[]).slice(0);
        let itemIndex = itemsCopy.findIndex(x=>x.key === view.item.key);
        itemsCopy.splice(itemIndex,1);
        this.setState(
          {items:itemsCopy,
            modalBusy:false,
            view: undefined,
            ...(this.resolveFilteredItems(itemsCopy))
          });
      },()=>{
        this.setState({modalBusy:false, view: undefined});
      });

    service.api.parentTempUnHideMobilePreview();
  }

  renameCollectionItem(itemKey : string, itemOldKey: string){
    let { siteKey, workspaceKey, collectionKey } = this.props;
    if(this.state.view==null)return;
    //let view = this.state.view;
    service.api.renameCollectionItem(siteKey, workspaceKey, collectionKey, itemOldKey, itemKey)
      .then((result)=>{
        if(result.renamed){
          let itemsCopy : Array<any> = (this.state.items||[]).slice(0);
          let itemIndex = itemsCopy.findIndex(x=>x.label === itemOldKey);
          itemsCopy[itemIndex] = result.item;
          this.setState({items:itemsCopy, modalBusy:false, view: undefined, ...(this.resolveFilteredItems(itemsCopy))});
        }
        else{
          //TODO: warn someone!
          this.setState({modalBusy:false, view: undefined});
        }
      },()=>{
        //TODO: warn someone!
        this.setState({modalBusy:false, view: undefined});
      });

    service.api.parentTempUnHideMobilePreview();
  }

  createCollectionItemKey(itemKey : string, itemTitle : string){
    this.setState({modalBusy:true});
    let { siteKey, workspaceKey, collectionKey } = this.props;
    service.api.createCollectionItemKey(siteKey, workspaceKey, collectionKey, itemKey, itemTitle)
      .then(({unavailableReason, key})=>{
        if(unavailableReason){
          this.setState({modalBusy:false});
        }
        else{
          this.refreshItems();
        }
      }, (e)=>{
        this.setState({modalBusy:false});
      }).then(()=>{

        let path = `/sites/${encodeURIComponent(siteKey)}/workspaces/${encodeURIComponent(workspaceKey)}/collections/${encodeURIComponent(collectionKey)}/${encodeURIComponent(itemKey)}%2Findex.md`
        this.history.push(path);
      });

    service.api.parentTempUnHideMobilePreview();
  }

  resolveFilteredItems = (items: Array<any>) => {
    let trunked = false;
    let dirs = {'':true};
    let filteredItems: Array<any> = (items||[]).filter((item)=> {

      let parts = item.label.split('/');
      let c = '';
      for(let i = 0; i < parts.length-1; i++){ c = c+parts[i] + '/'; dirs[c] = true; }

      return item.key.startsWith(this.state.filter);
    });
    if(filteredItems.length > MAX_RECORDS){
      filteredItems = filteredItems.slice(0,MAX_RECORDS);
      trunked = true;
    }
    let dirsArr: Array<string> = Object.keys(dirs)
    return { filteredItems, trunked, dirs: dirsArr };
  }

  handleFilterChange = (e: any, value: string)=>{
    this.setState({filter:value});
    this.filterDebounce.run(()=>{
      this.setState(this.resolveFilteredItems(this.state.items||[]));
    });
  }

  handleItemClick = (item: any)=>{
    let { siteKey, workspaceKey, collectionKey } = this.props;
    let path = `/sites/${encodeURIComponent(siteKey)}/workspaces/${encodeURIComponent(workspaceKey)}/collections/${encodeURIComponent(collectionKey)}/${encodeURIComponent(item.key)}`
    this.history.push(path);
  }

  handleDeleteItemClick = (item: any)=>{
    this.setDeleteItemView(item)
  }

  handleRenameItemClick = (item: any)=>{
    this.setRenameItemView(item)
  }
  handleMakePageBundleItemClick = (item: any)=>{
    this.setMakePageBundleItemView(item)
  }

  handleDirClick = (e: any) => {
    this.setState({filter:e.currentTarget.dataset.dir});
    this.filterDebounce.run(()=>{
      this.setState(this.resolveFilteredItems(this.state.items||[]));
    });
  }

  generatePageUrl(collection){

    let CollectionPath = collection.folder.split("/")
    CollectionPath.shift();

    let path = CollectionPath.join("/");
    let url = 'http://localhost:13131/'+path.toLowerCase();

    return url;
  }

  render(){

    //let { siteKey, workspaceKey, collectionKey } = this.props;
    let { collectionKey } = this.props;
    let { filteredItems, trunked } = this.state;
    let dialog = undefined;

    if(this.state.selectedWorkspaceDetails==null){
      return (<Spinner />);
    }
    let collection = this.state.selectedWorkspaceDetails.collections.find(x => x.key === collectionKey);
    if(collection==null)
      return null;


    if(this.state.view){
      let view = this.state.view;
      if(view.key==='createItem'){
        dialog = (<EditItemKeyDialog
        value=""
        viewKey={view.key}
        title= {"New " + collection.itemtitle }
        textfieldlabel="Title"
        busy={this.state.modalBusy}
        handleClose={this.setRootView.bind(this)}
        handleConfirm={this.createCollectionItemKey.bind(this)}
        confirmLabel="Create"
      />);
      }
      else if(view.key==='renameItem'){
        dialog = (<EditItemKeyDialog
        title="Rename Item key"
        viewKey={view.key}
        textfieldlabel="item key"
        value={this.state.view.item.label}
        busy={this.state.modalBusy}
        handleClose={this.setRootView.bind(this)}
        handleConfirm={this.renameCollectionItem.bind(this)}
        confirmLabel="Rename"
      />);
      }
      else if(view.key==="deleteItem"){
        dialog = <DeleteItemKeyDialog
        busy={this.state.modalBusy}
        handleClose={this.setRootView.bind(this)}
        handleConfirm={this.deleteCollectionItem.bind(this)}
        itemLabel={view.item.label}
      />
      }
      else if(view.key==="makePageBundleItem"){
        dialog = <MakePageBundleItemKeyDialog
        busy={this.state.modalBusy}
        handleClose={this.setRootView.bind(this)}
        handleConfirm={this.makePageBundleCollectionItem.bind(this)}
        itemLabel={view.item.label}
      />
      }
    }



    let pageUrl = this.generatePageUrl(collection);
    service.api.updateMobilePreviewUrl(pageUrl)

    return(<Route render={ ({history}) => {
      this.history = history;
      return (
        <div style={{padding:'20px'}}>
          <Breadcumb items={[<BreadcumbItem disabled={true} label={collection.title} />]} />
          <br />
          <div>
            <RaisedButton
            label={'New '+ collection.itemtitle }
            onClick={ this.setCreateItemView.bind(this)
            /* function(){ history.push('/collections/'+encodeURIComponent(collectionKey)+'/new') */ } />

            {/* <RaisedButton label='New Section' onClick={ this.setCreateSectionView.bind(this) } /> */}
          </div>
          <br />

          <TextField
          floatingLabelText="Filter"
          onChange={this.handleFilterChange}
          fullWidth={true}
          value={this.state.filter}
          hintText="Item name" />

          <div style={{display: 'flex', flexWrap: 'wrap', padding: '10px 0'}}>
            { this.state.dirs.map((dir)=>{
              return (<Chip key={dir} style={{marginRight:'5px'}} onClick={this.handleDirClick} data-dir={dir}>/{dir}</Chip>);
            }) }
            </div>

            <div style={{backgroundColor: "#eee",display: 'flex',justifyContent: "flex-start", flexWrap: 'no-wrap', padding: '10px 10px'}}>

              <Toggle
              label="Sort descending"
              toggled={this.state.sortDescending}
              onToggle={function(e,value){
                if(this.state.sortDescending){
                  this.setState({sortDescending: false});
                }
                else{
                  this.setState({sortDescending: true});
                }
              }.bind(this)}
              labelPosition='right' />

              <Toggle
              label="Show sorting value"
              toggled={this.state.showSortValue}
              onToggle={function(e,value){
                if(this.state.showSortValue){
                  this.setState({showSortValue: false});
                }
                else{
                  this.setState({showSortValue: true});
                }
              }.bind(this)}
              labelPosition='right' />
            </div>

            <Paper>
              <List>
                <CollectionListItems
                filteredItems={filteredItems}
                onItemClick={this.handleItemClick}
                onRenameItemClick={this.handleRenameItemClick}
                onDeleteItemClick={this.handleDeleteItemClick}
                onMakePageBundleItemClick={this.handleMakePageBundleItemClick}
                sortDescending={this.state.sortDescending}
                showSortValue={this.state.showSortValue}
              />
                  { trunked ? (
                    <React.Fragment>
                      <Divider />
                      <ListItem disabled primaryText={`Max records limit reached (${MAX_RECORDS})`} style={{color:'rgba(0,0,0,.3)'}} />
                    </React.Fragment>
                  ) : (null) }
                  </List>
                </Paper>

                { dialog }
              </div>
      );
    }} />);
  }
}

export default Collection;
