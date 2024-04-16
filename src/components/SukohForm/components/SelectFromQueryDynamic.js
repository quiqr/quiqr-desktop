import React                    from 'react';
import type {FormStateBuilder } from '../../HoForm';
import { BaseDynamic }          from '../../HoForm';
import Typography               from '@material-ui/core/Typography';
import FormItemWrapper          from './shared/FormItemWrapper';
import Tip                      from '../../Tip';
import service                  from '../../../services/service';

import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Autocomplete from '@material-ui/lab/Autocomplete';

type SelectFromQueryDynamicField = {
  key: string,
  compositeKey: string,
  type: string,
  default: ?string,
  tip: ?string,
  title: ?string,
  query_glob: string,
  query_string: string,
}

type SelectFromQueryDynamicState = {

}
class SelectFromQueryDynamic extends BaseDynamic<SelectFromQueryDynamicField,SelectFromQueryDynamicState> {
  constructor(props){

    super(props);

    this.state = {
      options: [],
      error_msg: null,
    }

  }

  normalizeState({state, field} : { state: any, field: SelectFromQueryDynamicField, stateBuilder: FormStateBuilder }){
    //TODO: clear if value is not a valid option
    let key = field.key;
    let isArrayType = field.multiple === true;
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
    return 'select-from-query';
  }

  parseFileMetaDataQuery(query_string, files){
    let options = [];
    files.forEach((filepath)=>{
      if(query_string === '#parent_dir[]'){
        let result = filepath.split("/").reverse()[1];
        options.push(result);
      }
      else if(query_string === '#file_name[]'){
        let result = filepath.split("/").reverse()[0];
        options.push(result);
      }
      else if(query_string === '#file_base_name[]'){
        let result = filepath.split("/").reverse()[0].replace(/\.[^/.]+$/, "");
        options.push(result);
      }
      else{
        this.setState({error_msg: "File meta data query could not be parsed. Syntax Error?"});
      }
    });

    this.setOptionImages(options);
    return options;
  }

  parseFileContentDataQuery(query_string, files){

    if(files.length > 1){
      this.setState({error_msg: "Object queries are currently only possible in max. 1 one file."});
      return;
    }

    if((query_string.match(/\./g) || []).length === 1 && query_string.slice(-2)==="[]" ){
      files.forEach((filepath)=>{
        service.api.parseFileToObject(filepath).then((parsedFileObject)=>{
          let options = parsedFileObject[query_string.slice(1,-2)];
          this.setState({options: options});
          this.setOptionImages(options);
        });
      });
    }
    else{
      this.setState({error_msg: "Other queries then '.key[]' are currently not supported."});
      return;
    }
  }

  setOptionImages(options){
    let {node} = this.props.context;
    let {field } = node;

    if(typeof field.option_image_path === "string"){

      service.api.getCurrentSiteKey().then((currentSiteKey)=>{

          options.forEach((option)=>{
            //service.api.logToConsole(field.option_image_path +"/"+ this.getOptionValue(option)+"."+field.option_image_extension);
            service.api.getThumbnailForPath(currentSiteKey, 'source', field.option_image_path +"/"+ this.getOptionValue(option)+"."+field.option_image_extension).then((img)=>{
              this.setState({ ["optimg_"+this.getOptionValue(option)]: img });
            })
          });
      })

    }
  }

  runQuery(){
    let {node} = this.props.context;
    let {field } = node;

    service.api.globSync(field.query_glob,{}).then((files)=>{

      let options = [];
      if(field.query_string.startsWith("#")){
        options = this.parseFileMetaDataQuery(field.query_string,files);
        this.setState({options: options});
      }
      else if(field.query_string.startsWith(".")){
        this.parseFileContentDataQuery(field.query_string,files);
      }
      else{
        this.setState({error_msg: "Query did not start with '.' or '#'"});
      }

    }).catch(()=>{
      this.setState({
        options: [],
        error_msg: "Query failed while searching for file(s)"
      });
      service.api.logToConsole("Query failed while searching for file(s)");
    })
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

  componentDidMount(){
    this.runQuery();
  }

  renderAutoComplete(field, context){

    const options = this.state.options;

    let showImage = false;
    let option_image_width;

    if(typeof field.option_image_path === "string"){
      showImage = true;
      option_image_width = (typeof field.option_image_width !== "undefined" ? field.option_image_width : 20 )
    }

    return (
        <Autocomplete
          id="auto-complete"
          options={options}

          onChange={ (_, newValue) => {
            context.setValue(newValue)
          }}

          renderOption={(option) => {
            if(showImage){
              return (
                <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} >
                  <img
                    alt=""
                    loading="lazy"
                    width={ option_image_width }
                    src={ this.state["optimg_" + this.getOptionValue(option)] }
                  />&nbsp;
                  { this.getOptionLabel(option) }
                </Box>
              )}
            else{
              return this.getOptionLabel(option)
            }
          }}

          value={context.value}
          getOptionLabel={(option) => {
            return this.getOptionLabel(option);
          }}
          renderInput={(params) => {

            if(showImage){
             return (

                <Box component="div" sx={{ '& > img': { pb: 4, flexShrink: 0 } }} >
                  <TextField {...params} label={field.title} variant="outlined" />
                  <div>&nbsp;</div>
                  <img
                    loading="lazy"
                    width={ option_image_width }
                    src={ this.state["optimg_" + context.value] }
                    alt=""
                  />

               </Box>
             )
            }
            else{
             return (<TextField {...params} label={field.title} variant="outlined" />)
            }

          }}
        />
    )
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
      <React.Fragment>
        {(this.state.error_msg ?
          <Typography variant="body2" >
            {this.state.error_msg}
          </Typography>
        :
        <FormItemWrapper
          style={{paddingTop: "20px"}}
          control={
            this.renderAutoComplete(field,context)
          }
          iconButtons={iconButtons} />
        )}
      </React.Fragment>
    );
  }
}

export default SelectFromQueryDynamic;
