import React                     from 'react';
import FormItemWrapper           from './shared/FormItemWrapper';
import TextField from '@material-ui/core/TextField';
import Tip                       from '../../Tip';
import type { FormStateBuilder } from '../../HoForm';
import { BaseDynamic }           from '../../HoForm';
import IconRefresh               from '@material-ui/icons/Refresh';
import Button                    from '@material-ui/core/Button';

type UniqDynamicField = {
  key: string,
  compositeKey: string,
  type: string,
  title: string,
  tip: ?string,
  default: ?string,
  multiLine: ?bool
}

type UniqDynamicState = {

}

class UniqDynamic extends BaseDynamic<UniqDynamicField,UniqDynamicState> {

  normalizeState({state, field} : { state: any, field: UniqDynamicField, stateBuilder: FormStateBuilder }){
    let key = field.key;
    if(state[key]===undefined){
      state[key] = field.default || '';
    }
  }

  getType(){
    return 'uniq';
  }

  createToken() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + '-' + s4() + '-' + s4();
  }

  onButtonClick(e: any){
    let {context} = this.props;
    context.value = this.createToken();
    this.props.context.setValue(context.value);
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


    if(!context.value || context.value === '' || typeof context.value == 'undefined'){
      context.value = this.createToken();
      this.props.context.setValue(context.value);
    }

    return (<FormItemWrapper
    control={
      <div>
        <TextField
          value={context.value}
          multiline={field.multiLine===true}
          fullWidth={true}
          label={field.title} />

        <Button
          startIcon={<IconRefresh />}
          variant="contained"
          style={{marginBottom:'16px',float:'right'}}
          onClick={()=>{
            this.onButtonClick();
          }}>
          Generate new token
        </Button>

      </div>


    }
    iconButtons={iconButtons}
  />);
  }
}

export default UniqDynamic;
