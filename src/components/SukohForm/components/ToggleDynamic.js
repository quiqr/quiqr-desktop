import React            from 'react';
import Switch           from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormItemWrapper  from './shared/FormItemWrapper';
import Tip              from '../../Tip';
import { BaseDynamic } from '../../HoForm';

class ToggleDynamic extends BaseDynamic {

  normalizeState({state, field, stateBuilder}){
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
