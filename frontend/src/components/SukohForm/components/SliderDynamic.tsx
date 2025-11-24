import * as React from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import DefaultWrapper from './shared/DefaultWrapper';
import Slider from '@mui/material/Slider';
import Tip from '../../Tip';
import Typography from '@mui/material/Typography';
import { BaseDynamic, BaseDynamicProps, BaseDynamicState, FieldBase } from '../../HoForm';
//import service                              from './../../../services/service'

export interface SliderDynamicField extends FieldBase {
  title?: string;
  tip?: string;
  default?: number;
  autoSave?: boolean;
  step?: number;
  min?: number;
  max?: number;
}

type SliderDynamicProps = BaseDynamicProps<SliderDynamicField>;

type SliderDynamicState = BaseDynamicState;

class SliderDynamic extends BaseDynamic<SliderDynamicProps, SliderDynamicState> {

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

  handleChange = (e, value)=>{
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
