import * as React from 'react';
import DefaultWrapper from './shared/DefaultWrapper';
import FormItemWrapper from './shared/FormItemWrapper';
import Tip from '../../Tip';
import { ColorPicker } from 'material-ui-color';
import { BaseDynamic } from '../../HoForm';
//import service                              from './../../../services/service'

/*
type ColorToolDynamicField = {
  key: string,
  compositeKey: string,
  type: string,
  default: ?string,
  tip: ?string,
  title: ?string
}
*/

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

  /*
  normalizeState({state, field}: {state: any, field: ColorToolDynamicField}){
    let key = field.key;
    if(state[key]===undefined){
      state[key] = field.default || '';
    }
  }
  */

  getType(){
    return 'color';
  }

  handleChange = (e: Event, value: any)=>{
    //service.api.logToConsole(value)
    //service.api.logToConsole(e.css.backgroundColor)
    if(e && e.css && e.css.backgroundColor){
      this.props.context.setValue(e.css.backgroundColor, 250);
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
              color: 'rgba(0, 0, 0, 0.3)' }}>{field.title}</label>

            <ColorPicker
            value={context.value}
            deferred
            palette={palette}
            onChange={ this.handleChange }

          />
            </DefaultWrapper>
          </React.Fragment>
      }

          iconButtons={iconButtons}
        />);
  }
}

export default ColorToolDynamic;
