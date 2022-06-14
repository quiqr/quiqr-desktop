import * as React                  from 'react';
import { Form, ComponentRegistry } from '../HoForm';
import { FloatingActionButton }    from 'material-ui-02/';
import { FormBreadcumb }           from '../Breadcumb';
import IconCheck                   from 'material-ui-02/svg-icons/navigation/check';
import dynamicFormComponents       from './components/all'
import service                     from './../../services/service'

const componentRegistry = new ComponentRegistry(dynamicFormComponents);

export class SukohForm extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      actionButtonRightPos:380,
      changed: false,
      error: null,
      savedOnce: false
    }
  }

  keydownHandler(e : any){
    e = e || window.event;
    var keyCode = e.keyCode || e.which;

    if (e.ctrlKey && keyCode === 83) {
      if(this.state.changed){
        this.saveContent();
      }
      return;
    }
  }

  setMobileBrowserOpen(){
    if(this._ismounted){
      this.setState({actionButtonRightPos:380});
    }
  }
  setMobileBrowserClose(){
    if(this._ismounted){
      this.setState({actionButtonRightPos:40});
    }
  }

  componentDidMount(){
    this._ismounted=true;
    service.api.shouldReloadForm(null);
    document.addEventListener('keydown', this.keydownHandler.bind(this));
    window.require('electron').ipcRenderer.on('setMobileBrowserOpen', this.setMobileBrowserOpen.bind(this));
    window.require('electron').ipcRenderer.on('setMobileBrowserClose', this.setMobileBrowserClose.bind(this));
  }

  componentWillUnmount(){
    document.removeEventListener('keydown', this.keydownHandler);
    window.require('electron').ipcRenderer.removeListener('setMobileBrowserOpen', this.setMobileBrowserOpen.bind(this));
    window.require('electron').ipcRenderer.removeListener('setMobileBrowserClose', this.setMobileBrowserClose.bind(this));
    this._ismounted=false;
  }

  saveContent(){
    if(this.props.onSave){
      var context = {
        accept: function(updatedValues){

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
        }.bind(this),
        reject: function(msg){
          this.setState({error: msg || 'Error'});
        }.bind(this),
        data: Object.assign({}, this._valueFactory())
      }
      this.props.onSave.call(this, context);

      service.api.reloadCurrentForm();
      //let updatedValues = this.props.onSave.call(this, context);
    }
    else{
      this.setState({error: 'Save not implemented'});
    }
  }

  handleFormChange(valueFactory){
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

    return (
      <React.Fragment>
        <Form
          debug={false}
          breadcumbComponentType={FormBreadcumb}
          componentRegistry={componentRegistry}
          siteKey={this.props.siteKey}
          workspaceKey={this.props.workspaceKey}
          collectionKey={this.props.collectionKey}
          refreshed={refreshed}
          collectionItemKey={this.props.collectionItemKey}
          fields={this.props.fields}
          plugins={this.props.plugins}
          rootName={this.props.rootName}
          saveFormHandler={()=>this.saveContent()}
          pageUrl={this.props.pageUrl}
          values={this.props.values}
          onChange={this.handleFormChange.bind(this)}
          onOpenInEditor={this.props.onOpenInEditor}
        />
        <FloatingActionButton
          style={{
            position:'fixed',
            right:this.state.actionButtonRightPos,
            bottom:'20px',
            zIndex:3
          }}
          className={floatingActionButtonClass}
          disabled={!this.state.changed}
          primary={'true'}
          onClick={()=> this.saveContent()}
        >
          <IconCheck />
        </FloatingActionButton>
        <div style={{height:'70px'}}></div>
      </React.Fragment>
    );
  }
}
