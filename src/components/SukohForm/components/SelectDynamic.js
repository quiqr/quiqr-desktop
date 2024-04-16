import React           from 'react';
import InputLabel      from '@material-ui/core/InputLabel';
import MenuItem        from '@material-ui/core/MenuItem';
import FormControl     from '@material-ui/core/FormControl';
import Select          from '@material-ui/core/Select';
import Box             from '@material-ui/core/Box';
import FormItemWrapper from './shared/FormItemWrapper';
import { BaseDynamic } from '../../HoForm';
import Tip             from '../../Tip';
import service                  from '../../../services/service';

class SelectDynamic extends BaseDynamic {

  constructor(props){

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
    return 'select';
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

  setOptionImages(options){
    let {node} = this.props.context;
    let {field } = node;

    if(typeof field.option_image_path === "string"){

      service.api.getCurrentSiteKey().then((currentSiteKey)=>{

          options.forEach((option)=>{
            service.api.getThumbnailForPath(currentSiteKey, 'source', field.option_image_path +"/"+ this.getOptionValue(option)+"."+field.option_image_extension).then((img)=>{
              this.setState({ ["optimg_"+this.getOptionValue(option)]: img });
            })
          });
      })

    }
  }


  getOptionValue(option){
    if(typeof option === "string"){
      return option;
    }
    else{
      return option.value;
    }
  }

  getOptionLabel(option){
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
