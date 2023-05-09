import * as React                                                                              from 'react';
import { Route }                                                                               from 'react-router-dom';
import service                                                                                 from './../../../services/service'
import DeleteItemKeyDialog                                                                     from './DeleteItemKeyDialog'
import EditItemKeyDialog                                                                       from './EditItemKeyDialog'
import CopyItemKeyDialog                                                                       from './CopyItemKeyDialog'
import Spinner                                                                                 from './../../../components/Spinner'
import { Toggle, Chip, Divider, Dialog, IconMenu, List, ListItem, MenuItem, Paper, TextField } from 'material-ui-02';
import IconButton                                                                              from '@material-ui/core/IconButton';
import MoreVertIcon                                                                            from '@material-ui/icons/MoreVert';
import Button                                                                                  from '@material-ui/core/Button';
import { Debounce }                                                                            from './../../../utils/debounce';
import Typography                                                                              from '@material-ui/core/Typography';

const Fragment = React.Fragment;

const MAX_RECORDS = 200;

class MakePageBundleItemKeyDialog extends React.Component{
  constructor(props){
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
      title={"Convert as Page Bundle"}
      modal={true}
      open={true}
      onRequestClose={this.handleClose}
      actions={[
        <Button disabled={busy} onClick={this.handleClose.bind(this)} color="primary">Cancel</Button>,
        <Button disabled={busy} onClick={this.handleConfirm.bind(this)} color="primary">Convert as Page Bundle</Button>

      ]}
      >
          {this.state.valid? undefined : <p>Do you really want to make a page bundle from the item <b>"{itemLabel}"</b>?</p>}

          { busy? <Spinner /> : undefined }

        </Dialog>
    );
  }
}

class CollectionListItems extends React.PureComponent {
  render(){
    let { collectionExtension, filteredItems, onItemClick, onRenameItemClick, onCopyItemClick, onDeleteItemClick, onMakePageBundleItemClick, sortDescending } = this.props;

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
          <IconButton size="small">
            <MoreVertIcon/>
          </IconButton>
        );

        let rightIconMenu = (
          <IconMenu iconButtonElement={iconButtonElement}
          anchorOrigin={{horizontal: 'right', vertical: 'top'}}
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
        >

          <MenuItem onClick={()=> onRenameItemClick(item) }>Rename</MenuItem>
          <MenuItem onClick={()=> onCopyItemClick(item) }>Copy</MenuItem>
          <MenuItem onClick={()=> onDeleteItemClick(item) }>Delete</MenuItem>
            { collectionExtension === 'md' ?
              <MenuItem onClick={()=> onMakePageBundleItemClick(item) }>Make Page Bundle</MenuItem>
              : null
            }
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

class Collection extends React.Component{

  filterDebounce = new Debounce(200);
  history: any;

  constructor(props){
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
    this.setState({view:{key:'createItem', item: null}, modalBusy:false});
  }

  setRenameItemView(item: any){
    this.setState({view:{key:'renameItem', item}, modalBusy:false});
  }
  setCopyItemView(item: any){
    this.setState({view:{key:'copyItem', item}, modalBusy:false});
  }

  setMakePageBundleItemView(item: any){
    this.setState({view:{key:'makePageBundleItem', item}, modalBusy:false});
  }

  setDeleteItemView(item: any){
    this.setState({view:{key:'deleteItem', item }, modalBusy:false});
  }

  setRootView(){
    this.setState({view:undefined, modalBusy:false});
  }

  componentDidMount(){
    window.require('electron').ipcRenderer.on('frontEndBusy', ()=>{
      this.setState({showSpinner: true});
    });
    service.registerListener(this);

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

  }

  renameCollectionItem(itemKey : string, itemOldKey: string){
    let { siteKey, workspaceKey, collectionKey } = this.props;
    if(this.state.view==null) return;
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

  }

  copyCollectionItem(itemKey : string, itemOldKey: string){
    let { siteKey, workspaceKey, collectionKey } = this.props;

    if(this.state.view==null) return;

    service.api.copyCollectionItem(siteKey, workspaceKey, collectionKey, itemOldKey, itemKey)
      .then((result)=>{
        if(result.copied){
          let itemsCopy : Array<any> = (this.state.items||[]).slice(0);
          itemsCopy.push(result.item);
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
  handleCopyItemClick = (item: any)=>{
    this.setCopyItemView(item)
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

    let { collectionKey } = this.props;
    let { filteredItems, trunked } = this.state;
    let dialog = undefined;

    if(this.state.showSpinner ||this.state.selectedWorkspaceDetails==null){
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
      else if(view.key==='copyItem'){
        dialog = (<CopyItemKeyDialog
        title="Copy Item"
        viewKey={view.key}
        textfieldlabel="item key"
        value={this.state.view.item.label}
        busy={this.state.modalBusy}
        handleClose={this.setRootView.bind(this)}
        handleConfirm={this.copyCollectionItem.bind(this)}
        confirmLabel="Copy"
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

    return(<Route render={ ({history}) => {
      this.history = history;
      return (
        <div style={{padding:'20px'}}>

          <Typography variant="button" display="block" gutterBottom> {collection.title} </Typography>

          <Button variant="contained" onClick={ this.setCreateItemView.bind(this) }>
            {'New '+ collection.itemtitle }
          </Button>

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
                  collectionExtension={collection.extension}
                  filteredItems={filteredItems}
                  onItemClick={this.handleItemClick}
                  onRenameItemClick={this.handleRenameItemClick}
                  onCopyItemClick={this.handleCopyItemClick}
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
