import React            from 'react';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import IconButton       from '@material-ui/core/IconButton';
import FormItemWrapper  from './shared/FormItemWrapper';
import InputLabel       from '@material-ui/core/InputLabel';
import FormControl      from '@material-ui/core/FormControl';
import DatePicker       from "react-datepicker";
import                       "react-datepicker/dist/react-datepicker.css";
import Tip              from '../../Tip';
import { BaseDynamic }  from '../../HoForm';


class DateDynamic extends BaseDynamic {

  state = {
    startDate: new Date(),
  };

  normalizeState({state, field}){
    let key = field.key;
    if(state[key]===undefined){
      state[key] = field.default || undefined;
    }

    if(state[key]==='now')
    {
      let date = new Date();
      state[key] = date.toISOString().split('T')[0];
    }
  }

  getType(){
    return 'date';
  }

  getDateValue(){
    let val = this.props.context.value;
    if(val==='now'){
      return new Date();
    }
    else if(val){
      let values = val.split('-');
      let year = parseInt(values[0],10);
      let month = parseInt(values[1],10)-1;
      let day = parseInt(values[2],10);
      return new Date(year, month, day, 12);
    }
    return undefined;
  }

  setDateValue(value){

    function toStringWithZeros(value, length){
      let str = value.toString();
      while(str.length<length)
        str = '0'+str;
      return str;
    }

    let year = toStringWithZeros(value.getFullYear(),4);
    let month = toStringWithZeros(value.getMonth()+1,2);
    let day = toStringWithZeros(value.getDate(),2);
    let dateStr = `${year}-${month}-${day}`;
    this.props.context.setValue(dateStr);
  }

  getDate(){
    return this.state.startDate;
  }

  renderComponent(){

    let {context} = this.props;
    let {node, currentPath} = context;
    let {field} = node;

    let dateFormat = "dd/MM/yyyy";
    if(field.dateFormat){
      dateFormat = field.dateFormat;
    }

    if(currentPath!==context.parentPath){
      return (null);
    }

    let iconButtons = [];

    if(this.getDateValue()){
      iconButtons.push(<IconButton aria-label="clear" onClick={()=>context.clearValue()}> <HighlightOffIcon /> </IconButton>);
    }
    if(field.tip) iconButtons.push(<Tip markdown={field.tip} />)

    return (
      <FormItemWrapper
        control={
          <FormControl >
            <InputLabel id="demo-controlled-open-select-label" style={{
              marginTop:"-40px",
              fontSize: "12px"

            }}>{field.title}</InputLabel>
            <DatePicker
              className="datepicker"
              dateFormat={dateFormat}
              selected={this.getDateValue()} onChange={(e)=>this.setDateValue(e)} />
          </FormControl >
        }
        iconButtons={iconButtons}
      />
    );
  }
}

export default DateDynamic;
