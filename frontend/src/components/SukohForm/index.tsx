import * as React                  from 'react';
import { Form, ComponentRegistry } from '../HoForm';
import Fab                         from '@mui/material/Fab';
import CheckIcon                   from '@mui/icons-material/Check';
import dynamicFormComponents       from './components/all'
import service                     from './../../services/service'

const componentRegistry = new ComponentRegistry(dynamicFormComponents);

interface SaveContext {
  accept: (updatedValues: any) => void;
  reject: (msg?: string) => void;
  data: any;
}

type SukohFormProps = {
  siteKey: string;
  workspaceKey: string;
  collectionKey?: string;
  singleKey?: string;
  collectionItemKey?: string;
  fields: any;
  buildActions?: any;
  plugins?: any;
  rootName?: string;
  pageUrl?: string;
  hideExternalEditIcon?: boolean;
  values: any;
  onOpenInEditor?: any;
  onDocBuild?: any;
  onSave?: (context: SaveContext) => void;
  hideSaveButton?: boolean;
  refreshed?: boolean;
};

type SukohFormState = {
  actionButtonRightPos: number;
  changed: boolean;
  error: string | null;
  savedOnce: boolean;
};

export class SukohForm extends React.Component<SukohFormProps, SukohFormState>{
  _ismounted?: boolean;
  _valueFactory?: () => any;

  constructor(props: SukohFormProps){
    super(props);
    this.state = {
      actionButtonRightPos:380,
      changed: false,
      error: null,
      savedOnce: false
    }
  }

  keydownHandler(e : any){
    var keyCode = e.keyCode || e.which;

    if (e.ctrlKey && keyCode === 83) {
      if(this.state.changed){
        this.saveContent();
      }
      return;
    }
  }

  componentDidMount(){
    this._ismounted=true;
    service.api.shouldReloadForm(null);
    document.addEventListener('keydown', this.keydownHandler.bind(this));
  }

  componentWillUnmount(){
    document.removeEventListener('keydown', this.keydownHandler);
    this._ismounted=false;
  }

  saveContent(){

    if(this.props.onSave){

      var context: SaveContext = {
        accept: (_updatedValues: any) => {

          //this is a rule dependency that must be resolved in the "server" and the changes must be merged in the document
          // if(this.state.document.resources){
          //     this.state.document.resources = this.state.document.resources.filter(x => !x.__deleted===true);
          // }

          this.setState({
            changed: false,
            savedOnce:true
            //document:updatedValues,   //THIS IS A BAD IDEA! BAD WAY TO APPLY CHANGES FROM A SERVER
            //THE FORM WILL HAVE PROBLEMS. WE MUST UPDATE THE DOCUMENT, NOT REPLACE IT
            //THE DOC - AGAINST ALL RECOMMENDATIONS - IS MUTABLE
            // WE MUST FIND A WAY TO UPDATE THIS WITHOUT REPLACING IT
          });
        },
        reject: (msg?: string) => {
          this.setState({error: msg || 'Error'});
        },
        data: Object.assign({}, this._valueFactory!())
      }

      this.props.onSave.call(this, context);

      service.api.reloadCurrentForm();
      //let updatedValues = this.props.onSave.call(this, context);
    }
    else{
      this.setState({error: 'Save not implemented'});
    }
  }

  handleFormChange(valueFactory: () => any){

    this._valueFactory = valueFactory;
    if(!this.state.changed){
      this.setState({changed:true});
    }
  }

  render(){

    let floatingActionButtonClass = 'animated';
    if(!this.state.savedOnce) floatingActionButtonClass+=' zoomIn';
    if(this.state.changed) floatingActionButtonClass+=' rubberBand';

    let refreshed = false;
    if(this.props.refreshed){
      refreshed = true;
    }

    const fabButton = (
      <Fab
        style={{
          position:'fixed',
          right:this.state.actionButtonRightPos,
          bottom:'20px',
          zIndex:3
        }}
        className={floatingActionButtonClass}
        disabled={!this.state.changed}
        onClick={()=> this.saveContent()}

        color="primary" aria-label="add">
        <CheckIcon />
      </Fab>
    )

    return (
      <React.Fragment>
        <Form
          plugins={this.props.plugins}
          debug={false}
          componentRegistry={componentRegistry}
          siteKey={this.props.siteKey}
          workspaceKey={this.props.workspaceKey}
          collectionKey={this.props.collectionKey}
          singleKey={this.props.singleKey}
          refreshed={refreshed}
          collectionItemKey={this.props.collectionItemKey}
          fields={this.props.fields}
          buildActions={this.props.buildActions}
          rootName={this.props.rootName}
          saveFormHandler={()=>this.saveContent()}
          pageUrl={this.props.pageUrl}
          hideExternalEditIcon={this.props.hideExternalEditIcon}
          values={this.props.values}
          onChange={this.handleFormChange.bind(this)}
          onOpenInEditor={this.props.onOpenInEditor || (() => {})}
        />
        { this.props.hideSaveButton ? null :
            fabButton
        }
        <div style={{height:'70px'}}></div>
      </React.Fragment>
    );
  }
}
