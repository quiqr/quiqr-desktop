import React from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import DatePicker from 'material-ui-02/DatePicker';
import Tip from '../../Tip';
import { BaseDynamic } from '../../HoForm';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import IconButton from '@material-ui/core/IconButton';

class DateDynamic extends BaseDynamic {

  normalizeState({state, field}){
    let key = field.key;
    if(state[key]===undefined){
      state[key] = field.default || undefined;
    }

    if(state[key]==='now')
    {
      let date = new Date();
      state[key] = '' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' +  date.getDate();
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

  setDateValue(value: Date){

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

  renderComponent(){

    let {context} = this.props;
    let {node, currentPath} = context;
    let {field} = node;

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
      control={<DatePicker
      value={this.getDateValue()}
      onChange={function(e,value){ this.setDateValue(value) }.bind(this)}
      floatingLabelFixed={true}
      autoOk={true}
      fullWidth={true}
      underlineShow={true}
      floatingLabelText={field.title} />
      }
      iconButtons={iconButtons}
    />
    );
  }
}

export default DateDynamic;
