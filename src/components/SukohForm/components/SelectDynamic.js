import React           from 'react';
import InputLabel      from '@material-ui/core/InputLabel';
import MenuItem        from '@material-ui/core/MenuItem';
import FormControl     from '@material-ui/core/FormControl';
import Select          from '@material-ui/core/Select';
import FormItemWrapper from './shared/FormItemWrapper';
import { BaseDynamic } from '../../HoForm';
import Tip             from '../../Tip';

class SelectDynamic extends BaseDynamic {

  normalizeState({state, field}){
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

  handleChange(e){
    let {context} = this.props;
    let field = context.node.field;
    let val;

    if(e.target.options && field.multiple===true){
      const { options } = e.target;
      const value = [];
      for (let i = 0, l = options.length; i < l; i += 1) {
        if (options[i].selected) {
          value.push(options[i].value);
        }
      }
      context.setValue(val)
    }
    else{
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
        control={

          <FormControl >
            <InputLabel id="demo-controlled-open-select-label">{field.title}</InputLabel>
            <Select
              labelId="demo-controlled-open-select-label"
              id="demo-controlled-open-select"
              multiple={field.multiple===true}
              value={context.value}
              onChange={(e)=>this.handleChange(e)}
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
                  <MenuItem key={i} value={val}>{text}</MenuItem>
                )
              })}
            </Select>
          </FormControl>
        }
        iconButtons={iconButtons}
      />);
  }
}

export default SelectDynamic;
