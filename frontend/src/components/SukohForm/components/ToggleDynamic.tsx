import React            from 'react';
import Switch           from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormItemWrapper  from './shared/FormItemWrapper';
import Tip              from '../../Tip';
import { BaseDynamic, BaseDynamicProps, BaseDynamicState, FieldBase } from '../../HoForm';

export interface ToggleDynamicField extends FieldBase {
  default?: boolean;
  title?: string;
  tip?: string;
}

type ToggleDynamicProps = BaseDynamicProps<ToggleDynamicField>;

type ToggleDynamicState = BaseDynamicState;

class ToggleDynamic extends BaseDynamic<ToggleDynamicProps, ToggleDynamicState> {

  normalizeState({state, field}: {state: any; field: ToggleDynamicField; stateBuilder: any}){
    let key = field.key;
    if(state[key]===undefined){
      state[key] = field.default!==undefined?field.default:false;
    }
  }

  getType(){
    return 'boolean';
  }

  renderComponent(){

    let {context} = this.props;
    let {node, currentPath} = context;
    let {field} = node;

    if(currentPath!==context.parentPath){
      return (null);
    }

    let iconButtons = [];
    if(field.tip) iconButtons.push(<Tip markdown={field.tip} />);

    return (
      <FormItemWrapper
        control={
          <FormControlLabel
            label={field.title}
            control={
              <Switch
                checked={context.value===true}
                onChange={function(e,value){
                  context.setValue(value)
                }}
              />}
          />}
        iconButtons={iconButtons}
      />);
  }
}

export default ToggleDynamic;
