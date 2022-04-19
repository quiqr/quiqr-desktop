import * as React from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import DefaultWrapper from './shared/DefaultWrapper';
import Slider from '@material-ui/core/Slider';
import Tip from '../../Tip';
import Typography from '@material-ui/core/Typography';
import { BaseDynamic } from '../../HoForm';
//import service                              from './../../../services/service'

type SliderDynamicField = {
  key: string,
  compositeKey: string,
  type: string,
  default: ?string,
  multiLine: ?bool,
  tip: ?string,
  title: ?string
}

type SliderDynamicState = {

}

class SliderDynamic extends BaseDynamic<SliderDynamicField,SliderDynamicState> {

  /*
  normalizeState({state, field}: {state: any, field: SliderDynamicField}){
    let key = field.key;
    if(state[key]===undefined){
      state[key] = field.default || '';
    }
  }
  */

  getType(){
    return 'slider';
  }

  handleChange = (e: Event, value: any)=>{
    let {context} = this.props;

    context.setValue(value, 250);

    this.forceUpdate();
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

    return (
      <FormItemWrapper
        control={

          <React.Fragment>
            <DefaultWrapper>
              <Typography id="discrete-slider" gutterBottom>
                {field.title}
              </Typography>

              <Slider
                defaultValue={field.default}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                value={context.value}
                onChange={ this.handleChange }
                onChangeCommitted={ ()=>{
                  if(field.autoSave === true){
                    context.saveFormHandler();
                  }
                }}
                step={field.step}
                marks
                min={field.min}
                max={field.max}
              />
            </DefaultWrapper>

          </React.Fragment>

        }
        iconButtons={iconButtons}
      />);
  }
}

export default SliderDynamic;
