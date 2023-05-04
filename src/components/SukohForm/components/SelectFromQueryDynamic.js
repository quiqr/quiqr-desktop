import React                    from 'react';
import type {FormStateBuilder } from '../../HoForm';
import { BaseDynamic }          from '../../HoForm';
import Typography               from '@material-ui/core/Typography';
import FormItemWrapper          from './shared/FormItemWrapper';
import Tip                      from '../../Tip';
import service                  from '../../../services/service';

import TextField from '@material-ui/core/TextField';
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
        });
      });
    }
    else{
      this.setState({error_msg: "Other queries then '.key[]' are currently not supported."});
      return;
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

  componentDidMount(){
    this.runQuery();
  }

  renderAutoComplete(field, context){

    const options = this.state.options;

    return (
        <Autocomplete
          id="auto-complete"
          options={options}

          onChange={ (event, newValue) => {
            context.setValue(newValue)
          }}

          value={context.value}
          getOptionLabel={(option) => {
            if(typeof option === "string"){
              return option;
            }
            else{
              return option.text;
            }
          }}
          renderInput={(params) => <TextField {...params} label={field.title} variant="outlined" />}
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
