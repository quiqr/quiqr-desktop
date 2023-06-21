import React                                from 'react';
import FolderOpen                           from '@material-ui/icons/FolderOpen';
import Button                               from '@material-ui/core/Button';
import { BundleManager, BundleManagerItem } from '../../BundleManager';
import DangerButton                         from '../../DangerButton';
import FolderIcon                           from '@material-ui/icons/Folder';
import IconButton                           from '@material-ui/core/IconButton';
import DeleteIcon                           from '@material-ui/icons/Delete';
import { BaseDynamic }                      from '../../HoForm';
import path                                 from 'path';
import service                              from '../../../services/service';

const regExtractExt = /[.]([^.]+)$/
const extractExt = (file) => {
  return file.replace(regExtractExt,'$1');
}

class BundleManagerDynamic extends BaseDynamic {

  constructor(props){
    super(props);

    this.state = {
      absFiles: []
    };
  }

  extendField(field, fieldExtender){
    if(field.fields===undefined){
      field.fields = [];
    }
    fieldExtender.extendFields(field.fields);
  }

  buildPathFragment(node, nodeLevel, nodes) {
    return undefined;
  }

  componentDidMount(){

    this.checkRootPathFiles();
  }

  /*
  componentDidUpdate(preProps: HomeProps){
    service.api.logToConsole(this.state.absFiles, "state");
    service.api.logToConsole(this.props.context.value, "context");
    return;
    if(this.state.absFiles !== this.props.context.value)
    this.checkRootPathFiles();
  }
  */

  checkRootPathFiles(){
    let {context} = this.props;
    let {field} = context.node;
    if(!Array.isArray(context.node.state['resources'])){
      context.node.state['resources'] = [];
    }

    if(field.path.charAt(0) === "/" || field.path.charAt(0) === "\\"){
      service.api.getFilesFromAbsolutePath(field.path).then((_files)=>{

        if(this.state.absFiles.length === 0){
          let files = _files.map(item => {
            item.src = path.join(field.path, item.src);
            return item;
          })
          this.setState({absFiles: files});
        }
      });
    }
    else{
      context.form.props.plugins.getFilesInBundle( field.extensions, field.path, field.forceFileName).then((_files)=>{

        if(this.state.absFiles.length === 0){
          let files = _files.map(item => {
            item.src = path.join(item.src);
            return item;
          })
          this.setState({absFiles: files});
          //context.setValue(files);
        }
      });

    }
  }

  normalizeState({state, field, stateBuilder}){

    if(!Array.isArray(state['resources'])){
      state['resources'] = [];
    }
    for(let r = 0; r < state['resources'].length; r++){
      //let resource = state['resources'][r];

      if(!field.extensions){
        field.extensions= [];
      }
      /*if(resource.src.startsWith(field.path) && ( field.extensions || field.extensions.indexOf(extractExt(resource.src.src))!==-1)){
        //stateBuilder.setLevelState(resource, field.fields);
      }
      */
    }
  }

  getType(){
    return 'bundle-manager';
  }

  allocateStateLevel(field, parentState, rootState){
    return rootState;
 }

  onButtonClick(e){

    let {context} = this.props;
    let {field} = context.node;

    if(field.extensions && field.extensions.length === 0){
      delete field.extensions;
    }

    context.form.props.plugins.openBundleFileDialog({title:field.title, extensions: field.extensions, targetPath: field.path, forceFileName: field.forceFileName})
      .then((files)=>{
        if(files){
          let currentFiles = this.state.absFiles;
          for(let f = 0; f < files.length; f++){
            let file = files[f];
            let match = currentFiles.find((x)=>x.src===file);
            if(match){
              if(match.__deleted)
                delete match.__deleted;
            }
            else{
              currentFiles.push({src:file});
            }
          }
          context.setValue(currentFiles);
        }
      });
  }

  removeItemWithValue(state){
    state.__deleted = true;
    let { context } = this.props;
    context.setValue(this.state.absFiles);
  }

  renderComponent(){

    let {context} = this.props;
    let {node, currentPath, parentPath} = context;
    let {field} = node;

    if(currentPath!==parentPath){
      return (null);
    }

    if(!field.extensions){
      field.extensions= [];
    }

    let itemsStates = [];

    itemsStates = this.state.absFiles.filter(x => {
      return (
        //x.src.startsWith(field.path) && x.__deleted !== true && ( field.extensions || field.extensions.indexOf(extractExt(x.src))!==-1 )
        x.__deleted !== true && ( field.extensions || field.extensions.indexOf(extractExt(x.src))!==-1 )
      );
    });

    if(field.forceFileName){
      field.maxItems = 1;
    }

    let showAddButton = true;
    if(field.maxItems && typeof field.maxItems === 'number'){
      if(field.maxItems <= itemsStates.length){
        showAddButton = false;
      }
    }

    return (<React.Fragment>



      <div style={{padding:'16px 0'}}>
        <strong>{field.title?field.title:"Page files"}</strong>
        <br/>
      { field.path.substring(0,1) === '/' ?
        <React.Fragment>
        <IconButton color="primary"  aria-label="directions"
          onClick={()=>{
            service.api.openFileExplorer(field.path, true);
          }}>
          <FolderIcon />
        </IconButton>
          {field.path}
        </React.Fragment>
        :null}

      </div>



      { showAddButton && field.addButtonLocationTop ?

          <Button
            style={{marginBottom:'16px', marginTop:itemsStates.length?'0px':undefined}}
            startIcon={<FolderOpen />} variant="contained"  onClick={()=>{
            this.onButtonClick()
            }}>
            Add File
          </Button>

          :null
      }

      <BundleManager forceActive={true}>

        { (itemsStates).map((state,childIndex)=>{

          let newNode = {
            field,
            state,
            uiState:{},
            parent: node
          };

          let filename = state.name||state.src;

          return (<BundleManagerItem
            style={{marginTop:childIndex?'0px':undefined}}
            bodyStyle={{padding:'0px 0px 0px 0px'}}
            label={filename}
            forceActive={true}
            path={state.src}
            key={field.key+'-resource-'+childIndex}
            body={context.renderLevel(newNode)}
            headerRightItems={[
              <DangerButton
              onClick={(e, loaded)=>{
                e.stopPropagation();
                if(loaded){
                  this.removeItemWithValue(state)
                }
              }}

              loadedButton={<IconButton  size="small" color="secondary" aria-label="delete"> <DeleteIcon /> </IconButton>}
              button={<IconButton  size="small" aria-label="delete"> <DeleteIcon /> </IconButton>} 
            />
            ]}
            />)
        }) }
          </BundleManager>

      { showAddButton && !field.addButtonLocationTop ?
          <Button
            style={{marginBottom:'16px', marginTop:itemsStates.length?'0px':undefined}}
            startIcon={<FolderOpen />} variant="contained"  onClick={()=>{
            this.onButtonClick()
            }}>
            Add File
          </Button>

          :null
      }

        </React.Fragment>);
  }

  getValue(context){
    return context.node.state['resources'].slice(0);
  }
  setValue(context, value){
    context.node.state['resources'] = value;
  }
  clearValue(context){
    delete context.node.state['resources'];
  }
}

export default BundleManagerDynamic;
