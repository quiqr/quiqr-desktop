import React           from 'react';
import InputLabel      from '@mui/material/InputLabel';
import MenuItem        from '@mui/material/MenuItem';
import FormControl     from '@mui/material/FormControl';
import Select, { SelectChangeEvent }          from '@mui/material/Select';
import Box             from '@mui/material/Box';
import FormItemWrapper from './shared/FormItemWrapper';
import { BaseDynamic, BaseDynamicProps, BaseDynamicState, FieldBase } from '../../HoForm';
import Tip             from '../../Tip';
import service                  from '../../../services/service';


type SelectOption = string | { value: string; text: string };

export interface SelectDynamicField extends FieldBase {
  title?: string;
  options: SelectOption[];
  tip?: string;
  default?: string | number | string[] | number[];
  multiple?: boolean;
  autoSave?: boolean;
  option_image_path?: string;
  option_image_width?: number;
  option_image_extension?: string;
}

type SelectDynamicProps = BaseDynamicProps<SelectDynamicField>;

type SelectDynamicState = BaseDynamicState & {
  options: string[];
  error_msg: string | null;
  [key: `optimg_${string}`]: string | undefined;
};

class SelectDynamic extends BaseDynamic<SelectDynamicProps, SelectDynamicState> {

  constructor(props: SelectDynamicProps){

    super(props);
    this.state = {
      options: [],
      error_msg: null,
    }

  }

  componentDidMount(){
    let {context} = this.props;
    let field = context.node.field;
    this.setOptionImages(field.options);
  }

  normalizeState({state, field}: {state: any; field: SelectDynamicField}){
    //TODO: clear if value is not a valid option
    let key = field.key;
    let isArrayType = field.multiple===true;
    if(state[key]===undefined){
      state[key] = field.default || (isArrayType?[]:'')
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
    return 'select';
  }

  handleChange(e: SelectChangeEvent<string | string[]>){
    let {context} = this.props;
    let field = context.node.field;

    if(e.target.value !== context.value){
      context.setValue(e.target.value)
    }

    if(field.autoSave === true){
      context.saveFormHandler();
    }
  }

  setOptionImages(options: SelectOption[]){
    let {node} = this.props.context;
    let {field } = node;

    if(typeof field.option_image_path === "string"){

      service.api.getCurrentSiteKey().then((currentSiteKey)=>{

          options.forEach((option)=>{
            service.api.getThumbnailForPath(currentSiteKey, 'source', field.option_image_path! +"/"+ this.getOptionValue(option)+"."+field.option_image_extension!).then((img)=>{
              this.setState({ [`optimg_${this.getOptionValue(option)}`]: img } as any);
            })
          });
      })

    }
  }


  getOptionValue(option: SelectOption): string{
    if(typeof option === "string"){
      return option;
    }
    else{
      return option.value;
    }
  }

  getOptionLabel(option: SelectOption): string{
    if(typeof option === "string"){
      return option;
    }
    else{
      return option.text;
    }
  }

  renderComponent(){

    let {context} = this.props;
    let {node, currentPath, parentPath} = context;
    let {field} = node;

    let showImage = false;
    let option_image_width;

    if(typeof field.option_image_path === "string"){
      showImage = true;
      option_image_width = (typeof field.option_image_width !== "undefined" ? field.option_image_width : 20 )
    }


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
            <Select
              labelId="demo-controlled-open-select-label"
              id="demo-controlled-open-select"
              multiple={field.multiple===true}
              value={context.value}
              onChange={(e)=>this.handleChange(e)}
            >
              {field.options.map((option, i)=>{
                /*
                let val, text;
                if(typeof option === "string"){
                  val = option
                  text = option
                }
                else{
                  val = option.value
                  text = option.text
                }
                */
                return (
                  <MenuItem key={i} value={this.getOptionValue(option)}>
                    {(showImage ?
                    <Box component="div" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} >
                      <img
                        alt=""
                        loading="lazy"
                        width={ option_image_width }
                        src={ this.state["optimg_" + this.getOptionValue(option)] }
                      />&nbsp;{this.getOptionLabel(option)}
                    </Box>
                      : this.getOptionLabel(option))}
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>
        }
        iconButtons={iconButtons}
      />);
  }
}

export default SelectDynamic;
