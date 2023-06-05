import React           from 'react';
import InputLabel      from '@material-ui/core/InputLabel';
import FormControl     from '@material-ui/core/FormControl';
import TextField       from '@material-ui/core/TextField';
import FormItemWrapper from './shared/FormItemWrapper';
import { BaseDynamic } from '../../HoForm';
import Tip             from '../../Tip';
import { IconPicker }  from 'react-fa-icon-picker'
//import service         from '../../../services/service';

class FontIconPickerDynamic extends BaseDynamic {

  constructor(props){
    super(props);
    this.state = {
      value: '',
    };
  }

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
    return 'fonticon-picker';
  }

  handleChange(e){
    let {context} = this.props;
    let field = context.node.field;

    if(e.target.options && field.multiple===true){
      const { options } = e.target;
      const value = [];
      for (let i = 0, l = options.length; i < l; i += 1) {
        if (options[i].selected) {
          value.push(options[i].value);
        }
      }
      context.setValue(e.target.value)
    }
    else{
      if(e.target.value !== context.value){
        context.setValue(e.target.value)
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

    /*
    service.api.getValueByConfigPath("singles", field.if).then((val)=>{
      service.api.logToConsole(val);
    });
    */

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
            <IconPicker value={this.props.context.value} buttonStyles={{marginTop:"40px", width:"130px"}} buttonIconStyles={{fontSize:'100px', color: '#666'}} containerStyles={{marginLeft:'230px', height:'300px', width:"500px"}}  size={48} onChange={(v) => this.props.context.setValue(v)} />
            <TextField
              value={this.props.context.value||''}
              disabled={true}
              fullWidth={true}
            />
          </FormControl>
        }
        iconButtons={iconButtons}
      />);
  }
}

export default FontIconPickerDynamic;
