import React from 'react';
import type {FormStateBuilder } from '../../HoForm';
import { BaseDynamic } from '../../HoForm';
import FormItemWrapper from './shared/FormItemWrapper';
import MenuItem from 'material-ui-02/MenuItem';
import SelectField from 'material-ui-02/SelectField';
import Tip from '../../Tip';

type SelectDynamicField = {
  key: string,
  compositeKey: string,
  type: string,
  default: ?string,
  tip: ?string,
  title: ?string,
  options: Array<{value:string, text:string}>,
  multiple: ?bool
}

type SelectDynamicState = {

}

class SelectDynamic extends BaseDynamic<SelectDynamicField,SelectDynamicState> {

  normalizeState({state, field} : { state: any, field: SelectDynamicField, stateBuilder: FormStateBuilder }){
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
    return 'select';
  }

  handleChange = (e: any, index: number, payload: Array<string>)=>{
    let {context} = this.props;
    let field = context.node.field;
    let val;

    if(field.multiple===true){
      context.setValue(payload)
    }
    else{

      if(typeof field.options[index] === "string"){
        val = field.options[index]
      }
      else{
        val = field.options[index].value
      }

      if(val !== context.value){
        context.setValue(val)
      }
    }

    if(field.autoSave === true){
      context.saveFormHandler();
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

    return (
      <FormItemWrapper
    control={<SelectField
    floatingLabelText={field.title}
    floatingLabelFixed={true}
    value={context.value}
    multiple={field.multiple===true}
    onChange={this.handleChange}
    fullWidth={true}
  >
      {field.options.map((option, i)=>{
        let val, text;
        if(typeof option === "string"){
          val = option
          text = option
        }
        else{
          val = option.value
          text = option.text
        }
        return (
          <MenuItem key={i} value={val} primaryText={text} />
        )
      })}
        </SelectField>}
        iconButtons={iconButtons}
      />);
  }
}

export default SelectDynamic;
