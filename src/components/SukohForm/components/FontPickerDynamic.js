import React from 'react';
import type {FormStateBuilder } from '../../HoForm';
import { BaseDynamic } from '../../HoForm';
import FormItemWrapper from './shared/FormItemWrapper';
import MenuItem from 'material-ui-02/MenuItem';
import SelectField from 'material-ui-02/SelectField';
import Tip from '../../Tip';

type FontPickerDynamicField = {
  key: string,
  compositeKey: string,
  type: string,
  default: ?string,
  tip: ?string,
  title: ?string,
  options: Array<{value:string, text:string}>,
  multiple: ?bool
}

type FontPickerDynamicState = {

}

class FontPickerDynamic extends BaseDynamic<FontPickerDynamicField,FontPickerDynamicState> {

  normalizeState({state, field} : { state: any, field: FontPickerDynamicField, stateBuilder: FormStateBuilder }){
    //TODO: clear if value is not a valid option
    let key = field.key;
    let isArrayType = field.multiple===true;
    if(state[key]===undefined){
      state[key] = field.default || isArrayType?[]:'';
    }
    else{
      if(isArrayType && !Array.isArray(state[key])){
        state[key] = [state[key].toString()];
      }
      else if(!isArrayType && typeof(state[key])!=='string'){
        state[key] = state[key].toString();
      }
    }
  }

  getType(){
    return 'font-picker';
  }

  handleChange = (e: any, index: number, payload: Array<string>)=>{
    let {context} = this.props;
    let field = context.node.field;

    if(field.multiple===true){
      context.setValue(payload)
    }
    else{
      if(field.options[index].value!==context.value)
        context.setValue(field.options[index].value)
    }
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
    control={<SelectField
    underlineShow={true}
    floatingLabelText={field.title}
    floatingLabelFixed={true}
    value={context.value}
    multiple={field.multiple===true}
    onChange={this.handleChange}
    fullWidth={true}
  >
      {field.options.map((option, i)=>(
        <MenuItem key={i} value={option.value} primaryText={option.text} />
      ))}
        </SelectField>}
        iconButtons={iconButtons}
      />);
  }
}

export default FontPickerDynamic;
