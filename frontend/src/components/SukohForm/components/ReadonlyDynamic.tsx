import React from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import TextField from '@mui/material/TextField';
import Tip from '../../Tip';
import type { FieldBase, BaseDynamicProps, BaseDynamicState } from '../../HoForm';
import { BaseDynamic } from '../../HoForm';

interface ReadonlyDynamicField extends FieldBase {
  title: string;
  tip?: string;
  default?: string;
  multiLine?: boolean;
}

type ReadonlyDynamicProps = BaseDynamicProps<ReadonlyDynamicField>;

type ReadonlyDynamicState = BaseDynamicState;

class ReadonlyDynamic extends BaseDynamic<ReadonlyDynamicProps, ReadonlyDynamicState> {

  normalizeState({state, field} : { state: any, field: ReadonlyDynamicField }){
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
