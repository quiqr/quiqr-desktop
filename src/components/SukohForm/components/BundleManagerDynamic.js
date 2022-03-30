import React from 'react';
import IconUpload from 'material-ui-02/svg-icons/file/folder-open';
import RaisedButton from 'material-ui-02/RaisedButton';
import { BundleManager, BundleManagerItem } from '../../BundleManager';
import DangerButton from '../../DangerButton';
import FlatButton from 'material-ui-02/FlatButton';
import IconRemove from 'material-ui-02/svg-icons/action/delete';
import type { ComponentContext, DynamicFormNode, FieldBase } from '../../HoForm';
import { BaseDynamic } from '../../HoForm';
import path from 'path';

import service from '../../../services/service';

const regExtractExt = /[.]([^.]+)$/
const extractExt = (file) => {
  return file.replace(regExtractExt,'$1');
}

type BundleManagerDynamicField= {
  key: string,
  compositeKey: string,
  type: string,
  src: string,
  fields: Array<any>,
  path: string,
  extensions: Array<string>,
  title: string
}


class BundleManagerDynamic extends BaseDynamic<BundleManagerDynamicField,void> {

  constructor(props: ComponentProps<BundleManagerDynamicField>){
    super(props);

    this.state = {
      absFiles: []
    };
  }

  extendField(field: BundleManagerDynamicField, fieldExtender : any){
    if(field.fields===undefined)
      field.fields = [];
    //field.fields.unshift({ key:'src', type:'readonly', title:'Source File' });
    fieldExtender.extendFields(field.fields);


  }

  buildPathFragment(node: DynamicFormNode<BundleManagerDynamicField>, nodeLevel: number, nodes: Array<DynamicFormNode<FieldBase>>): ?string {
    return undefined;
  }

  /*
  componentDidMount(){
    let {context} = this.props;
    let {field} = context.node;

  }
  */
  componentDidMount(){
    this.checkRootPathFiles();
  }

  componentDidUpdate(preProps: HomeProps){
    this.checkRootPathFiles();
  }

  checkRootPathFiles(){
    let {context} = this.props;
    let {field} = context.node;

    if(field.path.charAt(0) == "/" || field.path.charAt(0) == "\\"){
      service.api.getFilesFromAbsolutePath(field.path).then((files)=>{

        if(this.state.absFiles.length == 0){
          this.setState({absFiles: files});
        }
      });
    }
  }


  normalizeState({state, field, stateBuilder} : {state:any, field:BundleManagerDynamicField, stateBuilder: any}){
    if(!Array.isArray(state['resources'])){
      state['resources'] = [];
    }
    for(let r = 0; r < state['resources'].length; r++){
      let resource = state['resources'][r];

      if(!field.extensions){
        field.extensions= [];
      }
      if(resource.src.startsWith(field.path) && ( field.extensions || field.extensions.indexOf(extractExt(resource.src.src))!==-1)){
        stateBuilder.setLevelState(resource, field.fields);
      }
    }


  }

  getType(){
    return 'bundle-manager';
  }

  allocateStateLevel(field: BundleManagerDynamicField, parentState: any, rootState: any){
    return rootState;
 }

  onButtonClick(e: any){

    let {context} = this.props;
    let {field} = context.node;

    if(field.extensions.length === 0){
      delete field.extensions;
    }

    context.form.props.plugins.openBundleFileDialog({title:field.title, extensions: field.extensions, targetPath: field.path})
      .then((files)=>{
        if(files){
          let currentFiles = context.value.slice();
          //let newItems = [];
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

  removeItemWithValue(state: any){
    state.__deleted = true;
    let { context } = this.props;

    context.setValue(context.value);
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

    if(this.state.absFiles.length > 0 ){
      itemsStates = this.state.absFiles;
    }
    else{

      itemsStates = context.value.filter(x => {

        return (
          x.src.startsWith(field.path) && x.__deleted!==true
          && ( field.extensions || field.extensions.indexOf(extractExt(x.src))!==-1 )
        );
      });
    }


    return (<React.Fragment>
      <div style={{padding:'16px 0'}}>
        <strong>{field.title?field.title:"Page files"}</strong>
      </div>

      <BundleManager forceActive={true}>

        { (itemsStates).map((state,childIndex)=>{

          let newNode = {
            field,
            state,
            uiState:{},
            parent: node
          };

          if(this.state.absFiles.length > 0 ){
            newNode.state.src = path.join(field.path, state.src);
          }


          let filename = state.name||state.src;
          let _farr = filename.split('.');
          let fName = _farr[0];
          let fExtention = _farr[1];
          if(fName.length > 25){
            filename = fName.substr(0,10) + "..." + fName.substr(-5) + "." +fExtention;
          }

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
              loadedButton={<FlatButton secondary={true} style={{minWidth:40}} icon={<IconRemove />} />}
              button={<FlatButton style={{minWidth:40}} icon={<IconRemove opacity={.5} />} />}
            />
            ]}
            />)
        }) }
          </BundleManager>


          <RaisedButton
          primary={true}
          label="Add file"
          style={{marginBottom:'16px', marginTop:itemsStates.length?'0px':undefined}}
          onClick={this.onButtonClick.bind(this)}
          icon={<IconUpload />} />

        </React.Fragment>);
  }

  getValue(context: ComponentContext<BundleManagerDynamicField>){
    return context.node.state['resources'].slice(0);
  }
  setValue(context: ComponentContext<BundleManagerDynamicField>, value: any){
    context.node.state['resources'] = value;
  }
  clearValue(context: ComponentContext<BundleManagerDynamicField>){
    delete context.node.state['resources'];
  }
}

export default BundleManagerDynamic;
