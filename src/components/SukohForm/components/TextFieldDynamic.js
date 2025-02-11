import * as React      from 'react';
import TextField       from '@material-ui/core/TextField';
import FormItemWrapper from './shared/FormItemWrapper';
import Tip             from '../../Tip';
import AiAssist        from '../../AiAssist';
import { BaseDynamic } from '../../HoForm';

class TextFieldDynamic extends BaseDynamic {

  normalizeState({state, field}){
    let key = field.key;
    if(state[key]===undefined){
      state[key] = field.default || '';
    }
  }

  getType(){
    return 'string';
  }

  handleChange(e){
    this.forceUpdate();
    this.props.context.setValue(e.target.value, 250);
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

    if(field.txtInsertButtons){
      let iBtns = field.txtInsertButtons.map((b)=>{
        return(
          <button  onClick={()=>{
            this.props.context.setValue(b, 250);
          }} >{b}</button>
        )
      });
      iconButtons.push(
        <React.Fragment>
          {iBtns}
        </React.Fragment>
      );
    }

    if(context.enableAiAssist) iconButtons.push(<AiAssist handleSetAiText={(text)=>{ context.setValue(text)}} inField={field} inValue={context.value} pageUrl={context.pageUrl} />);

    return (

      <React.Fragment>

        <FormItemWrapper
          control={
            <TextField
              id={`text-field-${field.key}`}
              onChange={ (e)=>this.handleChange(e) }
              value={context.value}
              multiline={field.multiLine===true}
              fullWidth={true}
              label={field.title} />
          }
          iconButtons={iconButtons}
        />
      </React.Fragment>
    );
  }
}

export default TextFieldDynamic;
