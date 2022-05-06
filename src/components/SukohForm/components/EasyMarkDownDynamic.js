import * as React from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import Tip from '../../Tip';
import { BaseDynamic } from '../../HoForm';
//import service                              from './../../../services/service'

type EasyMarkdownDynamicField = {
  key: string,
  compositeKey: string,
  type: string,
  default: ?string,
  multiLine: ?bool,
  tip: ?string,
  title: ?string
}

type EasyMarkdownDynamicState = {

}
const autofocusNoSpellcheckerOptions = {
  autofocus: false,
  spellChecker: false,
};

class EasyMarkdownDynamic extends BaseDynamic<EasyMarkdownDynamicField,EasyMarkdownDynamicState> {

  normalizeState({state, field}: {state: any, field: EasyMarkdownDynamicField}){
    let key = field.key;
    if(state[key]===undefined){
      state[key] = field.default || '';
    }
  }

  getType(){
    return 'easymde';
  }

  handleChange = (e: Event, value: any)=>{
    this.forceUpdate();
    this.props.context.setValue(e, 250);
  }

  renderComponent(){

    let {context} = this.props;
    let {node, currentPath, parentPath} = context;
    let {field} = node;

    if(currentPath!==parentPath){
      return (null);
    }

    let iconButtons = [];
    if(field.tip) iconButtons.push(<Tip markdown={field.tip} />);

    return (<FormItemWrapper
    control={
      <SimpleMDE
      options={autofocusNoSpellcheckerOptions}
      value={context.value} onChange={this.handleChange} />



    }
      iconButtons={iconButtons}
    />);
  }
}

export default EasyMarkdownDynamic;
