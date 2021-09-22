import * as React                                                                  from 'react';
import { Route }                                                                   from 'react-router-dom'
import IconOpenBrowser                                                             from 'material-ui-02/svg-icons/action/open-in-browser';
import IconOpenEditor                                                              from 'material-ui-02/svg-icons/action/description';
import IconBack                                                                    from 'material-ui-02/svg-icons/navigation/arrow-back';
import { IconButton }                                                              from 'material-ui-02';
import { ComponentContext }                                                        from './component-context';
import { Debounce }                                                                from './debounce';
import type { FieldBase, FieldBaseGroup, DynamicFormNode, BreadcumbComponentType } from './types';
import { ComponentRegistry }                                                       from './component-registry';
import { FormStateBuilder }                                                        from './form-state-builder';
import service                                                                     from '../../services/service';
import { FieldsExtender }                                                          from './fields-extender';

const Fragment = React.Fragment;
const componentMarginTop = '16px';

type FormProps = {
  values: any,
  fields: Array<any>,
  debug: bool,
  rootName: string,
  componentRegistry: ComponentRegistry,
  breadcumbComponentType : BreadcumbComponentType,
  plugins: any,
  onChange? : ( valuesGetter: ()=>any )=>void
}

type FormState = {
  path: string,
  document: any,
  fields: Array<any>, //we're going to use the fields from the state instead of the fields from props - it can't mutate
  renderError: ?string
}

class Form extends React.Component<FormProps,FormState> {

  currentNode : DynamicFormNode<FieldBase>;
  root : DynamicFormNode<FieldBase>;
  cache: any = {};
  stateBuilder: FormStateBuilder;
  forceUpdateThis: ()=>void;

  constructor(props : FormProps) {

    super(props);
    this.stateBuilder = new FormStateBuilder(this.props.componentRegistry);

    try{
      let fields = JSON.parse(JSON.stringify(props.fields));
      (new FieldsExtender(this.props.componentRegistry)).extendFields(fields);

      let formState = JSON.parse(JSON.stringify(props.values||{}));
      this.stateBuilder.makeRootState(fields, formState);

      let root = {
        field:{
          key:'root',
          compositeKey: 'root',
          type:'root'
        },
        state: null,
        parent: (null),
        uiState: (null)
      };
      this.root = root;
      this.currentNode = root;
      this.state = {
        document: formState,
        path: 'ROOT/',
        fields: fields,
        renderError: null
      };

      this.forceUpdateThis = this.forceUpdate.bind(this);
      this.getFormDocumentClone = this.getFormDocumentClone.bind(this);
    }
    catch(error){
      this.state = {
        document: {},
        path: '',
        fields: [],
        renderError: error.message
      }
    }
  }

  static shapeDocument(updatedDoc: {}, doc: {}){

  }

  componentDidCatch(error: Error , info: string) {
    this.setState({ renderError: error.message });
    console.warn(error, info);
  }

  static getDerivedStateFromProps(props: FormProps, state: FormState){
    return null;
  }

  generateParentPath(){
    let encodedSiteKey = this.props.siteKey ? encodeURIComponent(this.props.siteKey) : '';
    let encodedWorkspaceKey = this.props.workspaceKey ? encodeURIComponent(this.props.workspaceKey) : '';
    let basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}`;
    let itemType = "collections";

    let newPath = `${basePath}/${itemType}/${encodeURIComponent(this.props.collectionKey)}`;
    return newPath;
  }

  setPath(node : DynamicFormNode<FieldBase>){
    if(this.props.collectionItemKey && node.field.compositeKey === 'root'){
      this.history.push(this.generateParentPath());
    }
    else{
      window.scrollTo(0,0);
      this.currentNode = node;
      this.setState({path: this.buildPath(node)});
    }
  }

  buildPath(currentNode : ?DynamicFormNode<FieldBase>) : string{
    if(currentNode==null)
      return '';
    let path = '';
    let nodes = [];
    let nodeLevel = 0;
    do{
      if(currentNode==null) break;
      nodes.push(currentNode);
      if(currentNode===this.root){
        path = 'ROOT/' + path;
      }
      else{
        let componentProplessInstace = this.props.componentRegistry.getProplessInstance(currentNode.field.type);
        if(componentProplessInstace){
          let fragment = componentProplessInstace.buildPathFragment(currentNode, nodeLevel++, nodes);
          if(fragment) {
            path = fragment + '/' + path;
          }
        }
        else{
          throw new Error('Could not find component of type '+currentNode.field.type);
        }
      }
      if(currentNode.parent==null) break;
      else{ currentNode = currentNode.parent; }
    } while(true);

    return path;
  }

  renderField(node : DynamicFormNode<FieldBase>, onValueChanged : ?(value: any) => void){

    service.api.logToConsole(node.field.key, "renderField key");

    var {field} = node;
    let component = this.props.componentRegistry.get(field.type);
    try{

      if(component===undefined)
        throw new Error('Could not find component of type '+field.type);

      node.state = component.proplessInstance.allocateStateLevel(field, node.state, this.state.document);

      let nodePath = this.buildPath(node);
      let parentPath = this.buildPath(node.parent);

      let context = new ComponentContext(this, node, this.state.path, parentPath, nodePath,component.proplessInstance, onValueChanged);

      let DynamicComponent = component.classType;
      return (<DynamicComponent
        key={field.key}
        context={context} />);
    }
    catch(e){
      console.warn(e);
      return (null);
    }
  }

  handleOpenFileInEditor() {
    if(this.props.pageUrl){
      window.require('electron').shell.openExternal(this.props.pageUrl);
    }
  }

  handleOpenPageInBrowser() {
    if(this.props.pageUrl){
      window.require('electron').shell.openExternal(this.props.pageUrl);
    }
  }
  handleBackButton(){
    this.history.push(this.generateParentPath());
  }
  handleAlignMobilePreview(){
    if(this.props.pageUrl){
      service.api.openMobilePreview();
      service.api.updateMobilePreviewUrl(this.props.pageUrl);
    }
  }

  /**
   * Render a level of components
   * Can be used recursively when called by a component
   *
   * @field - the parent field config of the level
   * @state - the level state
   * @uiState - item in e.g. accordion, matches last number in breadcumb number
   * @parent - the previous renderLevel context object
   */
  renderLevel({ field, state, uiState, parent}: DynamicFormNode<FieldBaseGroup>): React.Node {

    service.api.logToConsole(uiState, "uistate");
    if(this.props.debug)
      service.api.logToConsole('RENDER LEVEL');

    const fieldsElements = field.fields.map(function(childField){
      let data = {field:childField, state:state, uiState, parent};
      let field = this.renderField(data);
      if(this.props.debug)
        service.api.logToConsole('FIELD', data, field, this.buildPath(data));
      return field;
    }.bind(this));

    return (
      <Fragment>{fieldsElements}</Fragment>
    );
  }

  getFormDocumentClone = ()=>{
    return JSON.parse(JSON.stringify(this.state.document));
  }

  forceUpdateDebounce: Debounce = new Debounce();
  handleChange(node: any, debounce: number){
    this.forceUpdateDebounce.run(this.forceUpdateThis, debounce);

    if(this.props.onChange!=null){
      this.props.onChange(this.getFormDocumentClone);
    }
  }

  renderBreadcumb(){

    let currentNode = this.currentNode;
    //let nodeLevel = 0;

    let items = [];
    let nodes = [];

    try{
      do{
        nodes.push(currentNode);
        if(currentNode===this.root){
          if(this.props.collectionItemKey){

            items.push({label: this.props.rootName||'ROOT', node:currentNode});
          }
          else{
            items.push({label: this.props.rootName||'ROOT', node:currentNode});
          }
        }
        else{
          let componentPropslessInstace = this.props.componentRegistry.getProplessInstance(currentNode.field.type);
          if(componentPropslessInstace && componentPropslessInstace.buildBreadcumbFragment){
            componentPropslessInstace.buildBreadcumbFragment(currentNode, items);
          }
          else{
            throw new Error('Could not find component of type '+currentNode.field.type);
          }
        }
        currentNode = currentNode.parent;
      } while(currentNode);
    }
    catch(e){
      items.push({label: 'Error', node:this.root});
    }

    items.reverse();

    if(this.props.collectionItemKey){
      items.push({label: this.props.collectionItemKey, node:null});
    }


    let Breadcumb = this.props.breadcumbComponentType;
    return <Breadcumb items={items} onNodeSelected={this.setPath.bind(this)} />;
  }

  getCurrentNodeDebugInfo(){
    let path;
    try{
      path = this.buildPath(this.currentNode)
    }
    catch(e){
      path = e;
    }
    return { path: path };
  }

  render(){

    if(this.state.renderError)
      return (<p style={{color:'red', padding:'24px'}}>{this.state.renderError}</p>)

    let breadcumb = this.renderBreadcumb();

    let form = (<div key={'dynamic-form'} style={{padding:'20px'}}>

      <div style={Object.assign({position : 'relative', paddingBottom: '16px', width:'100%', display:'flex'})}>

        { this.props.collectionKey ?
          <IconButton touch={true} onClick={()=>{this.handleBackButton();}}>
            <IconBack color="" style={{}} />
          </IconButton>
          : undefined}

          <div style={Object.assign({flexGrow:1})}>
            {breadcumb}
          </div>
          <IconButton touch={true} onClick={()=>{this.props.onOpenInEditor();}}>
            <IconOpenEditor color="" style={{}} />
          </IconButton>

          { this.props.pageUrl ?
              <IconButton touch={true} onClick={()=>{this.handleOpenPageInBrowser();}}>
                <IconOpenBrowser color="" style={{}} />
              </IconButton>
              : undefined}

              {/* this.props.pageUrl ?
                        <IconButton touch={true} onClick={()=>{this.handleAlignMobilePreview();}}>
                    <IconView color="" style={{}} />
                </IconButton>
                : undefined*/}

              </div>

      {this.renderLevel({
        field: {fields: this.state.fields, key:'root', compositeKey:'root', type:'root' },
        state: this.state.document,
        uiState: undefined,
        parent: this.root
      })}

      { this.props.debug ?
          <div style={{marginTop: componentMarginTop, overflow: 'auto', border: 'solid 1px #e8e8e8', borderRadius:'7px'}}>
          <pre style={{padding:16, margin:0, whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
            {JSON.stringify(this.getCurrentNodeDebugInfo())}
          </pre>

          <pre style={{padding:16, margin:0, whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
            {JSON.stringify(this.state, null,'   ')}
          </pre>
          </div> : undefined }


      </div>);

    return (<Route render={({history})=>{

      this.history = history;
      return form }}
  />);


  }
}

export default Form;
