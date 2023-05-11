import React from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import TextField from '@material-ui/core/TextField';
import Tip from '../../Tip';
import type { FormStateBuilder } from '../../HoForm';
import { BaseDynamic } from '../../HoForm';

type ReadonlyDynamicField = {
  key: string,
  compositeKey: string,
  type: string,
  title: string,
  tip: ?string,
  default: ?string,
  multiLine: ?bool
}

type ReadonlyDynamicState = {

}

class ReadonlyDynamic extends BaseDynamic<ReadonlyDynamicField,ReadonlyDynamicState> {

  normalizeState({state, field} : { state: any, field: ReadonlyDynamicField, stateBuilder: FormStateBuilder }){
    let key = field.key;
    if(state[key]===undefined){
      state[key] = field.default || '';
    }
  }

  getType(){
    return 'readonly';
  }

  renderComponent(){

    let {context} = this.props;
    let {node, currentPath, parentPath} = context;
    let {field} = node;

    if(currentPath!==parentPath){
      return (null);
    }

    let iconButtons = [];
    if(field.tip) iconButtons.push(<Tip markdown={field.tip} />)

    return (<FormItemWrapper
    control={<TextField
    value={context.value||''}
    disabled={true}
    multiline={field.multiLine===true}
    fullWidth={true}
    label={field.title} />
    }
    iconButtons={iconButtons}
  />);
  }
}

export default ReadonlyDynamic;
