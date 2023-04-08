import React                    from 'react';
import type {FormStateBuilder } from '../../HoForm';
import { BaseDynamic }          from '../../HoForm';
import Typography               from '@material-ui/core/Typography';
import FormItemWrapper          from './shared/FormItemWrapper';
import MenuItem                 from 'material-ui-02/MenuItem';
import SelectField              from 'material-ui-02/SelectField';
import Tip                      from '../../Tip';
import service                  from '../../../services/service';

type SelectFromQueryDynamicField = {
  key: string,
  compositeKey: string,
  type: string,
  default: ?string,
  tip: ?string,
  title: ?string,
  query_glob: string,
  query_string: string,
//  multiple: ?bool
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
    let isArrayType = field.multiple===true;
    //let isArrayType = false;
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
    this.setState({error_msg: "File Content Quert not yet implemented."});
    return []
  }

  runQuery(){
    let {node} = this.props.context;
    let {field } = node;

    //service.api.logToConsole(field.query_glob);
    //service.api.logToConsole(field.query_string);

    service.api.globSync(field.query_glob,{}).then((files)=>{

      let options = [];
      if(field.query_string.startsWith("#")){
        options = this.parseFileMetaDataQuery(field.query_string,files);
      }
      else if(field.query_string.startsWith("#")){
        options = this.parseFileMetaDataQuery(field.query_string,files);
      }
      else{
        this.setState({error_msg: "Query did not start with '.' or '#'"});
      }

      this.setState({options: options});
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

  handleChange = (e: any, index: number, payload: Array<string>)=>{
    let {context} = this.props;
    let field = context.node.field;

    let val;

    if(field.multiple===true){
      context.setValue(payload)
    }
    else{

      if(typeof this.state.options[index] === "string"){
        val = this.state.options[index]
      }
      else{
        val = this.state.options[index].value
      }


      if(val !== context.value){
        context.setValue(val)
      }
    }

    if(field.autoSave === true){
      context.saveFormHandler();
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
    if(field.tip) iconButtons.push(<Tip markdown={field.tip} />);

    return (
      <React.Fragment>
        {(this.state.error_msg ?
          <Typography variant="body2" >
            {this.state.error_msg}
          </Typography>
        :
        <FormItemWrapper
          control={
            <SelectField
              underlineShow={true}
              floatingLabelText={field.title}
              floatingLabelFixed={true}
              value={context.value}
              multiple={field.multiple===true}
              onChange={this.handleChange}
              fullWidth={true}
            >
              {this.state.options.map((option, i)=>{
                let val, text;
                if(typeof option === "string"){
                  val = option
                  text = option
                }
                else{
                  val = option.value
                  text = option.text
                }
                return (
                  <MenuItem key={i} value={val} primaryText={text} />
                )
              })}
            </SelectField>
          }
          iconButtons={iconButtons} />
        )}
      </React.Fragment>
    );
  }
}

export default SelectFromQueryDynamic;
