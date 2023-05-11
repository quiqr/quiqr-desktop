import React                     from 'react';
import FormItemWrapper           from './shared/FormItemWrapper';
import TextField                 from '@material-ui/core/TextField';
import Tip                       from '../../Tip';
import { BaseDynamic }           from '../../HoForm';

class TextFieldNumberDynamic extends BaseDynamic {

  normalizeState({state, field}){
    let key = field.key;
    if(state[key]===undefined){
      state[key] = field.default||0;
    }
  }

  getType(){
    return 'number';
  }

  renderComponent(){

    let {context} = this.props;
    let {node, currentPath} = context;
    let {field} = node;

    if(currentPath!==context.parentPath){
      return (null);
    }

    let getNumberValue = function(e){
      return (context.value||'').toString();
    };

    let iconButtons = [];
    if(field.tip) iconButtons.push(<Tip markdown={field.tip} />);

    return (
      <FormItemWrapper
        control={<TextField
          id={`text-field-${field.key}`}
          onChange={ (e)=>{
            if(e.target.value===undefined||e.target.value.length===0){
              context.clearValue();
              return;
            }
            this.forceUpdate();
            context.setValue(parseFloat(e.target.value),250);

          }}
          value={getNumberValue()}
          type="number"
          fullWidth={true}
          label={field.title} />
        }
        iconButtons={iconButtons}
      />
    );
  }
}

export default TextFieldNumberDynamic;
