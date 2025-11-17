import * as React from 'react';
import DefaultWrapper from './shared/DefaultWrapper';
import FormItemWrapper from './shared/FormItemWrapper';
import Tip from '../../Tip';
import TextField from '@mui/material/TextField';
import { BaseDynamic } from '../../HoForm';
//import service                              from './../../../services/service'


const palette = {
  red: '#ff0000',
  blue: '#0000ff',
  green: '#00ff00',
  yellow: 'yellow',
  cyan: 'cyan',
  lime: 'lime',
  gray: 'gray',
  orange: 'orange',
  purple: 'purple',
  black: 'black',
  white: 'white',
  pink: 'pink',
  darkblue: 'darkblue',
};
class ColorToolDynamic extends BaseDynamic {

  getType(){
    return 'color';
  }

  handleChange = (e)=>{
    let {context} = this.props;
    let {node} = context;
    let {field} = node;

    if(e && e.target && e.target.value){
      context.setValue(e.target.value, 250);

      if(field.autoSave === true){
        context.saveFormHandler();
      }

      this.forceUpdate();
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

    if(field.tip){
      iconButtons.push(<Tip markdown={field.tip} />);
    }

    return (
      <FormItemWrapper
      control={
        <React.Fragment>
          <DefaultWrapper>
            <label style={{

              alignSelf: 'stretch',
              display:'block',
              lineHeight: '22px',
              fontSize:12,
              pointerEvents: 'none',
              userSelect: 'none',
               }}>{field.title}</label>

            <TextField
              type="color" 
              value={context.value || '#ffffff'}
              onChange={this.handleChange}
              variant="outlined"
              size="small"
              InputProps={{
                style: { width: '100px' }
              }}
            />
            </DefaultWrapper>
          </React.Fragment>
      }

          iconButtons={iconButtons}
        />);
  }
}

export default ColorToolDynamic;
