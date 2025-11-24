import React                                from 'react';
import FolderOpen                           from '@mui/icons-material/FolderOpen';
import Button                               from '@mui/material/Button';
import { BundleManager, BundleManagerItem } from '../../BundleManager';
import DangerButton                         from '../../DangerButton';
import FolderIcon                           from '@mui/icons-material/Folder';
import IconButton                           from '@mui/material/IconButton';
import DeleteIcon                           from '@mui/icons-material/Delete';
import { BaseDynamic, BaseDynamicProps, BaseDynamicState, FieldBase }  from '../../HoForm';
import { FileReference } from '../../../../types';
import service                              from '../../../services/service';

// Browser-compatible path join utility
const pathJoin = (...parts: string[]) => {
  return parts.join('/').replace(/\/+/g, '/').replace(/\/$/, '') || '/';
};

const regExtractExt = /[.]([^.]+)$/
const extractExt = (file: string) => {
  return file.replace(regExtractExt,'$1');
}

interface FileReferenceWithDeleted extends FileReference {
  __deleted?: boolean;
  name?: string;
}

export interface BundleManagerDynamicField extends FieldBase {
  title?: string;
  path: string;
  addButtonLocationTop?: boolean;
  extensions?: string[];
  forceFileName?: string;
  maxItems?: number;
  fields?: any[];
}

type BundleManagerDynamicProps = BaseDynamicProps<BundleManagerDynamicField>;

type BundleManagerDynamicState = BaseDynamicState & {
  absFiles: FileReferenceWithDeleted[];
};

class BundleManagerDynamic extends BaseDynamic<BundleManagerDynamicProps, BundleManagerDynamicState> {

  constructor(props: BundleManagerDynamicProps){
    super(props);

    this.state = {
      absFiles: [],
      error_msg: null
    };
  }

  extendField(field: any, fieldExtender: any){
    if(field.fields===undefined){
      field.fields = [];
    }
    fieldExtender.extendFields(field.fields);
  }

  buildPathFragment(node: any, nodeLevel: any, nodes: any) {
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
      service.api.getFilesFromAbsolutePath(field.path).then((_files: FileReference[])=>{

        if(this.state.absFiles.length === 0){
          let files = _files.map(item => {
            item.src = pathJoin(field.path, item.src);
            return item;
          })
          this.setState({absFiles: files});
        }
      });
    }
    else{
      context.form.props.plugins.getFilesInBundle(field.extensions, field.path, field.forceFileName).then((_files: FileReference[])=>{

        if(this.state.absFiles.length === 0){
          let files = _files.map(item => {
            item.src = pathJoin(item.src);
            return item;
          })
          this.setState({absFiles: files});
          //context.setValue(files);
        }
      });

    }
  }

  normalizeState({state, field, stateBuilder}: {state: any, field: BundleManagerDynamicField, stateBuilder?: any}){

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

  allocateStateLevel(field: any, parentState: any, rootState: any){
    return rootState;
 }

  onButtonClick(e: React.MouseEvent){

    let {context} = this.props;
    let {field} = context.node;

    if(field.extensions && field.extensions.length === 0){
      delete field.extensions;
    }

    context.form.props.plugins.openBundleFileDialog({title: field.title, extensions: field.extensions, targetPath: field.path, forceFileName: field.forceFileName})
      .then((files: string[] | undefined)=>{
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

  removeItemWithValue(state: FileReferenceWithDeleted){
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

    let itemsStates: FileReferenceWithDeleted[] = [];

    itemsStates = this.state.absFiles.filter((x: FileReferenceWithDeleted) => {
      return (
        //x.src.startsWith(field.path) && x.__deleted !== true && ( field.extensions || field.extensions.indexOf(extractExt(x.src))!==-1 )
        (x.__deleted !== true && (field.extensions || field.extensions.indexOf(extractExt(x.src))!==-1))
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

    return (
      <React.Fragment>
        <div style={{padding:'16px 0'}}>
          <strong>{field.title?field.title:"Page files"}</strong>
          <br/>
        { field.path.substring(0,1) === '/' ?
          <React.Fragment>
          <IconButton
            color="primary"
            aria-label="directions"
            onClick={()=>{
              service.api.openFileExplorer(field.path, false);
            }}
            size="large">
            <FolderIcon />
          </IconButton>
            {field.path}
          </React.Fragment>
          :null}

        </div>
        { showAddButton && field.addButtonLocationTop ?

            <Button
              style={{marginBottom:'16px', marginTop:itemsStates.length?'0px':undefined}}
              startIcon={<FolderOpen />} variant="contained"  onClick={(e)=>{
              this.onButtonClick(e)
              }}>
              Add File
            </Button>

            :null
        }
        <BundleManager forceActive={true}>

          { (itemsStates).map((state: FileReferenceWithDeleted, childIndex: number)=>{

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
              active={false}
              onHeadClick={()=>{}}
              headerRightItems={[
                <DangerButton
                onClick={(e: any, loaded: any)=>{
                  e.stopPropagation();
                  if(loaded){
                    this.removeItemWithValue(state)
                  }
                }}
                loadedProps={{}}
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
              startIcon={<FolderOpen />} variant="contained"  onClick={(e)=>{
              this.onButtonClick(e)
              }}>
              Add File
            </Button>

            :null
        }
      </React.Fragment>
    );
  }

  getValue(context: any){
    return context.node.state['resources'].slice(0);
  }
  setValue(context: any, value: any){
    context.node.state['resources'] = value;
  }
  clearValue(context: any){
    delete context.node.state['resources'];
  }
}

export default BundleManagerDynamic;
